/**
 * GEOPOLITICS EMPIRE 2026 — Minigames (Among Us Style)
 * 6 Tarefas Táticas: Reactor, Swipe Card, Wire Connect,
 * Asteroids Dodge, Data Download, Council Vote
 */

class MinigamesUI {
  constructor() {
    window.minigamesUI = this;
    this.activeGame = null;
    this.score = 0;
    this.timer = null;
    this.timeLeft = 30;
    this.gameInterval = null;
  }

  start(gameId) {
    this.activeGame = gameId;
    this.score = 0;
    this.timeLeft = 30;

    const mg = window.GAME_DATA.minigames.find(m => m.id === gameId);
    if (!mg) return;

    document.getElementById('mg-modal-title').textContent = mg.icon + ' ' + mg.name;
    document.getElementById('mg-modal-desc').textContent  = mg.desc;

    const content = document.getElementById('minigame-content');
    content.innerHTML = '';

    switch(gameId) {
      case 'reactor':   this._buildReactor(content); break;
      case 'swipe':     this._buildSwipe(content);   break;
      case 'wires':     this._buildWires(content);   break;
      case 'asteroids': this._buildAsteroids(content); break;
      case 'download':  this._buildDownload(content); break;
      case 'vote':      this._buildVote(content);    break;
    }

    window.ui.openModal('modal-minigame');
    this._startTimer();
  }

  _startTimer() {
    clearInterval(this.timer);
    this.timeLeft = 30;
    this.timer = setInterval(() => {
      this.timeLeft--;
      const fill = document.getElementById('mg-timer-fill');
      if (fill) fill.style.width = (this.timeLeft/30*100) + '%';
      if (this.timeLeft <= 0) {
        clearInterval(this.timer);
        this._endGame(false, 'Tempo esgotado!');
      }
    }, 1000);
  }

  _endGame(won, msg) {
    clearInterval(this.timer);
    clearInterval(this.gameInterval);
    const finalScore = won ? Math.max(10, Math.min(100, Math.round((this.timeLeft/30)*100))) : 10;
    const reward = window.engine.completeMiniGame(this.activeGame, finalScore);

    const content = document.getElementById('minigame-content');
    content.innerHTML = `
      <div style="text-align:center;padding:24px 20px">
        <div style="font-size:60px;margin-bottom:16px">${won ? '🎉' : '😔'}</div>
        <div style="font-family:'Orbitron',sans-serif;font-size:18px;font-weight:900;
          color:${won?'var(--green)':'var(--red)'};margin-bottom:8px">
          ${won ? 'MISSÃO COMPLETA!' : 'MISSÃO FALHOU'}
        </div>
        <div style="font-size:13px;color:var(--text-3);margin-bottom:20px">${msg}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px">
          <div style="background:var(--bg-raised);border-radius:var(--r-md);padding:12px">
            <div style="font-family:'JetBrains Mono',monospace;font-size:20px;font-weight:800;color:var(--gold)">${finalScore}%</div>
            <div style="font-size:9px;color:var(--text-3);text-transform:uppercase;margin-top:2px">Desempenho</div>
          </div>
          <div style="background:var(--bg-raised);border-radius:var(--r-md);padding:12px">
            <div style="font-family:'JetBrains Mono',monospace;font-size:20px;font-weight:800;color:var(--green)">${window.engine.fmt(reward.bonus)}</div>
            <div style="font-size:9px;color:var(--text-3);text-transform:uppercase;margin-top:2px">Recompensa</div>
          </div>
        </div>
        <div style="display:flex;gap:10px">
          <button class="build-btn" onclick="window.minigamesUI.start('${this.activeGame}')" style="flex:1">
            🔄 Jogar Novamente
          </button>
          <button class="build-btn" onclick="window.ui.closeModal('modal-minigame')" 
            style="flex:1;border-color:var(--text-3);color:var(--text-3);background:var(--bg-raised)">
            ✅ Fechar
          </button>
        </div>
      </div>`;
  }

