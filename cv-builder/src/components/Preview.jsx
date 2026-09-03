import { SECTIONS } from "../data/schema.js";
import { formatRange, toLines } from "../lib/format.js";

/* =========================================================
   The CV itself.

   A pure function of the CV object — hand it the same data
   twice and you get the same document. It holds no state and
   changes nothing, which is why it can be printed, and why
   swapping the layout later would touch only this file.
   ========================================================= */

export default function Preview({ cv }) {
  const { details } = cv;
  const contact = [details.email, details.phone, details.location, details.website].filter(Boolean);

  return (
    <article className="cv" id="preview" tabIndex={-1} aria-label="CV preview">
      <header className="cv-head">
        <h1>{details.name || "Your name"}</h1>
        {details.title && <p className="cv-title">{details.title}</p>}

        {contact.length > 0 && (
          <ul className="cv-contact">
            {contact.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}
      </header>

      {details.summary && (
        <section className="cv-section cv-summary">
          <p>{details.summary}</p>
        </section>
      )}

      {SECTIONS.map((section) => {
        const entries = cv[section.key];
        if (entries.length === 0) return null;

        return (
          <section className="cv-section" key={section.key}>
            <h2>{section.title}</h2>
            {entries.map((entry) => (
              <Entry key={entry.id} entry={entry} sectionKey={section.key} />
            ))}
          </section>
        );
      })}
    </article>
  );
}

/**
 * One line item.
 *
 * Skills read as a label and a list; the other two read as a heading, a place
 * and a date range. The date column is fixed width so every entry lines up
 * down the page, which is most of what makes a CV look typeset rather than
 * typed.
 */
function Entry({ entry, sectionKey }) {
  if (sectionKey === "skills") {
    return (
      <div className="cv-entry cv-entry--skill">
        <p className="cv-when">{entry.name}</p>
        <div className="cv-what">
          <p className="cv-plain">{entry.description}</p>
        </div>
      </div>
    );
  }

  const heading = entry.role || entry.qualification;
  const place = [entry.company || entry.school, entry.location].filter(Boolean).join(", ");
  const lines = toLines(entry.description);

  return (
    <div className="cv-entry">
      <p className="cv-when">{formatRange(entry.start, entry.end)}</p>
      <div className="cv-what">
        {heading && <h3>{heading}</h3>}
        {place && <p className="cv-place">{place}</p>}

        {lines.length > 1 ? (
          <ul className="cv-points">
            {lines.map((line, i) => (
              /* these lines have no id and cannot be reordered independently
                 of the text they come from, so the index is a stable key */
              <li key={i}>{line}</li>
            ))}
          </ul>
        ) : (
          lines.length === 1 && <p className="cv-plain">{lines[0]}</p>
        )}
      </div>
    </div>
  );
}
