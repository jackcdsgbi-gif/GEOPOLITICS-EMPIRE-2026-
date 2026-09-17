import geoip from 'geoip-lite';
import { createModels } from './models.js';
import { signToken, authMiddleware, isAdmin } from './auth.js';
import { createMatchmaking } from './matchmaking.js';
import { logger } from './logger.js';
import { AiDirector } from './game/ai_director.js';
import { syncBatch } from './sync_batch.js';

// Mapeamento Geopolítico de Continentes
const CONTINENT_MAP = {
  // América do Sul: +5% Agro
  BR: 'South America', AR: 'South America', CL: 'South America', CO: 'South America',
  PE: 'South America', UY: 'South America', PY: 'South America', BO: 'South America',
  VE: 'South America', EC: 'South America',
  // Europa: +5% Tech
  DE: 'Europe', FR: 'Europe', GB: 'Europe', IT: 'Europe', ES: 'Europe', PT: 'Europe',
  NL: 'Europe', BE: 'Europe', CH: 'Europe', SE: 'Europe', NO: 'Europe', PL: 'Europe',
  RU: 'Europe', UA: 'Europe', AT: 'Europe', IE: 'Europe',
  // Ásia: +5% Indústria
  CN: 'Asia', JP: 'Asia', KR: 'Asia', IN: 'Asia', SG: 'Asia', TW: 'Asia',
  VN: 'Asia', ID: 'Asia', MY: 'Asia', TH: 'Asia', PH: 'Asia', SA: 'Asia',
  AE: 'Asia', IL: 'Asia', TR: 'Asia',
  // América do Norte: +5% Capital
  US: 'North America', CA: 'North America', MX: 'North America',
  // África: +5% Mineração
  ZA: 'Africa', NG: 'Africa', EG: 'Africa', KE: 'Africa', GH: 'Africa',
  // Oceania: +5% Logística
  AU: 'Oceania', NZ: 'Oceania'
};

const CONTINENT_BONUSES = {
  'South America': { type: 'agro', bonus: 0.05, label: '+5% Commodities Agrícolas (Agro)', badge: '🌾 +5% Agro' },
  'Europe': { type: 'tech', bonus: 0.05, label: '+5% Velocidade de Tecnologia (P&D)', badge: '🔬 +5% Tech' },
  'Asia': { type: 'industry', bonus: 0.05, label: '+5% Produção Industrial (Manufatura)', badge: '🏭 +5% Indústria' },
  'North America': { type: 'capital', bonus: 0.05, label: '+5% Multiplicador Financeiro (Capital)', badge: '💵 +5% Capital' },
  'Africa': { type: 'mining', bonus: 0.05, label: '+5% Extração Mineral (Minérios)', badge: '⛏️ +5% Mineração' },
  'Oceania': { type: 'logistics', bonus: 0.05, label: '+5% Logística e Soberania Marítima', badge: '⚓ +5% Logística' }
};

