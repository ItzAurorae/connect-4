// Global Game Variables
const ROWS = 6;
const COLS = 7;
let board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
let currentPlayer = 1; // Player 1: Human; Player 2: AI
let moveCount = 0;
let startTime = Date.now();
let gameMode = 'human';
let musicPlaying = false;
let gameOver = false; // true when game is over

// DOM Elements
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

// AI Helper Functions
function cloneBoard(board) {
  return board.map(row => row.slice());
}

function getValidLocations(board) {
  let validLocations = [];
  for (let c = 0; c < COLS; c++) {
    if (board[0][c] === 0) validLocations.push(c); // If the top cell of the column is empty
  }
  return validLocations;
}

function getNextOpenRow(board, col) {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r][col] === 0) return r;
  }
  return -1;
}

function winningMove(board, player) {
  // Check for horizontal, vertical, and diagonal wins
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      if (board[r][c] === player &&
          board[r][c + 1] === player &&
          board[r][c + 2] === player &&
          board[r][c + 3] === player)
        return true;
    }
  }
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS - 3; r++) {
      if (board[r][c] === player &&
          board[r + 1][c] === player &&
          board[r + 2][c] === player &&
          board[r + 3][c] === player)
        return true;
    }
  }
  for (let r = 0; r < ROWS - 3; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      if (board[r][c] === player &&
          board[r + 1][c + 1] === player &&
          board[r + 2][c + 2] === player &&
          board[r + 3][c + 3] === player)
        return true;
    }
  }
  for (let r = 0; r < ROWS - 3; r++) {
    for (let c = 3; c < COLS; c++) {
      if (board[r][c] === player &&
          board[r + 1][c - 1] === player &&
          board[r + 2][c - 2] === player &&
          board[r + 3][c - 3] === player)
        return true;
    }
  }
  return false;
}

// Implementing Minimax Algorithm
function minimax(board, depth, alpha, beta, maximizingPlayer) {
  let validLocations = getValidLocations(board);
  const isTerminal = winningMove(board, 1) || winningMove(board, 2) || validLocations.length === 0;

  if (depth === 0 || isTerminal) {
    if (isTerminal) {
      if (winningMove(board, 2)) return [null, 100000]; // AI wins
      else if (winningMove(board, 1)) return [null, -100000]; // Player wins
      else return [null, 0]; // Draw
    } else {
      return [null, 0]; // If no more moves, return neutral result
    }
  }

  if (maximizingPlayer) {
    let value = -Infinity;
    let bestColumn = validLocations[Math.floor(Math.random() * validLocations.length)]; // Fallback to random

    for (let col of validLocations) {
      let row = getNextOpenRow(board, col);
      let tempBoard = cloneBoard(board);
      tempBoard[row][col] = 2; // Simulate AI move

      let newScore = minimax(tempBoard, depth - 1, alpha, beta, false)[1]; // Minimize opponent move
      if (newScore > value) {
        value = newScore;
        bestColumn = col;
      }
      alpha = Math.max(alpha, value);
      if (alpha >= beta) break; // Prune branches
    }
    return [bestColumn, value];
  } else {
    let value = Infinity;
    let bestColumn = validLocations[Math.floor(Math.random() * validLocations.length)]; // Fallback to random

    for (let col of validLocations) {
      let row = getNextOpenRow(board, col);
      let tempBoard = cloneBoard(board);
      tempBoard[row][col] = 1; // Simulate player move

      let newScore = minimax(tempBoard, depth - 1, alpha, beta, true)[1]; // Maximize AI move
      if (newScore < value) {
        value = newScore;
        bestColumn = col;
      }
      beta = Math.min(beta, value);
      if (alpha >= beta) break; // Prune branches
    }
    return [bestColumn, value];
  }
}

// Update game summary display based on selections
function updateGameSummary() {
  if (gameMode === 'human') {
    gameSummary.textContent = "Game Type: PvP";
  } else {
    gameSummary.textContent = "Game Type: PvAI";
  }
}

function setTheme(mode) {
  document.body.classList.toggle('dark-mode', mode === 'dark');
  document.body.classList.toggle('light-mode', mode === 'light');
}

function setGameMode(mode) {
  gameMode = mode;
  startGameButton.disabled = false; // Enable the start button
  updateGameSummary();
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
}

// Create board grid
function createBoard() {
  boardElement.innerHTML = "";
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.column = c;
      cell.addEventListener("click", () => {
        if (!gameOver && !(gameMode === 'computer' && currentPlayer === 2)) {
          makeMove(c);
        }
      });
      boardElement.appendChild(cell);
    }
  }
}

// Update turn indicator display
function updateTurnIndicator() {
  turnIndicator.textContent = `Player ${currentPlayer}'s Turn`;
}

// Check for draw (no valid moves)
function checkDraw() {
  return getValidLocations(board).length === 0;
}

// Make a move in a column
function makeMove(column) {
  if (gameOver) return;
  for (let row = ROWS - 1; row >= 0; row--) {
    if (board[row][column] === 0) {
      board[row][column] = currentPlayer;
      moveCount++;
      updateBoard();

      if (winningMove(board, currentPlayer)) {
        gameOver = true;
        displayWinScreen();
        return;
      }
      if (checkDraw()) {
        gameOver = true;
        displayDrawScreen();
        return;
      }

      currentPlayer = 3 - currentPlayer; // Switch players
      updateTurnIndicator();
      if (gameMode === 'computer' && currentPlayer === 2) {
        setTimeout(aiMove, 500); // AI's turn
      }
      return;
    }
  }
}

function aiMove() {
    if (gameOver) return;
    let column = minimax(board, 5, -Infinity, Infinity, true)[0]; // Using Minimax with depth 5
    if (column !== null) {
        makeMove(column);
    }
}

// Check if a move is valid
function isValidMove(column) {
    return column !== null && column >= 0 && column < COLS && board[0][column] === 0;
}

// Update board UI
function updateBoard() {
  const cells = document.querySelectorAll(".cell");
  cells.forEach((cell, index) => {
    const row = Math.floor(index / COLS);
    const col = index % COLS;
    cell.classList.remove("player-1", "player-2");
    if (board[row][col] === 1) cell.classList.add("player-1");
    if (board[row][col] === 2) cell.classList.add("player-2");
  });
}

// Display win screen
function displayWinScreen() {
  winContainer.style.display = "block";
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  gameDuration.textContent = `Duration: ${duration.toFixed(2)} seconds`;
  moveCountDisplay.textContent = `Moves: ${moveCount}`;
  winMessage.textContent = `Player ${currentPlayer} Wins!`;
}

// Display draw screen
function displayDrawScreen() {
  winContainer.style.display = "block";
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  gameDuration.textContent = `Duration: ${duration.toFixed(2)} seconds`;
  moveCountDisplay.textContent = `Moves: ${moveCount}`;
  winMessage.textContent = `It's a Draw!`;
}

// Reset game state
function resetGame() {
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  currentPlayer = 1;
  moveCount = 0;
  startTime = Date.now();
  gameOver = false;
  winContainer.style.display = "none";
  createBoard();
  updateTurnIndicator();
}

function goToMainMenu() {
  gameContainer.style.display = "none";
  mainMenu.style.display = "block";
  resetGame(); // Reset the game when exiting
}

// Initialize board on page load
createBoard();
