import { DETAIL_FIELDS } from "../data/schema.js";
import Field from "./Field.jsx";

export default function DetailsEditor({ details, onChange }) {
  return (
    <section className="block" aria-labelledby="block-details">
      <h2 id="block-details">Details</h2>
      <div className="fields">
        {DETAIL_FIELDS.map((field) => (
          <Field key={field.name} field={field} value={details[field.name]} onChange={onChange} />
        ))}
      </div>
    </section>
  );
}
