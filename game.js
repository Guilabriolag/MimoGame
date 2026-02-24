/* ════════════════════════════════════════════════
   MIMOGAMES · GAME.JS
   Lógica Completa do Jogo da Memória
════════════════════════════════════════════════ */

'use strict';

/* ── ESTADO DO JOGO ────────────────────────────── */
const GAME = {
  dificuldades: {
    facil:  { pares: 6,  cols: 3, tempo: 0,   tentativas: 0,   label: 'Fácil',  grid: 'repeat(3,1fr)' },
    normal: { pares: 8,  cols: 4, tempo: 120,  tentativas: 0,   label: 'Normal', grid: 'repeat(4,1fr)' },
    dificil:{ pares: 10, cols: 5, tempo: 90,   tentativas: 20,  label: 'Difícil',grid: 'repeat(5,1fr)' },
  },
  estado: 'idle', // idle | playing | paused | won | lost
  dificuldade: 'normal',
  cartas: [],
  viradas: [],
  pares: 0,
  totalPares: 0,
  movimentos: 0,
  tempoInicio: null,
  tempoLimite: 0,
  tentativasRestantes: 0,
  lockBoard: false,
  interval: null,
};

/* ── EMOJIS ATUAIS ─────────────────────────────── */
function getEmojis() {
  const tipo = (typeof MG !== 'undefined' && MG.loja.tipo) || 'labriolag';
  const temas = (typeof MG !== 'undefined') ? MG.temas : {};
  const tema = temas[tipo] || temas.labriolag || { emoji: ['⚡','🔮','💎','🌐','🚀','🏆','✨','💡','🎯','🎪'] };
  return [...tema.emoji, '🎯','🎪','🔥','💫','🌟','🎭'].slice(0, 10);
}

/* ── INICIAR ───────────────────────────────────── */
function iniciarJogo() {
  const diff = GAME.dificuldades[GAME.dificuldade];
  const emojis = getEmojis().slice(0, diff.pares);
  const cards = [...emojis, ...emojis]
    .sort(() => Math.random() - 0.5)
    .map((emoji, i) => ({ id: i, emoji, virada: false, matched: false }));

  GAME.cartas = cards;
  GAME.viradas = [];
  GAME.pares = 0;
  GAME.totalPares = diff.pares;
  GAME.movimentos = 0;
  GAME.lockBoard = false;
  GAME.tempoInicio = Date.now();
  GAME.tempoLimite = diff.tempo;
  GAME.tentativasRestantes = diff.tentativas;
  GAME.estado = 'playing';

  renderBoard(diff.cols, diff.grid);
  clearInterval(GAME.interval);
  if (diff.tempo > 0) {
    GAME.interval = setInterval(tickTimer, 500);
  }
  atualizarHUD();
}

/* ── RENDER BOARD ──────────────────────────────── */
function renderBoard(cols, gridTemplate) {
  const board = document.getElementById('board');
  if (!board) return;
  board.style.gridTemplateColumns = gridTemplate;
  board.innerHTML = '';

  GAME.cartas.forEach((c) => {
    const wrap = document.createElement('div');
    wrap.className = 'card-wrap';
    wrap.dataset.id = c.id;
    wrap.innerHTML = `
      <div class="card-face card-back">
        <div class="card-back-icon">◈</div>
        <div class="card-back-dots">
          ${Array(9).fill('<div class="cbd"></div>').join('')}
        </div>
      </div>
      <div class="card-face card-front">${c.emoji}</div>
    `;
    wrap.addEventListener('click', () => clicarCarta(c.id));
    board.appendChild(wrap);
  });
}

/* ── CLICAR CARTA ──────────────────────────────── */
function clicarCarta(id) {
  if (GAME.estado !== 'playing' || GAME.lockBoard) return;
  const carta = GAME.cartas[id];
  if (carta.virada || carta.matched) return;

  carta.virada = true;
  GAME.viradas.push(id);

  const el = document.querySelector(`[data-id="${id}"]`);
  el.classList.add('flipped');

  if (GAME.viradas.length === 2) {
    GAME.lockBoard = true;
    GAME.movimentos++;
    atualizarHUD();
    checarPar();
  }
}