export function getContinentDetails(countryCode) {
  const continent = CONTINENT_MAP[countryCode] || 'South America';
  const bonus = CONTINENT_BONUSES[continent] || CONTINENT_BONUSES['South America'];
  return { continent, bonus };
}

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

  app.set('matchmaking', mm);
  app.set('aiDirector', aiDirector);
  app.set('syncBatch', syncBatch);

  // ─── AUTH ───────────────────────────────────────────
  app.post('/api/auth/register', async (req, res) => {
    try {
      const p = await models.Players.create(req.body);
      const { ip, country } = getClientGeo(req);
      const { continent, bonus } = getContinentDetails(country);
      await models.Players.updateContinent(p.id, continent);
      syncBatch.cachePlayer({ ...p, continent });

      const token = signToken({ pid: p.id, username: p.username, role: p.role });
      logger.net(`Registro: ${p.username} (${country} / ${continent} / ${ip})`);

      await models.Events.log('player_joined', {
        playerId: p.id,
        payload: { username: p.username, nation: p.nation_name, country, continent }
      });

      await models.AuditLog.log({
        event: 'register',
        playerId: p.id,
        username: p.username,
        country,
        ip,
        level: 0,
        gdp: 0,
        payload: { nation: p.nation_name, doctrine: p.doctrine, continent }
      });

      res.json({ token, player: { ...models.Players.public(p), continent, continentalBonus: bonus } });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const p = await models.Players.login(req.body.username, req.body.password);
      const token = signToken({ pid: p.id, username: p.username, role: p.role });
      const { ip, country } = getClientGeo(req);
      const { continent, bonus } = getContinentDetails(country);

      if (p.continent !== continent) {
        await models.Players.updateContinent(p.id, continent);
        p.continent = continent;
      }
      syncBatch.cachePlayer(p);

      logger.net(`Login: ${p.username} (${country} / ${continent} / ${ip})`);

      await models.AuditLog.log({
        event: 'login',
        playerId: p.id,
        username: p.username,
        country,
        ip,
        level: Number(p.level) || 0,
        gdp: Number(p.gdp) || 0,
        payload: { rating: p.rating, continent }
      });

      res.json({ token, player: { ...p, continent, continentalBonus: bonus } });
    } catch (e) {
      if (e.message === 'account_banned') {
        return res.status(403).json({ error: 'account_banned', message: 'Sua conta foi suspensa pela moderação global.' });
      }
      res.status(401).json({ error: e.message });
    }
  });

  // ─── PLAYER ─────────────────────────────────────────
  app.get('/api/player/me', authMiddleware, async (req, res) => {
    try {
      let p = syncBatch.getCachedPlayer(req.playerId);
      if (!p) {
        p = await models.Players.byId(req.playerId);
        if (!p) return res.status(404).json({ error: 'not_found' });
        syncBatch.cachePlayer(p);
      }
      const { continent, bonus } = getContinentDetails(p.continent || 'BR');
      res.json({ player: { ...models.Players.public(p), continent: p.continent || continent, continentalBonus: bonus } });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/player/:id', async (req, res) => {
    try {
      const pid = Number(req.params.id);
      let p = syncBatch.getCachedPlayer(pid);
      if (!p) {
        p = await models.Players.byId(pid);
        if (!p) return res.status(404).json({ error: 'not_found' });
        syncBatch.cachePlayer(p);
      }
      res.json({ player: models.Players.public(p) });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // ROTA CRÍTICA DE ALTA PERFORMANCE (WRITE-BATCHING & IN-MEMORY CACHE)
  app.post('/api/player/sync', authMiddleware, async (req, res) => {
    try {
      let p = syncBatch.getCachedPlayer(req.playerId);
      if (!p) {
        p = await models.Players.byId(req.playerId);
        if (!p) return res.status(404).json({ error: 'not_found' });
        syncBatch.cachePlayer(p);
      }

      // Captura geográfica e continente
      const { ip, country } = getClientGeo(req);
      const { continent, bonus } = getContinentDetails(country);

      // Atualiza os dados instantaneamente em RAM e enfileira para flush em lote a cada 30s
      const updated = syncBatch.stagePlayerSync(
        p.id,
        req.body,
        { ip, country, continent },
        p
      );

      if (aiDirector) {
        aiDirector.updatePlayerMetrics(
          Number(updated.total_earned) || Number(updated.gdp) || 0,
          (Number(updated.level) || 1) * 30,
          Number(updated.gdp) || 0
        );
      }

      // Resposta imediata em sub-milissegundos sem sobrecarregar o PostgreSQL no Render
      res.json({
        ok: true,
        player: {
          ...models.Players.public(updated),
          continent: updated.continent || continent,
          continentalBonus: bonus
        }
      });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // ─── ADMIN DASHBOARD & LIVE OPS (PRIVADO) ────────────
  app.get('/api/admin/dashboard', authMiddleware, isAdmin, async (req, res) => {
    try {
      const byCountry = await models.AuditLog.getStatsByCountry();
      const recentProgress = await models.AuditLog.getRecentProgress(20);
      const totals = await models.AuditLog.getTotalStats();
      const syncTimeline = await models.AuditLog.getSyncTimeline24h();
      const countryDistribution = await models.AuditLog.getCountryDistribution();
      const aiState = aiDirector ? aiDirector.getState() : { isPaused: false, aggression: 1.0 };

      res.json({
        ok: true,
        stats: {
          byCountry,
          recentProgress,
          totals,
          chartData: {
            countryDistribution,
            syncTimeline
          },
          aiState
        }
      });
    } catch (e) {
      logger.error('admin dashboard error', e);
      res.status(500).json({ error: e.message });
    }
  });

  // Perfil detalhado com auditoria para Modal de Moderação
  app.get('/api/admin/player/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
      const profile = await models.Players.getProfileWithAudit(req.params.id);
      if (!profile) return res.status(404).json({ error: 'player_not_found' });

      const { continent, bonus } = getContinentDetails(profile.player.country || 'BR');
      const allBlocs = await models.Blocs.all();

      res.json({
        ok: true,
        profile: {
          ...profile,
          continent: profile.player.continent || continent,
          continentalBonus: bonus,
          availableBlocs: allBlocs
        }
      });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // Ação de Moderação: Banir / Desbanir
  app.post('/api/admin/player/:id/ban', authMiddleware, isAdmin, async (req, res) => {
    try {
      const targetId = Number(req.params.id);
      const isBanned = req.body.ban !== undefined ? Boolean(req.body.ban) : true;
      await models.Players.setBan(targetId, isBanned);
      syncBatch.updateCachedPlayer(targetId, { is_banned: isBanned });

      if (isBanned) {
        // Desconecta WebSockets ativos do jogador imediatamente
        const io = app.get('io');
        if (io) {
          io.in(`p:${targetId}`).disconnectSockets(true);
        }
        logger.warn(`[Admin Moderação] Jogador ID#${targetId} foi BANIDO por ${req.username}`);
      } else {
        logger.info(`[Admin Moderação] Jogador ID#${targetId} foi DESBANIDO por ${req.username}`);
      }

      await models.AuditLog.log({
        event: isBanned ? 'admin_ban' : 'admin_unban',
        playerId: targetId,
        username: req.username,
        payload: { adminId: req.playerId, isBanned }
      });

      res.json({ ok: true, is_banned: isBanned });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // Ação de Moderação: Injetar Bônus de PIB
  app.post('/api/admin/player/:id/bonus', authMiddleware, isAdmin, async (req, res) => {
    try {
      const targetId = Number(req.params.id);
      const amount = Number(req.body.amount) || 0;
      if (amount <= 0) return res.status(400).json({ error: 'invalid_amount' });

      const updated = await models.Players.addGdpBonus(targetId, amount);
      syncBatch.updateCachedPlayer(targetId, { gdp: updated.gdp, peak_gdp: updated.peak_gdp });

      logger.ok(`[Admin Moderação] Injetado bônus de $${amount} no PIB do jogador ${updated.username}`);

      await models.AuditLog.log({
        event: 'admin_bonus',
        playerId: targetId,
        username: updated.username,
        gdp: Number(updated.gdp),
        payload: { bonusAmount: amount, adminId: req.playerId, adminUser: req.username }
      });

      res.json({ ok: true, player: updated });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // Ação de Moderação: Mudar Bloco Geopolítico
  app.post('/api/admin/player/:id/bloc', authMiddleware, isAdmin, async (req, res) => {
    try {
      const targetId = Number(req.params.id);
      const { blocId } = req.body;
      await models.Players.changeBloc(targetId, blocId);
      syncBatch.updateCachedPlayer(targetId, { bloc_id: blocId });

      logger.info(`[Admin Moderação] Jogador ID#${targetId} transferido para Bloco ID#${blocId}`);

      await models.AuditLog.log({
        event: 'admin_change_bloc',
        playerId: targetId,
        payload: { newBlocId: blocId, adminId: req.playerId }
      });

      res.json({ ok: true, blocId });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // Ação Live Ops: Pausar / Retomar IA Diretora
  app.post('/api/admin/ai/toggle', authMiddleware, isAdmin, (_req, res) => {
    if (!aiDirector) return res.status(400).json({ error: 'ai_director_unavailable' });
    const state = aiDirector.togglePause();
    res.json({ ok: true, state });
  });

  // Ação Live Ops: Ajustar Agressividade da IA Diretora
  app.post('/api/admin/ai/aggression', authMiddleware, isAdmin, (req, res) => {
    if (!aiDirector) return res.status(400).json({ error: 'ai_director_unavailable' });
    const { multiplier } = req.body;
    const state = aiDirector.setAggression(multiplier);
    res.json({ ok: true, state });
  });

  app.get('/api/admin/ai/state', authMiddleware, isAdmin, (_req, res) => {
    if (!aiDirector) return res.status(400).json({ error: 'ai_director_unavailable' });
    res.json({ ok: true, state: aiDirector.getState() });
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

  // ─── GEOPOLITICAL REGION OPERATIONS ─────────────────
  const REGION_META = {
    sa: { id: 'sa', name: 'América do Sul', flag: '🐆', continentKey: 'South America', blocPreset: 'Aliança do Pacífico', doctrine: 'Agro & Recursos Estratégicos', defaultLeader: 'Soberano do Sul' },
    na: { id: 'na', name: 'América do Norte', flag: '🦅', continentKey: 'North America', blocPreset: 'Coalizão dos Cinco', doctrine: 'Capital & Aeroespacial', defaultLeader: 'Alto Comando do Norte' },
    eu: { id: 'eu', name: 'Europa', flag: '🏰', continentKey: 'Europe', blocPreset: 'União Atlântica', doctrine: 'Tech & Finanças Globais', defaultLeader: 'Presidência Comunitária' },
    af: { id: 'af', name: 'África', flag: '🌍', continentKey: 'Africa', blocPreset: 'Cartel Energético', doctrine: 'Minérios Críticos & Energia Solar', defaultLeader: 'Federação Pan-Africana' },
    me: { id: 'me', name: 'Oriente', flag: '🕌', continentKey: 'Middle East', blocPreset: 'Cartel Energético', doctrine: 'Petróleo & Fundos Soberanos', defaultLeader: 'Consórcio de Petrodólares' },
    asia: { id: 'asia', name: 'Eurásia & Ásia', flag: '🐉', continentKey: 'Asia', blocPreset: 'Federação Emergente', doctrine: 'Indústria Pesada & Semicondutores', defaultLeader: 'Poder Central Euroasiático' },
    sea: { id: 'sea', name: 'ASEAN', flag: '🌴', continentKey: 'Asia', blocPreset: 'Consórcio de Terras Raras', doctrine: 'Cadeia de Suprimentos & Lítio', defaultLeader: 'Liga de Comércio Marítimo' },
    pac: { id: 'pac', name: 'Oceania', flag: '🌊', continentKey: 'Oceania', blocPreset: 'Aliança do Pacífico', doctrine: 'Logística & Soberania Marítima', defaultLeader: 'Comando do Pacífico Sul' }
  };

  app.get('/api/geo/region/:id', async (req, res) => {
    try {
      const regionId = String(req.params.id).toLowerCase();
      const meta = REGION_META[regionId] || REGION_META.sa;

      // 1. Jogadores no PostgreSQL associados à região
      const playersRes = await db.raw.query(`
        SELECT id, username, nation_name, nation_emoji, level, rating, gdp, peak_gdp, continent, doctrine, bloc_id
        FROM players
        WHERE continent = $1 OR continent = $2
        ORDER BY rating DESC, gdp DESC
        LIMIT 40
      `, [meta.continentKey, meta.name]);

      const players = playersRes.rows || [];
      const sovereign = players[0] || {
        username: meta.defaultLeader,
        nation_name: meta.name,
        nation_emoji: meta.flag,
        rating: 1250,
        level: 15,
        gdp: 50000000
      };

      // 2. Cálculo do PIB acumulado da região
      const rawGdpSum = players.reduce((sum, p) => sum + (Number(p.gdp) || 0), 0);
      const baselineGdp = 250_000_000;
      const totalGdp = rawGdpSum > 0 ? (rawGdpSum + baselineGdp) : (baselineGdp * 1.5);

      // 3. Tensão militar baseada em partidas recentes
      const matchesRes = await db.raw.query(`
        SELECT id, attacker_id, defender_id, status, created_at, stolen_gdp
        FROM matches
        WHERE created_at > $1
        ORDER BY created_at DESC
        LIMIT 10
      `, [Date.now() - 24 * 3600_000]);

      const recentMatches = matchesRes.rows || [];
      const matchCount = recentMatches.length;
      let tension = 'Baixa (DEFCON 5)';
      let tensionPill = 'pill-green';
      if (matchCount > 15) {
        tension = 'Guerra Iminente (DEFCON 1)';
        tensionPill = 'pill-red';
      } else if (matchCount > 6) {
        tension = 'Elevada (DEFCON 2)';
        tensionPill = 'pill-red';
      } else if (matchCount > 2) {
        tension = 'Moderada (DEFCON 3)';
        tensionPill = 'pill-yellow';
      }

      // 4. Jogadores em fila de matchmaking
      const queuedList = [];
      if (mm?.queue) {
        for (const entry of mm.queue.values()) {
          queuedList.push({
            playerId: entry.playerId,
            rating: entry.rating,
            joinedAt: entry.joinedAt
          });
        }
      }

      // 5. Últimos eventos geopolíticos da IA para a região
      const allAiEvents = aiDirector ? aiDirector.getFeed(40) : [];
      const regionTerms = [meta.name.toLowerCase(), meta.flag, meta.continentKey.toLowerCase(), regionId];
      const regionAiEvents = allAiEvents.filter(ev => {
        const text = `${ev.actor || ''} ${ev.headline || ''} ${ev.details || ''}`.toLowerCase();
        return regionTerms.some(term => text.includes(term));
      }).slice(0, 5);

      // Bônus continental ativo
      const { bonus } = getContinentDetails(meta.continentKey);

      res.json({
        ok: true,
        region: {
          id: meta.id,
          name: meta.name,
          flag: meta.flag,
          doctrine: meta.doctrine,
          blocName: meta.blocPreset,
          sovereignLeader: sovereign.username,
          sovereignNation: sovereign.nation_name || meta.name,
          sovereignEmoji: sovereign.nation_emoji || meta.flag,
          tension,
          tensionPill
        },
        economy: {
          totalGdp,
          playersCount: players.length,
          bonusBadge: bonus.badge,
          bonusLabel: bonus.label,
          investmentTiers: [
            { id: 'tier_1', name: 'Incentivo Setorial', cost: 10000, xp: 250, influence: 50 },
            { id: 'tier_2', name: 'Complexo Logístico', cost: 50000, xp: 1500, influence: 300 },
            { id: 'tier_3', name: 'Fundo de Hegemonia', cost: 250000, xp: 8000, influence: 1800 }
          ]
        },
        military: {
          tension,
          activeBattles: recentMatches.slice(0, 4),
          queuedPlayers: queuedList.slice(0, 6)
        },
        intelligence: {
          stability: Math.max(78, 100 - (matchCount * 2)),
          players: players.map(p => ({
            id: p.id,
            username: p.username,
            nation: p.nation_name,
            emoji: p.nation_emoji,
            rating: p.rating,
            level: p.level,
            doctrine: p.doctrine
          }))
        },
        aiDirectives: regionAiEvents.length > 0 ? regionAiEvents : allAiEvents.slice(0, 5)
      });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  logger.ok('Rotas REST registradas (Central de Comando Live Ops & Moderação Ativa)');
  return { models, mm, aiDirector };
}
