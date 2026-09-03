import { useRef } from "react";
import { downloadJson, readJson } from "../lib/file.js";

/* =========================================================
   The bar across the top.
   ========================================================= */

export default function Toolbar({ cv, notice, onSample, onClear, onImport, onError }) {
  /*
   * A ref, because clicking a hidden file input is one of the few things that
   * genuinely requires reaching for the DOM node. The styled button is a real
   * button and the input never appears — a bare file input cannot be styled
   * and reads badly.
   */
  const fileInput = useRef(null);

  const handleFile = async (event) => {
    const [file] = event.target.files;
    if (!file) return;

    try {
      onImport(await readJson(file));
    } catch (error) {
      onError(error.message);
    } finally {
      // reset, or choosing the same file twice in a row fires no change event
      event.target.value = "";
    }
  };

  const filename = () => {
    const name = (cv.details.name || "cv").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return `${name || "cv"}.json`;
  };

  return (
    <header className="bar">
      <div className="bar-title">
        <h1>CV Builder</h1>
        <p>Type on the left. The document redraws as you go.</p>
      </div>

      <div className="bar-actions">
        <button type="button" className="ghost" onClick={onSample}>
          Example
        </button>
        <button type="button" className="ghost" onClick={onClear}>
          Clear
        </button>
        <button type="button" className="ghost" onClick={() => downloadJson(cv, filename())}>
          Export
        </button>
        <button type="button" className="ghost" onClick={() => fileInput.current.click()}>
          Import
        </button>
        <button type="button" className="solid" onClick={() => window.print()}>
          Print
        </button>

        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          className="visually-hidden"
          onChange={handleFile}
          aria-label="Choose a CV file to load"
        />
      </div>

      {/* announced when it changes, rather than shouted on every render */}
      <p className="notice" role="status" aria-live="polite">
        {notice}
      </p>
    </header>
  );
}
