export class Connect4AI {
  choose(engine) {
    const moves = engine.getMoves();
    let best = moves[0];
    let score = -Infinity;

    for (const col of moves) {
      const copy = structuredClone(engine);
      copy.drop(col);

      const s = this.evaluate(copy.board);
      if (s > score) {
        score = s;
        best = col;
      }
    }

    return best;
  }

  evaluate(board) {
    let score = 0;

    // center control (modern heuristic baseline)
    for (let r = 0; r < 6; r++) {
      if (board[r][3] === 2) score += 5;
    }

    return score;
  }
}
