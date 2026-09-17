/**
 * GEOPOLITICS EMPIRE 2026 — Core Game Engine
 * Zero-Start: $0 / Nível 0 / Fase I
 * Tempo acelerado: 1s real = 1h de jogo
 * Tap Engine, XP, Save/Load, Events, Production
 */

// ══════════════════════════════════════════
// SINTETIZADOR DE SOM (Web Audio API)
// ══════════════════════════════════════════
class SoundSynth {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.volume = 0.8; // Volume mestre 0.0 - 1.0
    this._lastLevelUpSound = 0;
  }
  _init() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) this.ctx = new AC();
    }
    if (this.ctx?.state === 'suspended') this.ctx.resume();
  }
  _play(freq, type='sine', dur=0.1, vol=0.15, freqEnd=null) {
    if (!this.enabled || this.volume <= 0) return;
    this._init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (freqEnd) osc.frequency.exponentialRampToValueAtTime(freqEnd, now + dur);
    const finalVol = Math.max(0.0001, vol * this.volume);
    gain.gain.setValueAtTime(finalVol, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(now); osc.stop(now + dur);
  }
  tap(isCrit=false) { this._play(isCrit?660:440,'sine',0.08,isCrit?0.25:0.15,isCrit?990:220); }
  build()    { [330,440,550,660].forEach((f,i)=>setTimeout(()=>this._play(f,'sine',0.12,0.12),i*60)); }
  levelUp()  {
    const now = Date.now();
    if (now - this._lastLevelUpSound < 1200) return; // Cooldown previne travamentos por saturação de áudio
    this._lastLevelUpSound = now;
    [523,659,784,1046].forEach((f,i)=>setTimeout(()=>this._play(f,'triangle',0.25,0.2),i*80));
  }
  crisis()   { this._play(320,'sawtooth',0.35,0.2,180); }
  coin()     { this._play(880,'sine',0.06,0.1,1100); }
  unlock()   { [440,554,659,880].forEach((f,i)=>setTimeout(()=>this._play(f,'triangle',0.15,0.18),i*50)); }
  minigame() { [660,770,880].forEach((f,i)=>setTimeout(()=>this._play(f,'sine',0.1,0.2),i*70)); }
}

// ══════════════════════════════════════════
// MOTOR DO JOGO
// ══════════════════════════════════════════
class GameEngine {
  constructor() {
    this.sound = new SoundSynth();
    this.SAVE_KEY = 'geo_empire_2026_v1';
    this.SAVE_VER = 1;
    this.listeners = [];
    this.combo = 0;
    this.comboTimer = null;
    this.critChance = 0.12;
    this.critMult   = 3.5;
    this.gameHour   = 0; // horas de jogo acumuladas
    this.activeEvent = null;
    this.eventTimer  = null;
    this.onlinePlayers = Math.floor(Math.random()*20000) + 35000;

    // Estado default = ZERO ABSOLUTO
    this.state = this._defaultState();
    this.load();
    this._startLoop();
  }

  // ──────────────────────────────────────
  // ESTADO INICIAL — ZERO ABSOLUTO
  // ──────────────────────────────────────
  _defaultState() {
    const facilities = {};
    window.GAME_DATA.facilities.forEach(f => {
      facilities[f.id] = { level: 0, upgradeLevel: 0 };
    });

    const commodities = {};
    window.GAME_DATA.commodities.forEach(c => {
      commodities[c.id] = {
        price: c.basePrice,
        history: [c.basePrice],
        inventory: 0
      };
    });

    // Grade 3×3 de Províncias/Distritos Soberanos
    const tiles = [];
    for (let i = 0; i < 9; i++) {
      tiles.push({
        id: i,
        state: i === 0 ? 'core' : 'locked', // core|locked|active
        specialization: i === 0 ? 'capital' : null,
        specLevel: 1,
        facilityId: null,
        categoryId: null,
        name: i === 0 ? 'Distrito Capital' : `Província ${i}`,
        unlockCost: this._tileCost(i)
      });
    }

    return {
      version: this.SAVE_VER,
      // === TEMA VISUAL ===
      theme: 'dark',

      // === CONFIGURAÇÕES GERAIS (12 BÁSICAS + 10 AVANÇADAS) ===
      settings: {
        // 12 Básicas:
        soundEnabled: true,             // 1. Som e Efeitos Sonoros
        soundVolume: 80,               // 2. Volume do Áudio (0-100%)
        toastsEnabled: true,           // 3. Notificações Flutuantes na Tela
        toastMaxCount: 3,              // 4. Limite de Cards Simultâneos
        batchLevelUpToasts: true,      // 5. Agrupamento de Level Up
        floatingTapNumbers: true,      // 6. Números Flutuantes ao Tocar (+$$$)
        hapticFeedback: true,          // 7. Vibração / Feedback Háptico
        theme: 'dark',                 // 8. Tema Visual (dark/light)
        screenShake: true,             // 9. Efeitos de Impacto / Tremores Críticos
        numberFormat: 'short',         // 10. Formato Numérico (short/sci)
        autoSaveInterval: 10,          // 11. Intervalo de Salvamento (segundos)
        confirmHighValueActions: true, // 12. Confirmação para Ações Críticas

        // 10 Avançadas:
        tickRateMs: 1000,              // 1. Taxa de Tick do Motor (ms)
        hardwareAcceleration: true,    // 2. Aceleração GPU & Compositing
        lowSpecMode: false,            // 3. Modo Econômico / Dispositivos Fracos
        disableBgBlur: false,          // 4. Desativar Blur Glassmorphism
        tabTransitionAnim: true,       // 5. Transições de Abas Suaves
        particleEffects: true,         // 6. Efeito de Partículas / Confete
        maxEventHistory: 50,           // 7. Limite do Histórico de Eventos
        detailedStatBreakdown: true,   // 8. Fórmulas e Multiplicadores Detalhados
        fpsTelemetry: false,           // 9. Medidor de Telemetria e FPS
        offlineProgressMaxHours: 8     // 10. Teto de Progresso Offline (horas)
      },

      // === NAÇÃO ===
      nationName: 'República de Arvendia',
      leaderName: 'Presidente Soberano',
      flagEmoji: '🏛️',

      // === ECONOMIA === (ZERO ABSOLUTO)
      balance: 0,
      totalEarned: 0,
      gdpPerHour: 0,
      phase: 1,
      level: 0,
      xp: 0,

      // === MULTIPLICADORES & UPGRADES SOBERANOS ===
      tapMultiplier: 1.0,
      tapBonusBase: 0,
      tapGdpPct: 0.001,
      autoClickRate: 0,
      treasuryMultiplier: 1.0,
      treasuryInterestRate: 0,
      purchasedMultipliers: {},

      // === FAVORITOS ===
      favorites: [],

      // === STATS NACIONAIS & DEMOGRAFIA AVANÇADA ===
      population: 1000,
      workingAgePct: 0.65,        // PEA (65% da população economicamente ativa)
      hospitalized: 15,           // Cidadãos internados
      hospitalCapacity: 80,       // Capacidade de leitos hospitalares
      deathsTotal: 0,             // Total de falecimentos acumulados
      deathsRecent: 0,            // Mortes no último ciclo
      birthsTotal: 0,             // Nascimentos acumulados
      literacyRate: 72.0,         // Taxa de alfabetização %
      unemploymentRate: 8.5,      // Taxa de desemprego %
      peakGdp: 0,                 // Recorde histórico de PIB/h
      peakBalance: 0,             // Recorde histórico de Tesouro
      totalCrisesWeathered: 0,    // Crises superadas
      emergencyJobs: 0,           // Vagas emergenciais públicas ativas
      lastAddressTime: 0,         // Timestamp do último pronunciamento
      demographicHistory: [],     // Histórico demográfico para dossiê
      stability: 50,
      influence: 0,
      powerScore: 0,
      approval: 45,
      militarySize: 100,
      pollution: 0,
      happiness: 50,

      // === LEGADO & O GRANDE RESET (ASCENSÃO HEGEMÔNICA) ===
      legacyPoints: 0,
      legacyMultiplier: 1.0,
      totalResets: 0,
      hegemonyPoints: 0,
      lifetimeHegemonyPoints: 0,
      hegemonyResets: 0,
      hegemonyUpgrades: {
        doctrine: 0,   // Doutrina Imperial (+50% PIB/nível)
        midas: 0,      // Toque de Midas (+100% Tap/nível)
        industry: 0,   // Complexo Otimizado (-15% Custo/nível)
        fund: 0,       // Fundo Perpétuo (+$10k/h passivo/nível)
        military: 0,   // Supremacia Bélica (+30% Dissuasão/nível)
        science: 0,    // Aceleração Quântica (-20% Tempo Pesquisa/nível)
        market: 0,     // Hegemonia Cambial (+20% Venda Commodities/nível)
        goldStart: 0   // Largada Dourada (+$100k inicial/nível)
      },

      // === GABINETE DE MINISTROS & PROJETOS ===
      ministers: {
        min_eco: { level: 1 },
        min_def: { level: 1 },
        min_tech: { level: 1 },
        min_agro: { level: 1 },
        min_ext: { level: 1 },
        min_saude: { level: 1 }
      },
      ministerProjects: {},

      // === AGÊNCIAS REGULADORAS DO ESTADO ===
      agencies: {
        bacen: { level: 1, actionCooldown: 0 },
        aeb: { level: 1, actionCooldown: 0, buffTimeLeft: 0, buffGdp: 0 },
        abin: { level: 1, actionCooldown: 0 },
        anvisa: { level: 1, actionCooldown: 0 },
        anp: { level: 1, actionCooldown: 0, buffTimeLeft: 0, buffGdp: 0 }
      },

      // === DECRETOS EXECUTIVOS EM VIGOR ===
      activeDecrees: [],

      // === MISSÕES & CAMPANHA SOBERANA ===
      campaignMissions: {},
      dailyBounties: [],
      dailyBountiesDate: '',
      activeTacticalMission: null,

      // === TERRITÓRIO ===
      tiles: tiles,

      // === INSTALAÇÕES ===
      facilities: facilities,

      // === DEFESA & DISSUASÃO EXPANDIDA ===
      defense: {
        defcon: 5,
        nuclearLevel: 1,
        units: {},
        bases: {},
        operations: []
      },

      // === ÁRVORE TECNOLÓGICA EXPANSÍVEL ===
      tech: {
        unlocked: { mil_1: true, eco_1: true, sci_1: true, cyb_1: true, nrg_1: true, dip_1: true, soc_1: true, spc_1: true },
        researchingId: null,
        researchProgress: 0,
        researchTimeTotal: 0,
        eurekas: []
      },

      // === COMMODITIES ===
      commodities: commodities,

      // === BONDS & ORDERS ===
      bonds: [],
      marketOrders: [],

      // === POLÍTICAS ATIVAS ===
      policies: [],

      // === DIRETRIZES SE/ENTÃO ===
      directives: [],

      // === SESSÃO ===
      stats: {
        totalClicks: 0,
        totalBuilt: 0,
        critHits: 0,
        maxCombo: 0,
        gameHoursPlayed: 0,
        daysInPower: 0
      },

      // === ONBOARDING ===
      onboardingDone: false,
      nationCreated: false,

      // === NAÇÕES (relações) ===
      relations: {},

      // === MISSÕES ===
      completedMissions: [],

      // Timestamp do last save
      lastSave: Date.now()
    };
  }

  _tileCost(i) {
    const costs = [0, 50, 200, 500, 1500, 5000, 20000, 80000, 300000];
    return costs[i] || 0;
  }

  // ──────────────────────────────────────
  // SAVE / LOAD
  // ──────────────────────────────────────
  save() {
    try {
      this.state.lastSave = Date.now();
      localStorage.setItem(this.SAVE_KEY, JSON.stringify(this.state));
      this._syncToServer();
    } catch(e) { console.warn('Save failed:', e); }
  }

