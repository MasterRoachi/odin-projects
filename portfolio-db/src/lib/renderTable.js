/* =========================================================
   Result sets, as real tables.

   A terminal would normally print aligned text in a <pre>,
   and it would look right. But a screen reader cannot
   navigate a <pre> — there are no rows and no columns in it,
   just a wall of characters with spaces in.

   So this emits a genuine <table> with <th scope="col"> and
   styles it in monospace with hairline rules. It reads as
   terminal output and it is navigable cell by cell, which a
   pre-formatted block never is.
   ========================================================= */

const isNumber = (value) => typeof value === "number";

/** SQLite hands back null for NULL; show it rather than an empty gap. */
function cellText(value) {
  if (value === null || value === undefined) return "NULL";
  if (value instanceof Uint8Array) return `[${value.length} bytes]`;
  return String(value);
}

export function renderTable(columns, rows) {
  const wrap = document.createElement("div");
  wrap.className = "grid-wrap";

  const table = document.createElement("table");
  table.className = "grid";

  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");
  columns.forEach((name) => {
    const th = document.createElement("th");
    th.scope = "col";
    th.textContent = name;
    headRow.append(th);
  });
  thead.append(headRow);

  const tbody = document.createElement("tbody");
  rows.forEach((row) => {
    const tr = document.createElement("tr");
    row.forEach((value) => {
      const td = document.createElement("td");
      td.textContent = cellText(value);
      /* numbers right, text left — the thing that makes a column of figures
         readable at a glance */
      if (isNumber(value)) td.className = "num";
      if (value === null || value === undefined) td.classList.add("null");
      tr.append(td);
    });
    tbody.append(tr);
  });

  table.append(thead, tbody);
  wrap.append(table);
  return wrap;
}

/** "22 rows · 4 columns · 1.4 ms" */
export const describeResult = (rows, columns, ms) =>
  `${rows.length} ${rows.length === 1 ? "row" : "rows"} · ` +
  `${columns.length} ${columns.length === 1 ? "column" : "columns"} · ` +
  `${ms < 1 ? ms.toFixed(2) : ms.toFixed(1)} ms`;
