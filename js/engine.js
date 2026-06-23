export class Connect4Engine {
  constructor() {
    this.rows = 6;
    this.cols = 7;
    this.reset();
  }

  reset() {
    this.board = Array.from({ length: this.rows }, () =>
      Array(this.cols).fill(0)
    );
    this.player = 1;
    this.over = false;
  }

  drop(col) {
    if (this.over) return null;

    for (let r = this.rows - 1; r >= 0; r--) {
      if (this.board[r][col] === 0) {
        this.board[r][col] = this.player;

        if (this.checkWin(this.player)) {
          this.over = true;
          return { type: "win", player: this.player };
        }

        if (this.getMoves().length === 0) {
          this.over = true;
          return { type: "draw" };
        }

        this.player = 3 - this.player;
        return { type: "continue" };
      }
    }

    return null;
  }

  getMoves() {
    return [...Array(this.cols).keys()]
      .filter(c => this.board[0][c] === 0);
  }

  checkWin(p) {
    const b = this.board;

    for (let r = 0; r < 6; r++)
      for (let c = 0; c < 4; c++)
        if ([0,1,2,3].every(i => b[r][c+i] === p)) return true;

    for (let c = 0; c < 7; c++)
      for (let r = 0; r < 3; r++)
        if ([0,1,2,3].every(i => b[r+i][c] === p)) return true;

    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 4; c++)
        if ([0,1,2,3].every(i => b[r+i][c+i] === p)) return true;

    for (let r = 0; r < 3; r++)
      for (let c = 3; c < 7; c++)
        if ([0,1,2,3].every(i => b[r+i][c-i] === p)) return true;

    return false;
  }
}
