import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { config } from './config.js';
import { logger } from './logger.js';

export function initDb() {
  fs.mkdirSync(path.dirname(config.dbPath), { recursive: true });
  const db = new Database(config.dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.pragma('synchronous = NORMAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      nation_name TEXT,
      nation_emoji TEXT DEFAULT '🌐',
      doctrine TEXT DEFAULT 'neutral',
      bloc_id INTEGER,
      bloc_role TEXT DEFAULT 'member',
      level INTEGER DEFAULT 0,
      xp REAL DEFAULT 0,
      gdp REAL DEFAULT 0,
      peak_gdp REAL DEFAULT 0,
      influence REAL DEFAULT 0,
      stability REAL DEFAULT 100,
      legacy REAL DEFAULT 0,
      base_multiplier REAL DEFAULT 1.0,
      resets INTEGER DEFAULT 0,
      rating INTEGER DEFAULT 1000,
      peak_rating INTEGER DEFAULT 1000,
      wins INTEGER DEFAULT 0,
      losses INTEGER DEFAULT 0,
      total_earned REAL DEFAULT 0,
      shield_until INTEGER DEFAULT 0,
      last_seen INTEGER DEFAULT 0,
      last_sync INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (unixepoch()*1000),
      season_id INTEGER DEFAULT 1,
      state_json TEXT DEFAULT '{}',
      flags INTEGER DEFAULT 0,
      pvp_blocked_until INTEGER DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_players_rating ON players(rating DESC);
    CREATE INDEX IF NOT EXISTS idx_players_bloc ON players(bloc_id);
    CREATE INDEX IF NOT EXISTS idx_players_gdp ON players(gdp DESC);
    CREATE INDEX IF NOT EXISTS idx_players_peak ON players(peak_gdp DESC);

    CREATE TABLE IF NOT EXISTS blocs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      emoji TEXT DEFAULT '🛡️',
      doctrine TEXT DEFAULT 'market',
      leader_id INTEGER,
      treasury REAL DEFAULT 0,
      influence REAL DEFAULT 0,
      power REAL DEFAULT 0,
      color TEXT DEFAULT '#1E3A8A',
      description TEXT DEFAULT '',
      is_preset INTEGER DEFAULT 0,
      member_limit INTEGER DEFAULT 50,
      created_at INTEGER DEFAULT (unixepoch()*1000)
    );

    CREATE INDEX IF NOT EXISTS idx_blocs_power ON blocs(power DESC);

    CREATE TABLE IF NOT EXISTS bloc_relations (
      bloc_a INTEGER,
      bloc_b INTEGER,
      relation INTEGER DEFAULT 0,
      status TEXT DEFAULT 'neutral',
      updated_at INTEGER DEFAULT (unixepoch()*1000),
      PRIMARY KEY (bloc_a, bloc_b)
    );

    CREATE TABLE IF NOT EXISTS matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      attacker_id INTEGER NOT NULL,
      defender_id INTEGER NOT NULL,
      status TEXT DEFAULT 'active',
      winner_id INTEGER,
      attacker_power REAL DEFAULT 0,
      defender_power REAL DEFAULT 0,
      stolen_gdp REAL DEFAULT 0,
      rating_delta INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (unixepoch()*1000),
      resolved_at INTEGER,
      state_json TEXT DEFAULT '{}'
    );

    CREATE INDEX IF NOT EXISTS idx_matches_attacker ON matches(attacker_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_matches_defender ON matches(defender_id, created_at DESC);

    CREATE TABLE IF NOT EXISTS seasons (
      id INTEGER PRIMARY KEY,
      started_at INTEGER,
      ends_at INTEGER,
      status TEXT DEFAULT 'active',
      champion_id INTEGER,
      champion_snapshot TEXT DEFAULT '{}'
    );

    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      player_id INTEGER,
      bloc_id INTEGER,
      payload TEXT DEFAULT '{}',
      created_at INTEGER DEFAULT (unixepoch()*1000)
    );

    CREATE INDEX IF NOT EXISTS idx_events_type ON events(type, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_events_created ON events(created_at DESC);
  `);

  const season = db.prepare("SELECT * FROM seasons WHERE status = 'active'").get();
  if (!season) {
    const now = Date.now();
    db.prepare('INSERT INTO seasons (id, started_at, ends_at, status) VALUES (?, ?, ?, ?)')
      .run(1, now, now + config.seasonDays * 86400_000, 'active');
    logger.info('Temporada 1 iniciada');
  }

  seedPresetBlocs(db);
  logger.ok('Banco pronto:', config.dbPath);

  return {
    raw: db,
    season: {
      current() {
        return db.prepare("SELECT * FROM seasons WHERE status = 'active'").get();
      },
      rollIfDue() {
        const cur = this.current();
        if (!cur) return 1;
        if (Date.now() > cur.ends_at) {
          const champion = db.prepare('SELECT * FROM players ORDER BY rating DESC LIMIT 1').get();
          db.prepare('UPDATE seasons SET status = ?, champion_id = ?, champion_snapshot = ?, ends_at = ? WHERE id = ?')
            .run('ended', champion?.id || null, JSON.stringify(champion || {}), Date.now(), cur.id);
          const nextId = cur.id + 1;
          const now = Date.now();
          db.prepare('INSERT INTO seasons (id, started_at, ends_at, status) VALUES (?, ?, ?, ?)')
            .run(nextId, now, now + config.seasonDays * 86400_000, 'active');
          db.prepare('UPDATE players SET season_id = ?').run(nextId);
          logger.game(`Temporada ${nextId} iniciada. Campeão anterior: ${champion?.username || '—'}`);
          return nextId;
        }
        return cur.id;
      },
      history() {
        return db.prepare('SELECT * FROM seasons ORDER BY id DESC LIMIT 10').all();
      }
    }
  };
}

function seedPresetBlocs(db) {
  const presets = [
    { name: 'Coalizão dos Cinco', emoji: '🌐', doctrine: 'market', color: '#1E3A8A', desc: 'Bloco econômico das cinco maiores potências industriais. Domina o comércio global.' },
    { name: 'Federação Emergente', emoji: '🚀', doctrine: 'tech', color: '#5B21B6', desc: 'Bloco tecnológico em rápida expansão. Líder em P&D e inovação.' },
    { name: 'Cartel Energético', emoji: '🛢️', doctrine: 'energy', color: '#D97706', desc: 'Controla as principais rotas de hidrocarbonetos. Preços do petróleo sob seu domínio.' },
    { name: 'União Atlântica', emoji: '⚓', doctrine: 'military', color: '#0E7490', desc: 'Aliança militar e naval transatlântica. Poder de dissuasão incomparável.' },
    { name: 'Aliança do Pacífico', emoji: '🌊', doctrine: 'trade', color: '#0891B2', desc: 'Bloco comercial das rotas do Pacífico. Conecta Ásia, Oceania e Américas.' },
    { name: 'Consórcio de Terras Raras', emoji: '🧲', doctrine: 'industrial', color: '#7C3AED', desc: 'Monopólio estratégico de minerais críticos. Controla a cadeia de semicondutores.' }
  ];

  const count = db.prepare('SELECT COUNT(*) AS c FROM blocs WHERE is_preset = 1').get().c;
  if (count === 0) {
    const ins = db.prepare(`INSERT INTO blocs (name, emoji, doctrine, color, description, is_preset) VALUES (?,?,?,?,?,1)`);
    for (const p of presets) ins.run(p.name, p.emoji, p.doctrine, p.color, p.desc);
    logger.ok(`${presets.length} blocos pré-definidos criados`);
  }
}
