import { createTerminal } from "./terminal.js";

/* =========================================================
   Wiring, and the opening banner.
   ========================================================= */

const transcript = document.querySelector("#transcript");
const status = document.querySelector("#status");

function boot(text, kind = "dim") {
  const p = document.createElement("p");
  p.className = `line line--${kind}`;
  p.textContent = text;
  transcript.append(p);
}

boot("Building the database…", "dim");

try {
  const terminal = await createTerminal({
    transcript,
    input: document.querySelector("#prompt"),
    promptLabel: document.querySelector("#prompt-label"),
    status,
  });

  transcript.replaceChildren();
  boot("SQLite (WebAssembly) · 4 tables · 22 projects", "head");
  boot("\\help for the commands. \\ex 1 for the first exercise.", "dim");
  boot("Everything happens in this tab, and \\reset puts it all back.", "dim");

  status.textContent = "Database ready.";
  terminal.focus();
} catch (error) {
  transcript.replaceChildren();
  boot(`The database would not start: ${error.message || error}`, "err");
  status.textContent = "The database failed to start.";
}
