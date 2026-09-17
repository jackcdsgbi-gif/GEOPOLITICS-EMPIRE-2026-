/**
 * GEOPOLITICS EMPIRE 2026 — Sistema SE/ENTÃO de Diretrizes
 */
class DirectivesUI {
  constructor() {
    window.directivesUI = this;
    this._conditions = [
      { id:'bal_gt_100',  label:'Tesouro > $100',    fn: s => s.balance > 100 },
      { id:'bal_gt_1k',   label:'Tesouro > $1.000',  fn: s => s.balance > 1000 },
      { id:'bal_gt_10k',  label:'Tesouro > $10.000', fn: s => s.balance > 10000 },
      { id:'stab_lt_40',  label:'Estabilidade < 40%',fn: s => s.stability < 40 },
      { id:'pol_lt_30',   label:'Aprovação < 30%',   fn: s => s.approval < 30 },
      { id:'level_gt_5',  label:'Nível > 5',          fn: s => s.level > 5 }
    ];
    this._actions = [
      {
        id:'build_cheap',
        label:'Construir instalação mais acessível',
        fn: () => {
          const s = window.engine.state;
          const facs = (window.GAME_DATA.facilities || []).filter(f => f.phase <= s.phase);
          const affordable = facs
            .map(f => ({ id: f.id, cost: typeof window.engine._calcFacCost === 'function' ? window.engine._calcFacCost(f, s.facilities[f.id]?.level || 0) : f.baseCost }))
            .filter(item => item.cost <= s.balance)
            .sort((a,b) => a.cost - b.cost);
          if (affordable.length > 0) {
            const res = window.engine.buildFacility(affordable[0].id);
            if (res && res.ok) window.ui?.showToast('🤖 Diretriz: ' + res.msg, 'info');
          }
        }
      },
      { id:'buy_oil',     label:'Comprar 10 barris de petróleo',    fn: () => window.engine.buyCommodity('oil',10) },
      { id:'sell_gold',   label:'Vender 5 oz de ouro',              fn: () => window.engine.sellCommodity('gold',5) },
      {
        id:'pol_green',
        label:'Ativar política ecológica/verde',
        fn: () => {
          const s = window.engine.state;
          const greenPols = (window.GAME_DATA.policies || []).filter(p => p.cat === 'eco' || p.id.includes('green') || p.id.includes('eco'));
          const inactive = greenPols.find(p => !s.policies[p.id]);
          if (inactive) {
            window.engine.togglePolicy(inactive.id);
            window.ui?.showToast(`🤖 Diretriz ativou: ${inactive.name}`, 'info');
          }
        }
      },
      { id:'alert',       label:'Emitir alerta de crise',           fn: () => window.ui?.showToast('⚠️ Alerta por diretriz!','error') }
    ];

    // Verifica diretrizes a cada tick
    window.engine.subscribe((ev) => {
      if (ev === 'tick') this._evalDirectives();
    });
  }

  _evalDirectives() {
    const s = window.engine.state;
    const now = Date.now();
    (s.directives||[]).forEach(dir => {
      if (!dir.active) return;
      if (dir._lastTrigger && (now - dir._lastTrigger < 5000)) return; // Cooldown de 5s contra repetição contínua
      const cond = this._conditions.find(c => c.id === dir.conditionId);
      const act  = this._actions.find(a => a.id === dir.actionId);
      if (!cond || !act) return;
      if (cond.fn(s)) {
        dir._lastTrigger = now;
        try { act.fn(); } catch(e){}
      }
    });
  }

  render() {
    const s = window.engine.state;
    const list = document.getElementById('directives-list');
    if (!list) return;

    if (!s.directives || s.directives.length === 0) {
      list.innerHTML = `<div style="text-align:center;padding:16px;font-size:11px;color:var(--text-3)">
        🤖 Nenhuma diretriz criada.<br>Automatize sua economia abaixo!</div>`;
      return;
    }

    list.innerHTML = s.directives.map((dir, i) => {
      const cond = this._conditions.find(c => c.id === dir.conditionId);
      const act  = this._actions.find(a => a.id === dir.actionId);
      return `<div class="directive-card ${dir.active?'active':''}">
        <div class="directive-header">
          <div class="directive-name">🤖 Diretriz ${i+1}</div>
          <div style="display:flex;gap:6px">
            <button onclick="window.directivesUI.toggleDirective(${i})"
              style="background:${dir.active?'rgba(0,255,136,0.1)':'var(--bg-raised)'};
                border:1px solid ${dir.active?'var(--green)':'var(--border)'};
                border-radius:var(--r-sm);color:${dir.active?'var(--green)':'var(--text-3)'};
                font-size:9px;font-weight:800;padding:3px 8px;cursor:pointer">
              ${dir.active?'✅ ON':'○ OFF'}
            </button>
            <button onclick="window.directivesUI.removeDirective(${i})"
              style="background:var(--bg-raised);border:1px solid var(--border);
                border-radius:var(--r-sm);color:var(--red);font-size:9px;padding:3px 8px;cursor:pointer">
              🗑️
            </button>
          </div>
        </div>
        <div class="directive-if">SE: ${cond?.label||dir.conditionId}</div>
        <div class="directive-then">ENTÃO: ${act?.label||dir.actionId}</div>
      </div>`;
    }).join('');
  }

  openBuilder() {
    const body = document.getElementById('directive-builder-body');
    if (!body) return;

    body.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:14px;padding-bottom:16px">
        <div>
          <div style="font-size:10px;font-weight:800;color:var(--text-3);text-transform:uppercase;margin-bottom:8px">
            🔵 Condição (SE...)
          </div>
          <select id="dir-cond" style="width:100%;background:var(--bg-raised);border:1px solid var(--border);
            border-radius:var(--r-md);color:var(--text-1);font-size:12px;padding:10px;font-family:'Inter',sans-serif">
            ${this._conditions.map(c=>`<option value="${c.id}">${c.label}</option>`).join('')}
          </select>
        </div>
        <div>
          <div style="font-size:10px;font-weight:800;color:var(--text-3);text-transform:uppercase;margin-bottom:8px">
            🟢 Ação (ENTÃO...)
          </div>
          <select id="dir-act" style="width:100%;background:var(--bg-raised);border:1px solid var(--border);
            border-radius:var(--r-md);color:var(--text-1);font-size:12px;padding:10px;font-family:'Inter',sans-serif">
            ${this._actions.map(a=>`<option value="${a.id}">${a.label}</option>`).join('')}
          </select>
        </div>
        <button class="build-btn" onclick="window.directivesUI.saveDirective()">
          ✅ Criar Diretriz
        </button>
      </div>`;

    window.ui?.openModal('modal-directive');
  }

  saveDirective() {
    const condId = document.getElementById('dir-cond')?.value;
    const actId  = document.getElementById('dir-act')?.value;
    if (!condId || !actId) return;
    const s = window.engine.state;
    if (!s.directives) s.directives = [];
    s.directives.push({ conditionId:condId, actionId:actId, active:true });
    window.ui?.closeModal('modal-directive');
    window.ui?.showToast('🤖 Diretriz criada!', 'success');
    this.render();
  }

  toggleDirective(idx) {
    const dir = window.engine.state.directives[idx];
    if (dir) { dir.active = !dir.active; this.render(); }
  }

  removeDirective(idx) {
    window.engine.state.directives.splice(idx, 1);
    this.render();
    window.ui?.showToast('🗑️ Diretriz removida.', 'info');
  }
}

window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => { window.directivesUI = new DirectivesUI(); }, 150);
});
