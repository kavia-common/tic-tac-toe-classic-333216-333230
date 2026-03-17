import React, { useMemo, useState } from "react";
import "./App.css";

const PLAYER_X = "X";
const PLAYER_O = "O";

/**
 * Repeating palette for per-character tagline coloring.
 * Keep colors aligned with existing theme accents for a cohesive look.
 */
const TAGLINE_PALETTE = [
  "var(--primary)",
  "var(--success)",
  "var(--secondary)",
  "var(--pink)",
  "var(--warning)",
  "var(--lime)",
];

/**
 * All possible winning line index triplets for a 3x3 board.
 * Index mapping:
 * 0 1 2
 * 3 4 5
 * 6 7 8
 */
const WINNING_LINES = [
  // Rows
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  // Columns
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  // Diagonals
  [0, 4, 8],
  [2, 4, 6],
];

// PUBLIC_INTERFACE
function App() {
  /** 9 cells, each null | "X" | "O" */
  const [board, setBoard] = useState(() => Array(9).fill(null));
  /** Whether next move is X; false means O. */
  const [xIsNext, setXIsNext] = useState(true);

  const analysis = useMemo(() => analyzeBoard(board), [board]);
  const nextPlayer = xIsNext ? PLAYER_X : PLAYER_O;

  const statusText = useMemo(() => {
    if (analysis.winner) return `Winner: ${analysis.winner}`;
    if (analysis.isDraw) return "Draw game";
    return `Next player: ${nextPlayer}`;
  }, [analysis.winner, analysis.isDraw, nextPlayer]);

  // PUBLIC_INTERFACE
  const handleCellClick = (index) => {
    // Ignore clicks after game over or on already-filled cells.
    if (analysis.winner || analysis.isDraw || board[index] != null) return;

    setBoard((prev) => {
      const next = prev.slice();
      next[index] = nextPlayer;
      return next;
    });
    setXIsNext((prev) => !prev);
  };

  // PUBLIC_INTERFACE
  const restartGame = () => {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
  };

  return (
    <div className="app">
      <main className="shell" aria-label="Tic-Tac-Toe">
        <header className="header">
          <div>
            <h1 className="title">Tic‑Tac‑Toe</h1>
            <p className="subtitle subtitle--colorful" aria-label="Classic 3×3 — two players, one device.">
              <ColorfulTagline text="Classic 3×3 — two players, one device." />
            </p>
          </div>

          <div className="status" role="status" aria-live="polite">
            {statusText}
          </div>
        </header>

        <section className="boardCard" aria-label="Game board">
          <div className="board" role="grid" aria-label="3 by 3 board">
            {board.map((value, idx) => {
              const isWinningCell = analysis.winningLine?.includes(idx) ?? false;
              return (
                <button
                  key={idx}
                  type="button"
                  className={`cell ${isWinningCell ? "cell--win" : ""}`}
                  onClick={() => handleCellClick(idx)}
                  role="gridcell"
                  aria-label={`Cell ${idx + 1}${value ? `: ${value}` : ""}`}
                >
                  <span className={`mark ${value ? `mark--${value}` : ""}`}>
                    {value ?? ""}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <footer className="footer">
          <button type="button" className="btn" onClick={restartGame}>
            Restart
          </button>

          <p className="hint">
            Tip: Click an empty square to place your mark.
          </p>
        </footer>
      </main>
    </div>
  );
}

/**
 * Compute winner/draw state for a board.
 * @param {(null|"X"|"O")[]} board
 * @returns {{winner: (null|"X"|"O"), winningLine: (null|number[]), isDraw: boolean}}
 */
function analyzeBoard(board) {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    const v = board[a];
    if (v && v === board[b] && v === board[c]) {
      return { winner: v, winningLine: line, isDraw: false };
    }
  }

  const isDraw = board.every((cell) => cell != null);
  return { winner: null, winningLine: null, isDraw };
}

// PUBLIC_INTERFACE
function ColorfulTagline({ text }) {
  /**
   * UI-only rendering helper:
   * - wraps every character (including spaces/punctuation) in its own span
   * - uses a repeating palette to assign color
   * - keeps the original string available to assistive tech via parent aria-label
   */
  const palette = TAGLINE_PALETTE;

  let paletteIndex = 0;
  const chars = Array.from(text);

  return (
    <span className="tagline" aria-hidden="true">
      {chars.map((ch, i) => {
        // Don't advance the palette for whitespace so the coloring feels more intentional.
        const isWhitespace = /\s/.test(ch);
        const color = palette[paletteIndex % palette.length];

        if (!isWhitespace) paletteIndex += 1;

        return (
          <span
            key={`${i}-${ch}`}
            className={`tagline__char ${isWhitespace ? "tagline__char--space" : ""}`}
            style={!isWhitespace ? { color } : undefined}
          >
            {ch}
          </span>
        );
      })}
    </span>
  );
}

export default App;
