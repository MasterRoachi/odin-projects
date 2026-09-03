import { MAX_QTY } from "../cart/cartMath.js";

/* =========================================================
   Minus, a number, plus.

   The number is a real input so it can be typed into and read
   by a screen reader as a spinbutton, rather than three
   buttons pretending to be a field.
   ========================================================= */

export default function QuantityStepper({ qty, onChange, label = "Quantity", compact = false }) {
  return (
    <div className={`stepper${compact ? " stepper--compact" : ""}`}>
      <button
        type="button"
        className="step"
        onClick={() => onChange(qty - 1)}
        aria-label={`Decrease ${label.toLowerCase()}`}
      >
        &minus;
      </button>

      <input
        type="number"
        className="step-value"
        value={qty}
        min="1"
        max={MAX_QTY}
        aria-label={label}
        onChange={(event) => onChange(event.target.value)}
      />

      <button
        type="button"
        className="step"
        onClick={() => onChange(qty + 1)}
        disabled={qty >= MAX_QTY}
        aria-label={`Increase ${label.toLowerCase()}`}
      >
        +
      </button>
    </div>
  );
}
