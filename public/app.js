const state = {
  token: localStorage.getItem('dd_token') || null,
  player: null,
  socket: null,
  modals: {},
  matchTimer: null
};

const api = {
  async req(method, path, body) {
    const headers = { 'Content-Type': 'application/json' };
    if (state.token) headers.Authorization = `Bearer ${state.token}`;
    const res = await fetch(`/api${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'request_failed');
    return data;
  },
  get: (p) => api.req('GET', p),
  post: (p, b) => api.req('POST', p, b)
};

const fmt = {
  money(n) {
    n = Number(n) || 0;
    const abs = Math.abs(n);
    if (abs < 1000) return '$' + n.toFixed(0);
    const tiers = [
      [1e15, 'Qa'],
      [1e12, 'T'],
      [1e9, 'B'],
      [1e6, 'M'],
      [1e3, 'K']
    ];
    for (const [v, s] of tiers) if (abs >= v) return '$' + (n / v).toFixed(2) + s;
    return '$' + n.toFixed(0);
  },
  time(ts) {
    const d = Date.now() - ts;
    if (d < 60000) return 'agora';
    if (d < 3600000) return `${Math.floor(d / 60000)}min`;
    if (d < 86400000) return `${Math.floor(d / 3600000)}h`;
    return `${Math.floor(d / 86400000)}d`;
  }
};

function toast(msg, type = '') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  document.getElementById('toast-host').appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

const modalHost = document.getElementById('modal-host');
const modalFrame = document.getElementById('modal-frame');

function openModal(name) {
  const render = state.modals[name];
  if (!render) return;
  modalFrame.innerHTML = render();
  modalHost.classList.remove('hidden');
  modalHost.querySelectorAll('[data-close-modal]').forEach((b) => b.addEventListener('click', closeModal));
  modalFrame.querySelectorAll('[data-action]').forEach((b) => {
    b.addEventListener('click', () => handleModalAction(b.dataset.action, b.dataset));
  });
  if (typeof state.modals[`${name}:mount`] === 'function') state.modals[`${name}:mount`]();
}

function closeModal() {
  modalHost.classList.add('hidden');
  modalFrame.innerHTML = '';
}

async function handleModalAction(action, data) {
  try {
    if (action === 'join-bloc') {
      await api.post(`/blocs/${data.id}/join`);
      toast('Você entrou no bloco.', 'success');
      await refreshPlayer();
      closeModal();
    } else if (action === 'leave-bloc') {
      await api.post('/blocs/leave');
      toast('Você saiu do bloco.');
      await refreshPlayer();
      closeModal();
    } else if (action === 'create-bloc') {
      const name = prompt('Nome do bloco:');
      if (!name) return;
      await api.post('/blocs', { name, emoji: '🛡️' });
      toast('Bloco criado.', 'success');
      closeModal();
    } else if (action === 'queue-pvp') {
      const r = await api.post('/match/queue');
      toast(`Na fila (${r.size} aguardando)…`);
      closeModal();
    } else if (action === 'cancel-pvp') {
      await api.post('/match/cancel');
      toast('Cancelado.');
      closeModal();
    } else if (action === 'view-bloc') {
      openModal('bloc-detail');
    }
  } catch (e) {
    toast(translateErr(e.message), 'error');
  }
}

function translateErr(m) {
  const map = {
    username_taken: 'Este nome já existe.',
    invalid_credentials: 'Usuário ou senha incorretos.',
    username_invalid: 'Nome inválido (3-20 caracteres).',
    password_short: 'Senha muito curta (mínimo 6).',
    shield_active: 'Você tem escudo ativo (após ser atacado).',
    pvp_blocked: 'PvP bloqueado temporariamente.',
    already_in_match: 'Você já está em uma batalha.',
    already_in_bloc: 'Você já está em um bloco.',
    leave_first: 'Saia do bloco atual primeiro.',
    bloc_full: 'Bloco cheio.',
    bloc_name_taken: 'Nome de bloco já existe.'
  };
  return map[m] || m;
}

// ─── MODAIS ─────────────────────────────────────────
state.modals.profile = () => {
  const p = state.player;
  if (!p) return `<button class="modal-close" data-close-modal>×</button><h2>Perfil</h2><p class="sub">Entre para ver seu perfil.</p>`;
  return `
    <button class="modal-close" data-close-modal>×</button>
    <h2>${p.nation_emoji} ${p.nation_name}</h2>
    <p class="sub">@${p.username} • Doutrina: ${p.doctrine}</p>
    <div class="list">
      <div class="row"><div class="emoji">💰</div><div><div class="name">PIB Atual</div><div class="meta">Peak ${fmt.money(p.peak_gdp)}</div></div><div><span class="mono">${fmt.money(p.gdp)}</span></div></div>
      <div class="row"><div class="emoji">⭐</div><div><div class="name">Rating</div><div class="meta">Peak ${p.peak_rating}</div></div><div><span class="mono">${p.rating}</span></div></div>
      <div class="row"><div class="emoji">🏅</div><div><div class="name">Vitórias / Derrotas</div></div><div><span class="mono">${p.wins} / ${p.losses}</span></div></div>
      <div class="row"><div class="emoji">🌐</div><div><div class="name">Nível</div></div><div><span class="mono">${p.level}</span></div></div>
      <div class="row"><div class="emoji">🔁</div><div><div class="name">Resets (Nova Era)</div></div><div><span class="mono">${p.resets}</span></div></div>
      <div class="row"><div class="emoji">🏛️</div><div><div class="name">Legado</div></div><div><span class="mono">${fmt.money(p.legacy)}</span></div></div>
    </div>
  `;
};

state.modals.blocs = () => `
  <button class="modal-close" data-close-modal>×</button>
  <h2>Blocos Internacionais</h2>
  <p class="sub">Alianças estratégicas com efeitos econômicos e militares.</p>
  <div id="blocs-content" class="blocs-grid"><p class="mono">Carregando…</p></div>
  <div style="margin-top:16px;display:flex;gap:8px;flex-wrap:wrap">
    <button class="cta-primary" data-action="create-bloc">+ Fundar Bloco</button>
    <button class="cta-secondary" data-action="leave-bloc">Sair do Bloco Atual</button>
  </div>
`;

state.modals['blocs:mount'] = async () => {
  const { blocs } = await api.get('/blocs');
  const me = state.player;
  const host = document.getElementById('blocs-content');
  if (!host) return;
  host.innerHTML = blocs
    .map(
      (b) => `
    <div class="bloc-card">
      <div class="head">
        <span class="emblem">${b.emoji}</span>
        <span class="name">${b.name}</span>
      </div>
      <div class="desc">${b.description || '—'}</div>
      <div class="stats">
        <span>Poder <b>${Math.round(b.power)}</b></span>
        <span>Membros <b>${b.members}</b></span>
      </div>
      ${
        me?.bloc_id === b.id
          ? '<button class="cta-secondary" disabled>✓ Você é membro</button>'
          : `<button class="cta-primary" data-action="join-bloc" data-id="${b.id}">Entrar</button>`
      }
    </div>
  `
    )
    .join('');
};

state.modals.ranking = () => `
  <button class="modal-close" data-close-modal>×</button>
  <h2>Ranking Global</h2>
  <p class="sub">Top 100 por Rating e por PIB. Atualizado em tempo real.</p>
  <div id="rank-content" class="list"><p class="mono">Carregando…</p></div>
`;

state.modals['ranking:mount'] = async () => {
  const [rating, gdp] = await Promise.all([
    api.get('/leaderboard/rating'),
    api.get('/leaderboard/gdp')
  ]);
  const host = document.getElementById('rank-content');
  if (!host) return;
  host.innerHTML = `
    <h3 style="margin:14px 0 8px;font-weight:900">🏆 Top Rating</h3>
    ${rating.rows
      .slice(0, 20)
      .map(
        (r, i) => `
      <div class="rank-row">
        <div class="pos top${i + 1}">#${i + 1}</div>
        <div>${r.nation_emoji}</div>
        <div><div class="player">${r.nation_name}</div><div class="meta">@${r.username}</div></div>
        <div class="value">${r.rating}</div>
      </div>
    `
      )
      .join('')}
    <h3 style="margin:18px 0 8px;font-weight:900">💰 Top PIB</h3>
    ${gdp.rows
      .slice(0, 20)
      .map(
        (r, i) => `
      <div class="rank-row">
        <div class="pos top${i + 1}">#${i + 1}</div>
        <div>${r.nation_emoji}</div>
        <div><div class="player">${r.nation_name}</div><div class="meta">@${r.username}</div></div>
        <div class="value">${fmt.money(r.peak_gdp)}</div>
      </div>
    `
      )
      .join('')}
  `;
};

state.modals.pvp = () => `
  <button class="modal-close" data-close-modal>×</button>
  <h2>Arena PvP</h2>
  <p class="sub">Enfrente outra nação. Vence quem tiver mais poder. O perdedor perde até 15% do PIB.</p>
  <div class="pvp-box">
    <h3>⚔️ Entrar em Fila</h3>
    <p>Matchmaking por rating (±150 inicial, amplia com tempo).</p>
    <button class="cta-primary" data-action="queue-pvp">Entrar na Fila</button>
    <button class="cta-secondary" data-action="cancel-pvp" style="margin-left:8px">Cancelar</button>
  </div>
  <h3 style="margin-top:24px;font-weight:900">Histórico Recente</h3>
  <div id="pvp-history" class="list"><p class="mono">Carregando…</p></div>
`;

state.modals['pvp:mount'] = async () => {
  try {
    const { matches } = await api.get('/match/history');
    const host = document.getElementById('pvp-history');
    if (!host) return;
    if (matches.length === 0) {
      host.innerHTML = '<p class="mono" style="color:var(--muted)">Sem partidas ainda.</p>';
      return;
    }
    host.innerHTML = matches
      .map((m) => {
        const won = m.winner_id === state.player.id;
        return `
        <div class="row">
          <div class="emoji">${won ? '🏆' : '💀'}</div>
          <div>
            <div class="name">${m.attacker_name} vs ${m.defender_name}</div>
            <div class="meta">${fmt.time(m.created_at)} atrás • ${won ? 'Vitória' : 'Derrota'} • +${fmt.money(m.stolen_gdp)}</div>
          </div>
        </div>
      `;
      })
      .join('');
  } catch {}
};

state.modals.market = () => `
  <button class="modal-close" data-close-modal>×</button>
  <h2>Mercado Global</h2>
  <p class="sub">Preços agregados de todas as nações online.</p>
  <p class="mono" style="color:var(--muted);padding:24px;text-align:center;border:2px dashed var(--border);border-radius:14px">Em breve: preços em tempo real baseados na produção agregada de todos os jogadores online.</p>
`;

state.modals.world = () => `
  <button class="modal-close" data-close-modal>×</button>
  <h2>Mundo</h2>
  <p class="sub">Eventos globais, crises, temporadas e atualizações.</p>
  <div id="events-content" class="list"><p class="mono">Carregando…</p></div>
`;

state.modals['world:mount'] = async () => {
  const { events } = await api.get('/events');
  const host = document.getElementById('events-content');
  if (!host) return;
  if (events.length === 0) {
    host.innerHTML = '<p class="mono" style="color:var(--muted)">Sem eventos ainda.</p>';
    return;
  }
  host.innerHTML = events
    .map(
      (e) => `
    <div class="row">
      <div class="emoji">${e.nation_emoji || '📰'}</div>
      <div>
        <div class="name">${e.type.replace(/_/g, ' ')}</div>
        <div class="meta">${e.player_name ? '@' + e.player_name + ' • ' : ''}${fmt.time(e.created_at)}</div>
      </div>
    </div>
  `
    )
    .join('');
};

// ─── NAV ────────────────────────────────────────────
document.querySelectorAll('[data-modal]').forEach((btn) => {
  btn.addEventListener('click', () => openModal(btn.dataset.modal));
});

// ─── AUTH ───────────────────────────────────────────
let authMode = 'login';
document.querySelectorAll('.auth-tabs button').forEach((b) => {
  b.addEventListener('click', () => {
    authMode = b.dataset.auth;
    document.querySelectorAll('.auth-tabs button').forEach((x) => x.classList.toggle('active', x === b));
    document.getElementById('register-extra').classList.toggle('hidden', authMode !== 'register');
    document.getElementById('auth-submit').textContent = authMode === 'register' ? 'Fundar Nação' : 'Entrar';
  });
});

document.getElementById('auth-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const errEl = document.getElementById('auth-error');
  errEl.textContent = '';
  const btn = document.getElementById('auth-submit');
  btn.disabled = true;

  try {
    const path = authMode === 'register' ? '/auth/register' : '/auth/login';
    const body = {
      username: fd.get('username'),
      password: fd.get('password')
    };
    if (authMode === 'register') {
      body.nationName = fd.get('nationName') || fd.get('username');
      body.doctrine = fd.get('doctrine') || 'neutral';
    }
    const r = await api.post(path, body);
    state.token = r.token;
    localStorage.setItem('dd_token', r.token);
    state.player = r.player;
    onAuthenticated();
  } catch (err) {
    errEl.textContent = translateErr(err.message);
  } finally {
    btn.disabled = false;
  }
});

document.getElementById('logout-btn')?.addEventListener('click', () => {
  state.token = null;
  state.player = null;
  localStorage.removeItem('dd_token');
  location.reload();
});

// ─── SESSION ────────────────────────────────────────
async function refreshPlayer() {
  if (!state.token) return;
  try {
    const r = await api.get('/player/me');
    state.player = r.player;
    renderDashboard();
  } catch {
    logout();
  }
}

function logout() {
  state.token = null;
  state.player = null;
  localStorage.removeItem('dd_token');
  document.getElementById('auth-panel').classList.remove('hidden');
  document.getElementById('dash-panel').classList.add('hidden');
  document.getElementById('feed').classList.add('hidden');
}

function renderDashboard() {
  const p = state.player;
  if (!p) return;
  document.getElementById('auth-panel').classList.add('hidden');
  document.getElementById('dash-panel').classList.remove('hidden');
  document.getElementById('feed').classList.remove('hidden');
  document.getElementById('dash-gdp').textContent = fmt.money(p.gdp);
  document.getElementById('dash-level').textContent = p.level;
  document.getElementById('dash-rating').textContent = p.rating;
  document.getElementById('dash-bloc').textContent = p.bloc_id ? 'Membro' : '—';
}

// ─── SOCKET ─────────────────────────────────────────
function connectSocket() {
  if (!state.token || state.socket) return;
  state.socket = io({ auth: { token: state.token } });
  state.socket.on('connect', () => console.log('socket connected'));
  state.socket.on('server:stats', (s) => {
    const b = document.getElementById('online-badge');
    const count = s.p !== undefined ? s.p : (s.playersOnline !== undefined ? s.playersOnline : 0);
    if (b) b.textContent = `● ${count} online`;
  });
  state.socket.on('match:start', (m) => {
    document.getElementById('match-overlay').classList.remove('hidden');
    document.getElementById('match-opp').textContent = `${m.opponent.emoji} ${m.opponent.nation}`;
    document.getElementById('match-status').textContent = '20s para resolução…';
    document.getElementById('match-bar').style.width = '0%';
    let t = 0;
    clearInterval(state.matchTimer);
    state.matchTimer = setInterval(() => {
      t += 0.5;
      document.getElementById('match-bar').style.width = Math.min(100, (t / 20) * 100) + '%';
      if (t >= 20) clearInterval(state.matchTimer);
    }, 500);
  });
  state.socket.on('match:resolved', (r) => {
    clearInterval(state.matchTimer);
    const won = r.winnerId === state.player.id;
    document.getElementById('match-status').textContent =
      (won ? '🏆 Vitória! ' : '💀 Derrota. ') + `Roubado: ${fmt.money(r.stolen)}`;
    setTimeout(() => {
      document.getElementById('match-overlay').classList.add('hidden');
      refreshPlayer();
    }, 3500);
  });
  state.socket.on('bloc:chat', (msg) => {
    const feed = document.getElementById('feed-list');
    if (!feed) return;
    const li = document.createElement('li');
    li.className = 'row';
    li.innerHTML = `<div class="emoji">${msg.emoji}</div><div><div class="name">${msg.nation} · @${msg.from}</div><div class="meta">${msg.text}</div></div>`;
    feed.prepend(li);
  });
  state.socket.on('notification', (n) => toast(n.title, 'info'));
}

async function onAuthenticated() {
  renderDashboard();
  connectSocket();
  toast('Bem-vindo.', 'success');
  try {
    const { events } = await api.get('/events');
    const feed = document.getElementById('feed-list');
    if (feed) {
      feed.innerHTML = events
        .slice(0, 10)
        .map(
          (e) => `
        <li class="row">
          <div class="emoji">${e.nation_emoji || '📰'}</div>
          <div><div class="name">${e.type.replace(/_/g, ' ')}</div><div class="meta">${e.player_name ? '@' + e.player_name : ''} ${fmt.time(e.created_at)}</div></div>
        </li>
      `
        )
        .join('');
    }
  } catch {}
}

// ─── BOOT ───────────────────────────────────────────
(async function boot() {
  if (state.token) {
    await refreshPlayer();
    if (state.player) await onAuthenticated();
    else logout();
  }
})();
