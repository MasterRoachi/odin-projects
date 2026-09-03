import { LEVELS } from "../lib/levels.js";

/* =========================================================
   The things that interrupt play.
   ========================================================= */

export default function Overlay({ phase, score, best, level, onRestart }) {
  if (phase === "cleared") {
    return (
      <div className="overlay overlay--flash">
        <p className="overlay-line">Level {level} clear</p>
      </div>
    );
  }

  if (phase !== "lost" && phase !== "won") return null;

  const won = phase === "won";

  return (
    <div className="overlay" role="alertdialog" aria-modal="true" aria-labelledby="overlay-title">
      <div className="overlay-panel">
        {/* read off the level list rather than written in, so the copy cannot
            end up claiming a number the game no longer uses */}
        <h2 id="overlay-title">{won ? `All ${LEVELS.at(-1)} cleared` : "You had that one"}</h2>
        <p>
          {won
            ? "Every board cleared. There is nothing left to shuffle."
            : "That card was already yours. The run ends there."}
        </p>
        <dl className="overlay-scores">
          <div>
            <dt>Score</dt>
            <dd>{score}</dd>
          </div>
          <div>
            <dt>Best</dt>
            <dd>{best}</dd>
          </div>
        </dl>
        <button type="button" className="arcade-button" onClick={onRestart} autoFocus>
          {won ? "Again" : "Insert coin"}
        </button>
      </div>
    </div>
  );
}
