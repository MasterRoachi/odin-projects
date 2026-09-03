# portfolio=#

A real SQLite database of this portfolio, queried from a terminal in the browser. Stands in for [The Odin Project](https://www.theodinproject.com/)'s SQL Zoo assignment, which is exercises on someone else's website and leaves nothing behind.

```bash
npm install
npm run dev
npm run build
```

[**Open it**](./dist/) — type `\help`, or `\ex 1` to start the exercises.

## It is a real database

Not a simulation, and not JavaScript pretending to be SQL. This is **SQLite — the actual C library — compiled to WebAssembly** and running in the page, with the database file held in memory instead of on disk. The same engine and the same query planner that run on a server.

Which means everything works, including the parts that should hurt:

```
portfolio=# DELETE FROM project_techniques;
71 rows changed · 0.6 ms

portfolio=# SELECT COUNT(*) AS remaining FROM project_techniques;
 remaining
 0
```

A `DELETE` with no `WHERE` really does empty the table. `\reset` rebuilds it, which is a luxury the real thing does not offer.

And the constraints are constraints:

```
portfolio=# INSERT INTO projects (name, slug, course_id, ...) VALUES ('Ghost','ghost',99,...);
FOREIGN KEY constraint failed
```

That only works because of one line in `createDb.js`:

```js
db.run("PRAGMA foreign_keys = ON;");
```

**SQLite has foreign keys off by default.** Without that line `REFERENCES` is a comment — the bad row goes in, and the exercise that proves the database protects you silently passes instead.

## The data is this repository

Twenty-two projects, their courses, and the techniques each one used. The dates and commit counts come from this repo's own git history and the test counts are what the suites actually report, so the answers are true:

```
portfolio=# SELECT courses.name AS course, COUNT(*) AS projects, SUM(projects.tests) AS tests
portfolio-# FROM courses JOIN projects ON projects.course_id = courses.id
portfolio-# GROUP BY courses.id ORDER BY courses.position;

 course                   | projects | tests
 Foundations              |        5 |     0
 Intermediate HTML & CSS  |        2 |     0
 JavaScript               |        7 |   116
 Computer Science         |        5 |    62
 React                    |        3 |    46
```

Four tables, chosen to cover both relationships that matter:

```
courses ──< projects ──< project_techniques >── techniques
```

`courses → projects` is **one-to-many**. `projects ↔ techniques` is **many-to-many**, which neither table can hold on its own, so it lives in a third — the thing that makes a three-table join necessary rather than academic.

## The exercises

Twelve, from `SELECT *` to a three-table join with `HAVING` and a subquery. `\ex 1` opens the first.

They are marked by **comparing the result, not the query text**:

```
portfolio=# SELECT name, tests FROM projects WHERE tests <> 0;
5 rows · 2 columns · 0.6 ms
✓ That is exercise 3. Same result as the answer.
```

The stored answer uses `tests > 0`. Any query that produces the right rows counts, which is how SQL ought to be marked — there is nearly always more than one way to ask. Column *names* are ignored too, so aliasing something `total` instead of `tests` is not wrong. Row order is only checked when the exercise asked for an order.

## A terminal, made accessible

This idiom is usually an accessibility disaster, so:

**Results are real `<table>` elements**, not aligned text in a `<pre>`. A `<pre>` looks identical and is useless to a screen reader — there are no rows or columns in it, just characters with spaces between them. Real tables with `<th scope="col">` can be navigated cell by cell. The monospace and hairlines are what make it still read as terminal output.

**The transcript is `role="log"` but deliberately not `aria-live`.** Announcing a twenty-two row table the instant it appears is not help, it is a wall of speech. Instead a separate `role="status"` announces only the outcome — *"22 rows · 3 columns · 1.4 ms"* — and the table sits in the log to be navigated properly.

**The prompt is a real labelled `<textarea>`**, not a contenteditable div with a drawn caret. So it has a real cursor, real selection, real IME support, and works with everything a text field is supposed to work with.

**Clicking dead space focuses the prompt**, as a terminal should — but not while text is selected, or copying a result out would be impossible.

Every colour was measured on the rendered page: body text 14.7:1, green 12.0:1, red 8.4:1, dim grey 6.3:1, and the lowest thing anywhere is the status line at 5.9:1. Pure `#0f0` on black was avoided on purpose; it is a legibility problem, not a homage.

## The terminal itself

- SQL is **buffered until a semicolon**, so a join can be typed over several lines the way it would be written. The prompt changes to `portfolio-#` while a statement is open, and `Escape` abandons it.
- `\help` `\tables` `\d <table>` `\schema` `\exercises` `\ex <n>` `\solution` `\history` `\reset` `\clear`
- Up and Down walk the history, but only when the caret is at the start, so editing a long query still works.
- `\d` interpolates a table name into `PRAGMA table_info`, so it strips everything that is not a letter, digit or underscore first. That is the one place in this project where a value reaches SQL as text rather than as a parameter, and it is worth being explicit about why it is safe.

## What I Practiced

* One-to-many and many-to-many, and why the second needs a table of its own
* `JOIN` versus `LEFT JOIN`, and that the difference is which rows vanish
* `WHERE` filtering rows before grouping and `HAVING` filtering groups after
* That foreign keys are off by default in SQLite, so a constraint you never switched on is a comment
* That a result set, not a query string, is the right thing to compare when marking SQL

## Project Status

Complete: schema, real data, twelve checked exercises and a working terminal.

## Acknowledgements

Completed as part of The Odin Project's Databases course, in place of the SQL Zoo tutorials. SQLite in the browser via [sql.js](https://sql.js.org/).