  async _syncToServer() {
    try {
      const token = localStorage.getItem('dd_token');
      if (!token) return;
      await fetch('/api/player/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          level: this.state.level || 0,
          xp: this.state.xp || 0,
          gdp: this.state.balance || 0,
          influence: this.state.powerScore || 0,
          stability: this.state.stability || 100,
          legacy: this.state.legacyPoints || 0,
          base_multiplier: this.state.tapMultiplier || 1.0,
          resets: this.state.totalResets || 0,
          total_earned: this.state.totalEarned || 0,
          state_json: this.state
        })
      });
    } catch(e) {}
  }

  load() {
    try {
      const raw = localStorage.getItem(this.SAVE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved.version !== this.SAVE_VER) return;
      // Merge (keep default for new keys)
      this.state = Object.assign(this._defaultState(), saved);

      // Garante que todas as 64 commodities estejam presentes
      (window.GAME_DATA.commodities || []).forEach(c => {
        if (!this.state.commodities[c.id]) {
          this.state.commodities[c.id] = {
            price: c.basePrice,
            history: [c.basePrice],
            inventory: 0
          };
        }
      });

      // Garante que todas as instalações estejam presentes
      (window.GAME_DATA.facilities || []).forEach(f => {
        if (!this.state.facilities[f.id]) {
          this.state.facilities[f.id] = { level: 0, upgradeLevel: 0, isFavorite: false };
        }
      });

      if (!this.state.favorites) this.state.favorites = [];
      if (!this.state.defense) {
        this.state.defense = { defcon: 5, nuclearLevel: 1, units: {}, bases: {}, operations: [] };
      }
      if (!this.state.tech) {
        this.state.tech = {
          unlocked: { mil_1: true, eco_1: true, sci_1: true, cyb_1: true, nrg_1: true, dip_1: true, soc_1: true, spc_1: true },
          researchingId: null,
          researchProgress: 0,
          researchTimeTotal: 0,
          eurekas: []
        };
      }
      if (!this.state.hegemonyUpgrades) {
        this.state.hegemonyUpgrades = { doctrine: 0, midas: 0, industry: 0, fund: 0, military: 0, science: 0, market: 0, goldStart: 0 };
      }
      if (!this.state.ministers) {
        this.state.ministers = {
          min_eco: { level: 1 },
          min_def: { level: 1 },
          min_tech: { level: 1 },
          min_agro: { level: 1 },
          min_ext: { level: 1 },
          min_saude: { level: 1 }
        };
      }
      if (!this.state.ministers.min_saude) this.state.ministers.min_saude = { level: 1 };
      if (!this.state.ministerProjects) this.state.ministerProjects = {};
      if (!this.state.agencies) {
        this.state.agencies = {
          bacen: { level: 1, actionCooldown: 0 },
          aeb: { level: 1, actionCooldown: 0, buffTimeLeft: 0, buffGdp: 0 },
          abin: { level: 1, actionCooldown: 0 },
          anvisa: { level: 1, actionCooldown: 0 },
          anp: { level: 1, actionCooldown: 0, buffTimeLeft: 0, buffGdp: 0 }
        };
      }
      if (!Array.isArray(this.state.activeDecrees)) this.state.activeDecrees = [];
      if (!this.state.campaignMissions) this.state.campaignMissions = {};
      if (!Array.isArray(this.state.dailyBounties)) this.state.dailyBounties = [];
      this._initDailyBountiesIfExpired();
      if (this.state.hegemonyPoints === undefined) this.state.hegemonyPoints = 0;
      if (this.state.lifetimeHegemonyPoints === undefined) this.state.lifetimeHegemonyPoints = 0;
      if (this.state.hegemonyResets === undefined) this.state.hegemonyResets = 0;

      // Demografia e saúde pública
      if (this.state.workingAgePct === undefined) this.state.workingAgePct = 0.65;
      if (this.state.hospitalized === undefined) this.state.hospitalized = 15;
      if (this.state.hospitalCapacity === undefined) this.state.hospitalCapacity = 80;
      if (this.state.deathsTotal === undefined) this.state.deathsTotal = 0;
      if (this.state.deathsRecent === undefined) this.state.deathsRecent = 0;
      if (this.state.birthsTotal === undefined) this.state.birthsTotal = 0;
      if (this.state.literacyRate === undefined) this.state.literacyRate = 72.0;
      if (this.state.unemploymentRate === undefined) this.state.unemploymentRate = 8.5;
      if (this.state.peakGdp === undefined) this.state.peakGdp = this.state.gdpPerHour || 0;
      if (this.state.peakBalance === undefined) this.state.peakBalance = this.state.balance || 0;
      if (this.state.totalCrisesWeathered === undefined) this.state.totalCrisesWeathered = 0;
      if (this.state.emergencyJobs === undefined) this.state.emergencyJobs = 0;
      if (this.state.lastAddressTime === undefined) this.state.lastAddressTime = 0;
      if (!Array.isArray(this.state.demographicHistory)) this.state.demographicHistory = [];

      // Mesclagem de configurações (preserva padrões para chaves novas)
      const defSettings = this._defaultState().settings;
      this.state.settings = Object.assign({}, defSettings, this.state.settings || {});
      this.sound.enabled = this.state.settings.soundEnabled !== false;
      this.sound.volume = (this.state.settings.soundVolume ?? 80) / 100;
      if (this.state.settings.theme) this.state.theme = this.state.settings.theme;

      // Recalculate offline income (respeita teto configurado)
      const offlineMs = Date.now() - (saved.lastSave || Date.now());
      const maxOfflineHours = this.getSetting('offlineProgressMaxHours', 8);
      const offlineHours = Math.min(maxOfflineHours, offlineMs / 3600000);
      if (offlineHours > 0.01 && this.state.gdpPerHour > 0) {
        const offlineEarned = Math.floor(this.state.gdpPerHour * offlineHours * 0.5);
        this.state.balance += offlineEarned;
        this.state.totalEarned += offlineEarned;
        this._offlineGain = offlineEarned;
        this._offlineHours = Math.floor(offlineHours);
      }
    } catch(e) {
      console.warn('Load failed, starting fresh:', e);
    }
  }

  // ──────────────────────────────────────
  // O GRANDE RESET — ASCENSÃO HEGEMÔNICA ($1B)
  // ──────────────────────────────────────
  canGrandeReset() {
    return (this.state.balance || 0) >= 1000000000;
  }

  getGrandeResetProgress() {
    const b = Math.max(0, this.state.balance || 0);
    const target = 1000000000;
    const pct = Math.min(100, (b / target) * 100);
    return {
      balance: b,
      target: target,
      pct: pct,
      canReset: b >= target,
      pointsToEarn: this.getGrandeResetPoints()
    };
  }

  getGrandeResetPoints() {
    const b = this.state.balance || 0;
    if (b < 1000000000) return 0;
    const excess = Math.max(0, (b / 1000000000) - 1);
    // Base 10 pontos ao bater $1B + escala proporcional para saldos maiores
    return Math.floor(10 + Math.pow(excess, 0.75) * 10);
  }

  doGrandeReset() {
    if (!this.canGrandeReset()) {
      return { ok: false, msg: '🔒 Requisito de $1.000.000.000 (1 Bilhão) no Tesouro ainda não atingido!' };
    }
    const pts = this.getGrandeResetPoints();
    const newPoints = (this.state.hegemonyPoints || 0) + pts;
    const newLifetime = (this.state.lifetimeHegemonyPoints || 0) + pts;
    const newResets = (this.state.hegemonyResets || 0) + 1;

    // Preserva upgrades permanentes, estatísticas e pontos
    const preservedUpgrades = Object.assign({}, this.state.hegemonyUpgrades);
    const preservedMinisters = Object.assign({}, this.state.ministers);
    const preservedStats = Object.assign({}, this.state.stats);
    const leaderName = this.state.leaderName;
    const nationName = this.state.nationName;
    const legacyMultiplier = (this.state.legacyMultiplier || 1.0) + (newResets * 0.5);

    // Reinicia o estado da nação
    this.state = this._defaultState();
    this.state.hegemonyPoints = newPoints;
    this.state.lifetimeHegemonyPoints = newLifetime;
    this.state.hegemonyResets = newResets;
    this.state.hegemonyUpgrades = preservedUpgrades;
    this.state.ministers = preservedMinisters;
    this.state.stats = preservedStats;
    this.state.leaderName = leaderName;
    this.state.nationName = nationName;
    this.state.onboardingDone = true;
    this.state.legacyMultiplier = legacyMultiplier;

    // Bônus da Largada Dourada
    const goldBonus = (this.state.hegemonyUpgrades.goldStart || 0) * 100000;
    this.state.balance = 1000 + goldBonus;
    this.state.totalEarned = this.state.balance;

    this.sound.unlock();
    this.save();
    this.notify('grandeReset', { pointsAwarded: pts, totalResets: newResets });
    return {
      ok: true,
      msg: `🌌 O Grande Reset foi concluído! Sua dinastia ascendeu com +${pts} Pontos de Hegemonia Cósmica!`,
      points: pts
    };
  }

  buyHegemonyUpgrade(upgradeId) {
    const upg = (window.GAME_DATA.hegemonyUpgrades || []).find(u => u.id === upgradeId);
    if (!upg) return { ok: false, msg: 'Melhoria de Hegemonia não encontrada.' };
    if (!this.state.hegemonyUpgrades) this.state.hegemonyUpgrades = {};
    const curLvl = this.state.hegemonyUpgrades[upgradeId] || 0;
    if (curLvl >= upg.maxLevel) return { ok: false, msg: '⭐ Nível máximo atingido!' };

    const cost = Math.ceil(upg.baseCost * Math.pow(upg.costMult, curLvl));
    if ((this.state.hegemonyPoints || 0) < cost) {
      return { ok: false, msg: `💎 Pontos insuficientes! Necessário ${cost} Pontos de Hegemonia.` };
    }

    this.state.hegemonyPoints -= cost;
    this.state.hegemonyUpgrades[upgradeId] = curLvl + 1;
    this.sound.unlock();
    this.save();
    this.notify('hegemonyUpgrade', { upgradeId, newLevel: curLvl + 1 });
    return { ok: true, msg: `✨ ${upg.name} elevado ao Nv.${curLvl + 1}! (${upg.effectFmt(curLvl + 1)})`, level: curLvl + 1 };
  }

  // ──────────────────────────────────────
  // GABINETE DE MINISTROS
  // ──────────────────────────────────────
  levelUpMinister(minId) {
    if (!this.state.ministers) this.state.ministers = {};
    if (!this.state.ministers[minId]) this.state.ministers[minId] = { level: 1 };
    const curLvl = this.state.ministers[minId].level || 1;
    const cost = Math.floor(1000 * Math.pow(1.8, curLvl - 1));

    if (this.state.balance < cost) {
      return { ok: false, msg: `💸 Tesouro insuficiente! Necessário ${this.fmt(cost)}.` };
    }

    this.state.balance -= cost;
    this.state.ministers[minId].level = curLvl + 1;
    this.sound.build();
    this.save();
    this.notify('ministerLevelUp', { minId, level: curLvl + 1 });
    return { ok: true, msg: `🎩 Ministro promovido para o Nv.${curLvl + 1}!`, level: curLvl + 1 };
  }

  // ──────────────────────────────────────
  // PROJETOS MINISTERIAIS DO GABINETE
  // ──────────────────────────────────────
  startMinisterProject(minId) {
    if (!this.state.ministerProjects) this.state.ministerProjects = {};
    const existing = this.state.ministerProjects[minId];
    if (existing && (existing.timeLeft > 0 || existing.readyToClaim)) {
      return { ok: false, msg: '⚠️ Este ministério já possui um projeto em andamento ou pronto para resgate!' };
    }

    const minData = (window.GAME_DATA.ministersExpanded || []).find(m => m.id === minId);
    if (!minData || !minData.project) {
      return { ok: false, msg: '❌ Projeto ministerial não encontrado.' };
    }

    const cost = minData.project.cost || 500;
    if (this.state.balance < cost) {
      return { ok: false, msg: `💸 Tesouro insuficiente! Necessário ${this.fmt(cost)} para iniciar.` };
    }

    this.state.balance -= cost;
    this.state.ministerProjects[minId] = {
      id: minData.project.id,
      name: minData.project.name,
      icon: minData.project.icon,
      timeLeft: minData.project.duration || 90,
      totalTime: minData.project.duration || 90,
      readyToClaim: false,
      startedAt: Date.now()
    };

    this.sound.build();
    this.save();
    this.notify('ministerProjectStarted', { minId, project: this.state.ministerProjects[minId] });
    return { ok: true, msg: `🚀 Projeto "${minData.project.name}" despachado com sucesso!` };
  }

  claimMinisterProject(minId) {
    if (!this.state.ministerProjects || !this.state.ministerProjects[minId]) {
      return { ok: false, msg: '❌ Nenhum projeto ativo neste ministério.' };
    }
    const proj = this.state.ministerProjects[minId];
    if (!proj.readyToClaim && proj.timeLeft > 0) {
      return { ok: false, msg: `⏳ Projeto ainda em execução! Restam ${proj.timeLeft}s.` };
    }

    const minData = (window.GAME_DATA.ministersExpanded || []).find(m => m.id === minId);
    const pData = minData?.project || {};

    let rewardSummary = [];
    if (pData.rewardCashMult) {
      const cashGain = Math.max(1000, Math.round((this.state.gdpPerHour || 500) * (pData.rewardCashMult / 60) + 1500));
      this.state.balance += cashGain;
      this.state.totalEarned += cashGain;
      rewardSummary.push(`+${this.fmt(cashGain)}`);
    }
    if (pData.rewardStability) {
      this.state.stability = Math.min(100, (this.state.stability || 50) + pData.rewardStability);
      rewardSummary.push(`+${pData.rewardStability}% Estabilidade`);
    }
    if (pData.rewardTechSeconds && this.state.tech?.researchingId) {
      this.state.tech.researchProgress = (this.state.tech.researchProgress || 0) + pData.rewardTechSeconds;
      rewardSummary.push(`+${pData.rewardTechSeconds}s Pesquisa`);
    }
    if (pData.rewardXp) {
      this.state.xp = (this.state.xp || 0) + pData.rewardXp;
      rewardSummary.push(`+${pData.rewardXp} XP`);
    }
    if (pData.rewardApproval) {
      this.state.approval = Math.min(100, (this.state.approval || 45) + pData.rewardApproval);
      rewardSummary.push(`+${pData.rewardApproval}% Aprovação`);
    }
    if (pData.rewardInfluence) {
      this.state.influence = (this.state.influence || 0) + pData.rewardInfluence;
      rewardSummary.push(`+${pData.rewardInfluence} Influência`);
    }
    if (pData.rewardHeal) {
      const healed = Math.min(this.state.hospitalized || 0, pData.rewardHeal);
      this.state.hospitalized = Math.max(0, (this.state.hospitalized || 0) - healed);
      rewardSummary.push(`${healed} Curados`);
    }

    delete this.state.ministerProjects[minId];
    this.sound.unlock();
    this.save();
    this.notify('ministerProjectClaimed', { minId, reward: rewardSummary.join(', ') });
    return { ok: true, msg: `🎉 Projeto concluído! Recompensas: ${rewardSummary.join(', ')}`, reward: rewardSummary.join(', ') };
  }

  // ──────────────────────────────────────
  // AGÊNCIAS REGULADORAS DO ESTADO
  // ──────────────────────────────────────
  upgradeAgency(agencyId) {
    if (!this.state.agencies) this.state.agencies = {};
    if (!this.state.agencies[agencyId]) this.state.agencies[agencyId] = { level: 1, actionCooldown: 0 };

    const agData = (window.GAME_DATA.regulatoryAgencies || []).find(a => a.id === agencyId);
    if (!agData) return { ok: false, msg: '❌ Agência não encontrada.' };

    const curLvl = this.state.agencies[agencyId].level || 1;
    if (curLvl >= (agData.maxLevel || 10)) {
      return { ok: false, msg: '🏆 Agência já atingiu o nível operacional máximo!' };
    }

    const cost = Math.floor(agData.baseCost * Math.pow(agData.costMult, curLvl - 1));
    if (this.state.balance < cost) {
      return { ok: false, msg: `💸 Tesouro insuficiente! Necessário ${this.fmt(cost)}.` };
    }

    this.state.balance -= cost;
    this.state.agencies[agencyId].level = curLvl + 1;
    this.sound.build();
    this.save();
    this.notify('agencyUpgraded', { agencyId, newLevel: curLvl + 1 });
    return { ok: true, msg: `🏢 ${agData.name} promovida para o Nível ${curLvl + 1}!`, level: curLvl + 1 };
  }

  runAgencyAction(agencyId) {
    if (!this.state.agencies) this.state.agencies = {};
    if (!this.state.agencies[agencyId]) this.state.agencies[agencyId] = { level: 1, actionCooldown: 0 };

    const agState = this.state.agencies[agencyId];
    if (agState.actionCooldown > 0) {
      return { ok: false, msg: `⏳ Ação em recarga! Aguarde ${agState.actionCooldown}s.` };
    }

    const agData = (window.GAME_DATA.regulatoryAgencies || []).find(a => a.id === agencyId);
    if (!agData || !agData.action) return { ok: false, msg: '❌ Ação não disponível.' };

    const act = agData.action;
    let effectMsg = '';

    if (agencyId === 'bacen') {
      const gdpBase = Math.max(500, this.state.gdpPerHour || 500);
      const cashGain = Math.round(gdpBase * (act.rewardCashMult / 60) + (agState.level * 2500));
      this.state.balance += cashGain;
      this.state.totalEarned += cashGain;
      effectMsg = `+${this.fmt(cashGain)} injetados via Títulos Soberanos!`;
    } else if (agencyId === 'aeb') {
      agState.buffTimeLeft = act.duration || 180;
      agState.buffGdp = act.gdpBuff || 0.15;
      effectMsg = `Satélite lançado em órbita! +15% PIB por 3 minutos.`;
    } else if (agencyId === 'abin') {
      const flat = (act.rewardCashFlat || 5000) * (agState.level || 1);
      this.state.balance += flat;
      this.state.totalEarned += flat;
      this.state.influence = (this.state.influence || 0) + (act.rewardInfluence || 15);
      effectMsg = `Infiltração bem sucedida! +${this.fmt(flat)} confiscados e +${act.rewardInfluence} Influência.`;
    } else if (agencyId === 'anvisa') {
      const healAmt = (act.rewardHeal || 30) * (agState.level || 1);
      const cured = Math.min(this.state.hospitalized || 0, healAmt);
      this.state.hospitalized = Math.max(0, (this.state.hospitalized || 0) - cured);
      this.state.stability = Math.min(100, (this.state.stability || 50) + (act.rewardStability || 5));
      effectMsg = `Biossegurança ativada! ${cured} cidadãos curados e +5% Estabilidade.`;
    } else if (agencyId === 'anp') {
      agState.buffTimeLeft = act.duration || 120;
      agState.buffGdp = act.gdpBuff || 0.25;
      effectMsg = `Reservas de petróleo injetadas! +25% de produção energética fabril por 2 minutos.`;
    }

    agState.actionCooldown = act.cd || 120;
    this.sound.unlock();
    this.save();
    this.notify('agencyActionExecuted', { agencyId, msg: effectMsg });
    return { ok: true, msg: `⚡ ${effectMsg}` };
  }

  // ──────────────────────────────────────
  // DECRETOS EXECUTIVOS & REFORMAS
  // ──────────────────────────────────────
  enactDecree(decreeId) {
    if (!Array.isArray(this.state.activeDecrees)) this.state.activeDecrees = [];
    if (this.state.activeDecrees.includes(decreeId)) {
      return { ok: false, msg: '⚠️ Este decreto já está promulgado e em vigor!' };
    }

    if (this.state.activeDecrees.length >= 3) {
      return { ok: false, msg: '⚠️ Limite constitucional atingido! Você pode manter no máximo 3 Decretos simultâneos em vigor.' };
    }

    const dec = (window.GAME_DATA.executiveDecrees || []).find(d => d.id === decreeId);
    if (!dec) return { ok: false, msg: '❌ Decreto não encontrado no catálogo.' };

    const costCash = dec.costCash || 0;
    const costStab = dec.costStability || 0;

    if (this.state.balance < costCash) {
      return { ok: false, msg: `💸 Tesouro insuficiente! Necessário ${this.fmt(costCash)} para promulgar.` };
    }
    if ((this.state.stability || 50) < (costStab + 5)) {
      return { ok: false, msg: `⚖️ Estabilidade nacional insuficiente para suportar a comoção deste decreto!` };
    }

    this.state.balance -= costCash;
    if (costStab > 0) {
      this.state.stability = Math.max(5, (this.state.stability || 50) - costStab);
    }

    this.state.activeDecrees.push(decreeId);
    this.sound.unlock();
    this.save();
    this.notify('decreeEnacted', { decree: dec });
    return { ok: true, msg: `📜 ${dec.name} promulgado com sucesso!` };
  }

  revokeDecree(decreeId) {
    if (!Array.isArray(this.state.activeDecrees)) this.state.activeDecrees = [];
    const idx = this.state.activeDecrees.indexOf(decreeId);
    if (idx === -1) {
      return { ok: false, msg: '⚠️ Este decreto não está ativo no momento.' };
    }

    const dec = (window.GAME_DATA.executiveDecrees || []).find(d => d.id === decreeId);
    this.state.activeDecrees.splice(idx, 1);
    this.sound.tap();
    this.save();
    this.notify('decreeRevoked', { decreeId });
    return { ok: true, msg: `❌ ${dec?.name || 'Decreto'} revogado com sucesso.` };
  }

  // ──────────────────────────────────────
  // MISSÕES DE CAMPANHA & CONTRATOS DIÁRIOS
  // ──────────────────────────────────────
  _initDailyBountiesIfExpired(force = false) {
    const today = new Date().toISOString().slice(0, 10);
    if (this.state.dailyBountiesDate !== today || force || !this.state.dailyBounties?.length) {
      const pool = window.GAME_DATA.dailyBountiesPool || [];
      const shuffled = [...pool].sort((a, b) => {
        const seedA = (a.id.charCodeAt(0) * 17 + today.charCodeAt(9)) % 100;
        const seedB = (b.id.charCodeAt(0) * 17 + today.charCodeAt(9)) % 100;
        return seedA - seedB;
      });

      this.state.dailyBounties = shuffled.slice(0, 4).map(b => ({
        id: b.id,
        claimed: false
      }));
      this.state.dailyBountiesDate = today;
      this.save();
    }
  }

  getDailyBounties() {
    this._initDailyBountiesIfExpired();
    const pool = window.GAME_DATA.dailyBountiesPool || [];
    return (this.state.dailyBounties || []).map(entry => {
      const base = pool.find(p => p.id === entry.id);
      if (!base) return null;
      const currentVal = base.check ? base.check(this.state, this) : 0;
      const isComplete = currentVal >= base.target;
      const pct = Math.min(100, Math.round((currentVal / base.target) * 100));
      return {
        ...base,
        currentVal,
        isComplete,
        pct,
        claimed: !!entry.claimed
      };
    }).filter(Boolean);
  }

  claimDailyBounty(bountyId) {
    const bounties = this.getDailyBounties();
    const target = bounties.find(b => b.id === bountyId);
    if (!target) return { ok: false, msg: '❌ Contrato não encontrado.' };
    if (target.claimed) return { ok: false, msg: '⚠️ Este contrato já foi reivindicado hoje!' };
    if (!target.isComplete) return { ok: false, msg: '⚠️ O objetivo deste contrato ainda não foi atingido!' };

    const entry = this.state.dailyBounties.find(e => e.id === bountyId);
    if (entry) entry.claimed = true;

    let rewardsList = [];
    if (target.reward.cash) {
      this.state.balance += target.reward.cash;
      this.state.totalEarned += target.reward.cash;
      rewardsList.push(`+${this.fmt(target.reward.cash)}`);
    }
    if (target.reward.xp) {
      this.state.xp = (this.state.xp || 0) + target.reward.xp;
      rewardsList.push(`+${target.reward.xp} XP`);
    }
    if (target.reward.stability) {
      this.state.stability = Math.min(100, (this.state.stability || 50) + target.reward.stability);
      rewardsList.push(`+${target.reward.stability}% Estabilidade`);
    }
    if (target.reward.influence) {
      this.state.influence = (this.state.influence || 0) + target.reward.influence;
      rewardsList.push(`+${target.reward.influence} Influência`);
    }

    this.sound.unlock();
    this.save();
    this.notify('dailyBountyClaimed', { bountyId, reward: rewardsList.join(', ') });
    return { ok: true, msg: `🎉 Contrato cumprido com louvor! Recompensas: ${rewardsList.join(', ')}`, rewards: rewardsList.join(', ') };
  }

  checkMissionStatus(missionId) {
    const mission = (window.GAME_DATA.campaignMissions || []).find(m => m.id === missionId);
    if (!mission) return { isDone: false, progress: 0, claimed: false };

    const claimed = !!(this.state.campaignMissions && this.state.campaignMissions[missionId]?.claimed);
    const isDone = mission.check ? mission.check(this.state, this) : false;
    const progress = mission.progress ? mission.progress(this.state, this) : (isDone ? 100 : 0);

    return { isDone, progress, claimed, mission };
  }

  claimMissionReward(missionId) {
    const status = this.checkMissionStatus(missionId);
    if (!status.mission) return { ok: false, msg: '❌ Missão inexistente.' };
    if (status.claimed) return { ok: false, msg: '⚠️ Recompensa já foi reivindicada!' };
    if (!status.isDone) return { ok: false, msg: '🔒 Os requisitos desta missão ainda não foram concluídos!' };

    if (!this.state.campaignMissions) this.state.campaignMissions = {};
    this.state.campaignMissions[missionId] = {
      claimed: true,
      completedAt: Date.now()
    };

    const r = status.mission.reward || {};
    let rewardsList = [];

    if (r.cash) {
      this.state.balance += r.cash;
      this.state.totalEarned += r.cash;
      rewardsList.push(`+${this.fmt(r.cash)}`);
    }
    if (r.xp) {
      this.state.xp = (this.state.xp || 0) + r.xp;
      rewardsList.push(`+${r.xp} XP`);
    }
    if (r.hegemonyPoints) {
      this.state.hegemonyPoints = (this.state.hegemonyPoints || 0) + r.hegemonyPoints;
      this.state.lifetimeHegemonyPoints = (this.state.lifetimeHegemonyPoints || 0) + r.hegemonyPoints;
      rewardsList.push(`+${r.hegemonyPoints} Ponto(s) de Hegemonia`);
    }
    if (r.stability) {
      this.state.stability = Math.min(100, (this.state.stability || 50) + r.stability);
      rewardsList.push(`+${r.stability}% Estabilidade`);
    }
    if (r.approval) {
      this.state.approval = Math.min(100, (this.state.approval || 45) + r.approval);
      rewardsList.push(`+${r.approval}% Aprovação`);
    }
    if (r.influence) {
      this.state.influence = (this.state.influence || 0) + r.influence;
      rewardsList.push(`+${r.influence} Influência`);
    }

    this.sound.unlock();
    this.save();
    this.notify('missionRewardClaimed', { missionId, mission: status.mission, rewards: rewardsList });
    return { ok: true, msg: `🏆 Missão cumprida: ${status.mission.title}!`, rewards: rewardsList, mission: status.mission };
  }

  startTacticalMission(tacId) {
    if (this.state.activeTacticalMission) {
      return { ok: false, msg: `⚠️ Operação "${this.state.activeTacticalMission.name}" já está em andamento!` };
    }
    const tac = (window.GAME_DATA.tacticalMissions || []).find(t => t.id === tacId);
    if (!tac) return { ok: false, msg: '❌ Operação não encontrada.' };

    const cost = tac.cost || 1000;
    if (this.state.balance < cost) {
      return { ok: false, msg: `💸 Tesouro insuficiente! Necessário ${this.fmt(cost)}.` };
    }

    this.state.balance -= cost;
    this.state.activeTacticalMission = {
      id: tac.id,
      name: tac.name,
      icon: tac.icon,
      timeLeft: tac.time || 60,
      totalTime: tac.time || 60,
      rewardCash: tac.rewardCash,
      rewardXp: tac.rewardXp,
      rewardPower: tac.rewardPower,
      rewardStability: tac.rewardStability,
      rewardInfluence: tac.rewardInfluence,
      rewardHegemony: tac.rewardHegemony
    };

    this.sound.build();
    this.save();
    this.notify('tacticalMissionStarted', { mission: this.state.activeTacticalMission });
    return { ok: true, msg: `🎯 Operação Tática "${tac.name}" iniciada!` };
  }

  _resolveTacticalMission() {
    if (!this.state.activeTacticalMission) return;
    const tac = this.state.activeTacticalMission;
    this.state.activeTacticalMission = null;

    let rewardsList = [];
    if (tac.rewardCash) {
      this.state.balance += tac.rewardCash;
      this.state.totalEarned += tac.rewardCash;
      rewardsList.push(`+${this.fmt(tac.rewardCash)}`);
    }
    if (tac.rewardXp) {
      this.state.xp = (this.state.xp || 0) + tac.rewardXp;
      rewardsList.push(`+${tac.rewardXp} XP`);
    }
    if (tac.rewardPower) {
      this.state.militarySize = (this.state.militarySize || 100) + tac.rewardPower;
      rewardsList.push(`+${tac.rewardPower} Poder Militar`);
    }
    if (tac.rewardStability) {
      this.state.stability = Math.min(100, (this.state.stability || 50) + tac.rewardStability);
      rewardsList.push(`+${tac.rewardStability}% Estabilidade`);
    }
    if (tac.rewardInfluence) {
      this.state.influence = (this.state.influence || 0) + tac.rewardInfluence;
      rewardsList.push(`+${tac.rewardInfluence} Influência`);
    }
    if (tac.rewardHegemony) {
      this.state.hegemonyPoints = (this.state.hegemonyPoints || 0) + tac.rewardHegemony;
      this.state.lifetimeHegemonyPoints = (this.state.lifetimeHegemonyPoints || 0) + tac.rewardHegemony;
      rewardsList.push(`+${tac.rewardHegemony} Ponto de Hegemonia`);
    }

    this.sound.unlock();
    this.save();
    this.notify('tacticalMissionCompleted', { name: tac.name, rewards: rewardsList.join(', ') });
  }

  resetGame() {
    const lp = this.state.legacyPoints;
    const resets = this.state.totalResets + 1;
    const newMult = 1 + (resets * 0.25); // +25% por reset
    this.state = this._defaultState();
    this.state.legacyPoints = lp + Math.floor(this.state.powerScore / 100);
    this.state.totalResets = resets;
    this.state.legacyMultiplier = newMult;
    this.save();
    this.notify('reset', {});
  }

  setSetting(key, val) {
    if (!this.state.settings) this.state.settings = {};
    this.state.settings[key] = val;

    if (key === 'soundEnabled') this.sound.enabled = !!val;
    if (key === 'soundVolume')  this.sound.volume = Math.max(0, Math.min(100, Number(val))) / 100;
    if (key === 'theme') {
      this.state.theme = val;
      if (typeof document !== 'undefined') {
        if (val === 'light') {
          document.body.classList.add('light-theme');
          document.documentElement.classList.add('light-theme');
        } else {
          document.body.classList.remove('light-theme');
          document.documentElement.classList.remove('light-theme');
        }
      }
    }
    if (key === 'disableBgBlur' && typeof document !== 'undefined') {
      document.body.classList.toggle('no-blur', !!val);
    }
    if (key === 'lowSpecMode' && typeof document !== 'undefined') {
      document.body.classList.toggle('low-spec', !!val);
    }
    if (key === 'autoSaveInterval') {
      if (this._saveId) clearInterval(this._saveId);
      const sSec = Math.max(5, Number(val) || 10);
      this._saveId = setInterval(() => this.save(), sSec * 1000);
    }
    if (key === 'tickRateMs') {
      if (this._loopId) clearInterval(this._loopId);
      const tMs = Math.max(200, Number(val) || 1000);
      this._loopId = setInterval(() => this._tick(), tMs);
    }

    this.save();
    this.notify('settingChanged', { key, val });
  }

  getSetting(key, fallback = undefined) {
    return this.state?.settings?.[key] !== undefined ? this.state.settings[key] : fallback;
  }

  // ──────────────────────────────────────
  // LOOP PRINCIPAL 1s = 1h de jogo
  // ──────────────────────────────────────
  _startLoop() {
    const tickMs = this.getSetting('tickRateMs', 1000);
    this._loopId = setInterval(() => this._tick(), tickMs);
    // Auto-save respeitando configuração
    const saveSec = this.getSetting('autoSaveInterval', 10);
    this._saveId = setInterval(() => this.save(), saveSec * 1000);
    // Atualiza preços de commodities a cada 3s
    this._mktId = setInterval(() => this._updateMarket(), 3000);
    // Evento aleatório a cada 2 minutos
    this._eventId = setInterval(() => this._maybeEvent(), 120000);
    // Gera jogadores online aleatórios
    this._playId = setInterval(() => {
      this.onlinePlayers += Math.floor((Math.random()-0.4)*100);
      this.onlinePlayers = Math.max(30000, Math.min(80000, this.onlinePlayers));
    }, 8000);
    // Sincroniza métricas com IA Diretora / backend a cada 8s
    this._aiSyncId = setInterval(() => this._syncLiveAi(), 8000);
  }

  _syncLiveAi() {
    try {
      const s = this.state;
      if (typeof fetch === 'function') {
        fetch('/api/ai/live-sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            capital: s.balance || 0,
            power: s.powerScore || 0,
            gdp: s.gdpPerHour || 0
          })
        }).then(r => r.json()).then(data => {
          if (data && data.events && data.events.length) {
            this.notify('aiEventSync', data.events[0]);
          }
        }).catch(() => {});
      }
    } catch(e) {}
  }

  _tick() {
    const s = this.state;
    this.gameHour++;
    s.stats.gameHoursPlayed++;

    // Especializações de Território/Províncias ativas
    const catBonusMap = {};
    (s.tiles || []).forEach(tile => {
      if (tile.state === 'active' || tile.state === 'core') {
        const spec = (window.GAME_DATA.provinceSpecializations || []).find(sp => sp.id === tile.specialization);
        if (spec && spec.catBonus) {
          catBonusMap[spec.catBonus] = (catBonusMap[spec.catBonus] || 1.0) * (spec.mult || 1.5);
        }
      }
    });

    // Produção de cada instalação ativa
    let hourlyProd = 0;
    Object.entries(s.facilities).forEach(([fid, fstate]) => {
      if (fstate.level > 0) {
        const fdata = window.GAME_DATA.facilities.find(f => f.id === fid);
        if (!fdata) return;
        const lvlMult   = Math.pow(1.15, fstate.level - 1);
        const upMult    = 1 + (fstate.upgradeLevel * 0.3);
        const eventMult = this._getEventMult(fdata.cat);
        const legMult   = s.legacyMultiplier || 1.0;
        const provMult  = catBonusMap[fdata.cat] || 1.0;
        hourlyProd += fdata.prodPerHour * lvlMult * upMult * eventMult * legMult * provMult;
      }
    });

    // Multiplicador Global do Tesouro
    hourlyProd *= (s.treasuryMultiplier || 1.0);

    // Bônus passivo do Banco Central Soberano (BACEN)
    const bacenLvl = s.agencies?.bacen?.level || 1;
    hourlyProd *= (1 + (bacenLvl - 1) * 0.04);

    // Buffs temporários de Agências Reguladoras ativas (AEB Satélite & ANP Petróleo)
    if (s.agencies?.aeb?.buffTimeLeft > 0) {
      s.agencies.aeb.buffTimeLeft--;
      hourlyProd *= (1 + (s.agencies.aeb.buffGdp || 0.15));
    }
    if (s.agencies?.anp?.buffTimeLeft > 0) {
      s.agencies.anp.buffTimeLeft--;
      hourlyProd *= (1 + (s.agencies.anp.buffGdp || 0.25));
    }

    // Decremento de recarga (cooldown) das ações de agências
    if (s.agencies) {
      Object.values(s.agencies).forEach(ag => {
        if (ag && ag.actionCooldown > 0) ag.actionCooldown--;
      });
    }

    // Avanço e processamento de Projetos Ministeriais em execução
    if (s.ministerProjects) {
      Object.entries(s.ministerProjects).forEach(([mId, proj]) => {
        if (proj && proj.timeLeft > 0) {
          proj.timeLeft--;
          if (proj.timeLeft <= 0) {
            proj.timeLeft = 0;
            proj.readyToClaim = true;
            this.sound.coin();
            this.notify('ministerProjectReady', { minId: mId, project: proj });
          }
        }
      });
    }

    // Avanço de Operação Tática ativa
    if (s.activeTacticalMission && s.activeTacticalMission.timeLeft > 0) {
      s.activeTacticalMission.timeLeft--;
      if (s.activeTacticalMission.timeLeft <= 0) {
        this._resolveTacticalMission();
      }
    }

    // Impacto dinâmico de Decretos Executivos promulgados
    let decreeGdpMult = 1.0;
    let decreePollutionAdd = 0;
    let decreeUpkeep = 0;
    let decreeResearchSpeed = 0;

    (s.activeDecrees || []).forEach(decId => {
      const d = (window.GAME_DATA?.executiveDecrees || []).find(item => item.id === decId);
      if (d) {
        if (d.buffGdp) decreeGdpMult += d.buffGdp;
        if (d.penaltyGdp) decreeGdpMult += d.penaltyGdp;
        if (d.penaltyPol) decreePollutionAdd += (d.penaltyPol / 100);
        if (d.buffPollutionReduction) decreePollutionAdd -= d.buffPollutionReduction;
        if (d.upkeepPerHour) decreeUpkeep += d.upkeepPerHour;
        if (d.buffResearchSpeed) decreeResearchSpeed += d.buffResearchSpeed;
      }
    });

    hourlyProd *= Math.max(0.2, decreeGdpMult);
    s.balance -= decreeUpkeep;
    s.pollution = Math.max(0, Math.min(100, (s.pollution || 0) + decreePollutionAdd));

    // Multiplicador de Dissuasão Nuclear & DEFCON (Correção 5)
    const nucLevel = s.defense?.nuclearLevel || 1;
    const nucData = window.GAME_DATA.defense?.nuclearDeterrenceLevels?.find(l => l.level === nucLevel);
    if (nucData && nucData.mult) hourlyProd *= nucData.mult;
    if (s.defense?.defcon === 1) hourlyProd *= 1.20; // Economia de guerra em prontidão total

    // Aplica políticas ativas
    s.policies.forEach(p => {
      hourlyProd *= (1 + (p.bonus || 0));
      s.balance  -= (p.costPerHour || 0);
    });

    // Multiplicadores da Ascensão Hegemônica (O Grande Reset) e Gabinete
    const doctrineBonus = 1 + (s.hegemonyUpgrades?.doctrine || 0) * 0.50;
    const ecoMinisterBonus = 1 + ((s.ministers?.min_eco?.level || 1) - 1) * 0.05;
    hourlyProd = (hourlyProd * doctrineBonus * ecoMinisterBonus);

    // Fundo Soberano Perpétuo (Renda Passiva Fixa)
    const fundPassive = (s.hegemonyUpgrades?.fund || 0) * 10000;
    hourlyProd += fundPassive;

    // Avanço de Pesquisa Tecnológica acelerado por Min. de Ciência, Decretos e AEB
    if (s.tech?.researchingId) {
      const techMinisterBonus = 1 + ((s.ministers?.min_tech?.level || 1) - 1) * 0.10;
      const aebTechBonus = 1 + ((s.agencies?.aeb?.level || 1) - 1) * 0.06;
      const totalResearchSpeed = (techMinisterBonus + decreeResearchSpeed) * aebTechBonus;
      s.tech.researchProgress = (s.tech.researchProgress || 0) + totalResearchSpeed;

      if (s.tech.researchProgress >= s.tech.researchTimeTotal) {
        const completedTechId = s.tech.researchingId;
        const techData = window.GAME_DATA.techTree?.techs?.find(t => t.id === completedTechId);
        s.tech.unlocked[completedTechId] = true;
        s.tech.researchingId = null;
        s.tech.researchProgress = 0;
        this.sound.levelUp();
        this.notify('techComplete', { tech: techData });
      }
    }

    s.gdpPerHour = Math.floor(hourlyProd);
    s.balance   += hourlyProd;
    s.totalEarned += hourlyProd;

    // Auto-Click Drones (trabalham autonomamente)
    if (s.autoClickRate > 0) {
      const autoBase = (0.01 + (s.tapBonusBase || 0) + (s.gdpPerHour * (s.tapGdpPct || 0.001)) + (s.level * 0.05));
      const autoEarn = autoBase * (s.tapMultiplier || 1) * s.autoClickRate;
      s.balance += autoEarn;
      s.totalEarned += autoEarn;
      s.xp += Math.max(1, Math.floor(autoEarn * 0.05));
    }

    // Rendimento de Juros Soberanos (a cada 10 horas de jogo / 10 ticks)
    if (s.treasuryInterestRate > 0 && this.gameHour % 10 === 0 && s.balance > 0) {
      const interest = s.balance * s.treasuryInterestRate;
      s.balance += interest;
      s.totalEarned += interest;
    }

    // Atualiza fila de construção nas tiles
    let tileChanged = false;
    s.tiles.forEach(tile => {
      if (tile.state === 'building' && tile.buildTimeLeft > 0) {
        tile.buildTimeLeft -= 1000; // -1 segundo por tick
        if (tile.buildTimeLeft <= 0) {
          tile.buildTimeLeft = 0;
          tile.state = 'active';
          tileChanged = true;
          this.sound.build();
          this.notify('tileComplete', { tile });
        }
      }
    });

    // Fase/nível
    this._checkPhase();
    this._checkLevel();

    // Simulação demográfica, empregos, saúde e mortes
    this._simulateDemographics();

    // Estatísticas
    s.stats.daysInPower = Math.floor(s.stats.gameHoursPlayed / 24);
    s.powerScore = this._calcPower();

    // Pollution clamp
    s.pollution = Math.max(0, Math.min(100, s.pollution));
    s.stability = Math.max(0, Math.min(100, s.stability));

    this.notify('tick', { hourlyProd, tileChanged });
  }

  getTotalJobs() {
    const s = this.state;
    let jobs = s.emergencyJobs || 0;
    if (s.facilities) {
      Object.entries(s.facilities).forEach(([fid, fstate]) => {
        if (fstate && fstate.level > 0) {
          const f = (window.GAME_DATA?.facilities || []).find(item => item.id === fid);
          if (f && f.jobs) jobs += f.jobs * fstate.level;
        }
      });
    }

    // Modificador do Decreto de Reforma Trabalhista
    if (s.activeDecrees && s.activeDecrees.includes('dec_reforma_trabalho')) {
      jobs = Math.round(jobs * 1.20);
    }

    return jobs;
  }

  _simulateDemographics() {
    const s = this.state;
    const totalJobs = this.getTotalJobs();
    const pea = Math.max(10, Math.round(s.population * (s.workingAgePct || 0.65)));
    const employed = Math.min(pea, totalJobs);
    const unemployed = Math.max(0, pea - employed);
    s.unemploymentRate = Number(((unemployed / pea) * 100).toFixed(1));

    // Capacidade Hospitalar Dinâmica (Base + ANVISA + Decreto 106)
    let baseCapacity = 80;
    const anvisaLvl = s.agencies?.anvisa?.level || 1;
    baseCapacity += (anvisaLvl - 1) * 30;
    if (s.activeDecrees && s.activeDecrees.includes('dec_emergencia_saude')) {
      baseCapacity += 80;
    }
    s.hospitalCapacity = baseCapacity;

    // Dinâmica de Saúde & Hospitalização
    // Risco de enfermidade proporcional à poluição, mitigado por ANVISA
    const anvisaProtection = Math.max(0.4, 1 - (anvisaLvl - 1) * 0.10);
    const diseaseRisk = 0.00035 * (1 + ((s.pollution || 0) / 100) * 1.2) * anvisaProtection;
    const newIll = Math.max(1, Math.round(s.population * diseaseRisk));
    s.hospitalized = (s.hospitalized || 0) + newIll;

    // Altas médicas e tratamentos bem sucedidos guiados pelo Ministério da Saúde
    const healthMinisterLvl = s.ministers?.min_saude?.level || 1;
    let healRateMult = 1 + ((healthMinisterLvl - 1) * 0.15);
    if (s.activeDecrees && s.activeDecrees.includes('dec_emergencia_saude')) {
      healRateMult += 0.40;
    }

    const dischargeRate = Math.round(s.hospitalCapacity * 0.12 * healRateMult);
    const recovered = Math.min(s.hospitalized, Math.max(1, dischargeRate));
    s.hospitalized = Math.max(0, s.hospitalized - recovered);

    // Falecimentos de cidadãos
    // 1. Mortalidade natural padrão
    const naturalDeaths = Math.max(0, Math.floor(s.population * 0.00006));

    // 2. Mortalidade por saturação hospitalar (falta de leitos, mitigada pelo Min. da Saúde)
    let hospitalDeaths = 0;
    if (s.hospitalized > s.hospitalCapacity) {
      const overflow = s.hospitalized - s.hospitalCapacity;
      const mortalityRate = Math.max(0.008, 0.035 / (1 + (healthMinisterLvl - 1) * 0.12));
      hospitalDeaths = Math.ceil(overflow * mortalityRate);
      s.hospitalized = Math.max(0, s.hospitalized - hospitalDeaths);
      // Penalidade de estabilidade por colapso hospitalar
      s.stability = Math.max(5, s.stability - 0.15);
    }

    const totalDeaths = naturalDeaths + hospitalDeaths;
    s.deathsRecent = totalDeaths;
    s.deathsTotal = (s.deathsTotal || 0) + totalDeaths;

    // Nascimentos (sustentados por estabilidade e infraestrutura médica)
    const birthRate = 0.00010 * Math.max(0.4, (s.stability || 50) / 50);
    const births = Math.max(0, Math.floor(s.population * birthRate));
    s.birthsTotal = (s.birthsTotal || 0) + births;

    // Aplica balanço demográfico
    s.population = Math.max(250, s.population + births - totalDeaths);

    // Atualiza picos históricos
    s.peakGdp = Math.max(s.peakGdp || 0, s.gdpPerHour || 0);
    s.peakBalance = Math.max(s.peakBalance || 0, s.balance || 0);

    // Histórico para gráficos do dossiê nacional (a cada 10 ticks)
    if (this.gameHour % 10 === 0) {
      if (!s.demographicHistory) s.demographicHistory = [];
      s.demographicHistory.push({
        h: this.gameHour,
        pop: s.population,
        jobs: totalJobs,
        unemp: s.unemploymentRate,
        hosp: s.hospitalized,
        cap: s.hospitalCapacity,
        deaths: s.deathsRecent,
        lit: s.literacyRate
      });
      if (s.demographicHistory.length > 40) s.demographicHistory.shift();
    }
  }

  _getEventMult(cat) {
    if (!this.activeEvent) return 1;
    const ev = this.activeEvent;
    if (ev.impact.includes(cat)) {
      return ev.type === 'crisis' ? 0.6 : 1.5;
    }
    if (ev.impact.includes('all')) {
      return ev.type === 'crisis' ? 0.75 : 1.25;
    }
    return 1;
  }

  _checkPhase() {
    const b = this.state.balance;
    if (b >= 1_000_000_000 && this.state.phase < 3) {
      this.state.phase = 3;
      this.notify('phaseUp', { phase: 3 });
    } else if (b >= 10_000 && this.state.phase < 2) {
      this.state.phase = 2;
      this.notify('phaseUp', { phase: 2 });
    }
  }

  _checkLevel() {
    const startLevel = this.state.level;
    let levelsGained = 0;
    while (this.state.level < 1000) {
      const req = this._xpRequired(this.state.level);
      if (this.state.xp < req) break;
      this.state.xp -= req;
      this.state.level++;
      this.state.influence += 10 * this.state.level;
      levelsGained++;
      if (levelsGained > 500) break; // Trava de segurança contra laço excessivo
    }

    if (levelsGained > 0) {
      this.sound.levelUp();
      this.notify('levelUp', {
        oldLevel: startLevel,
        newLevel: this.state.level,
        levelsGained: levelsGained
      });
    }
  }

  _xpRequired(lvl) {
    if (lvl < 10)  return Math.floor(10 * Math.pow(lvl + 1, 1.5));
    if (lvl < 50)  return Math.floor(100 * Math.pow(lvl, 1.6));
    if (lvl < 100) return Math.floor(500 * Math.pow(lvl, 1.75));
    return Math.floor(2000 * Math.pow(lvl, 1.9));
  }

  _calcPower() {
    const s = this.state;
    let p = 0;
    // Escala logarítmica expandida do capital acumulado (acompanha Trilhões, Quadrilhões, etc.)
    const cap = Math.max(1, s.balance || 0, s.totalEarned || 0);
    p += Math.log10(cap) * 80;
    p += (s.level || 0) * 35;
    p += (s.militarySize || 0) * 0.25;
    p += (s.influence || 0) * 2;
    // Contribuição do parque industrial e defesas
    if (s.facilities) {
      Object.values(s.facilities).forEach(f => {
        p += (f.level || 0) * 4 + (f.upgradeLevel || 0) * 12;
      });
    }
    // Bônus de Hegemonia Cósmica (Resets)
    p += (s.resets || 0) * 250;
    return Math.floor(Math.max(0, p));
  }

  // ──────────────────────────────────────
  // TAP ENGINE — Botão Central 180dp
  // ──────────────────────────────────────
  tap() {
    this.sound._init();
    const s = this.state;
    s.stats.totalClicks++;

    // Combo
    this.combo++;
    if (this.combo > s.stats.maxCombo) s.stats.maxCombo = this.combo;
    clearTimeout(this.comboTimer);
    this.comboTimer = setTimeout(() => { this.combo = 0; this.notify('update'); }, 2500);

    const isCrit = Math.random() < this.critChance;
    if (isCrit) s.stats.critHits++;

    // Fórmula expandida de ganho por toque com multiplicadores soberanos
    const baseTapBonus = s.tapBonusBase || 0;
    const gdpTapBonus  = s.gdpPerHour * (s.tapGdpPct || 0.001);
    const levelTapBonus= s.level * 0.05;
    const base         = Math.max(0.01, 0.01 + baseTapBonus + gdpTapBonus + levelTapBonus);
    const comboM       = 1 + Math.min(this.combo, 50) * 0.04;
    const critM        = isCrit ? this.critMult : 1;
    const legM         = s.legacyMultiplier || 1.0;
    const tapMult      = s.tapMultiplier || 1.0;
    const midasM       = 1 + (s.hegemonyUpgrades?.midas || 0) * 1.0;
    const earned       = parseFloat((base * comboM * critM * legM * tapMult * midasM).toFixed(2));

    s.balance     += earned;
    s.totalEarned += earned;

    const xpGain = Math.max(1, Math.floor(earned * 0.1) + (isCrit ? 10 : 2));
    s.xp += xpGain;
    this._checkLevel();

    this.sound.tap(isCrit);

    return { earned, isCrit, combo: this.combo, xp: xpGain };
  }

  // ──────────────────────────────────────
  // MULTIPLICADORES & UPGRADES SOBERANOS
  // ──────────────────────────────────────
  buyMultiplier(multId) {
    const m = (window.GAME_DATA.multipliers || []).find(item => item.id === multId);
    if (!m) return { ok: false, msg: 'Multiplicador não encontrado.' };

    const s = this.state;
    if (!s.purchasedMultipliers) s.purchasedMultipliers = {};
    if (s.purchasedMultipliers[multId]) {
      return { ok: false, msg: '✅ Multiplicador já desbloqueado!' };
    }

    if (s.level < m.reqLevel) {
      return { ok: false, msg: `🔒 Requer Nível ${m.reqLevel}.` };
    }

    if (s.balance < m.cost) {
      return { ok: false, msg: `💸 Precisa de ${this.fmt(m.cost)}.` };
    }

    s.balance -= m.cost;
    s.purchasedMultipliers[multId] = true;

    if (typeof m.apply === 'function') {
      m.apply(s);
    }

    this.sound.levelUp();
    this.notify('multiplierBought', { multId, m });
    return { ok: true, msg: `⚡ ${m.name} desbloqueado!` };
  }

  // ──────────────────────────────────────
  // INSTALAÇÕES — Construção Direta Cadenciada
  // ──────────────────────────────────────
  getFacilityPrereq(facilityId) {
    if (!window.GAME_DATA || !window.GAME_DATA.facilities) return null;
    const fdata = window.GAME_DATA.facilities.find(f => f.id === facilityId);
    if (!fdata) return null;

    const catFacs = window.GAME_DATA.facilities.filter(f => f.cat === fdata.cat);
    const idx = catFacs.findIndex(f => f.id === facilityId);
    if (idx > 0) {
      const prevFac = catFacs[idx - 1];
      const minLvl = idx <= 2 ? 2 : 3;
      return {
        id: prevFac.id,
        name: prevFac.name,
        minLevel: minLvl
      };
    }
    return null;
  }

  buildFacilityDirect(facilityId, count = 1) {
    const fdata = window.GAME_DATA.facilities.find(f => f.id === facilityId);
    if (!fdata) return { ok: false, msg: '❌ Instalação inválida.' };

    const s = this.state;
    if (fdata.phase > s.phase) return { ok: false, msg: `🚫 Requer Fase ${fdata.phase}.` };
    if (fdata.reqLevel > s.level) return { ok: false, msg: `📈 Requer Nível ${fdata.reqLevel}.` };

    // Verificação de Pré-requisito de Desbloqueio Cadenciado
    const prereq = this.getFacilityPrereq(facilityId);
    if (prereq) {
      const prevLvl = s.facilities[prereq.id]?.level || 0;
      if (prevLvl < prereq.minLevel) {
        return {
          ok: false,
          msg: `🔒 Cadência Industrial: requer ${prereq.name} no Nível ${prereq.minLevel} para desbloquear!`
        };
      }
    }

    if (!s.facilities[facilityId]) {
      s.facilities[facilityId] = { level: 0, upgradeLevel: 0 };
    }
    const fstate = s.facilities[facilityId];

    // Calcula custo acumulado cadenciado para a quantidade desejada
    let totalCost = 0;
    let tempLvl = fstate.level;
    for (let c = 0; c < count; c++) {
      totalCost += Math.floor(fdata.cost * Math.pow(1.32, tempLvl));
      tempLvl++;
    }

    // Desconto de Complexo Otimizado (Hegemonia)
    const indDiscount = Math.max(0.25, 1 - (s.hegemonyUpgrades?.industry || 0) * 0.15);
    totalCost = Math.floor(totalCost * indDiscount);

    if (s.balance < totalCost) {
      return { ok: false, msg: `💸 Precisa de ${this.fmt(totalCost)} para construir ${count > 1 ? count + 'x' : ''}.` };
    }

    s.balance -= totalCost;
    fstate.level += count;
    s.stats.totalBuilt += count;

    // Atualiza stats nacionais e impactos setoriais
    const fname = (fdata.name || '').toLowerCase();
    const fcat = fdata.cat || '';

    // Efeitos em saúde pública e leitos hospitalares
    if (fcat === 'social' && (fname.includes('hospital') || fname.includes('clínica') || fname.includes('saúde') || fname.includes('sanitário') || fname.includes('médic'))) {
      s.hospitalCapacity = (s.hospitalCapacity || 80) + Math.max(10, Math.floor((fdata.jobs || 10) * 2.5 * count));
    } else if (fcat === 'social' || fcat === 'infra') {
      s.hospitalCapacity = (s.hospitalCapacity || 80) + Math.max(1, Math.floor((fdata.jobs || 5) * 0.4 * count));
    }

    // Efeitos em alfabetização e progresso intelectual
    if (fname.includes('escola') || fname.includes('universidade') || fname.includes('instituto') || fname.includes('pesquisa') || fname.includes('biblioteca') || fname.includes('educa') || fcat === 'tech') {
      const litGain = Math.min(0.35 * count, (100 - (s.literacyRate || 72)) * 0.06);
      s.literacyRate = Math.min(99.9, Number(((s.literacyRate || 72) + litGain).toFixed(2)));
    }

    // Imigração qualificada controlada (não explode mais 5x cegamente!)
    // Cidadãos só imigram se houver vagas de emprego reais sobrando no país
    const totalJobsNow = this.getTotalJobs();
    const pea = Math.round(s.population * (s.workingAgePct || 0.65));
    const vacancies = Math.max(0, totalJobsNow - pea);
    if (vacancies > 0) {
      const immigrantGain = Math.min(vacancies, Math.ceil((fdata.jobs || 2) * count * 0.4));
      s.population += immigrantGain;
    }

    s.pollution   = Math.min(100, s.pollution + (fdata.pollution * count));

    this.sound.build();
    this.notify('build', { facilityId, count, cost: totalCost });
    return { ok: true, msg: `🏗️ Construído ${count > 1 ? count + 'x ' : ''}${fdata.name}!` };
  }

  buildFacility(facilityId, tileId) {
    // Wrapper retrocompatível: constrói direto e associa tile se especificado
    return this.buildFacilityDirect(facilityId, 1);
  }

  upgradeFacility(facilityId) {
    const fdata = window.GAME_DATA.facilities.find(f => f.id === facilityId);
    if (!fdata) return { ok: false, msg: 'Inválido.' };
    const s = this.state;
    const fstate = s.facilities[facilityId];
    if (!fstate || fstate.level === 0) return { ok: false, msg: '⚠️ Construa primeiro.' };

    const upIdx = fstate.upgradeLevel;
    const upgrade = fdata.upgrades[upIdx];
    if (!upgrade) return { ok: false, msg: '✅ Todos os upgrades aplicados!' };

    // Requisito de nível mínimo da instalação para progressão cadenciada
    const minLevelReq = upIdx === 0 ? 3 : (upIdx === 1 ? 8 : 15);
    if (fstate.level < minLevelReq) {
      return {
        ok: false,
        msg: `⚙️ Requer ${fdata.name} no Nível ${minLevelReq} para desbloquear este upgrade!`
      };
    }

    const indDiscount = Math.max(0.25, 1 - (s.hegemonyUpgrades?.industry || 0) * 0.15);
    const finalCost = Math.floor(upgrade.cost * indDiscount);

    if (s.balance < finalCost) return { ok: false, msg: `💸 Precisa de ${this.fmt(finalCost)}.` };
    s.balance -= finalCost;
    fstate.upgradeLevel++;

    this.sound.build();
    this.notify('upgrade', { facilityId, upgrade });
    return { ok: true, msg: `⬆️ ${upgrade.name} ativado!` };
  }

  // ──────────────────────────────────────
  // PARQUE INDUSTRIAL — Favoritos & Estatísticas
  // ──────────────────────────────────────
  toggleFavoriteFacility(facilityId) {
    const s = this.state;
    if (!s.facilities[facilityId]) {
      s.facilities[facilityId] = { level: 0, upgradeLevel: 0, isFavorite: false };
    }
    const fstate = s.facilities[facilityId];
    fstate.isFavorite = !fstate.isFavorite;

    if (!s.favorites) s.favorites = [];
    if (fstate.isFavorite) {
      if (!s.favorites.includes(facilityId)) s.favorites.push(facilityId);
    } else {
      s.favorites = s.favorites.filter(id => id !== facilityId);
    }

    this.sound.coin();
    this.save();
    this.notify('favoriteToggled', { facilityId, isFavorite: fstate.isFavorite });
    return fstate.isFavorite;
  }

  getParqueIndustrialStats() {
    const s = this.state;
    let totalUnits = 0;
    let totalProd = 0;
    let favCount = 0;

    Object.entries(s.facilities).forEach(([fid, fstate]) => {
      if (fstate.level > 0) {
        totalUnits += fstate.level;
        const fdata = window.GAME_DATA.facilities.find(f => f.id === fid);
        if (fdata) {
          const lvlMult = Math.pow(1.15, fstate.level - 1);
          const upMult = 1 + (fstate.upgradeLevel * 0.3);
          totalProd += fdata.prodPerHour * lvlMult * upMult;
        }
      }
      if (fstate.isFavorite) favCount++;
    });

    return {
      totalUnits,
      totalProd: Math.round(totalProd * (s.treasuryMultiplier || 1.0)),
      favCount
    };
  }

  // ──────────────────────────────────────
  // DEFESA & DISSUASÃO — Comandos Operacionais (Correção 5)
  // ──────────────────────────────────────
  setDefcon(level) {
    if (level < 1 || level > 5) return;
    this.state.defense.defcon = level;
    this.sound.crisis();
    this.save();
    this.notify('defconChanged', { level });
  }

  upgradeNuclearDeterrence() {
    const d = this.state.defense;
    const nextLvl = (d.nuclearLevel || 1) + 1;
    const lvlData = window.GAME_DATA.defense?.nuclearDeterrenceLevels?.find(l => l.level === nextLvl);
    if (!lvlData) return { ok: false, msg: '⚠️ Nível máximo de dissuasão atingido!' };
    if (this.state.balance < lvlData.cost) return { ok: false, msg: `💸 Precisa de ${this.fmt(lvlData.cost)}.` };
    this.state.balance -= lvlData.cost;
    d.nuclearLevel = nextLvl;
    this.sound.unlock();
    this.save();
    this.notify('defenseUpdated', {});
    return { ok: true, msg: `☢️ Dissuasão elevada para ${lvlData.name}!` };
  }

  recruitDefenseUnit(unitId, count = 1) {
    const u = window.GAME_DATA.defense?.units?.find(item => item.id === unitId);
    if (!u) return { ok: false, msg: '❌ Unidade inexistente.' };
    const cost = u.cost * count;
    if (this.state.balance < cost) return { ok: false, msg: `💸 Precisa de ${this.fmt(cost)}.` };
    this.state.balance -= cost;
    this.state.defense.units[unitId] = (this.state.defense.units[unitId] || 0) + count;
    this.state.militarySize = (this.state.militarySize || 100) + (u.power * count);
    this.sound.build();
    this.save();
    this.notify('defenseUpdated', {});
    return { ok: true, msg: `🪖 Recrutou ${count > 1 ? count + 'x ' : ''}${u.name}!` };
  }

  buildMilitaryBase(baseId) {
    const b = window.GAME_DATA.defense?.militaryBases?.find(item => item.id === baseId);
    if (!b) return { ok: false, msg: '❌ Base inexistente.' };
    if (this.state.defense.bases[baseId]) return { ok: false, msg: '✅ Base já construída!' };
    if (this.state.balance < b.cost) return { ok: false, msg: `💸 Precisa de ${this.fmt(b.cost)}.` };
    this.state.balance -= b.cost;
    this.state.defense.bases[baseId] = true;
    this.sound.build();
    this.save();
    this.notify('defenseUpdated', {});
    return { ok: true, msg: `🏢 ${b.name} construída!` };
  }

  launchMilitaryOperation(opId) {
    const op = window.GAME_DATA.defense?.militaryOperations?.find(item => item.id === opId);
    if (!op) return { ok: false, msg: 'Operação inexistente.' };
    if (this.state.balance < op.cost) return { ok: false, msg: `💸 Precisa de ${this.fmt(op.cost)}.` };
    this.state.balance -= op.cost;
    const milBonus = 1 + (this.state.hegemonyUpgrades?.military || 0) * 0.30;
    const defMinBonus = 1 + ((this.state.ministers?.min_def?.level || 1) - 1) * 0.08;
    const successRate = Math.min(0.95, 0.75 * milBonus * defMinBonus);
    const isSuccess = Math.random() < successRate;

    if (isSuccess) {
      const rewardCash = Math.floor(op.cost * 2.5 * milBonus);
      this.state.balance += rewardCash;
      this.state.totalEarned += rewardCash;
      this.state.powerScore += Math.floor(50 * milBonus);
      this.state.xp += 100;
      this.sound.unlock();
      this.notify('operationComplete', { op, success: true });
      return { ok: true, msg: `🎯 Sucesso na Operação: ${op.name}! Ganho: +${this.fmt(rewardCash)} e +50 Poder!` };
    } else {
      this.sound.crisis();
      this.notify('operationComplete', { op, success: false });
      return { ok: false, msg: `⚠️ Operação repelida: ${op.name}. Forças sofreram atrito.` };
    }
  }

  // ──────────────────────────────────────
  // ÁRVORE TECNOLÓGICA — Pesquisa & P&D (Correção 6)
  // ──────────────────────────────────────
  startResearch(techId) {
    const t = window.GAME_DATA.techTree?.techs?.find(item => item.id === techId);
    if (!t) return { ok: false, msg: '❌ Tecnologia inexistente.' };
    if (this.state.tech.unlocked[techId]) return { ok: false, msg: '✅ Tecnologia já pesquisada!' };
    const hasPrereqs = (t.prereqs || []).every(p => this.state.tech.unlocked[p]);
    if (!hasPrereqs) return { ok: false, msg: '🔒 Pré-requisitos não atendidos.' };
    if (this.state.balance < t.cost) return { ok: false, msg: `💸 Precisa de ${this.fmt(t.cost)}.` };

    this.state.balance -= t.cost;
    this.state.tech.researchingId = techId;
    this.state.tech.researchProgress = 0;

    const sciBonus = Math.max(0.20, 1 - (this.state.hegemonyUpgrades?.science || 0) * 0.20);
    const techMinBonus = Math.max(0.50, 1 - ((this.state.ministers?.min_tech?.level || 1) - 1) * 0.10);
    this.state.tech.researchTimeTotal = Math.max(1, Math.ceil(t.time * sciBonus * techMinBonus));

    this.sound.build();
    this.save();
    this.notify('techUpdated', {});
    return { ok: true, msg: `🔬 Pesquisa iniciada: ${t.name} (${this.state.tech.researchTimeTotal}s)!` };
  }

  // ──────────────────────────────────────
  // PROVÍNCIAS / TILES — Especialização & Desbloqueio
  // ──────────────────────────────────────
  setTileSpecialization(tileId, specId) {
    const s = this.state;
    const tile = s.tiles.find(t => t.id === tileId);
    if (!tile) return { ok: false, msg: 'Tile inexistente.' };
    if (tile.state === 'locked') return { ok: false, msg: 'Desbloqueie o território primeiro.' };

    const spec = (window.GAME_DATA.provinceSpecializations || []).find(sp => sp.id === specId);
    if (!spec) return { ok: false, msg: 'Especialização inválida.' };

    tile.specialization = specId;
    tile.name = spec.name;
    this.sound.coin();
    this.notify('tileUpdated', { tile });
    return { ok: true, msg: `🏛️ Território ${tileId} agora é: ${spec.name}!` };
  }

  // ──────────────────────────────────────
  // TILES — Desbloquear
  // ──────────────────────────────────────
  unlockTile(tileId) {
    const s = this.state;
    const tile = s.tiles.find(t => t.id === tileId);
    if (!tile || tile.state !== 'locked') return { ok: false, msg: '❌ Tile inválido.' };

    // Verificar se tile adjacente está ativo
    const adjacent = this._adjacentTiles(tileId);
    const hasActive = adjacent.some(id => {
      const t = s.tiles.find(t => t.id === id);
      return t && (t.state === 'active' || t.state === 'core');
    });
    if (!hasActive) return { ok: false, msg: '📍 Desbloqueie tiles adjacentes primeiro.' };

    if (s.balance < tile.unlockCost) return { ok: false, msg: `💸 Precisa de ${this.fmt(tile.unlockCost)}.` };
    s.balance -= tile.unlockCost;
    tile.state = 'empty'; // empty = desbloqueado, mas sem instalação

    this.sound.unlock();
    this.notify('tileUnlocked', { tileId });
    return { ok: true, msg: `🗺️ Território ${tileId} desbloqueado!` };
  }

  _adjacentTiles(id) {
    const adj = {
      0:[1,3], 1:[0,2,4], 2:[1,5],
      3:[0,4,6], 4:[1,3,5,7], 5:[2,4,8],
      6:[3,7], 7:[4,6,8], 8:[5,7]
    };
    return adj[id] || [];
  }

  // ──────────────────────────────────────
  // MERCADO DE COMMODITIES
  // ──────────────────────────────────────
  _updateMarket() {
    const s = this.state;
    window.GAME_DATA.commodities.forEach(c => {
      const cd = s.commodities[c.id];
      const change = (Math.random() - 0.48) * c.volatility;
      cd.price = Math.max(c.basePrice * 0.3, cd.price + change);
      cd.history.push(Math.round(cd.price * 100) / 100);
      if (cd.history.length > 30) cd.history.shift();
    });
    this.notify('marketUpdate', {});
  }

  buyCommodity(commId, qty) {
    const s = this.state;
    const cd = s.commodities[commId];
    const total = cd.price * qty;
    if (s.balance < total) return { ok: false, msg: `💸 Precisa de ${this.fmt(total)}.` };
    s.balance -= total;
    cd.inventory += qty;
    return { ok: true, msg: `✅ Comprou ${qty} unidades.` };
  }

  sellCommodity(commId, qty) {
    const s = this.state;
    const cd = s.commodities[commId];
    if (!cd || cd.inventory < qty) return { ok: false, msg: '⚠️ Estoque insuficiente.' };
    cd.inventory -= qty;
    const mktBonus = 1 + (s.hegemonyUpgrades?.market || 0) * 0.20;
    const total = (cd.price * qty) * mktBonus;
    s.balance += total;
    s.totalEarned += total;
    return { ok: true, msg: `✅ Vendido por ${this.fmt(total)}!` };
  }

  // ──────────────────────────────────────
  // EVENTOS ALEATÓRIOS
  // ──────────────────────────────────────
  _maybeEvent() {
    if (this.activeEvent) return;
    if (Math.random() > 0.35) return;
    const events = window.GAME_DATA.events;
    const ev = events[Math.floor(Math.random() * events.length)];
    this.activeEvent = ev;
    this.sound.crisis();
    this.notify('event', { event: ev });

    // Duração do evento
    clearTimeout(this.eventTimer);
    this.eventTimer = setTimeout(() => {
      this.activeEvent = null;
      this.notify('eventEnd', { event: ev });
    }, ev.duration * 1000);
  }

  triggerEvent(eventId) {
    const ev = window.GAME_DATA.events.find(e => e.id === eventId);
    if (!ev) return;
    this.activeEvent = ev;
    this.sound.crisis();
    this.notify('event', { event: ev });
    clearTimeout(this.eventTimer);
    this.eventTimer = setTimeout(() => {
      this.activeEvent = null;
      this.notify('eventEnd', { event: ev });
    }, ev.duration * 1000);
  }

  // ──────────────────────────────────────
  // SISTEMA DE IA E NPCS DINÂMICOS (RUBBER-BANDING)
  // ──────────────────────────────────────
  getDynamicNpcStats(nationId) {
    const nation = (window.GAME_DATA?.nations || []).find(n => n.id === nationId) || {
      id: nationId,
      name: nationId,
      power: 1000,
      gdp: '$100B',
      archetype: 'Econômico'
    };

    const s = this.state;
    const playerCapital = Math.max(s.balance || 0, s.totalEarned || 0, (s.gdpPerHour || 0) * 24, 10000);
    const playerPower = Math.max(s.powerScore || 0, (s.level || 0) * 30, 200);

    // Hash pseudo-aleatório determinístico pelo ID para variações consistentes
    let hash = 0;
    const idStr = String(nation.id || 'nat');
    for (let i = 0; i < idStr.length; i++) {
      hash = (hash << 5) - hash + idStr.charCodeAt(i);
      hash |= 0;
    }
    const seed = Math.abs(hash);
    const variance = (seed % 25) / 100; // 0.00 a 0.24

    // Parse do GDP base estático
    let baseGdpNumeric = 1e9;
    if (typeof nation.gdp === 'number') {
      baseGdpNumeric = nation.gdp;
    } else if (typeof nation.gdp === 'string') {
      const numStr = nation.gdp.replace(/[^0-9.]/g, '');
      const val = parseFloat(numStr) || 1;
      if (nation.gdp.includes('T')) baseGdpNumeric = val * 1e12;
      else if (nation.gdp.includes('B')) baseGdpNumeric = val * 1e9;
      else if (nation.gdp.includes('M')) baseGdpNumeric = val * 1e6;
      else if (nation.gdp.includes('Qa')) baseGdpNumeric = val * 1e15;
      else baseGdpNumeric = val;
    }

    const basePower = nation.power || 1000;

    // Classificação de Tier:
    // Top-Tier (Superpotências): EUA, China, Rússia, ou potências com basePower >= 7000
    // Mid-Tier: 3000 <= basePower < 7000
    // Bottom-Tier: basePower < 3000
    let tier = 'mid';
    let powerRatio = 0.70 + variance; // 70% a 94%
    let capitalRatio = 0.75 + variance; // 75% a 99%

    const topTierIds = ['usa', 'china', 'russia', 'npc_usa', 'npc_chn', 'npc_rus'];
    if (topTierIds.includes(nation.id) || basePower >= 7000) {
      tier = 'top';
      // Regra Rubber-Banding: 110% a 140% do jogador
      powerRatio = 1.15 + variance; // 1.15 a 1.39
      capitalRatio = 1.20 + variance; // 1.20 a 1.44
    } else if (basePower < 3000) {
      tier = 'bottom';
      // Bottom tier: 20% a 50%
      powerRatio = 0.20 + variance * 1.2; // 0.20 a 0.48
      capitalRatio = 0.25 + variance * 1.0; // 0.25 a 0.49
    }

    const dynamicPower = Math.max(basePower, Math.floor(playerPower * powerRatio));
    const dynamicGdpNumeric = Math.max(baseGdpNumeric, Math.floor(playerCapital * capitalRatio));

    return {
      id: nation.id,
      name: nation.name,
      icon: nation.flag || nation.icon || '🌐',
      flag: nation.flag || nation.icon || '🌐',
      tier,
      power: dynamicPower,
      powerFormatted: this.fmtNum(dynamicPower),
      gdpNumeric: dynamicGdpNumeric,
      gdpFormatted: this.fmt(dynamicGdpNumeric),
      pop: nation.pop || '50M',
      region: nation.region || 'Global',
      archetype: nation.archetype || 'Econômico',
      bonus: nation.bonus || '+15% diplomacia',
      allianceCost: Math.max(5000, Math.floor(dynamicGdpNumeric * 0.0005)),
      tradeCost: Math.max(1000, Math.floor(dynamicGdpNumeric * 0.0001)),
      peaceCost: Math.max(500, Math.floor(dynamicGdpNumeric * 0.00005))
    };
  }

  // ──────────────────────────────────────
  // DIPLOMACIA
  // ──────────────────────────────────────
  sendDiplomacy(nationId, action) {
    const s = this.state;
    const nation = window.GAME_DATA.nations.find(n => n.id === nationId);
    if (!nation) return { ok: false, msg: 'Nação inexistente.' };

    if (!s.relations[nationId]) s.relations[nationId] = { status: 'neutral', trust: 0 };
    const rel = s.relations[nationId];

    const dyn = this.getDynamicNpcStats(nationId);
    const costs = {
      alliance: dyn.allianceCost,
      trade: dyn.tradeCost,
      peace: dyn.peaceCost,
      war: 0
    };
    const cost = costs[action] || 0;
    if (s.balance < cost) return { ok: false, msg: `💸 Requer ${this.fmt(cost)} para esta ação com ${nation.name}.` };
    s.balance -= cost;

    switch(action) {
      case 'alliance':
        rel.status = 'ally';
        rel.trust = Math.min(100, rel.trust + 30);
        s.influence += 50;
        break;
      case 'trade':
        rel.status = 'trade';
        rel.trust = Math.min(100, rel.trust + 15);
        s.gdpPerHour = Math.round(s.gdpPerHour * 1.05);
        break;
      case 'war':
        rel.status = 'war';
        rel.trust = Math.max(-100, rel.trust - 50);
        s.stability = Math.max(0, s.stability - 10);
        break;
      case 'peace':
        rel.status = 'neutral';
        rel.trust = Math.min(100, rel.trust + 20);
        s.stability = Math.min(100, s.stability + 5);
        break;
    }
    this.notify('diplomacy', { nationId, action, dyn });
    return { ok: true, msg: `Tratado firmado com ${nation.name}!` };
  }

  // ──────────────────────────────────────
  // MINIJOGO — Recompensa
  // ──────────────────────────────────────
  completeMiniGame(gameId, score) {
    const s = this.state;
    const bonus = Math.floor(s.gdpPerHour * (score / 100) * 5);
    const xpBonus = score * 2;
    s.balance += bonus;
    s.totalEarned += bonus;
    s.xp += xpBonus;
    s.influence += Math.floor(score / 10);
    this._checkLevel();
    this.sound.minigame();
    this.notify('minigameComplete', { gameId, bonus, xpBonus, score });
    return { bonus, xpBonus };
  }

  // ──────────────────────────────────────
  // SISTEMA DE NÚMEROS GRANDES INFINITOS
  // ──────────────────────────────────────
  formatNumber(val, decimals = 2) {
    if (val === null || val === undefined || isNaN(val)) return '0,00';
    if (!isFinite(val)) return '∞ Infinito';
    if (val === 0) return '0,00';

    const isNegative = val < 0;
    val = Math.abs(val);

    if (val < 1000) {
      return (isNegative ? '-' : '') + val.toFixed(decimals).replace('.', ',');
    }

    if (this.getSetting('numberFormat') === 'sci') {
      return (isNegative ? '-' : '') + val.toExponential(2);
    }

    const suffixes = [
      '', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No',
      'Dc', 'Ud', 'Dd', 'Td', 'Qad', 'Qid', 'Sxd', 'Spd', 'Ocd', 'Nvd',
      'Vg', 'Uvg', 'Dvg', 'Tvg', 'Qavg', 'Qivg', 'Sxvg', 'Spvg', 'Ocvg', 'Nvvg',
      'Tg'
    ];

    const exp = Math.floor(Math.log10(val));
    const tier = Math.floor(exp / 3);

    if (tier < suffixes.length) {
      const suffix = suffixes[tier];
      const scaled = val / Math.pow(10, tier * 3);
      const dec = scaled >= 100 ? 1 : decimals;
      return (isNegative ? '-' : '') + scaled.toFixed(dec).replace('.', ',') + ' ' + suffix;
    } else {
      const base = val / Math.pow(10, exp);
      return (isNegative ? '-' : '') + base.toFixed(2).replace('.', ',') + 'e' + exp;
    }
  }

  fmt(val) {
    if (val === null || val === undefined || isNaN(val)) return '$0,00';
    if (!isFinite(val)) return '$∞ Infinito';
    if (val === 0) return '$0,00';
    const isNegative = val < 0;
    const formatted = this.formatNumber(Math.abs(val), 2);
    return (isNegative ? '-$' : '$') + formatted;
  }

  fmtNum(val) {
    if (val === null || val === undefined || isNaN(val)) return '0';
    if (!isFinite(val)) return '∞';
    if (val === 0) return '0';
    if (Math.abs(val) < 1000) return Math.floor(val).toLocaleString('pt-BR');
    return this.formatNumber(val, 1);
  }

  // ──────────────────────────────────────
  // PUB/SUB EVENTS
  // ──────────────────────────────────────
  subscribe(fn) { this.listeners.push(fn); }
  notify(event, data) {
    this.listeners.forEach(fn => { try { fn(event, data); } catch(e){} });
  }

  // ──────────────────────────────────────
  // AÇÕES SOBERANAS RÁPIDAS & INTERVENÇÕES
  // ──────────────────────────────────────
  actionEmergencyLiquidity() {
    const s = this.state;
    // Injeção de liquidez de emergência (1.5 horas de PIB ou mín $250)
    const baseGain = Math.max(250, Math.floor((s.gdpPerHour || 100) * 1.5));
    const gain = Math.floor(baseGain * (s.treasuryMultiplier || 1.0));
    s.balance += gain;
    s.totalEarned += gain;
    s.stability = Math.max(5, s.stability - 3);
    s.approval = Math.max(5, (s.approval || 45) - 2);
    this.sound.coin();
    this.notify('actionQuick', { type: 'liquidity', gain });
    return { ok: true, gain, msg: `💵 Injeção de Emergência de ${this.fmt(gain)} creditada! (-3% Estabilidade)` };
  }

  actionHealthDrive() {
    const s = this.state;
    const cost = Math.max(30, Math.floor(s.balance * 0.05));
    if (s.balance < cost) {
      return { ok: false, msg: `💸 Tesouro insuficiente. Necessário ${this.fmt(cost)} para o mutirão hospitalar.` };
    }
    s.balance -= cost;
    const cured = Math.max(5, Math.floor((s.hospitalized || 0) * 0.45));
    s.hospitalized = Math.max(0, (s.hospitalized || 0) - cured);
    s.hospitalCapacity = (s.hospitalCapacity || 80) + 20; // +20 leitos de campanha
    s.stability = Math.min(100, (s.stability || 50) + 4);
    s.happiness = Math.min(100, (s.happiness || 50) + 5);
    this.sound.unlock();
    this.notify('actionQuick', { type: 'health', cured });
    return { ok: true, cured, msg: `🏥 Mutirão Nacional de Saúde: ${cured} cidadãos tratados e curados! (+20 Leitos, +4% Estabilidade)` };
  }

  actionLiteracyDrive() {
    const s = this.state;
    const cost = Math.max(40, Math.floor(s.balance * 0.04));
    if (s.balance < cost) {
      return { ok: false, msg: `💸 Tesouro insuficiente. Necessário ${this.fmt(cost)} para a bolsa alfabetização.` };
    }
    s.balance -= cost;
    const litGain = Math.min(2.5, Number(((100 - (s.literacyRate || 72)) * 0.12).toFixed(2)));
    s.literacyRate = Math.min(99.9, Number(((s.literacyRate || 72) + litGain).toFixed(2)));
    const xpGain = Math.max(40, Math.floor(cost * 0.6));
    s.xp += xpGain;
    if (s.tech && s.tech.researchingId) {
      s.tech.researchProgress = (s.tech.researchProgress || 0) + 5;
    }
    this._checkLevel();
    this.sound.levelUp();
    this.notify('actionQuick', { type: 'literacy', litGain, xpGain });
    return { ok: true, litGain, xpGain, msg: `🎓 Campanha de Alfabetização Ativa: +${litGain}% alfabetização e +${xpGain} XP!` };
  }

  actionEmergencyJobs() {
    const s = this.state;
    const cost = Math.max(50, Math.floor(s.balance * 0.05));
    if (s.balance < cost) {
      return { ok: false, msg: `💸 Tesouro insuficiente. Necessário ${this.fmt(cost)} para o plano de obras públicas.` };
    }
    s.balance -= cost;
    s.emergencyJobs = (s.emergencyJobs || 0) + 40;
    s.stability = Math.min(100, (s.stability || 50) + 3);
    s.approval = Math.min(100, (s.approval || 45) + 6);
    this.sound.build();
    this.notify('actionQuick', { type: 'jobs', count: 40 });
    return { ok: true, count: 40, msg: `💼 Frente de Obras Públicas aberta: +40 postos de trabalho de emergência criados!` };
  }

  actionPresidentialAddress() {
    const s = this.state;
    const now = Date.now();
    const cooldown = 45000; // 45s de intervalo
    if (s.lastAddressTime && (now - s.lastAddressTime < cooldown)) {
      const remain = Math.ceil((cooldown - (now - s.lastAddressTime)) / 1000);
      return { ok: false, msg: `⏳ Aguarde ${remain}s para outro pronunciamento à nação.` };
    }
    s.lastAddressTime = now;
    s.stability = Math.min(100, (s.stability || 50) + 8);
    s.approval = Math.min(100, (s.approval || 45) + 12);
    s.influence += 15;
    this.sound.tap(true);
    this.notify('actionQuick', { type: 'speech' });
    return { ok: true, msg: `📢 Pronunciamento em Cadeia Nacional realizado! (+8% Estabilidade, +12% Aprovação Popular)` };
  }

  // ──────────────────────────────────────
  // XP PROGRESS
  // ──────────────────────────────────────
  xpProgress() {
    const req = this._xpRequired(this.state.level);
    return { current: this.state.xp, required: req, pct: Math.min(100, (this.state.xp / req) * 100) };
  }
}

// Instância global
window.engine = new GameEngine();
