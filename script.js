const ROWS = 6;
const COLS = 7;

let board;
let currentPlayer;
let moveCount;
let startTime;
let gameMode = "human";
let musicPlaying = false;
let gameOver = false;

// DOM
const boardElement = document.getElementById("board");
const winContainer = document.getElementById("win-container");
const winMessage = document.getElementById("win-message");
const gameDuration = document.getElementById("game-duration");
const moveCountDisplay = document.getElementById("move-count");
const turnIndicator = document.getElementById("turn-indicator");
const mainMenu = document.getElementById("main-menu");
const gameContainer = document.getElementById("game-container");
const bgMusic = document.getElementById("bg-music");
const startGameButton = document.getElementById("start-game");
const gameSummary = document.getElementById("game-summary");

/* =========================
   CORE HELPERS
========================= */

function cloneBoard(b) {
  return b.map(r => r.slice());
}

function getValidLocations(b) {
  let res = [];
  for (let c = 0; c < COLS; c++) {
    if (b[0][c] === 0) res.push(c);
  }
  return res;
}

function getNextOpenRow(b, col) {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (b[r][col] === 0) return r;
  }
  return -1;
}

function winningMove(b, p) {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      if (b[r][c] === p && b[r][c+1] === p && b[r][c+2] === p && b[r][c+3] === p)
        return true;
    }
  }

  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS - 3; r++) {
      if (b[r][c] === p && b[r+1][c] === p && b[r+2][c] === p && b[r+3][c] === p)
        return true;
    }
  }

  for (let r = 0; r < ROWS - 3; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      if (b[r][c] === p && b[r+1][c+1] === p && b[r+2][c+2] === p && b[r+3][c+3] === p)
        return true;
    }
  }

  for (let r = 0; r < ROWS - 3; r++) {
    for (let c = 3; c < COLS; c++) {
      if (b[r][c] === p && b[r+1][c-1] === p && b[r+2][c-2] === p && b[r+3][c-3] === p)
        return true;
    }
  }

  return false;
}

/* =========================
   MINIMAX AI
========================= */

function minimax(b, depth, alpha, beta, maximizing) {
  const valid = getValidLocations(b);
  const terminal = winningMove(b, 1) || winningMove(b, 2) || valid.length === 0;

  if (depth === 0 || terminal) {
    if (winningMove(b, 2)) return [null, 100000];
    if (winningMove(b, 1)) return [null, -100000];
    return [null, 0];
  }

  if (maximizing) {
    let best = -Infinity;
    let bestCol = valid[0];

    for (let col of valid) {
      let row = getNextOpenRow(b, col);
      let temp = cloneBoard(b);
      temp[row][col] = 2;

      let score = minimax(temp, depth - 1, alpha, beta, false)[1];

      if (score > best) {
        best = score;
        bestCol = col;
      }

      alpha = Math.max(alpha, best);
      if (alpha >= beta) break;
    }

    return [bestCol, best];
  } else {
    let best = Infinity;
    let bestCol = valid[0];

    for (let col of valid) {
      let row = getNextOpenRow(b, col);
      let temp = cloneBoard(b);
      temp[row][col] = 1;

      let score = minimax(temp, depth - 1, alpha, beta, true)[1];

      if (score < best) {
        best = score;
        bestCol = col;
      }

      beta = Math.min(beta, best);
      if (alpha >= beta) break;
    }

    return [bestCol, best];
  }
}

/* =========================
   UI + GAME FLOW
========================= */

function setTheme(theme) {
  document.body.classList.toggle("dark-mode", theme === "dark");
  document.body.classList.toggle("light-mode", theme === "light");
}

function setGameMode(mode) {
  gameMode = mode;
  startGameButton.disabled = false;
  gameSummary.textContent = `Game Type: ${mode === "human" ? "PvP" : "PvAI"}`;
}

function toggleMusic() {
  musicPlaying ? bgMusic.pause() : bgMusic.play();
  musicPlaying = !musicPlaying;
}

function startGame() {
  mainMenu.style.display = "none";
  gameContainer.style.display = "block";
  resetGame();
}

function returnToMainMenu() {
  gameContainer.style.display = "none";
  mainMenu.style.display = "block";
  resetGame();
}

/* =========================
   BOARD RENDERING
========================= */

function createBoard() {
  boardElement.innerHTML = "";

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");

      cell.addEventListener("click", () => {
        if (!gameOver && !(gameMode === "computer" && currentPlayer === 2)) {
          makeMove(c);
        }
      });

      boardElement.appendChild(cell);
    }
  }
}

function updateBoard() {
  const cells = document.querySelectorAll(".cell");

  cells.forEach((cell, i) => {
    const r = Math.floor(i / COLS);
    const c = i % COLS;

    cell.classList.remove("player-1", "player-2");

    if (board[r][c] === 1) cell.classList.add("player-1");
    if (board[r][c] === 2) cell.classList.add("player-2");
  });
}

/* =========================
   GAME LOGIC
========================= */

function makeMove(col) {
  if (gameOver) return;

  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r][col] === 0) {
      board[r][col] = currentPlayer;
      moveCount++;

      updateBoard();

      if (winningMove(board, currentPlayer)) {
        gameOver = true;
        showEnd("win");
        return;
      }

      if (getValidLocations(board).length === 0) {
        gameOver = true;
        showEnd("draw");
        return;
      }

      currentPlayer = 3 - currentPlayer;
      updateTurn();

      if (gameMode === "computer" && currentPlayer === 2) {
        setTimeout(aiMove, 300);
      }

      return;
    }
  }
}

function aiMove() {
  if (gameOver) return;
  const [col] = minimax(board, 5, -Infinity, Infinity, true);
  if (col !== null) makeMove(col);
}

/* =========================
   UI STATE
========================= */

function updateTurn() {
  turnIndicator.textContent = `Player ${currentPlayer}'s Turn`;
}

function showEnd(type) {
  winContainer.style.display = "block";

  const duration = (Date.now() - startTime) / 1000;

  gameDuration.textContent = `Duration: ${duration.toFixed(2)}s`;
  moveCountDisplay.textContent = `Moves: ${moveCount}`;

  winMessage.textContent =
    type === "win"
      ? `Player ${currentPlayer} Wins!`
      : `It's a Draw!`;
}

function resetGame() {
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  currentPlayer = 1;
  moveCount = 0;
  startTime = Date.now();
  gameOver = false;

  winContainer.style.display = "none";

  createBoard();
  updateBoard();
  updateTurn();
}

function goToMainMenu() {
  gameContainer.style.display = "none";
  mainMenu.style.display = "block";
  resetGame();
}

/* =========================
   INIT
========================= */

createBoard();
resetGame();
