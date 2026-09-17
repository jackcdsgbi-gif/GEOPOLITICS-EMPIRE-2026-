/**
 * GEOPOLITICS EMPIRE 2026 — Master UI Controller
 * Conecta engine, grid territorial, categorias, modais, toasts e sparkline.
 */

class MasterUI {
  constructor() {
    window.ui = this;
    this.currentTab = 'fundacao';
    this.currentMultTab = 'tap';
    this.sparkHistory = [0];
    this.selectedTileId = null;
    this.catSubTab = 'available';
    this.currentCatId = null;
    this.currentFacId = null;
    this.completedMissions = new Set();

    // Parque Industrial State (Correção 2)
    this.parqueSearch = '';
    this.parqueSubtab = 'cat'; // 'cat' | 'era' | 'status'
    this.parqueFilterChip = 'all';
    this.parqueSort = 'prod_desc';

    // Commodities Family State (Correção 3)
    this.commFamily = 'all';

    // Nations Filter State (Correção 4)
    this.nationsRegion = 'all';
    this.nationsSearch = '';

    // Defense State (Correção 5)
    this.defSubTab = 'alert'; // 'alert' | 'forces' | 'bases' | 'ops'
    this.defForceFilter = 'all';

    // Tech Tree State (Correção 6)
    this.techBranch = 'militar';

    // AI Feed State (Correção 1)
    this.aiFeedEvents = [];

    // Notificações & O Grande Reset State
    this.toastQueue = [];
    this.lastToast = { msg: '', ts: 0, count: 1, element: null };
    this.MAX_VISIBLE_TOASTS = 3;
    this.notificationHistory = [];

    // Global helper para caixinhas do topo
    window.showTabModal = (t) => this.openStatModal(t.replace('stat-',''));

    // Subscreve ao motor
    window.engine.subscribe((ev, data) => this._onEngineEvent(ev, data));

    this._initTheme();
    this._initTapButton();
    this._initOnboarding();
    this._initSettings();
    this._initAiFeed();
    this.renderAll();

    // Sparkline a cada 4 segundos
    setInterval(() => this._tickSparkline(), 4000);
  }

  // ─────────────────────────────────────
  // INICIALIZAÇÃO
  // ─────────────────────────────────────
  _initOnboarding() {
    const s = window.engine.state;
    if (s.onboardingDone) {
      document.getElementById('onboarding-overlay').style.display = 'none';
      return;
    }

    let slide = 0;
    const slides = document.querySelectorAll('.ob-slide');
    const dots   = document.querySelectorAll('.ob-dot');
    const btn    = document.getElementById('ob-next-btn');

    const goTo = (n) => {
      slides.forEach(s => s.classList.remove('active'));
      dots.forEach(d => d.classList.remove('active'));
      slides[n].classList.add('active');
      dots[n].classList.add('active');
      if (n === 2) btn.textContent = '🚀 Iniciar Nação!';
      else btn.textContent = 'Próximo →';
    };

    btn.addEventListener('click', () => {
      if (slide === 0) { slide = 1; goTo(1); return; }
      if (slide === 1) {
        const nation = document.getElementById('nation-name-input').value.trim();
        const leader = document.getElementById('leader-name-input').value.trim();
        if (nation) { window.engine.state.nationName = nation; }
        if (leader) { window.engine.state.leaderName = leader; }
        slide = 2; goTo(2); return;
      }
      // Slide 3 — iniciar
      window.engine.state.onboardingDone = true;
      window.engine.save();
      const overlay = document.getElementById('onboarding-overlay');
      overlay.style.animation = 'fade-out 0.5s forwards';
      setTimeout(() => overlay.style.display = 'none', 500);
      this.renderAll();
      this.showToast('🌍 Bem-vindo, ' + (window.engine.state.leaderName || 'Presidente') + '! Toque no Núcleo de Soberania para começar.', 'info');
    });
  }

