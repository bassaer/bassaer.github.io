const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// ===== ゲーム状態 =====
let gameState = "waiting"; // waiting | playing | gameover | clear

// パドル
const paddle = {
  width: 80,
  height: 10,
  x: canvas.width / 2 - 40,
  speed: 6,
};

// ボール
const ball = {
  x: canvas.width / 2,
  y: canvas.height - 30,
  r: 6,
  dx: 3,
  dy: -3,
};

// ブロック
const rows = 4;
const cols = 6;
const blockWidth = 70;
const blockHeight = 20;
const blockPadding = 10;
const offsetTop = 40;
const totalBlockWidth =cols * blockWidth + (cols - 1) * blockPadding;
const offsetLeft = (canvas.width - totalBlockWidth) / 2;

const blocks = [];
function initBlocks() {
  for (let r = 0; r < rows; r++) {
    blocks[r] = [];
    for (let c = 0; c < cols; c++) {
      blocks[r][c] = { x: 0, y: 0, alive: true };
    }
  }
}
initBlocks();

let rightPressed = false;
let leftPressed = false;
let score = 0;

// ===== キー入力 =====
document.addEventListener("keydown", e => {
  if (e.key === "ArrowRight") rightPressed = true;
  if (e.key === "ArrowLeft") leftPressed = true;

  // スタート
  if (gameState === "waiting") {
    gameState = "playing";
  }

  // リスタート
  if (gameState === "gameover" || gameState === "clear") {
    resetGame();
    gameState = "playing";
  }
});

document.addEventListener("keyup", e => {
  if (e.key === "ArrowRight") rightPressed = false;
  if (e.key === "ArrowLeft") leftPressed = false;
});

function resetGame() {
  score = 0;
  ball.x = canvas.width / 2;
  ball.y = canvas.height - 30;
  ball.dx = 3;
  ball.dy = -3;
  paddle.x = canvas.width / 2 - paddle.width / 2;
  initBlocks();
}

function drawPaddle() {
  ctx.fillStyle = "#00ffcc";
  ctx.fillRect(
    paddle.x,
    canvas.height - paddle.height - 10,
    paddle.width,
    paddle.height
  );
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
  ctx.fillStyle = "#ffcc00";
  ctx.fill();
}

function drawBlocks() {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const b = blocks[r][c];
      if (!b.alive) continue;

      const x = c * (blockWidth + blockPadding) + offsetLeft;
      const y = r * (blockHeight + blockPadding) + offsetTop;
      b.x = x;
      b.y = y;

      ctx.fillStyle = "#ff6666";
      ctx.fillRect(x, y, blockWidth, blockHeight);
    }
  }
}

function drawScore() {
  ctx.fillStyle = "#fff";
  ctx.font = "14px Arial";
  ctx.fillText("Score: " + score, 10, 20);
}

function drawCenterMessage(text, color) {
  // 背景を暗くする
  ctx.fillStyle = "rgba(0,0,0,0.8)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 文字
  ctx.fillStyle = color;
  ctx.font = "bold 36px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  ctx.font = "16px Arial";
  // ctx.fillText("Press any key", canvas.width / 2, canvas.height / 2 + 40);

  // 戻す（他描画に影響しないように）
  ctx.textAlign = "start";
  ctx.textBaseline = "alphabetic";
}

function collisionDetection() {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const b = blocks[r][c];
      if (!b.alive) continue;

      if (
        ball.x > b.x &&
        ball.x < b.x + blockWidth &&
        ball.y > b.y &&
        ball.y < b.y + blockHeight
      ) {
        ball.dy = -ball.dy;
        b.alive = false;
        score++;

        if (score === rows * cols) {
          gameState = "clear";
        }
      }
    }
  }
}

function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBlocks();
  drawBall();
  drawPaddle();
  // drawScore();

  if (gameState === "waiting") {
    drawCenterMessage("", "#ffffff");
    requestAnimationFrame(update);
    return;
  }

  if (gameState === "gameover") {
    drawCenterMessage("", "#ff3333");
    requestAnimationFrame(update);
    return;
  }

  if (gameState === "clear") {
    // drawCenterMessage("🎉", "#00ffcc");
    requestAnimationFrame(update);
    return;
  }

  // ===== playing =====
  collisionDetection();

  // 壁反射
  if (ball.x + ball.dx > canvas.width - ball.r || ball.x + ball.dx < ball.r) {
    ball.dx = -ball.dx;
  }
  if (ball.y + ball.dy < ball.r) {
    ball.dy = -ball.dy;
  }

  const nextX = ball.x + ball.dx;
  const nextY = ball.y + ball.dy;

  const paddleTop = canvas.height - paddle.height - 10;
  const paddleBottom = paddleTop + paddle.height;

  // 次の位置でパドルと交差するか？
  const hitPaddle =
    nextY + ball.r >= paddleTop &&
    ball.y + ball.r <= paddleTop && // 上から入ってくる場合
    nextX >= paddle.x &&
    nextX <= paddle.x + paddle.width;

  if (hitPaddle) {
    ball.dy = -Math.abs(ball.dy);   // 必ず上向きに跳ね返す
  } else if (nextY + ball.r > canvas.height) {
    gameState = "gameover";
  }


  ball.x += ball.dx;
  ball.y += ball.dy;

  // パドル移動
  if (rightPressed && paddle.x < canvas.width - paddle.width) {
    paddle.x += paddle.speed;
  }
  if (leftPressed && paddle.x > 0) {
    paddle.x -= paddle.speed;
  }

  requestAnimationFrame(update);
}

update();

