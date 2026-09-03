import { useState } from "react";
import { blankEntry } from "../data/schema.js";
import Field from "./Field.jsx";

/* =========================================================
   Edits any one section.

   It has no idea whether it is showing jobs, degrees or
   skills — it reads the field list out of the section it was
   given. Adding a fourth kind of section means adding an
   object to schema.js and nothing else.
   ========================================================= */

export default function SectionEditor({ section, entries, onAdd, onUpdate, onRemove, onMove }) {
  /*
   * Which entry is open is state about the *interface*, not about the CV, so
   * it lives here rather than being lifted. Nothing else in the app needs to
   * know, and pushing it up would make App re-render on every disclosure.
   */
  const [openId, setOpenId] = useState(null);

  const handleAdd = () => {
    const entry = blankEntry(section);
    onAdd(section.key, entry);
    setOpenId(entry.id); // open the thing that was just created
  };

  return (
    <section className="block" aria-labelledby={`block-${section.key}`}>
      <div className="block-head">
        <h2 id={`block-${section.key}`}>{section.title}</h2>
        <button type="button" className="ghost" onClick={handleAdd}>
          Add {section.singular}
        </button>
      </div>

      {entries.length === 0 ? (
        <p className="empty">No {section.title.toLowerCase()} yet.</p>
      ) : (
        <ul className="entries">
          {entries.map((entry, index) => {
            const open = entry.id === openId;

            return (
              /* keyed by a real id, never the index — these reorder and
                 delete, and an index key would strand open state on the
                 wrong row */
              <li key={entry.id} className={`entry${open ? " is-open" : ""}`}>
                <div className="entry-head">
                  <button
                    type="button"
                    className="entry-toggle"
                    aria-expanded={open}
                    onClick={() => setOpenId(open ? null : entry.id)}
                  >
                    <span className="chevron" aria-hidden="true">
                      {open ? "▾" : "▸"}
                    </span>
                    {section.summarise(entry)}
                  </button>

                  <span className="entry-tools">
                    <button
                      type="button"
                      className="icon"
                      onClick={() => onMove(section.key, entry.id, -1)}
                      disabled={index === 0}
                      aria-label={`Move ${section.summarise(entry)} up`}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="icon"
                      onClick={() => onMove(section.key, entry.id, 1)}
                      disabled={index === entries.length - 1}
                      aria-label={`Move ${section.summarise(entry)} down`}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      className="icon danger"
                      onClick={() => onRemove(section.key, entry.id)}
                      aria-label={`Delete ${section.summarise(entry)}`}
                    >
                      ✕
                    </button>
                  </span>
                </div>

                {open && (
                  <div className="fields">
                    {section.fields.map((field) => (
                      <Field
                        key={field.name}
                        field={field}
                        value={entry[field.name]}
                        onChange={(name, value) =>
                          onUpdate(section.key, entry.id, { [name]: value })
                        }
                      />
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
