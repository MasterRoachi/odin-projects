import { useId } from "react";

/* =========================================================
   One labelled control.

   useId rather than a hand-rolled counter: the label and the
   input have to share an id, and React guarantees this one is
   unique across the whole app.
   ========================================================= */

export default function Field({ field, value, onChange }) {
  const id = useId();
  const hintId = `${id}-hint`;
  const { label, type = "text", hint, placeholder } = field;

  const shared = {
    id,
    value: value ?? "",
    placeholder,
    onChange: (event) => onChange(field.name, event.target.value),
    "aria-describedby": hint ? hintId : undefined,
  };

  return (
    <p className="field">
      <label htmlFor={id}>{label}</label>
      {type === "textarea" ? (
        <textarea rows={field.rows || 3} {...shared} />
      ) : (
        <input type={type} {...shared} />
      )}
      {hint && (
        <span className="hint" id={hintId}>
          {hint}
        </span>
      )}
    </p>
  );
}
