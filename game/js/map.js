/**
 * GEOPOLITICS EMPIRE 2026 — Map Module
 * Grade territorial 3×3 + Interações Geopolíticas no Mapa-Múndi
 */
class MapModule {
  constructor() {
    window.mapModule = this;
    this.regionData = {
      na:   { name: 'América do Norte',  gdpShare: '24%', focus: 'Tecnologia & Aeroespacial', icon: '🦅' },
      sa:   { name: 'América do Sul',    gdpShare: '8%',  focus: 'Agronegócio & Minérios',    icon: '🐆' },
      eu:   { name: 'Europa Ocidental',  gdpShare: '21%', focus: 'Indústria Pesada & Finanças',icon: '🏰' },
      af:   { name: 'África',            gdpShare: '6%',  focus: 'Metais Raros & Energia',    icon: '🌍' },
      asia: { name: 'Ásia Oriental',     gdpShare: '28%', focus: 'Manufatura & Semicondutores',icon: '🐉' },
      me:   { name: 'Oriente Médio',     gdpShare: '7%',  focus: 'Petróleo & Fundos Soberanos',icon: '🏜️' },
      sea:  { name: 'Sudeste Asiático',  gdpShare: '4%',  focus: 'Cadeia de Suprimentos',      icon: '🌴' },
      pac:  { name: 'Oceania',           gdpShare: '2%',  focus: 'Recursos Naturais Marítimos',icon: '🌊' }
    };
  }

  // Highlight region on SVG map
  highlightRegion(regionId, color = '#00FF88') {
    const el = document.getElementById('region-' + regionId);
    if (!el) return;
    el.style.transition = 'stroke 0.2s ease, stroke-width 0.2s ease';
    el.style.stroke = color;
    el.style.strokeWidth = '2';
    setTimeout(() => {
      if (el) {
        el.style.stroke = '#00FF88';
        el.style.strokeWidth = '0.5';
      }
    }, 2200);
  }

  // Interação detalhada de inspeção de região
  inspectRegion(regionId) {
    const info = this.regionData[regionId];
    if (!info) return;

    this.highlightRegion(regionId, '#FFD700');
    const s = window.engine?.state;
    const treatyActive = s?.treaties?.[regionId] || false;

    window.ui?.showToast(
      `${info.icon} ${info.name}: ${info.focus} (${info.gdpShare} PIB Global)${treatyActive ? ' • 🤝 Tratado Ativo' : ''}`,
      'info'
    );
  }

  // Atualiza marcador de sede da nação do jogador
  updatePlayerMarker() {
    const marker = document.getElementById('player-marker');
    if (!marker) return;
    const s = window.engine?.state;
    const level = s?.level || 0;
    marker.title = `${s?.nationName || 'Nação'} (Nv.${level}) — Poder: ${Math.floor(s?.powerScore || 0)}`;
    marker.style.transform = 'scale(1.1)';
    setTimeout(() => { if (marker) marker.style.transform = ''; }, 300);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.mapModule = new MapModule();
});