  // ─────────────────────────────────────
  // 1. CONSERTAR REATOR (Match symbols)
  // ─────────────────────────────────────
  _buildReactor(container) {
    const symbols = ['⚡','🔥','💧','🌊','☢️','⚛️','🌪️','🌡️','🔋'];
    const sequence = [];
    for (let i=0;i<4;i++) sequence.push(symbols[Math.floor(Math.random()*symbols.length)]);
    let step = 0;

    container.innerHTML = `
      <div class="minigame-container">
        <div class="mg-title" style="color:var(--red)">⚛️ REATOR CRÍTICO</div>
        <div style="width:100%">
          <div class="mg-timer-bar"><div class="mg-timer-fill" id="mg-timer-fill" style="width:100%"></div></div>
        </div>
        <div style="text-align:center;margin:8px 0">
          <div style="font-size:11px;color:var(--text-3);margin-bottom:8px">SEQUÊNCIA DE ATIVAÇÃO:</div>
          <div style="display:flex;gap:10px;justify-content:center;font-size:30px">
            ${sequence.map((s,i)=>`<span id="seq-${i}" style="opacity:${i===0?1:0.3};transition:opacity 0.2s">${s}</span>`).join('')}
          </div>
        </div>
        <div style="font-size:11px;color:var(--green);text-align:center" id="reactor-status">
          Toque o símbolo correto: <strong>${sequence[0]}</strong>
        </div>
        <div class="reactor-grid">
          ${this._shuffled(symbols.slice(0,9)).map(sym => `
            <div class="reactor-panel" onclick="window.minigamesUI._reactorTap('${sym}')">
              ${sym}
            </div>`).join('')}
        </div>
      </div>`;

    this._reactorSequence = sequence;
    this._reactorStep = 0;
  }

  _reactorTap(sym) {
    const seq = this._reactorSequence;
    const step = this._reactorStep;
    const panels = document.querySelectorAll('.reactor-panel');
    const correctPanel = [...panels].find(p => p.textContent.trim() === sym);

    if (sym === seq[step]) {
      if (correctPanel) { correctPanel.classList.add('lit'); }
      this._reactorStep++;
      this.score += 25;
      const seqEl = document.getElementById(`seq-${step}`);
      if (seqEl) { seqEl.style.opacity='1'; seqEl.style.filter='drop-shadow(0 0 8px var(--green))'; }

      const nextEl = document.getElementById(`seq-${step+1}`);
      if (nextEl) nextEl.style.opacity = '1';

      const status = document.getElementById('reactor-status');
      if (this._reactorStep >= seq.length) {
        clearInterval(this.timer);
        this._endGame(true, 'Reator estabilizado com sucesso!');
      } else {
        if (status) status.innerHTML = `Toque o símbolo correto: <strong>${seq[this._reactorStep]}</strong>`;
      }
    } else {
      if (correctPanel) { correctPanel.classList.add('wrong'); setTimeout(()=>correctPanel.classList.remove('wrong'),300); }
      this.timeLeft = Math.max(1, this.timeLeft - 3);
      window.engine.sound.crisis();
      const status = document.getElementById('reactor-status');
      if (status) { status.style.color='var(--red)'; status.textContent='❌ Errado! -3 segundos'; setTimeout(()=>{ if(status){ status.style.color='var(--green)'; status.textContent=`Toque: ${seq[this._reactorStep]}`; } },600); }
    }
  }

  // ─────────────────────────────────────
  // 2. PASSAR CREDENCIAL (Swipe Speed)
  // ─────────────────────────────────────
  _buildSwipe(container) {
    container.innerHTML = `
      <div class="minigame-container">
        <div class="mg-title" style="color:var(--blue)">💳 ACESSO RESTRITO</div>
        <div style="width:100%">
          <div class="mg-timer-bar"><div class="mg-timer-fill" id="mg-timer-fill" style="width:100%"></div></div>
        </div>
        <div style="font-size:11px;color:var(--text-3);text-align:center">
          Deslize o cartão pela fenda na velocidade correta
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:20px;padding:16px 0">
          <div class="swipe-card-slot">
            <div class="swipe-marker"></div>
          </div>
          <div class="swipe-card-visual" id="swipe-card">🪪</div>
        </div>
        <div style="text-align:center;font-size:11px;color:var(--text-3)" id="swipe-hint">
          👆 Deslize o cartão para a direita na zona verde
        </div>
        <div style="text-align:center;margin-top:8px">
          <div class="mg-score" id="swipe-score">0</div>
          <div style="font-size:9px;color:var(--text-3)">pontos</div>
        </div>
        <button class="build-btn" id="swipe-btn" onclick="window.minigamesUI._doSwipe()">
          ➡️ PASSAR CARTÃO
        </button>
      </div>`;

    this._swipeCount = 0;
    this._swipeTarget = 3;
  }

