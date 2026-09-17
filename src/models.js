import { config } from './config.js';
import { hashPassword, verifyPassword } from './auth.js';

export function createModels(db) {
  const raw = db.raw;

  const Players = {
    create({ username, password, nationName, nationEmoji = '🌐', doctrine = 'neutral' }) {
      if (!username || username.length < 3 || username.length > 20) throw new Error('username_invalid');
      if (!password || password.length < 6) throw new Error('password_short');
      if (raw.prepare('SELECT id FROM players WHERE username = ?').get(username)) throw new Error('username_taken');
      const hash = hashPassword(password);
      const now = Date.now();
      const season = db.season.current();
      const info = raw.prepare(`
        INSERT INTO players (username, password_hash, nation_name, nation_emoji, doctrine, rating, peak_rating, last_seen, created_at, season_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(username, hash, nationName || username, nationEmoji, doctrine, config.ratingStart, config.ratingStart, now, now, season.id);
      return this.byId(info.lastInsertRowid);
    },

    login(username, password) {
      const row = raw.prepare('SELECT * FROM players WHERE username = ?').get(username);
      if (!row) throw new Error('invalid_credentials');
      if (!verifyPassword(password, row.password_hash)) throw new Error('invalid_credentials');
      raw.prepare('UPDATE players SET last_seen = ? WHERE id = ?').run(Date.now(), row.id);
      return this.public(row);
    },

    byId(id) {
      return raw.prepare('SELECT * FROM players WHERE id = ?').get(id);
    },

    byUsername(u) {
      return raw.prepare('SELECT * FROM players WHERE username = ?').get(u);
    },

    public(row) {
      if (!row) return null;
      const { password_hash, state_json, ...safe } = row;
      return safe;
    },

    updateState(id, patch) {
      const allowed = ['level','xp','gdp','peak_gdp','influence','stability','legacy', 'base_multiplier','resets','total_earned','last_sync','state_json'];
      const keys = Object.keys(patch).filter(k => allowed.includes(k) && patch[k] !== undefined);
      if (keys.length === 0) return;
      const set = keys.map(k => `${k} = ?`).join(', ');
      const values = keys.map(k => patch[k]);
      raw.prepare(`UPDATE players SET ${set}, last_seen = ? WHERE id = ?`)
        .run(...values, Date.now(), id);
    },

    setBloc(id, blocId, role = 'member') {
      raw.prepare('UPDATE players SET bloc_id = ?, bloc_role = ? WHERE id = ?').run(blocId, role, id);
    },

    applyRating(id, delta, win) {
      const p = this.byId(id);
      const newRating = Math.max(100, p.rating + delta);
      const peak = Math.max(p.peak_rating, newRating);
      raw.prepare('UPDATE players SET rating = ?, peak_rating = ?, wins = wins + ?, losses = losses + ? WHERE id = ?')
        .run(newRating, peak, win ? 1 : 0, win ? 0 : 1, id);
    },

    setShield(id, untilMs) {
      raw.prepare('UPDATE players SET shield_until = ? WHERE id = ?').run(untilMs, id);
    },

    flag(id) {
      raw.prepare('UPDATE players SET flags = flags + 1 WHERE id = ?').run(id);
      const p = this.byId(id);
      if (p && p.flags >= config.antiCheatFlagLimit) {
        raw.prepare('UPDATE players SET pvp_blocked_until = ? WHERE id = ?')
          .run(Date.now() + config.pvpBlockHours * 3600_000, id);
      }
    },

    topByRating(limit = 100) {
      return raw.prepare(`SELECT id, username, nation_name, nation_emoji, level, gdp, peak_gdp, rating, peak_rating, wins, losses, bloc_id, resets FROM players ORDER BY rating DESC LIMIT ?`).all(limit);
    },

    topByGdp(limit = 100) {
      return raw.prepare(`SELECT id, username, nation_name, nation_emoji, level, gdp, peak_gdp, rating, wins, losses, bloc_id FROM players ORDER BY peak_gdp DESC LIMIT ?`).all(limit);
    },

    online(thresholdMs = 5 * 60 * 1000) {
      return raw.prepare('SELECT COUNT(*) AS c FROM players WHERE last_seen > ?')
        .get(Date.now() - thresholdMs).c;
    }
  };

  const Blocs = {
    byId(id) {
      return raw.prepare('SELECT * FROM blocs WHERE id = ?').get(id);
    },

    all() {
      return raw.prepare(`
        SELECT b.*, (SELECT COUNT(*) FROM players WHERE bloc_id = b.id) AS members
        FROM blocs b
        ORDER BY power DESC, id ASC
      `).all();
    },

    create({ name, emoji, doctrine, color, description, leaderId }) {
      if (!name || name.length < 3 || name.length > 30) throw new Error('bloc_name_invalid');
      if (raw.prepare('SELECT id FROM blocs WHERE name = ?').get(name)) throw new Error('bloc_name_taken');
      const info = raw.prepare(`INSERT INTO blocs (name, emoji, doctrine, color, description, leader_id) VALUES (?,?,?,?,?,?)`)
        .run(name, emoji || '🛡️', doctrine || 'market', color || '#1E3A8A', description || '', leaderId);
      raw.prepare('UPDATE players SET bloc_id = ?, bloc_role = ? WHERE id = ?')
        .run(info.lastInsertRowid, 'leader', leaderId);
      return this.byId(info.lastInsertRowid);
    },

    join(blocId, playerId, role = 'member') {
      const bloc = this.byId(blocId);
      if (!bloc) throw new Error('bloc_not_found');
      const count = raw.prepare('SELECT COUNT(*) AS c FROM players WHERE bloc_id = ?').get(blocId).c;
      if (count >= bloc.member_limit) throw new Error('bloc_full');
      raw.prepare('UPDATE players SET bloc_id = ?, bloc_role = ? WHERE id = ?').run(blocId, role, playerId);
    },

    leave(playerId) {
      raw.prepare('UPDATE players SET bloc_id = NULL, bloc_role = ? WHERE id = ?').run('member', playerId);
    },

    members(blocId) {
      return raw.prepare(`SELECT id, username, nation_name, nation_emoji, level, gdp, peak_gdp, rating, bloc_role, last_seen FROM players WHERE bloc_id = ? ORDER BY gdp DESC`).all(blocId);
    },

    recomputePower(blocId) {
      const r = raw.prepare(`SELECT COUNT(*) AS c, COALESCE(SUM(gdp),0) AS g, COALESCE(SUM(rating),0) AS rt FROM players WHERE bloc_id = ?`).get(blocId);
      const power = (r.g / 1e6) + (r.rt / 100) + (r.c * 10);
      raw.prepare('UPDATE blocs SET power = ?, influence = influence + 1 WHERE id = ?').run(power, blocId);
      return power;
    },

    relation(a, b) {
      const [x, y] = [Math.min(a, b), Math.max(a, b)];
      return raw.prepare('SELECT * FROM bloc_relations WHERE bloc_a = ? AND bloc_b = ?').get(x, y);
    },

    setRelation(a, b, relation, status) {
      const [x, y] = [Math.min(a, b), Math.max(a, b)];
      const clamped = Math.max(-100, Math.min(100, relation));
      raw.prepare(`
        INSERT INTO bloc_relations (bloc_a, bloc_b, relation, status, updated_at)
        VALUES (?,?,?,?,?)
        ON CONFLICT(bloc_a, bloc_b) DO UPDATE SET
          relation = excluded.relation,
          status = excluded.status,
          updated_at = excluded.updated_at
      `).run(x, y, clamped, status, Date.now());
    },

    allRelations() {
      return raw.prepare('SELECT * FROM bloc_relations').all();
    }
  };

  const Matches = {
    create(attackerId, defenderId) {
      const info = raw.prepare('INSERT INTO matches (attacker_id, defender_id, status) VALUES (?,?,?)')
        .run(attackerId, defenderId, 'active');
      return raw.prepare('SELECT * FROM matches WHERE id = ?').get(info.lastInsertRowid);
    },

    resolve(id, { winnerId, attackerPower, defenderPower, stolenGdp, ratingDelta }) {
      raw.prepare(`UPDATE matches SET status = ?, winner_id = ?, attacker_power = ?, defender_power = ?, stolen_gdp = ?, rating_delta = ?, resolved_at = ? WHERE id = ?`)
        .run('resolved', winnerId, attackerPower, defenderPower, stolenGdp, ratingDelta, Date.now(), id);
    },

    recentFor(playerId, limit = 20) {
      return raw.prepare(`
        SELECT m.*,
          a.username AS attacker_name, a.nation_name AS attacker_nation, a.nation_emoji AS attacker_emoji,
          d.username AS defender_name, d.nation_name AS defender_nation, d.nation_emoji AS defender_emoji
        FROM matches m
        JOIN players a ON a.id = m.attacker_id
        JOIN players d ON d.id = m.defender_id
        WHERE m.attacker_id = ? OR m.defender_id = ?
        ORDER BY m.created_at DESC
        LIMIT ?
      `).all(playerId, playerId, limit);
    },

    byId(id) {
      return raw.prepare('SELECT * FROM matches WHERE id = ?').get(id);
    }
  };

  const Events = {
    log(type, { playerId = null, blocId = null, payload = {} } = {}) {
      raw.prepare('INSERT INTO events (type, player_id, bloc_id, payload) VALUES (?,?,?,?)')
        .run(type, playerId, blocId, JSON.stringify(payload));
    },

    recent(limit = 50) {
      return raw.prepare(`
        SELECT e.*, p.username AS player_name, p.nation_name, p.nation_emoji
        FROM events e
        LEFT JOIN players p ON p.id = e.player_id
        ORDER BY e.created_at DESC
        LIMIT ?
      `).all(limit);
    }
  };

  return { Players, Blocs, Matches, Events, raw };
}
