const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreText = document.getElementById("score");
const bgMusic = document.getElementById("bgMusic");

// Variables del juego
let score = 0;
let badCaught = 0;
let gameOver = false;
let gameStarted = false;

const basketImg = new Image();
basketImg.src = "assets/canasta.png";

// Lista de objetos buenos y malos
const goodItems = [
  { src: "assets/pan.png", w: 40, h: 40 },
  { src: "assets/vela.png", w: 40, h: 40 },
  { src: "assets/flor.png", w: 40, h: 40 },
];

const badItem = { src: "assets/calavera.png", w: 45, h: 45 }; // ⚰️ Nuevo: calavera

let basket = { x: 380, y: 430, width: 80, height: 60, speed: 8 };
let fallingItems = [];

// Detección del mouse y teclado
document.addEventListener("mousemove", (e) => {
  if (!gameStarted) return;
  const rect = canvas.getBoundingClientRect();
  basket.x = e.clientX - rect.left - basket.width / 2;
});

document.addEventListener("keydown", (e) => {
  if (!gameStarted) return;
  if (e.key === "ArrowLeft") basket.x -= basket.speed;
  if (e.key === "ArrowRight") basket.x += basket.speed;
  if (gameOver && e.key === "Enter") restartGame();
});

// Crear un objeto que cae
function createItem() {
  if (!gameStarted || gameOver) return;

  // Probabilidad: 75% bueno, 25% malo
  const isBad = Math.random() < 0.25;
  const itemData = isBad
    ? badItem
    : goodItems[Math.floor(Math.random() * goodItems.length)];

  const img = new Image();
  img.src = itemData.src;
  const x = Math.random() * (canvas.width - itemData.w);
  fallingItems.push({
    x,
    y: -40,
    img,
    w: itemData.w,
    h: itemData.h,
    speed: 2 + Math.random() * 3,
    bad: isBad,
  });
}

function drawStartScreen() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ffcc00";
  ctx.font = "bold 40px Arial";
  ctx.textAlign = "center";
  ctx.fillText("💀 Recolector de Ofrendas 💀", canvas.width / 2, 200);
  ctx.font = "24px Arial";
  ctx.fillText("Haz clic para comenzar", canvas.width / 2, 280);
  ctx.font = "18px Arial";
  ctx.fillText("Evita las calaveras... si atrapas 3, el juego termina", canvas.width / 2, 330);
}

function drawGameOverScreen() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "red";
  ctx.font = "bold 40px Arial";
  ctx.textAlign = "center";
  ctx.fillText("💀 GAME OVER 💀", canvas.width / 2, 220);
  ctx.fillStyle = "#fff";
  ctx.font = "24px Arial";
  ctx.fillText(`Puntuación final: ${score}`, canvas.width / 2, 270);
  ctx.fillText("Presiona ENTER para reiniciar", canvas.width / 2, 320);
}

function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!gameStarted) {
    drawStartScreen();
    requestAnimationFrame(update);
    return;
  }

  if (gameOver) {
    drawGameOverScreen();
    return;
  }

  ctx.drawImage(basketImg, basket.x, basket.y, basket.width, basket.height);

  // Mover y dibujar objetos
  for (let i = 0; i < fallingItems.length; i++) {
    let it = fallingItems[i];
    it.y += it.speed;
    ctx.drawImage(it.img, it.x, it.y, it.w, it.h);

    // Detección de colisión
    if (
      it.x < basket.x + basket.width &&
      it.x + it.w > basket.x &&
      it.y < basket.y + basket.height &&
      it.y + it.h > basket.y
    ) {
      // Si es malo
      if (it.bad) {
        badCaught++;
        if (badCaught >= 3) {
          gameOver = true;
        }
      } else {
        score++;
      }
      fallingItems.splice(i, 1);
      scoreText.textContent = `Puntuación: ${score} | Calaveras atrapadas: ${badCaught}`;
    } else if (it.y > canvas.height) {
      fallingItems.splice(i, 1);
    }
  }

  requestAnimationFrame(update);
}

function restartGame() {
  score = 0;
  badCaught = 0;
  gameOver = false;
  fallingItems = [];
  scoreText.textContent = `Puntuación: 0 | Calaveras atrapadas: 0`;
  update();
}

// Iniciar juego con clic
canvas.addEventListener("click", () => {
  if (!gameStarted) {
    gameStarted = true;
    bgMusic.play();
    setInterval(createItem, 1000);
  } else if (gameOver) {
    restartGame();
  }
});

update();
