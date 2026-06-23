const ROWS = 6;
const COLS = 7;

let board;
let player;
let mode = "pvp";
let gameOver = false;
let aiLock = false;

const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const overlay = document.getElementById("overlay");
const resultEl = document.getElementById("result");

/* ================= INIT ================= */

function reset() {
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  player = 1;
  gameOver = false;
  aiLock = false;

  overlay.classList.add("hidden");
  render();
}

/* ================= MODE ================= */

function setMode(m) {
  mode = m;
  statusEl.textContent = `Mode: ${m.toUpperCase()}`;
}

/* ================= RENDER ================= */

function render() {
  boardEl.innerHTML = "";

  for (let c = 0; c < COLS; c++) {
    const col = document.createElement("div");
    col.className = "col";

    for (let r = 0; r < ROWS; r++) {
      const cell = document.createElement("div");
      cell.className = "cell";

      if (board[r][c] === 1) cell.classList.add("p1");
      if (board[r][c] === 2) cell.classList.add("p2");

      col.appendChild(cell);
    }

    col.onclick = () => move(c);
    boardEl.appendChild(col);
  }
}

/* ================= MOVE ================= */

function move(col) {
  if (gameOver || aiLock) return;

  const row = getRow(col);
  if (row === -1) return;

  board[row][col] = player;

  if (checkWin(player)) return end(`${name(player)} wins`);
  if (getMoves().length === 0) return end("Draw");

  player = 3 - player;
  render();

  if (mode === "ai" && player === 2) {
    aiLock = true;
    setTimeout(aiMove, 180);
  }
}

/* ================= AI (MINIMAX LIGHT) ================= */

function aiMove() {
  if (gameOver) return;

  const col = bestMove(board);
  aiLock = false;
  move(col);
}

function bestMove(b) {
  const moves = getMoves(b);
  let best = moves[0];
  let score = -Infinity;

  for (const col of moves) {
    const row = getRowInBoard(b, col);
    const copy = clone(b);

    copy[row][col] = 2;
    const s = evaluate(copy);

    if (s > score) {
      score = s;
      best = col;
    }
  }

  return best;
}

function evaluate(b) {
  let score = 0;

  // center column preference
  for (let r = 0; r < ROWS; r++) {
    if (b[r][3] === 2) score += 3;
  }

  return score;
}

/* ================= HELPERS ================= */

function getRow(col) {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r][col] === 0) return r;
  }
  return -1;
}

function getRowInBoard(b, col) {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (b[r][col] === 0) return r;
  }
  return -1;
}

function getMoves(b = board) {
  return [...Array(COLS).keys()].filter(c => b[0][c] === 0);
}

function clone(b) {
  return b.map(r => r.slice());
}

/* ================= WIN CHECK ================= */

function checkWin(p) {
  return check(board, p);
}

function check(b, p) {
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS - 3; c++)
      if ([0,1,2,3].every(i => b[r][c+i] === p)) return true;

  for (let c = 0; c < COLS; c++)
    for (let r = 0; r < ROWS - 3; r++)
      if ([0,1,2,3].every(i => b[r+i][c] === p)) return true;

  for (let r = 0; r < ROWS - 3; r++)
    for (let c = 0; c < COLS - 3; c++)
      if ([0,1,2,3].every(i => b[r+i][c+i] === p)) return true;

  for (let r = 0; r < ROWS - 3; r++)
    for (let c = 3; c < COLS; c++)
      if ([0,1,2,3].every(i => b[r+i][c-i] === p)) return true;

  return false;
}

/* ================= END ================= */

function end(text) {
  gameOver = true;
  overlay.classList.remove("hidden");
  resultEl.textContent = text;
}

/* ================= CONTROL ================= */

function startGame() {
  reset();
}

function restart() {
  reset();
}

/* ================= UTIL ================= */

function name(p) {
  return p === 1 ? "Red" : "Yellow";
}

/* ================= BOOT ================= */

reset();
