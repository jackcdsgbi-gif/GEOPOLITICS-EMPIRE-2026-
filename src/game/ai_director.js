/**
 * AI DIRECTOR — Antagonista Avançada com Rubber-Banding e 8 Arquétipos
 * Controla NPCs, potências mundiais simuladas e eventos geopolíticos em tempo real.
 */
import { logger } from '../logger.js';

export const AI_ARCHETYPES = {
  AGRESSIVO: {
    name: 'Agressivo',
    weightPvp: 1.8,
    weightDefense: 0.6,
    weightEconomy: 0.8,
    actionDesc: 'preparando mobilização tática e incursões de fronteira'
  },
  DIPLOMATA: {
    name: 'Diplomata',
    weightPvp: 0.3,
    weightDefense: 1.1,
    weightEconomy: 1.4,
    actionDesc: 'costurando tratados multilaterais e acordos de livre comércio'
  },
  ECONOMICO: {
    name: 'Econômico',
    weightPvp: 0.5,
    weightDefense: 0.9,
    weightEconomy: 2.0,
    actionDesc: 'acumulando reservas cambiais e expandindo parque industrial'
  },
  ISOLACIONISTA: {
    name: 'Isolacionista',
    weightPvp: 0.2,
    weightDefense: 1.8,
    weightEconomy: 1.1,
    actionDesc: 'reforçando barreiras alfandegárias e soberania territorial'
  },
  TECNOCRATA: {
    name: 'Tecnocrata',
    weightPvp: 0.9,
    weightDefense: 1.2,
    weightEconomy: 1.6,
    actionDesc: 'acelerando P&D de semicondutores e enxames autônomos'
  },
  MERCANTILISTA: {
    name: 'Mercantilista',
    weightPvp: 0.7,
    weightDefense: 0.8,
    weightEconomy: 1.9,
    actionDesc: 'manipulando cotações de commodities e rotas marítimas'
  },
  EXPANSIONISTA: {
    name: 'Expansionista',
    weightPvp: 1.5,
    weightDefense: 0.7,
    weightEconomy: 1.5,
    actionDesc: 'anexando concessões minerais e fundando novos complexos fabris'
  },
  DEFENSIVO: {
    name: 'Defensivo',
    weightPvp: 0.3,
    weightDefense: 2.2,
    weightEconomy: 1.2,
    actionDesc: 'elevando prontidão das baterias anti-míssil e anéis de defesa'
  }
};

export const MAJOR_NPCS = [
  { id: 'npc_usa', name: 'Estados Unidos', flag: '🇺🇸', archetype: 'TECNOCRATA', tier: 'top', gdpMult: 1.35 },
  { id: 'npc_chn', name: 'China', flag: '🇨🇳', archetype: 'EXPANSIONISTA', tier: 'top', gdpMult: 1.30 },
  { id: 'npc_rus', name: 'Rússia', flag: '🇷🇺', archetype: 'AGRESSIVO', tier: 'top', gdpMult: 1.15 },
  { id: 'npc_eu', name: 'União Europeia', flag: '🇪🇺', archetype: 'DIPLOMATA', tier: 'mid', gdpMult: 0.95 },
  { id: 'npc_ind', name: 'Índia', flag: '🇮🇳', archetype: 'MERCANTILISTA', tier: 'mid', gdpMult: 0.90 },
  { id: 'npc_jpn', name: 'Japão', flag: '🇯🇵', archetype: 'TECNOCRATA', tier: 'mid', gdpMult: 0.85 },
  { id: 'npc_bra', name: 'Brasil', flag: '🇧🇷', archetype: 'DIPLOMATA', tier: 'mid', gdpMult: 0.80 },
  { id: 'npc_sau', name: 'Arábia Saudita', flag: '🇸🇦', archetype: 'MERCANTILISTA', tier: 'mid', gdpMult: 0.75 },
  { id: 'npc_aus', name: 'Austrália', flag: '🇦🇺', archetype: 'ISOLACIONISTA', tier: 'mid', gdpMult: 0.70 },
  { id: 'npc_zaf', name: 'África do Sul', flag: '🇿🇦', archetype: 'ECONOMICO', tier: 'bottom', gdpMult: 0.45 },
  { id: 'npc_tur', name: 'Turquia', flag: '🇹🇷', archetype: 'EXPANSIONISTA', tier: 'bottom', gdpMult: 0.40 },
  { id: 'npc_arg', name: 'Argentina', flag: '🇦🇷', archetype: 'DEFENSIVO', tier: 'bottom', gdpMult: 0.35 },
  { id: 'npc_idn', name: 'Indonésia', flag: '🇮🇩', archetype: 'ECONOMICO', tier: 'bottom', gdpMult: 0.30 },
  { id: 'npc_kor', name: 'Coreia do Sul', flag: '🇰🇷', archetype: 'TECNOCRATA', tier: 'mid', gdpMult: 0.82 }
];