  _doSwipe() {
    const card = document.getElementById('swipe-card');
    const hint = document.getElementById('swipe-hint');
    const scoreEl = document.getElementById('swipe-score');
    const speed = Math.random(); // 0-1

    if (card) {
      card.style.transform = 'translateX(120px) rotate(5deg)';
      setTimeout(() => card.style.transform = '', 300);
    }

    if (speed > 0.25 && speed < 0.75) {
      // Perfect zone
      this._swipeCount++;
      this.score += 33;
      if (hint) { hint.style.color='var(--green)'; hint.textContent='✅ Velocidade perfeita!'; }
      window.engine.sound.coin();
    } else if (speed < 0.25) {
      if (hint) { hint.style.color='var(--gold)'; hint.textContent='⚡ Muito rápido! Tente mais devagar.'; }
    } else {
      if (hint) { hint.style.color='var(--red)'; hint.textContent='🐢 Muito lento! Deslize mais rápido.'; }
    }

    if (scoreEl) scoreEl.textContent = this.score;
    setTimeout(() => { if(hint) hint.style.color = ''; }, 800);

    if (this._swipeCount >= this._swipeTarget) {
      clearInterval(this.timer);
      this._endGame(true, `${this._swipeTarget} acessos validados!`);
    }
  }

  // ─────────────────────────────────────
  // 3. CONECTAR FIOS (Wire Matching)
  // ─────────────────────────────────────
  _buildWires(container) {
    const colors = ['#FF4444','#4ADE80','#FACC15','#3B82F6'];
    const colorNames = {
      '#FF4444':'Vermelho','#4ADE80':'Verde',
      '#FACC15':'Amarelo','#3B82F6':'Azul'
    };
    const shuffledRight = this._shuffled([...colors]);
    this._wireConnections = {};
    this._wireSelected = null;

    container.innerHTML = `
      <div class="minigame-container" style="gap:12px">
        <div class="mg-title" style="color:var(--green)">🔌 CONEXÃO DE FIOS</div>
        <div style="width:100%">
          <div class="mg-timer-bar"><div class="mg-timer-fill" id="mg-timer-fill" style="width:100%"></div></div>
        </div>
        <div style="font-size:11px;color:var(--text-3);text-align:center">
          Toque um fio da esquerda, depois o correspondente da direita
        </div>
        <div style="display:flex;justify-content:space-between;width:100%;padding:0 16px;gap:10px">
          <div style="display:flex;flex-direction:column;gap:16px">
            ${colors.map((c,i) => `
              <div class="wire-dot" id="wl-${i}" style="border-color:${c};background:${c}22"
                onclick="window.minigamesUI._wireSelectLeft(${i},'${c}')">
                ${i+1}
              </div>`).join('')}
          </div>
          <div style="flex:1;position:relative;display:flex;align-items:center;justify-content:center">
            <svg id="wire-svg" style="position:absolute;inset:0;width:100%;height:100%"></svg>
            <div style="font-size:10px;color:var(--text-3)">━━━</div>
          </div>
          <div style="display:flex;flex-direction:column;gap:16px">
            ${shuffledRight.map((c,i) => `
              <div class="wire-dot" id="wr-${i}" style="border-color:${c};background:${c}22"
                onclick="window.minigamesUI._wireSelectRight(${i},'${c}')">
                ${String.fromCharCode(65+i)}
              </div>`).join('')}
          </div>
        </div>
        <div style="text-align:center;font-size:11px" id="wire-status">
          Selecione um fio esquerdo para começar
        </div>
        <div class="mg-score" id="wire-score">0</div>
      </div>`;

    this._wireColors = colors;
    this._wireRight  = shuffledRight;
    this._wireMatched = 0;
  }

  _wireSelectLeft(idx, color) {
    this._wireSelected = { side:'left', idx, color };
    document.querySelectorAll('[id^="wl-"]').forEach(el => el.style.boxShadow='');
    const el = document.getElementById('wl-' + idx);
    if (el) el.style.boxShadow = `0 0 12px ${color}`;
    const status = document.getElementById('wire-status');
    if (status) status.textContent = `Fio ${idx+1} selecionado. Conecte ao correspondente →`;
  }

