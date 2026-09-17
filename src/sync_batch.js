import { logger } from './logger.js';

class SyncBatchManager {
  constructor() {
    this.playerCache = new Map(); // id -> player object
    this.dirtyPlayers = new Map(); // id -> patch object
    this.pendingAuditLogs = [];
    this.intervalId = null;
    this.isFlushing = false;
  }

  /**
   * Armazena ou atualiza dados de um jogador no cache em memória
   */
  cachePlayer(player) {
    if (!player || !player.id) return;
    const existing = this.playerCache.get(Number(player.id)) || {};
    this.playerCache.set(Number(player.id), { ...existing, ...player });
  }

  /**
   * Obtém o jogador do cache (ou null se não estiver em memória)
   */
  getCachedPlayer(playerId) {
    return this.playerCache.get(Number(playerId)) || null;
  }

  /**
   * Atualiza campos específicos de um jogador no cache
   * Usado por ações administrativas (bônus, ban, troca de bloco) e PvP
   */
  updateCachedPlayer(playerId, updates) {
    const id = Number(playerId);
    if (this.playerCache.has(id)) {
      const current = this.playerCache.get(id);
      this.playerCache.set(id, { ...current, ...updates });
    }
  }

  /**
   * Registra a sincronização do jogador em memória e marca para gravação em lote
   */
  stagePlayerSync(playerId, patch, geoData, fallbackDbPlayer) {
    const id = Number(playerId);
    const existing = this.playerCache.get(id) || fallbackDbPlayer || { id };

    const now = Date.now();
    const gdp = patch.gdp !== undefined ? Number(patch.gdp) : Number(existing.gdp || 0);
    const total_earned = patch.total_earned !== undefined ? Number(patch.total_earned) : Number(existing.total_earned || 0);
    const currentPeak = Math.max(Number(existing.peak_gdp) || 0, gdp, total_earned);

    const updated = {
      ...existing,
      id,
      level: patch.level !== undefined ? Number(patch.level) : (existing.level || 0),
      xp: patch.xp !== undefined ? Number(patch.xp) : (existing.xp || 0),
      gdp,
      peak_gdp: currentPeak,
      influence: patch.influence !== undefined ? Number(patch.influence) : (existing.influence || 0),
      stability: patch.stability !== undefined ? Number(patch.stability) : (existing.stability || 100),
      legacy: patch.legacy !== undefined ? Number(patch.legacy) : (existing.legacy || 0),
      base_multiplier: patch.base_multiplier !== undefined ? Number(patch.base_multiplier) : (existing.base_multiplier || 1.0),
      resets: patch.resets !== undefined ? Number(patch.resets) : (existing.resets || 0),
      total_earned,
      state_json: patch.state_json ? (typeof patch.state_json === 'string' ? patch.state_json : JSON.stringify(patch.state_json)) : (existing.state_json || '{}'),
      continent: geoData.continent || existing.continent || 'South America',
      last_sync: now,
      last_seen: now
    };

    // Atualiza cache em memória
    this.playerCache.set(id, updated);

    // Marca como dirty para o próximo ciclo de flush
    const prevDirty = this.dirtyPlayers.get(id) || {};
    this.dirtyPlayers.set(id, {
      ...prevDirty,
      id,
      level: updated.level,
      xp: updated.xp,
      gdp: updated.gdp,
      peak_gdp: updated.peak_gdp,
      influence: updated.influence,
      stability: updated.stability,
      legacy: updated.legacy,
      base_multiplier: updated.base_multiplier,
      resets: updated.resets,
      total_earned: updated.total_earned,
      state_json: updated.state_json,
      continent: updated.continent,
      last_sync: updated.last_sync,
      last_seen: updated.last_seen
    });

    // Enfileira log de auditoria em memória
    this.pendingAuditLogs.push({
      event: 'sync',
      player_id: id,
      username: updated.username || existing.username || 'unknown',
      country: geoData.country || 'XX',
      ip: geoData.ip || '',
      level: updated.level,
      gdp: updated.gdp,
      payload: {
        peak_gdp: currentPeak,
        total_earned: updated.total_earned,
        resets: updated.resets,
        continent: updated.continent
      },
      created_at: now
    });

    return updated;
  }

