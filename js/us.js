export class UI {
  constructor(engine) {
    this.engine = engine;

    this.boardEl = document.getElementById("board");
    this.turnEl = document.getElementById("turn");
    this.overlay = document.getElementById("overlay");
    this.result = document.getElementById("result");

    this.render();
  }

  render() {
    this.boardEl.innerHTML = "";

    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 7; c++) {
        const cell = document.createElement("div");
        cell.className = "cell";

        const v = this.engine.board[r][c];
        if (v === 1) cell.classList.add("p1");
        if (v === 2) cell.classList.add("p2");

        cell.onclick = () => this.onMove(c);
        this.boardEl.appendChild(cell);
      }
    }

    this.turnEl.textContent =
      `Player ${this.engine.player}'s turn`;
  }

  onMove(col) {
    const result = this.engine.drop(col);
    this.render();

    if (!result) return;

    if (result.type === "win") {
      this.show(`${result.player} wins`);
    }

    if (result.type === "draw") {
      this.show("Draw");
    }
  }

  show(text) {
    this.overlay.classList.remove("hidden");
    this.result.textContent = text;
  }
}
