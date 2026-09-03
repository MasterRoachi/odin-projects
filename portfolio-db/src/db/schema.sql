-- =========================================================
-- The portfolio, as a relational schema.
--
-- Four tables, chosen to cover the two relationships that
-- matter: one-to-many (a course has many projects) and
-- many-to-many (a project uses many techniques, a technique
-- appears in many projects), which needs a third table.
-- =========================================================

CREATE TABLE courses (
  id       INTEGER PRIMARY KEY,
  name     TEXT    NOT NULL UNIQUE,
  -- where the course sits in the curriculum, so ORDER BY means something
  position INTEGER NOT NULL
);

CREATE TABLE projects (
  id         INTEGER PRIMARY KEY,
  name       TEXT    NOT NULL,
  slug       TEXT    NOT NULL UNIQUE,
  -- REFERENCES is the point: the database will refuse a project whose
  -- course does not exist, and refuse to delete a course still holding one
  course_id  INTEGER NOT NULL REFERENCES courses(id),
  started_on TEXT    NOT NULL,
  updated_on TEXT    NOT NULL,
  commits    INTEGER NOT NULL,
  -- 0 rather than NULL where a project genuinely has no tests, so that
  -- COUNT(tests) and COUNT(*) agree; see the exercise on NULL
  tests      INTEGER NOT NULL DEFAULT 0,
  has_page   INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE techniques (
  id   INTEGER PRIMARY KEY,
  name TEXT    NOT NULL UNIQUE
);

-- The join table. Neither projects nor techniques can hold the other, so
-- the relationship lives in a table of its own.
CREATE TABLE project_techniques (
  project_id   INTEGER NOT NULL REFERENCES projects(id),
  technique_id INTEGER NOT NULL REFERENCES techniques(id),
  -- the pair is the key, so the same technique cannot be listed twice
  -- against one project
  PRIMARY KEY (project_id, technique_id)
);

-- Indexes on what gets searched by, not on everything: every index makes
-- writes slower because the insert has to update it too.
CREATE INDEX idx_projects_course ON projects(course_id);
CREATE INDEX idx_pt_technique    ON project_techniques(technique_id);
