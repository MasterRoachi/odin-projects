/* =========================================================
   One card.

   Two faces on one element, rotated in 3D. The front is the
   artwork; the back is the same for every card, which is what
   makes the shuffle unreadable.
   ========================================================= */

export default function Card({ card, faceDown, locked, onPick }) {
  return (
    <li className="slot">
      <button
        type="button"
        className={`card${faceDown ? " is-down" : ""}`}
        onClick={() => onPick(card)}
        disabled={locked}
        aria-label={card.name}
      >
        <span className="face face--front">
          {/* eager, not lazy: every card on the board is visible from the moment
              it is dealt, so deferring them only delays the picture the game is
              actually about */}
          <img src={card.image} alt="" decoding="async" width="180" height="180" />
          <span className="entry">No.&nbsp;{String(card.id).padStart(3, "0")}</span>
          <span className="name">{card.name}</span>
        </span>
        <span className="face face--back" aria-hidden="true">
          <span className="back-mark" />
        </span>
      </button>
    </li>
  );
}
