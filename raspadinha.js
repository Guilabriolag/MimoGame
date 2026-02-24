const canvas = document.getElementById('raspadinha');
const ctx = canvas.getContext('2d');

const largura = canvas.width;
const altura = canvas.height;

// Camada de cima (prata)
ctx.fillStyle = '#c0c0c0';
ctx.fillRect(0, 0, largura, altura);

// Texto do prêmio
ctx.font = '24px Arial';
ctx.fillStyle = 'black';
ctx.textAlign = 'center';
ctx.fillText('Você ganhou 10% OFF!', largura/2, altura/2);

// Raspagem
let raspado = false;

function raspar(e) {
  const rect = canvas.getBoundingClientRect();
  const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
  const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
  ctx.clearRect(x-15, y-15, 30, 30); // remove camada superior

  // Checar se grande parte foi raspada
  const imgData = ctx.getImageData(0,0, largura, altura).data;
  let pixelsTransparentes = 0;
  for(let i=3;i<imgData.length;i+=4){
    if(imgData[i] === 0) pixelsTransparentes++;
  }
  if(pixelsTransparentes > largura*altura*0.5 && !raspado){
    raspado = true;
    document.getElementById('mensagem').textContent = 'Parabéns! Prêmio revelado!';
  }
}

canvas.addEventListener('touchmove', raspar);
canvas.addEventListener('mousemove', raspar);

// Compartilhamento
document.getElementById('compartilhar-btn').addEventListener('click', () => {
  alert("Para compartilhar, tire uma screenshot e poste nos Stories do Instagram marcando o estabelecimento!");
});