  _wireSelectRight(idx, color) {
    if (!this._wireSelected || this._wireSelected.side !== 'left') {
      const status = document.getElementById('wire-status');
      if (status) status.textContent = 'Selecione primeiro um fio da esquerda!';
      return;
    }
    const sel = this._wireSelected;
    if (sel.color === color) {
      // Match!
      this._wireMatched++;
      this.score += 25;
      const scoreEl = document.getElementById('wire-score');
      if (scoreEl) scoreEl.textContent = this.score;
      const lEl = document.getElementById('wl-' + sel.idx);
      const rEl = document.getElementById('wr-' + idx);
      if (lEl) { lEl.style.opacity='0.4'; lEl.style.borderColor='var(--green)'; lEl.onclick=null; }
      if (rEl) { rEl.style.opacity='0.4'; rEl.style.borderColor='var(--green)'; rEl.onclick=null; }
      window.engine.sound.coin();
      const status = document.getElementById('wire-status');
      if (status) status.textContent = `✅ Correto! ${4-this._wireMatched} fios restantes.`;
      this._wireSelected = null;

      if (this._wireMatched >= 4) {
        clearInterval(this.timer);
        this._endGame(true, 'Todos os circuitos conectados!');
      }
    } else {
      window.engine.sound.crisis();
      const status = document.getElementById('wire-status');
      if (status) { status.style.color='var(--red)'; status.textContent='❌ Fio errado! -3 segundos'; }
      this.timeLeft = Math.max(1, this.timeLeft - 3);
      setTimeout(() => { if(status) { status.style.color=''; status.textContent='Tente novamente.'; } }, 600);
    }
  }

  // ─────────────────────────────────────
  // 4. DESVIAR DE ASTEROIDES
  // ─────────────────────────────────────
  _buildAsteroids(container) {
    container.innerHTML = `
      <div class="minigame-container" style="gap:10px">
        <div class="mg-title" style="color:var(--gold)">☄️ CHUVA DE DETRITOS</div>
        <div style="width:100%">
          <div class="mg-timer-bar"><div class="mg-timer-fill" id="mg-timer-fill" style="width:100%"></div></div>
        </div>
        <div style="font-size:11px;color:var(--text-3);text-align:center">
          Toque nos asteróides para destruí-los antes de atingir a base!
        </div>
        <div class="asteroid-arena" id="asteroid-arena">
          <div style="position:absolute;bottom:15px;left:50%;transform:translateX(-50%);font-size:28px">🚀</div>
        </div>
        <div style="display:flex;justify-content:space-between;width:100%">
          <div style="font-size:11px;color:var(--text-3)">Destruídos: <span id="ast-count" style="color:var(--green);font-weight:800">0</span></div>
          <div class="mg-score" id="ast-score" style="font-size:18px">0</div>
        </div>
      </div>`;

    this._asteroidCount = 0;
    this._asteroidInterval = null;
    this._spawnAsteroids();
  }

  _spawnAsteroids() {
    const arena = document.getElementById('asteroid-arena');
    if (!arena) return;
    const symbols = ['☄️','🪨','💥','🌑','⚫'];
    let spawned = 0;

    this._asteroidInterval = setInterval(() => {
      if (!document.getElementById('asteroid-arena')) {
        clearInterval(this._asteroidInterval); return;
      }
      const ast = document.createElement('div');
      ast.className = 'asteroid-obj';
      ast.textContent = symbols[Math.floor(Math.random()*symbols.length)];
      ast.style.left = (Math.random()*80+5) + '%';
      ast.style.top = '-40px';
      const speed = 3 + Math.random()*3;
      ast.style.animationDuration = speed + 's';

      ast.onclick = () => {
        ast.textContent = '💥';
        ast.style.transform = 'scale(1.5)';
        setTimeout(()=>ast.remove(), 300);
        this._asteroidCount++;
        this.score = Math.min(100, this.score + 10);
        const countEl = document.getElementById('ast-count');
        const scoreEl = document.getElementById('ast-score');
        if (countEl) countEl.textContent = this._asteroidCount;
        if (scoreEl) scoreEl.textContent = this.score;
        window.engine.sound.coin();
      };

      arena.appendChild(ast);
      setTimeout(() => { if(ast.parentNode) ast.remove(); }, speed*1000);
      spawned++;
      if (spawned >= 20) clearInterval(this._asteroidInterval);
    }, 800);

    // Override timer end
    setTimeout(() => {
      clearInterval(this._asteroidInterval);
    }, 28000);
  }