export class AiDirector {
  constructor(db, io) {
    this.db = db;
    this.io = io;
    this.npcs = new Map();
    this.eventHistory = [];
    this.tickInterval = null;
    this.isPaused = false;
    this.aggressionMultiplier = 1.0;
    this._initNpcs();
  }

  updatePlayerMetrics(capital, power, gdp) {
    this.externalPlayerCapital = Math.max(this.externalPlayerCapital || 0, Number(capital) || 0);
    this.externalPlayerPower = Math.max(this.externalPlayerPower || 0, Number(power) || 0);
    this.externalPlayerGdp = Math.max(this.externalPlayerGdp || 0, Number(gdp) || 0);
    this.rebalanceRubberBanding();
  }

  _initNpcs() {
    for (const def of MAJOR_NPCS) {
      this.npcs.set(def.id, {
        ...def,
        powerPoints: 1000,
        gdp: 100_000,
        rating: 1000,
        facilitiesCount: 15,
        blocId: null,
        defcon: 5,
        nuclearReadiness: 1,
        lastActionTs: Date.now()
      });
    }
  }

  /**
   * Executa Rubber-Banding em relação ao jogador humano mais forte
   */
  rebalanceRubberBanding() {
    // 1. Busca o jogador de maior PP/GDP no banco
    let topPlayer = this.topPlayer || null;
    try {
      if (this.db?.raw?.query) {
        this.db.raw.query(
          'SELECT id, username, gdp, peak_gdp, rating FROM players ORDER BY peak_gdp DESC LIMIT 1'
        ).then(res => {
          if (res?.rows?.[0]) {
            this.topPlayer = res.rows[0];
          }
        }).catch(() => {});
      }
    } catch(e) {}

    const baselineGdp = Math.max(50_000, this.externalPlayerCapital || 0, topPlayer?.peak_gdp || 0, (this.externalPlayerGdp || 0) * 24);
    const baselineRating = topPlayer?.rating || 1000;
    const baselinePP = Math.max(500, this.externalPlayerPower || 0, (baselineGdp / 1000) + (baselineRating * 2));

    for (const [id, npc] of this.npcs.entries()) {
      let targetRatio = 1.0;

      // Top Tier: 110% - 140% do jogador
      if (npc.tier === 'top') {
        targetRatio = 1.10 + (Math.random() * 0.30);
      }
      // Mid Tier: 60% - 100% do jogador
      else if (npc.tier === 'mid') {
        targetRatio = 0.60 + (Math.random() * 0.40);
      }
      // Bottom Tier: 20% - 50%
      else {
        targetRatio = 0.20 + (Math.random() * 0.30);
      }

      const calculatedPP = baselinePP * targetRatio;
      npc.powerPoints = Math.round(calculatedPP);
      npc.gdp = Math.round(baselineGdp * targetRatio);
      npc.rating = Math.round(baselineRating * (0.85 + (targetRatio * 0.25)));
    }
  }

  /**
   * Gera uma ação autônoma da IA com base na personalidade
   */
  generateAutonomousAction() {
    const npcList = Array.from(this.npcs.values());
    const actor = npcList[Math.floor(Math.random() * npcList.length)];
    const target = npcList[Math.floor(Math.random() * npcList.length)];

    const actions = [
      () => this._actionSatellites(actor),
      () => this._actionEmbargo(actor, target),
      () => this._actionExpansion(actor),
      () => this._actionTreaty(actor, target),
      () => this._actionMarketManipulation(actor),
      () => this._actionDefconShift(actor),
      () => this._actionRareEarthDeal(actor, target)
    ];

    const chosenAction = actions[Math.floor(Math.random() * actions.length)];
    const event = chosenAction();

    if (event) {
      this.eventHistory.unshift(event);
      if (this.eventHistory.length > 100) this.eventHistory.pop();

      // Loga no banco do servidor
      try {
        this.db.raw.prepare(
          'INSERT INTO events (type, player_id, bloc_id, payload) VALUES (?, ?, ?, ?)'
        ).run('ai_director_event', null, null, JSON.stringify(event));
      } catch (e) {
        // silencia se tabela já ocupada
      }

      // Emite via Socket.io para clientes conectados
      if (this.io) {
        this.io.emit('ai:event', event);
      }

      logger.game(`[AI DIRECTOR] ${event.headline}`);
    }
  }

