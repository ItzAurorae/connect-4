const ROWS = 6;
const COLS = 7;

let board;
let player;
let mode = "pvp";
let gameOver = false;
let aiThinking = false;

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
  aiThinking = false;

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
   RENDER (ANIMATION SAFE)
========================= */

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

    col.onclick = () => dropPiece(c);
    boardEl.appendChild(col);
  }
}

/* =========================
   DROP SYSTEM (WITH ANIMATION)
========================= */

function dropPiece(col) {
  if (gameOver || aiThinking) return;

  const row = getRow(col);
  if (row === -1) return;

  animateDrop(col, row, player);

  board[row][col] = player;

  if (checkWin(player)) return end(`${playerName(player)} wins`);
  if (getMoves().length === 0) return end("Draw");

  player = 3 - player;

  render();

  if (mode === "ai" && player === 2) {
    aiMove();
  }
}

/* =========================
   DROP ANIMATION (NEW)
========================= */

function animateDrop(col, row, p) {
  const colEl = boardEl.children[col];
  const cellEl = colEl.children[ROWS - 1 - row];

  const ghost = document.createElement("div");
  ghost.className = `ghost ${p === 1 ? "p1" : "p2"}`;

  document.body.appendChild(ghost);

  const rect = cellEl.getBoundingClientRect();

  ghost.style.left = rect.left + "px";
  ghost.style.top = "-80px";

  requestAnimationFrame(() => {
    ghost.style.top = rect.top + "px";
  });

  setTimeout(() => ghost.remove(), 350);
}

/* =========================
   AI (MINIMAX - REAL)
========================= */

function aiMove() {
  if (gameOver) return;

  aiThinking = true;
  statusEl.textContent = "AI thinking...";

  setTimeout(() => {
    const col = minimaxRoot(board, 5, true).col;

    aiThinking = false;
    dropPiece(col);
  }, 250);
}

/* =========================
   MINIMAX CORE
========================= */

function minimaxRoot(boardState, depth, isAI) {
  const moves = getMoves(boardState);

  let bestMove = moves[0];
  let bestScore = -Infinity;

  for (const col of moves) {
    const row = getRowInBoard(boardState, col);
    const copy = clone(boardState);

    copy[row][col] = 2;

    const score = minimax(copy, depth - 1, false);

    if (score > bestScore) {
      bestScore = score;
      bestMove = col;
    }
  }

  return { col: bestMove, score: bestScore };
}

function minimax(boardState, depth, maximizing) {
  if (depth === 0) return evaluate(boardState);

  if (checkWinBoard(boardState, 2)) return 9999;
  if (checkWinBoard(boardState, 1)) return -9999;

  const moves = getMoves(boardState);

  if (maximizing) {
    let best = -Infinity;

    for (const col of moves) {
      const row = getRowInBoard(boardState, col);
      const copy = clone(boardState);
      copy[row][col] = 2;

      best = Math.max(best, minimax(copy, depth - 1, false));
    }

    return best;
  } else {
    let best = Infinity;

    for (const col of moves) {
      const row = getRowInBoard(boardState, col);
      const copy = clone(boardState);
      copy[row][col] = 1;

      best = Math.min(best, minimax(copy, depth - 1, true));
    }

    return best;
  }
}

/* =========================
   HEURISTIC EVALUATION
========================= */

function evaluate(b) {
  let score = 0;

  // center column preference
  for (let r = 0; r < ROWS; r++) {
    if (b[r][3] === 2) score += 3;
  }

  return score;
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

/* =========================
   WIN CHECK
========================= */

function checkWin(p) {
  return checkWinBoard(board, p);
}

function checkWinBoard(b, p) {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      if ([0,1,2,3].every(i => b[r][c+i] === p)) return true;
    }
  }

  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS - 3; r++) {
      if ([0,1,2,3].every(i => b[r+i][c] === p)) return true;
    }
  }

  for (let r = 0; r < ROWS - 3; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      if ([0,1,2,3].every(i => b[r+i][c+i] === p)) return true;
    }
  }

  for (let r = 0; r < ROWS - 3; r++) {
    for (let c = 3; c < COLS; c++) {
      if ([0,1,2,3].every(i => b[r+i][c-i] === p)) return true;
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
   UI
========================= */

function playerName(p) {
  return p === 1 ? "Red" : "Yellow";
}

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