/* ── CHECAR PAR ────────────────────────────────── */
function checarPar() {
  const [id1, id2] = GAME.viradas;
  const c1 = GAME.cartas[id1];
  const c2 = GAME.cartas[id2];

  if (c1.emoji === c2.emoji) {
    // PAR ENCONTRADO
    c1.matched = c2.matched = true;
    GAME.pares++;
    const e1 = document.querySelector(`[data-id="${id1}"]`);
    const e2 = document.querySelector(`[data-id="${id2}"]`);
    e1.classList.add('matched');
    e2.classList.add('matched');
    GAME.viradas = [];
    GAME.lockBoard = false;
    atualizarHUD();
    atualizarProgress();

    if (GAME.pares === GAME.totalPares) {
      clearInterval(GAME.interval);
      GAME.estado = 'won';
      setTimeout(mostrarVitoria, 600);
    }
  } else {
    // NÃO BATE
    const el1 = document.querySelector(`[data-id="${id1}"]`);
    const el2 = document.querySelector(`[data-id="${id2}"]`);
    el1.classList.add('shaking');
    el2.classList.add('shaking');

    setTimeout(() => {
      c1.virada = c2.virada = false;
      el1.classList.remove('flipped','shaking');
      el2.classList.remove('flipped','shaking');
      GAME.viradas = [];
      GAME.lockBoard = false;

      // Tentativas limitadas
      if (GAME.tentativasRestantes > 0) {
        GAME.tentativasRestantes--;
        atualizarHUD();
        if (GAME.tentativasRestantes === 0) {
          GAME.estado = 'lost';
          clearInterval(GAME.interval);
          mostrarDerrota();
        }
      }
    }, 900);
  }
}

/* ── TIMER ─────────────────────────────────────── */
function tickTimer() {
  if (GAME.estado !== 'playing' || GAME.tempoLimite === 0) return;
  const elapsed = (Date.now() - GAME.tempoInicio) / 1000;
  const restante = Math.max(0, GAME.tempoLimite - elapsed);

  const el = document.getElementById('hudTimer');
  const timerWrap = document.querySelector('.hud-timer');

  if (el) {
    const m = Math.floor(restante / 60);
    const s = Math.floor(restante % 60);
    el.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }

  if (timerWrap) {
    timerWrap.classList.toggle('warning', restante <= 20);
  }

  if (restante <= 0) {
    clearInterval(GAME.interval);
    GAME.estado = 'lost';
    mostrarDerrota();
  }
}

/* ── HUD ───────────────────────────────────────── */
function atualizarHUD() {
  const hudPares     = document.getElementById('hudPares');
  const hudMovs      = document.getElementById('hudMovs');
  const hudTentativas= document.getElementById('hudTentativas');

  if (hudPares) hudPares.textContent = `${GAME.pares}/${GAME.totalPares}`;
  if (hudMovs)  hudMovs.textContent  = GAME.movimentos;

  const wrapTent = document.getElementById('wrapTentativas');
  if (wrapTent) {
    wrapTent.style.display = GAME.tentativasRestantes > 0 ? 'block' : 'none';
    if (hudTentativas) hudTentativas.textContent = GAME.tentativasRestantes;
  }

  const timerWrap = document.getElementById('wrapTimer');
  if (timerWrap) {
    timerWrap.style.display = GAME.tempoLimite > 0 ? 'block' : 'none';
  }

  // Botão de início
  const btnStart = document.getElementById('btnStart');
  if (btnStart) {
    btnStart.textContent = GAME.estado === 'idle' ? '▶ Iniciar Jogo' : '↺ Reiniciar';
  }
}

/* ── PROGRESS BAR DO JOGO ──────────────────────── */
function atualizarProgress() {
  const el = document.getElementById('gameProgress');
  if (el) el.style.width = `${(GAME.pares / GAME.totalPares) * 100}%`;
}