  /**
   * Grava todas as alterações acumuladas em lote no PostgreSQL
   */
  async flush(db) {
    if (this.isFlushing) return { updated: 0, logs: 0 };
    if (this.dirtyPlayers.size === 0 && this.pendingAuditLogs.length === 0) {
      return { updated: 0, logs: 0 };
    }

    this.isFlushing = true;
    const playersToUpdate = Array.from(this.dirtyPlayers.values());
    this.dirtyPlayers.clear();

    const logsToInsert = this.pendingAuditLogs.splice(0, this.pendingAuditLogs.length);

    try {
      // 1. Escrita em lote dos jogadores no PostgreSQL
      if (playersToUpdate.length > 0 && db?.raw?.query) {
        const recordsJson = JSON.stringify(playersToUpdate.map(p => ({
          id: Number(p.id),
          level: p.level !== undefined ? Number(p.level) : null,
          xp: p.xp !== undefined ? Number(p.xp) : null,
          gdp: p.gdp !== undefined ? Number(p.gdp) : null,
          peak_gdp: p.peak_gdp !== undefined ? Number(p.peak_gdp) : null,
          influence: p.influence !== undefined ? Number(p.influence) : null,
          stability: p.stability !== undefined ? Number(p.stability) : null,
          legacy: p.legacy !== undefined ? Number(p.legacy) : null,
          base_multiplier: p.base_multiplier !== undefined ? Number(p.base_multiplier) : null,
          resets: p.resets !== undefined ? Number(p.resets) : null,
          total_earned: p.total_earned !== undefined ? Number(p.total_earned) : null,
          last_sync: p.last_sync !== undefined ? Number(p.last_sync) : null,
          last_seen: p.last_seen !== undefined ? Number(p.last_seen) : null,
          state_json: p.state_json !== undefined ? (typeof p.state_json === 'string' ? p.state_json : JSON.stringify(p.state_json)) : null,
          continent: p.continent || null
        })));

        try {
          // Otimização de alta performance: json_to_recordset em comando único
          await db.raw.query(`
            UPDATE players AS p
            SET
              level = COALESCE(v.level, p.level),
              xp = COALESCE(v.xp, p.xp),
              gdp = COALESCE(v.gdp, p.gdp),
              peak_gdp = GREATEST(p.peak_gdp, COALESCE(v.peak_gdp, p.peak_gdp)),
              influence = COALESCE(v.influence, p.influence),
              stability = COALESCE(v.stability, p.stability),
              legacy = COALESCE(v.legacy, p.legacy),
              base_multiplier = COALESCE(v.base_multiplier, p.base_multiplier),
              resets = COALESCE(v.resets, p.resets),
              total_earned = COALESCE(v.total_earned, p.total_earned),
              last_sync = COALESCE(v.last_sync, p.last_sync),
              last_seen = COALESCE(v.last_seen, p.last_seen),
              state_json = COALESCE(v.state_json, p.state_json),
              continent = COALESCE(v.continent, p.continent)
            FROM json_to_recordset($1::json) AS v(
              id integer,
              level integer,
              xp double precision,
              gdp double precision,
              peak_gdp double precision,
              influence double precision,
              stability double precision,
              legacy double precision,
              base_multiplier double precision,
              resets integer,
              total_earned double precision,
              last_sync bigint,
              last_seen bigint,
              state_json text,
              continent varchar
            )
            WHERE p.id = v.id;
          `, [recordsJson]);
        } catch (recordsetErr) {
          // Fallback para transação com queries individuais caso json_to_recordset falhe em ambientes de teste
          logger.warn('[Batch Write] Fallback para transação de updates:', recordsetErr.message);
          await db.raw.query('BEGIN');
          for (const p of playersToUpdate) {
            await db.raw.query(`
              UPDATE players
              SET level = COALESCE($1, level),
                  xp = COALESCE($2, xp),
                  gdp = COALESCE($3, gdp),
                  peak_gdp = GREATEST(peak_gdp, COALESCE($4, peak_gdp)),
                  influence = COALESCE($5, influence),
                  stability = COALESCE($6, stability),
                  legacy = COALESCE($7, legacy),
                  base_multiplier = COALESCE($8, base_multiplier),
                  resets = COALESCE($9, resets),
                  total_earned = COALESCE($10, total_earned),
                  last_sync = COALESCE($11, last_sync),
                  last_seen = COALESCE($12, last_seen),
                  state_json = COALESCE($13, state_json),
                  continent = COALESCE($14, continent)
              WHERE id = $15
            `, [
              p.level, p.xp, p.gdp, p.peak_gdp, p.influence, p.stability,
              p.legacy, p.base_multiplier, p.resets, p.total_earned,
              p.last_sync, p.last_seen, p.state_json, p.continent, p.id
            ]);
          }
          await db.raw.query('COMMIT');
        }

        logger.info(`[Batch Write] ${playersToUpdate.length} jogadores atualizados no PostgreSQL com sucesso`);
      }

      // 2. Escrita em lote dos logs de auditoria
      if (logsToInsert.length > 0 && db?.raw?.query) {
        const logsJson = JSON.stringify(logsToInsert.map(l => ({
          event: l.event || 'sync',
          player_id: l.player_id !== undefined ? l.player_id : null,
          username: l.username || null,
          country: l.country || 'XX',
          ip: l.ip || null,
          level: Number(l.level) || 0,
          gdp: Number(l.gdp) || 0,
          payload: typeof l.payload === 'string' ? l.payload : JSON.stringify(l.payload || {}),
          created_at: Number(l.created_at || Date.now())
        })));

        try {
          await db.raw.query(`
            INSERT INTO audit_log (event, player_id, username, country, ip, level, gdp, payload, created_at)
            SELECT
              v.event, v.player_id, v.username, v.country, v.ip, v.level, v.gdp, v.payload, v.created_at
            FROM json_to_recordset($1::json) AS v(
              event varchar,
              player_id integer,
              username varchar,
              country varchar,
              ip varchar,
              level integer,
              gdp double precision,
              payload text,
              created_at bigint
            );
          `, [logsJson]);
        } catch (logErr) {
          logger.warn('[Batch Write] Fallback para inserção de logs:', logErr.message);
          await db.raw.query('BEGIN');
          for (const l of logsToInsert) {
            await db.raw.query(`
              INSERT INTO audit_log (event, player_id, username, country, ip, level, gdp, payload, created_at)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `, [
              l.event || 'sync',
              l.player_id || null,
              l.username || null,
              l.country || 'XX',
              l.ip || null,
              Number(l.level) || 0,
              Number(l.gdp) || 0,
              typeof l.payload === 'string' ? l.payload : JSON.stringify(l.payload || {}),
              Number(l.created_at || Date.now())
            ]);
          }
          await db.raw.query('COMMIT');
        }

        logger.info(`[Batch Write] ${logsToInsert.length} logs de auditoria gravados no PostgreSQL com sucesso`);
      }

      return { updated: playersToUpdate.length, logs: logsToInsert.length };
    } catch (err) {
      logger.error('[Batch Write] Erro ao gravar lote no PostgreSQL:', err.message);
      // Re-enfileira os registros para não perder dados de jogadores
      for (const p of playersToUpdate) {
        if (!this.dirtyPlayers.has(p.id)) {
          this.dirtyPlayers.set(p.id, p);
        }
      }
      this.pendingAuditLogs.unshift(...logsToInsert);
      throw err;
    } finally {
      this.isFlushing = false;
    }
  }

  /**
   * Inicia o loop global de escrita a cada 30 segundos
   */
  startLoop(db, intervalMs = 30000) {
    if (this.intervalId) return;
    this.intervalId = setInterval(async () => {
      try {
        await this.flush(db);
      } catch (e) {
        logger.error('[Batch Loop] Erro no flush automático:', e.message);
      }
    }, intervalMs);
    logger.ok(`Sistema de Escrita em Lote (Write-Batching) iniciado (ciclo: ${intervalMs / 1000}s)`);
  }

  /**
   * Para o loop e força um flush final dos dados em memória
   */
  async stopLoop(db) {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (db) {
      logger.info('[Batch Write] Executando flush final antes do encerramento...');
      await this.flush(db);
    }
  }
}

export const syncBatch = new SyncBatchManager();
