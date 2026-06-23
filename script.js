const ROWS = 6;
const COLS = 7;

let board;
let player;
let mode = "pvp";
let gameOver = false;

const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const overlay = document.getElementById("overlay");
const resultEl = document.getElementById("result");

/* =========================
   INIT
========================= */

function reset() {
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  player = 1;
  gameOver = false;
  overlay.classList.add("hidden");
  render();
}

/* =========================
   MODE
========================= */

function setMode(m) {
  mode = m;
  statusEl.textContent = `Mode: ${m.toUpperCase()}`;
}

/* =========================
   BOARD RENDER
========================= */

function render() {
  boardEl.innerHTML = "";

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";

      if (board[r][c] === 1) cell.classList.add("p1");
      if (board[r][c] === 2) cell.classList.add("p2");

      cell.onclick = () => move(c);

      boardEl.appendChild(cell);
    }
  }
}

/* =========================
   GAME LOGIC
========================= */

function move(col) {
  if (gameOver) return;

  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r][col] === 0) {
      board[r][col] = player;

      if (checkWin(player)) {
        end(`${player === 1 ? "Red" : "Yellow"} wins`);
        return;
      }

      if (getMoves().length === 0) {
        end("Draw");
        return;
      }

      player = 3 - player;
      render();

      if (mode === "ai" && player === 2) {
        setTimeout(aiMove, 200);
      }

      return;
    }
  }
}

/* =========================
   AI (SIMPLE BUT STABLE)
========================= */

function aiMove() {
  if (gameOver) return;

  const moves = getMoves();
  const choice = moves[Math.floor(Math.random() * moves.length)];

  move(choice);
}

/* =========================
   HELPERS
========================= */

function getMoves() {
  return [...Array(COLS).keys()]
    .filter(c => board[0][c] === 0);
}

function checkWin(p) {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      if ([0,1,2,3].every(i => board[r][c+i] === p)) return true;
    }
  }

  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS - 3; r++) {
      if ([0,1,2,3].every(i => board[r+i][c] === p)) return true;
    }
  }

  for (let r = 0; r < ROWS - 3; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      if ([0,1,2,3].every(i => board[r+i][c+i] === p)) return true;
    }
  }

  for (let r = 0; r < ROWS - 3; r++) {
    for (let c = 3; c < COLS; c++) {
      if ([0,1,2,3].every(i => board[r+i][c-i] === p)) return true;
    }
  }

  return false;
}

/* =========================
   END GAME
========================= */

function end(text) {
  gameOver = true;
  resultEl.textContent = text;
  overlay.classList.remove("hidden");
}

/* =========================
   CONTROL
========================= */

function startGame() {
  reset();
}

function restart() {
  reset();
}

/* =========================
   BOOT
========================= */

reset();
