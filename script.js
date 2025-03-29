const ROWS = 6;
const COLS = 7;
let board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
let currentPlayer = 1;
let moveCount = 0;
let startTime = Date.now();
let gameMode = 'human';
let aiDifficulty = 'easy';
let musicPlaying = false;

const boardElement = document.getElementById("board");
const winContainer = document.getElementById("win-container");
const winMessage = document.getElementById("win-message");
const gameDuration = document.getElementById("game-duration");
const moveCountDisplay = document.getElementById("move-count");
const mainMenu = document.getElementById("main-menu");
const gameContainer = document.getElementById("game-container");
const bgMusic = document.getElementById("bg-music");
const startGameButton = document.getElementById("start-game");

function setTheme(mode) {
    document.body.classList.toggle('dark-mode', mode === 'dark');
    document.body.classList.toggle('light-mode', mode === 'light');
}

function setGameMode(mode) {
    gameMode = mode;
    document.getElementById("difficulty-selection").style.display = (mode === 'computer') ? "block" : "none";
    startGameButton.disabled = false; // Enable the "Start Game" button once settings are selected
}

function setDifficulty(level) {
    aiDifficulty = level;
}

function toggleMusic() {
    if (musicPlaying) {
        bgMusic.pause();
    } else {
        bgMusic.play();
    }
    musicPlaying = !musicPlaying;
}

function startGame() {
    // Hide the main menu and show the game board
    mainMenu.style.display = "none";
    gameContainer.style.display = "block";
    
    // Reset the game state
    resetGame();
}

function createBoard() {
    boardElement.innerHTML = "";
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.column = c;
            cell.addEventListener("click", () => makeMove(c));
            boardElement.appendChild(cell);
        }
    }
}

function makeMove(column) {
    for (let row = ROWS - 1; row >= 0; row--) {
        if (board[row][column] === 0) {
            board[row][column] = currentPlayer;
            moveCount++;
            updateBoard();
            if (checkWinner()) {
                displayWinScreen();
                return;
            }
            currentPlayer = 3 - currentPlayer; 
            if (gameMode === 'computer' && currentPlayer === 2) {
                setTimeout(aiMove, 500);
            }
            return;
        }
    }
}

function aiMove() {
    let column;
    if (aiDifficulty === 'easy') {
        column = Math.floor(Math.random() * COLS);
    } else if (aiDifficulty === 'moderate') {
        column = smartMove();
    } else if (aiDifficulty === 'hard' || aiDifficulty === 'master') {
        column = bestMove();
    }
    makeMove(column);
}

function smartMove() {
    return Math.floor(Math.random() * COLS);
}

function bestMove() {
    return Math.floor(Math.random() * COLS);
}

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

function checkWinner() {
    return false;
}

function displayWinScreen() {
    winContainer.style.display = "block";
}

function resetGame() {
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    currentPlayer = 1;
    moveCount = 0;
    startTime = Date.now();
    winContainer.style.display = "none";
    createBoard();
}

createBoard();
