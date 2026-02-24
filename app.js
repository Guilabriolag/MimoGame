/* MIMOGAMES · APP.JS · Shared utilities & state */

// ── STORAGE KEYS ───────────────────────────────────────────
const K = { jogador:'mg_jogador', loja:'mg_loja', dev:'mg_dev', codigos:'mg_codigos', dlCount:'mg_dl' };

function sStore(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch(e){} }
function gStore(key, def={}) { try { const r=localStorage.getItem(key); return r?JSON.parse(r):def; } catch(e){ return def; } }

// ── ESTADO GLOBAL ───────────────────────────────────────────
let jogador = gStore(K.jogador, { tipo:'anonimo', nickname:'' });
let loja    = gStore(K.loja,    {});
let dev     = gStore(K.dev,     {});

function saveJogador() { sStore(K.jogador, jogador); }
function saveLoja()    { sStore(K.loja, loja); }
function saveDev()     { sStore(K.dev, dev); }

// ── TEMAS POR TIPO ──────────────────────────────────────────
const TEMAS = {
  pizzaria:     { cor:'#C0392B', emoji:'🍕', slogan:'Jogue e ganhe uma fatia quentinha!',
                  emojis:['🍕','🍔','🍟','🌭','🧅','🫙','🍱','🥗'] },
  padaria:      { cor:'#C77C3E', emoji:'🍞', slogan:'Jogue e leve pão fresquinho pra casa!',
                  emojis:['🍞','🥐','🧁','🎂','🥖','🫓','🧇','🥨'] },
  hamburgueria: { cor:'#7B4A1C', emoji:'🍔', slogan:'Ganhe hambúrguer com diversão!',
                  emojis:['🍔','🍟','🌯','🌮','🥩','🧅','🥪','🥓'] },
  doceira:      { cor:'#C2185B', emoji:'🍬', slogan:'Doces e jogos — combinação perfeita!',
                  emojis:['🍬','🍭','🍫','🧁','🎂','🍰','🍩','🍪'] },
  acaitaria:    { cor:'#6A1FA0', emoji:'🍧', slogan:'Açaí gelado como prêmio te espera!',
                  emojis:['🍧','🍓','🫐','🍒','🥭','🍇','🍑','🥝'] },
  sorveteria:   { cor:'#0288D1', emoji:'🍨', slogan:'Sorvete grátis pra quem vencer!',
                  emojis:['🍦','🍨','🍧','🧁','🍰','🍫','🍬','🎉'] },
  japones:      { cor:'#C62828', emoji:'🍣', slogan:'Sua vitória vale um sushi especial!',
                  emojis:['🍣','🍱','🥢','🍜','🍙','🍛','🥟','🦐'] },
  cafeteria:    { cor:'#5D3A1A', emoji:'☕', slogan:'Um café quentinho te aguarda!',
                  emojis:['☕','🍵','🧋','🥐','🍮','🎂','🫖','🍩'] },
};

function getTema() { return TEMAS[loja.tipo||'pizzaria'] || TEMAS.pizzaria; }

function aplicarTemaLoja() {
  const t = getTema();
  document.documentElement.style.setProperty('--loja', t.cor);
  document.documentElement.style.setProperty('--loja-p', t.cor+'1E');
  document.documentElement.style.setProperty('--loja-b', t.cor+'44');
}

// ── CÓDIGO ÚNICO DE RESGATE ──────────────────────────────────
function gerarCodigo() {
  const ch = 'ABCDEFGHIJKLMNPQRSTUVWXYZ23456789';
  let c = '';
  for (let i=0;i<8;i++) { if(i===4) c+='-'; c+=ch[Math.floor(Math.random()*ch.length)]; }
  return c;
}
function salvarCodigo(code) {
  const hist = gStore(K.codigos, []);
  hist.push({ code, ts:Date.now(), exp:Date.now()+86400000, loja:loja.nome||'Loja', usado:false });
  if (hist.length > 100) hist.splice(0, hist.length - 100);
  sStore(K.codigos, hist);
}

// ── TOAST ───────────────────────────────────────────────────
function toast(msg, tipo='inf') {
  let c = document.getElementById('toasts');
  if (!c) { c=document.createElement('div'); c.id='toasts'; document.body.appendChild(c); }
  const el = document.createElement('div');
  el.className = `toast t-${tipo}`;
  el.textContent = msg;
  c.appendChild(el);
  setTimeout(()=>el.remove(), 3000);
}

// ── PERFIL BAR ───────────────────────────────────────────────
function renderPerfil(id) {
  const el = document.getElementById(id);
  if (!el || jogador.tipo==='anonimo') return;
  const icons = { Jogador:'🎮', Comerciante:'🏪', Dev:'🔧' };
  const labels = { Jogador:'Jogador', Comerciante:'Comerciante', Dev:'Dev GUI' };
  el.innerHTML = `<div class="pbar fu">
    <div class="pava">${icons[jogador.tipo]||'👤'}</div>
    <div><div class="pname">${jogador.nickname||labels[jogador.tipo]}</div>
    <div class="prole">${labels[jogador.tipo]||''}</div></div>
    <a href="login.html" class="btn btn-ghost btn-sm">Sair</a>
  </div>`;
}

// ── RODAPÉ DA LOJA ───────────────────────────────────────────
function renderLojaFooter(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const t = getTema();
  const nome   = loja.nome   || 'MimoGames';
  const slogan = loja.slogan || t.slogan;
  const logo   = loja.logo   || '';
  const wp     = loja.whatsapp ? loja.whatsapp.replace(/\D/g,'') : '';
  el.innerHTML = `<div class="lfoot">
    ${logo ? `<img src="${logo}" alt="${nome}" class="lf-logo" onerror="this.style.display='none'">` : `<div class="lf-logo fcc" style="background:var(--gold-p);font-size:1.6rem;">${t.emoji}</div>`}
    <div class="lf-nome">${nome}</div>
    <div class="lf-slogan">${slogan}</div>
    ${wp ? `<a href="https://wa.me/55${wp}" target="_blank" class="btn btn-wp">📲 WhatsApp</a>` : ''}
  </div>`;
}

// ── GUARD ────────────────────────────────────────────────────
function requireRole(roles=[]) {
  if (jogador.tipo==='anonimo') { window.location.href='login.html'; return false; }
  if (roles.length && !roles.includes(jogador.tipo)) {
    toast('Acesso negado para este perfil.','err');
    setTimeout(()=>window.location.href='index.html',1200);
    return false;
  }
  return true;
}

// ── RESET ────────────────────────────────────────────────────
function resetarTudo() {
  if (!confirm('Resetar TODOS os dados? Isso não pode ser desfeito.')) return;
  Object.values(K).forEach(k=>localStorage.removeItem(k));
  window.location.href = 'login.html';
}