  // ─────────────────────────────────────
  // 5. DOWNLOAD DE INTELIGÊNCIA
  // ─────────────────────────────────────
  _buildDownload(container) {
    container.innerHTML = `
      <div class="minigame-container" style="gap:12px">
        <div class="mg-title" style="color:var(--purple)">📡 DOWNLOAD CRÍTICO</div>
        <div style="width:100%">
          <div class="mg-timer-bar"><div class="mg-timer-fill" id="mg-timer-fill" style="width:100%"></div></div>
        </div>
        <div style="font-size:11px;color:var(--text-3);text-align:center">
          Mantenha o cursor <strong style="color:var(--green)">dentro da zona verde</strong> pressionando o botão!
        </div>
        <div class="download-zone">
          <div class="download-track" id="dl-track">
            <div class="download-green-zone" id="dl-zone" style="left:30%;width:40%"></div>
            <div class="download-cursor" id="dl-cursor" style="left:10%"></div>
          </div>
        </div>
        <div style="text-align:center">
          <div style="font-size:11px;color:var(--text-3);margin-bottom:8px">Downloads concluídos:</div>
          <div class="mg-score" id="dl-score">0</div>
        </div>
        <div style="display:flex;gap:8px">
          <button class="build-btn" id="dl-btn"
            onpointerdown="window.minigamesUI._dlStart()"
            onpointerup="window.minigamesUI._dlStop()">
            ⬇️ SEGURAR para Baixar
          </button>
        </div>
        <div style="font-size:11px;text-align:center" id="dl-status">Aguardando...</div>
      </div>`;

    this._dlPos = 10;
    this._dlDir = 1;
    this._dlHeld = false;
    this._dlProgress = 0;
    this._dlCompleted = 0;
    this._dlZoneLeft = 30;
    this._dlZoneRight = 70;

    // Move cursor
    this._dlMoveInterval = setInterval(() => {
      const cursor = document.getElementById('dl-cursor');
      if (!cursor) { clearInterval(this._dlMoveInterval); return; }

      this._dlPos += this._dlDir * (1.5 + Math.random());
      if (this._dlPos >= 95) this._dlDir = -1;
      if (this._dlPos <= 5)  this._dlDir = 1;
      cursor.style.left = this._dlPos + '%';

      const inZone = this._dlPos >= this._dlZoneLeft && this._dlPos <= this._dlZoneRight;
      cursor.style.background = inZone ? 'var(--green)' : 'var(--red)';

      if (this._dlHeld && inZone) {
        this._dlProgress += 5;
        const status = document.getElementById('dl-status');
        if (status) { status.style.color='var(--green)'; status.textContent=`⬇️ Baixando... ${Math.min(100,this._dlProgress)}%`; }

        if (this._dlProgress >= 100) {
          this._dlProgress = 0;
          this._dlCompleted++;
          this.score = Math.min(100, this._dlCompleted * 33);
          const scoreEl = document.getElementById('dl-score');
          if (scoreEl) scoreEl.textContent = this.score;
          window.engine.sound.coin();
          // Move zone
          this._dlZoneLeft = 20 + Math.random()*50;
          this._dlZoneRight = this._dlZoneLeft + 30;
          const zone = document.getElementById('dl-zone');
          if (zone) { zone.style.left=this._dlZoneLeft+'%'; zone.style.width='30%'; }

          if (this._dlCompleted >= 3) {
            clearInterval(this._dlMoveInterval);
            clearInterval(this.timer);
            this._endGame(true, '3 pacotes baixados com sucesso!');
          }
        }
      } else if (this._dlHeld && !inZone) {
        this._dlProgress = Math.max(0, this._dlProgress - 2);
        const status = document.getElementById('dl-status');
        if (status) { status.style.color='var(--red)'; status.textContent='❌ Fora da zona! Mova o cursor.'; }
      }
    }, 50);
  }

  _dlStart() { this._dlHeld = true; }
  _dlStop()  {
    this._dlHeld = false;
    const status = document.getElementById('dl-status');
    if (status) { status.style.color=''; status.textContent='Solto. Segure na zona verde.'; }
  }