  _initTapButton() {
    const btn = document.getElementById('tap-btn');
    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      const result = window.engine.tap();
      this._onTap(result, e);
    });
  }

  _initSettings() {
    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => {
        this.openSettingsModal();
      });
    }
    const notifBtn = document.getElementById('notif-btn');
    if (notifBtn) {
      notifBtn.addEventListener('click', () => {
        this.openNotificationsModal();
      });
    }

    // Inicializa telemetria e otimizações se configurado
    if (window.engine?.getSetting?.('fpsTelemetry', false)) {
      this._toggleFpsTelemetry(true);
    }
    if (window.engine?.getSetting?.('disableBgBlur', false)) {
      document.body.classList.add('no-blur');
    }
    if (window.engine?.getSetting?.('lowSpecMode', false)) {
      document.body.classList.add('low-spec');
    }
  }

  // ─────────────────────────────────────
  // TAP — Floating Numbers
  // ─────────────────────────────────────
  _onTap(result, evt) {
    const btn = document.getElementById('tap-btn');
    btn.classList.add('tapped');
    setTimeout(() => btn.classList.remove('tapped'), 100);

    // Feedback háptico (se habilitado)
    this.vibrate(result.isCrit ? 35 : 15);

    // Screen shake em acertos críticos
    if (result.isCrit) {
      this.screenShake();
    }

    // Floating number (se habilitado)
    if (window.engine?.getSetting?.('floatingTapNumbers', true) !== false) {
      this._spawnFloat(result.earned, result.isCrit, evt);
    }

    // Combo display
    const comboEl = document.getElementById('combo-display');
    if (result.combo > 1) {
      comboEl.textContent = `🔥 ×${result.combo} COMBO`;
      comboEl.classList.add('visible');
    } else {
      comboEl.classList.remove('visible');
    }

    // Crit flash
    if (result.isCrit) {
      const critEl = document.getElementById('crit-flash');
      critEl.classList.add('active');
      setTimeout(() => critEl.classList.remove('active'), 500);
    }

    this._updateHeader();
    this._updateFundacaoStats();
  }

  _spawnFloat(amount, isCrit, evt) {
    const zone = document.getElementById('tap-zone');
    const zoneRect = zone.getBoundingClientRect();
    const el = document.createElement('div');
    el.className = 'float-num' + (isCrit ? ' crit' : '');
    el.textContent = (isCrit ? '⚡ ' : '+') + window.engine.fmt(amount);

    const x = (evt ? evt.clientX : zoneRect.left + zoneRect.width/2) - zoneRect.left;
    const y = (evt ? evt.clientY : zoneRect.top + zoneRect.height/2) - zoneRect.top;
    el.style.left = (x - 30 + (Math.random()-0.5)*40) + 'px';
    el.style.top  = (y - 20) + 'px';

    zone.style.position = 'relative';
    zone.appendChild(el);
    setTimeout(() => el.remove(), 1200);
  }

  // ─────────────────────────────────────
  // ENGINE EVENTS
  // ─────────────────────────────────────
  _onEngineEvent(ev, data) {
    switch(ev) {
      case 'tick':
        this._updateHeader();
        this._updateFundacaoStats();
        break;
      case 'levelUp':
        this._handleLevelUpToast(data);
        this._updateHeader();
        this._debouncedRenderCategories();
        break;
      case 'phaseUp':
        const phaseNames = {1:'O Sobrevivente',2:'A Nação Industrial',3:'O Império Global'};
        this.showToast(`👑 FASE ${data.phase} — ${phaseNames[data.phase]}!`, 'level');
        this._updatePhaseBadge();
        break;
      case 'tileComplete':
        this.showToast(`✅ ${data.tile.name} construída!`, 'success');
        if (this.currentTab === 'territorio') this.renderParqueIndustrial();
        if (this.currentTab === 'cadeia') this.renderActiveFacilities();
        break;
      case 'tileUnlocked':
        this.showToast(`🗺️ Novo território desbloqueado!`, 'success');
        if (this.currentTab === 'territorio') this.renderParqueIndustrial();
        break;
      case 'build':
        this._updateHeader();
        if (this.currentTab === 'territorio') this.renderParqueIndustrial();
        break;
      case 'event':
        this._showEventBanner(data.event);
        break;
      case 'eventEnd':
        this._hideEventBanner();
        break;
      case 'marketUpdate':
        if (this.currentTab === 'mundo') this.renderCommodities();
        break;
      case 'minigameComplete':
        this.showToast(`🎮 Missão +${window.engine.fmt(data.bonus)} e +${data.xpBonus} XP!`, 'success');
        break;
      case 'grandeReset':
        this.showToast(`🌌 O GRANDE RESET FOI CONCLUÍDO! Ascensão Hegemônica alcançada!`, 'heg');
        this.renderAll();
        break;
      case 'hegemonyUpgrade':
        this.renderGrandeResetModal();
        this._updateHeader();
        break;
      case 'ministerLevelUp':
        this._renderCabinet();
        this._updateHeader();
        break;
      case 'reset':
        this.renderAll();
        break;
    }
  }

  // ─────────────────────────────────────
  // TAB NAVIGATION
  // ─────────────────────────────────────
  switchTab(name) {
    this.currentTab = name;
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

    const pane = document.getElementById('tab-' + name);
    if (pane) pane.classList.add('active');
    const btn = document.getElementById('nav-' + name);
    if (btn) btn.classList.add('active');

    // Tab-specific renders
    if (name === 'territorio')    this.renderTerritoryTab();
    if (name === 'cadeia')        this.renderChainTab();
    if (name === 'instituicoes')  this.renderInstitutions();
    if (name === 'mundo') {
      this.renderWorldTab();
      if (window.mapModule) window.mapModule.invalidateSize();
    }
    if (name === 'missoes')       this.renderMissionsTab();

    // Scroll top
    document.getElementById('tab-content').scrollTop = 0;
  }

  // ─────────────────────────────────────
  // RENDER ALL
  // ─────────────────────────────────────
  renderAll() {
    this._updateHeader();
    this._updateFundacaoStats();
    this._updatePhaseBadge();
    this._updateNationBrand();
    this.renderTerritoryGrid();
    this.renderCategories();
    this.renderNations();
    this.renderCommodities();
    this.renderMissionsTab();
    this.renderInstitutions();
    this._drawSparkline();
  }

  // ─────────────────────────────────────
  // HEADER
  // ─────────────────────────────────────
  _updateHeader() {
    const s = window.engine.state;
    const e = window.engine;

    const setBoth = (id, val) => {
      this._setText(id, val);
      this._setText(id + '-dup', val);
    };

    setBoth('hdr-balance', e.fmt(s.balance));
    setBoth('hdr-gdp',     e.fmt(s.gdpPerHour) + '/h');
    setBoth('hdr-level',   'Nv.' + s.level);
    setBoth('hdr-pop',     e.fmtNum(s.population));
    setBoth('hdr-power',   e.fmtNum(s.powerScore));
    setBoth('hdr-influence', e.fmtNum(s.influence || 0));
    setBoth('hdr-legacy',  (s.totalResets || s.resets || 0) + 'x');

    const defLvl = s.defense?.defcon || 5;
    this._setText('hdr-defcon-badge', defLvl);
    setBoth('hdr-defcon', 'DEFCON ' + defLvl);
    const defColor = { 5: 'var(--green)', 4: 'var(--blue)', 3: '#EAB308', 2: '#F97316', 1: 'var(--red)' }[defLvl] || 'var(--green)';
    ['hdr-defcon', 'hdr-defcon-dup'].forEach(id => {
      const defEl = document.getElementById(id);
      if (defEl) defEl.style.color = defColor;
    });
    const defBadgeEl = document.getElementById('hdr-defcon-badge');
    if (defBadgeEl) defBadgeEl.style.backgroundColor = defColor;
  }

  _updateNationBrand() {
    const s = window.engine.state;
    this._setText('nation-name', (s.nationName || 'REPÚBLICA DE ARVENDIA').toUpperCase());
    this._setText('leader-title', s.leaderName || 'Presidente Soberano');
  }

  _updatePhaseBadge() {
    const s = window.engine.state;
    const badge = document.getElementById('phase-badge');
    const icons = {1:'⚔️', 2:'⚙️', 3:'👑'};
    const texts = {1:'FASE I', 2:'FASE II', 3:'FASE III'};
    badge.textContent = icons[s.phase] + ' ' + texts[s.phase];
    badge.className = 'phase-badge phase-' + s.phase;
  }

  // ─────────────────────────────────────
  // FUNDAÇÃO STATS
  // ─────────────────────────────────────
  _updateFundacaoStats() {
    const s = window.engine.state;
    const e = window.engine;
    const xp = e.xpProgress();

    this._setText('balance-display', e.fmt(s.balance));
    this._setText('gdp-display',     e.fmt(s.gdpPerHour));
    this._setText('session-display', e.fmt(s.totalEarned));
    this._setText('xp-level-display','Nv.' + s.level);
    this._setText('xp-pct',          Math.floor(xp.pct) + '%');
    const fill = document.getElementById('xp-fill');
    if (fill) fill.style.width = xp.pct + '%';

    // Tap earn display com multiplicadores
    const baseTapBonus = s.tapBonusBase || 0;
    const gdpTapBonus  = s.gdpPerHour * (s.tapGdpPct || 0.001);
    const levelTapBonus= s.level * 0.05;
    const base         = (0.01 + baseTapBonus + gdpTapBonus + levelTapBonus) * (s.tapMultiplier || 1.0) * (s.legacyMultiplier || 1.0);
    this._setText('tap-earn-display', '+' + e.fmt(base));

    // Multiplicadores da Fundação
    this.renderMultipliers();

    // Stat cards (9 métricas soberanas nacionais)
    this._setText('sc-balance',   e.fmt(s.balance));
    this._setText('sc-gdp',       e.fmt(s.gdpPerHour) + '/h');
    this._setText('sc-pop',       e.fmtNum(s.population));

    const totalJobs = e.getTotalJobs ? e.getTotalJobs() : 0;
    const unempRate = s.unemploymentRate !== undefined ? s.unemploymentRate : 8.5;
    this._setText('sc-jobs',      `${e.fmtNum(totalJobs)} (${unempRate}%)`);

    const hospRate = Math.round(((s.hospitalized || 0) / Math.max(1, s.hospitalCapacity || 80)) * 100);
    const healthEl = document.getElementById('sc-health');
    if (healthEl) {
      healthEl.textContent = `${e.fmtNum(s.hospitalized || 0)} / ${e.fmtNum(s.hospitalCapacity || 80)}`;
      healthEl.style.color = hospRate > 100 ? 'var(--red)' : (hospRate > 80 ? 'var(--gold)' : 'var(--text-1)');
    }

    this._setText('sc-literacy',  `${(s.literacyRate || 72.0).toFixed(1)}%`);
    this._setText('sc-stab',      s.stability + '%');
    this._setText('sc-power',     e.fmtNum(s.powerScore));
    this._setText('sc-influence', e.fmtNum(s.influence));

    // Terminal de Evolução do Tesouro
    const netFlowPerSec = (s.gdpPerHour || 0) / 3600;
    this._setText('tt-net-flow', (netFlowPerSec >= 0 ? '+' : '') + e.fmt(netFlowPerSec) + '/s');
    const yieldRate = ((s.treasuryInterestRate || 0.015) * 10).toFixed(1);
    this._setText('tt-yield', '+' + yieldRate + '%');
    this._setText('tt-peak', e.fmt(s.peakBalance || s.balance));
    const stabMargin = Math.max(10, Math.min(100, Math.round((s.stability || 50) * 0.95 + 5)));
    this._setText('tt-margin', stabMargin + '%');

    // Session stats
    this._setText('stat-clicks',       e.fmtNum(s.stats.totalClicks));
    this._setText('stat-combo',        s.stats.maxCombo);
    this._setText('stat-crits',        e.fmtNum(s.stats.critHits));
    this._setText('stat-built',        s.stats.totalBuilt);
    this._setText('stat-days',         s.stats.daysInPower);
    this._setText('stat-total-earned', e.fmt(s.totalEarned));

    // Online
    this._setText('online-display', '🟢 ' + e.fmtNum(e.onlinePlayers) + ' online');

    // Progresso do Grande Reset ($1B)
    this._updateHegemonyProgress();

    // Legacy
    if (s.totalResets > 0 || s.legacyPoints > 0) {
      document.getElementById('legacy-card').style.display = 'block';
      this._setText('legacy-pts', e.fmtNum(s.legacyPoints) + ' LP');
      this._setText('legacy-mult', '×' + s.legacyMultiplier.toFixed(2));
    }
  }

  // ─────────────────────────────────────
  // O GRANDE RESET ($1B) — ASCENSÃO HEGEMÔNICA
  // ─────────────────────────────────────
  _updateHegemonyProgress() {
    if (!window.engine || !window.engine.getGrandeResetProgress) return;
    const prog = window.engine.getGrandeResetProgress();
    const e = window.engine;
    const banner = document.getElementById('hegemony-banner');
    const fill = document.getElementById('heg-progress-fill');
    const text = document.getElementById('heg-progress-text');
    const statusPill = document.getElementById('heg-status-pill');
    const actionBtn = document.getElementById('heg-action-btn');

    if (text) text.textContent = `${e.fmt(prog.balance)} / $1.00 B (${prog.pct.toFixed(1)}%)`;
    if (fill) fill.style.width = `${prog.pct}%`;

    if (banner) {
      if (prog.canReset) {
        banner.classList.add('ready');
        if (statusPill) {
          statusPill.textContent = `🌌 ASCENSÃO LIBERADA! (+${prog.pointsToEarn} HEG)`;
          statusPill.className = 'heg-status ready-pill';
        }
        if (actionBtn) {
          actionBtn.textContent = '✨ ASCENDER AGORA!';
          actionBtn.className = 'heg-action-btn ready-btn';
        }
      } else {
        banner.classList.remove('ready');
        if (statusPill) {
          statusPill.textContent = 'EM PROGRESSO';
          statusPill.className = 'heg-status';
        }
        if (actionBtn) {
          actionBtn.textContent = 'Ver Prestígio';
          actionBtn.className = 'heg-action-btn';
        }
      }
    }
  }

  openGrandeResetModal() {
    this.renderGrandeResetModal();
    this.openModal('modal-grande-reset');
  }

  renderGrandeResetModal() {
    const s = window.engine.state;
    const e = window.engine;
    const prog = e.getGrandeResetProgress();
    const modalBody = document.getElementById('grande-reset-modal-body');
    if (!modalBody) return;

    const upgrades = window.GAME_DATA.hegemonyUpgrades || [];

    modalBody.innerHTML = `
      <div class="heg-modal-content">
        <!-- Cosmic Hero Card -->
        <div class="heg-hero-card ${prog.canReset ? 'glowing' : ''}">
          <div style="font-size:38px;animation:float 3s ease-in-out infinite">🌌</div>
          <div style="font-size:16px;font-weight:900;color:var(--gold);margin-top:6px;letter-spacing:0.5px">
            O GRANDE RESET — ASCENSÃO HEGEMÔNICA
          </div>
          <div style="font-size:11px;color:var(--text-2);margin-top:6px;line-height:1.4;max-width:400px;text-align:center">
            Ao atingir <strong style="color:var(--gold)">$1.000.000.000 (1 Bilhão)</strong> no Tesouro, você pode reiniciar sua civilização e acumular <strong>Pontos de Hegemonia Cósmica</strong> para adquirir multiplicadores permanentes eternos!
          </div>

          <!-- Progress Bar in Modal -->
          <div style="width:100%;margin-top:14px">
            <div style="display:flex;justify-content:space-between;font-size:11px;font-family:'JetBrains Mono',monospace;margin-bottom:4px">
              <span style="color:var(--text-3)">Progresso do Tesouro:</span>
              <span style="color:${prog.canReset ? 'var(--gold)' : 'var(--blue)'};font-weight:800">
                ${e.fmt(prog.balance)} / $1.00 B (${prog.pct.toFixed(1)}%)
              </span>
            </div>
            <div class="heg-progress-bar" style="height:10px;border-radius:6px">
              <div class="heg-progress-fill" style="width:${prog.pct}%"></div>
            </div>
          </div>

          <!-- Points summary badge -->
          <div class="heg-points-pill" style="margin-top:12px">
            💎 Seus Pontos de Hegemonia Disponíveis: <strong style="color:var(--gold);font-size:15px">${s.hegemonyPoints || 0}</strong>
          </div>
          <div style="font-size:10px;color:var(--text-3);margin-top:4px">
            Resets realizados: <strong>${s.hegemonyResets || 0}</strong> · Total histórico ganho: <strong>${s.lifetimeHegemonyPoints || 0}</strong>
          </div>

          <!-- CTA Reset Button -->
          <div style="width:100%;margin-top:14px">
            ${prog.canReset ? `
              <button class="heg-execute-btn" onclick="ui.confirmGrandeReset()">
                🌌 EXECUTAR O GRANDE RESET (+${prog.pointsToEarn} PONTOS DE HEGEMONIA)
              </button>
            ` : `
              <button class="heg-execute-btn disabled" disabled>
                🔒 Faltam ${e.fmt(prog.target - prog.balance)} para Liberar o Reset ($1B)
              </button>
            `}
          </div>
        </div>

        <!-- Permanent Multipliers Shop -->
        <div style="margin-top:18px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
            <div style="font-size:14px;font-weight:800;color:var(--text-1)">
              👑 Árvore de Multiplicadores Permanentes
            </div>
            <div style="font-size:11px;color:var(--gold);font-weight:700">
              💎 ${s.hegemonyPoints || 0} Hegemonias
            </div>
          </div>

          <div style="display:flex;flex-direction:column;gap:10px">
            ${upgrades.map(upg => {
              const curLvl = s.hegemonyUpgrades?.[upg.id] || 0;
              const isMax = curLvl >= upg.maxLevel;
              const cost = Math.ceil(upg.baseCost * Math.pow(upg.costMult, curLvl));
              const canAfford = (s.hegemonyPoints || 0) >= cost;

              return `
                <div class="heg-upgrade-card ${curLvl > 0 ? 'active' : ''}">
                  <div style="font-size:28px">${upg.icon}</div>
                  <div style="flex:1">
                    <div style="display:flex;align-items:center;gap:6px">
                      <span style="font-size:13px;font-weight:800;color:var(--text-1)">${upg.name}</span>
                      <span class="heg-lvl-badge">Nv.${curLvl}/${upg.maxLevel}</span>
                    </div>
                    <div style="font-size:10px;color:var(--green);font-weight:700;margin-top:2px">
                      Efeito: ${curLvl > 0 ? upg.effectFmt(curLvl) : 'Nenhum'} ${!isMax ? `(Próximo: ${upg.effectFmt(curLvl + 1)})` : ''}
                    </div>
                    <div style="font-size:9px;color:var(--text-3);margin-top:2px">
                      ${upg.desc}
                    </div>
                  </div>
                  <div>
                    ${isMax ? `
                      <span class="pill pill-green" style="font-size:10px">MAX</span>
                    ` : `
                      <button class="heg-buy-btn ${canAfford ? 'can-buy' : ''}" onclick="ui.buyHegemonyUpgrade('${upg.id}')" ${!canAfford ? 'disabled' : ''}>
                        💎 ${cost}
                      </button>
                    `}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  }

  confirmGrandeReset() {
    const pts = window.engine.getGrandeResetPoints();
    if (!window.engine.canGrandeReset()) {
      this.showToast('🔒 Requisito de $1B não atingido!', 'error');
      return;
    }
    if (confirm(`🌌 EXECUTAR O GRANDE RESET?\n\nSeu tesouro, fábricas e unidades serão reiniciados.\nVocê receberá +${pts} PONTOS DE HEGEMONIA CÓSMICA para gastar em multiplicadores permanentes eternos!\n\nDeseja ascender agora?`)) {
      const res = window.engine.doGrandeReset();
      this.showToast(res.msg, res.ok ? 'heg' : 'error');
      if (res.ok) {
        this.closeModal('modal-grande-reset');
        this.renderAll();
      }
    }
  }

  buyHegemonyUpgrade(upgId) {
    const res = window.engine.buyHegemonyUpgrade(upgId);
    this.showToast(res.msg, res.ok ? 'success' : 'error');
    if (res.ok) {
      this.renderGrandeResetModal();
      this._updateHeader();
    }
  }

  // ─────────────────────────────────────
  // SPARKLINE & ECONOMY CHART (CHART.JS)
  // ─────────────────────────────────────
  getChartOptions(isDarkMode, type = 'sparkline') {
    const textColor = isDarkMode ? '#94A3B8' : '#0F172A';
    const gridColor = isDarkMode ? '#1E293B' : '#E2E8F0';

    if (type === 'sparkline') {
      return {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: true,
            callbacks: {
              label: (ctx) => `Tesouro: ${window.engine ? window.engine.fmt(ctx.raw) : '$' + ctx.raw}`
            }
          }
        },
        scales: {
          x: {
            display: false,
            grid: { display: false }
          },
          y: {
            display: true,
            position: 'right',
            grid: {
              color: gridColor,
              drawBorder: false
            },
            ticks: {
              color: textColor,
              font: { family: 'JetBrains Mono', size: 9 },
              callback: (val) => window.engine ? window.engine.fmt(val) : '$' + val,
              maxTicksLimit: 3
            }
          }
        }
      };
    }

    if (type === 'doughnut') {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: { color: textColor, font: { family: 'Outfit', size: 12 } }
          }
        }
      };
    }

    return {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: { color: gridColor },
          ticks: { color: textColor, font: { family: 'JetBrains Mono', size: 11 } }
        },
        y: {
          beginAtZero: true,
          grid: { color: gridColor },
          ticks: { color: textColor, font: { family: 'JetBrains Mono', size: 11 } }
        }
      },
      plugins: {
        legend: {
          labels: { color: textColor, font: { family: 'Outfit', size: 12 } }
        }
      }
    };
  }

  _getEconomyGradient(ctx, isDarkMode) {
    const grad = ctx.createLinearGradient(0, 0, 0, 75);
    if (isDarkMode) {
      grad.addColorStop(0, 'rgba(0, 255, 102, 0.35)');
      grad.addColorStop(0.7, 'rgba(0, 255, 102, 0.08)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0.0)');
    } else {
      grad.addColorStop(0, 'rgba(5, 150, 105, 0.28)');
      grad.addColorStop(0.7, 'rgba(5, 150, 105, 0.08)');
      grad.addColorStop(1, 'rgba(5, 150, 105, 0.0)');
    }
    return grad;
  }

  _initEconomyChart() {
    const canvas = document.getElementById('sparkline');
    if (!canvas || !window.Chart) return;

    const isDarkMode = !document.body.classList.contains('light-theme');
    const pibLineColor = isDarkMode ? '#00FF66' : '#059669';
    const ctx = canvas.getContext('2d');
    const grad = this._getEconomyGradient(ctx, isDarkMode);
    const data = [...this.sparkHistory];
    const labels = data.map(() => '');

    window.economyChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          data,
          borderColor: pibLineColor,
          borderWidth: 2.2,
          backgroundColor: grad,
          fill: true,
          tension: 0.35,
          pointRadius: (context) => (context.dataIndex === context.dataset.data.length - 1 ? 4 : 0),
          pointHoverRadius: 6,
          pointBackgroundColor: pibLineColor,
          pointBorderColor: '#FFFFFF',
          pointBorderWidth: 1.5
        }]
      },
      options: this.getChartOptions(isDarkMode, 'sparkline')
    });
  }

  _tickSparkline() {
    const s = window.engine ? window.engine.state : {};
    this.sparkHistory.push(s.balance || 0);
    if (this.sparkHistory.length > 30) this.sparkHistory.shift();
    this._drawSparkline();
  }

  _drawSparkline() {
    const canvas = document.getElementById('sparkline');
    if (!canvas) return;

    if (window.Chart) {
      if (!window.economyChart) {
        this._initEconomyChart();
      }
      if (window.economyChart) {
        window.economyChart.data.labels = this.sparkHistory.map(() => '');
        window.economyChart.data.datasets[0].data = [...this.sparkHistory];
        window.economyChart.update('none');
      }
    } else {
      this._drawSparklineCanvasFallback();
    }

    // Trend pill com taxa real por segundo
    const s = window.engine ? window.engine.state : {};
    const netFlowPerSec = ((s.gdpPerHour || 0) / 3600);
    const data = this.sparkHistory;
    const trend = data.length >= 2 ? (data[data.length - 1] >= data[0]) : true;
    const trendEl = document.getElementById('sparkline-trend');
    if (trendEl && window.engine) {
      trendEl.textContent = (trend ? '▲ +' : '▼ -') + window.engine.fmt(Math.abs(netFlowPerSec)) + '/s';
      trendEl.className = trend ? 'pill pill-green' : 'pill pill-red';
    }
  }

  _drawSparklineCanvasFallback() {
    const canvas = document.getElementById('sparkline');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.offsetWidth || 380;
    const H = 75;
    canvas.width = W; canvas.height = H;

    const data = this.sparkHistory;
    if (data.length < 2) return;

    const isDarkMode = !document.body.classList.contains('light-theme');
    const pibLineColor = isDarkMode ? '#00FF66' : '#059669';

    ctx.clearRect(0, 0, W, H);

    // Linhas de grade sutis
    ctx.strokeStyle = isDarkMode ? '#1E293B' : '#E2E8F0';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    [0.25, 0.5, 0.75].forEach(r => {
      ctx.beginPath();
      ctx.moveTo(0, H * r);
      ctx.lineTo(W, H * r);
      ctx.stroke();
    });
    ctx.setLineDash([]);

    const min = Math.min(...data);
    const max = Math.max(...data) || 1;
    const range = max - min || 1;

    const pts = data.map((v, i) => ({
      x: (i / (data.length - 1)) * W,
      y: H - ((v - min) / range) * (H - 16) - 8
    }));

    // Preenchimento gradiente
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    if (isDarkMode) {
      grad.addColorStop(0, 'rgba(0,255,102,0.35)');
      grad.addColorStop(0.6, 'rgba(0,255,102,0.10)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
    } else {
      grad.addColorStop(0, 'rgba(5,150,105,0.28)');
      grad.addColorStop(0.6, 'rgba(5,150,105,0.08)');
      grad.addColorStop(1, 'rgba(5,150,105,0)');
    }

    ctx.beginPath();
    ctx.moveTo(pts[0].x, H);
    pts.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(pts[pts.length - 1].x, H);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Linha principal brilhante
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    pts.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.strokeStyle = pibLineColor;
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // Ponto final
    const last = pts[pts.length - 1];
    ctx.beginPath();
    ctx.arc(last.x, last.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = pibLineColor;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // ─────────────────────────────────────
  // 🔴 CORREÇÃO 2: PARQUE INDUSTRIAL (TERRITÓRIO LIVRE)
  // ─────────────────────────────────────
  renderTerritoryTab() {
    this.renderParqueIndustrial();
  }

  renderTerritoryGrid() {
    this.renderParqueIndustrial();
  }

  renderParqueIndustrial() {
    const s = window.engine.state;
    const stats = window.engine.getParqueIndustrialStats ? window.engine.getParqueIndustrialStats() : { totalUnits: 0, totalProd: 0, favCount: 0 };

    this._setText('pi-total-units', stats.totalUnits.toLocaleString('pt-BR'));
    this._setText('pi-total-prod', window.engine.fmt(stats.totalProd) + '/h');
    this._setText('pi-fav-count', stats.favCount);
    this._setText('pi-fav-badge', `${stats.favCount} fixada${stats.favCount !== 1 ? 's' : ''}`);

    this.renderParqueFilterChips();
    this.renderParqueFavorites();
    this.renderParqueFacilities();
  }

  renderParqueFilterChips() {
    const chipsEl = document.getElementById('pi-filter-chips');
    if (!chipsEl) return;

    if (this.parqueSubtab === 'cat') {
      const cats = window.GAME_DATA.categories || [];
      chipsEl.innerHTML = `
        <button class="pi-chip ${this.parqueFilterChip === 'all' ? 'active' : ''}" onclick="ui.setParqueFilterChip('all')">Todas (12)</button>
        ${cats.map(c => `
          <button class="pi-chip ${this.parqueFilterChip === c.id ? 'active' : ''}" onclick="ui.setParqueFilterChip('${c.id}')">
            ${c.icon} ${c.name}
          </button>
        `).join('')}
      `;
    } else if (this.parqueSubtab === 'era') {
      chipsEl.innerHTML = `
        <button class="pi-chip ${this.parqueFilterChip === 'all' ? 'active' : ''}" onclick="ui.setParqueFilterChip('all')">Todas as Eras</button>
        <button class="pi-chip ${this.parqueFilterChip === '1' ? 'active' : ''}" onclick="ui.setParqueFilterChip('1')">🌱 Fase I (Sobrevivente)</button>
        <button class="pi-chip ${this.parqueFilterChip === '2' ? 'active' : ''}" onclick="ui.setParqueFilterChip('2')">⚙️ Fase II (Industrial)</button>
        <button class="pi-chip ${this.parqueFilterChip === '3' ? 'active' : ''}" onclick="ui.setParqueFilterChip('3')">👑 Fase III (Império)</button>
      `;
    } else if (this.parqueSubtab === 'status') {
      chipsEl.innerHTML = `
        <button class="pi-chip ${this.parqueFilterChip === 'all' ? 'active' : ''}" onclick="ui.setParqueFilterChip('all')">Todos</button>
        <button class="pi-chip ${this.parqueFilterChip === 'producing' ? 'active' : ''}" onclick="ui.setParqueFilterChip('producing')">🟢 Produzindo</button>
        <button class="pi-chip ${this.parqueFilterChip === 'idle' ? 'active' : ''}" onclick="ui.setParqueFilterChip('idle')">⚪ Disponíveis / Ociosas</button>
        <button class="pi-chip ${this.parqueFilterChip === 'locked' ? 'active' : ''}" onclick="ui.setParqueFilterChip('locked')">🔒 Bloqueadas</button>
        <button class="pi-chip ${this.parqueFilterChip === 'fav' ? 'active' : ''}" onclick="ui.setParqueFilterChip('fav')">⭐ Favoritas</button>
      `;
    } else if (this.parqueSubtab === 'jobs') {
      chipsEl.innerHTML = `
        <button class="pi-chip ${this.parqueFilterChip === 'all' ? 'active' : ''}" onclick="ui.setParqueFilterChip('all')">Todas as Vagas</button>
        <button class="pi-chip ${this.parqueFilterChip === 'high' ? 'active' : ''}" onclick="ui.setParqueFilterChip('high')">👥 Alta Demanda (&gt;25 vagas)</button>
        <button class="pi-chip ${this.parqueFilterChip === 'mid' ? 'active' : ''}" onclick="ui.setParqueFilterChip('mid')">🛠️ Média Demanda (10-25 vagas)</button>
        <button class="pi-chip ${this.parqueFilterChip === 'low' ? 'active' : ''}" onclick="ui.setParqueFilterChip('low')">🌱 Baixa Demanda (1-9 vagas)</button>
        <button class="pi-chip ${this.parqueFilterChip === 'auto' ? 'active' : ''}" onclick="ui.setParqueFilterChip('auto')">🤖 Automatizado (0 vagas)</button>
      `;
    } else if (this.parqueSubtab === 'eco') {
      chipsEl.innerHTML = `
        <button class="pi-chip ${this.parqueFilterChip === 'all' ? 'active' : ''}" onclick="ui.setParqueFilterChip('all')">Todos os Impactos</button>
        <button class="pi-chip ${this.parqueFilterChip === 'clean' ? 'active' : ''}" onclick="ui.setParqueFilterChip('clean')">🌿 Zero Poluição / Verde</button>
        <button class="pi-chip ${this.parqueFilterChip === 'moderate' ? 'active' : ''}" onclick="ui.setParqueFilterChip('moderate')">⚠️ Baixa Emissão</button>
        <button class="pi-chip ${this.parqueFilterChip === 'heavy' ? 'active' : ''}" onclick="ui.setParqueFilterChip('heavy')">🏭 Indústria Pesada</button>
      `;
    }
  }

  renderParqueFavorites() {
    const s = window.engine.state;
    const favSection = document.getElementById('pi-favorites-section');
    const favListEl = document.getElementById('pi-favorites-list');
    if (!favSection || !favListEl) return;

    const favIds = s.favorites || [];
    const favFacs = (window.GAME_DATA.facilities || []).filter(f => favIds.includes(f.id));

    if (favFacs.length === 0) {
      favListEl.innerHTML = `
        <div style="text-align:center;padding:12px;font-size:11px;color:var(--text-3);background:var(--bg-raised);border-radius:var(--r-md);border:1px dashed var(--border)">
          Toque na estrela ☆ de qualquer instalação para fixá-la aqui no topo do Parque Industrial.
        </div>
      `;
      return;
    }

    favListEl.innerHTML = favFacs.map(f => this._renderParqueCard(f, true)).join('');
  }

  renderParqueFacilities() {
    const s = window.engine.state;
    const listEl = document.getElementById('pi-facilities-list');
    if (!listEl) return;

    let facs = [...(window.GAME_DATA.facilities || [])];

    // 1. Filtro por Busca
    if (this.parqueSearch && this.parqueSearch.trim().length > 0) {
      const q = this.parqueSearch.toLowerCase().trim();
      facs = facs.filter(f => (f.name && f.name.toLowerCase().includes(q)) || (f.desc && f.desc.toLowerCase().includes(q)) || (f.cat && f.cat.toLowerCase().includes(q)));
    }

    // 2. Filtro por Sub-guia
    if (this.parqueFilterChip !== 'all') {
      if (this.parqueSubtab === 'cat') {
        facs = facs.filter(f => f.cat === this.parqueFilterChip);
      } else if (this.parqueSubtab === 'era') {
        facs = facs.filter(f => f.phase === Number(this.parqueFilterChip));
      } else if (this.parqueSubtab === 'status') {
        if (this.parqueFilterChip === 'producing') {
          facs = facs.filter(f => (s.facilities[f.id]?.level || 0) > 0);
        } else if (this.parqueFilterChip === 'idle') {
          facs = facs.filter(f => (s.facilities[f.id]?.level || 0) === 0 && f.phase <= s.phase && f.reqLevel <= s.level);
        } else if (this.parqueFilterChip === 'locked') {
          facs = facs.filter(f => f.phase > s.phase || f.reqLevel > s.level);
        } else if (this.parqueFilterChip === 'fav') {
          facs = facs.filter(f => s.facilities[f.id]?.isFavorite);
        }
      } else if (this.parqueSubtab === 'jobs') {
        if (this.parqueFilterChip === 'high') {
          facs = facs.filter(f => (f.jobs || 0) > 25);
        } else if (this.parqueFilterChip === 'mid') {
          facs = facs.filter(f => (f.jobs || 0) >= 10 && (f.jobs || 0) <= 25);
        } else if (this.parqueFilterChip === 'low') {
          facs = facs.filter(f => (f.jobs || 0) >= 1 && (f.jobs || 0) < 10);
        } else if (this.parqueFilterChip === 'auto') {
          facs = facs.filter(f => (f.jobs || 0) === 0);
        }
      } else if (this.parqueSubtab === 'eco') {
        if (this.parqueFilterChip === 'clean') {
          facs = facs.filter(f => (f.pollution || 0) === 0);
        } else if (this.parqueFilterChip === 'moderate') {
          facs = facs.filter(f => (f.pollution || 0) > 0 && (f.pollution || 0) <= 2);
        } else if (this.parqueFilterChip === 'heavy') {
          facs = facs.filter(f => (f.pollution || 0) > 2);
        }
      }
    }

    // 3. Ordenação
    facs.sort((a, b) => {
      const aState = s.facilities[a.id] || { level: 0, upgradeLevel: 0 };
      const bState = s.facilities[b.id] || { level: 0, upgradeLevel: 0 };
      const aCost = Math.floor(a.cost * Math.pow(1.25, aState.level));
      const bCost = Math.floor(b.cost * Math.pow(1.25, bState.level));
      const aProd = aState.level > 0 ? a.prodPerHour * Math.pow(1.15, aState.level - 1) : 0;
      const bProd = bState.level > 0 ? b.prodPerHour * Math.pow(1.15, bState.level - 1) : 0;
      const aROI = aCost > 0 ? (a.prodPerHour / aCost) : 0;
      const bROI = bCost > 0 ? (b.prodPerHour / bCost) : 0;

      if (this.parqueSort === 'prod_desc') return bProd - aProd;
      if (this.parqueSort === 'jobs_desc') return (b.jobs || 0) - (a.jobs || 0);
      if (this.parqueSort === 'jobs_asc') return (a.jobs || 0) - (b.jobs || 0);
      if (this.parqueSort === 'level_desc') return bState.level - aState.level;
      if (this.parqueSort === 'roi_desc') return bROI - aROI;
      if (this.parqueSort === 'cost_asc') return aCost - bCost;
      if (this.parqueSort === 'name_asc') return a.name.localeCompare(b.name);
      return 0;
    });

    this._setText('pi-total-badge', `${facs.length} disponíveis`);

    if (facs.length === 0) {
      listEl.innerHTML = `<div class="empty-state"><div class="empty-state-icon">🔍</div><div class="empty-state-text">Nenhuma instalação encontrada com os filtros atuais.</div></div>`;
      return;
    }

    listEl.innerHTML = facs.map(f => this._renderParqueCard(f, s.facilities[f.id]?.isFavorite)).join('');
  }

  _renderParqueCard(fdata, isFav) {
    const s = window.engine.state;
    const fstate = s.facilities[fdata.id] || { level: 0, upgradeLevel: 0 };
    const cat = (window.GAME_DATA.categories || []).find(c => c.id === fdata.cat);

    // Pré-requisito de Desbloqueio Cadenciado
    const prereq = window.engine.getFacilityPrereq ? window.engine.getFacilityPrereq(fdata.id) : null;
    let isPrereqLocked = false;
    let prereqNotice = '';
    if (prereq) {
      const prevLvl = s.facilities[prereq.id]?.level || 0;
      if (prevLvl < prereq.minLevel) {
        isPrereqLocked = true;
        prereqNotice = `Requer ${prereq.name} Nv.${prereq.minLevel}`;
      }
    }

    // Desconto de Complexo Otimizado (Hegemonia)
    const indDiscount = Math.max(0.25, 1 - (s.hegemonyUpgrades?.industry || 0) * 0.15);

    let currentCost = Math.floor(fdata.cost * Math.pow(1.32, fstate.level) * indDiscount);
    let cost10 = 0;
    let tempLvl = fstate.level;
    for (let i = 0; i < 10; i++) {
      cost10 += Math.floor(fdata.cost * Math.pow(1.32, tempLvl) * indDiscount);
      tempLvl++;
    }
    let cost100 = 0;
    tempLvl = fstate.level;
    for (let i = 0; i < 100; i++) {
      cost100 += Math.floor(fdata.cost * Math.pow(1.32, tempLvl) * indDiscount);
      tempLvl++;
    }

    const lvlMult = Math.pow(1.15, Math.max(0, fstate.level - 1));
    const upMult = 1 + (fstate.upgradeLevel * 0.3);
    const prodCurrent = fstate.level > 0 ? Math.round(fdata.prodPerHour * lvlMult * upMult * (s.treasuryMultiplier || 1)) : 0;
    const prodNextUnit = Math.round(fdata.prodPerHour * Math.pow(1.15, fstate.level) * upMult * (s.treasuryMultiplier || 1));
    const roi = currentCost > 0 ? ((prodNextUnit / currentCost) * 100).toFixed(1) : 0;

    const isLocked = fdata.phase > s.phase || fdata.reqLevel > s.level;
    const canBuild = !isLocked && !isPrereqLocked;
    const canAfford1 = s.balance >= currentCost && canBuild;
    const canAfford10 = s.balance >= cost10 && canBuild;
    const canAfford100 = s.balance >= cost100 && canBuild;

    let statusText = '🟢 Produzindo';
    let statusClass = 'status-active';
    if (isLocked) {
      statusText = `🔒 Nv.${fdata.reqLevel} (Fase ${fdata.phase})`;
      statusClass = 'status-locked';
    } else if (isPrereqLocked) {
      statusText = `🔒 ${prereqNotice}`;
      statusClass = 'status-locked';
    } else if (fstate.level === 0) {
      statusText = '⚪ Disponível';
      statusClass = 'status-available';
    }

    return `
      <div class="pi-card ${isFav ? 'favorite-glow' : ''} ${isPrereqLocked ? 'prereq-locked' : ''}">
        <div class="pi-card-header">
          <div class="pi-card-icon">${fdata.icon || '🏭'}</div>
          <div class="pi-card-titles">
            <div class="pi-card-name">${fdata.name}</div>
            <div class="pi-card-meta">
              <span class="pi-cat-pill" style="border-color:${cat?.color || '#fff'}44;color:${cat?.color || '#fff'}">${cat ? cat.name : fdata.cat}</span>
              <span class="pi-era-pill">Fase ${fdata.phase}</span>
              <span class="pi-status-pill ${statusClass}">${statusText}</span>
            </div>
          </div>
          <button class="pi-fav-star-btn ${isFav ? 'active' : ''}" onclick="ui.toggleParqueFavorite('${fdata.id}')" title="Fixar / Desafixar">
            ${isFav ? '⭐' : '☆'}
          </button>
        </div>

        ${isPrereqLocked ? `
          <div style="font-size:10px;font-weight:600;color:#FCA5A5;background:rgba(239,68,68,0.12);padding:6px 10px;border-radius:var(--r-sm);margin:8px 0;border:1px solid rgba(239,68,68,0.25);display:flex;align-items:center;gap:6px">
            <span>🔒</span>
            <span><strong>Cadência Industrial:</strong> Requer <strong>${prereq.name}</strong> no Nível ${prereq.minLevel}</span>
          </div>
        ` : ''}

        <div class="pi-card-metrics">
          <div class="pi-metric">
            <span class="pi-m-val" style="color:var(--green)">+${window.engine.fmt(prodCurrent)}/h</span>
            <span class="pi-m-lbl">Produção Atual</span>
          </div>
          <div class="pi-metric">
            <span class="pi-m-val" style="color:var(--blue)">${fstate.level} un</span>
            <span class="pi-m-lbl">Unidades</span>
          </div>
          <div class="pi-metric">
            <span class="pi-m-val" style="color:var(--gold)">${roi}%/h</span>
            <span class="pi-m-lbl">ROI</span>
          </div>
        </div>

        <div class="pi-card-actions">
          <button class="pi-buy-btn" onclick="ui.buyParqueFacility('${fdata.id}', 1)" ${canAfford1 ? '' : 'disabled'}>
            +1 <span class="pi-buy-cost">${window.engine.fmt(currentCost)}</span>
          </button>
          <button class="pi-buy-btn sub" onclick="ui.buyParqueFacility('${fdata.id}', 10)" ${canAfford10 ? '' : 'disabled'}>
            +10 <span class="pi-buy-cost">${window.engine.fmt(cost10)}</span>
          </button>
          <button class="pi-buy-btn sub" onclick="ui.buyParqueFacility('${fdata.id}', 100)" ${canAfford100 ? '' : 'disabled'}>
            +100
          </button>
          <button class="pi-upgrade-btn" onclick="ui.openFacilityDetail('${fdata.id}')">
            ⬆️ Upgrades
          </button>
        </div>
      </div>
    `;
  }

  onParqueSearch(query) {
    this.parqueSearch = query || '';
    this.renderParqueFacilities();
  }

  clearParqueSearch() {
    this.parqueSearch = '';
    const input = document.getElementById('pi-search-input');
    if (input) input.value = '';
    this.renderParqueFacilities();
  }

  setParqueSubtab(subtab) {
    this.parqueSubtab = subtab;
    this.parqueFilterChip = 'all';

    document.querySelectorAll('.pi-subtab-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById('pi-subtab-' + subtab);
    if (activeBtn) activeBtn.classList.add('active');

    this.renderParqueFilterChips();
    this.renderParqueFacilities();
  }

  setParqueFilterChip(chipId) {
    this.parqueFilterChip = chipId;
    this.renderParqueFilterChips();
    this.renderParqueFacilities();
  }

  onParqueSort(sortVal) {
    this.parqueSort = sortVal;
    this.renderParqueFacilities();
  }

  toggleParqueFavorite(facId) {
    const isFav = window.engine.toggleFavoriteFacility(facId);
    this.showToast(isFav ? '⭐ Adicionado aos Favoritos!' : 'Removido dos Favoritos.', 'info');
    this.renderParqueIndustrial();
  }

  buyParqueFacility(facId, count) {
    const res = window.engine.buildFacilityDirect(facId, count);
    this.showToast(res.msg, res.ok ? 'success' : 'error');
    if (res.ok) {
      this._updateHeader();
      this.renderParqueIndustrial();
      if (this.currentTab === 'cadeia') this.renderActiveFacilities();
    }
  }
  renderActiveFacilities() {
    const s = window.engine.state;
    const list = document.getElementById('territory-active-list');
    if (!list) return;
    const activeFacs = window.GAME_DATA.facilities.filter(f => (s.facilities[f.id]?.level || 0) > 0);
    if (activeFacs.length === 0) {
      list.innerHTML = `<div class="empty-state"><div class="empty-state-icon">⚡</div><div class="empty-state-text">Nenhuma instalação ativa ainda.<br>Construa na aba Cadeia!</div></div>`;
      return;
    }

    list.innerHTML = activeFacs.map(fdata => {
      const fstate = s.facilities[fdata.id];
      const prod = fdata ? window.engine.fmt(fdata.prodPerHour * Math.pow(1.15, fstate.level-1)) : '$0';
      const cat = fdata ? window.GAME_DATA.categories.find(c => c.id === fdata.cat) : null;
      return `<div class="policy-card" onclick="ui.openFacilityDetail('${fdata.id}')">
        <div style="font-size:20px">${fdata?.icon || '🏭'}</div>
        <div class="policy-body">
          <div class="policy-name">${fdata?.name}</div>
          <div class="policy-desc">${cat ? cat.name : 'Instalação'} · ${fstate.level} unidade(s)</div>
        </div>
        <div>
          <div style="font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:800;color:var(--green)">${prod}/h</div>
          <div style="font-size:9px;color:var(--text-3);text-align:right">Nv.${fstate?.level||0}</div>
        </div>
      </div>`;
    }).join('');
  }

  // ─────────────────────────────────────
  // TILE MODAL
  // ─────────────────────────────────────
  openTileModal(tileId) {
    this.selectedTileId = tileId;
    const tile = window.engine.state.tiles.find(t => t.id === tileId);
    if (!tile) return;

    const titleEl = document.getElementById('tile-modal-title');
    const descEl  = document.getElementById('tile-modal-desc');
    const bodyEl  = document.getElementById('tile-modal-body');

    if (tile.state === 'locked') {
      titleEl.textContent = '🔒 Tile ' + tileId + ' — Trancado';
      descEl.textContent  = 'Desbloqueie para expandir seu território.';
      const adj = window.engine._adjacentTiles(tileId);
      const hasAdj = adj.some(id => {
        const t = window.engine.state.tiles.find(t=>t.id===id);
        return t && (t.state==='active'||t.state==='core'||t.state==='empty');
      });

      bodyEl.innerHTML = `
        <div style="text-align:center;padding:20px 0">
          <div style="font-size:48px;margin-bottom:12px">🔒</div>
          <div style="font-size:13px;color:var(--text-2);margin-bottom:8px">Território ${tileId}</div>
          <div style="font-family:'JetBrains Mono',monospace;font-size:20px;font-weight:800;color:var(--gold);margin-bottom:4px">
            ${window.engine.fmt(tile.unlockCost)}
          </div>
          <div style="font-size:10px;color:var(--text-3);margin-bottom:20px">Custo de desbloqueio</div>
          ${!hasAdj ? '<div class="pill pill-red" style="margin-bottom:16px;display:inline-block">📍 Desbloqueie tiles adjacentes primeiro</div>' : ''}
          <button class="build-btn" onclick="ui._doUnlockTile(${tileId})" ${!hasAdj || window.engine.state.balance < tile.unlockCost ? 'disabled style="opacity:0.4"' : ''}>
            🗺️ Desbloquear Território
          </button>
        </div>`;
    } else if (tile.state === 'empty') {
      titleEl.textContent = '🗺️ Tile ' + tileId + ' — Vazio';
      descEl.textContent  = 'Escolha uma categoria para construir.';
      const cats = window.GAME_DATA.categories;
      bodyEl.innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding-bottom:16px">
          ${cats.map(cat => `
            <div onclick="ui.openCategoryFromTile('${cat.id}',${tileId})" style="
              background:var(--bg-raised);border:1px solid ${cat.color}33;
              border-radius:var(--r-md);padding:12px;cursor:pointer;text-align:center;
              transition:all 0.15s;
            ">
              <div style="font-size:24px">${cat.icon}</div>
              <div style="font-size:10px;font-weight:800;color:${cat.color};margin-top:4px">${cat.name}</div>
            </div>
          `).join('')}
        </div>`;
    } else if (tile.state === 'building') {
      const pct = tile.buildTimeTotal > 0
        ? Math.round((1-tile.buildTimeLeft/tile.buildTimeTotal)*100) : 0;
      const secLeft = Math.ceil(tile.buildTimeLeft/1000);
      titleEl.textContent = '🔨 Em Construção';
      descEl.textContent  = tile.name;
      bodyEl.innerHTML = `
        <div style="text-align:center;padding:20px 0">
          <div style="font-size:48px;margin-bottom:12px">🔨</div>
          <div style="font-size:13px;color:var(--text-2);margin-bottom:16px">${tile.name}</div>
          <div class="progress-bar" style="height:8px;margin-bottom:8px">
            <div class="progress-fill" style="width:${pct}%;background:var(--gold)"></div>
          </div>
          <div style="font-size:11px;color:var(--gold)">${pct}% concluído · ${secLeft}s restantes</div>
        </div>`;
    } else if (tile.state === 'active') {
      const fdata = tile.facilityId
        ? window.GAME_DATA.facilities.find(f => f.id === tile.facilityId) : null;
      titleEl.textContent = fdata ? fdata.icon + ' ' + fdata.name : tile.name;
      descEl.textContent  = fdata?.desc || 'Instalação ativa';
      bodyEl.innerHTML = `
        <div style="padding-bottom:16px">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px">
            <div style="background:var(--bg-raised);border-radius:var(--r-md);padding:10px;text-align:center">
              <div style="font-family:'JetBrains Mono',monospace;font-size:16px;font-weight:800;color:var(--green)">
                ${fdata ? window.engine.fmt(fdata.prodPerHour) : '$0'}/h
              </div>
              <div style="font-size:8px;color:var(--text-3);text-transform:uppercase;margin-top:2px">Produção/hora</div>
            </div>
            <div style="background:var(--bg-raised);border-radius:var(--r-md);padding:10px;text-align:center">
              <div style="font-family:'JetBrains Mono',monospace;font-size:16px;font-weight:800;color:var(--blue)">
                Nv.${window.engine.state.facilities[tile.facilityId]?.level || 0}
              </div>
              <div style="font-size:8px;color:var(--text-3);text-transform:uppercase;margin-top:2px">Nível Atual</div>
            </div>
          </div>
          ${fdata ? `<button class="build-btn" onclick="ui.openFacilityDetail('${fdata.id}');ui.closeModal('modal-tile')">
            ⬆️ Ver Upgrades & Melhorias
          </button>` : ''}
        </div>`;
    } else {
      titleEl.textContent = 'Tile ' + tileId;
      descEl.textContent  = tile.state;
      bodyEl.innerHTML = '<p style="color:var(--text-3)">Estado desconhecido.</p>';
    }

    this.openModal('modal-tile');
  }

  _doUnlockTile(tileId) {
    const result = window.engine.unlockTile(tileId);
    this.showToast(result.msg, result.ok ? 'success' : 'error');
    this.closeModal('modal-tile');
    this.renderTerritoryGrid();
  }

  openCategoryFromTile(catId, tileId) {
    this.selectedTileId = tileId;
    this.closeModal('modal-tile');
    this.openCategoryModal(catId);
  }

  // ─────────────────────────────────────
  // CHAIN TAB
  // ─────────────────────────────────────
  renderChainTab() {
    this.renderCategories();
    this.renderActiveFacilities();
    this._updateChainPhaseInfo();
  }

  _updateChainPhaseInfo() {
    const s = window.engine.state;
    const info = document.getElementById('chain-phase-info');
    const phaseNames = {1:'O Sobrevivente',2:'A Nação Industrial',3:'O Império Global'};
    if (info) {
      info.innerHTML = `<strong>Fase ${s.phase} — ${phaseNames[s.phase]}</strong>: 
        ${s.phase===1?'Categorias básicas disponíveis. Construa nos seus tiles.':
          s.phase===2?'Industrialização completa. Explore setores avançados.':
          'Hegemonia tecnológica. Acesso a todas as 12 categorias!'}`;
    }
  }

  renderCategories() {
    const s = window.engine.state;
    const grid = document.getElementById('categories-grid');
    if (!grid) return;

    grid.innerHTML = window.GAME_DATA.categories.map(cat => {
      const facilities = window.GAME_DATA.facilities.filter(f => f.cat === cat.id);
      const owned = facilities.filter(f => (s.facilities[f.id]?.level||0) > 0).length;
      const available = facilities.filter(f => f.phase <= s.phase).length;
      const pct = available > 0 ? Math.round((owned/facilities.length)*100) : 0;
      const isLocked = facilities.every(f => f.phase > s.phase);

      return `<div class="cat-card ${isLocked ? 'locked' : ''}" 
        style="--cat-color:${cat.color};background:${cat.bg};${isLocked?'opacity:0.5;':''}"
        onclick="${isLocked?`ui.showToast('🔒 Disponível na Fase 2+','error')`:`ui.openCategoryModal('${cat.id}')`}">
        <div class="cat-icon">${cat.icon}</div>
        <div class="cat-name" style="color:${cat.color}">${cat.name}</div>
        <div class="cat-desc">${cat.desc}</div>
        <div class="cat-count">
          ${isLocked ? '🔒 Locked' : `✅ ${owned}/${facilities.length} instalações`}
        </div>
        ${!isLocked ? `<div class="cat-progress">
          <div class="cat-progress-fill" style="width:${pct}%"></div>
        </div>` : ''}
      </div>`;
    }).join('');
  }

  renderActiveFacilities() {
    const s = window.engine.state;
    const list = document.getElementById('active-facilities-list');
    if (!list) return;

    const active = window.GAME_DATA.facilities.filter(f => (s.facilities[f.id]?.level||0) > 0);
    const noMsg = document.getElementById('no-facilities-msg');

    if (active.length === 0) {
      if (noMsg) noMsg.style.display = 'block';
      return;
    }
    if (noMsg) noMsg.style.display = 'none';

    list.innerHTML = active.map(fdata => {
      const fstate = s.facilities[fdata.id];
      const prod = window.engine.fmt(fdata.prodPerHour * Math.pow(1.15, fstate.level-1));
      const cat = window.GAME_DATA.categories.find(c => c.id === fdata.cat);
      return `<div class="policy-card" onclick="ui.openFacilityDetail('${fdata.id}')">
        <div style="font-size:24px">${fdata.icon}</div>
        <div class="policy-body">
          <div class="policy-name">${fdata.name}</div>
          <div class="policy-desc">${cat?.name||''} · Nível ${fstate.level}</div>
          <div class="fac-stats" style="margin-top:4px">
            <span class="fac-stat green">+${prod}/h</span>
            <span class="fac-stat gold">${fdata.jobs} empregos</span>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">
          <div style="font-size:10px;font-weight:800;color:var(--blue)">Nv.${fstate.level}</div>
          ${fstate.upgradeLevel < fdata.upgrades.length ?
            `<div class="pill pill-gold" style="font-size:8px">+Upgrade</div>` : ''}
        </div>
      </div>`;
    }).join('');
  }

  // ─────────────────────────────────────
  // CATEGORY MODAL
  // ─────────────────────────────────────
  openCategoryModal(catId) {
    this.currentCatId = catId;
    this.catSubTab = 'available';
    const cat = window.GAME_DATA.categories.find(c => c.id === catId);
    if (!cat) return;

    document.getElementById('cat-modal-title').textContent = cat.icon + ' ' + cat.name;
    document.getElementById('cat-modal-desc').textContent  = cat.desc;

    this._renderFacilityList(catId, 'available');

    // Sub-tab buttons state
    document.querySelectorAll('#cat-sub-tabs .sub-tab-btn').forEach((btn, i) => {
      btn.classList.toggle('active', i === 0);
    });

    this.openModal('modal-category');
  }

  setCatTab(tab) {
    this.catSubTab = tab;
    document.querySelectorAll('#cat-sub-tabs .sub-tab-btn').forEach(btn => {
      const tabs = ['available','owned','locked'];
      btn.classList.toggle('active', btn.getAttribute('onclick').includes(tab));
    });
    this._renderFacilityList(this.currentCatId, tab);
  }

  _renderFacilityList(catId, tab) {
    const s = window.engine.state;
    const list = document.getElementById('facility-list');
    if (!list) return;

    let facilities = window.GAME_DATA.facilities.filter(f => f.cat === catId);
    if (tab === 'available') {
      facilities = facilities.filter(f => f.phase <= s.phase && (s.facilities[f.id]?.level||0) === 0);
    } else if (tab === 'owned') {
      facilities = facilities.filter(f => (s.facilities[f.id]?.level||0) > 0);
    } else if (tab === 'locked') {
      facilities = facilities.filter(f => f.phase > s.phase);
    }

    if (facilities.length === 0) {
      list.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📭</div>
        <div class="empty-state-text">${
          tab==='available'?'Nenhuma disponível para construção agora.':
          tab==='owned'?'Nenhuma construída ainda nesta categoria.':
          'Nenhuma bloqueada. Desbloqueie fases avançadas!'
        }</div></div>`;
      return;
    }

    list.innerHTML = facilities.map(fdata => {
      const fstate  = s.facilities[fdata.id];
      const level   = fstate?.level || 0;
      const cost    = Math.floor(fdata.cost * Math.pow(1.3, level));
      const canBuild = s.balance >= cost && fdata.phase <= s.phase && s.level >= fdata.reqLevel;
      const isLocked = fdata.phase > s.phase || s.level < fdata.reqLevel;

      return `<div class="facility-item" onclick="ui.openFacilityDetail('${fdata.id}')">
        ${level > 0 ? `<div class="fac-level-badge">Nv.${level}</div>` : ''}
        <div class="fac-icon">${fdata.icon}</div>
        <div class="fac-body">
          <div class="fac-name">${fdata.name}</div>
          <div class="fac-desc">${fdata.desc}</div>
          <div class="fac-stats">
            <span class="fac-stat green">+${window.engine.fmt(fdata.prodPerHour)}/h</span>
            <span class="fac-stat gold">${fdata.jobs} empregos</span>
            ${fdata.pollution>0?`<span class="fac-stat red">💨 ${fdata.pollution}</span>`:''}
            <span class="fac-stat blue">Fase ${fdata.phase}</span>
          </div>
        </div>
        <div>
          <div class="fac-cost">${window.engine.fmt(cost)}</div>
          ${isLocked ? `<div style="font-size:8px;color:var(--red);text-align:right;margin-top:2px">🔒 Nv.${fdata.reqLevel}</div>` :
            !canBuild ? `<div style="font-size:8px;color:var(--red);text-align:right;margin-top:2px">💸 Insuf.</div>` : ''}
        </div>
        ${isLocked ? '<div class="fac-locked-overlay">🔒</div>' : ''}
      </div>`;
    }).join('');
  }

  // ─────────────────────────────────────
  // FACILITY DETAIL MODAL (expandable)
  // ─────────────────────────────────────
  openFacilityDetail(facId) {
    this.currentFacId = facId;
    const fdata  = window.GAME_DATA.facilities.find(f => f.id === facId);
    if (!fdata) return;
    const s      = window.engine.state;
    const fstate = s.facilities[facId];
    const level  = fstate?.level || 0;
    const prereq = window.engine.getFacilityPrereq ? window.engine.getFacilityPrereq(facId) : null;
    let isPrereqLocked = false;
    let prereqNotice = '';
    if (prereq) {
      const prevLvl = s.facilities[prereq.id]?.level || 0;
      if (prevLvl < prereq.minLevel) {
        isPrereqLocked = true;
        prereqNotice = `Requer ${prereq.name} Nv.${prereq.minLevel}`;
      }
    }
    const indDiscount = Math.max(0.25, 1 - (s.hegemonyUpgrades?.industry || 0) * 0.15);
    const cost   = Math.floor(fdata.cost * Math.pow(1.32, level) * indDiscount);
    const canBuild = s.balance >= cost && fdata.phase <= s.phase && s.level >= fdata.reqLevel && !isPrereqLocked;
    const cat    = window.GAME_DATA.categories.find(c => c.id === fdata.cat);

    document.getElementById('fac-detail-title').textContent = fdata.icon + ' ' + fdata.name;
    document.getElementById('fac-detail-desc').textContent  = (cat?.name || '') + (isPrereqLocked ? ` · 🔒 ${prereqNotice}` : '');

    const body = document.getElementById('fac-detail-body');
    body.innerHTML = `
      <!-- Info Cards -->
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px">
        <div style="background:var(--bg-raised);border-radius:var(--r-md);padding:10px;text-align:center">
          <div style="font-size:18px;margin-bottom:4px">⚡</div>
          <div style="font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:800;color:var(--green)">${window.engine.fmt(fdata.prodPerHour)}/h</div>
          <div style="font-size:8px;color:var(--text-3);text-transform:uppercase;margin-top:2px">Produção</div>
        </div>
        <div style="background:var(--bg-raised);border-radius:var(--r-md);padding:10px;text-align:center">
          <div style="font-size:18px;margin-bottom:4px">👥</div>
          <div style="font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:800;color:var(--blue)">${fdata.jobs}</div>
          <div style="font-size:8px;color:var(--text-3);text-transform:uppercase;margin-top:2px">Empregos</div>
        </div>
        <div style="background:var(--bg-raised);border-radius:var(--r-md);padding:10px;text-align:center">
          <div style="font-size:18px;margin-bottom:4px">🌿</div>
          <div style="font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:800;color:${fdata.pollution>2?'var(--red)':'var(--green)'}">
            ${'💨'.repeat(fdata.pollution)||'✅'}
          </div>
          <div style="font-size:8px;color:var(--text-3);text-transform:uppercase;margin-top:2px">Poluição</div>
        </div>
      </div>

      <!-- Description -->
      <div style="background:var(--bg-raised);border-radius:var(--r-md);padding:12px;margin-bottom:16px;font-size:11px;color:var(--text-2);line-height:1.6">
        ${fdata.desc}
      </div>

      <!-- Inputs / Outputs -->
      ${fdata.inputs.length > 0 ? `
      <div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap">
        <div style="font-size:9px;font-weight:800;color:var(--text-3);text-transform:uppercase;letter-spacing:0.5px;margin-right:4px">Insumos:</div>
        ${fdata.inputs.map(i=>`<span class="fac-stat">${i}</span>`).join('')}
      </div>` : ''}
      ${fdata.outputs.length > 0 ? `
      <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap">
        <div style="font-size:9px;font-weight:800;color:var(--text-3);text-transform:uppercase;letter-spacing:0.5px;margin-right:4px">Produtos:</div>
        ${fdata.outputs.map(o=>`<span class="fac-stat green">${o}</span>`).join('')}
      </div>` : ''}

      <!-- Level Multipliers -->
      ${level > 0 ? `
      <div style="background:var(--bg-raised);border-radius:var(--r-md);padding:12px;margin-bottom:16px">
        <div style="font-size:10px;font-weight:800;color:var(--text-3);text-transform:uppercase;margin-bottom:8px">📊 Multiplicadores</div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">
          <div style="text-align:center">
            <div style="font-size:14px;font-weight:800;color:var(--green)">${level}</div>
            <div style="font-size:8px;color:var(--text-3)">Nível</div>
          </div>
          <div style="text-align:center">
            <div style="font-size:14px;font-weight:800;color:var(--gold)">×${Math.pow(1.15,level-1).toFixed(2)}</div>
            <div style="font-size:8px;color:var(--text-3)">Mult. Prod.</div>
          </div>
          <div style="text-align:center">
            <div style="font-size:14px;font-weight:800;color:var(--blue)">+${(fstate?.upgradeLevel||0)}</div>
            <div style="font-size:8px;color:var(--text-3)">Upgrades</div>
          </div>
        </div>
        <div style="margin-top:8px;font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:800;color:var(--green);text-align:center">
          Produção atual: ${window.engine.fmt(fdata.prodPerHour * Math.pow(1.15, level-1) * (1 + (fstate?.upgradeLevel||0)*0.3))}/h
        </div>
      </div>` : ''}

      <!-- Upgrades -->
      <div class="fac-expand">
        <div class="fac-expand-title">🔬 Pesquisas & Upgrades</div>
        ${fdata.upgrades.map((up, i) => {
          const done = (fstate?.upgradeLevel||0) > i;
          const current = (fstate?.upgradeLevel||0) === i && level > 0;
          const minLvl = i === 0 ? 3 : (i === 1 ? 8 : 15);
          const hasLvl = level >= minLvl;
          const canAfford = s.balance >= up.cost;
          return `<div class="upgrade-row">
            <div class="upgrade-icon">${done?'✅':'🔬'}</div>
            <div class="upgrade-info">
              <div class="upgrade-name">${up.name} <span style="font-size:9px;color:var(--text-3)">(${done?'Concluído':`Requer Nv. ${minLvl}`})</span></div>
              <div class="upgrade-bonus" style="color:${done?'var(--green)':current?'var(--gold)':'var(--text-3)'}">
                ${up.bonus}
              </div>
            </div>
            <div class="upgrade-cost">${window.engine.fmt(up.cost)}</div>
            <button class="upgrade-btn ${done?'done':''}" ${!done && (!current || !hasLvl || !canAfford) ? 'disabled style="opacity:0.5"' : ''}
              onclick="${done ? '' : `ui._doUpgrade('${facId}')`}">
              ${done ? '✅' : !hasLvl ? `Nv.${minLvl}` : current ? 'Pesquisar' : '🔒'}
            </button>
          </div>`;
        }).join('')}
      </div>

      ${isPrereqLocked ? `
        <div style="font-size:11px;color:#FCA5A5;background:rgba(239,68,68,0.12);padding:8px 12px;border-radius:var(--r-md);margin:12px 0;border:1px solid rgba(239,68,68,0.25)">
          🔒 <strong>Cadência Industrial:</strong> É necessário possuir <strong>${prereq.name}</strong> no Nível ${prereq.minLevel} para desbloquear esta instalação!
        </div>
      ` : ''}

      <!-- Botões de Construção Ilimitada Direta -->
      <div style="margin-top:16px;display:flex;flex-direction:column;gap:8px">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <button class="build-btn" onclick="ui._doBuildDirect('${facId}', 1)" ${!canBuild ? 'disabled style="opacity:0.4"' : ''}>
            🏗️ ${level === 0 ? 'Construir' : 'Subir Nv.'} (+1) — ${window.engine.fmt(cost)}
          </button>
          <button class="build-btn" onclick="ui._doBuildDirect('${facId}', 5)" ${s.balance < cost * 4 ? 'disabled style="opacity:0.4"' : ''} style="background:linear-gradient(135deg,#3B82F6,#1D4ED8)">
            ⚡ Construir 5x
          </button>
        </div>
        ${level > 0 ? `
          <button class="build-btn" onclick="ui._doBuildDirect('${facId}', 10)" ${s.balance < cost * 7 ? 'disabled style="opacity:0.4"' : ''} style="background:linear-gradient(135deg,#A855F7,#7C3AED)">
            🚀 Expansão 10x
          </button>
        ` : ''}
      </div>
    `;

    this.closeModal('modal-category');
    this.openModal('modal-facility');
  }

  _doBuildDirect(facId, count = 1) {
    const result = window.engine.buildFacilityDirect(facId, count);
    this.showToast(result.msg, result.ok ? 'success' : 'error');
    if (result.ok) {
      this.openFacilityDetail(facId); // Refresh modal
      this.renderActiveFacilities();
      this.renderTileProductionList();
      this._updateHeader();
      this._updateFundacaoStats();
    }
  }

  _doUpgrade(facId) {
    const result = window.engine.upgradeFacility(facId);
    this.showToast(result.msg, result.ok ? 'success' : 'error');
    if (result.ok) this.openFacilityDetail(facId);
  }

  // ─────────────────────────────────────
  // INSTITUTIONS TAB
  // ─────────────────────────────────────
  // ABA INSTITUIÇÕES & GOVERNANÇA SOBERANA
  // ─────────────────────────────────────
  setInstituicoesSubTab(tabName) {
    this.instituicoesSubTab = tabName;
    ['cabinet', 'agencies', 'decrees', 'directives'].forEach(t => {
      const btn = document.getElementById('inst-tab-btn-' + t);
      const pane = document.getElementById('inst-pane-' + t);
      if (btn) btn.classList.toggle('active', t === tabName);
      if (pane) pane.style.display = (t === tabName) ? 'block' : 'none';
    });

    if (tabName === 'cabinet') this._renderCabinet();
    if (tabName === 'agencies') this.renderAgencies();
    if (tabName === 'decrees') this.renderDecrees();
    if (tabName === 'directives') {
      this._renderPolicies();
      this._renderDirectives();
    }
  }

  renderInstitutions() {
    const s = window.engine.state;
    this._setText('inst-approval',  (s.approval || 45) + '%');
    this._setText('inst-stability', Math.round(s.stability || 50) + '%');
    this._setText('inst-influence', window.engine.fmtNum(s.influence || 0));
    this._setText('inst-health-beds', (s.hospitalCapacity || 80) + ' leitos');

    // Nível médio de governança do Estado
    const minAvg = Object.values(s.ministers || {}).reduce((acc, m) => acc + (m.level || 1), 0) / 6;
    const agAvg = Object.values(s.agencies || {}).reduce((acc, a) => acc + (a.level || 1), 0) / 5;
    const govLvl = Math.max(1, Math.floor((minAvg + agAvg) / 2));
    this._setText('inst-gov-level', 'Nv. Governança: ' + govLvl);
    this._setText('inst-active-decrees-count', `${(s.activeDecrees || []).length}/3`);

    const curTab = this.instituicoesSubTab || 'cabinet';
    if (curTab === 'cabinet') this._renderCabinet();
    else if (curTab === 'agencies') this.renderAgencies();
    else if (curTab === 'decrees') this.renderDecrees();
    else if (curTab === 'directives') {
      this._renderPolicies();
      this._renderDirectives();
    }
  }

  // 1. GABINETE DE MINISTROS COM PROJETOS EXECUTIVOS
  _renderCabinet() {
    const list = document.getElementById('cabinet-list');
    if (!list) return;
    const s = window.engine.state;
    const ministers = window.GAME_DATA.ministersExpanded || [];

    list.innerHTML = ministers.map(m => {
      const curLvl = s.ministers?.[m.id]?.level || 1;
      const cost = Math.floor(1000 * Math.pow(1.8, curLvl - 1));
      const canAfford = s.balance >= cost;
      const proj = s.ministerProjects?.[m.id];

      let projectHtml = '';
      if (proj) {
        if (proj.readyToClaim) {
          projectHtml = `
            <div style="margin-top:8px;padding:8px;background:rgba(16,185,129,0.12);border:1px solid rgba(16,185,129,0.3);border-radius:var(--r-md);display:flex;align-items:center;justify-content:space-between">
              <div>
                <div style="font-size:11px;font-weight:800;color:var(--green)">✨ Projeto "${proj.name}" Concluído!</div>
                <div style="font-size:9px;color:var(--text-3)">Espólios prontos para incorporação ao Estado</div>
              </div>
              <button class="build-btn" style="font-size:10px;padding:4px 10px;width:auto;margin:0;background:var(--green);color:#000;font-weight:800"
                onclick="event.stopPropagation();ui._claimMinisterProject('${m.id}')">
                🎁 Resgatar
              </button>
            </div>
          `;
        } else {
          const pct = Math.min(100, Math.round(((proj.totalTime - proj.timeLeft) / proj.totalTime) * 100));
          projectHtml = `
            <div style="margin-top:8px;padding:8px;background:rgba(59,130,246,0.08);border:1px solid rgba(59,130,246,0.2);border-radius:var(--r-md)">
              <div style="display:flex;justify-content:space-between;font-size:10px;margin-bottom:4px">
                <span style="font-weight:700;color:var(--blue)">⏳ ${proj.name}</span>
                <span style="color:var(--text-2)">${proj.timeLeft}s restantes</span>
              </div>
              <div class="progress-bar-bg" style="height:4px;border-radius:2px">
                <div style="height:100%;background:var(--blue);width:${pct}%;border-radius:2px;transition:width 1s linear"></div>
              </div>
            </div>
          `;
        }
      } else {
        projectHtml = `
          <div style="margin-top:8px;display:flex;align-items:center;justify-content:space-between;background:rgba(255,255,255,0.03);padding:6px 10px;border-radius:var(--r-md);border:1px dashed var(--border)">
            <div style="font-size:10px;color:var(--text-3)">
              <strong style="color:var(--text-2)">${m.project?.name}:</strong> ${m.project?.desc || ''}
            </div>
            <button class="pi-buy-btn sub" style="font-size:9px;padding:3px 8px;margin-left:8px;white-space:nowrap"
              onclick="event.stopPropagation();ui._startMinisterProject('${m.id}')">
              🚀 Iniciar ($${m.project?.cost || 300})
            </button>
          </div>
        `;
      }

      return `
        <div class="policy-card" style="flex-direction:column;align-items:stretch;cursor:pointer;padding:12px" onclick="ui.openMinisterDossier('${m.id}')">
          <div style="display:flex;align-items:center;justify-content:space-between">
            <div style="display:flex;align-items:center;gap:10px">
              <div style="font-size:26px">${m.icon}</div>
              <div>
                <div style="font-size:13px;font-weight:800;color:var(--text-1);display:flex;align-items:center;gap:6px">
                  ${m.name}
                  <span class="pill pill-blue" style="font-size:9px;padding:1px 6px">Nv.${curLvl}</span>
                </div>
                <div style="font-size:10px;color:var(--gold);margin-top:2px">${m.effect}</div>
              </div>
            </div>
            <div style="display:flex;gap:6px;align-items:center">
              <button class="pi-buy-btn ${canAfford ? '' : 'sub'}" style="font-size:10px;padding:5px 10px"
                onclick="event.stopPropagation();ui._levelUpMinister('${m.id}')">
                ⬆️ ${window.engine.fmt(cost)}
              </button>
            </div>
          </div>
          ${projectHtml}
        </div>
      `;
    }).join('');
  }

  _levelUpMinister(minId) {
    const res = window.engine.levelUpMinister(minId);
    this.showToast(res.msg, res.ok ? 'success' : 'error');
    if (res.ok) {
      this._renderCabinet();
      this._updateHeader();
    }
  }

  _startMinisterProject(minId) {
    const res = window.engine.startMinisterProject(minId);
    this.showToast(res.msg, res.ok ? 'success' : 'error');
    if (res.ok) this._renderCabinet();
  }

  _claimMinisterProject(minId) {
    const res = window.engine.claimMinisterProject(minId);
    this.showToast(res.msg, res.ok ? 'success' : 'error');
    if (res.ok) {
      this._renderCabinet();
      this._updateHeader();
    }
  }

  openMinisterDossier(minId) {
    const m = (window.GAME_DATA.ministersExpanded || []).find(item => item.id === minId);
    if (!m) return;
    const s = window.engine.state;
    const curLvl = s.ministers?.[minId]?.level || 1;
    const cost = Math.floor(1000 * Math.pow(1.8, curLvl - 1));
    const canAfford = s.balance >= cost;
    const proj = s.ministerProjects?.[minId];

    this._setText('minister-modal-title', `${m.icon} ${m.name}`);
    this._setText('minister-modal-subtitle', `Nível Atual: ${curLvl} · Ministério Soberano`);

    const container = document.getElementById('minister-dossier-body');
    if (!container) return;

    container.innerHTML = `
      <div style="background:var(--bg-raised);padding:14px;border-radius:var(--r-lg);border:1px solid var(--border);margin-bottom:12px">
        <div style="font-size:11px;font-weight:800;color:var(--text-3);letter-spacing:0.5px;margin-bottom:4px">BIOGRAFIA & PERFIL DE GOVERNO</div>
        <div style="font-size:12px;color:var(--text-1);line-height:1.5">${m.bio}</div>
        <div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="font-size:10px;color:var(--text-3)">BÔNUS PERMANENTE EM ATIVIDADE</div>
            <div style="font-size:12px;font-weight:800;color:var(--gold)">${m.effect}</div>
          </div>
          <div class="pill pill-gold" style="font-size:11px">Impacto Ativo ×${curLvl}</div>
        </div>
      </div>

      <div style="background:var(--bg-raised);padding:14px;border-radius:var(--r-lg);border:1px solid var(--border);margin-bottom:12px">
        <div style="font-size:11px;font-weight:800;color:var(--text-3);letter-spacing:0.5px;margin-bottom:6px">PROJETO MINISTERIAL EXECUTIVO</div>
        <div style="font-size:13px;font-weight:800;color:var(--text-1);display:flex;align-items:center;gap:6px">
          <span>${m.project?.icon || '📁'}</span> ${m.project?.name}
        </div>
        <div style="font-size:11px;color:var(--text-3);margin-top:4px;line-height:1.4">${m.project?.desc || ''}</div>
        <div style="margin-top:10px;display:flex;justify-content:space-between;align-items:center">
          <span style="font-size:11px;color:var(--text-2)">Duração: <strong>${m.project?.duration || 90}s</strong></span>
          ${proj ? (
            proj.readyToClaim ? `
              <button class="build-btn" style="width:auto;margin:0;padding:6px 14px;background:var(--green);color:#000;font-weight:800"
                onclick="ui._claimMinisterProject('${minId}');ui.closeModal('modal-minister-dossier')">
                🎁 Resgatar Recompensa
              </button>
            ` : `
              <span class="pill pill-blue">⏳ Em Execução (${proj.timeLeft}s)</span>
            `
          ) : `
            <button class="build-btn" style="width:auto;margin:0;padding:6px 14px"
              onclick="ui._startMinisterProject('${minId}');ui.closeModal('modal-minister-dossier')">
              🚀 Despachar Projeto ($${m.project?.cost || 300})
            </button>
          `}
        </div>
      </div>

      <div style="display:flex;gap:10px;justify-content:flex-end">
        <button class="build-btn" style="flex:1" onclick="ui._levelUpMinister('${minId}');ui.openMinisterDossier('${minId}')">
          ⬆️ Promover para Nv.${curLvl + 1} (${window.engine.fmt(cost)})
        </button>
      </div>
    `;

    this.openModal('modal-minister-dossier');
  }

  // 2. AGÊNCIAS REGULADORAS DO ESTADO
  renderAgencies() {
    const list = document.getElementById('agencies-list');
    if (!list) return;
    const s = window.engine.state;
    const agencies = window.GAME_DATA.regulatoryAgencies || [];

    list.innerHTML = agencies.map(ag => {
      const curLvl = s.agencies?.[ag.id]?.level || 1;
      const agState = s.agencies?.[ag.id] || { level: 1, actionCooldown: 0 };
      const cost = Math.floor(ag.baseCost * Math.pow(ag.costMult, curLvl - 1));
      const canAfford = s.balance >= cost;
      const isMax = curLvl >= (ag.maxLevel || 10);
      const isCd = agState.actionCooldown > 0;

      return `
        <div class="card" style="background:var(--bg-surface);border-color:${ag.color}40;border-left:4px solid ${ag.color};padding:14px">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:8px">
            <div style="display:flex;align-items:center;gap:10px">
              <div style="font-size:28px">${ag.icon}</div>
              <div>
                <div style="font-size:13px;font-weight:800;color:var(--text-1)">
                  ${ag.name}
                  <span class="pill pill-purple" style="font-size:9px;margin-left:4px">Nv.${curLvl}</span>
                </div>
                <div style="font-size:10px;color:var(--text-3);margin-top:2px">${ag.desc}</div>
              </div>
            </div>
            <div>
              <button class="pi-buy-btn ${canAfford && !isMax ? '' : 'sub'}" style="font-size:10px;padding:4px 8px"
                onclick="ui._upgradeAgency('${ag.id}')">
                ${isMax ? '⭐ MAX' : '⬆️ ' + window.engine.fmt(cost)}
              </button>
            </div>
          </div>

          <div style="background:rgba(255,255,255,0.03);padding:8px 10px;border-radius:var(--r-md);margin-bottom:8px;font-size:11px;color:${ag.color}">
            ⚡ <strong>Bônus Ativo:</strong> ${ag.effectDesc}
          </div>

          <div style="display:flex;align-items:center;justify-content:space-between;padding-top:6px;border-top:1px solid var(--border)">
            <div style="font-size:10px;color:var(--text-3)">
              <span style="color:var(--text-1);font-weight:700">Ação:</span> ${ag.action?.name || ''}
            </div>
            <button class="build-btn" style="font-size:10px;padding:4px 12px;width:auto;margin:0;${isCd ? 'opacity:0.5;pointer-events:none' : ''}"
              onclick="ui._runAgencyAction('${ag.id}')">
              ${isCd ? `⏳ Recarga (${agState.actionCooldown}s)` : `⚡ Executar Ação`}
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  _upgradeAgency(agencyId) {
    const res = window.engine.upgradeAgency(agencyId);
    this.showToast(res.msg, res.ok ? 'success' : 'error');
    if (res.ok) {
      this.renderAgencies();
      this._updateHeader();
    }
  }

  _runAgencyAction(agencyId) {
    const res = window.engine.runAgencyAction(agencyId);
    this.showToast(res.msg, res.ok ? 'success' : 'error');
    if (res.ok) {
      this.renderAgencies();
      this._updateHeader();
    }
  }

  // 3. DECRETOS EXECUTIVOS & REFORMAS
  renderDecrees() {
    const activeContainer = document.getElementById('decrees-active-list');
    const availContainer = document.getElementById('decrees-available-list');
    if (!activeContainer || !availContainer) return;

    const s = window.engine.state;
    const activeIds = s.activeDecrees || [];
    const allDecrees = window.GAME_DATA.executiveDecrees || [];

    const activeList = allDecrees.filter(d => activeIds.includes(d.id));
    const availList = allDecrees.filter(d => !activeIds.includes(d.id));

    if (activeList.length === 0) {
      activeContainer.innerHTML = `
        <div style="padding:12px;text-align:center;background:rgba(255,255,255,0.02);border:1px dashed var(--border);border-radius:var(--r-md);font-size:11px;color:var(--text-3)">
          Nenhum decreto presidencial ativo no momento. Promulgue uma ordem executiva abaixo!
        </div>
      `;
    } else {
      activeContainer.innerHTML = activeList.map(d => `
        <div class="card" style="background:rgba(16,185,129,0.05);border-color:rgba(16,185,129,0.3);border-left:4px solid var(--green);padding:12px">
          <div style="display:flex;align-items:flex-start;justify-content:space-between">
            <div style="display:flex;align-items:center;gap:8px">
              <span style="font-size:22px">${d.icon}</span>
              <div>
                <div style="font-size:12px;font-weight:800;color:var(--text-1)">${d.name}</div>
                <div style="font-size:10px;color:var(--green);font-weight:700;margin-top:2px">PROS: ${d.pros}</div>
                <div style="font-size:10px;color:var(--red);margin-top:1px">CONTRAS: ${d.cons}</div>
              </div>
            </div>
            <button class="build-btn" style="font-size:10px;padding:4px 10px;width:auto;margin:0;background:rgba(239,68,68,0.15);color:var(--red);border-color:rgba(239,68,68,0.3)"
              onclick="ui._revokeDecree('${d.id}')">
              ❌ Revogar
            </button>
          </div>
        </div>
      `).join('');
    }

    availContainer.innerHTML = availList.map(d => {
      const canAfford = s.balance >= (d.costCash || 0);
      return `
        <div class="card" style="background:var(--bg-surface);border-color:var(--border);padding:12px">
          <div style="display:flex;align-items:flex-start;justify-content:space-between">
            <div style="display:flex;align-items:center;gap:8px">
              <span style="font-size:22px">${d.icon}</span>
              <div>
                <div style="font-size:12px;font-weight:800;color:var(--text-1)">${d.name}</div>
                <div style="font-size:10px;color:var(--text-3);margin-top:2px">${d.desc}</div>
                <div style="display:flex;gap:10px;margin-top:4px">
                  <span style="font-size:10px;color:var(--green)">+ ${d.pros}</span>
                  <span style="font-size:10px;color:var(--red)">- ${d.cons}</span>
                </div>
              </div>
            </div>
            <button class="build-btn ${canAfford ? '' : 'sub'}" style="font-size:10px;padding:4px 10px;width:auto;margin:0;white-space:nowrap"
              onclick="ui._enactDecree('${d.id}')">
              📜 Promulgar ($${window.engine.fmt(d.costCash || 0)})
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  openDecreesModal() {
    this.renderDecrees();
    const container = document.getElementById('institution-decree-body');
    if (container) {
      container.innerHTML = `
        <div style="margin-bottom:12px;font-size:11px;color:var(--text-3)">
          Promulgue decretos executivos para conferir bônus massivos à sua nação, equilibrando seus impactos na opinião pública e no orçamento.
        </div>
        <div id="modal-decrees-scroll" style="display:flex;flex-direction:column;gap:10px">
          ${(window.GAME_DATA.executiveDecrees || []).map(d => {
            const s = window.engine.state;
            const isActive = (s.activeDecrees || []).includes(d.id);
            return `
              <div class="card" style="padding:12px;background:${isActive ? 'rgba(16,185,129,0.08)' : 'var(--bg-raised)'};border-color:${isActive ? 'var(--green)' : 'var(--border)'}">
                <div style="display:flex;justify-content:space-between;align-items:flex-start">
                  <div>
                    <div style="font-size:13px;font-weight:800;color:var(--text-1)">${d.icon} ${d.name}</div>
                    <div style="font-size:11px;color:var(--text-3);margin-top:2px">${d.desc}</div>
                    <div style="font-size:11px;color:var(--green);font-weight:700;margin-top:4px">Bônus: ${d.pros}</div>
                    <div style="font-size:10px;color:var(--red);margin-top:2px">Contrapartida: ${d.cons}</div>
                  </div>
                  <div>
                    ${isActive ? `
                      <button class="build-btn" style="font-size:10px;padding:4px 10px;width:auto;margin:0;background:rgba(239,68,68,0.2);color:var(--red);border-color:var(--red)"
                        onclick="ui._revokeDecree('${d.id}');ui.openDecreesModal()">
                        ❌ Revogar
                      </button>
                    ` : `
                      <button class="build-btn" style="font-size:10px;padding:4px 10px;width:auto;margin:0"
                        onclick="ui._enactDecree('${d.id}');ui.openDecreesModal()">
                        📜 Promulgar ($${window.engine.fmt(d.costCash || 0)})
                      </button>
                    `}
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }
    this.openModal('modal-institution-decree');
  }

  _enactDecree(decreeId) {
    const res = window.engine.enactDecree(decreeId);
    this.showToast(res.msg, res.ok ? 'success' : 'error');
    if (res.ok) {
      this.renderDecrees();
      this.renderInstitutions();
    }
  }

  _revokeDecree(decreeId) {
    const res = window.engine.revokeDecree(decreeId);
    this.showToast(res.msg, res.ok ? 'success' : 'error');
    if (res.ok) {
      this.renderDecrees();
      this.renderInstitutions();
    }
  }

  // 4. POLÍTICAS NACIONAIS & DIRETRIZES
  _renderPolicies() {
    const s = window.engine.state;
    const list = document.getElementById('policies-list');
    if (!list) return;

    const POLICIES = [
      { id:'pol_green',  name:'🌿 Energia Limpa & Descarbonização', desc:'+15% estabilidade ecológica e -15% poluição', costPerHour:50,   bonus:0.05 },
      { id:'pol_ind',    name:'🏭 Expansão Fabril 4.0',            desc:'+25% produção industrial geral',             costPerHour:120,  bonus:0.10 },
      { id:'pol_border', name:'🛡️ Vigilância Integrada de Fronteiras',desc:'+10% eficácia das forças de defesa',     costPerHour:80,   bonus:0.08 },
      { id:'pol_edu',    name:'📚 Universalização do Ensino Tecnológico',desc:'+20% velocidade de aprendizado & patentes',costPerHour:60,   bonus:0.06 },
      { id:'pol_trade',  name:'🌐 Livre Comércio Global Sem Tarifas', desc:'+30% renda de exportações de commodities', costPerHour:200,  bonus:0.15 }
    ];

    const active = s.policies.map(p => p.id);
    list.innerHTML = POLICIES.map(pol => {
      const isActive = active.includes(pol.id);
      return `<div class="policy-card ${isActive?'active':''}" onclick="ui._togglePolicy('${pol.id}')">
        <div class="policy-toggle"></div>
        <div class="policy-body">
          <div class="policy-name">${pol.name}</div>
          <div class="policy-desc">${pol.desc}</div>
          <div style="display:flex;gap:8px;margin-top:4px">
            <div class="policy-cost">-${window.engine.fmt(pol.costPerHour)}/h</div>
            <div class="policy-bonus">+${(pol.bonus*100).toFixed(0)}% produção</div>
          </div>
        </div>
        ${isActive ? '<div style="font-size:20px">✅</div>' : '<div style="font-size:20px;opacity:0.3">○</div>'}
      </div>`;
    }).join('');
  }

  _togglePolicy(polId) {
    const s = window.engine.state;
    const idx = s.policies.findIndex(p => p.id === polId);
    if (idx >= 0) {
      s.policies.splice(idx, 1);
      this.showToast('📋 Política desativada.', 'info');
    } else {
      s.policies.push({ id: polId, bonus: 0.08, costPerHour: 80 });
      this.showToast('✅ Política ativada!', 'success');
    }
    this._renderPolicies();
  }

  _renderDirectives() {
    if (window.directivesUI) window.directivesUI.render();
  }

  openPoliciesModal() { this.openModal('modal-policies'); }
  openDirectiveModal() {
    if (window.directivesUI) window.directivesUI.openBuilder();
  }


  // ─────────────────────────────────────
  // WORLD TAB
  // ─────────────────────────────────────
  renderWorldTab() {
    this.renderNations();
    this.renderCommodities();
  }

  renderNations() {
    const s = window.engine.state;
    const list = document.getElementById('nations-list');
    if (!list) return;

    const allNations = window.GAME_DATA.nations || [];
    const regions = ['Todas (195)', 'América do Sul', 'América do Norte', 'Europa', 'Ásia', 'África', 'Oceania', 'Oriente Médio'];

    let filtered = [...allNations];
    if (this.nationsRegion && this.nationsRegion !== 'all' && this.nationsRegion !== 'Todas (195)') {
      filtered = filtered.filter(n => n.region === this.nationsRegion);
    }
    if (this.nationsSearch && this.nationsSearch.trim().length > 0) {
      const q = this.nationsSearch.toLowerCase().trim();
      filtered = filtered.filter(n => (n.name && n.name.toLowerCase().includes(q)) || (n.region && n.region.toLowerCase().includes(q)) || (n.bonus && n.bonus.toLowerCase().includes(q)));
    }

    const headerControls = `
      <div style="padding:10px 12px;background:var(--bg-raised);border-bottom:1px solid var(--border)">
        <div style="display:flex;align-items:center;background:var(--bg-surface);border:1px solid var(--border);border-radius:var(--r-md);padding:6px 10px;margin-bottom:8px">
          <span style="font-size:12px;margin-right:6px">🔍</span>
          <input type="text" placeholder="Buscar entre as 195 nações (ex: Brasil, EUA, Angola...)" value="${this.nationsSearch||''}" oninput="ui.onNationsSearch(this.value)" style="flex:1;background:transparent;border:none;outline:none;font-size:12px;color:var(--text-1)">
        </div>
        <div style="display:flex;gap:6px;overflow-x:auto;scrollbar-width:none">
          ${regions.map(r => `
            <button class="pi-chip ${(this.nationsRegion||'all')===(r==='Todas (195)'?'all':r)?'active':''}" onclick="ui.setNationsRegion('${r==='Todas (195)'?'all':r}')">
              ${r}
            </button>
          `).join('')}
        </div>
      </div>
    `;

    const nationCards = filtered.map(nation => {
      const rel = s.relations[nation.id] || { status: 'neutral', trust: 0 };
      const statusMap = { neutral:'neutral', ally:'ally', trade:'trade', war:'war' };
      const statusLabel = { neutral:'Neutro', ally:'Aliado 🤝', trade:'Parceiro 📦', war:'Em Guerra ⚔️' };
      const dyn = window.engine.getDynamicNpcStats(nation.id);
      const tierBadge = dyn.tier === 'top' ? '<span style="color:#F87171;font-weight:800;font-size:9px">👑 SUPERPOTÊNCIA</span>' : (dyn.tier === 'mid' ? '<span style="color:#60A5FA;font-weight:700;font-size:9px">⭐ Potência</span>' : '<span style="color:var(--text-3);font-size:9px">Emergente</span>');

      return `<div class="nation-card" onclick="ui.openNationModal('${nation.id}')">
        <div class="nation-flag-big" style="font-size:32px">${dyn.flag}</div>
        <div class="nation-info-body">
          <div class="nation-name-text">${nation.name} <span style="font-size:10px;color:var(--text-3);font-weight:400">· ${nation.region}</span> · ${tierBadge}</div>
          <div style="font-size:10px;color:var(--green);font-weight:700;margin-top:2px">${nation.bonus || '+15% diplomacia'}</div>
          <div class="nation-power" style="font-size:9px;margin-top:2px">Poder: ${dyn.powerFormatted} · PIB: ${dyn.gdpFormatted} · Pop: ${dyn.pop} · IA: ${dyn.archetype}</div>
        </div>
        <div class="nation-status status-${statusMap[rel.status]||'neutral'}">
          ${statusLabel[rel.status]||'Neutro'}
        </div>
      </div>`;
    }).join('');

    list.innerHTML = headerControls + nationCards;
  }

  onNationsSearch(val) {
    this.nationsSearch = val || '';
    this.renderNations();
  }

  setNationsRegion(reg) {
    this.nationsRegion = reg;
    this.renderNations();
  }

  openNationModal(nationId) {
    const nation = window.GAME_DATA.nations.find(n => n.id === nationId);
    const s = window.engine.state;
    const rel = s.relations[nationId] || { status: 'neutral', trust: 0 };
    if (!nation) return;

    const dyn = window.engine.getDynamicNpcStats(nationId);

    document.getElementById('nation-modal-title').textContent = dyn.flag + ' ' + nation.name;
    document.getElementById('nation-modal-desc').textContent  = `${nation.region} · Arquétipo IA: ${dyn.archetype} (${dyn.tier.toUpperCase()}) · Bônus: ${nation.bonus || '+15% influência'}`;

    const body = document.getElementById('nation-modal-body');
    body.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px">
        <div style="background:var(--bg-raised);border-radius:var(--r-md);padding:10px;text-align:center">
          <div style="font-size:16px;font-weight:800;color:var(--red)">${dyn.powerFormatted}</div>
          <div style="font-size:8px;color:var(--text-3);text-transform:uppercase;margin-top:2px">Poder Militar Dinâmico</div>
        </div>
        <div style="background:var(--bg-raised);border-radius:var(--r-md);padding:10px;text-align:center">
          <div style="font-size:16px;font-weight:800;color:var(--gold)">${dyn.gdpFormatted}</div>
          <div style="font-size:8px;color:var(--text-3);text-transform:uppercase;margin-top:2px">PIB Soberano Dinâmico</div>
        </div>
        <div style="background:var(--bg-raised);border-radius:var(--r-md);padding:10px;text-align:center">
          <div style="font-size:16px;font-weight:800;color:var(--blue)">${dyn.pop}</div>
          <div style="font-size:8px;color:var(--text-3);text-transform:uppercase;margin-top:2px">População</div>
        </div>
        <div style="background:var(--bg-raised);border-radius:var(--r-md);padding:10px;text-align:center">
          <div style="font-size:16px;font-weight:800;color:var(--green)">${rel.status||'neutral'}</div>
          <div style="font-size:8px;color:var(--text-3);text-transform:uppercase;margin-top:2px">Status Diplomático</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <button class="build-btn" style="border-color:var(--green);color:var(--green);background:rgba(0,255,136,0.1)"
          onclick="ui._doNationAction('${nationId}','alliance')">
          🤝 Aliança<br><span style="font-size:9px">${window.engine.fmt(dyn.allianceCost)}</span>
        </button>
        <button class="build-btn" style="border-color:var(--blue);color:var(--blue);background:rgba(59,130,246,0.1)"
          onclick="ui._doNationAction('${nationId}','trade')">
          📦 Acordo Comercial<br><span style="font-size:9px">${window.engine.fmt(dyn.tradeCost)}</span>
        </button>
        <button class="build-btn" style="border-color:var(--gold);color:var(--gold);background:rgba(255,215,0,0.1)"
          onclick="ui._doNationAction('${nationId}','peace')">
          🕊️ Tratado de Paz<br><span style="font-size:9px">${window.engine.fmt(dyn.peaceCost)}</span>
        </button>
        <button class="build-btn" style="border-color:var(--red);color:var(--red);background:rgba(255,68,68,0.1)"
          onclick="ui._doNationAction('${nationId}','war')">
          ⚔️ Guerra Total<br><span style="font-size:9px">Grátis</span>
        </button>
      </div>`;
    this.openModal('modal-nation');
  }

  _doNationAction(nationId, action) {
    const result = window.engine.sendDiplomacy(nationId, action);
    this.showToast(result.ok ? '🌍 Ação diplomática enviada!' : result.msg || '❌ Erro.', result.ok ? 'success' : 'error');
    this.closeModal('modal-nation');
    this.renderNations();
  }

  openRegion(regionId) {
    if (window.mapModule) {
      window.mapModule.openSuperModal(regionId);
    }
  }

  renderCommodities() {
    const s = window.engine.state;
    const list = document.getElementById('commodities-list');
    if (!list) return;

    const families = window.GAME_DATA.commodityFamilies || [];
    let comms = [...(window.GAME_DATA.commodities || [])];
    if (this.commFamily && this.commFamily !== 'all') {
      comms = comms.filter(c => c.family === this.commFamily);
    }

    const familyFilterBar = `
      <div style="display:flex;gap:6px;overflow-x:auto;padding-bottom:10px;margin-bottom:8px;scrollbar-width:none">
        <button class="pi-chip ${(this.commFamily||'all')==='all'?'active':''}" onclick="ui.setCommFamily('all')">
          Todas (64)
        </button>
        ${families.map(fam => `
          <button class="pi-chip ${(this.commFamily||'all')===fam.id?'active':''}" onclick="ui.setCommFamily('${fam.id}')">
            ${fam.icon} ${fam.name} (8)
          </button>
        `).join('')}
      </div>
    `;

    const commodityCards = comms.map(c => {
      const cd = s.commodities[c.id];
      if (!cd) return '';
      const hist = cd.history || [cd.price];
      const prev = hist[hist.length-2] || hist[0];
      const change = ((cd.price - prev) / (prev||1) * 100).toFixed(2);
      const isUp = cd.price >= prev;

      return `<div class="commodity-card">
        <div class="commodity-header">
          <div class="comm-icon">${c.icon}</div>
          <div>
            <div class="comm-name">${c.name}</div>
            <div class="comm-unit" style="font-size:9px;color:var(--text-3)">${c.unit} · ${c.desc || ''}</div>
          </div>
          <div style="margin-left:auto;text-align:right">
            <div class="comm-price">${window.engine.fmt(cd.price)}</div>
            <div class="comm-change ${isUp?'up':'down'}">${isUp?'▲':' ▼'} ${Math.abs(change)}%</div>
          </div>
        </div>
        <canvas class="comm-sparkline" id="spark-${c.id}" height="40"></canvas>
        <div class="comm-inventory" style="margin-top:4px">
          Estoque: <strong>${(cd.inventory||0).toFixed(1)} ${c.unit}</strong>
        </div>
        <div class="comm-actions">
          <button class="comm-btn comm-btn-buy" onclick="ui._buyCommodity('${c.id}')">
            🛒 Comprar
          </button>
          <button class="comm-btn comm-btn-sell" onclick="ui._sellCommodity('${c.id}')">
            💰 Vender
          </button>
        </div>
      </div>`;
    }).join('');

    list.innerHTML = familyFilterBar + commodityCards;

    // Draw mini sparklines
    setTimeout(() => {
      comms.forEach(c => {
        const cd = s.commodities[c.id];
        if (!cd) return;
        this._drawMiniSparkline('spark-' + c.id, cd.history || [cd.price]);
      });
    }, 50);
  }

  setCommFamily(famId) {
    this.commFamily = famId;
    this.renderCommodities();
  }

  _drawMiniSparkline(canvasId, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.offsetWidth || 300;
    const H = 40;
    canvas.width = W; canvas.height = H;
    if (data.length < 2) return;

    const min = Math.min(...data);
    const max = Math.max(...data) || 1;
    const pts = data.map((v,i) => ({
      x: (i/(data.length-1))*W,
      y: H - ((v-min)/(max-min||1))*(H-4)-2
    }));

    const isUp = data[data.length-1] >= data[0];
    ctx.clearRect(0,0,W,H);
    ctx.beginPath();
    pts.forEach((p,i) => i===0 ? ctx.moveTo(p.x,p.y) : ctx.lineTo(p.x,p.y));
    ctx.strokeStyle = isUp ? '#00FF88' : '#FF4444';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  _buyCommodity(commId) {
    const result = window.engine.buyCommodity(commId, 1);
    this.showToast(result.msg, result.ok ? 'success' : 'error');
    this.renderCommodities();
    this._updateHeader();
  }

  _sellCommodity(commId) {
    const result = window.engine.sellCommodity(commId, 1);
    this.showToast(result.msg, result.ok ? 'success' : 'error');
    this.renderCommodities();
    this._updateHeader();
  }

  // ─────────────────────────────────────
  // ─────────────────────────────────────
  // QUARTEL-GENERAL DE MISSÕES & CAMPANHA
  // ─────────────────────────────────────
  setMissionsSubTab(tabName) {
    this.missionsSubTab = tabName;
    ['campaign', 'daily', 'tactical', 'minigames'].forEach(t => {
      const btn = document.getElementById('mission-tab-btn-' + t);
      const pane = document.getElementById('mission-pane-' + t);
      if (btn) btn.classList.toggle('active', t === tabName);
      if (pane) pane.style.display = (t === tabName) ? 'block' : 'none';
    });

    if (tabName === 'campaign') this.renderCampaignMissions();
    if (tabName === 'daily') this.renderDailyBounties();
    if (tabName === 'tactical') this.renderTacticalOperations();
    if (tabName === 'minigames') this.renderMinigames();
  }

  renderMissionsTab() {
    const s = window.engine.state;
    const allMissions = window.GAME_DATA.campaignMissions || [];
    let completedCount = 0;

    allMissions.forEach(m => {
      const status = window.engine.checkMissionStatus(m.id);
      if (status.claimed || status.isDone) completedCount++;
    });

    const total = allMissions.length || 16;
    const overallPct = Math.min(100, Math.round((completedCount / total) * 100));

    this._setText('missions-progress-pill', `Progresso: ${overallPct}%`);
    this._setText('missions-completed-counter', `${completedCount} / ${total} Concluídas`);
    const fill = document.getElementById('missions-progress-fill');
    if (fill) fill.style.width = overallPct + '%';

    const curTab = this.missionsSubTab || 'campaign';
    if (curTab === 'campaign') this.renderCampaignMissions();
    else if (curTab === 'daily') this.renderDailyBounties();
    else if (curTab === 'tactical') this.renderTacticalOperations();
    else if (curTab === 'minigames') this.renderMinigames();
  }

  // 1. CAMPANHA SOBERANA (CAPÍTULOS I A IV)
  renderCampaignMissions() {
    const container = document.getElementById('campaign-missions-list');
    if (!container) return;

    const allMissions = window.GAME_DATA.campaignMissions || [];
    const chapters = [
      { num: 1, title: 'Capítulo I — Fundação Soberana', icon: '🏛️', color: 'var(--gold)' },
      { num: 2, title: 'Capítulo II — Industrialização & Trabalho', icon: '🏭', color: 'var(--blue)' },
      { num: 3, title: 'Capítulo III — Potência Regional & Dissuasão', icon: '🛡️', color: 'var(--green)' },
      { num: 4, title: 'Capítulo IV — Superpotência & Hegemonia', icon: '👑', color: 'var(--purple)' }
    ];

    container.innerHTML = chapters.map(chap => {
      const chapMissions = allMissions.filter(m => m.chapter === chap.num);
      const missionCardsHtml = chapMissions.map(m => {
        const status = window.engine.checkMissionStatus(m.id);
        const isClaimed = status.claimed;
        const isDone = status.isDone;
        const pct = status.progress;

        let actionBtnHtml = '';
        if (isClaimed) {
          actionBtnHtml = `<span class="pill pill-green" style="font-size:10px">✅ Concluída</span>`;
        } else if (isDone) {
          actionBtnHtml = `
            <button class="build-btn pulse-glow" style="font-size:11px;padding:6px 12px;width:auto;margin:0;background:linear-gradient(135deg,var(--gold),#F59E0B);color:#000;font-weight:900"
              onclick="event.stopPropagation();ui.claimMission('${m.id}')">
              🏆 REIVINDICAR
            </button>
          `;
        } else {
          actionBtnHtml = `
            <button class="pi-buy-btn sub" style="font-size:10px;padding:4px 10px"
              onclick="event.stopPropagation();ui.openMissionDetail('${m.id}')">
              🔍 Briefing
            </button>
          `;
        }

        return `
          <div class="card mission-campaign-card ${isDone && !isClaimed ? 'ready-to-claim' : ''} ${isClaimed ? 'claimed' : ''}"
            style="padding:12px;cursor:pointer;background:var(--bg-surface);border-color:${isDone && !isClaimed ? 'var(--gold)' : 'var(--border)'}"
            onclick="ui.openMissionDetail('${m.id}')">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px">
              <div style="display:flex;align-items:flex-start;gap:10px">
                <div style="font-size:24px;margin-top:2px">${m.icon}</div>
                <div>
                  <div style="font-size:13px;font-weight:800;color:${isClaimed ? 'var(--text-3)' : 'var(--text-1)'}">
                    ${m.title}
                  </div>
                  <div style="font-size:11px;color:var(--text-3);margin-top:2px;line-height:1.4">${m.desc}</div>
                  <div style="display:flex;align-items:center;gap:6px;margin-top:6px">
                    <span style="font-size:10px;color:var(--gold);font-weight:700">🏆 Recompensa: ${m.reward?.desc || ''}</span>
                  </div>
                </div>
              </div>
              <div>${actionBtnHtml}</div>
            </div>

            ${!isClaimed ? `
              <div style="margin-top:10px">
                <div style="display:flex;justify-content:space-between;font-size:9px;color:var(--text-3);margin-bottom:3px">
                  <span>Meta: ${m.targetText || ''}</span>
                  <span><strong>${pct}%</strong></span>
                </div>
                <div class="progress-bar-bg" style="height:4px;border-radius:2px">
                  <div style="height:100%;width:${pct}%;background:${isDone ? 'var(--gold)' : 'var(--purple)'};border-radius:2px;transition:width 0.4s ease"></div>
                </div>
              </div>
            ` : ''}
          </div>
        `;
      }).join('');

      return `
        <div class="chapter-block" style="background:var(--bg-raised);border:1px solid var(--border);border-radius:var(--r-lg);padding:12px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid var(--border)">
            <span style="font-size:20px">${chap.icon}</span>
            <div style="font-size:13px;font-weight:900;color:${chap.color}">${chap.title}</div>
          </div>
          <div style="display:flex;flex-direction:column;gap:8px">
            ${missionCardsHtml}
          </div>
        </div>
      `;
    }).join('');
  }

  // 2. CONTRATOS OPERACIONAIS DIÁRIOS (BOUNTIES 24H)
  renderDailyBounties() {
    const container = document.getElementById('daily-bounties-list');
    if (!container) return;

    const bounties = window.engine.getDailyBounties();
    const now = new Date();
    const hoursLeft = 23 - now.getHours();
    const minsLeft = 59 - now.getMinutes();
    this._setText('bounties-countdown-badge', `Renova em ${hoursLeft}h ${minsLeft}m`);

    container.innerHTML = bounties.map(b => {
      let actionBtnHtml = '';
      if (b.claimed) {
        actionBtnHtml = `<span class="pill pill-green" style="font-size:10px">✅ Reivindicado</span>`;
      } else if (b.isComplete) {
        actionBtnHtml = `
          <button class="build-btn" style="font-size:10px;padding:6px 12px;width:auto;margin:0;background:var(--green);color:#000;font-weight:900"
            onclick="ui.claimBounty('${b.id}')">
            🎁 RESGATAR
          </button>
        `;
      } else {
        actionBtnHtml = `<span class="pill pill-blue" style="font-size:10px">Em Andamento</span>`;
      }

      return `
        <div class="card" style="padding:12px;background:var(--bg-surface);border-color:${b.isComplete && !b.claimed ? 'var(--green)' : 'var(--border)'}">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px">
            <div style="display:flex;align-items:center;gap:10px">
              <span style="font-size:24px">${b.icon}</span>
              <div>
                <div style="font-size:13px;font-weight:800;color:var(--text-1)">${b.title}</div>
                <div style="font-size:11px;color:var(--text-3);margin-top:2px">${b.desc}</div>
                <div style="font-size:10px;color:var(--gold);font-weight:700;margin-top:4px">
                  Espólio: +$${window.engine.fmt(b.reward?.cash || 0)} ${b.reward?.xp ? `· +${b.reward.xp} XP` : ''} ${b.reward?.stability ? `· +${b.reward.stability}% Estabilidade` : ''}
                </div>
              </div>
            </div>
            <div>${actionBtnHtml}</div>
          </div>

          <div style="margin-top:8px">
            <div style="display:flex;justify-content:space-between;font-size:9px;color:var(--text-3);margin-bottom:3px">
              <span>Progresso Atual: ${b.currentVal} / ${b.target}</span>
              <span><strong>${b.pct}%</strong></span>
            </div>
            <div class="progress-bar-bg" style="height:4px;border-radius:2px">
              <div style="height:100%;width:${b.pct}%;background:var(--green);border-radius:2px;transition:width 0.4s ease"></div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  claimBounty(bountyId) {
    const res = window.engine.claimDailyBounty(bountyId);
    this.showToast(res.msg, res.ok ? 'success' : 'error');
    if (res.ok) {
      this.renderDailyBounties();
      this._updateHeader();
    }
  }

  // 3. OPERAÇÕES GEOPOLÍTICAS TÁTICAS
  renderTacticalOperations() {
    const container = document.getElementById('tactical-missions-list');
    if (!container) return;
    const s = window.engine.state;
    const tactical = window.GAME_DATA.tacticalMissions || [];
    const activeTac = s.activeTacticalMission;

    let activeBannerHtml = '';
    if (activeTac) {
      const pct = Math.min(100, Math.round(((activeTac.totalTime - activeTac.timeLeft) / activeTac.totalTime) * 100));
      activeBannerHtml = `
        <div class="card" style="background:rgba(239,68,68,0.1);border-color:var(--red);margin-bottom:12px;padding:12px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
            <div style="display:flex;align-items:center;gap:8px">
              <span style="font-size:22px" class="radar-ping">🚨</span>
              <div>
                <div style="font-size:12px;font-weight:900;color:var(--red)">OPERAÇÃO EM ANDAMENTO: ${activeTac.name}</div>
                <div style="font-size:10px;color:var(--text-3)">Comandos infiltrados no teatro de operações</div>
              </div>
            </div>
            <div class="pill pill-red" style="font-size:10px">${activeTac.timeLeft}s restantes</div>
          </div>
          <div class="progress-bar-bg" style="height:6px;border-radius:3px">
            <div style="height:100%;width:${pct}%;background:var(--red);border-radius:3px;transition:width 1s linear"></div>
          </div>
        </div>
      `;
    }

    container.innerHTML = activeBannerHtml + tactical.map(tac => {
      const canAfford = s.balance >= tac.cost;
      const isBusy = !!activeTac;
      return `
        <div class="card" style="background:var(--bg-surface);border-color:var(--border);padding:12px">
          <div style="display:flex;align-items:flex-start;justify-content:space-between">
            <div style="display:flex;align-items:center;gap:10px">
              <span style="font-size:26px">${tac.icon}</span>
              <div>
                <div style="font-size:13px;font-weight:800;color:var(--text-1)">${tac.name}</div>
                <div style="font-size:10px;color:var(--text-3);margin-top:2px">
                  Duração: <strong>${tac.time}s</strong> · Risco: <span style="color:var(--red);font-weight:700">${tac.risk}</span>
                </div>
                <div style="font-size:11px;color:var(--gold);font-weight:700;margin-top:4px">
                  🎁 Espólio Estimado: ${tac.rewardDesc}
                </div>
              </div>
            </div>
            <button class="build-btn ${canAfford && !isBusy ? '' : 'sub'}"
              style="font-size:10px;padding:6px 12px;width:auto;margin:0;white-space:nowrap;${isBusy ? 'opacity:0.5;pointer-events:none' : ''}"
              onclick="ui.startTacticalOperation('${tac.id}')">
              🪖 Iniciar ($${window.engine.fmt(tac.cost)})
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  startTacticalOperation(tacId) {
    const res = window.engine.startTacticalMission(tacId);
    this.showToast(res.msg, res.ok ? 'success' : 'error');
    if (res.ok) {
      this.renderTacticalOperations();
      this._updateHeader();
    }
  }

  // 4. MINIJOGOS TÁTICOS (AMONG US)
  renderMinigames() {
    const grid = document.getElementById('mission-grid');
    if (!grid) return;

    grid.innerHTML = (window.GAME_DATA.minigames || []).map(mg => `
      <div class="mission-card" style="--mission-color:${mg.color}"
        onclick="ui.startMission('${mg.id}')">
        <div class="mission-icon">${mg.icon}</div>
        <div class="mission-name" style="color:${mg.color}">${mg.name}</div>
        <div class="mission-desc">${mg.desc}</div>
        <div class="mission-reward">
          🏆 ${window.engine.fmt(window.engine.state.gdpPerHour * 5 || 100)} recompensa
        </div>
      </div>`).join('');
  }

  startMission(gameId) {
    if (window.minigamesUI) {
      window.minigamesUI.start(gameId);
    }
    const badge = document.getElementById('mg-badge-' + gameId);
    if (badge) badge.style.opacity = '1';
  }

  // 5. MODAL DOSSIÊ DE MISSÃO (BRIEFING CONFIDENCIAL)
  openMissionDetail(missionId) {
    const m = (window.GAME_DATA.campaignMissions || []).find(item => item.id === missionId);
    if (!m) return;

    const status = window.engine.checkMissionStatus(missionId);
    this._setText('mission-modal-title', `🎯 ${m.title}`);
    this._setText('mission-modal-subtitle', `${m.chapterName} · Dossiê Confidencial`);

    const container = document.getElementById('mission-detail-body');
    if (!container) return;

    container.innerHTML = `
      <div style="background:var(--bg-raised);padding:14px;border-radius:var(--r-lg);border:1px solid var(--border);margin-bottom:12px;position:relative;overflow:hidden">
        <div class="dossier-stamp">CONFIDENCIAL</div>
        <div style="font-size:11px;font-weight:800;color:var(--text-3);letter-spacing:0.5px;margin-bottom:4px">BRIEFING DE INTELIGÊNCIA</div>
        <div style="font-size:13px;color:var(--text-1);line-height:1.5;margin-bottom:10px">${m.desc}</div>

        <div style="padding:10px;background:rgba(255,255,255,0.03);border-radius:var(--r-md);border:1px dashed var(--border)">
          <div style="font-size:10px;color:var(--text-3);text-transform:uppercase;font-weight:700">Objetivo de Estado:</div>
          <div style="font-size:13px;font-weight:800;color:var(--text-1);margin-top:2px">${m.targetText || ''}</div>
          <div style="margin-top:8px">
            <div style="display:flex;justify-content:space-between;font-size:10px;margin-bottom:3px">
              <span>Progresso Atual</span>
              <span><strong>${status.progress}%</strong></span>
            </div>
            <div class="progress-bar-bg" style="height:6px;border-radius:3px">
              <div style="height:100%;width:${status.progress}%;background:linear-gradient(90deg,var(--purple),var(--gold));border-radius:3px"></div>
            </div>
          </div>
        </div>
      </div>

      <div style="background:var(--bg-raised);padding:14px;border-radius:var(--r-lg);border:1px solid var(--border);margin-bottom:14px">
        <div style="font-size:11px;font-weight:800;color:var(--text-3);letter-spacing:0.5px;margin-bottom:6px">ESPÓLIOS & RECOMPENSAS SOBERANAS</div>
        <div style="font-size:14px;font-weight:800;color:var(--gold);display:flex;align-items:center;gap:6px">
          <span>🏆</span> ${m.reward?.desc || ''}
        </div>
      </div>

      <div style="display:flex;gap:10px;justify-content:flex-end">
        ${status.claimed ? `
          <button class="build-btn" style="flex:1;background:var(--bg-raised);color:var(--text-3);border-color:var(--border)" disabled>
            ✅ Missão Já Concluída e Resgatada
          </button>
        ` : (
          status.isDone ? `
            <button class="build-btn" style="flex:1;background:linear-gradient(135deg,var(--gold),#F59E0B);color:#000;font-weight:900"
              onclick="ui.claimMission('${m.id}');ui.closeModal('modal-mission-detail')">
              🏆 REIVINDICAR RECOMPENSA AGORA!
            </button>
          ` : `
            <button class="build-btn" style="flex:1" onclick="ui.closeModal('modal-mission-detail')">
              🎯 Continuar Missão
            </button>
          `
        )}
      </div>
    `;

    this.openModal('modal-mission-detail');
  }

  // 6. RESGATE COMEMORATIVO COM FANFARRA
  claimMission(missionId) {
    const res = window.engine.claimMissionReward(missionId);
    if (!res.ok) {
      this.showToast(res.msg, 'error');
      return;
    }

    this.showMissionRewardModal(res.mission, res.rewards);
    this.renderMissionsTab();
    this._updateHeader();
  }

  showMissionRewardModal(mission, rewards) {
    const container = document.getElementById('mission-reward-body');
    if (!container) return;

    container.innerHTML = `
      <div style="font-size:54px;margin-bottom:10px" class="celebrate-bounce">🏆</div>
      <div style="font-size:18px;font-weight:900;color:var(--gold);letter-spacing:0.5px">MISSÃO SOBERANA CUMPRIDA!</div>
      <div style="font-size:13px;font-weight:800;color:var(--text-1);margin-top:4px">${mission.title}</div>
      <div style="font-size:11px;color:var(--text-3);margin-top:2px">${mission.chapterName}</div>

      <div style="margin:16px 0;padding:12px;background:rgba(255,255,255,0.03);border:1px solid var(--border-bright);border-radius:var(--r-lg)">
        <div style="font-size:10px;color:var(--text-3);text-transform:uppercase;font-weight:700;margin-bottom:6px">ESPÓLIOS ADQUIRIDOS:</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center">
          ${(rewards || []).map(r => `
            <span class="pill pill-gold" style="font-size:12px;font-weight:800;padding:4px 10px">${r}</span>
          `).join('')}
        </div>
      </div>

      <div style="font-size:11px;color:var(--text-2);font-style:italic;margin-bottom:16px">
        "A soberania de um império é forjada na disciplina de suas conquistas."
      </div>

      <button class="build-btn" style="width:100%;background:linear-gradient(135deg,var(--gold),#F59E0B);color:#000;font-weight:900;padding:10px"
        onclick="ui.closeModal('modal-mission-reward')">
        CONTINUAR EXPANSÃO IMPERIAL
      </button>
    `;

    this.openModal('modal-mission-reward');
  }

  // ─────────────────────────────────────
  // EVENTS
  // ─────────────────────────────────────
  _showEventBanner(ev) {
    const banner = document.getElementById('event-banner');
    if (!banner) return;
    banner.style.display = 'flex';
    banner.className = 'event-banner ' + ev.type;
    banner.innerHTML = `
      <div class="event-banner-icon">${ev.icon}</div>
      <div class="event-banner-body">
        <div class="event-banner-name">${ev.name}</div>
        <div class="event-banner-desc">Impacto: ${ev.impact} · ${ev.duration}s</div>
      </div>`;
  }

  _hideEventBanner() {
    const banner = document.getElementById('event-banner');
    if (banner) banner.style.display = 'none';
  }

  // ─────────────────────────────────────
  // MODALS
  // ─────────────────────────────────────
  openModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('open');
    // Close on overlay click
    el?.addEventListener('click', (e) => {
      if (e.target === el) this.closeModal(id);
    }, { once: true });
  }

  closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('open');
  }

  // ─────────────────────────────────────
  // GERENCIADOR DE NOTIFICAÇÕES & TOASTS (ANTI-TRAVAMENTO)
  // ─────────────────────────────────────
  _debouncedRenderCategories() {
    if (this.currentTab !== 'cadeia') return;
    clearTimeout(this._catRenderDebounce);
    this._catRenderDebounce = setTimeout(() => {
      if (this.currentTab === 'cadeia') this.renderCategories();
    }, 250);
  }

  _handleLevelUpToast(data) {
    const s = window.engine.state;
    const settings = s.settings || {};

    // Se o jogador desativou toasts em geral, registra apenas no histórico
    if (settings.toastsEnabled === false) {
      this._logHistory(`⭐ NÍVEL ${data.newLevel} ATINGIDO! (+${data.levelsGained || 1} Níveis)`, 'level');
      return;
    }

    // Agrupamento inteligente de notificações de Level Up (Prevenção de Travamentos)
    if (settings.batchLevelUpToasts !== false) {
      const container = document.getElementById('toast-container');
      if (container) {
        const existingLevelToast = container.querySelector('.toast.level');
        if (existingLevelToast) {
          // Atualiza em tempo real o toast existente sem acumular nós no DOM
          const currentTotal = (existingLevelToast._totalLevelsGained || 0) + (data.levelsGained || 1);
          existingLevelToast._totalLevelsGained = currentTotal;
          const msgSpan = existingLevelToast.querySelector('.toast-msg');
          if (msgSpan) {
            msgSpan.innerHTML = `⭐ NÍVEL ${data.newLevel} ALCANÇADO! <span class="toast-count">(+${currentTotal} Níveis)</span>`;
          }
          // Efeito de bounce sutil na escala
          existingLevelToast.style.transform = 'scale(1.06)';
          setTimeout(() => { if (existingLevelToast) existingLevelToast.style.transform = ''; }, 140);

          // Renova tempo de expiração do toast
          clearTimeout(existingLevelToast._dismissTimer);
          existingLevelToast._dismissTimer = setTimeout(() => {
            if (existingLevelToast.parentNode) {
              existingLevelToast.style.opacity = '0';
              existingLevelToast.style.transform = 'translateY(-10px)';
              setTimeout(() => existingLevelToast.remove(), 220);
            }
          }, 3000);

          this._logHistory(`⭐ NÍVEL ${data.newLevel} ATINGIDO! (+${data.levelsGained || 1} Níveis)`, 'level');
          return;
        }
      }
    }

    // Se não há toast ativo ou agrupamento desligado, cria o toast normalmente
    const gainedText = (data.levelsGained && data.levelsGained > 1) ? ` (+${data.levelsGained} Níveis)` : '';
    const toastElem = this.showToast(`⭐ NÍVEL ${data.newLevel} ATINGIDO!${gainedText}`, 'level');
    if (toastElem) {
      toastElem._totalLevelsGained = data.levelsGained || 1;
    }
  }

  _logHistory(msg, type='info') {
    if (!this.notificationHistory) this.notificationHistory = [];
    this.notificationHistory.unshift({
      msg,
      type,
      time: new Date().toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit', second:'2-digit' })
    });
    const maxHist = window.engine?.getSetting?.('maxEventHistory', 50) || 50;
    while (this.notificationHistory.length > maxHist) this.notificationHistory.pop();
    const notifDot = document.getElementById('notif-dot');
    if (notifDot) notifDot.style.display = 'block';
  }

  showToast(msg, type='info') {
    this._logHistory(msg, type);

    const container = document.getElementById('toast-container');
    if (!container) return null;

    if (window.engine?.getSetting?.('toastsEnabled', true) === false) {
      return null;
    }

    const maxVisible = window.engine?.getSetting?.('toastMaxCount', 3) || 3;
    const now = Date.now();

    // Deduplicação de mensagens idênticas
    if (this.lastToast && this.lastToast.msg === msg && (now - this.lastToast.ts) < 1800 && this.lastToast.element && document.body.contains(this.lastToast.element)) {
      this.lastToast.count = (this.lastToast.count || 1) + 1;
      this.lastToast.ts = now;
      const countBadge = this.lastToast.element.querySelector('.toast-count');
      if (countBadge) {
        countBadge.textContent = `(×${this.lastToast.count})`;
      } else {
        const span = document.createElement('span');
        span.className = 'toast-count';
        span.textContent = `(×${this.lastToast.count})`;
        this.lastToast.element.appendChild(span);
      }
      this.lastToast.element.style.transform = 'scale(1.05)';
      setTimeout(() => { if (this.lastToast.element) this.lastToast.element.style.transform = ''; }, 120);
      return this.lastToast.element;
    }

    // Limite estrito no contêiner para prevenir sobrecarga de nós
    while (container.children.length >= maxVisible) {
      container.firstElementChild.remove();
    }

    const icons = { success:'✅', error:'❌', info:'ℹ️', level:'⭐', crisis:'🚨', heg:'🌌' };
    const toast = document.createElement('div');
    toast.className = 'toast ' + type;
    toast.innerHTML = `<span class="toast-icon">${icons[type] || 'ℹ️'}</span><span class="toast-msg">${msg}</span>`;
    toast.onclick = () => toast.remove();

    container.appendChild(toast);
    this.lastToast = { msg, ts: now, count: 1, element: toast };

    toast._dismissTimer = setTimeout(() => {
      if (toast.parentNode) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px)';
        setTimeout(() => toast.remove(), 220);
      }
    }, 2800);

    return toast;
  }

  openNotificationsModal() {
    const notifDot = document.getElementById('notif-dot');
    if (notifDot) notifDot.style.display = 'none';
    this.renderNotificationsModal();
    this.openModal('modal-notifications');
  }

  renderNotificationsModal() {
    const body = document.getElementById('notifications-modal-body');
    if (!body) return;
    const history = this.notificationHistory || [];
    if (history.length === 0) {
      body.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🔔</div>
          <div class="empty-state-text">Nenhuma notificação recente.<br>Seu império opera em ordem e tranquilidade.</div>
        </div>
      `;
      return;
    }

    const icons = { success:'✅', error:'❌', info:'ℹ️', level:'⭐', crisis:'🚨', heg:'🌌' };
    body.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <div style="font-size:12px;color:var(--text-3);font-weight:700">Total: ${history.length} evento(s)</div>
        <button onclick="ui.clearNotificationHistory()" style="background:rgba(255,68,68,0.1);border:1px solid rgba(255,68,68,0.3);color:var(--red);border-radius:var(--r-sm);padding:4px 8px;font-size:10px;font-weight:800;cursor:pointer">
          🗑️ Limpar Histórico
        </button>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px;max-height:380px;overflow-y:auto;padding-right:4px">
        ${history.map(item => `
          <div class="notif-history-card">
            <span class="notif-history-icon">${icons[item.type] || 'ℹ️'}</span>
            <div class="notif-history-body">
              <div class="notif-history-text">${item.msg}</div>
              <div class="notif-history-time">${item.time}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  clearNotificationHistory() {
    this.notificationHistory = [];
    this.renderNotificationsModal();
  }

  // ─────────────────────────────────────
  // UTILITÁRIOS: HÁPTICO, SHAKE E TELEMETRIA
  // ─────────────────────────────────────
  vibrate(ms = 15) {
    if (window.engine?.getSetting?.('hapticFeedback', true) !== false && typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(ms); } catch(e){}
    }
  }

  screenShake() {
    if (window.engine?.getSetting?.('screenShake', true) === false) return;
    const app = document.getElementById('app');
    if (!app) return;
    app.style.transform = 'translateY(3px)';
    setTimeout(() => { if (app) app.style.transform = 'translateY(-3px)'; }, 40);
    setTimeout(() => { if (app) app.style.transform = ''; }, 90);
  }

  _toggleFpsTelemetry(enable) {
    const hud = document.getElementById('fps-telemetry-hud');
    if (!hud) return;
    if (!enable) {
      hud.style.display = 'none';
      if (this._fpsAnimId) cancelAnimationFrame(this._fpsAnimId);
      this._fpsAnimId = null;
      return;
    }
    hud.style.display = 'flex';
    let lastTime = performance.now();
    let frames = 0;
    const fpsVal = document.getElementById('hud-fps-val');
    const tickVal = document.getElementById('hud-tick-val');
    const domVal = document.getElementById('hud-dom-val');

    const loop = (now) => {
      frames++;
      if (now - lastTime >= 1000) {
        const fps = Math.round((frames * 1000) / (now - lastTime));
        frames = 0;
        lastTime = now;
        if (fpsVal) fpsVal.textContent = fps;
        if (tickVal) tickVal.textContent = (window.engine?.getSetting?.('tickRateMs', 1000) || 1000) + 'ms';
        if (domVal) domVal.textContent = document.querySelectorAll('*').length;
      }
      this._fpsAnimId = requestAnimationFrame(loop);
    };
    this._fpsAnimId = requestAnimationFrame(loop);
  }

  // ─────────────────────────────────────
  // PAINEL DE CONFIGURAÇÕES (12 BÁSICAS)
  // ─────────────────────────────────────
  openSettingsModal() {
    this.renderSettingsModal();
    this.openModal('modal-settings');
  }

  _setSetting(key, val) {
    window.engine.setSetting(key, val);
    if (key === 'fpsTelemetry') {
      this._toggleFpsTelemetry(!!val);
    }
    if (key === 'numberFormat') {
      this._updateHeader();
    }
    if (key === 'theme') {
      const isLight = val === 'light';
      document.body.classList.toggle('light-theme', isLight);
      document.documentElement.classList.toggle('light-theme', isLight);
      const btn = document.getElementById('theme-toggle-btn');
      if (btn) btn.textContent = isLight ? '☀️' : '🌙';
    }
    this.vibrate(10);
  }

  renderSettingsModal() {
    const body = document.getElementById('settings-modal-body');
    if (!body) return;

    const s = window.engine.state;
    const cfg = s.settings || {};

    body.innerHTML = `
      <!-- 1. ÁUDIO & SENSAÇÕES (3 configs) -->
      <div class="cfg-section-title">🔊 Áudio & Sensações</div>
      <div class="cfg-card">
        <!-- 1. SFX Som -->
        <div class="cfg-row">
          <div class="cfg-info">
            <div class="cfg-label">🔊 Efeitos Sonoros (SFX)</div>
            <div class="cfg-desc">Sons sintéticos em toques, compras e eventos</div>
          </div>
          <div class="cfg-toggle ${cfg.soundEnabled !== false ? 'active' : ''}" 
            onclick="ui._setSetting('soundEnabled', ${cfg.soundEnabled === false}); ui.renderSettingsModal()">
            <div class="cfg-thumb"></div>
          </div>
        </div>

        <!-- 2. Volume do Áudio -->
        <div class="cfg-row">
          <div class="cfg-info">
            <div class="cfg-label">🎚️ Volume do Áudio</div>
            <div class="cfg-desc">Intensidade sonora geral do motor</div>
          </div>
          <div class="cfg-slider-wrap">
            <input type="range" class="cfg-slider" min="0" max="100" value="${cfg.soundVolume ?? 80}"
              oninput="document.getElementById('vol-disp-val').textContent = this.value + '%'; ui._setSetting('soundVolume', Number(this.value))" />
            <span class="cfg-slider-val" id="vol-disp-val">${cfg.soundVolume ?? 80}%</span>
          </div>
        </div>

        <!-- 3. Feedback Háptico -->
        <div class="cfg-row">
          <div class="cfg-info">
            <div class="cfg-label">📳 Vibração / Feedback Háptico</div>
            <div class="cfg-desc">Vibração em cliques e eventos críticos em dispositivos móveis</div>
          </div>
          <div class="cfg-toggle ${cfg.hapticFeedback !== false ? 'active' : ''}" 
            onclick="ui._setSetting('hapticFeedback', ${cfg.hapticFeedback === false}); ui.renderSettingsModal()">
            <div class="cfg-thumb"></div>
          </div>
        </div>
      </div>

      <!-- 2. INTERFACE & NOTIFICAÇÕES (5 configs) -->
      <div class="cfg-section-title">🔔 Interface & Alertas</div>
      <div class="cfg-card">
        <!-- 4. Notificações Flutuantes -->
        <div class="cfg-row">
          <div class="cfg-info">
            <div class="cfg-label">🔔 Notificações Flutuantes (Toasts)</div>
            <div class="cfg-desc">Exibir alertas dinâmicos no topo da tela</div>
          </div>
          <div class="cfg-toggle ${cfg.toastsEnabled !== false ? 'active' : ''}" 
            onclick="ui._setSetting('toastsEnabled', ${cfg.toastsEnabled === false}); ui.renderSettingsModal()">
            <div class="cfg-thumb"></div>
          </div>
        </div>

        <!-- 5. Limite Simultâneo de Toasts -->
        <div class="cfg-row">
          <div class="cfg-info">
            <div class="cfg-label">📥 Limite de Toasts Visíveis</div>
            <div class="cfg-desc">Quantidade máxima de notificações flutuantes na tela</div>
          </div>
          <select class="cfg-select" onchange="ui._setSetting('toastMaxCount', Number(this.value))">
            <option value="1" ${cfg.toastMaxCount === 1 ? 'selected' : ''}>1 (Mínimo)</option>
            <option value="2" ${cfg.toastMaxCount === 2 ? 'selected' : ''}>2 (Equilibrado)</option>
            <option value="3" ${cfg.toastMaxCount === 3 || !cfg.toastMaxCount ? 'selected' : ''}>3 (Padrão)</option>
            <option value="5" ${cfg.toastMaxCount === 5 ? 'selected' : ''}>5 (Estendido)</option>
          </select>
        </div>

        <!-- 6. Agrupamento de Level Up -->
        <div class="cfg-row">
          <div class="cfg-info">
            <div class="cfg-label">⭐ Agrupar Notificações de Nível</div>
            <div class="cfg-desc">Condensa múltiplos leveis rápidos em 1 único card anti-lag</div>
          </div>
          <div class="cfg-toggle ${cfg.batchLevelUpToasts !== false ? 'active' : ''}" 
            onclick="ui._setSetting('batchLevelUpToasts', ${cfg.batchLevelUpToasts === false}); ui.renderSettingsModal()">
            <div class="cfg-thumb"></div>
          </div>
        </div>

        <!-- 7. Números Flutuantes ao Tocar -->
        <div class="cfg-row">
          <div class="cfg-info">
            <div class="cfg-label">💸 Números Flutuantes ao Tocar</div>
            <div class="cfg-desc">Animação de ganhos subindo do Núcleo de Soberania</div>
          </div>
          <div class="cfg-toggle ${cfg.floatingTapNumbers !== false ? 'active' : ''}" 
            onclick="ui._setSetting('floatingTapNumbers', ${cfg.floatingTapNumbers === false}); ui.renderSettingsModal()">
            <div class="cfg-thumb"></div>
          </div>
        </div>

        <!-- 8. Screen Shake -->
        <div class="cfg-row">
          <div class="cfg-info">
            <div class="cfg-label">💥 Tremor de Impacto (Screen Shake)</div>
            <div class="cfg-desc">Micro-vibração visual em toques críticos e crises</div>
          </div>
          <div class="cfg-toggle ${cfg.screenShake !== false ? 'active' : ''}" 
            onclick="ui._setSetting('screenShake', ${cfg.screenShake === false}); ui.renderSettingsModal()">
            <div class="cfg-thumb"></div>
          </div>
        </div>
      </div>

      <!-- 3. JOGABILIDADE & SISTEMA (4 configs) -->
      <div class="cfg-section-title">⚙️ Jogabilidade & Sistema</div>
      <div class="cfg-card">
        <!-- 9. Tema Visual -->
        <div class="cfg-row">
          <div class="cfg-info">
            <div class="cfg-label">🌓 Tema Visual do App</div>
            <div class="cfg-desc">Ambiente Escuro Soberano ou Claro Executivo</div>
          </div>
          <select class="cfg-select" onchange="ui._setSetting('theme', this.value); ui.renderSettingsModal()">
            <option value="dark" ${cfg.theme === 'dark' || !cfg.theme ? 'selected' : ''}>🌙 Modo Escuro</option>
            <option value="light" ${cfg.theme === 'light' ? 'selected' : ''}>☀️ Modo Claro</option>
          </select>
        </div>

        <!-- 10. Formato Numérico -->
        <div class="cfg-row">
          <div class="cfg-info">
            <div class="cfg-label">🔢 Formato de Notação Numérica</div>
            <div class="cfg-desc">Sufixos tradicionais ou Notação Científica</div>
          </div>
          <select class="cfg-select" onchange="ui._setSetting('numberFormat', this.value)">
            <option value="short" ${cfg.numberFormat === 'short' || !cfg.numberFormat ? 'selected' : ''}>Abreviação (K, M, B, T, Qa)</option>
            <option value="sci" ${cfg.numberFormat === 'sci' ? 'selected' : ''}>Científica (1.23e6)</option>
          </select>
        </div>

        <!-- 11. Intervalo de Auto-Save -->
        <div class="cfg-row">
          <div class="cfg-info">
            <div class="cfg-label">⏱️ Intervalo de Salvamento Automático</div>
            <div class="cfg-desc">Frequência com que o estado é persistido no disco</div>
          </div>
          <select class="cfg-select" onchange="ui._setSetting('autoSaveInterval', Number(this.value))">
            <option value="5" ${cfg.autoSaveInterval === 5 ? 'selected' : ''}>A cada 5 segundos</option>
            <option value="10" ${cfg.autoSaveInterval === 10 || !cfg.autoSaveInterval ? 'selected' : ''}>A cada 10 segundos</option>
            <option value="30" ${cfg.autoSaveInterval === 30 ? 'selected' : ''}>A cada 30 segundos</option>
            <option value="60" ${cfg.autoSaveInterval === 60 ? 'selected' : ''}>A cada 60 segundos</option>
          </select>
        </div>

        <!-- 12. Confirmação de Ações Críticas -->
        <div class="cfg-row">
          <div class="cfg-info">
            <div class="cfg-label">🛡️ Confirmação de Ações Críticas</div>
            <div class="cfg-desc">Solicitar diálogo de confirmação antes de resets e grandes gastos</div>
          </div>
          <div class="cfg-toggle ${cfg.confirmHighValueActions !== false ? 'active' : ''}" 
            onclick="ui._setSetting('confirmHighValueActions', ${cfg.confirmHighValueActions === false}); ui.renderSettingsModal()">
            <div class="cfg-thumb"></div>
          </div>
        </div>
      </div>

      <!-- BOTÃO PARA CONFIGURAÇÕES AVANÇADAS -->
      <button class="cfg-adv-btn" onclick="ui.openAdvancedSettingsModal()">
        <span>🚀 Abrir Configurações Avançadas & Engenharia</span>
        <span>→</span>
      </button>
    `;
  }

  // ─────────────────────────────────────
  // MODAL DE CONFIGURAÇÕES AVANÇADAS (10 AVANÇADAS)
  // ─────────────────────────────────────
  openAdvancedSettingsModal() {
    this.renderAdvancedSettingsModal();
    this.openModal('modal-advanced-settings');
  }

  renderAdvancedSettingsModal() {
    const body = document.getElementById('advanced-settings-modal-body');
    if (!body) return;

    const s = window.engine.state;
    const cfg = s.settings || {};

    body.innerHTML = `
      <!-- 1. ENGENHARIA & PERFORMANCE DO MOTOR (5 configs) -->
      <div class="cfg-section-title">⚡ Performance & Engenharia</div>
      <div class="cfg-card">
        <!-- 1. Taxa de Tick -->
        <div class="cfg-row">
          <div class="cfg-info">
            <div class="cfg-label">⏱️ Taxa de Tick do Motor</div>
            <div class="cfg-desc">Intervalo da simulação econômica interna</div>
          </div>
          <select class="cfg-select" onchange="ui._setSetting('tickRateMs', Number(this.value))">
            <option value="500" ${cfg.tickRateMs === 500 ? 'selected' : ''}>500ms (Hiper Rápido)</option>
            <option value="1000" ${cfg.tickRateMs === 1000 || !cfg.tickRateMs ? 'selected' : ''}>1000ms (Padrão 1h/s)</option>
            <option value="2000" ${cfg.tickRateMs === 2000 ? 'selected' : ''}>2000ms (Econômico)</option>
          </select>
        </div>

        <!-- 2. Aceleração por GPU -->
        <div class="cfg-row">
          <div class="cfg-info">
            <div class="cfg-label">⚡ Aceleração por Hardware (GPU)</div>
            <div class="cfg-desc">Uso de camadas aceleradas por GPU para animações</div>
          </div>
          <div class="cfg-toggle ${cfg.hardwareAcceleration !== false ? 'active' : ''}" 
            onclick="ui._setSetting('hardwareAcceleration', ${cfg.hardwareAcceleration === false}); ui.renderAdvancedSettingsModal()">
            <div class="cfg-thumb"></div>
          </div>
        </div>

        <!-- 3. Modo Low-Spec -->
        <div class="cfg-row">
          <div class="cfg-info">
            <div class="cfg-label">🍃 Modo Econômico (Dispositivos Fracos)</div>
            <div class="cfg-desc">Elimina sombras e transições pesadas para FPS máximo</div>
          </div>
          <div class="cfg-toggle ${cfg.lowSpecMode ? 'active' : ''}" 
            onclick="ui._setSetting('lowSpecMode', ${!cfg.lowSpecMode}); ui.renderAdvancedSettingsModal()">
            <div class="cfg-thumb"></div>
          </div>
        </div>

        <!-- 4. Desativar Desfoque Glassmorphism -->
        <div class="cfg-row">
          <div class="cfg-info">
            <div class="cfg-label">🌫️ Desativar Desfoque de Fundo (Blur)</div>
            <div class="cfg-desc">Aumenta fluidez eliminando filtros backdrop-filter</div>
          </div>
          <div class="cfg-toggle ${cfg.disableBgBlur ? 'active' : ''}" 
            onclick="ui._setSetting('disableBgBlur', ${!cfg.disableBgBlur}); ui.renderAdvancedSettingsModal()">
            <div class="cfg-thumb"></div>
          </div>
        </div>

        <!-- 5. Transições de Abas -->
        <div class="cfg-row">
          <div class="cfg-info">
            <div class="cfg-label">🎞️ Transições Suaves de Abas</div>
            <div class="cfg-desc">Animação ao alternar entre Território, Cadeia, etc.</div>
          </div>
          <div class="cfg-toggle ${cfg.tabTransitionAnim !== false ? 'active' : ''}" 
            onclick="ui._setSetting('tabTransitionAnim', ${cfg.tabTransitionAnim === false}); ui.renderAdvancedSettingsModal()">
            <div class="cfg-thumb"></div>
          </div>
        </div>
      </div>

      <!-- 2. TELEMETRIA & SISTEMA DE DADOS (5 configs) -->
      <div class="cfg-section-title">📊 Telemetria & Calibração</div>
      <div class="cfg-card">
        <!-- 6. Partículas de Vitória -->
        <div class="cfg-row">
          <div class="cfg-info">
            <div class="cfg-label">✨ Partículas e Confetes de Vitória</div>
            <div class="cfg-desc">Efeitos visuais festivos ao alcançar feitos e resets</div>
          </div>
          <div class="cfg-toggle ${cfg.particleEffects !== false ? 'active' : ''}" 
            onclick="ui._setSetting('particleEffects', ${cfg.particleEffects === false}); ui.renderAdvancedSettingsModal()">
            <div class="cfg-thumb"></div>
          </div>
        </div>

        <!-- 7. Limite do Histórico de Eventos -->
        <div class="cfg-row">
          <div class="cfg-info">
            <div class="cfg-label">📜 Limite do Histórico de Eventos</div>
            <div class="cfg-desc">Capacidade máxima de registros mantidos em memória</div>
          </div>
          <select class="cfg-select" onchange="ui._setSetting('maxEventHistory', Number(this.value))">
            <option value="25" ${cfg.maxEventHistory === 25 ? 'selected' : ''}>25 eventos</option>
            <option value="50" ${cfg.maxEventHistory === 50 || !cfg.maxEventHistory ? 'selected' : ''}>50 eventos (Padrão)</option>
            <option value="100" ${cfg.maxEventHistory === 100 ? 'selected' : ''}>100 eventos</option>
          </select>
        </div>

        <!-- 8. Detalhamento Matemático dos Stats -->
        <div class="cfg-row">
          <div class="cfg-info">
            <div class="cfg-label">📊 Detalhamento Matemático dos Stats</div>
            <div class="cfg-desc">Exibir fórmulas, multiplicadores e bônus nos modais</div>
          </div>
          <div class="cfg-toggle ${cfg.detailedStatBreakdown !== false ? 'active' : ''}" 
            onclick="ui._setSetting('detailedStatBreakdown', ${cfg.detailedStatBreakdown === false}); ui.renderAdvancedSettingsModal()">
            <div class="cfg-thumb"></div>
          </div>
        </div>

        <!-- 9. HUD de Telemetria e FPS -->
        <div class="cfg-row">
          <div class="cfg-info">
            <div class="cfg-label">📈 Medidor de FPS & Telemetria em Tempo Real</div>
            <div class="cfg-desc">Widget flutuante com taxa de quadros e contagem de nós DOM</div>
          </div>
          <div class="cfg-toggle ${cfg.fpsTelemetry ? 'active' : ''}" 
            onclick="ui._setSetting('fpsTelemetry', ${!cfg.fpsTelemetry}); ui.renderAdvancedSettingsModal()">
            <div class="cfg-thumb"></div>
          </div>
        </div>

        <!-- 10. Teto de Progresso Offline -->
        <div class="cfg-row">
          <div class="cfg-info">
            <div class="cfg-label">⏳ Teto Máximo de Produção Offline</div>
            <div class="cfg-desc">Limite de horas computadas com o aplicativo fechado</div>
          </div>
          <select class="cfg-select" onchange="ui._setSetting('offlineProgressMaxHours', Number(this.value))">
            <option value="4" ${cfg.offlineProgressMaxHours === 4 ? 'selected' : ''}>4 horas</option>
            <option value="8" ${cfg.offlineProgressMaxHours === 8 || !cfg.offlineProgressMaxHours ? 'selected' : ''}>8 horas (Padrão)</option>
            <option value="12" ${cfg.offlineProgressMaxHours === 12 ? 'selected' : ''}>12 horas</option>
            <option value="24" ${cfg.offlineProgressMaxHours === 24 ? 'selected' : ''}>24 horas (Máximo)</option>
          </select>
        </div>
      </div>

      <!-- 3. GESTÃO DE ARQUIVOS, SAVE & RESET -->
      <div class="cfg-section-title">💾 Backup & Dados do Império</div>
      <div class="cfg-card" style="padding:12px;display:flex;flex-direction:column;gap:8px">
        <button class="build-btn" onclick="ui.exportSave()" style="border-color:var(--blue);color:var(--blue);background:rgba(59,130,246,0.1)">
          💾 Exportar Save (JSON)
        </button>
        <button class="build-btn" onclick="ui.importSave()" style="border-color:var(--purple);color:var(--purple);background:rgba(168,85,247,0.1)">
          📂 Importar Save (JSON)
        </button>
        <button class="build-btn" onclick="ui.confirmReset()" style="border-color:var(--red);color:var(--red);background:rgba(255,68,68,0.1)">
          🔄 Reiniciar Nação (Acumular Legado)
        </button>
      </div>
    `;
  }

  // ─────────────────────────────────────
  // OPERAÇÕES DE SAVE & BACKUP
  // ─────────────────────────────────────
  toggleSound() {
    const cur = window.engine.sound.enabled;
    this._setSetting('soundEnabled', !cur);
    this.showToast(!cur ? '🔊 Sons ativados!' : '🔇 Sons desativados.', 'info');
  }

  exportSave() {
    const data = JSON.stringify(window.engine.state, null, 2);
    const blob = new Blob([data], {type:'application/json'});
    const url  = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `geopolitics-save-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.showToast('💾 Save exportado com sucesso!', 'success');
  }

  importSave() {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const parsed = JSON.parse(ev.target.result);
          if (parsed && typeof parsed === 'object') {
            window.engine.state = Object.assign(window.engine._defaultState(), parsed);
            window.engine.save();
            this.renderAll();
            this.showToast('📂 Save importado com sucesso!', 'success');
          } else {
            this.showToast('❌ Arquivo com formato inválido.', 'error');
          }
        } catch { this.showToast('❌ Falha ao ler arquivo JSON.', 'error'); }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  confirmReset() {
    const s = window.engine.state;
    const confirmRequired = s.settings?.confirmHighValueActions !== false;
    if (confirmRequired) {
      if (!confirm('🔄 Tem certeza que deseja reiniciar o ciclo nacional?\n\nVocê ganhará Pontos de Legado e um multiplicador permanente sobre a economia.')) {
        return;
      }
    }
    window.engine.resetGame();
    this.showToast('♾️ Ciclo resetado! Pontos de Legado acumulados.', 'level');
    this.closeModal('modal-settings');
    this.closeModal('modal-advanced-settings');
    this.renderAll();
  }

  // ─────────────────────────────────────
  // TEMA VISUAL (CLARO / ESCURO)
  // ─────────────────────────────────────
  _initTheme() {
    const saved = localStorage.getItem('geo_theme') || (window.engine?.state?.theme) || 'dark';
    const isLight = saved === 'light';
    document.body.classList.toggle('light-theme', isLight);
    document.documentElement.classList.toggle('light-theme', isLight);
    const btn = document.getElementById('theme-toggle-btn');
    if (btn) btn.textContent = isLight ? '☀️' : '🌙';
    this.updateChartsTheme(!isLight);
  }

  toggleTheme() {
    const isLight = document.body.classList.toggle('light-theme');
    document.documentElement.classList.toggle('light-theme', isLight);
    const isDarkMode = !isLight;
    const btn = document.getElementById('theme-toggle-btn');
    if (btn) btn.textContent = isLight ? '☀️' : '🌙';
    this._setSetting('theme', isLight ? 'light' : 'dark');
    try { localStorage.setItem('geo_theme', isLight ? 'light' : 'dark'); } catch(e){}
    this.showToast(isLight ? '☀️ Modo Claro Ativado!' : '🌙 Modo Escuro Ativado!', 'info');

    // Atualiza gráficos do Chart.js dinamicamente sem recarregar ou perder dados
    this.updateChartsTheme(isDarkMode);
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { isDarkMode } }));
  }

  updateChartsTheme(isDarkMode) {
    const textColor = isDarkMode ? '#94A3B8' : '#0F172A';
    const gridColor = isDarkMode ? '#1E293B' : '#E2E8F0';
    const pibLineColor = isDarkMode ? '#00FF66' : '#059669';

    // 1. economyChart (Gráfico de PIB / Tesouro)
    if (window.economyChart) {
      if (window.economyChart.options?.scales?.y) {
        window.economyChart.options.scales.y.grid.color = gridColor;
        window.economyChart.options.scales.y.ticks.color = textColor;
      }
      if (window.economyChart.options?.scales?.x) {
        window.economyChart.options.scales.x.grid.color = gridColor;
        window.economyChart.options.scales.x.ticks.color = textColor;
      }
      if (window.economyChart.data?.datasets?.[0]) {
        const ctx = window.economyChart.ctx;
        window.economyChart.data.datasets[0].borderColor = pibLineColor;
        window.economyChart.data.datasets[0].pointBackgroundColor = pibLineColor;
        window.economyChart.data.datasets[0].backgroundColor = this._getEconomyGradient(ctx, isDarkMode);
      }
      window.economyChart.update();
    }

    // 2. countryChart (se ativo)
    if (window.countryChart) {
      if (window.countryChart.options?.plugins?.legend?.labels) {
        window.countryChart.options.plugins.legend.labels.color = textColor;
      }
      if (window.countryChart.data?.datasets?.[0]) {
        window.countryChart.data.datasets[0].borderColor = isDarkMode ? '#0B1120' : '#FFFFFF';
      }
      window.countryChart.update();
    }

    // 3. trafficChart (se ativo)
    if (window.trafficChart) {
      if (window.trafficChart.options?.scales?.x) {
        window.trafficChart.options.scales.x.grid.color = gridColor;
        window.trafficChart.options.scales.x.ticks.color = textColor;
      }
      if (window.trafficChart.options?.scales?.y) {
        window.trafficChart.options.scales.y.grid.color = gridColor;
        window.trafficChart.options.scales.y.ticks.color = textColor;
      }
      if (window.trafficChart.data?.datasets?.[0]) {
        const trafficColor = isDarkMode ? '#38BDF8' : '#0284C7';
        window.trafficChart.data.datasets[0].borderColor = trafficColor;
        window.trafficChart.data.datasets[0].pointBackgroundColor = trafficColor;
      }
      window.trafficChart.update();
    }

    // Também redesenha o canvas fallback se Chart.js não estiver ativo
    if (!window.Chart) {
      this._drawSparkline();
    }
  }

  // ─────────────────────────────────────
  // MULTIPLICADORES & UPGRADES SOBERANOS
  // ─────────────────────────────────────
  setMultiplierTab(tab) {
    this.currentMultTab = tab;
    document.querySelectorAll('.mult-tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    const activeBtn = document.getElementById(`mult-tab-btn-${tab}`);
    if (activeBtn) activeBtn.classList.add('active');
    this.renderMultipliers();
  }

  renderMultipliers() {
    const list = document.getElementById('multipliers-list');
    if (!list) return;

    const s = window.engine.state;
    const allMults = window.GAME_DATA.multipliers || [];
    const filtered = allMults.filter(m => m.category === this.currentMultTab);

    list.innerHTML = filtered.map(m => {
      const isUnlocked = !!(s.purchasedMultipliers && s.purchasedMultipliers[m.id]);
      const canAfford = s.balance >= m.cost;
      const meetsLevel = s.level >= m.reqLevel;

      return `
        <div class="multiplier-card ${isUnlocked ? 'unlocked' : ''}">
          <div class="multiplier-info">
            <div class="multiplier-icon">${m.icon}</div>
            <div>
              <div class="multiplier-name">${m.name}</div>
              <div class="multiplier-bonus">${m.bonusDesc}</div>
              <div class="multiplier-desc">${m.desc}</div>
            </div>
          </div>
          <div>
            ${isUnlocked ? `
              <button class="multiplier-buy-btn done">✅ Ativo</button>
            ` : `
              <button class="multiplier-buy-btn" onclick="ui.buyMultiplier('${m.id}')"
                ${(!canAfford || !meetsLevel) ? 'disabled' : ''}>
                ${!meetsLevel ? `🔒 Nv.${m.reqLevel}` : window.engine.fmt(m.cost)}
              </button>
            `}
          </div>
        </div>
      `;
    }).join('');
  }

  buyMultiplier(multId) {
    const result = window.engine.buyMultiplier(multId);
    this.showToast(result.msg, result.ok ? 'success' : 'error');
    if (result.ok) {
      this.renderMultipliers();
      this._updateFundacaoStats();
      this._updateHeader();
    }
  }

  // ─────────────────────────────────────
  // ESPECIALIZAÇÃO DE PROVÍNCIAS/TILES
  // ─────────────────────────────────────
  openProvinceSpecModal(tileId) {
    this.selectedTileId = tileId;
    const tile = window.engine.state.tiles.find(t => t.id === tileId);
    if (!tile) return;
    if (tile.state === 'locked') {
      this.openTileModal(tileId);
      return;
    }

    const titleEl = document.getElementById('province-spec-title');
    const bodyEl = document.getElementById('province-spec-body');
    if (titleEl) titleEl.textContent = `🏛️ Foco: ${tile.name}`;

    const specs = window.GAME_DATA.provinceSpecializations || [];
    bodyEl.innerHTML = `
      <div style="font-size:11px;color:var(--text-3);margin-bottom:12px">
        Escolha a vocação econômica desta província soberana para conceder <strong>+50% de bônus produtivo</strong> às instalações do setor:
      </div>
      <div class="spec-selector-grid">
        ${specs.map(spec => {
          const isSelected = tile.specialization === spec.id;
          return `
            <div class="spec-option-card ${isSelected ? 'selected' : ''}" onclick="ui._setProvinceSpec(${tileId}, '${spec.id}')">
              <div style="font-size:24px;margin-bottom:4px">${spec.icon}</div>
              <div style="font-size:11px;font-weight:800;color:${spec.color}">${spec.name}</div>
              <div style="font-size:9px;color:var(--text-3);margin-top:4px">${spec.desc}</div>
              ${isSelected ? '<div style="margin-top:6px;font-size:9px;font-weight:800;color:var(--green)">✅ ATIVO</div>' : ''}
            </div>
          `;
        }).join('')}
      </div>
    `;

    this.openModal('modal-province-spec');
  }

  _setProvinceSpec(tileId, specId) {
    const result = window.engine.setTileSpecialization(tileId, specId);
    this.showToast(result.msg, result.ok ? 'success' : 'error');
    if (result.ok) {
      this.closeModal('modal-province-spec');
      this.renderTerritoryGrid();
      this._updateHeader();
    }
  }

  // ─────────────────────────────────────
  // MODAIS DETALHADOS DAS CAIXINHAS DO TOPO
  // ─────────────────────────────────────
  openStatModal(statType) {
    const s = window.engine.state;
    const e = window.engine;
    const titleEl = document.getElementById('stat-modal-title');
    const subtitleEl = document.getElementById('stat-modal-subtitle');
    const bodyEl = document.getElementById('stat-modal-body');
    if (!bodyEl) return;

    if (statType === 'balance') {
      titleEl.textContent = '💰 Tesouro Nacional';
      subtitleEl.textContent = 'Gestão soberana de liquidez e reservas cambiais';
      const intPercent = ((s.treasuryInterestRate || 0) * 100).toFixed(1);
      const multVal = (s.treasuryMultiplier || 1.0).toFixed(2);

      bodyEl.innerHTML = `
        <div class="stat-breakdown-card">
          <div class="stat-row-item">
            <span class="stat-label-col">💵 Saldo Disponível</span>
            <span class="stat-val-col" style="color:var(--green);font-size:16px">${e.fmt(s.balance)}</span>
          </div>
          <div class="stat-row-item">
            <span class="stat-label-col">📈 Renda Total / Hora</span>
            <span class="stat-val-col" style="color:var(--gold)">${e.fmt(s.gdpPerHour)}/h</span>
          </div>
          <div class="stat-row-item">
            <span class="stat-label-col">💎 Arrecadação Histórica</span>
            <span class="stat-val-col">${e.fmt(s.totalEarned)}</span>
          </div>
          <div class="stat-row-item">
            <span class="stat-label-col">⚡ Multiplicador Fiscal</span>
            <span class="stat-val-col" style="color:var(--blue)">×${multVal}</span>
          </div>
          <div class="stat-row-item">
            <span class="stat-label-col">🏦 Rendimento da Reserva</span>
            <span class="stat-val-col" style="color:var(--purple)">+${intPercent}% a cada 10s</span>
          </div>
        </div>
        <div class="stat-action-grid">
          <button class="build-btn" onclick="ui.actionEmergencyTreasury()">
            📜 Emitir Título Soberano
          </button>
          <button class="build-btn" onclick="ui.switchTab('fundacao');ui.closeModal('modal-stat-detail')" style="background:var(--bg-raised);color:var(--text-1);border:1px solid var(--border)">
            ⚡ Ver Upgrades
          </button>
        </div>
      `;
    } else if (statType === 'gdp') {
      titleEl.textContent = '📈 Produto Interno Bruto (PIB)';
      subtitleEl.textContent = 'Quebra de produção econômica por setor';
      
      const catTotals = {};
      Object.entries(s.facilities).forEach(([fid, fstate]) => {
        if (fstate.level > 0) {
          const f = window.GAME_DATA.facilities.find(item => item.id === fid);
          if (!f) return;
          const prod = f.prodPerHour * Math.pow(1.15, fstate.level - 1) * (1 + fstate.upgradeLevel * 0.3);
          catTotals[f.cat] = (catTotals[f.cat] || 0) + prod;
        }
      });

      const totalProd = Math.max(1, s.gdpPerHour);

      bodyEl.innerHTML = `
        <div class="stat-breakdown-card">
          <div style="font-size:14px;font-weight:800;color:var(--text-1);margin-bottom:8px">
            PIB Total: <span style="color:var(--gold)">${e.fmt(s.gdpPerHour)}/h</span>
          </div>
          <div style="display:flex;flex-direction:column;gap:8px;margin-top:10px">
            ${window.GAME_DATA.categories.map(cat => {
              const catProd = catTotals[cat.id] || 0;
              const pct = Math.min(100, Math.round((catProd / totalProd) * 100));
              return `
                <div>
                  <div style="display:flex;justify-content:space-between;font-size:11px;font-weight:700">
                    <span>${cat.icon} ${cat.name}</span>
                    <span style="font-family:'JetBrains Mono',monospace;color:var(--green)">+${e.fmt(catProd)}/h (${pct}%)</span>
                  </div>
                  <div class="progress-bar" style="height:5px;margin-top:4px">
                    <div class="progress-fill" style="width:${pct}%;background:${cat.color}"></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
        <button class="build-btn" onclick="ui.switchTab('cadeia');ui.closeModal('modal-stat-detail')">
          🏭 Expandir Instalações
        </button>
      `;
    } else if (statType === 'level') {
      titleEl.textContent = '⭐ Nível Soberano & Prestígio';
      subtitleEl.textContent = 'Evolução nacional e requisitos de ascensão';
      const xp = e.xpProgress();

      bodyEl.innerHTML = `
        <div class="stat-breakdown-card">
          <div class="stat-row-item">
            <span class="stat-label-col">👑 Nível Atual</span>
            <span class="stat-val-col" style="color:var(--gold);font-size:16px">Nível ${s.level}</span>
          </div>
          <div class="stat-row-item">
            <span class="stat-label-col">🌱 Fase de Evolução</span>
            <span class="stat-val-col">Fase ${s.phase}</span>
          </div>
          <div class="stat-row-item">
            <span class="stat-label-col">✨ Progresso de XP</span>
            <span class="stat-val-col">${e.fmtNum(s.xp)} / ${e.fmtNum(xp.req)} XP (${Math.floor(xp.pct)}%)</span>
          </div>
          <div class="progress-bar" style="height:8px;margin:10px 0 4px">
            <div class="progress-fill" style="width:${xp.pct}%;background:linear-gradient(90deg,var(--blue),var(--green))"></div>
          </div>
        </div>
        <div class="stat-action-grid">
          <button class="build-btn" onclick="ui.actionAcademicResearch()">
            🎓 Investir em Educação (+XP)
          </button>
          <button class="build-btn" onclick="ui.switchTab('missoes');ui.closeModal('modal-stat-detail')" style="background:var(--bg-raised);color:var(--text-1);border:1px solid var(--border)">
            🎮 Fazer Missões
          </button>
        </div>
      `;
    } else if (statType === 'pop' || statType === 'population') {
      titleEl.textContent = '👥 Demografia & Censo Nacional';
      subtitleEl.textContent = 'Força de trabalho, crescimento vegetativo e migração';
      const pea = Math.round(s.population * (s.workingAgePct || 0.65));
      const netGrowth = (s.birthsTotal || 0) - (s.deathsTotal || 0);

      bodyEl.innerHTML = `
        <div class="stat-breakdown-card">
          <div class="stat-row-item">
            <span class="stat-label-col">🏙️ População Residente</span>
            <span class="stat-val-col" style="font-size:16px;color:var(--text-1)">${e.fmtNum(s.population)} cidadãos</span>
          </div>
          <div class="stat-row-item">
            <span class="stat-label-col">💼 População Ativa (PEA 65%)</span>
            <span class="stat-val-col" style="color:var(--blue)">${e.fmtNum(pea)} trabalhadores</span>
          </div>
          <div class="stat-row-item">
            <span class="stat-label-col">👶 Nascimentos Registrados</span>
            <span class="stat-val-col" style="color:var(--green)">+${e.fmtNum(s.birthsTotal || 0)}</span>
          </div>
          <div class="stat-row-item">
            <span class="stat-label-col">⚰️ Falecimentos de Cidadãos</span>
            <span class="stat-val-col" style="color:var(--red)">-${e.fmtNum(s.deathsTotal || 0)}</span>
          </div>
          <div class="stat-row-item">
            <span class="stat-label-col">📈 Saldo Natural Líquido</span>
            <span class="stat-val-col" style="color:${netGrowth >= 0 ? 'var(--green)' : 'var(--red)'}">${netGrowth >= 0 ? '+' : ''}${e.fmtNum(netGrowth)}</span>
          </div>
          <div class="stat-row-item">
            <span class="stat-label-col">😊 Felicidade Popular</span>
            <span class="stat-val-col">${s.happiness || 50}%</span>
          </div>
        </div>
        <div class="stat-action-grid">
          <button class="build-btn" onclick="ui.actionImmigration()">
            ✈️ Atrair Migrantes Qualificados
          </button>
          <button class="build-btn" onclick="ui.openDossierStatsModal();ui.closeModal('modal-stat-detail')" style="background:var(--bg-raised);color:var(--text-1);border:1px solid var(--border)">
            📜 Abrir Censo Completo
          </button>
        </div>
      `;
    } else if (statType === 'jobs') {
      titleEl.textContent = '💼 Mercado de Trabalho & PEA';
      subtitleEl.textContent = 'Geração de empregos, demanda industrial e taxa de desocupação';
      const pea = Math.max(10, Math.round(s.population * (s.workingAgePct || 0.65)));
      const totalJobs = e.getTotalJobs ? e.getTotalJobs() : 0;
      const employed = Math.min(pea, totalJobs);
      const unemployed = Math.max(0, pea - employed);
      const unempRate = s.unemploymentRate !== undefined ? s.unemploymentRate : Number(((unemployed / pea) * 100).toFixed(1));
      const vacancies = Math.max(0, totalJobs - pea);

      bodyEl.innerHTML = `
        <div class="stat-breakdown-card">
          <div class="stat-row-item">
            <span class="stat-label-col">👥 População Economicamente Ativa</span>
            <span class="stat-val-col" style="font-size:16px">${e.fmtNum(pea)} cidadãos</span>
          </div>
          <div class="stat-row-item">
            <span class="stat-label-col">🏭 Vagas Industriais & Públicas</span>
            <span class="stat-val-col" style="color:var(--blue)">${e.fmtNum(totalJobs)} postos</span>
          </div>
          <div class="stat-row-item">
            <span class="stat-label-col">✅ Trabalhadores Empregados</span>
            <span class="stat-val-col" style="color:var(--green)">${e.fmtNum(employed)} cidadãos</span>
          </div>
          <div class="stat-row-item">
            <span class="stat-label-col">⚠️ Cidadãos Desempregados</span>
            <span class="stat-val-col" style="color:${unemployed > 0 ? 'var(--red)' : 'var(--green)'}">${e.fmtNum(unemployed)}</span>
          </div>
          <div class="stat-row-item">
            <span class="stat-label-col">📊 Taxa de Desemprego</span>
            <span class="stat-val-col" style="font-size:16px;font-weight:800;color:${unempRate > 12 ? 'var(--red)' : (unempRate > 6 ? 'var(--gold)' : 'var(--green)')}">${unempRate}%</span>
          </div>
          <div class="stat-row-item">
            <span class="stat-label-col">💼 Vagas em Aberto / Ociosas</span>
            <span class="stat-val-col" style="color:var(--purple)">${e.fmtNum(vacancies)}</span>
          </div>
          <div class="stat-row-item">
            <span class="stat-label-col">🏛️ Vagas Públicas de Emergência</span>
            <span class="stat-val-col">${s.emergencyJobs || 0} ativas</span>
          </div>
        </div>
        <div class="stat-action-grid">
          <button class="build-btn" onclick="ui.executeQuickAction('jobs')">
            💼 Abrir +40 Vagas Públicas
          </button>
          <button class="build-btn" onclick="ui.switchTab('territorio');ui.closeModal('modal-stat-detail')" style="background:var(--bg-raised);color:var(--text-1);border:1px solid var(--border)">
            🏭 Construir Instalações
          </button>
        </div>
      `;
    } else if (statType === 'health') {
      titleEl.textContent = '🏥 Saúde Pública & Leitos';
      subtitleEl.textContent = 'Atendimento médico, leitos disponíveis e prevenção de óbitos';
      const hosp = s.hospitalized || 0;
      const cap = s.hospitalCapacity || 80;
      const occPct = Math.round((hosp / Math.max(1, cap)) * 100);
      const isOverloaded = hosp > cap;

      bodyEl.innerHTML = `
        <div class="stat-breakdown-card">
          <div class="stat-row-item">
            <span class="stat-label-col">🛌 Pacientes Internados</span>
            <span class="stat-val-col" style="font-size:16px;color:${isOverloaded ? 'var(--red)' : 'var(--text-1)'}">${e.fmtNum(hosp)} cidadãos</span>
          </div>
          <div class="stat-row-item">
            <span class="stat-label-col">🏥 Capacidade de Leitos</span>
            <span class="stat-val-col" style="color:var(--green)">${e.fmtNum(cap)} leitos</span>
          </div>
          <div class="stat-row-item">
            <span class="stat-label-col">📊 Taxa de Ocupação</span>
            <span class="stat-val-col" style="font-weight:800;color:${isOverloaded ? 'var(--red)' : (occPct > 80 ? 'var(--gold)' : 'var(--green)')}">${occPct}%</span>
          </div>
          <div class="progress-bar" style="height:8px;margin:8px 0 10px">
            <div class="progress-fill" style="width:${Math.min(100, occPct)}%;background:${isOverloaded ? 'var(--red)' : 'linear-gradient(90deg,var(--green),var(--gold))'}"></div>
          </div>
          <div class="stat-row-item">
            <span class="stat-label-col">⚰️ Falecimentos Recentes</span>
            <span class="stat-val-col" style="color:var(--red)">${e.fmtNum(s.deathsRecent || 0)} /h</span>
          </div>
          <div class="stat-row-item">
            <span class="stat-label-col">🥀 Total Histórico de Mortes</span>
            <span class="stat-val-col">${e.fmtNum(s.deathsTotal || 0)}</span>
          </div>
          <div class="stat-row-item">
            <span class="stat-label-col">💨 Poluição Ambiental</span>
            <span class="stat-val-col" style="color:${s.pollution > 40 ? 'var(--red)' : 'var(--text-3)'}">${s.pollution || 0}%</span>
          </div>
        </div>
        ${isOverloaded ? `
          <div style="background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.3);padding:8px 10px;border-radius:var(--r-sm);font-size:11px;color:#FCA5A5;margin-bottom:10px;display:flex;align-items:center;gap:6px">
            <span>🚨</span>
            <span><strong>COLAPSO HOSPITALAR:</strong> Leitos esgotados! Há risco severo de aumento de óbitos e queda da estabilidade pública.</span>
          </div>
        ` : ''}
        <div class="stat-action-grid">
          <button class="build-btn" onclick="ui.executeQuickAction('health')">
            🏥 Decretar Mutirão de Saúde
          </button>
          <button class="build-btn" onclick="ui.switchTab('territorio');ui.closeModal('modal-stat-detail')" style="background:var(--bg-raised);color:var(--text-1);border:1px solid var(--border)">
            🏗️ Expandir Complexos Médicos
          </button>
        </div>
      `;
    } else if (statType === 'education' || statType === 'literacy') {
      titleEl.textContent = '🎓 Educação & Taxa de Alfabetização';
      subtitleEl.textContent = 'Capital intelectual, velocidade científica e progresso humano';
      const lit = s.literacyRate || 72.0;
      const literatePop = Math.round(s.population * (lit / 100));

      bodyEl.innerHTML = `
        <div class="stat-breakdown-card">
          <div class="stat-row-item">
            <span class="stat-label-col">📖 Taxa de Alfabetização</span>
            <span class="stat-val-col" style="font-size:17px;font-weight:800;color:var(--gold)">${lit.toFixed(1)}%</span>
          </div>
          <div class="progress-bar" style="height:8px;margin:8px 0 10px">
            <div class="progress-fill" style="width:${lit}%;background:linear-gradient(90deg,var(--gold),var(--green))"></div>
          </div>
          <div class="stat-row-item">
            <span class="stat-label-col">🧠 Cidadãos Alfabetizados</span>
            <span class="stat-val-col" style="color:var(--blue)">${e.fmtNum(literatePop)} pessoas</span>
          </div>
          <div class="stat-row-item">
            <span class="stat-label-col">⚡ Bônus de Velocidade Tech</span>
            <span class="stat-val-col" style="color:var(--green)">+${(lit * 0.4).toFixed(1)}%</span>
          </div>
          <div class="stat-row-item">
            <span class="stat-label-col">🔬 Pesquisa em Andamento</span>
            <span class="stat-val-col">${s.tech?.researchingId ? 'Ativa' : 'Nenhuma'}</span>
          </div>
        </div>
        <div class="stat-action-grid">
          <button class="build-btn" onclick="ui.executeQuickAction('literacy')">
            🎓 Conceder Bolsa Alfabetização
          </button>
          <button class="build-btn" onclick="ui.openTechModal();ui.closeModal('modal-stat-detail')" style="background:var(--bg-raised);color:var(--text-1);border:1px solid var(--border)">
            🔬 Árvore Tecnológica
          </button>
        </div>
      `;
    } else if (statType === 'stab' || statType === 'stability') {
      titleEl.textContent = '⚖️ Estabilidade & Ordem Pública';
      subtitleEl.textContent = 'Coesão social, segurança e controle de crise';

      bodyEl.innerHTML = `
        <div class="stat-breakdown-card">
          <div class="stat-row-item">
            <span class="stat-label-col">🛡️ Estabilidade Geral</span>
            <span class="stat-val-col" style="color:${s.stability < 40 ? 'var(--red)' : 'var(--green)'};font-size:16px">${s.stability}%</span>
          </div>
          <div class="stat-row-item">
            <span class="stat-label-col">🗳️ Aprovação Popular</span>
            <span class="stat-val-col">${s.approval || 45}%</span>
          </div>
          <div class="stat-row-item">
            <span class="stat-label-col">💼 Taxa de Desemprego</span>
            <span class="stat-val-col" style="color:${(s.unemploymentRate || 8.5) > 10 ? 'var(--red)' : 'var(--green)'}">${s.unemploymentRate || 8.5}%</span>
          </div>
          <div class="stat-row-item">
            <span class="stat-label-col">💨 Impacto de Poluição</span>
            <span class="stat-val-col" style="color:${s.pollution > 50 ? 'var(--red)' : 'var(--text-3)'}">${s.pollution}%</span>
          </div>
          <div class="stat-row-item">
            <span class="stat-label-col">⚔️ Prontidão Militar</span>
            <span class="stat-val-col">${e.fmtNum(s.militarySize || 100)} tropas</span>
          </div>
        </div>
        <div class="stat-action-grid">
          <button class="build-btn" onclick="ui.executeQuickAction('speech')">
            📢 Pronunciamento à Nação
          </button>
          <button class="build-btn" onclick="ui.actionReliefPackage()" style="background:var(--bg-raised);color:var(--text-1);border:1px solid var(--border)">
            🎁 Pacote de Alívio Social
          </button>
        </div>
      `;
    } else if (statType === 'power') {
      titleEl.textContent = '💥 Poder Soberano Geopolítico';
      subtitleEl.textContent = 'Capacidade de projeção internacional da nação';

      bodyEl.innerHTML = `
        <div class="stat-breakdown-card">
          <div class="stat-row-item">
            <span class="stat-label-col">🌍 Power Score</span>
            <span class="stat-val-col" style="color:var(--red);font-size:18px">${e.fmtNum(s.powerScore)}</span>
          </div>
          <div class="stat-row-item">
            <span class="stat-label-col">🌐 Influência Diplomática</span>
            <span class="stat-val-col">${e.fmtNum(s.influence)} pts</span>
          </div>
          <div class="stat-row-item">
            <span class="stat-label-col">🎖️ Força Armada</span>
            <span class="stat-val-col">${e.fmtNum(s.militarySize || 100)} efetivo</span>
          </div>
          <div class="stat-row-item">
            <span class="stat-label-col">🚨 Alerta DEFCON</span>
            <span class="stat-val-col" style="color:var(--gold)">DEFCON ${s.defense?.defcon || 5}</span>
          </div>
          <div class="stat-row-item">
            <span class="stat-label-col">🏛️ Nação</span>
            <span class="stat-val-col">${s.nationName}</span>
          </div>
        </div>
        <div class="stat-action-grid">
          <button class="build-btn" onclick="ui.openDefenseModal();ui.closeModal('modal-stat-detail')">
            🛡️ Centro de Defesa
          </button>
          <button class="build-btn" onclick="ui.switchTab('mundo');ui.closeModal('modal-stat-detail')" style="background:var(--bg-raised);color:var(--text-1);border:1px solid var(--border)">
            🌍 Mapa-Múndi
          </button>
        </div>
      `;
    } else if (statType === 'influence') {
      titleEl.textContent = '🌐 Influência Global & Diplomacia';
      subtitleEl.textContent = 'Soft power, relações bilaterais e projeção geopolítica';

      let allyCount = 0;
      let tradeCount = 0;
      let warCount = 0;
      Object.values(s.relations || {}).forEach(r => {
        if (r.status === 'ally') allyCount++;
        if (r.status === 'trade') tradeCount++;
        if (r.status === 'war') warCount++;
      });

      bodyEl.innerHTML = `
        <div class="stat-breakdown-card">
          <div class="stat-row-item">
            <span class="stat-label-col">🌐 Pontos de Influência</span>
            <span class="stat-val-col" style="font-size:18px;color:var(--purple)">${e.fmtNum(s.influence)} pts</span>
          </div>
          <div class="stat-row-item">
            <span class="stat-label-col">🤝 Nações Aliadas</span>
            <span class="stat-val-col" style="color:var(--green)">${allyCount} aliada${allyCount !== 1 ? 's' : ''}</span>
          </div>
          <div class="stat-row-item">
            <span class="stat-label-col">🚢 Tratados Comerciais</span>
            <span class="stat-val-col" style="color:var(--blue)">${tradeCount} acordos</span>
          </div>
          <div class="stat-row-item">
            <span class="stat-label-col">⚔️ Conflitos Armados</span>
            <span class="stat-val-col" style="color:${warCount > 0 ? 'var(--red)' : 'var(--text-3)'}">${warCount} conflito${warCount !== 1 ? 's' : ''}</span>
          </div>
        </div>
        <button class="build-btn" onclick="ui.switchTab('mundo');ui.closeModal('modal-stat-detail')">
          🌍 Negociar Tratados no Mapa-Múndi
        </button>
      `;
    }

    this.openModal('modal-stat-detail');
  }

  showStatDetail(stat) {
    this.openStatModal(stat);
  }

  // Ações rápidas dos modais de métricas
  actionEmergencyTreasury() {
    const s = window.engine.state;
    const gain = Math.max(10, Math.floor(s.gdpPerHour * 0.25));
    s.balance += gain;
    s.totalEarned += gain;
    s.stability = Math.max(10, s.stability - 2);
    window.engine.sound.coin();
    this.showToast(`📜 Título Soberano emitido: +${window.engine.fmt(gain)} ao Tesouro! (-2% Estabilidade)`, 'success');
    this.openStatModal('balance');
    this._updateHeader();
  }

  actionReliefPackage() {
    const s = window.engine.state;
    const cost = Math.max(5, Math.floor(s.balance * 0.05));
    if (s.balance < cost) {
      this.showToast('💸 Tesouro insuficiente para o pacote de alívio.', 'error');
      return;
    }
    s.balance -= cost;
    s.stability = Math.min(100, s.stability + 12);
    s.approval = Math.min(100, (s.approval || 45) + 10);
    window.engine.sound.coin();
    this.showToast(`🎁 Pacote de alívio distribuído! Estabilidade +12%`, 'success');
    this.openStatModal('stab');
    this._updateHeader();
  }

  actionAcademicResearch() {
    const s = window.engine.state;
    const cost = Math.max(5, Math.floor(s.balance * 0.04));
    if (s.balance < cost) {
      this.showToast('💸 Tesouro insuficiente para investimento acadêmico.', 'error');
      return;
    }
    s.balance -= cost;
    const xpGain = Math.max(25, Math.floor(cost * 0.5));
    s.xp += xpGain;
    window.engine._checkLevel();
    window.engine.sound.levelUp();
    this.showToast(`🎓 Investimento em Educação: +${xpGain} XP!`, 'success');
    this.openStatModal('level');
    this._updateHeader();
  }

  actionImmigration() {
    const s = window.engine.state;
    const cost = Math.max(10, Math.floor(s.balance * 0.03));
    if (s.balance < cost) {
      this.showToast('💸 Tesouro insuficiente para atrair especialistas.', 'error');
      return;
    }
    s.balance -= cost;
    const popGain = Math.max(50, Math.floor(s.population * 0.05));
    s.population += popGain;
    window.engine.sound.coin();
    this.showToast(`✈️ Programa migratório atraiu +${popGain} cidadãos qualificados!`, 'success');
    this.openStatModal('pop');
    this._updateHeader();
  }

  // ─────────────────────────────────────
  // BOTÕES VIRTUAIS EXPANSÍVEIS (FABs) & CONSELHEIRO IA
  // ─────────────────────────────────────
  toggleQuickActionsMenu() {
    const menu = document.getElementById('fab-quick-menu');
    if (!menu) return;
    const isOpen = menu.classList.toggle('open');
    const advisorMenu = document.getElementById('fab-advisor-menu');
    if (advisorMenu && isOpen) advisorMenu.classList.remove('open');
  }

  toggleAiAdvisorMenu() {
    const menu = document.getElementById('fab-advisor-menu');
    if (!menu) return;
    const isOpen = menu.classList.toggle('open');
    const quickMenu = document.getElementById('fab-quick-menu');
    if (quickMenu && isOpen) quickMenu.classList.remove('open');
    if (isOpen) {
      this.renderAiAdvisor();
    }
  }

  executeQuickAction(type) {
    const e = window.engine;
    let res = null;
    if (type === 'liquidity') {
      res = e.actionEmergencyLiquidity();
    } else if (type === 'health') {
      res = e.actionHealthDrive();
    } else if (type === 'literacy') {
      res = e.actionLiteracyDrive();
    } else if (type === 'jobs') {
      res = e.actionEmergencyJobs();
    } else if (type === 'speech') {
      res = e.actionPresidentialAddress();
    }

    if (res) {
      this.showToast(res.msg, res.ok ? 'success' : 'error');
      if (res.ok) {
        this._updateHeader();
        this.renderAiAdvisor();
        const quickMenu = document.getElementById('fab-quick-menu');
        if (quickMenu) quickMenu.classList.remove('open');
      }
    }
  }

  renderAiAdvisor() {
    const s = window.engine.state;
    const e = window.engine;
    const badgeEl = document.getElementById('fab-advisor-badge');
    const descEl = document.getElementById('fab-advisor-desc');
    const actionsEl = document.getElementById('fab-advisor-actions');
    if (!badgeEl || !descEl || !actionsEl) return;

    const hosp = s.hospitalized || 0;
    const cap = s.hospitalCapacity || 80;
    const unemp = s.unemploymentRate !== undefined ? s.unemploymentRate : 8.5;
    const stab = s.stability || 50;
    const lit = s.literacyRate || 72;
    const bal = s.balance || 0;
    const gdp = s.gdpPerHour || 0;

    const adviceList = [];

    // 1. Diagnóstico Hospitalar
    if (hosp > cap) {
      adviceList.push({
        priority: 'CRÍTICA',
        color: 'var(--red)',
        icon: '🚨',
        title: 'Superlotação Hospitalar',
        desc: `Há ${e.fmtNum(hosp)} doentes para apenas ${e.fmtNum(cap)} leitos. Cidadãos correm risco de óbito a cada hora!`,
        actionText: '🏥 Mutirão de Saúde',
        onClick: "ui.executeQuickAction('health')"
      });
    }

    // 2. Diagnóstico de Desemprego
    if (unemp > 12) {
      adviceList.push({
        priority: 'ALTA',
        color: 'var(--orange)',
        icon: '⚠️',
        title: `Desemprego Elevado (${unemp}%)`,
        desc: 'A População Ativa (PEA) está sem vagas suficientes. Abra obras públicas ou construa novas indústrias.',
        actionText: '💼 Criar Vagas Públicas',
        onClick: "ui.executeQuickAction('jobs')"
      });
    }

    // 3. Diagnóstico de Estabilidade
    if (stab < 40) {
      adviceList.push({
        priority: 'URGENTE',
        color: 'var(--red)',
        icon: '⚖️',
        title: `Estabilidade Crítica (${stab}%)`,
        desc: 'A população está insatisfeita. Faça um pronunciamento oficial em cadeia nacional para restaurar a ordem.',
        actionText: '📢 Pronunciamento Nacional',
        onClick: "ui.executeQuickAction('speech')"
      });
    }

    // 4. Diagnóstico de Alfabetização
    if (lit < 80) {
      adviceList.push({
        priority: 'MÉDIA',
        color: 'var(--blue)',
        icon: '🎓',
        title: `Bolsa Alfabetização (${lit.toFixed(1)}%)`,
        desc: 'Elevar a taxa de alfabetização acelera em até +40% todas as pesquisas e descobertas científicas.',
        actionText: '🎓 Bolsa Educação',
        onClick: "ui.executeQuickAction('literacy')"
      });
    }

    // 5. Diagnóstico de Liquidez
    if (bal < 40 && gdp < 15) {
      adviceList.push({
        priority: 'ALTA',
        color: 'var(--gold)',
        icon: '💵',
        title: 'Baixa Liquidez no Tesouro',
        desc: 'Seu saldo está baixo para novas construções. Solicite uma injeção de emergência para acelerar a economia.',
        actionText: '💵 Injetar Liquidez',
        onClick: "ui.executeQuickAction('liquidity')"
      });
    }

    // Se nenhuma crise urgente:
    if (adviceList.length === 0) {
      badgeEl.textContent = '🟢 Economia em Plena Expansão';
      badgeEl.className = 'pill pill-green';
      descEl.textContent = 'Indicadores soberanos sob controle! Recomendação: Construa cópias ilimitadas no Parque Industrial para acelerar o PIB rumo a $1B!';
      actionsEl.innerHTML = `
        <div style="display:flex;gap:8px;margin-top:10px">
          <button class="build-btn" onclick="ui.switchTab('territorio')" style="flex:1">
            🏭 Parque Industrial
          </button>
          <button class="build-btn" onclick="ui.openTechModal()" style="flex:1;background:var(--bg-raised);color:var(--text-1);border:1px solid var(--border)">
            🔬 Pesquisas Tech
          </button>
        </div>
      `;
    } else {
      const topAdvice = adviceList[0];
      badgeEl.textContent = `${topAdvice.icon} Atenção Necessária (${adviceList.length})`;
      badgeEl.className = topAdvice.priority === 'CRÍTICA' ? 'pill pill-red' : 'pill pill-gold';
      descEl.textContent = topAdvice.desc;

      actionsEl.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:8px;margin-top:10px">
          ${adviceList.slice(0, 3).map(adv => `
            <div style="background:var(--bg-card);padding:8px 10px;border-radius:var(--r-sm);border:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;gap:8px">
              <div style="flex:1">
                <div style="font-size:11px;font-weight:800;color:${adv.color}">
                  ${adv.icon} ${adv.title}
                </div>
                <div style="font-size:10px;color:var(--text-3);line-height:1.2;margin-top:2px">${adv.desc}</div>
              </div>
              <button class="build-btn" onclick="${adv.onClick}" style="font-size:10px;padding:6px 10px;white-space:nowrap">
                Executar
              </button>
            </div>
          `).join('')}
        </div>
      `;
    }
  }

  // ─────────────────────────────────────
  // DOSSIÊ NACIONAL COMPLETO & ESTATÍSTICAS
  // ─────────────────────────────────────
  openDossierStatsModal() {
    this.dossierSubTab = this.dossierSubTab || 'demog';
    this.renderDossierStatsModal();
    this.openModal('modal-dossier-stats');
  }

  setDossierSubTab(subTab) {
    this.dossierSubTab = subTab;
    document.querySelectorAll('#dossier-sub-tabs .sub-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.id === `dossier-sub-tab-${subTab}`);
    });
    this.renderDossierStatsModal();
  }

  renderDossierStatsModal() {
    const s = window.engine.state;
    const e = window.engine;
    const modalBody = document.getElementById('dossier-stats-modal-body');
    if (!modalBody) return;

    const subTab = this.dossierSubTab || 'demog';

    if (subTab === 'demog') {
      const pea = Math.round(s.population * (s.workingAgePct || 0.65));
      const youths = Math.round(s.population * 0.20);
      const elderly = Math.max(0, s.population - pea - youths);
      const netNatural = (s.birthsTotal || 0) - (s.deathsTotal || 0);

      modalBody.innerHTML = `
        <div class="dossier-card">
          <div class="dossier-card-title">👥 CENSO DEMOGRÁFICO NACIONAL</div>
          <div class="dossier-grid-4">
            <div class="dossier-stat-box">
              <span class="dossier-box-val">${e.fmtNum(s.population)}</span>
              <span class="dossier-box-lbl">Cidadãos Vivos</span>
            </div>
            <div class="dossier-stat-box">
              <span class="dossier-box-val" style="color:var(--green)">+${e.fmtNum(s.birthsTotal || 0)}</span>
              <span class="dossier-box-lbl">Nascimentos</span>
            </div>
            <div class="dossier-stat-box">
              <span class="dossier-box-val" style="color:var(--red)">-${e.fmtNum(s.deathsTotal || 0)}</span>
              <span class="dossier-box-lbl">Falecimentos</span>
            </div>
            <div class="dossier-stat-box">
              <span class="dossier-box-val" style="color:${netNatural >= 0 ? 'var(--green)' : 'var(--red)'}">${netNatural >= 0 ? '+' : ''}${e.fmtNum(netNatural)}</span>
              <span class="dossier-box-lbl">Saldo Natural</span>
            </div>
          </div>

          <!-- Pirâmide Demográfica Interativa -->
          <div style="margin-top:16px">
            <div style="font-size:12px;font-weight:800;color:var(--text-1);margin-bottom:8px">🏛️ Pirâmide Etária & Força Produtiva</div>
            
            <div class="pyramid-row">
              <div class="pyramid-label">Idosos (65+) &bull; 15%</div>
              <div class="progress-bar" style="height:10px;flex:1">
                <div class="progress-fill" style="width:15%;background:var(--purple)"></div>
              </div>
              <div class="pyramid-val">${e.fmtNum(elderly)}</div>
            </div>

            <div class="pyramid-row" style="margin-top:6px">
              <div class="pyramid-label">População Ativa PEA (15-64) &bull; 65%</div>
              <div class="progress-bar" style="height:10px;flex:1">
                <div class="progress-fill" style="width:65%;background:var(--blue)"></div>
              </div>
              <div class="pyramid-val">${e.fmtNum(pea)}</div>
            </div>

            <div class="pyramid-row" style="margin-top:6px">
              <div class="pyramid-label">Crianças & Jovens (0-14) &bull; 20%</div>
              <div class="progress-bar" style="height:10px;flex:1">
                <div class="progress-fill" style="width:20%;background:var(--gold)"></div>
              </div>
              <div class="pyramid-val">${e.fmtNum(youths)}</div>
            </div>
          </div>

          <!-- Curiosidade Demográfica -->
          <div class="dossier-fact-card" style="margin-top:14px">
            💡 <strong>Fato Demográfico:</strong> O crescimento da sua população é regulado pela disponibilidade de empregos industriais e estabilidade política. Se houver falta de vagas, novos migrantes deixam de se estabelecer na nação!
          </div>
        </div>
      `;
    } else if (subTab === 'labor') {
      const pea = Math.max(10, Math.round(s.population * (s.workingAgePct || 0.65)));
      const totalJobs = e.getTotalJobs ? e.getTotalJobs() : 0;
      const employed = Math.min(pea, totalJobs);
      const unemployed = Math.max(0, pea - employed);
      const unempRate = s.unemploymentRate !== undefined ? s.unemploymentRate : Number(((unemployed / pea) * 100).toFixed(1));

      modalBody.innerHTML = `
        <div class="dossier-card">
          <div class="dossier-card-title">💼 BALANÇO DE EMPREGOS & OCUPAÇÃO</div>
          <div class="dossier-grid-4">
            <div class="dossier-stat-box">
              <span class="dossier-box-val" style="color:var(--blue)">${e.fmtNum(totalJobs)}</span>
              <span class="dossier-box-lbl">Postos Criados</span>
            </div>
            <div class="dossier-stat-box">
              <span class="dossier-box-val" style="color:var(--green)">${e.fmtNum(employed)}</span>
              <span class="dossier-box-lbl">Empregados</span>
            </div>
            <div class="dossier-stat-box">
              <span class="dossier-box-val" style="color:${unemployed > 0 ? 'var(--red)' : 'var(--green)'}">${e.fmtNum(unemployed)}</span>
              <span class="dossier-box-lbl">Desempregados</span>
            </div>
            <div class="dossier-stat-box">
              <span class="dossier-box-val" style="color:${unempRate > 10 ? 'var(--red)' : 'var(--green)'}">${unempRate}%</span>
              <span class="dossier-box-lbl">Taxa Desocupação</span>
            </div>
          </div>

          <div style="margin-top:14px">
            <div style="font-size:12px;font-weight:800;color:var(--text-1);margin-bottom:8px">🏭 Demanda por Mão de Obra por Setor</div>
            ${window.GAME_DATA.categories.slice(0, 6).map(cat => {
              let catJobs = 0;
              Object.entries(s.facilities).forEach(([fid, fstate]) => {
                if (fstate.level > 0) {
                  const f = window.GAME_DATA.facilities.find(item => item.id === fid);
                  if (f && f.cat === cat.id) catJobs += (f.jobs || 0) * fstate.level;
                }
              });
              const pct = totalJobs > 0 ? Math.round((catJobs / totalJobs) * 100) : 0;
              return `
                <div style="margin-bottom:6px">
                  <div style="display:flex;justify-content:space-between;font-size:11px">
                    <span>${cat.icon} ${cat.name}</span>
                    <span style="font-family:'JetBrains Mono',monospace;color:var(--text-2)">${e.fmtNum(catJobs)} postos (${pct}%)</span>
                  </div>
                  <div class="progress-bar" style="height:5px;margin-top:3px">
                    <div class="progress-fill" style="width:${pct}%;background:${cat.color}"></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    } else if (subTab === 'health') {
      const hosp = s.hospitalized || 0;
      const cap = s.hospitalCapacity || 80;
      const occPct = Math.round((hosp / Math.max(1, cap)) * 100);

      modalBody.innerHTML = `
        <div class="dossier-card">
          <div class="dossier-card-title">🏥 SAÚDE PÚBLICA, LEITOS & VITALIDADE</div>
          <div class="dossier-grid-4">
            <div class="dossier-stat-box">
              <span class="dossier-box-val" style="color:${hosp > cap ? 'var(--red)' : 'var(--text-1)'}">${e.fmtNum(hosp)}</span>
              <span class="dossier-box-lbl">Internados</span>
            </div>
            <div class="dossier-stat-box">
              <span class="dossier-box-val" style="color:var(--green)">${e.fmtNum(cap)}</span>
              <span class="dossier-box-lbl">Leitos Totais</span>
            </div>
            <div class="dossier-stat-box">
              <span class="dossier-box-val" style="color:${occPct > 100 ? 'var(--red)' : 'var(--gold)'}">${occPct}%</span>
              <span class="dossier-box-lbl">Ocupação</span>
            </div>
            <div class="dossier-stat-box">
              <span class="dossier-box-val" style="color:var(--red)">${e.fmtNum(s.deathsRecent || 0)}/h</span>
              <span class="dossier-box-lbl">Falecimentos Recentes</span>
            </div>
          </div>

          <div class="dossier-fact-card" style="margin-top:14px">
            🦠 <strong>Epidemiologia & Poluição:</strong> A poluição industrial acumulada (${s.pollution || 0}%) eleva a taxa de enfermidade da população. Construa complexos médicos e mantenha o número de leitos sempre acima dos hospitalizados para zerar as mortes por saturação hospitalar!
          </div>

          <button class="build-btn" onclick="ui.executeQuickAction('health')" style="margin-top:14px">
            🏥 Decretar Mutirão de Saúde Imediato
          </button>
        </div>
      `;
    } else if (subTab === 'records') {
      modalBody.innerHTML = `
        <div class="dossier-card">
          <div class="dossier-card-title">🏆 RECORDES HISTÓRICOS & FATOS DA NAÇÃO</div>
          
          <div class="dossier-grid-4">
            <div class="dossier-stat-box">
              <span class="dossier-box-val" style="color:var(--gold)">${e.fmt(s.peakBalance || s.balance)}</span>
              <span class="dossier-box-lbl">Recorde do Tesouro</span>
            </div>
            <div class="dossier-stat-box">
              <span class="dossier-box-val" style="color:var(--green)">${e.fmt(s.peakGdp || s.gdpPerHour)}/h</span>
              <span class="dossier-box-lbl">Recorde de PIB</span>
            </div>
            <div class="dossier-stat-box">
              <span class="dossier-box-val" style="color:var(--blue)">${s.stats.daysInPower || 0}</span>
              <span class="dossier-box-lbl">Dias no Poder</span>
            </div>
            <div class="dossier-stat-box">
              <span class="dossier-box-val" style="color:var(--purple)">${s.hegemonyResets || 0}</span>
              <span class="dossier-box-lbl">Resets Hegemônicos</span>
            </div>
          </div>

          <div style="margin-top:16px">
            <div style="font-size:12px;font-weight:800;color:var(--text-1);margin-bottom:8px">📜 Arquivo Histórico & Curiosidades</div>
            <div class="dossier-facts-list">
              <div class="dossier-fact-item">
                <span class="df-icon">🏛️</span>
                <div class="df-body">
                  <strong>Fundação do Estado:</strong> Sua nação foi estabelecida com soberania monetária própria e zero dívida inicial.
                </div>
              </div>
              <div class="dossier-fact-item">
                <span class="df-icon">⚡</span>
                <div class="df-body">
                  <strong>Trabalho Cívico:</strong> Seus cidadãos realizaram mais de <strong>${e.fmtNum(s.stats.totalClicks || 0)}</strong> toques produtivos, gerando riqueza direta ao país.
                </div>
              </div>
              <div class="dossier-fact-item">
                <span class="df-icon">🏭</span>
                <div class="df-body">
                  <strong>Industrialização Acelerada:</strong> Já foram erguidas <strong>${e.fmtNum(s.stats.totalBuilt || 0)}</strong> instalações no território nacional.
                </div>
              </div>
              <div class="dossier-fact-item">
                <span class="df-icon">🎓</span>
                <div class="df-body">
                  <strong>Iluminação Científica:</strong> A taxa de alfabetização atingiu <strong>${(s.literacyRate || 72).toFixed(1)}%</strong>, impulsionando a velocidade de pesquisa e desenvolvimento.
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }
  }

  // ─────────────────────────────────────
  // 🔴 CORREÇÃO 1: IA ANTAGONISTA AVANÇADA (FEED & TICKER)
  // ─────────────────────────────────────
  _initAiFeed() {
    this._fetchAiFeed();
    setInterval(() => this._fetchAiFeed(), 12000);

    setInterval(() => {
      if (this.aiFeedEvents.length === 0 || Math.random() < 0.3) {
        this._generateSimulatedAiEvent();
      }
    }, 15000);
  }

  async _fetchAiFeed() {
    try {
      const res = await fetch('/api/ai/feed');
      if (res.ok) {
        const data = await res.json();
        if (data.events && data.events.length > 0) {
          this.aiFeedEvents = data.events;
          this._updateAiTicker(data.events[0]);
        }
      }
    } catch(e) {
      if (this.aiFeedEvents.length === 0) {
        this._generateSimulatedAiEvent();
      }
    }
  }

  _generateSimulatedAiEvent() {
    const npcs = [
      { name: 'Estados Unidos', flag: '🇺🇸', action: 'lançou satélite militar espião em órbita geoestacionária.' },
      { name: 'China', flag: '🇨🇳', action: 'inaugurou megacomplexo de semicondutores e refino de neodímio.' },
      { name: 'Rússia', flag: '🇷🇺', action: 'anunciou embargo preventivo às exportações de gás natural liquefeito.' },
      { name: 'Brasil', flag: '🇧🇷', action: 'expandiu safra de soja e terras raras em consórcio multilateral.' },
      { name: 'Índia', flag: '🇮🇳', action: 'mobilizou frotas de patrulha no Oceano Índico com caças embarcados.' },
      { name: 'Alemanha', flag: '🇩🇪', action: 'elevou investimentos em robótica avançada e transição energética.' },
      { name: 'Arábia Saudita', flag: '🇸🇦', action: 'reajustou cotas de exportação de barris de petróleo bruto.' }
    ];
    const n = npcs[Math.floor(Math.random() * npcs.length)];
    const ev = {
      id: 'ai_' + Date.now(),
      headline: `${n.flag} ${n.name} ${n.action}`,
      ts: Date.now()
    };
    this.aiFeedEvents.unshift(ev);
    if (this.aiFeedEvents.length > 30) this.aiFeedEvents.pop();
    this._updateAiTicker(ev);
  }

  _updateAiTicker(ev) {
    if (!ev) return;
    const tickerEl = document.getElementById('ai-ticker-text');
    if (tickerEl) {
      tickerEl.textContent = ev.headline || '📡 Monitorando potências geopolíticas em tempo real...';
    }
  }

  openAiFeedModal() {
    this.renderAiFeedModal();
    this.openModal('modal-ai-feed');
  }

  renderAiFeedModal() {
    const bodyEl = document.getElementById('ai-feed-modal-body');
    if (!bodyEl) return;

    if (this.aiFeedEvents.length === 0) {
      bodyEl.innerHTML = `<div class="empty-state"><div class="empty-state-icon">🤖</div><div class="empty-state-text">Aguardando próximas ações autônomas da IA Diretora...</div></div>`;
      return;
    }

    bodyEl.innerHTML = `
      <div style="font-size:11px;color:var(--text-3);margin-bottom:12px;line-height:1.5">
        A <strong>IA Diretora</strong> simula em tempo real decisões geopolíticas autônomas, embargos e corrida armamentista de 195 nações, aplicando a regra de <em>Rubber-Banding</em> para manter o desafio sempre calibrado.
      </div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${this.aiFeedEvents.map(ev => `
          <div class="policy-card" style="margin:0;padding:10px 12px">
            <div style="font-size:22px">🌐</div>
            <div class="policy-body">
              <div class="policy-name" style="font-size:12px">${ev.headline}</div>
              <div class="policy-desc" style="font-size:10px;margin-top:2px;color:var(--text-3)">
                ${ev.details || 'Ação autônoma computada pela IA Diretora com balanceamento dinâmico.'}
              </div>
            </div>
            <div style="font-size:9px;font-family:'JetBrains Mono',monospace;color:var(--blue)">
              ${new Date(ev.ts).toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' })}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // ─────────────────────────────────────
  // 🔴 CORREÇÃO 5: DEFESA & DISSUASÃO EXPANDIDA
  // ─────────────────────────────────────
  openDefenseModal() {
    this.renderDefenseModal();
    this.openModal('modal-defense');
  }

  setDefSubTab(tab) {
    this.defSubTab = tab;
    document.querySelectorAll('#def-sub-tabs .sub-tab-btn').forEach(btn => btn.classList.remove('active'));
    const btn = document.getElementById('def-sub-tab-' + tab);
    if (btn) btn.classList.add('active');
    this.renderDefenseModal();
  }

  renderDefenseModal() {
    const s = window.engine.state;
    const body = document.getElementById('defense-modal-body');
    if (!body) return;

    const def = window.GAME_DATA.defense || {};

    if (this.defSubTab === 'alert') {
      const curDefcon = s.defense?.defcon || 5;
      const curNuc = s.defense?.nuclearLevel || 1;
      const nucData = (def.nuclearDeterrenceLevels || []).find(l => l.level === curNuc);
      const nextNuc = (def.nuclearDeterrenceLevels || []).find(l => l.level === curNuc + 1);

      body.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:14px">
          <!-- DEFCON Card -->
          <div class="card" style="margin:0;border:1.5px solid var(--border)">
            <div class="card-title" style="margin-bottom:10px">🚨 Níveis de Prontidão DEFCON</div>
            <div style="display:grid;grid-template-columns:repeat(5, 1fr);gap:6px;margin-bottom:10px">
              ${(def.defconLevels || []).map(dl => `
                <button onclick="ui.setDefcon(${dl.level})" style="
                  background:${dl.level === curDefcon ? dl.color : 'var(--bg-raised)'};
                  color:${dl.level === curDefcon ? '#000' : 'var(--text-1)'};
                  border:1.5px solid ${dl.color};
                  border-radius:var(--r-md);padding:8px 4px;font-family:'JetBrains Mono',monospace;
                  font-weight:900;font-size:11px;cursor:pointer;transition:transform 0.1s;
                ">
                  D-${dl.level}
                </button>
              `).join('')}
            </div>
            <div style="font-size:12px;font-weight:700;color:var(--text-1)">
              Estado Atual: <span style="color:${(def.defconLevels||[])[5-curDefcon]?.color || 'var(--green)'}">
                ${(def.defconLevels||[])[5-curDefcon]?.name} — ${(def.defconLevels||[])[5-curDefcon]?.title}
              </span>
            </div>
            <div style="font-size:10px;color:var(--text-3);margin-top:4px;line-height:1.4">
              ${(def.defconLevels||[])[5-curDefcon]?.desc}
            </div>
          </div>

          <!-- MAD Nuclear Deterrence Ladder -->
          <div class="card" style="margin:0;border:1.5px solid var(--border)">
            <div class="card-title" style="margin-bottom:8px">☢️ Índice de Dissuasão Nuclear (MAD)</div>
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
              <div style="font-size:36px">${nucData ? nucData.icon : '🕊️'}</div>
              <div style="flex:1">
                <div style="font-size:14px;font-weight:800;color:var(--gold)">Nível ${curNuc}: ${nucData?.name || 'Nenhum'}</div>
                <div style="font-size:11px;color:var(--text-3)">Multiplicador de PIB & Proteção: <strong style="color:var(--green)">×${nucData?.mult || 1.0}</strong></div>
              </div>
            </div>
            <div style="font-size:11px;color:var(--text-2);margin-bottom:12px">${nucData?.desc}</div>
            ${nextNuc ? `
              <button class="build-btn" onclick="ui.upgradeNuclear()" style="background:rgba(234, 179, 8, 0.15);border-color:var(--gold);color:var(--gold)">
                🚀 Elevar Dissuasão para ${nextNuc.name} (${window.engine.fmt(nextNuc.cost)})
              </button>
            ` : `<div class="pill pill-green" style="text-align:center;padding:8px">👑 Capacidade Suprema M.A.D. Ativa</div>`}
          </div>
        </div>
      `;
    } else if (this.defSubTab === 'forces') {
      const units = def.units || [];
      const forces = def.forces || [];
      body.innerHTML = `
        <div style="display:flex;gap:6px;overflow-x:auto;padding-bottom:8px;margin-bottom:10px;scrollbar-width:none">
          <button class="pi-chip ${this.defForceFilter==='all'?'active':''}" onclick="ui.setDefForceFilter('all')">Todas as Forças (40+)</button>
          ${forces.map(f => `
            <button class="pi-chip ${this.defForceFilter===f.id?'active':''}" onclick="ui.setDefForceFilter('${f.id}')">
              ${f.icon} ${f.name}
            </button>
          `).join('')}
        </div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${units.filter(u => this.defForceFilter==='all' || u.force === this.defForceFilter).map(u => {
            const owned = s.defense?.units[u.id] || 0;
            return `
              <div class="pi-card" style="padding:10px 12px">
                <div style="display:flex;align-items:center;gap:10px">
                  <div style="font-size:24px">${u.icon}</div>
                  <div style="flex:1">
                    <div style="font-size:13px;font-weight:800">${u.name}</div>
                    <div style="font-size:10px;color:var(--text-3)">Poder: +${u.power} · Custo: ${window.engine.fmt(u.cost)} · Ativas: <strong style="color:var(--blue)">${owned}</strong></div>
                  </div>
                  <div style="display:flex;gap:4px">
                    <button class="pi-buy-btn" onclick="ui.recruitUnit('${u.id}', 1)">+1</button>
                    <button class="pi-buy-btn sub" onclick="ui.recruitUnit('${u.id}', 10)">+10</button>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    } else if (this.defSubTab === 'bases') {
      const bases = def.militaryBases || [];
      body.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:8px">
          ${bases.map(b => {
            const owned = s.defense?.bases[b.id];
            return `
              <div class="policy-card" style="margin:0;padding:12px">
                <div style="font-size:26px">${b.icon}</div>
                <div class="policy-body">
                  <div class="policy-name">${b.name}</div>
                  <div class="policy-desc">${b.desc}</div>
                  <div style="font-size:10px;color:var(--gold);font-weight:700;margin-top:2px">⚡ ${b.bonus}</div>
                </div>
                <div>
                  ${owned ? `<span class="pill pill-green">Construída</span>` : `
                    <button class="build-btn" onclick="ui.buildBase('${b.id}')" style="padding:6px 10px;font-size:10px">
                      Construir<br>${window.engine.fmt(b.cost)}
                    </button>
                  `}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    } else if (this.defSubTab === 'ops') {
      const ops = def.militaryOperations || [];
      body.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:8px">
          ${ops.map(op => `
            <div class="policy-card" style="margin:0;padding:12px">
              <div style="font-size:26px">${op.icon}</div>
              <div class="policy-body">
                <div class="policy-name">${op.name}</div>
                <div class="policy-desc">Recompensa: <strong style="color:var(--green)">${op.reward}</strong></div>
                <div style="font-size:9px;color:var(--text-3);margin-top:2px">Risco: ${op.risk} · Custo: ${window.engine.fmt(op.cost)}</div>
              </div>
              <button class="build-btn" onclick="ui.launchOp('${op.id}')" style="border-color:var(--red);color:var(--red);background:rgba(255,68,68,0.1);padding:6px 10px;font-size:10px">
                Lançar Missão
              </button>
            </div>
          `).join('')}
        </div>
      `;
    }
  }

  setDefForceFilter(fId) {
    this.defForceFilter = fId;
    this.renderDefenseModal();
  }

  setDefcon(lvl) {
    window.engine.setDefcon(lvl);
    this._updateHeader();
    this.renderDefenseModal();
    this.showToast(`🚨 Nível de Prontidão alterado para DEFCON ${lvl}!`, 'crisis');
  }

  upgradeNuclear() {
    const res = window.engine.upgradeNuclearDeterrence();
    this.showToast(res.msg, res.ok ? 'success' : 'error');
    if (res.ok) {
      this._updateHeader();
      this.renderDefenseModal();
    }
  }

  recruitUnit(unitId, count) {
    const res = window.engine.recruitDefenseUnit(unitId, count);
    this.showToast(res.msg, res.ok ? 'success' : 'error');
    if (res.ok) {
      this._updateHeader();
      this.renderDefenseModal();
    }
  }

  buildBase(baseId) {
    const res = window.engine.buildMilitaryBase(baseId);
    this.showToast(res.msg, res.ok ? 'success' : 'error');
    if (res.ok) {
      this._updateHeader();
      this.renderDefenseModal();
    }
  }

  launchOp(opId) {
    const res = window.engine.launchMilitaryOperation(opId);
    this.showToast(res.msg, res.ok ? 'success' : 'error');
    if (res.ok) {
      this._updateHeader();
      this.renderDefenseModal();
    }
  }

  // ─────────────────────────────────────
  // 🔴 CORREÇÃO 6: ÁRVORE TECNOLÓGICA EXPANSÍVEL (8 RAMOS)
  // ─────────────────────────────────────
  openTechModal() {
    this.renderTechModal();
    this.openModal('modal-tech');
  }

  setTechBranch(branchId) {
    this.techBranch = branchId;
    this.renderTechModal();
  }

  renderTechModal() {
    const s = window.engine.state;
    const body = document.getElementById('tech-modal-body');
    const chipsEl = document.getElementById('tech-branches-chips');
    if (!body || !chipsEl) return;

    const tt = window.GAME_DATA.techTree || {};
    const branches = tt.branches || [];
    const techs = tt.techs || [];

    chipsEl.innerHTML = branches.map(b => `
      <button class="tech-branch-chip ${this.techBranch === b.id ? 'active' : ''}" onclick="ui.setTechBranch('${b.id}')">
        ${b.icon} ${b.name}
      </button>
    `).join('');

    const branchData = branches.find(b => b.id === this.techBranch);
    const branchTechs = techs.filter(t => t.branch === this.techBranch);

    body.innerHTML = `
      <div style="background:var(--bg-raised);padding:12px;border-radius:var(--r-md);margin-bottom:12px;border:1px solid var(--border)">
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:24px">${branchData?.icon}</span>
          <div>
            <div style="font-size:14px;font-weight:800;color:var(--text-1)">Ramo: ${branchData?.name}</div>
            <div style="font-size:11px;color:var(--text-3)">${branchData?.desc}</div>
          </div>
        </div>
      </div>

      <div class="tech-card-grid">
        ${branchTechs.map(t => {
          const isUnlocked = s.tech?.unlocked[t.id];
          const isResearching = s.tech?.researchingId === t.id;
          const hasPrereqs = (t.prereqs || []).every(p => s.tech?.unlocked[p]);

          return `
            <div class="tech-item-card ${isUnlocked ? 'unlocked' : ''} ${isResearching ? 'researching' : ''}">
              <div style="font-size:26px">${t.icon}</div>
              <div style="flex:1">
                <div style="font-size:13px;font-weight:800;color:var(--text-1)">
                  ${t.name} ${isUnlocked ? '✅' : ''}
                </div>
                <div style="font-size:10px;color:var(--green);margin-top:2px;font-weight:700">⚡ ${t.effect}</div>
                <div style="font-size:9px;color:var(--text-3);margin-top:2px">
                  Era: ${t.era} · Custo: ${window.engine.fmt(t.cost)} · Tempo: ${t.time}s
                </div>
                ${isResearching ? `
                  <div class="progress-bar" style="height:6px;margin-top:6px">
                    <div class="progress-fill" style="width:${Math.round(((s.tech?.researchProgress||0)/t.time)*100)}%;background:var(--blue)"></div>
                  </div>
                  <div style="font-size:9px;color:var(--blue);margin-top:2px">Pesquisando: ${s.tech?.researchProgress||0}/${t.time}s</div>
                ` : ''}
              </div>
              <div>
                ${isUnlocked ? `<span class="pill pill-green" style="font-size:9px">Concluída</span>` : (
                  isResearching ? `<span class="pill pill-blue" style="font-size:9px">Em Andamento</span>` : (
                    hasPrereqs ? `
                      <button class="build-btn" onclick="ui.startResearch('${t.id}')" style="padding:6px 10px;font-size:10px">
                        Pesquisar
                      </button>
                    ` : `<span class="pill pill-red" style="font-size:9px">Bloqueada</span>`
                  )
                )}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  startResearch(techId) {
    const res = window.engine.startResearch(techId);
    this.showToast(res.msg, res.ok ? 'success' : 'error');
    if (res.ok) {
      this._updateHeader();
      this.renderTechModal();
    }
  }

  // ─────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────
  _setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }
}

// Boot
window.addEventListener('DOMContentLoaded', () => {
  // Pequeño delay para garantir que engine está pronto
  setTimeout(() => {
    window.ui = new MasterUI();
    window.getChartOptions = (isDarkMode, type) => window.ui ? window.ui.getChartOptions(isDarkMode, type) : null;
  }, 100);
});
