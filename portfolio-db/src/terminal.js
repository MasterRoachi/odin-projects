import { createDatabase, run } from "./db/createDb.js";
import { renderTable, describeResult } from "./lib/renderTable.js";
import { EXERCISES, sameResult } from "./exercises.js";
import schemaText from "./db/schema.sql?raw";

/* =========================================================
   The terminal.

   A prompt, a transcript and a history, over a real SQLite
   database.

   On accessibility, which is the risk with this idiom:

   - The input is a real <textarea>, labelled. Not a
     contenteditable div with a fake caret.
   - The transcript is role="log", but *without* aria-live.
     Announcing a twenty-two row table cell by cell the moment
     it appears is not help, it is a wall of speech.
   - Instead a separate role="status" announces the outcome —
     "22 rows · 9 columns · 1.4 ms" — and the table is left in
     the log to be navigated properly, as a table.
   - Results are real tables, so a screen reader can move
     around them by row and column.
   ========================================================= */

const PROMPT = "portfolio=#";
const CONTINUE = "portfolio-#";

export async function createTerminal({ transcript, input, promptLabel, status }) {
  let db = await createDatabase();

  const history = [];
  let historyAt = -1;
  let buffer = ""; // a statement being typed across several lines
  let currentExercise = null;

  /* --- writing to the transcript --------------------------- */

  function write(text, kind = "") {
    const line = document.createElement("p");
    line.className = `line${kind ? ` line--${kind}` : ""}`;
    line.textContent = text;
    transcript.append(line);
    return line;
  }

  function echo(text, prompt) {
    const line = document.createElement("p");
    line.className = "line line--echo";
    const p = document.createElement("span");
    p.className = "echo-prompt";
    p.textContent = prompt;
    const t = document.createElement("span");
    t.textContent = ` ${text}`;
    line.append(p, t);
    transcript.append(line);
  }

  function writeNode(node) {
    transcript.append(node);
  }

  /** Announced once, on its own, rather than reading the whole table out. */
  function announce(text) {
    status.textContent = text;
  }

  function toBottom() {
    transcript.scrollTop = transcript.scrollHeight;
  }

  /* --- meta commands --------------------------------------- */

  const META = {
    "\\help": showHelp,
    "\\?": showHelp,
    "\\tables": listTables,
    "\\dt": listTables,
    "\\schema": () => {
      write(schemaText.trim(), "dim");
      announce("Schema printed.");
    },
    "\\exercises": listExercises,
    "\\ex": listExercises,
    "\\solution": showSolution,
    "\\clear": () => {
      transcript.replaceChildren();
      announce("Cleared.");
    },
    "\\history": () => {
      if (history.length === 0) return write("Nothing yet.", "dim");
      history.forEach((h, i) => write(`${String(i + 1).padStart(3)}  ${h}`, "dim"));
    },
    "\\reset": async () => {
      db.close();
      db = await createDatabase();
      write("Database rebuilt. Anything you changed is undone.", "ok");
      announce("Database rebuilt.");
    },
  };

  function showHelp() {
    const rows = [
      ["\\help", "this"],
      ["\\tables", "list the tables and their row counts"],
      ["\\d <table>", "the columns of one table"],
      ["\\schema", "the whole schema as it was written"],
      ["\\exercises", "list the exercises"],
      ["\\ex <n>", "open exercise n"],
      ["\\solution", "reveal the answer to the open exercise"],
      ["\\history", "queries you have run"],
      ["\\reset", "rebuild the database"],
      ["\\clear", "clear the screen"],
    ];
    write("Anything else is run as SQL. End a statement with a semicolon.", "dim");
    rows.forEach(([cmd, what]) => write(`  ${cmd.padEnd(14)}${what}`, "dim"));
    announce("Help printed.");
  }

  function listTables() {
    const result = run(
      db,
      `SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name;`
    );
    const withCounts = result.rows.map(([name]) => {
      const c = run(db, `SELECT COUNT(*) FROM "${name}";`);
      return [name, c.rows[0][0]];
    });
    writeNode(renderTable(["table", "rows"], withCounts));
    announce(`${withCounts.length} tables.`);
  }

  function describeTable(name) {
    const safe = String(name).replace(/[^A-Za-z0-9_]/g, "");
    if (!safe) return write("Which table?", "err");

    const result = run(db, `PRAGMA table_info("${safe}");`);
    if (result.rows.length === 0) {
      write(`No table called "${safe}". Try \\tables.`, "err");
      announce("No such table.");
      return;
    }
    const rows = result.rows.map((r) => [r[1], r[2], r[3] ? "NOT NULL" : "", r[5] ? "PK" : ""]);
    writeNode(renderTable(["column", "type", "null", "key"], rows));
    announce(`${rows.length} columns in ${safe}.`);
  }

  function listExercises() {
    EXERCISES.forEach((ex, i) => write(`  ${String(i + 1).padStart(2)}.  ${ex.title}`, "dim"));
    write("Open one with \\ex <n>.", "dim");
    announce(`${EXERCISES.length} exercises.`);
  }

  function openExercise(n) {
    const index = Number(n) - 1;
    const ex = EXERCISES[index];
    if (!ex) {
      write(`There are ${EXERCISES.length} exercises. \\ex 1 to \\ex ${EXERCISES.length}.`, "err");
      return;
    }
    currentExercise = index;
    write(`Exercise ${index + 1} — ${ex.title}`, "head");
    write(ex.brief, "");
    write(`hint: ${ex.hint}`, "dim");
    announce(`Exercise ${index + 1}. ${ex.brief}`);
  }

  function showSolution() {
    if (currentExercise === null) {
      write("No exercise open. \\ex 1 to start.", "err");
      return;
    }
    write(EXERCISES[currentExercise].solution, "ok");
    announce("Solution printed.");
  }

  /* --- checking an answer ---------------------------------- */

  function checkAnswer(result) {
    if (currentExercise === null || result.kind !== "rows") return;

    const ex = EXERCISES[currentExercise];
    let expected;
    try {
      expected = run(db, ex.solution);
    } catch {
      return; // the solution no longer runs, e.g. the table was dropped
    }

    if (sameResult(result, expected, ex.ordered)) {
      write(`✓ That is exercise ${currentExercise + 1}. Same result as the answer.`, "ok");
      announce("Correct.");
      const next = currentExercise + 2;
      if (next <= EXERCISES.length) write(`Next: \\ex ${next}`, "dim");
      currentExercise = null;
    }
  }

  /* --- the main loop --------------------------------------- */

  async function submit(raw) {
    const text = raw.trim();
    if (!text && !buffer) return;

    echo(raw, buffer ? CONTINUE : PROMPT);

    /* meta commands only make sense on a fresh line */
    if (!buffer && text.startsWith("\\")) {
      history.push(text);
      const [cmd, ...args] = text.split(/\s+/);

      if (cmd === "\\d") return describeTable(args[0]);
      if (cmd === "\\ex" && args[0]) return openExercise(args[0]);

      const handler = META[cmd];
      if (!handler) {
        write(`Unknown command ${cmd}. Try \\help.`, "err");
        announce("Unknown command.");
        return;
      }
      await handler();
      return;
    }

    /* SQL is buffered until a semicolon, so a join can be typed over
       several lines the way it would be written */
    buffer = buffer ? `${buffer}\n${raw}` : raw;
    if (!buffer.trimEnd().endsWith(";")) {
      promptLabel.textContent = CONTINUE;
      return;
    }

    const statement = buffer.trim();
    buffer = "";
    promptLabel.textContent = PROMPT;
    history.push(statement);

    try {
      const result = run(db, statement);

      if (result.kind === "rows") {
        writeNode(renderTable(result.columns, result.rows));
        const summary = describeResult(result.rows, result.columns, result.ms);
        write(summary, "dim");
        announce(summary);
        checkAnswer(result);
      } else {
        const what =
          result.changes > 0
            ? `${result.changes} ${result.changes === 1 ? "row" : "rows"} changed`
            : "Done";
        write(`${what} · ${result.ms.toFixed(1)} ms`, "ok");
        announce(what);
      }
    } catch (error) {
      write(String(error.message || error), "err");
      announce(`Error. ${error.message || error}`);
    }
  }

  /* --- input ---------------------------------------------- */

  input.addEventListener("keydown", async (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      const value = input.value;
      input.value = "";
      historyAt = -1;
      await submit(value);
      toBottom();
      return;
    }

    /* history, but only when the caret is not in the middle of something */
    if (event.key === "ArrowUp" && input.selectionStart === 0) {
      if (history.length === 0) return;
      event.preventDefault();
      historyAt = historyAt < 0 ? history.length - 1 : Math.max(0, historyAt - 1);
      input.value = history[historyAt];
      return;
    }

    if (event.key === "ArrowDown" && historyAt >= 0) {
      event.preventDefault();
      historyAt += 1;
      if (historyAt >= history.length) {
        historyAt = -1;
        input.value = "";
      } else {
        input.value = history[historyAt];
      }
      return;
    }

    if (event.key === "l" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      transcript.replaceChildren();
    }

    if (event.key === "Escape" && buffer) {
      event.preventDefault();
      buffer = "";
      promptLabel.textContent = PROMPT;
      write("Statement abandoned.", "dim");
    }
  });

  /* clicking the dead space focuses the prompt, as a terminal does — but not
     when text is being selected, or copying a result becomes impossible */
  transcript.closest(".screen").addEventListener("mouseup", () => {
    if (window.getSelection()?.toString()) return;
    input.focus();
  });

  return { submit, focus: () => input.focus() };
}
