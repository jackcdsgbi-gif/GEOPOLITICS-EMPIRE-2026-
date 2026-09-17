import { createModels } from './models.js';
import { signToken, authMiddleware } from './auth.js';
import { createMatchmaking } from './matchmaking.js';
import { logger } from './logger.js';
import { AiDirector } from './game/ai_director.js';

export function registerRoutes(app, db) {
  const models = createModels(db);
  const mm = createMatchmaking({ db, models, io: app.get('io') });
  mm.startLoop();

  const aiDirector = new AiDirector(db, app.get('io'));
  aiDirector.startLoop(10000);

  // ─── AUTH ───────────────────────────────────────────
  app.post('/api/auth/register', (req, res) => {
    try {
      const p = models.Players.create(req.body);
      const token = signToken({ pid: p.id, username: p.username });
      logger.net(`Registro: ${p.username}`);
      models.Events.log('player_joined', {
        playerId: p.id,
        payload: { username: p.username, nation: p.nation_name }
      });
      res.json({ token, player: models.Players.public(p) });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  app.post('/api/auth/login', (req, res) => {
    try {
      const p = models.Players.login(req.body.username, req.body.password);
      const token = signToken({ pid: p.id, username: p.username });
      res.json({ token, player: p });
    } catch (e) {
      res.status(401).json({ error: e.message });
    }
  });

  // ─── PLAYER ─────────────────────────────────────────
  app.get('/api/player/me', authMiddleware, (req, res) => {
    const p = models.Players.byId(req.playerId);
    res.json({ player: models.Players.public(p) });
  });

  app.get('/api/player/:id', (req, res) => {
    const p = models.Players.byId(Number(req.params.id));
    if (!p) return res.status(404).json({ error: 'not_found' });
    res.json({ player: models.Players.public(p) });
  });

  app.post('/api/player/sync', authMiddleware, (req, res) => {
    const p = models.Players.byId(req.playerId);
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

    models.Players.updateState(p.id, {
      level,
      xp,
      gdp,
      influence,
      stability,
      legacy,
      base_multiplier,
      resets,
      total_earned,
      peak_gdp: Math.max(p.peak_gdp || 0, gdp || 0, total_earned || 0),
      state_json: state_json ? JSON.stringify(state_json) : p.state_json,
      last_sync: now
    });

    if (aiDirector) {
      aiDirector.updatePlayerMetrics(total_earned || gdp || 0, (level || 1) * 30, gdp || 0);
    }

    res.json({ ok: true, player: models.Players.public(models.Players.byId(p.id)) });
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
  app.get('/api/blocs', (_req, res) => {
    res.json({ blocs: models.Blocs.all() });
  });

  app.get('/api/blocs/:id', (req, res) => {
    const b = models.Blocs.byId(Number(req.params.id));
    if (!b) return res.status(404).json({ error: 'not_found' });
    const members = models.Blocs.members(b.id);
    const relations = models.Blocs.allRelations().filter(r => r.bloc_a === b.id || r.bloc_b === b.id);
    res.json({ bloc: b, members, relations });
  });

  app.post('/api/blocs', authMiddleware, (req, res) => {
    try {
      const p = models.Players.byId(req.playerId);
      if (p.bloc_id) return res.status(400).json({ error: 'already_in_bloc' });
      const b = models.Blocs.create({ ...req.body, leaderId: p.id });
      models.Events.log('bloc_created', { playerId: p.id, blocId: b.id, payload: { name: b.name } });
      res.json({ bloc: b });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  app.post('/api/blocs/:id/join', authMiddleware, (req, res) => {
    try {
      const b = models.Blocs.byId(Number(req.params.id));
      if (!b) return res.status(404).json({ error: 'not_found' });
      const p = models.Players.byId(req.playerId);
      if (p.bloc_id) return res.status(400).json({ error: 'leave_first' });
      models.Blocs.join(b.id, p.id);
      models.Blocs.recomputePower(b.id);
      models.Events.log('bloc_joined', { playerId: p.id, blocId: b.id, payload: { bloc: b.name, player: p.username } });
      res.json({ ok: true });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  app.post('/api/blocs/leave', authMiddleware, (req, res) => {
    const p = models.Players.byId(req.playerId);
    if (p.bloc_id) {
      models.Events.log('bloc_left', { playerId: p.id, blocId: p.bloc_id, payload: { player: p.username } });
      models.Blocs.leave(p.id);
      models.Blocs.recomputePower(p.bloc_id);
    }
    res.json({ ok: true });
  });

  app.get('/api/blocs/relations/all', (_req, res) => {
    res.json({ relations: models.Blocs.allRelations() });
  });

  // ─── MATCH / PVP ────────────────────────────────────
  app.post('/api/match/queue', authMiddleware, (req, res) => {
    try {
      const r = mm.enqueue(req.playerId);
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

  app.get('/api/match/history', authMiddleware, (req, res) => {
    res.json({ matches: models.Matches.recentFor(req.playerId) });
  });

  // ─── LEADERBOARD ────────────────────────────────────
  app.get('/api/leaderboard/rating', (_req, res) => {
    res.json({ rows: models.Players.topByRating(100) });
  });

  app.get('/api/leaderboard/gdp', (_req, res) => {
    res.json({ rows: models.Players.topByGdp(100) });
  });

  app.get('/api/leaderboard/blocs', (_req, res) => {
    res.json({ rows: models.Blocs.all() });
  });

  // ─── SEASON ─────────────────────────────────────────
  app.get('/api/season', (_req, res) => {
    res.json({ season: db.season.current() });
  });

  app.get('/api/season/history', (_req, res) => {
    res.json({ seasons: db.season.history() });
  });

  // ─── EVENTS ─────────────────────────────────────────
  app.get('/api/events', (_req, res) => {
    res.json({ events: models.Events.recent(50) });
  });

  // ─── AI DIRECTOR ─────────────────────────────────────
  app.get('/api/ai/feed', (_req, res) => {
    res.json({ events: aiDirector.getFeed(50) });
  });

  app.get('/api/ai/npcs', (_req, res) => {
    res.json({ npcs: aiDirector.getNpcs() });
  });

  logger.ok('Rotas REST registradas');
  return { models, mm, aiDirector };
}
