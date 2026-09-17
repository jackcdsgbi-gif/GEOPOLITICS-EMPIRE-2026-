/**
 * GEOPOLITICS EMPIRE 2026 — Map Module (Leaflet.js + CartoDB Dark Matter)
 * Cartografia profissional, 8 Territórios Táticos GeoJSON, Alertas em Tempo Real via Socket.io
 * e Super Modal Executivo de Operações Geopolíticas (Glassmorphism)
 */

class MapModule {
  constructor() {
    window.mapModule = this;
    this.map = null;
    this.geoJsonLayer = null;
    this.regionLayers = new Map();
    this.socket = null;
    this.currentRegionId = 'sa';
    this.currentModalTab = 'eco';
    this.regionApiCache = new Map();
    this.searchQuery = '';

    // Definição das 8 Regiões Monitoradas
    this.regionData = {
      sa: {
        id: 'sa',
        name: 'América do Sul',
        flag: '🐆',
        continentKey: 'South America',
        blocPreset: 'Aliança do Pacífico',
        doctrine: 'Agro & Recursos Críticos',
        color: '#00ff88',
        accent: '#4ade80',
        center: [-15.0, -60.0],
        zoom: 3,
        gdpShare: '8%',
        focus: 'Agronegócio, Lítio & Nióbio'
      },
      na: {
        id: 'na',
        name: 'América do Norte',
        flag: '🦅',
        continentKey: 'North America',
        blocPreset: 'Coalizão dos Cinco',
        doctrine: 'Capital & Aeroespacial',
        color: '#38bdf8',
        accent: '#60a5fa',
        center: [45.0, -100.0],
        zoom: 3,
        gdpShare: '24%',
        focus: 'Tecnologia, Dólar & Defesa'
      },
      eu: {
        id: 'eu',
        name: 'Europa',
        flag: '🏰',
        continentKey: 'Europe',
        blocPreset: 'União Atlântica',
        doctrine: 'Tech & Finanças Globais',
        color: '#818cf8',
        accent: '#a78bfa',
        center: [52.0, 15.0],
        zoom: 4,
        gdpShare: '21%',
        focus: 'Indústria Pesada, P&D & Euro'
      },
      af: {
        id: 'af',
        name: 'África',
        flag: '🌍',
        continentKey: 'Africa',
        blocPreset: 'Cartel Energético',
        doctrine: 'Mineração & Energia Solar',
        color: '#facc15',
        accent: '#fde047',
        center: [2.0, 22.0],
        zoom: 3,
        gdpShare: '6%',
        focus: 'Terras Raras, Ouro & Hidrocarbonetos'
      },
      me: {
        id: 'me',
        name: 'Oriente',
        flag: '🕌',
        continentKey: 'Middle East',
        blocPreset: 'Cartel Energético',
        doctrine: 'Petróleo & Fundos Soberanos',
        color: '#fb7185',
        accent: '#f43f5e',
        center: [26.0, 48.0],
        zoom: 4,
        gdpShare: '7%',
        focus: 'Petrodólares, Gás & Logística do Golfo'
      },
      asia: {
        id: 'asia',
        name: 'Eurásia & Ásia',
        flag: '🐉',
        continentKey: 'Asia',
        blocPreset: 'Federação Emergente',
        doctrine: 'Indústria & Semicondutores',
        color: '#c084fc',
        accent: '#d8b4fe',
        center: [42.0, 95.0],
        zoom: 3,
        gdpShare: '28%',
        focus: 'Manufatura Global, Semicondutores & IA'
      },
      sea: {
        id: 'sea',
        name: 'ASEAN',
        flag: '🌴',
        continentKey: 'Asia',
        blocPreset: 'Consórcio de Terras Raras',
        doctrine: 'Cadeia de Suprimentos & Lítio',
        color: '#2dd4bf',
        accent: '#5eead4',
        center: [5.0, 115.0],
        zoom: 4,
        gdpShare: '4%',
        focus: 'Estreito de Malaca, Baterias & Chips'
      },
      pac: {
        id: 'pac',
        name: 'Oceania',
        flag: '🌊',
        continentKey: 'Oceania',
        blocPreset: 'Aliança do Pacífico',
        doctrine: 'Logística & Soberania Marítima',
        color: '#06b6d4',
        accent: '#22d3ee',
        center: [-25.0, 140.0],
        zoom: 3,
        gdpShare: '2%',
        focus: 'Minério de Ferro, Hidrogênio & Rotas Navais'
      }
    };

    // GeoJSON das 8 Regiões Táticas (Polígonos Simplificados de Alta Performance)
    this.geoJsonData = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { id: 'sa', name: 'América do Sul', flag: '🐆' },
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [-81.5, 12.5], [-77.0, 8.5], [-72.0, 11.8], [-60.0, 9.0], [-51.0, 4.0],
              [-35.0, -5.0], [-34.8, -8.0], [-38.5, -13.0], [-41.0, -21.0], [-48.5, -28.0],
              [-53.0, -33.5], [-58.0, -38.5], [-65.0, -43.0], [-66.0, -54.8], [-72.0, -55.0],
              [-75.5, -48.0], [-73.5, -37.0], [-71.0, -30.0], [-70.0, -18.5], [-76.0, -14.0],
              [-81.0, -5.0], [-80.5, 2.0], [-77.5, 7.5], [-81.5, 12.5]
            ]]
          }
        },
        {
          type: 'Feature',
          properties: { id: 'na', name: 'América do Norte', flag: '🦅' },
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [-168.0, 66.0], [-160.0, 71.5], [-130.0, 70.0], [-95.0, 74.0], [-60.0, 60.0],
              [-53.0, 48.0], [-64.0, 44.0], [-75.0, 35.0], [-80.0, 25.0], [-82.0, 24.5],
              [-90.0, 30.0], [-97.0, 26.0], [-87.0, 21.5], [-87.5, 13.5], [-92.5, 15.0],
              [-105.0, 20.0], [-115.0, 30.0], [-124.0, 38.0], [-125.0, 50.0], [-135.0, 57.0],
              [-150.0, 60.0], [-168.0, 53.0], [-168.0, 66.0]
            ]]
          }
        },
        {
          type: 'Feature',
          properties: { id: 'eu', name: 'Europa', flag: '🏰' },
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [-10.5, 36.0], [-9.5, 43.0], [-5.0, 48.5], [-10.5, 52.0], [-6.0, 58.5],
              [5.0, 62.0], [15.0, 71.0], [28.0, 71.0], [40.0, 67.0], [40.0, 55.0],
              [35.0, 46.0], [28.0, 41.0], [23.0, 38.0], [15.0, 38.0], [15.0, 44.0],
              [5.0, 43.0], [3.0, 42.0], [-2.0, 36.5], [-10.5, 36.0]
            ]]
          }
        },
        {
          type: 'Feature',
          properties: { id: 'af', name: 'África', flag: '🌍' },
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [-17.5, 14.5], [-17.0, 21.0], [-10.0, 28.0], [-6.0, 36.0], [10.0, 37.5],
              [11.5, 33.0], [25.0, 32.0], [32.0, 31.5], [35.0, 27.5], [43.5, 12.5],
              [51.5, 10.5], [41.0, -2.0], [40.5, -11.0], [35.5, -24.0], [32.5, -28.0],
              [28.0, -33.0], [19.0, -34.8], [18.0, -32.5], [12.0, -17.0], [9.0, -4.0],
              [8.5, 4.5], [2.0, 6.0], [-8.0, 4.5], [-13.0, 9.0], [-17.5, 14.5]
            ]]
          }
        },
        {
          type: 'Feature',
          properties: { id: 'me', name: 'Oriente', flag: '🕌' },
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [34.0, 31.5], [36.0, 37.0], [44.0, 37.5], [48.5, 38.5], [60.0, 37.0],
              [62.0, 25.0], [59.0, 22.5], [54.0, 16.5], [44.0, 12.5], [43.0, 16.0],
              [35.0, 27.5], [32.5, 29.5], [34.0, 31.5]
            ]]
          }
        },
        {
          type: 'Feature',
          properties: { id: 'asia', name: 'Eurásia & Ásia', flag: '🐉' },
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [40.0, 55.0], [40.0, 68.0], [60.0, 73.0], [105.0, 77.0], [170.0, 66.0],
              [160.0, 52.0], [140.0, 36.0], [130.0, 31.0], [122.0, 24.0], [108.0, 21.5],
              [100.0, 21.5], [89.0, 22.0], [80.0, 10.0], [77.0, 8.0], [68.0, 24.0],
              [62.0, 25.0], [60.0, 37.0], [48.5, 38.5], [40.0, 55.0]
            ]]
          }
        },
        {
          type: 'Feature',
          properties: { id: 'sea', name: 'ASEAN', flag: '🌴' },
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [92.0, 21.0], [100.0, 21.5], [108.0, 21.5], [110.0, 16.0], [119.5, 18.5],
              [126.5, 12.0], [126.5, 6.0], [141.0, -2.5], [141.0, -9.0], [128.0, -9.0],
              [115.0, -8.5], [105.0, -6.0], [98.0, 3.0], [95.0, 5.5], [92.0, 21.0]
            ]]
          }
        },
        {
          type: 'Feature',
          properties: { id: 'pac', name: 'Oceania', flag: '🌊' },
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [112.0, -21.0], [130.0, -11.0], [142.0, -10.5], [153.5, -28.0], [178.0, -34.0],
              [178.0, -47.0], [166.0, -46.5], [147.0, -43.5], [137.0, -35.0], [115.0, -34.5],
              [112.0, -21.0]
            ]]
          }
        }
      ]
    };
  }

  /**
   * Inicializa o mapa Leaflet com Camada CartoDB Dark Matter
   */
  init() {
    const mapEl = document.getElementById('map');
    if (!mapEl || this.map) return;
    if (typeof L === 'undefined') {
      console.warn('Leaflet.js ainda não carregado. Aguardando...');
      setTimeout(() => this.init(), 300);
      return;
    }

    try {
      this.map = L.map('map', {
        center: [20, 0],
        zoom: 2,
        minZoom: 2,
        maxZoom: 10,
        zoomControl: true,
        attributionControl: false,
        worldCopyJump: false,
        maxBounds: [[-85, -180], [85, 180]],
        maxBoundsViscosity: 1.0
      });

      // Camada Militar CartoDB Dark Matter
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        maxZoom: 19,
        noWrap: true
      }).addTo(this.map);

      // Adiciona polígonos dos 8 territórios com estilização neon militar
      this._renderTerritoryPolygons();

      // Conecta aos eventos em tempo real do Socket.io
      this._setupSocketListeners();

      console.log('🗺️ Leaflet.js CartoDB Dark Matter inicializado com sucesso.');
    } catch (e) {
      console.error('Falha ao inicializar Leaflet:', e);
    }
  }

  /**
   * Ajusta renderização em transições de abas ou resize
   */
  invalidateSize() {
    if (this.map) {
      setTimeout(() => {
        this.map.invalidateSize();
      }, 100);
    } else {
      this.init();
    }
  }

  /**
   * Desenha os polígonos GeoJSON com estilo tático militar
   */
  _renderTerritoryPolygons() {
    this.geoJsonLayer = L.geoJSON(this.geoJsonData, {
      style: (feature) => {
        const id = feature.properties.id;
        const conf = this.regionData[id] || {};
        return {
          color: conf.color || '#00ff88',
          weight: 1.5,
          opacity: 0.85,
          fillColor: conf.color || '#00ff88',
          fillOpacity: 0.12,
          dashArray: '3, 4'
        };
      },
      onEachFeature: (feature, layer) => {
        const id = feature.properties.id;
        const conf = this.regionData[id];
        this.regionLayers.set(id, layer);

        // Tooltip tática
        layer.bindTooltip(`
          <div style="text-align:center">
            <strong>${conf.flag} ${conf.name.toUpperCase()}</strong><br>
            <span style="color:#00ff88;font-size:10px">${conf.focus}</span>
          </div>
        `, {
          permanent: false,
          sticky: true,
          direction: 'top',
          className: 'tactical-tooltip'
        });

        // Eventos de Mouse (Hover)
        layer.on({
          mouseover: (e) => {
            const l = e.target;
            l.setStyle({
              weight: 2.5,
              color: '#38bdf8',
              fillColor: '#38bdf8',
              fillOpacity: 0.35,
              dashArray: ''
            });
            l.bringToFront();

            const titleEl = document.getElementById('wri-title');
            if (titleEl) {
              titleEl.textContent = `${conf.flag} ${conf.name.toUpperCase()} — ${conf.focus} (${conf.gdpShare} PIB Global)`;
            }
          },
          mouseout: (e) => {
            this.geoJsonLayer.resetStyle(e.target);
          },
          click: () => {
            this.openSuperModal(id);
          }
        });
      }
    }).addTo(this.map);
  }

  /**
   * Conecta ao Socket.io para reagir a crises da IA Diretora
   */
  _setupSocketListeners() {
    try {
      if (typeof io !== 'undefined') {
        this.socket = io({ auth: { token: localStorage.getItem('dd_token') || '' } });

        this.socket.on('ai:event', (event) => {
          this._handleAiCrisisEvent(event);
        });

        this.socket.on('match:start', () => {
          this._flashRandomBorder();
        });
      }
    } catch (e) {
      console.warn('Socket indisponível no cliente map:', e);
    }
  }

  /**
   * Detecta crises da IA e faz o continente afetado piscar em vermelho
   */
  _handleAiCrisisEvent(event) {
    if (!event) return;
    const text = `${event.actor || ''} ${event.headline || ''} ${event.details || ''}`.toLowerCase();

    let targetRegion = null;
    for (const [id, conf] of Object.entries(this.regionData)) {
      if (text.includes(conf.name.toLowerCase()) || text.includes(conf.continentKey.toLowerCase())) {
        targetRegion = id;
        break;
      }
    }

    if (!targetRegion) {
      if (text.includes('estados unidos') || text.includes('usa')) targetRegion = 'na';
      else if (text.includes('brasil') || text.includes('argentina')) targetRegion = 'sa';
      else if (text.includes('europa') || text.includes('rússia')) targetRegion = 'eu';
      else if (text.includes('china') || text.includes('japão') || text.includes('índia')) targetRegion = 'asia';
      else if (text.includes('arábia') || text.includes('oriente')) targetRegion = 'me';
      else if (text.includes('indonésia') || text.includes('asean')) targetRegion = 'sea';
      else if (text.includes('austrália') || text.includes('oceania')) targetRegion = 'pac';
      else if (text.includes('áfrica')) targetRegion = 'af';
    }

    if (targetRegion) {
      this.flashCrisisRegion(targetRegion, 6000);
      if (window.ui?.showToast) {
        window.ui.showToast(`🚨 Alerta Tático: Crise deflagrada em ${this.regionData[targetRegion].name}!`, 'error');
      }
    }
  }

  /**
   * Faz o polígono da região piscar em vermelho na tela
   */
  flashCrisisRegion(regionId, durationMs = 5000) {
    const layer = this.regionLayers.get(regionId);
    if (!layer) return;

    layer.setStyle({
      color: '#ff0055',
      weight: 3.5,
      fillColor: '#ef4444',
      fillOpacity: 0.65,
      dashArray: ''
    });

    const el = layer.getElement ? layer.getElement() : null;
    if (el) el.classList.add('crisis-pulsing');

    setTimeout(() => {
      if (this.geoJsonLayer && layer) {
        this.geoJsonLayer.resetStyle(layer);
        if (el) el.classList.remove('crisis-pulsing');
      }
    }, durationMs);
  }

  _flashRandomBorder() {
    const keys = Object.keys(this.regionData);
    const rk = keys[Math.floor(Math.random() * keys.length)];
    this.flashCrisisRegion(rk, 3000);
  }

  /**
   * Inspeciona região (retrocompatibilidade com ui.openRegion)
   */
  inspectRegion(regionId) {
    this.openSuperModal(regionId);
  }

  // ─────────────────────────────────────────────────────────────
  // SUPER MODAL DE OPERAÇÕES GEOPOLÍTICAS
  // ─────────────────────────────────────────────────────────────

  async openSuperModal(regionId) {
    this.currentRegionId = regionId || 'sa';
    const conf = this.regionData[this.currentRegionId] || this.regionData.sa;

    const modal = document.getElementById('modal-geopolitical-ops');
    if (!modal) return;
    modal.style.display = 'flex';

    // Cabeçalho dinâmico preliminar
    document.getElementById('geo-modal-flag').textContent = conf.flag;
    document.getElementById('geo-modal-title').textContent = conf.name.toUpperCase();
    document.getElementById('geo-modal-subtitle').textContent = `Bloco: ${conf.blocPreset} · Doutrina: ${conf.doctrine}`;

    // Renderiza a aba atual com dados locais imediatos
    this.renderCurrentModalTab();

    // Consulta dados em tempo real no PostgreSQL
    try {
      const res = await fetch(`/api/geo/region/${this.currentRegionId}`);
      if (res.ok) {
        const data = await res.json();
        this.regionApiCache.set(this.currentRegionId, data);
        this._updateModalHeaderWithLiveOps(data);
        this.renderCurrentModalTab();
      }
    } catch (e) {
      console.warn('Falha ao consultar /api/geo/region:', e);
    }
  }

  closeSuperModal() {
    const modal = document.getElementById('modal-geopolitical-ops');
    if (modal) modal.style.display = 'none';
  }

  switchModalTab(tabKey) {
    this.currentModalTab = tabKey;
    ['eco', 'mil', 'spy', 'ai'].forEach(k => {
      const btn = document.getElementById(`geotab-btn-${k}`);
      if (btn) btn.classList.toggle('active', k === tabKey);
    });
    this.renderCurrentModalTab();
  }

  _updateModalHeaderWithLiveOps(data) {
    if (!data?.region) return;
    const r = data.region;
    const tensionEl = document.getElementById('geo-modal-tension');
    if (tensionEl) {
      tensionEl.textContent = r.tension || 'Tensão: Baixa';
      tensionEl.className = `pill ${r.tensionPill || 'pill-green'}`;
    }
    const sub = document.getElementById('geo-modal-subtitle');
    if (sub) {
      sub.textContent = `Bloco: ${r.blocName} · Líder Soberano: ${r.sovereignLeader} (${r.sovereignNation})`;
    }
  }

  renderCurrentModalTab() {
    const body = document.getElementById('geo-modal-body');
    if (!body) return;

    const conf = this.regionData[this.currentRegionId] || this.regionData.sa;
    const data = this.regionApiCache.get(this.currentRegionId);

    if (this.currentModalTab === 'eco') {
      body.innerHTML = this._renderEconomyTab(conf, data);
    } else if (this.currentModalTab === 'mil') {
      body.innerHTML = this._renderMilitaryTab(conf, data);
    } else if (this.currentModalTab === 'spy') {
      body.innerHTML = this._renderSpyTab(conf, data);
    } else if (this.currentModalTab === 'ai') {
      body.innerHTML = this._renderAiDirectivesTab(conf, data);
    }
  }

  _renderEconomyTab(conf, data) {
    const s = window.engine?.state || {};
    const totalGdp = data?.economy?.totalGdp || 350_000_000;
    const gdpFormatted = window.engine ? window.engine.fmt(totalGdp) : `$${(totalGdp / 1e6).toFixed(1)}M`;
    const bonusBadge = data?.economy?.bonusBadge || '🌾 +5% Agro';
    const bonusLabel = data?.economy?.bonusLabel || 'Bônus de produção setorial ativa';
    const playerBalance = s.balance || 0;

    return `
      <div class="geo-card-stat" style="border-left: 3px solid #00ff88;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="font-size:11px; color:#94a3b8; text-transform:uppercase;">PIB Regional Acumulado</div>
            <div style="font-size:22px; font-weight:900; color:#00ff88; margin-top:4px;">${gdpFormatted}</div>
          </div>
          <span class="pill pill-green" style="font-size:11px; padding:6px 10px;">${bonusBadge}</span>
        </div>
        <div style="font-size:11px; color:#cbd5e1; margin-top:8px;">
          ${bonusLabel}
        </div>
      </div>

      <div style="margin-top:14px; font-size:12px; font-weight:800; color:#f8fafc; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px;">
        🏛️ Oportunidades de Investimento Capital
      </div>

      <div style="display:grid; grid-template-columns:1fr; gap:8px;">
        <div class="geo-card-stat" style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="font-weight:700; font-size:12px; color:#fff;">🌱 Fundo de Fomento Setorial</div>
            <div style="font-size:10px; color:#94a3b8;">+250 XP de Nação · +50 Influência Global</div>
          </div>
          <button class="geo-invest-btn" onclick="mapModule.doInvest('${conf.id}', 10000, 250, 50)" ${playerBalance < 10000 ? 'disabled style="opacity:0.5"' : ''}>
            Investir $10K
          </button>
        </div>

        <div class="geo-card-stat" style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="font-weight:700; font-size:12px; color:#fff;">🏭 Complexo Tecnológico / Logístico</div>
            <div style="font-size:10px; color:#94a3b8;">+1.500 XP de Nação · +300 Influência Global</div>
          </div>
          <button class="geo-invest-btn" onclick="mapModule.doInvest('${conf.id}', 50000, 1500, 300)" ${playerBalance < 50000 ? 'disabled style="opacity:0.5"' : ''}>
            Investir $50K
          </button>
        </div>

        <div class="geo-card-stat" style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="font-weight:700; font-size:12px; color:#fff;">👑 Megaprojeto de Soberania Continental</div>
            <div style="font-size:10px; color:#94a3b8;">+8.000 XP de Nação · +1.800 Influência Global</div>
          </div>
          <button class="geo-invest-btn" onclick="mapModule.doInvest('${conf.id}', 250000, 8000, 1800)" ${playerBalance < 250000 ? 'disabled style="opacity:0.5"' : ''}>
            Investir $250K
          </button>
        </div>
      </div>
    `;
  }

  _renderMilitaryTab(conf, data) {
    const tension = data?.military?.tension || 'Baixa (DEFCON 5)';
    const battles = data?.military?.activeBattles || [];
    const queue = data?.military?.queuedPlayers || [];

    return `
      <div class="geo-card-stat" style="border-left: 3px solid #ef4444;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="font-size:11px; color:#94a3b8; text-transform:uppercase;">Prontidão Tática do Setor</div>
            <div style="font-size:16px; font-weight:800; color:#ef4444; margin-top:2px;">${tension}</div>
          </div>
          <button class="geo-invest-btn" style="background:#dc2626; color:#fff;" onclick="mapModule.joinMatchmaking()">
            ⚔️ Desafiar PvP
          </button>
        </div>
      </div>

      <div style="margin-top:14px; font-size:12px; font-weight:800; color:#f8fafc; text-transform:uppercase; margin-bottom:8px;">
        🎯 Fila de Matchmaking em Tempo Real
      </div>
      ${queue.length === 0 ? `
        <div style="padding:16px; text-align:center; color:#94a3b8; font-size:11px; background:rgba(255,255,255,0.02); border-radius:6px;">
          Nenhum jogador em fila neste setor no momento. Seja o primeiro a declarar prontidão de combate!
        </div>
      ` : queue.map(q => `
        <div class="geo-card-stat" style="display:flex; justify-content:space-between; align-items:center; padding:8px 12px;">
          <div>
            <span style="font-weight:700; color:#38bdf8;">Comandante #${q.playerId}</span>
            <span style="font-size:10px; color:#94a3b8; margin-left:6px;">Rating: ${q.rating}</span>
          </div>
          <span class="pill pill-blue" style="font-size:9px">Em Espera</span>
        </div>
      `).join('')}

      <div style="margin-top:14px; font-size:12px; font-weight:800; color:#f8fafc; text-transform:uppercase; margin-bottom:8px;">
        🛡️ Últimos Confrontos Registrados
      </div>
      ${battles.length === 0 ? `
        <div style="padding:12px; text-align:center; color:#94a3b8; font-size:11px;">Tratados de paz respeitados nas últimas 24 horas.</div>
      ` : battles.map(b => `
        <div class="geo-card-stat" style="padding:8px 12px; font-size:11px;">
          <div style="display:flex; justify-content:space-between;">
            <span style="color:#f8fafc;">Batalha ID#${b.id} (Incursão Tática)</span>
            <span style="color:#f59e0b; font-weight:700;">$${Number(b.stolen_gdp||0).toLocaleString('pt-BR')} Espólio</span>
          </div>
        </div>
      `).join('')}
    `;
  }

  _renderSpyTab(conf, data) {
    const stability = data?.intelligence?.stability || 92;
    const players = data?.intelligence?.players || [];
    const q = (this.searchQuery || '').toLowerCase().trim();

    const filtered = q.length === 0 ? players : players.filter(p =>
      (p.username && p.username.toLowerCase().includes(q)) ||
      (p.nation && p.nation.toLowerCase().includes(q)) ||
      (p.doctrine && p.doctrine.toLowerCase().includes(q))
    );

    return `
      <div class="geo-card-stat" style="border-left: 3px solid #38bdf8;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="font-size:11px; color:#94a3b8; text-transform:uppercase;">Índice de Estabilidade do Bloco</div>
            <div style="font-size:20px; font-weight:900; color:#38bdf8; margin-top:2px;">${stability}% Estável</div>
          </div>
          <span class="pill pill-blue" style="font-size:10px">Rede de Espionagem Ativa</span>
        </div>
      </div>

      <div style="margin-top:12px; margin-bottom:10px;">
        <div style="display:flex; align-items:center; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.12); border-radius:6px; padding:6px 10px;">
          <span style="margin-right:6px; font-size:13px">🔍</span>
          <input type="text" placeholder="Filtrar agentes da região por username..." value="${this.searchQuery || ''}"
                 oninput="mapModule.onSearchPlayers(this.value)"
                 style="flex:1; background:transparent; border:none; outline:none; color:#fff; font-size:11px;">
        </div>
      </div>

      <div style="max-height:220px; overflow-y:auto; display:grid; gap:6px;">
        ${filtered.length === 0 ? `
          <div style="padding:14px; text-align:center; color:#94a3b8; font-size:11px;">Nenhum agente regional localizado com esse filtro.</div>
        ` : filtered.map(p => `
          <div class="geo-card-stat" style="display:flex; justify-content:space-between; align-items:center; padding:8px 12px; margin-bottom:0;">
            <div>
              <span style="font-weight:700; color:#f8fafc;">${p.emoji || '🌐'} ${p.username}</span>
              <span style="font-size:10px; color:#94a3b8; margin-left:6px;">${p.nation || ''} (Nv.${p.level||1})</span>
            </div>
            <span class="pill pill-green" style="font-size:9px">Rating ${p.rating||1000}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  _renderAiDirectivesTab(conf, data) {
    const events = data?.aiDirectives || [];

    return `
      <div class="geo-card-stat" style="border-left: 3px solid #c084fc;">
        <div style="font-size:11px; color:#94a3b8; text-transform:uppercase;">Monitoramento da IA Diretora</div>
        <div style="font-size:15px; font-weight:800; color:#c084fc; margin-top:2px;">Simulação Geopolítica Autônoma em Tempo Real</div>
      </div>

      <div style="display:grid; gap:8px; margin-top:10px;">
        ${events.length === 0 ? `
          <div style="padding:16px; text-align:center; color:#94a3b8; font-size:11px;">Nenhum evento registrado recentemente para este continente.</div>
        ` : events.map(ev => `
          <div class="geo-card-stat" style="padding:10px 12px;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
              <span style="font-weight:700; color:#f8fafc; font-size:12px;">${ev.headline}</span>
              <span style="font-size:9px; color:#94a3b8; margin-left:8px;">${new Date(ev.ts || Date.now()).toLocaleTimeString()}</span>
            </div>
            <div style="font-size:11px; color:#94a3b8; margin-top:4px;">
              ${ev.details || ''}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  onSearchPlayers(val) {
    this.searchQuery = val || '';
    const body = document.getElementById('geo-modal-body');
    if (body && this.currentModalTab === 'spy') {
      const conf = this.regionData[this.currentRegionId] || this.regionData.sa;
      const data = this.regionApiCache.get(this.currentRegionId);
      body.innerHTML = this._renderSpyTab(conf, data);
    }
  }

  doInvest(regionId, amount, xpGain, infGain) {
    if (window.engine && typeof window.engine.investInRegion === 'function') {
      const ok = window.engine.investInRegion(regionId, amount, xpGain, infGain);
      if (ok) {
        this.renderCurrentModalTab();
      }
    } else {
      if (window.ui?.showToast) {
        window.ui.showToast(`Investimento de $${amount.toLocaleString()} efetuado com sucesso!`, 'success');
      }
    }
  }

  joinMatchmaking() {
    this.closeSuperModal();
    if (window.ui && typeof window.ui.switchTab === 'function') {
      window.ui.switchTab('territorio');
    }
    const token = localStorage.getItem('dd_token');
    if (!token) {
      if (window.ui?.showToast) window.ui.showToast('Faça login no Hub para disputar partidas PvP!', 'warning');
      return;
    }

    fetch('/api/match/queue', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }).then(r => r.json()).then(data => {
      if (data.queued) {
        if (window.ui?.showToast) window.ui.showToast('⚔️ Você entrou na fila de Matchmaking global!', 'success');
      } else {
        if (window.ui?.showToast) window.ui.showToast(data.error || 'Erro ao entrar na fila', 'error');
      }
    }).catch(() => {
      if (window.ui?.showToast) window.ui.showToast('⚔️ Desafio registrado!', 'info');
    });
  }
}

// Inicialização automática ao carregar o DOM
window.addEventListener('DOMContentLoaded', () => {
  window.mapModule = new MapModule();
  // Aguarda montagem da view
  setTimeout(() => {
    window.mapModule.init();
  }, 400);
});
