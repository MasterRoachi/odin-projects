import { useState, useEffect } from "react";
import { SECTIONS, emptyCv, sampleCv } from "./data/schema.js";
import { load, save, clear } from "./lib/storage.js";
import Toolbar from "./components/Toolbar.jsx";
import DetailsEditor from "./components/DetailsEditor.jsx";
import SectionEditor from "./components/SectionEditor.jsx";
import Preview from "./components/Preview.jsx";

/* =========================================================
   The whole CV lives here.

   Every component below is handed what it needs and a function
   to call when the user changes something — nothing further
   down owns any of the document. That is the "lifting state
   up" the course keeps talking about, and it is the reason the
   preview cannot disagree with the form: they are reading the
   same object.
   ========================================================= */

export default function App() {
  /*
   * Read storage in a lazy initialiser, not in an effect.
   *
   * The obvious first instinct is useEffect(() => setCv(load()), []) — but
   * that renders once with the wrong value, then again with the right one,
   * and the user sees a flash of an empty form. State that can be worked out
   * before the first render belongs in the initialiser. The function form
   * means it is only called once rather than on every render.
   */
  const [cv, setCv] = useState(() => load() ?? sampleCv());
  const [notice, setNotice] = useState("");

  /*
   * This one is a genuine effect: localStorage is outside React, and it needs
   * to be kept in step with state that React owns. Most effects a beginner
   * writes are not this — they are copying state into other state, which
   * should just be computed while rendering.
   */
  useEffect(() => {
    save(cv);
  }, [cv]);

  /* --- every change to the document goes through one of these --- */

  const setDetail = (name, value) =>
    setCv((prev) => ({ ...prev, details: { ...prev.details, [name]: value } }));

  const addEntry = (key, entry) => setCv((prev) => ({ ...prev, [key]: [...prev[key], entry] }));

  const updateEntry = (key, id, patch) =>
    setCv((prev) => ({
      ...prev,
      [key]: prev[key].map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)),
    }));

  const removeEntry = (key, id) =>
    setCv((prev) => ({ ...prev, [key]: prev[key].filter((entry) => entry.id !== id) }));

  /**
   * Swaps an entry with its neighbour.
   *
   * Returning `prev` untouched when the move is impossible is deliberate:
   * React compares the reference and skips the re-render entirely, so
   * pressing "up" on the first item costs nothing at all.
   */
  const moveEntry = (key, id, delta) =>
    setCv((prev) => {
      const list = prev[key];
      const from = list.findIndex((entry) => entry.id === id);
      const to = from + delta;
      if (from === -1 || to < 0 || to >= list.length) return prev;

      const next = [...list];
      [next[from], next[to]] = [next[to], next[from]];
      return { ...prev, [key]: next };
    });

  /* --- whole-document actions --- */

  const say = (text) => {
    setNotice(text);
    window.setTimeout(() => setNotice(""), 4000);
  };

  const handleSample = () => {
    setCv(sampleCv());
    say("Loaded the example CV.");
  };

  const handleClear = () => {
    setCv(emptyCv());
    clear();
    say("Cleared. Nothing is saved until you type something.");
  };

  const handleImport = (loaded) => {
    setCv(normalise(loaded));
    say("Loaded from file.");
  };

  return (
    <div className="app">
      <a className="skip" href="#preview">
        Skip to the CV preview
      </a>

      <Toolbar
        cv={cv}
        notice={notice}
        onSample={handleSample}
        onClear={handleClear}
        onImport={handleImport}
        onError={say}
      />

      <main className="split">
        <div className="editor" aria-label="CV details">
          <DetailsEditor details={cv.details} onChange={setDetail} />

          {SECTIONS.map((section) => (
            <SectionEditor
              key={section.key}
              section={section}
              entries={cv[section.key]}
              onAdd={addEntry}
              onUpdate={updateEntry}
              onRemove={removeEntry}
              onMove={moveEntry}
            />
          ))}
        </div>

        <div className="preview-pane">
          <Preview cv={cv} />
        </div>
      </main>
    </div>
  );
}

/**
 * Makes an imported file safe to render.
 *
 * A file off somebody's disk is not trusted to have the shape this app
 * expects — a missing array would crash the first `.map` it reached, and a
 * missing id would break React's list reconciliation.
 */
function normalise(loaded) {
  const base = emptyCv();
  if (!loaded || typeof loaded !== "object") return base;

  return {
    details: { ...base.details, ...(loaded.details || {}) },
    ...Object.fromEntries(
      SECTIONS.map((section) => {
        const list = Array.isArray(loaded[section.key]) ? loaded[section.key] : [];
        return [
          section.key,
          list.map((entry) => ({ ...entry, id: entry?.id || crypto.randomUUID() })),
        ];
      })
    ),
  };
}
