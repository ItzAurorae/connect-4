const ROWS = 6;
const COLS = 7;

let board;
let player;
let mode = "pvp";
let gameOver = false;
let aiLocked = false;

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
  aiLocked = false;

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
   RENDER
========================= */

function render() {
  boardEl.innerHTML = "";

  for (let c = 0; c < COLS; c++) {
    const colDiv = document.createElement("div");
    colDiv.className = "col";

    for (let r = 0; r < ROWS; r++) {
      const cell = document.createElement("div");
      cell.className = "cell";

      const v = board[r][c];
      if (v === 1) cell.classList.add("p1");
      if (v === 2) cell.classList.add("p2");

      colDiv.appendChild(cell);
    }

    colDiv.onclick = () => move(c);
    boardEl.appendChild(colDiv);
  }
}

/* =========================
   MOVE SYSTEM (FIXED)
========================= */

function move(col) {
  if (gameOver || aiLocked) return;

  const row = getRow(col);
  if (row === -1) return;

  board[row][col] = player;

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
    aiLocked = true;

    setTimeout(() => {
      aiMove();
      aiLocked = false;
    }, 150);
  }
}

/* =========================
   AI (SAFE)
========================= */

function aiMove() {
  if (gameOver) return;

  const moves = getMoves();

  // simple center bias (more stable than random only)
  const center = 3;
  let choice = moves[Math.floor(Math.random() * moves.length)];

  for (const m of moves) {
    if (Math.abs(m - center) < Math.abs(choice - center)) {
      choice = m;
    }
  }

  move(choice);
}

/* =========================
   HELPERS
========================= */

function getRow(col) {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r][col] === 0) return r;
  }
  return -1;
}

function getMoves() {
  return [...Array(COLS).keys()].filter(c => board[0][c] === 0);
}

function checkWin(p) {
  // horizontal
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      if ([0,1,2,3].every(i => board[r][c+i] === p)) return true;
    }
  }

  // vertical
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS - 3; r++) {
      if ([0,1,2,3].every(i => board[r+i][c] === p)) return true;
    }
  }

  // diagonal \
  for (let r = 0; r < ROWS - 3; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      if ([0,1,2,3].every(i => board[r+i][c+i] === p)) return true;
    }
  }

  // diagonal /
  for (let r = 0; r < ROWS - 3; r++) {
    for (let c = 3; c < COLS; c++) {
      if ([0,1,2,3].every(i => board[r+i][c-i] === p)) return true;
    }
  }

  return false;
}

/* =========================
   END GAME (FIXED)
========================= */

function end(text) {
  gameOver = true;
  aiLocked = true; // HARD STOP AI QUEUES

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