/* ── VITÓRIA ───────────────────────────────────── */
function mostrarVitoria() {
  const tempoTotal = Date.now() - GAME.tempoInicio;
  const nickname = (typeof MG !== 'undefined') ? MG.jogador.nickname : 'Jogador';

  // Salvar score
  let scores = [];
  if (typeof MG !== 'undefined') {
    scores = MG.saveScore({
      name: nickname,
      time: tempoTotal,
      moves: GAME.movimentos,
      difficulty: GAME.dificuldade,
    });
    renderScoreboard(scores);
  }

  // Gerar código de resgate
  let codigo = null;
  if (typeof MG !== 'undefined') {
    const r = MG.gerarCodigo();
    codigo = r.code;
    const expDate = new Date(r.exp).toLocaleString('pt-BR');

    const elCodigo  = document.getElementById('rewardCode');
    const elValidade= document.getElementById('rewardValidade');
    if (elCodigo)   elCodigo.textContent  = codigo;
    if (elValidade) elValidade.textContent = `Válido até: ${expDate}`;
  }

  // Preencher modal
  const elTempo = document.getElementById('rewardTempo');
  const elMovs  = document.getElementById('rewardMovs');
  const elPremio= document.getElementById('rewardPremio');
  if (elTempo) elTempo.textContent = MG.fmtTime(tempoTotal);
  if (elMovs)  elMovs.textContent  = `${GAME.movimentos} movimentos`;
  if (elPremio) {
    const premio = (typeof MG !== 'undefined' && MG.loja.recompensa?.texto)
      ? MG.loja.recompensa.texto
      : '🎁 Prêmio especial da casa!';
    elPremio.textContent = premio;
  }

  // Abrir modal
  const modal = document.getElementById('modalVitoria');
  if (modal) modal.classList.add('open');

  // Confetti
  if (typeof MG !== 'undefined') MG.confetti();
}

/* ── DERROTA ───────────────────────────────────── */
function mostrarDerrota() {
  const modal = document.getElementById('modalDerrota');
  if (modal) modal.classList.add('open');
}

/* ── SCOREBOARD ────────────────────────────────── */
function renderScoreboard(scores) {
  const el = document.getElementById('scoreboard');
  if (!el) return;
  if (!scores || scores.length === 0) { el.style.display = 'none'; return; }
  el.style.display = 'block';

  const ranks = ['🥇','🥈','🥉'];
  const rankClasses = ['gold','silver','bronze'];
  const rows = scores.slice(0,5).map((s,i) => `
    <div class="score-row">
      <span class="score-rank ${rankClasses[i]||''}">${ranks[i]||i+1}</span>
      <span class="score-name">${s.name || 'Anônimo'}</span>
      <span class="score-time">${MG.fmtTime(s.time)}</span>
      <span class="score-moves">${s.moves} mov</span>
    </div>
  `).join('');

  el.innerHTML = `
    <div class="scoreboard-head">⬆ Melhores Tempos</div>
    ${rows}
  `;
}

/* ── SELETOR DE DIFICULDADE ────────────────────── */
function selecionarDificuldade(d) {
  GAME.dificuldade = d;
  document.querySelectorAll('.diff-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.diff === d);
    btn.classList.toggle('diff-hard', btn.dataset.diff === 'dificil');
  });
}

/* ── FECHAR MODAIS ─────────────────────────────── */
function fecharVitoria() {
  const el = document.getElementById('modalVitoria');
  if (el) el.classList.remove('open');
  GAME.estado = 'idle';
}

function fecharDerrota() {
  const el = document.getElementById('modalDerrota');
  if (el) el.classList.remove('open');
  GAME.estado = 'idle';
}

function copiarCodigo() {
  const el = document.getElementById('rewardCode');
  if (!el) return;
  if (typeof MG !== 'undefined') MG.copyText(el.textContent);
  MG.toast('Código copiado!', 'gold');
}

/* ── INIT ──────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  // Botões de dificuldade
  document.querySelectorAll('.diff-btn').forEach(btn => {
    btn.addEventListener('click', () => selecionarDificuldade(btn.dataset.diff));
  });

  // Botão iniciar/reiniciar
  const btnStart = document.getElementById('btnStart');
  if (btnStart) btnStart.addEventListener('click', iniciarJogo);

  // Scoreboard inicial
  if (typeof MG !== 'undefined') {
    renderScoreboard(MG.getScores());
  }

  atualizarHUD();
});
