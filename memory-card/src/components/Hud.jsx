/* =========================================================
   Score, best, and how far through the board you are.
   ========================================================= */

export default function Hud({ score, best, level, levels, picked, total }) {
  return (
    <div className="hud">
      <p className="readout">
        <span className="label">Score</span>
        <span className="value">{String(score).padStart(2, "0")}</span>
      </p>

      <div className="progress">
        <p className="level">
          Level {level} <span>of {levels}</span>
        </p>
        <p className="remaining" role="status" aria-live="polite">
          {total === 0 ? "dealing" : `${total - picked} left on the board`}
        </p>
        <div className="pips" aria-hidden="true">
          {Array.from({ length: total }, (_, i) => (
            <span key={i} className={`pip${i < picked ? " is-lit" : ""}`} />
          ))}
        </div>
      </div>

      <p className="readout readout--best">
        <span className="label">Best</span>
        <span className="value">{String(best).padStart(2, "0")}</span>
      </p>
    </div>
  );
}
