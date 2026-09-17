import { config } from './config.js';
import { logger } from './logger.js';

const queue = new Map();
const inMatch = new Map();

export function createMatchmaking({ db, models, io }) {
  const { Players, Matches, Blocs, Events } = models;
  let tickInterval = null;

  function eloDelta(rA, rB, scoreA, k = config.ratingK) {
    const eA = 1 / (1 + Math.pow(10, (rB - rA) / 400));
    return Math.round(k * (scoreA - eA));
  }

  function power(p) {
    const blocPower = p.bloc_id ? (Blocs.byId(p.bloc_id)?.power || 0) : 0;
    return Math.max(1, (p.gdp / 1e6) + (p.rating / 10) + (p.level * 5) + (blocPower * 0.5));
  }

  function enqueue(playerId, socketId) {
    const p = Players.byId(playerId);
    if (!p) throw new Error('player_not_found');
    if (p.shield_until > Date.now()) throw new Error('shield_active');
    if (p.pvp_blocked_until > Date.now()) throw new Error('pvp_blocked');
    if (inMatch.has(playerId)) throw new Error('already_in_match');
    if (queue.has(playerId)) return { queued: true, size: queue.size };

    queue.set(playerId, { playerId, rating: p.rating, joinedAt: Date.now(), socketId });
    tryMatch();
    return { queued: true, size: queue.size };
  }

  function dequeue(playerId) {
    queue.delete(playerId);
    return { ok: true };
  }

  function tryMatch() {
    if (queue.size < 2) return;
    const arr = [...queue.values()].sort((a, b) => a.joinedAt - b.joinedAt);

    for (let i = 0; i < arr.length; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        const a = arr[i], b = arr[j];
        const waitA = Date.now() - a.joinedAt;
        const waitB = Date.now() - b.joinedAt;
        const wait = Math.max(waitA, waitB);
        const extraWindow = Math.floor(wait / config.matchWaitStepMs) * 50;
        const window = Math.min(config.matchRatingWindow + extraWindow, config.matchRatingWindowMax);

        if (Math.abs(a.rating - b.rating) <= window) {
          queue.delete(a.playerId);
          queue.delete(b.playerId);
          startMatch(a.playerId, b.playerId);
          return tryMatch();
        }
      }
    }
  }

  function startMatch(attackerId, defenderId) {
    const match = Matches.create(attackerId, defenderId);
    inMatch.set(attackerId, match.id);
    inMatch.set(defenderId, match.id);

    const attacker = Players.byId(attackerId);
    const defender = Players.byId(defenderId);

    io.to(`p:${attackerId}`).emit('match:start', {
      matchId: match.id,
      role: 'attacker',
      opponent: { username: defender.username, nation: defender.nation_name, emoji: defender.nation_emoji }
    });

    io.to(`p:${defenderId}`).emit('match:start', {
      matchId: match.id,
      role: 'defender',
      opponent: { username: attacker.username, nation: attacker.nation_name, emoji: attacker.nation_emoji }
    });

    logger.game(`Match #${match.id}: ${attacker.username} vs ${defender.username}`);
    setTimeout(() => resolveMatch(match.id), config.matchResolveDelayMs);
  }

  function resolveMatch(matchId) {
    const m = Matches.byId(matchId);
    if (!m || m.status !== 'active') return;

    const attacker = Players.byId(m.attacker_id);
    const defender = Players.byId(m.defender_id);
    if (!attacker || !defender) return;

    const aP = power(attacker) * (0.9 + Math.random() * 0.2);
    const dP = power(defender) * (0.9 + Math.random() * 0.2) * 1.1;

    const attackerWins = aP > dP;
    const winner = attackerWins ? attacker : defender;
    const loser = attackerWins ? defender : attacker;

    const ratio = Math.min(1, (attackerWins ? aP / dP : dP / aP) / 2);
    const stolen = Math.max(0, loser.gdp * config.maxRaidStealPercent * ratio);

    db.raw.prepare('UPDATE players SET gdp = MAX(0, gdp - ?) WHERE id = ?').run(stolen, loser.id);
    db.raw.prepare('UPDATE players SET gdp = gdp + ?, total_earned = total_earned + ? WHERE id = ?')
      .run(stolen, stolen, winner.id);

    const deltaWinner = eloDelta(winner.rating, loser.rating, 1);
    const deltaLoser = eloDelta(loser.rating, winner.rating, 0);

    Players.applyRating(winner.id, deltaWinner, true);
    Players.applyRating(loser.id, deltaLoser, false);

    Players.setShield(loser.id, Date.now() + config.shieldAfterRaidMs);

    Matches.resolve(m.id, {
      winnerId: winner.id,
      attackerPower: aP,
      defenderPower: dP,
      stolenGdp: stolen,
      ratingDelta: attackerWins ? deltaWinner : deltaLoser
    });

    if (attacker.bloc_id) Blocs.recomputePower(attacker.bloc_id);
    if (defender.bloc_id) Blocs.recomputePower(defender.bloc_id);

    Events.log('match_resolved', {
      playerId: winner.id,
      payload: {
        matchId: m.id,
        attacker: attacker.username,
        defender: defender.username,
        winner: winner.username,
        stolen
      }
    });

    const result = {
      matchId: m.id,
      attacker: { id: attacker.id, username: attacker.username, nation: attacker.nation_name, emoji: attacker.nation_emoji, power: aP },
      defender: { id: defender.id, username: defender.username, nation: defender.nation_name, emoji: defender.nation_emoji, power: dP },
      winnerId: winner.id,
      stolen,
      ratingDelta: { winner: deltaWinner, loser: deltaLoser }
    };

    io.to(`p:${attacker.id}`).emit('match:resolved', result);
    io.to(`p:${defender.id}`).emit('match:resolved', result);

    inMatch.delete(attacker.id);
    inMatch.delete(defender.id);

    logger.game(`Match #${m.id} resolvido. Winner=${winner.username} Steal=${stolen.toFixed(2)}`);
  }

  function status(playerId) {
    const q = queue.get(playerId);
    return {
      queued: !!q,
      waitMs: q ? Date.now() - q.joinedAt : 0,
      inMatch: inMatch.get(playerId) || null,
      queueSize: queue.size
    };
  }

  function startLoop() {
    if (tickInterval) return;
    tickInterval = setInterval(tryMatch, config.matchmakingTickMs);
    logger.ok('Matchmaking loop iniciado');
  }

  function stopLoop() {
    if (tickInterval) {
      clearInterval(tickInterval);
      tickInterval = null;
    }
  }

  return { enqueue, dequeue, status, startLoop, stopLoop, eloDelta };
}