  _actionSatellites(actor) {
    actor.powerPoints += 50;
    return {
      id: 'ai_' + Date.now(),
      type: 'defense',
      actor: actor.name,
      flag: actor.flag,
      headline: `${actor.flag} ${actor.name} lançou satélite militar espião de órbita baixa.`,
      details: 'Capacidade de inteligência de teatro e dissuasão ampliada em +15%.',
      ts: Date.now()
    };
  }

  _actionEmbargo(actor, target) {
    if (actor.id === target.id) return null;
    return {
      id: 'ai_' + Date.now(),
      type: 'crisis',
      actor: actor.name,
      flag: actor.flag,
      headline: `${actor.flag} ${actor.name} impôs embargo comercial aos derivados energéticos de ${target.flag} ${target.name}.`,
      details: 'Preço internacional de hidrocarbonetos oscilando com volatilidade de 8.5%.',
      ts: Date.now()
    };
  }

  _actionExpansion(actor) {
    actor.facilitiesCount += 3;
    return {
      id: 'ai_' + Date.now(),
      type: 'industrial',
      actor: actor.name,
      flag: actor.flag,
      headline: `${actor.flag} ${actor.name} inaugurou megacomplexo de refino de lítio e semicondutores.`,
      details: 'Parque industrial expandido sem limite de slots territoriais.',
      ts: Date.now()
    };
  }

  _actionTreaty(actor, target) {
    if (actor.id === target.id) return null;
    return {
      id: 'ai_' + Date.now(),
      type: 'diplomacy',
      actor: actor.name,
      flag: actor.flag,
      headline: `${actor.flag} ${actor.name} assinou Tratado de Não-Proliferação com ${target.flag} ${target.name}.`,
      details: 'Risco de crise bilateral reduzido e estabilidade geopolítica fortificada.',
      ts: Date.now()
    };
  }

  _actionMarketManipulation(actor) {
    return {
      id: 'ai_' + Date.now(),
      type: 'market',
      actor: actor.name,
      flag: actor.flag,
      headline: `${actor.flag} ${actor.name} comprou grandes estoques de Neodímio e Térbio.`,
      details: 'Cotação global das Terras Raras em alta de +12.4% no mercado agregado.',
      ts: Date.now()
    };
  }

  _actionDefconShift(actor) {
    const levels = [4, 3, 2];
    const newDefcon = levels[Math.floor(Math.random() * levels.length)];
    actor.defcon = newDefcon;
    return {
      id: 'ai_' + Date.now(),
      type: 'alert',
      actor: actor.name,
      flag: actor.flag,
      headline: `🚨 ${actor.flag} ${actor.name} alterou prontidão estratégica para DEFCON ${newDefcon}!`,
      details: 'Forças de prontidão aérea e cibercomando em patrulhamento de alta vigilância.',
      ts: Date.now()
    };
  }

  _actionRareEarthDeal(actor, target) {
    if (actor.id === target.id) return null;
    return {
      id: 'ai_' + Date.now(),
      type: 'trade',
      actor: actor.name,
      flag: actor.flag,
      headline: `${actor.flag} ${actor.name} firmou aliança de terras raras e baterias com ${target.flag} ${target.name}.`,
      details: 'Dominância na cadeia de suprimentos de veículos elétricos e semicondutores.',
      ts: Date.now()
    };
  }

  startLoop(intervalMs = 12000) {
    if (this.tickInterval) return;
    this.rebalanceRubberBanding();
    this.tickInterval = setInterval(() => {
      if (this.isPaused) return;
      this.rebalanceRubberBanding();
      this.generateAutonomousAction();
    }, intervalMs);
    logger.ok('IA Diretora Antagonista ativa (Loop de simulação em tempo real)');
  }

  stopLoop() {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    logger.info(`[AI Director] Simulação ${this.isPaused ? 'PAUSADA' : 'RETOMADA'}`);
    return this.getState();
  }

  setAggression(multiplier) {
    const val = Math.max(0.1, Math.min(3.0, Number(multiplier) || 1.0));
    this.aggressionMultiplier = Number(val.toFixed(2));
    logger.info(`[AI Director] Agressividade alterada para ${this.aggressionMultiplier}x`);
    return this.getState();
  }

  getState() {
    return {
      isPaused: this.isPaused,
      aggression: this.aggressionMultiplier,
      npcCount: this.npcs.size,
      eventsCount: this.eventHistory.length
    };
  }

  getNpcs() {
    return Array.from(this.npcs.values());
  }

  getFeed(limit = 20) {
    return this.eventHistory.slice(0, limit);
  }
}
