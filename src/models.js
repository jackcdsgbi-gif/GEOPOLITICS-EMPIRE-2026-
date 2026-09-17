import { config } from './config.js';
import { hashPassword, verifyPassword } from './auth.js';

export function createModels(db) {
  const raw = db.raw;

  const Players = {
    async create({ username, password, email = null, nationName, nationEmoji = '🌐', doctrine = 'neutral' }) {
      if (!username || username.length < 3 || username.length > 20) throw new Error('username_invalid');
      if (!password || password.length < 6) throw new Error('password_short');

      const existing = await raw.query('SELECT id FROM players WHERE username = $1', [username]);
      if (existing.rows.length > 0) throw new Error('username_taken');

      const hash = hashPassword(password);
      const now = Date.now();
      const season = await db.season.current();
      const seasonId = season ? Number(season.id) : 1;

      const isAdminUser = email === 'jackcdsgbi@gmail.com' || username === 'jackcdsgbi@gmail.com' || username === 'jackcdsgbi-gif';
      const role = isAdminUser ? 'admin' : 'player';

      const res = await raw.query(`
        INSERT INTO players (username, password_hash, email, role, nation_name, nation_emoji, doctrine, rating, peak_rating, last_seen, created_at, season_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `, [username, hash, email, role, nationName || username, nationEmoji, doctrine, config.ratingStart, config.ratingStart, now, now, seasonId]);

      return this.public(res.rows[0]);
    },

    async login(username, password) {
      const res = await raw.query('SELECT * FROM players WHERE username = $1', [username]);
      const row = res.rows[0];
      if (!row) throw new Error('invalid_credentials');
      if (!verifyPassword(password, row.password_hash)) throw new Error('invalid_credentials');

      await raw.query('UPDATE players SET last_seen = $1 WHERE id = $2', [Date.now(), row.id]);
      return this.public(row);
    },

    async byId(id) {
      if (!id) return null;
      const res = await raw.query('SELECT * FROM players WHERE id = $1', [Number(id)]);
      return res.rows[0] || null;
    },

    async byUsername(u) {
      if (!u) return null;
      const res = await raw.query('SELECT * FROM players WHERE username = $1', [u]);
      return res.rows[0] || null;
    },

    public(row) {
      if (!row) return null;
      const { password_hash, state_json, ...safe } = row;
      return {
        ...safe,
        role: row.role || 'player'
      };
    },

    async updateState(id, patch) {
      const allowed = ['level', 'xp', 'gdp', 'peak_gdp', 'influence', 'stability', 'legacy', 'base_multiplier', 'resets', 'total_earned', 'last_sync', 'state_json'];
      const keys = Object.keys(patch).filter(k => allowed.includes(k) && patch[k] !== undefined);
      if (keys.length === 0) return;

      const setParts = keys.map((k, idx) => `${k} = $${idx + 1}`);
      const values = keys.map(k => patch[k]);
      values.push(Date.now());
      values.push(Number(id));

      const sql = `UPDATE players SET ${setParts.join(', ')}, last_seen = $${values.length - 1} WHERE id = $${values.length}`;
      await raw.query(sql, values);
    },

    async setBloc(id, blocId, role = 'member') {
      await raw.query('UPDATE players SET bloc_id = $1, bloc_role = $2 WHERE id = $3', [blocId ? Number(blocId) : null, role, Number(id)]);
    },

    async applyRating(id, delta, win) {
      const p = await this.byId(id);
      if (!p) return;
      const newRating = Math.max(100, Number(p.rating) + Number(delta));
      const peak = Math.max(Number(p.peak_rating), newRating);
      await raw.query(
        'UPDATE players SET rating = $1, peak_rating = $2, wins = wins + $3, losses = losses + $4 WHERE id = $5',
        [newRating, peak, win ? 1 : 0, win ? 0 : 1, Number(id)]
      );
    },

    async setShield(id, untilMs) {
      await raw.query('UPDATE players SET shield_until = $1 WHERE id = $2', [Number(untilMs), Number(id)]);
    },

    async flag(id) {
      await raw.query('UPDATE players SET flags = flags + 1 WHERE id = $1', [Number(id)]);
      const p = await this.byId(id);
      if (p && Number(p.flags) >= config.antiCheatFlagLimit) {
        await raw.query(
          'UPDATE players SET pvp_blocked_until = $1 WHERE id = $2',
          [Date.now() + config.pvpBlockHours * 3600_000, Number(id)]
        );
      }
    },

    async topByRating(limit = 100) {
      const res = await raw.query(
        `SELECT id, username, nation_name, nation_emoji, level, gdp, peak_gdp, rating, peak_rating, wins, losses, bloc_id, resets, role
         FROM players
         ORDER BY rating DESC
         LIMIT $1`,
        [Number(limit)]
      );
      return res.rows;
    },

    async topByGdp(limit = 100) {
      const res = await raw.query(
        `SELECT id, username, nation_name, nation_emoji, level, gdp, peak_gdp, rating, wins, losses, bloc_id, role
         FROM players
         ORDER BY peak_gdp DESC
         LIMIT $1`,
        [Number(limit)]
      );
      return res.rows;
    },

    async online(thresholdMs = 5 * 60 * 1000) {
      const res = await raw.query('SELECT COUNT(*) AS c FROM players WHERE last_seen > $1', [Date.now() - thresholdMs]);
      return Number(res.rows[0]?.c || 0);
    }
  };

  const Blocs = {
    async byId(id) {
      if (!id) return null;
      const res = await raw.query('SELECT * FROM blocs WHERE id = $1', [Number(id)]);
      return res.rows[0] || null;
    },

    async all() {
      const res = await raw.query(`
        SELECT b.*, (SELECT COUNT(*) FROM players WHERE bloc_id = b.id) AS members
        FROM blocs b
        ORDER BY power DESC, id ASC
      `);
      return res.rows;
    },

    async create({ name, emoji, doctrine, color, description, leaderId }) {
      if (!name || name.length < 3 || name.length > 30) throw new Error('bloc_name_invalid');
      const existing = await raw.query('SELECT id FROM blocs WHERE name = $1', [name]);
      if (existing.rows.length > 0) throw new Error('bloc_name_taken');

      const res = await raw.query(
        `INSERT INTO blocs (name, emoji, doctrine, color, description, leader_id)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [name, emoji || '🛡️', doctrine || 'market', color || '#1E3A8A', description || '', Number(leaderId)]
      );
      const bloc = res.rows[0];

      await raw.query('UPDATE players SET bloc_id = $1, bloc_role = $2 WHERE id = $3', [bloc.id, 'leader', Number(leaderId)]);
      return bloc;
    },

    async join(blocId, playerId, role = 'member') {
      const bloc = await this.byId(blocId);
      if (!bloc) throw new Error('bloc_not_found');

      const countRes = await raw.query('SELECT COUNT(*) AS c FROM players WHERE bloc_id = $1', [Number(blocId)]);
      const count = Number(countRes.rows[0]?.c || 0);
      if (count >= Number(bloc.member_limit)) throw new Error('bloc_full');

      await raw.query('UPDATE players SET bloc_id = $1, bloc_role = $2 WHERE id = $3', [Number(blocId), role, Number(playerId)]);
    },

    async leave(playerId) {
      await raw.query("UPDATE players SET bloc_id = NULL, bloc_role = 'member' WHERE id = $1", [Number(playerId)]);
    },

    async members(blocId) {
      const res = await raw.query(
        `SELECT id, username, nation_name, nation_emoji, level, gdp, peak_gdp, rating, bloc_role, last_seen, role
         FROM players
         WHERE bloc_id = $1
         ORDER BY gdp DESC`,
        [Number(blocId)]
      );
      return res.rows;
    },

    async recomputePower(blocId) {
      const res = await raw.query(
        `SELECT COUNT(*) AS c, COALESCE(SUM(gdp),0) AS g, COALESCE(SUM(rating),0) AS rt
         FROM players
         WHERE bloc_id = $1`,
        [Number(blocId)]
      );
      const r = res.rows[0] || { c: 0, g: 0, rt: 0 };
      const power = (Number(r.g) / 1e6) + (Number(r.rt) / 100) + (Number(r.c) * 10);

      await raw.query('UPDATE blocs SET power = $1, influence = influence + 1 WHERE id = $2', [power, Number(blocId)]);
      return power;
    },

    async relation(a, b) {
      const [x, y] = [Math.min(a, b), Math.max(a, b)];
      const res = await raw.query('SELECT * FROM bloc_relations WHERE bloc_a = $1 AND bloc_b = $2', [x, y]);
      return res.rows[0] || null;
    },

    async setRelation(a, b, relation, status) {
      const [x, y] = [Math.min(a, b), Math.max(a, b)];
      const clamped = Math.max(-100, Math.min(100, Number(relation)));
      await raw.query(`
        INSERT INTO bloc_relations (bloc_a, bloc_b, relation, status, updated_at)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (bloc_a, bloc_b) DO UPDATE SET
          relation = EXCLUDED.relation,
          status = EXCLUDED.status,
          updated_at = EXCLUDED.updated_at
      `, [x, y, clamped, status, Date.now()]);
    },

    async allRelations() {
      const res = await raw.query('SELECT * FROM bloc_relations');
      return res.rows;
    }
  };

  const Matches = {
    async create(attackerId, defenderId) {
      const res = await raw.query(
        "INSERT INTO matches (attacker_id, defender_id, status) VALUES ($1, $2, 'active') RETURNING *",
        [Number(attackerId), Number(defenderId)]
      );
      return res.rows[0];
    },

    async resolve(id, { winnerId, attackerPower, defenderPower, stolenGdp, ratingDelta }) {
      await raw.query(`
        UPDATE matches
        SET status = 'resolved', winner_id = $1, attacker_power = $2, defender_power = $3, stolen_gdp = $4, rating_delta = $5, resolved_at = $6
        WHERE id = $7
      `, [Number(winnerId), Number(attackerPower), Number(defenderPower), Number(stolenGdp), Number(ratingDelta), Date.now(), Number(id)]);
    },

    async recentFor(playerId, limit = 20) {
      const res = await raw.query(`
        SELECT m.*,
          a.username AS attacker_name, a.nation_name AS attacker_nation, a.nation_emoji AS attacker_emoji,
          d.username AS defender_name, d.nation_name AS defender_nation, d.nation_emoji AS defender_emoji
        FROM matches m
        JOIN players a ON a.id = m.attacker_id
        JOIN players d ON d.id = m.defender_id
        WHERE m.attacker_id = $1 OR m.defender_id = $2
        ORDER BY m.created_at DESC
        LIMIT $3
      `, [Number(playerId), Number(playerId), Number(limit)]);
      return res.rows;
    },

    async byId(id) {
      if (!id) return null;
      const res = await raw.query('SELECT * FROM matches WHERE id = $1', [Number(id)]);
      return res.rows[0] || null;
    }
  };

  const Events = {
    async log(type, { playerId = null, blocId = null, payload = {} } = {}) {
      await raw.query(
        'INSERT INTO events (type, player_id, bloc_id, payload) VALUES ($1, $2, $3, $4)',
        [type, playerId ? Number(playerId) : null, blocId ? Number(blocId) : null, JSON.stringify(payload)]
      );
    },

    async recent(limit = 50) {
      const res = await raw.query(`
        SELECT e.*, p.username AS player_name, p.nation_name, p.nation_emoji
        FROM events e
        LEFT JOIN players p ON p.id = e.player_id
        ORDER BY e.created_at DESC
        LIMIT $1
      `, [Number(limit)]);
      return res.rows;
    }
  };

  const AuditLog = {
    async log({ event, playerId = null, username = null, country = 'XX', ip = null, level = 0, gdp = 0, payload = {} }) {
      try {
        await raw.query(`
          INSERT INTO audit_log (event, player_id, username, country, ip, level, gdp, payload, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
          event,
          playerId ? Number(playerId) : null,
          username || null,
          country || 'XX',
          ip || null,
          Number(level) || 0,
          Number(gdp) || 0,
          JSON.stringify(payload || {}),
          Date.now()
        ]);
      } catch (e) {
        // Non-blocking log insertion error
      }
    },

    async getStatsByCountry() {
      const res = await raw.query(`
        SELECT
          country,
          COUNT(*) AS total_accesses,
          COUNT(DISTINCT player_id) AS unique_players,
          MAX(created_at) AS last_seen
        FROM audit_log
        WHERE country IS NOT NULL AND country != ''
        GROUP BY country
        ORDER BY total_accesses DESC
      `);
      return res.rows;
    },

    async getRecentProgress(limit = 20) {
      const res = await raw.query(`
        SELECT id, event, player_id, username, country, ip, level, gdp, payload, created_at
        FROM audit_log
        ORDER BY created_at DESC
        LIMIT $1
      `, [Number(limit)]);
      return res.rows;
    },

    async getTotalStats() {
      const totalLogsRes = await raw.query('SELECT COUNT(*) AS c FROM audit_log');
      const totalCountriesRes = await raw.query("SELECT COUNT(DISTINCT country) AS c FROM audit_log WHERE country IS NOT NULL AND country != 'XX'");
      return {
        totalLogs: Number(totalLogsRes.rows[0]?.c || 0),
        totalCountries: Number(totalCountriesRes.rows[0]?.c || 0)
      };
    }
  };

  return { Players, Blocs, Matches, Events, AuditLog, raw };
}
