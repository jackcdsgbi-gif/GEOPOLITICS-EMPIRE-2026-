import geoip from 'geoip-lite';
import { createModels } from './models.js';
import { signToken, authMiddleware, isAdmin } from './auth.js';
import { createMatchmaking } from './matchmaking.js';
import { logger } from './logger.js';
import { AiDirector } from './game/ai_director.js';

export function getClientGeo(req) {
  const forwarded = req.headers['x-forwarded-for'];
  let ip = forwarded ? forwarded.split(',')[0].trim() : req.socket?.remoteAddress || '';
  if (ip.startsWith('::ffff:')) {
    ip = ip.replace('::ffff:', '');
  }

  let country = 'XX';
  if (!ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.16.')) {
    country = 'BR'; // Ambiente de desenvolvimento local padrão
  } else {
    const geo = geoip.lookup(ip);
    country = geo?.country || 'XX';
  }

  return { ip, country };
}

export function registerRoutes(app, db) {
  const models = createModels(db);
  const mm = createMatchmaking({ db, models, io: app.get('io') });
  mm.startLoop();

  const aiDirector = new AiDirector(db, app.get('io'), models);
  aiDirector.startLoop(10000);

  // ─── AUTH ───────────────────────────────────────────
  app.post('/api/auth/register', async (req, res) => {
    try {
      const p = await models.Players.create(req.body);
      const token = signToken({ pid: p.id, username: p.username, role: p.role });
      const { ip, country } = getClientGeo(req);

      logger.net(`Registro: ${p.username} (${country} / ${ip})`);

      await models.Events.log('player_joined', {
        playerId: p.id,
        payload: { username: p.username, nation: p.nation_name, country }
      });

      await models.AuditLog.log({
        event: 'register',
        playerId: p.id,
        username: p.username,
        country,
        ip,
        level: 0,
        gdp: 0,
        payload: { nation: p.nation_name, doctrine: p.doctrine }
      });

      res.json({ token, player: models.Players.public(p) });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const p = await models.Players.login(req.body.username, req.body.password);
      const token = signToken({ pid: p.id, username: p.username, role: p.role });
      const { ip, country } = getClientGeo(req);

      logger.net(`Login: ${p.username} (${country} / ${ip})`);

      await models.AuditLog.log({
        event: 'login',
        playerId: p.id,
        username: p.username,
        country,
        ip,
        level: Number(p.level) || 0,
        gdp: Number(p.gdp) || 0,
        payload: { rating: p.rating }
      });

      res.json({ token, player: p });
    } catch (e) {
      res.status(401).json({ error: e.message });
    }
  });

  // ─── PLAYER ─────────────────────────────────────────
  app.get('/api/player/me', authMiddleware, async (req, res) => {
    try {
      const p = await models.Players.byId(req.playerId);
      res.json({ player: models.Players.public(p) });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/player/:id', async (req, res) => {
    try {
      const p = await models.Players.byId(Number(req.params.id));
      if (!p) return res.status(404).json({ error: 'not_found' });
      res.json({ player: models.Players.public(p) });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/player/sync', authMiddleware, async (req, res) => {
    try {
      const p = await models.Players.byId(req.playerId);
      if (!p) return res.status(404).json({ error: 'not_found' });

      const {
        level,
        xp,
        gdp,
        influence,
        stability,
        legacy,
        base_multiplier,
        resets,
        total_earned,
        state_json
      } = req.body;

      const now = Date.now();
      const currentPeak = Math.max(Number(p.peak_gdp) || 0, Number(gdp) || 0, Number(total_earned) || 0);

      await models.Players.updateState(p.id, {
        level,
        xp,
        gdp,
        influence,
        stability,
        legacy,
        base_multiplier,
        resets,
        total_earned,
        peak_gdp: currentPeak,
        state_json: state_json ? JSON.stringify(state_json) : p.state_json,
        last_sync: now
      });

      if (aiDirector) {
        aiDirector.updatePlayerMetrics(Number(total_earned) || Number(gdp) || 0, (Number(level) || 1) * 30, Number(gdp) || 0);
      }

      // Captura geográfica e registro em audit_log
      const { ip, country } = getClientGeo(req);
      await models.AuditLog.log({
        event: 'sync',
        playerId: p.id,
        username: p.username,
        country,
        ip,
        level: Number(level) || Number(p.level) || 0,
        gdp: Number(gdp) || Number(p.gdp) || 0,
        payload: {
          peak_gdp: currentPeak,
          total_earned: Number(total_earned) || 0,
          resets: Number(resets) || 0
        }
      });

      const updated = await models.Players.byId(p.id);
      res.json({ ok: true, player: models.Players.public(updated) });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // ─── ADMIN DASHBOARD (PRIVADO) ──────────────────────
  app.get('/api/admin/dashboard', authMiddleware, isAdmin, async (req, res) => {
    try {
      const byCountry = await models.AuditLog.getStatsByCountry();
      const recentProgress = await models.AuditLog.getRecentProgress(20);
      const totals = await models.AuditLog.getTotalStats();

      res.json({
        ok: true,
        stats: {
          byCountry,
          recentProgress,
          totals
        }
      });
    } catch (e) {
      logger.error('admin dashboard error', e);
      res.status(500).json({ error: e.message });
    }
  });

  // ─── AI DIRECTOR LIVE SYNC ──────────────────────────
  app.post('/api/ai/live-sync', (req, res) => {
    const { capital, power, gdp } = req.body || {};
    if (aiDirector) {
      aiDirector.updatePlayerMetrics(capital || 0, power || 0, gdp || 0);
      return res.json({
        ok: true,
        npcs: Array.from(aiDirector.npcs.values()),
        events: aiDirector.eventHistory.slice(0, 10)
      });
    }
    res.json({ ok: true });
  });

  app.get('/api/ai/status', (_req, res) => {
    if (aiDirector) {
      return res.json({
        ok: true,
        npcs: Array.from(aiDirector.npcs.values()),
        events: aiDirector.eventHistory.slice(0, 20)
      });
    }
    res.json({ ok: false });
  });

  // ─── BLOCS ──────────────────────────────────────────
  app.get('/api/blocs', async (_req, res) => {
    try {
      const blocs = await models.Blocs.all();
      res.json({ blocs });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/blocs/:id', async (req, res) => {
    try {
      const b = await models.Blocs.byId(Number(req.params.id));
      if (!b) return res.status(404).json({ error: 'not_found' });
      const members = await models.Blocs.members(b.id);
      const allRel = await models.Blocs.allRelations();
      const relations = allRel.filter(r => r.bloc_a === b.id || r.bloc_b === b.id);
      res.json({ bloc: b, members, relations });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/blocs', authMiddleware, async (req, res) => {
    try {
      const p = await models.Players.byId(req.playerId);
      if (p.bloc_id) return res.status(400).json({ error: 'already_in_bloc' });
      const b = await models.Blocs.create({ ...req.body, leaderId: p.id });
      await models.Events.log('bloc_created', { playerId: p.id, blocId: b.id, payload: { name: b.name } });
      res.json({ bloc: b });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  app.post('/api/blocs/:id/join', authMiddleware, async (req, res) => {
    try {
      const b = await models.Blocs.byId(Number(req.params.id));
      if (!b) return res.status(404).json({ error: 'not_found' });
      const p = await models.Players.byId(req.playerId);
      if (p.bloc_id) return res.status(400).json({ error: 'leave_first' });
      await models.Blocs.join(b.id, p.id);
      await models.Blocs.recomputePower(b.id);
      await models.Events.log('bloc_joined', { playerId: p.id, blocId: b.id, payload: { bloc: b.name, player: p.username } });
      res.json({ ok: true });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  app.post('/api/blocs/leave', authMiddleware, async (req, res) => {
    try {
      const p = await models.Players.byId(req.playerId);
      if (p.bloc_id) {
        await models.Events.log('bloc_left', { playerId: p.id, blocId: p.bloc_id, payload: { player: p.username } });
        await models.Blocs.leave(p.id);
        await models.Blocs.recomputePower(p.bloc_id);
      }
      res.json({ ok: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/blocs/relations/all', async (_req, res) => {
    try {
      const relations = await models.Blocs.allRelations();
      res.json({ relations });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // ─── MATCH / PVP ────────────────────────────────────
  app.post('/api/match/queue', authMiddleware, async (req, res) => {
    try {
      const r = await mm.enqueue(req.playerId);
      res.json(r);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  app.post('/api/match/cancel', authMiddleware, (req, res) => {
    mm.dequeue(req.playerId);
    res.json({ ok: true });
  });

  app.get('/api/match/status', authMiddleware, (req, res) => {
    res.json(mm.status(req.playerId));
  });

  app.get('/api/match/history', authMiddleware, async (req, res) => {
    try {
      const matches = await models.Matches.recentFor(req.playerId);
      res.json({ matches });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // ─── LEADERBOARD ────────────────────────────────────
  app.get('/api/leaderboard/rating', async (_req, res) => {
    try {
      const rows = await models.Players.topByRating(100);
      res.json({ rows });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/leaderboard/gdp', async (_req, res) => {
    try {
      const rows = await models.Players.topByGdp(100);
      res.json({ rows });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/leaderboard/blocs', async (_req, res) => {
    try {
      const rows = await models.Blocs.all();
      res.json({ rows });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // ─── SEASON ─────────────────────────────────────────
  app.get('/api/season', async (_req, res) => {
    try {
      const season = await db.season.current();
      res.json({ season });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/season/history', async (_req, res) => {
    try {
      const seasons = await db.season.history();
      res.json({ seasons });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // ─── EVENTS ─────────────────────────────────────────
  app.get('/api/events', async (_req, res) => {
    try {
      const events = await models.Events.recent(50);
      res.json({ events });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // ─── AI DIRECTOR ─────────────────────────────────────
  app.get('/api/ai/feed', (_req, res) => {
    res.json({ events: aiDirector.getFeed(50) });
  });

  app.get('/api/ai/npcs', (_req, res) => {
    res.json({ npcs: aiDirector.getNpcs() });
  });

  logger.ok('Rotas REST registradas (com auditoria e Admin Dashboard)');
  return { models, mm, aiDirector };
}
