import initSqlJs from "sql.js";
import wasmUrl from "sql.js/dist/sql-wasm.wasm?url";
import schema from "./schema.sql?raw";
import { COURSES, PROJECTS, TECHNIQUES, USES } from "./seed.js";

/* =========================================================
   Builds the database.

   This is real SQLite — the actual C library compiled to
   WebAssembly — running in the page. Not a fake, not a
   JavaScript imitation of SQL: the same engine and the same
   query planner that runs on a server, with the file held in
   memory instead of on disk.

   Which means everything works, including the things that
   should hurt: a DELETE with no WHERE really does empty the
   table, and a foreign key really does refuse.
   ========================================================= */

let SQL = null;

/** Loads the WebAssembly once, however many databases get built. */
async function engine() {
  if (!SQL) {
    // Vite gives us the hashed URL of the .wasm asset; sql.js asks for it
    // through locateFile rather than guessing a path
    SQL = await initSqlJs({ locateFile: () => wasmUrl });
  }
  return SQL;
}

export async function createDatabase() {
  const sql = await engine();
  const db = new sql.Database();

  /*
   * Off by default in SQLite, of all things — so REFERENCES would be
   * decoration rather than a constraint, and the exercise that proves the
   * database refuses a bad row would silently pass instead.
   */
  db.run("PRAGMA foreign_keys = ON;");

  db.run(schema);

  const courses = db.prepare("INSERT INTO courses (id, name, position) VALUES (?, ?, ?)");
  COURSES.forEach((c) => courses.run([c.id, c.name, c.position]));
  courses.free();

  const projects = db.prepare(
    `INSERT INTO projects (id, name, slug, course_id, started_on, updated_on, commits, tests, has_page)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const idBySlug = new Map();
  PROJECTS.forEach((row, i) => {
    const id = i + 1;
    idBySlug.set(row[1], id);
    projects.run([id, row[0], row[1], row[2], row[3], row[4], row[5], row[6], row[7]]);
  });
  projects.free();

  const techniques = db.prepare("INSERT INTO techniques (id, name) VALUES (?, ?)");
  const idByTechnique = new Map();
  TECHNIQUES.forEach((name, i) => {
    idByTechnique.set(name, i + 1);
    techniques.run([i + 1, name]);
  });
  techniques.free();

  const uses = db.prepare(
    "INSERT INTO project_techniques (project_id, technique_id) VALUES (?, ?)"
  );
  Object.entries(USES).forEach(([slug, names]) => {
    names.forEach((name) => uses.run([idBySlug.get(slug), idByTechnique.get(name)]));
  });
  uses.free();

  return db;
}

/**
 * Runs a statement and returns something the terminal can print.
 *
 * sql.js gives back an array of result sets for a SELECT and nothing at all
 * for an INSERT or UPDATE, so the shape is normalised here rather than in
 * the view.
 */
export function run(db, statement) {
  const started = performance.now();
  const results = db.exec(statement);
  const ms = performance.now() - started;

  if (results.length === 0) {
    return { kind: "ack", changes: db.getRowsModified(), ms };
  }

  // only the last result set is shown, which is what psql does for a
  // multi-statement line
  const last = results[results.length - 1];
  return { kind: "rows", columns: last.columns, rows: last.values, ms };
}
