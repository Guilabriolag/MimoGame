// Array com dicas e respostas corretas
const dicas = [
  { dica: "É redondo e delicioso.", opcoes: ["Pizza", "Hambúrguer", "Sushi"], resposta: "Pizza" },
  { dica: "É doce e gelado.", opcoes: ["Sorvete", "Chocolate", "Bolo"], resposta: "Sorvete" },
  { dica: "É uma bebida quente.", opcoes: ["Café", "Suco", "Refrigerante"], resposta: "Café" }
];

let indiceDica = 0;
let tentativas = 0;

const startBtn = document.getElementById('start-btn');
const dicaText = document.getElementById('dica-text');
const opcoesContainer = document.getElementById('opcoes-container');
const resultadoDiv = document.getElementById('resultado');
const resultadoText = document.getElementById('resultado-text');
const compartilharBtn = document.getElementById('compartilhar-btn');

startBtn.addEventListener('click', () => {
  startBtn.classList.add('hidden');
  mostrarDica();
});

function mostrarDica() {
  const dicaAtual = dicas[indiceDica];
  dicaText.textContent = dicaAtual.dica;
  opcoesContainer.innerHTML = '';

  dicaAtual.opcoes.forEach(opcao => {
    const btn = document.createElement('button');
    btn.textContent = opcao;
    btn.addEventListener('click', () => verificarResposta(opcao));
    opcoesContainer.appendChild(btn);
  });
}

function verificarResposta(opcaoEscolhida) {
  tentativas++;
  const dicaAtual = dicas[indiceDica];
  if (opcaoEscolhida === dicaAtual.resposta) {
    indiceDica++;
    if (indiceDica >= dicas.length) {
      mostrarResultado();
    } else {
      mostrarDica();
    }
  } else {
    // Pode adicionar feedback visual para erro
    dicaText.textContent = "Errado! Tente novamente.";
  }
}

function mostrarResultado() {
  opcoesContainer.innerHTML = '';
  dicaText.textContent = '';
  resultadoDiv.classList.remove('hidden');
  resultadoText.textContent = `Você acertou todos os produtos em ${tentativas} tentativas!`;
}

// Compartilhamento simples via Instagram Stories
compartilharBtn.addEventListener('click', () => {
  alert("Para compartilhar, tire uma screenshot e poste nos Stories do Instagram marcando o estabelecimento!");
});
