import pg from 'pg';
import { config } from './config.js';
import { logger } from './logger.js';

const { Pool } = pg;

export async function initDb() {
  const connectionString = config.databaseUrl || process.env.DATABASE_URL;

  if (!connectionString) {
    logger.warn('DATABASE_URL não encontrada nas variáveis de ambiente!');
  }

  const pool = new Pool({
    connectionString,
    ssl: connectionString && (connectionString.includes('render.com') || !connectionString.includes('localhost'))
      ? { rejectUnauthorized: false }
      : false,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000
  });

  // Testa conexão e cria as tabelas caso não existam
  let client;
  try {
    client = await pool.connect();
    logger.info('Conectado ao PostgreSQL. Inicializando schemas...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS players (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        nation_name VARCHAR(100),
        nation_emoji VARCHAR(10) DEFAULT '🌐',
        doctrine VARCHAR(30) DEFAULT 'neutral',
        bloc_id INTEGER,
        bloc_role VARCHAR(30) DEFAULT 'member',
        role VARCHAR(20) DEFAULT 'player',
        email VARCHAR(100),
        level INTEGER DEFAULT 0,
        xp DOUBLE PRECISION DEFAULT 0,
        gdp DOUBLE PRECISION DEFAULT 0,
        peak_gdp DOUBLE PRECISION DEFAULT 0,
        influence DOUBLE PRECISION DEFAULT 0,
        stability DOUBLE PRECISION DEFAULT 100,
        legacy DOUBLE PRECISION DEFAULT 0,
        base_multiplier DOUBLE PRECISION DEFAULT 1.0,
        resets INTEGER DEFAULT 0,
        rating INTEGER DEFAULT 1000,
        peak_rating INTEGER DEFAULT 1000,
        wins INTEGER DEFAULT 0,
        losses INTEGER DEFAULT 0,
        total_earned DOUBLE PRECISION DEFAULT 0,
        shield_until BIGINT DEFAULT 0,
        last_seen BIGINT DEFAULT 0,
        last_sync BIGINT DEFAULT 0,
        created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
        season_id INTEGER DEFAULT 1,
        state_json TEXT DEFAULT '{}',
        flags INTEGER DEFAULT 0,
        pvp_blocked_until BIGINT DEFAULT 0,
        is_banned BOOLEAN DEFAULT false,
        continent VARCHAR(30) DEFAULT 'South America'
      );

      ALTER TABLE players ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'player';
      ALTER TABLE players ADD COLUMN IF NOT EXISTS email VARCHAR(100);
      ALTER TABLE players ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false;
      ALTER TABLE players ADD COLUMN IF NOT EXISTS continent VARCHAR(30) DEFAULT 'South America';

      CREATE INDEX IF NOT EXISTS idx_players_rating ON players(rating DESC);
      CREATE INDEX IF NOT EXISTS idx_players_bloc ON players(bloc_id);
      CREATE INDEX IF NOT EXISTS idx_players_gdp ON players(gdp DESC);
      CREATE INDEX IF NOT EXISTS idx_players_peak ON players(peak_gdp DESC);
      CREATE INDEX IF NOT EXISTS idx_players_role ON players(role);
      CREATE INDEX IF NOT EXISTS idx_players_banned ON players(is_banned);
      CREATE INDEX IF NOT EXISTS idx_players_role_banned ON players(role, is_banned);
      CREATE INDEX IF NOT EXISTS idx_players_email ON players(email);

      CREATE TABLE IF NOT EXISTS blocs (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        emoji VARCHAR(10) DEFAULT '🛡️',
        doctrine VARCHAR(30) DEFAULT 'market',
        leader_id INTEGER,
        treasury DOUBLE PRECISION DEFAULT 0,
        influence DOUBLE PRECISION DEFAULT 0,
        power DOUBLE PRECISION DEFAULT 0,
        color VARCHAR(30) DEFAULT '#1E3A8A',
        description TEXT DEFAULT '',
        is_preset INTEGER DEFAULT 0,
        member_limit INTEGER DEFAULT 50,
        created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
      );

      CREATE INDEX IF NOT EXISTS idx_blocs_power ON blocs(power DESC);

      CREATE TABLE IF NOT EXISTS bloc_relations (
        bloc_a INTEGER,
        bloc_b INTEGER,
        relation INTEGER DEFAULT 0,
        status VARCHAR(30) DEFAULT 'neutral',
        updated_at BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
        PRIMARY KEY (bloc_a, bloc_b)
      );

      CREATE TABLE IF NOT EXISTS matches (
        id SERIAL PRIMARY KEY,
        attacker_id INTEGER NOT NULL,
        defender_id INTEGER NOT NULL,
        status VARCHAR(30) DEFAULT 'active',
        winner_id INTEGER,
        attacker_power DOUBLE PRECISION DEFAULT 0,
        defender_power DOUBLE PRECISION DEFAULT 0,
        stolen_gdp DOUBLE PRECISION DEFAULT 0,
        rating_delta INTEGER DEFAULT 0,
        created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
        resolved_at BIGINT,
        state_json TEXT DEFAULT '{}'
      );

      CREATE INDEX IF NOT EXISTS idx_matches_attacker ON matches(attacker_id, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_matches_defender ON matches(defender_id, created_at DESC);

      CREATE TABLE IF NOT EXISTS seasons (
        id INTEGER PRIMARY KEY,
        started_at BIGINT,
        ends_at BIGINT,
        status VARCHAR(30) DEFAULT 'active',
        champion_id INTEGER,
        champion_snapshot TEXT DEFAULT '{}'
      );

      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        player_id INTEGER,
        bloc_id INTEGER,
        payload TEXT DEFAULT '{}',
        created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
      );

      CREATE INDEX IF NOT EXISTS idx_events_type ON events(type, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_events_created ON events(created_at DESC);

      CREATE TABLE IF NOT EXISTS audit_log (
        id SERIAL PRIMARY KEY,
        event VARCHAR(50) NOT NULL,
        player_id INTEGER,
        username VARCHAR(50),
        country VARCHAR(10) DEFAULT 'XX',
        ip VARCHAR(100),
        level INTEGER DEFAULT 0,
        gdp DOUBLE PRECISION DEFAULT 0,
        payload TEXT DEFAULT '{}',
        created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
      );

      ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS player_id INTEGER;
      ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS username VARCHAR(50);
      ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS country VARCHAR(10) DEFAULT 'XX';
      ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS ip VARCHAR(100);
      ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 0;
      ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS gdp DOUBLE PRECISION DEFAULT 0;

      CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_audit_log_country ON audit_log(country);
      CREATE INDEX IF NOT EXISTS idx_audit_log_player ON audit_log(player_id);
      CREATE INDEX IF NOT EXISTS idx_audit_log_created_country ON audit_log(created_at DESC, country);
      CREATE INDEX IF NOT EXISTS idx_audit_log_event_created ON audit_log(event, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_audit_log_player_created ON audit_log(player_id, created_at DESC);
    `);

    // Atualiza permissão do administrador no banco
    await client.query(`
      UPDATE players
      SET role = 'admin'
      WHERE email = 'jackcdsgbi@gmail.com'
         OR username = 'jackcdsgbi@gmail.com'
         OR username = 'jackcdsgbi-gif'
    `);

    // Temporada ativa padrão
    const seasonRes = await client.query("SELECT * FROM seasons WHERE status = 'active' LIMIT 1");
    if (seasonRes.rows.length === 0) {
      const now = Date.now();
      await client.query(
        'INSERT INTO seasons (id, started_at, ends_at, status) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING',
        [1, now, now + config.seasonDays * 86400_000, 'active']
      );
      logger.info('Temporada 1 iniciada no PostgreSQL');
    }

    // Seed de blocos pré-definidos
    await seedPresetBlocs(client);

    logger.ok('Banco PostgreSQL pronto e tabelas sincronizadas');
  } catch (err) {
    logger.error('Falha ao conectar/inicializar o PostgreSQL:', err.message);
    if (!connectionString) {
      logger.warn('Para conectar localmente ao PostgreSQL, adicione a DATABASE_URL no seu arquivo .env');
    } else {
      throw err;
    }
  } finally {
    if (client) client.release();
  }

  const dbInstance = {
    raw: pool,
    pool,
    async query(text, params) {
      return pool.query(text, params);
    },
    async one(text, params) {
      const res = await pool.query(text, params);
      return res.rows[0] || null;
    },
    async all(text, params) {
      const res = await pool.query(text, params);
      return res.rows;
    },
    season: {
      async current() {
        const res = await pool.query("SELECT * FROM seasons WHERE status = 'active' LIMIT 1");
        return res.rows[0] || null;
      },
      async rollIfDue() {
        const cur = await this.current();
        if (!cur) return 1;
        if (Date.now() > Number(cur.ends_at)) {
          const champRes = await pool.query('SELECT * FROM players ORDER BY rating DESC LIMIT 1');
          const champion = champRes.rows[0];
          await pool.query(
            'UPDATE seasons SET status = $1, champion_id = $2, champion_snapshot = $3, ends_at = $4 WHERE id = $5',
            ['ended', champion?.id || null, JSON.stringify(champion || {}), Date.now(), cur.id]
          );
          const nextId = Number(cur.id) + 1;
          const now = Date.now();
          await pool.query(
            'INSERT INTO seasons (id, started_at, ends_at, status) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING',
            [nextId, now, now + config.seasonDays * 86400_000, 'active']
          );
          await pool.query('UPDATE players SET season_id = $1', [nextId]);
          logger.game(`Temporada ${nextId} iniciada. Campeão anterior: ${champion?.username || '—'}`);
          return nextId;
        }
        return Number(cur.id);
      },
      async history() {
        const res = await pool.query('SELECT * FROM seasons ORDER BY id DESC LIMIT 10');
        return res.rows;
      }
    }
  };

  return dbInstance;
}

async function seedPresetBlocs(client) {
  const presets = [
    { name: 'Coalizão dos Cinco', emoji: '🌐', doctrine: 'market', color: '#1E3A8A', desc: 'Bloco econômico das cinco maiores potências industriais. Domina o comércio global.' },
    { name: 'Federação Emergente', emoji: '🚀', doctrine: 'tech', color: '#5B21B6', desc: 'Bloco tecnológico em rápida expansão. Líder em P&D e inovação.' },
    { name: 'Cartel Energético', emoji: '🛢️', doctrine: 'energy', color: '#D97706', desc: 'Controla as principais rotas de hidrocarbonetos. Preços do petróleo sob seu domínio.' },
    { name: 'União Atlântica', emoji: '⚓', doctrine: 'military', color: '#0E7490', desc: 'Aliança militar e naval transatlântica. Poder de dissuasão incomparável.' },
    { name: 'Aliança do Pacífico', emoji: '🌊', doctrine: 'trade', color: '#0891B2', desc: 'Bloco comercial das rotas do Pacífico. Conecta Ásia, Oceania e Américas.' },
    { name: 'Consórcio de Terras Raras', emoji: '🧲', doctrine: 'industrial', color: '#7C3AED', desc: 'Monopólio estratégico de minerais críticos. Controla a cadeia de semicondutores.' }
  ];

  const countRes = await client.query('SELECT COUNT(*) AS c FROM blocs WHERE is_preset = 1');
  const count = Number(countRes.rows[0]?.c || 0);
  if (count === 0) {
    for (const p of presets) {
      await client.query(
        `INSERT INTO blocs (name, emoji, doctrine, color, description, is_preset)
         VALUES ($1, $2, $3, $4, $5, 1)
         ON CONFLICT (name) DO NOTHING`,
        [p.name, p.emoji, p.doctrine, p.color, p.desc]
      );
    }
    logger.ok(`${presets.length} blocos pré-definidos criados`);
  }
}