  // ─────────────────────────────────────
  // 6. VOTO NO CONSELHO
  // ─────────────────────────────────────
  _buildVote(container) {
    const proposals = [
      { title:'🛢️ Sanções ao Consórcio de Petróleo', pro:'Reduz dependência externa', con:'Provoca retaliações comerciais', correct:'aprovar' },
      { title:'🤝 Tratado de Livre Comércio BRICS+',  pro:'+30% renda de exportações', con:'Competição com indústria local',  correct:'aprovar' },
      { title:'⚔️ Mobilização Militar nas Fronteiras', pro:'Disuasão garantida',        con:'Crise diplomática imediata',      correct:'vetar' },
      { title:'🌿 Acordo de Descarbonização Global',  pro:'+Créditos de carbono',       con:'Custo de R$200B para adaptação', correct:'aprovar' },
      { title:'💻 Monopólio do Estado em Big Tech',   pro:'Soberania digital',          con:'Fuga de investimentos externos',  correct:'vetar' }
    ];
    const proposal = proposals[Math.floor(Math.random()*proposals.length)];
    this._voteCorrect = proposal.correct;
    this._votesLeft = 3;

    container.innerHTML = `
      <div class="minigame-container" style="gap:12px">
        <div class="mg-title" style="color:var(--gold)">🗳️ SESSÃO DO CONSELHO</div>
        <div style="width:100%">
          <div class="mg-timer-bar"><div class="mg-timer-fill" id="mg-timer-fill" style="width:100%"></div></div>
        </div>
        <div style="font-size:11px;color:var(--text-3);text-align:center">
          Vote estrategicamente: <strong style="color:var(--gold)">${this._votesLeft} propostas</strong> para analisar
        </div>
        <div class="vote-proposal" id="vote-proposal">
          <div class="vote-proposal-title">${proposal.title}</div>
          <div class="vote-proposal-desc">
            ✅ A favor: ${proposal.pro}<br>
            ❌ Contra: ${proposal.con}
          </div>
        </div>
        <div class="vote-buttons">
          <button class="vote-yes" onclick="window.minigamesUI._castVote('aprovar')">
            ✅ APROVAR
          </button>
          <button class="vote-no"  onclick="window.minigamesUI._castVote('vetar')">
            ❌ VETAR
          </button>
        </div>
        <div style="text-align:center;font-size:11px" id="vote-status">Analise e vote!</div>
        <div class="mg-score" id="vote-score">0</div>
      </div>`;

    this._voteProposals = proposals;
    this._voteIdx = 0;
  }

  _castVote(choice) {
    const correct = this._voteCorrect;
    const status  = document.getElementById('vote-status');

    if (choice === correct) {
      this.score += 33;
      if (status) { status.style.color='var(--green)'; status.textContent='✅ Voto estratégico correto! +33 pts'; }
      window.engine.sound.coin();
    } else {
      if (status) { status.style.color='var(--red)'; status.textContent='❌ Decisão equivocada! Perdeu pontos.'; }
      this.score = Math.max(0, this.score - 10);
      window.engine.sound.crisis();
    }

    const scoreEl = document.getElementById('vote-score');
    if (scoreEl) scoreEl.textContent = this.score;

    this._votesLeft--;
    this._voteIdx++;

    if (this._votesLeft <= 0) {
      clearInterval(this.timer);
      this._endGame(true, `Sessão do Conselho encerrada. Pontuação: ${this.score}`);
      return;
    }

    // Next proposal
    setTimeout(() => {
      const proposals = this._voteProposals;
      if (this._voteIdx < proposals.length) {
        const p = proposals[this._voteIdx];
        this._voteCorrect = p.correct;
        const propEl = document.getElementById('vote-proposal');
        if (propEl) propEl.innerHTML = `
          <div class="vote-proposal-title">${p.title}</div>
          <div class="vote-proposal-desc">
            ✅ A favor: ${p.pro}<br>
            ❌ Contra: ${p.con}
          </div>`;
        if (status) { status.style.color=''; status.textContent=`Analise e vote! ${this._votesLeft} propostas restantes.`; }
      }
    }, 1200);
  }

  // ─────────────────────────────────────
  // UTILS
  // ─────────────────────────────────────
  _shuffled(arr) {
    const a = [...arr];
    for (let i=a.length-1;i>0;i--) {
      const j = Math.floor(Math.random()*(i+1));
      [a[i],a[j]] = [a[j],a[i]];
    }
    return a;
  }
}

// Boot
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => { window.minigamesUI = new MinigamesUI(); }, 200);
});
