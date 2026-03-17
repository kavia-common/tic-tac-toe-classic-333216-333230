import React, { useEffect, useMemo, useState } from "react";
import "./App.css";
import "./statusText.css";

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
 * Confetti colors aligned to app theme.
 * (Avoids importing an external confetti library to keep the template lightweight.)
 */
const CONFETTI_COLORS = [
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

  /**
   * UI-only celebration flag:
   * - turns on when a winner first appears
   * - auto-hides after a short duration
   * - is cleared on restart
   */
  const [celebrating, setCelebrating] = useState(false);

  const analysis = useMemo(() => analyzeBoard(board), [board]);
  const nextPlayer = xIsNext ? PLAYER_X : PLAYER_O;

  const statusText = useMemo(() => {
    if (analysis.winner) return { kind: "winner", player: analysis.winner };
    if (analysis.isDraw) return { kind: "draw" };
    return { kind: "next", player: nextPlayer };
  }, [analysis.winner, analysis.isDraw, nextPlayer]);

  // Trigger celebration exactly when the game transitions into a win state.
  useEffect(() => {
    if (!analysis.winner) {
      // If the board changes back to "no winner" (e.g., restart), clear any lingering state.
      setCelebrating(false);
      return;
    }

    setCelebrating(true);

    // Auto-hide confetti after a moment; the status text + winning highlights remain.
    const t = window.setTimeout(() => setCelebrating(false), 2200);
    return () => window.clearTimeout(t);
  }, [analysis.winner]);

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
    setCelebrating(false);
  };

  const showWinOverlay = Boolean(analysis.winner) && celebrating;

  return (
    <div className="app">
      {/* Confetti overlay is purely decorative; keep it hidden from assistive tech. */}
      <PartyPopper active={showWinOverlay} />

      <main className="shell shell--withStickers" aria-label="Tic-Tac-Toe">
        {/* Decorative stickers (purely presentational). */}
        <div className="stickers" aria-hidden="true">
          {/* Header stickers */}
          <span className="sticker sticker--sparkle" style={{ top: 14, left: 14 }}>
            ✨
          </span>
          <span className="sticker sticker--bolt" style={{ top: 18, right: 16 }}>
            ⚡️
          </span>

          {/* Board-adjacent stickers */}
          <span className="sticker sticker--game" style={{ top: 196, left: -10 }}>
            🎮
          </span>
          <span className="sticker sticker--star" style={{ top: 248, right: -14 }}>
            ⭐️
          </span>
          <span className="sticker sticker--brain" style={{ bottom: 92, left: 12 }}>
            🧠
          </span>
          <span className="sticker sticker--trophy" style={{ bottom: 14, right: 18 }}>
            🏆
          </span>
        </div>

        <header className="header">
          <div className="titleRow">
            <div>
              <h1 className="title">Tic‑Tac‑Toe</h1>
              <p
                className="subtitle subtitle--colorful"
                aria-label="Classic 3×3 — two players, one device."
              >
                <ColorfulTagline text="Classic 3×3 — two players, one device." />
              </p>
            </div>

            {/* Small inline sticker cluster near the title */}
            <span className="stickerPill" aria-hidden="true">
              <span className="stickerPill__emoji">😄</span>
              <span className="stickerPill__emoji">🟦</span>
              <span className="stickerPill__emoji">🟩</span>
            </span>
          </div>

          <div
            className={`status ${analysis.winner ? "status--win" : ""}`}
            role="status"
            aria-live="polite"
          >
            <StatusText status={statusText} />

            {/* UI-only requirement: show "Spoorthy" only when X is the winner. */}
            {analysis.winner === PLAYER_X ? (
              <span className="spoorthy" aria-label="Spoorthy">
                Spoorthy
              </span>
            ) : null}
          </div>
        </header>

        <section className="boardCard boardCard--withStickers" aria-label="Game board">
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

          <p className="hint">Tip: Click an empty square to place your mark.</p>
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
function StatusText({ status }) {
  /** Presentational helper for the status pill.
   * Keeps the status container readable (dark baseline text) while making key
   * parts colorful (winner/draw/next + player letter).
   */
  if (status.kind === "winner") {
    return (
      <span className="statusText">
        <span className="statusText__label">Winner:</span>
        <span className="statusText__value statusText__value--winner">
          <span className={`statusText__player--${status.player}`}>
            {status.player}
          </span>
        </span>
      </span>
    );
  }

  if (status.kind === "draw") {
    return (
      <span className="statusText">
        <span className="statusText__value statusText__value--draw">
          Draw game
        </span>
      </span>
    );
  }

  return (
    <span className="statusText">
      <span className="statusText__label">Next player:</span>
      <span className="statusText__value statusText__value--next">
        <span className={`statusText__player--${status.player}`}>
          {status.player}
        </span>
      </span>
    </span>
  );
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

/**
 * Party/confetti overlay component.
 * Uses CSS animations and a deterministic set of "confetti pieces" so tests and UI are stable.
 */
// PUBLIC_INTERFACE
function PartyPopper({ active }) {
  /**
   * Create a deterministic set of confetti pieces:
   * - Each piece is positioned across the viewport
   * - Each has a varied size/rotation/delay for a lively feel
   */
  const pieces = useMemo(() => createConfettiPieces(34), []);

  if (!active) return null;

  return (
    <div className="partyLayer" aria-hidden="true">
      <div className="partyLayer__veil" />
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti"
          style={{
            left: `${p.leftPct}%`,
            width: `${p.widthPx}px`,
            height: `${p.heightPx}px`,
            background: p.color,
            transform: `rotate(${p.rotateDeg}deg)`,
            animationDelay: `${p.delayMs}ms`,
            opacity: p.opacity,
          }}
        />
      ))}
    </div>
  );
}

/**
 * Create stable confetti "pieces" without RNG so the UI is consistent and test-friendly.
 * @param {number} count
 * @returns {Array<{id:string,leftPct:number,widthPx:number,heightPx:number,rotateDeg:number,delayMs:number,opacity:number,color:string}>}
 */
function createConfettiPieces(count) {
  const pieces = [];
  for (let i = 0; i < count; i += 1) {
    const t = i / Math.max(1, count - 1);

    // Spread across width with a gentle wave to avoid looking too grid-like.
    const leftPct = Math.round((t * 100 + (i % 4) * 2.2) * 10) / 10;

    const widthPx = 6 + (i % 5); // 6..10
    const heightPx = 10 + ((i * 3) % 10); // 10..19
    const rotateDeg = ((i * 47) % 160) - 80; // -80..79
    const delayMs = (i % 10) * 55; // stagger
    const opacity = 0.92 - (i % 6) * 0.06;

    pieces.push({
      id: `c-${i}`,
      leftPct: Math.min(98, Math.max(2, leftPct)),
      widthPx,
      heightPx,
      rotateDeg,
      delayMs,
      opacity: Math.max(0.55, opacity),
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    });
  }
  return pieces;
}

export default App;
