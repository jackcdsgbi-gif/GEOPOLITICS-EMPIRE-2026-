import { config } from './config.js';
import { logger } from './logger.js';

const queue = new Map();
const inMatch = new Map();

export function createMatchmaking({ db, models, io }) {
  const { Players, Matches, Blocs, Events } = models;
  let tickInterval = null;

  function eloDelta(rA, rB, scoreA, k = config.ratingK) {
    const eA = 1 / (1 + Math.pow(10, (Number(rB) - Number(rA)) / 400));
    return Math.round(k * (scoreA - eA));
  }

  async function power(p) {
    let blocPower = 0;
    if (p.bloc_id) {
      const b = await Blocs.byId(p.bloc_id);
      blocPower = Number(b?.power || 0);
    }
    return Math.max(1, (Number(p.gdp) / 1e6) + (Number(p.rating) / 10) + (Number(p.level) * 5) + (blocPower * 0.5));
  }

  async function enqueue(playerId, socketId) {
    const p = await Players.byId(playerId);
    if (!p) throw new Error('player_not_found');
    if (Number(p.shield_until) > Date.now()) throw new Error('shield_active');
    if (Number(p.pvp_blocked_until) > Date.now()) throw new Error('pvp_blocked');
    if (inMatch.has(playerId)) throw new Error('already_in_match');
    if (queue.has(playerId)) return { queued: true, size: queue.size };

    queue.set(playerId, { playerId, rating: Number(p.rating), joinedAt: Date.now(), socketId });
    await tryMatch();
    return { queued: true, size: queue.size };
  }

  function dequeue(playerId) {
    queue.delete(playerId);
    return { ok: true };
  }

  async function tryMatch() {
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
          await startMatch(a.playerId, b.playerId);
          return tryMatch();
        }
      }
    }
  }

  async function startMatch(attackerId, defenderId) {
    const match = await Matches.create(attackerId, defenderId);
    inMatch.set(attackerId, match.id);
    inMatch.set(defenderId, match.id);

    const attacker = await Players.byId(attackerId);
    const defender = await Players.byId(defenderId);

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

  async function resolveMatch(matchId) {
    const m = await Matches.byId(matchId);
    if (!m || m.status !== 'active') return;

    const attacker = await Players.byId(m.attacker_id);
    const defender = await Players.byId(m.defender_id);
    if (!attacker || !defender) return;

    const baseAP = await power(attacker);
    const baseDP = await power(defender);
    const aP = baseAP * (0.9 + Math.random() * 0.2);
    const dP = baseDP * (0.9 + Math.random() * 0.2) * 1.1;

    const attackerWins = aP > dP;
    const winner = attackerWins ? attacker : defender;
    const loser = attackerWins ? defender : attacker;

    const ratio = Math.min(1, (attackerWins ? aP / dP : dP / aP) / 2);
    const stolen = Math.max(0, Number(loser.gdp) * config.maxRaidStealPercent * ratio);

    await db.raw.query('UPDATE players SET gdp = GREATEST(0, gdp - $1) WHERE id = $2', [stolen, loser.id]);
    await db.raw.query('UPDATE players SET gdp = gdp + $1, total_earned = total_earned + $2 WHERE id = $3', [stolen, stolen, winner.id]);

    const deltaWinner = eloDelta(winner.rating, loser.rating, 1);
    const deltaLoser = eloDelta(loser.rating, winner.rating, 0);

    await Players.applyRating(winner.id, deltaWinner, true);
    await Players.applyRating(loser.id, deltaLoser, false);

    await Players.setShield(loser.id, Date.now() + config.shieldAfterRaidMs);

    await Matches.resolve(m.id, {
      winnerId: winner.id,
      attackerPower: aP,
      defenderPower: dP,
      stolenGdp: stolen,
      ratingDelta: attackerWins ? deltaWinner : deltaLoser
    });

    if (attacker.bloc_id) await Blocs.recomputePower(attacker.bloc_id);
    if (defender.bloc_id) await Blocs.recomputePower(defender.bloc_id);

    await Events.log('match_resolved', {
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
    tickInterval = setInterval(() => {
      tryMatch().catch(err => logger.error('matchmaking loop error', err));
    }, config.matchmakingTickMs);
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
