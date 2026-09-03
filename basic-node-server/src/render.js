/* =========================================================
   Templating, by hand.

   Two placeholder forms, and the difference between them is
   the whole security lesson of this project:

     {{name}}    the value is escaped
     {{{name}}}  the value is inserted as markup

   That is deliberately the same distinction EJS makes with
   <%= %> and <%- %>, so that lesson arrives already
   understood. The escaped form is the default because this
   server echoes the request path and the browser's own
   headers back into the page — all of which the person making
   the request controls.
   ========================================================= */

const ENTITIES = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/**
 * Makes a value safe to put inside HTML.
 *
 * Without this, a request for /<script>alert(1)</script> would echo that
 * straight into the 404 page and the browser would run it. There is a test
 * for exactly that, because it is the kind of hole that is invisible until
 * somebody looks for it.
 */
export const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (char) => ENTITIES[char]);

/**
 * Fills a template.
 *
 * Triple braces are handled first, or the escaping pass would mangle the
 * markup that was deliberately left raw.
 */
export function render(template, values = {}) {
  return template
    .replace(/\{\{\{(\w+)\}\}\}/g, (_, key) => String(values[key] ?? ""))
    .replace(/\{\{(\w+)\}\}/g, (_, key) => escapeHtml(values[key]));
}

/** A definition list of request facts, already escaped. */
export function detailList(pairs) {
  const rows = pairs
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(
      ([label, value]) =>
        `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`
    )
    .join("");
  return `<dl class="facts">${rows}</dl>`;
}
