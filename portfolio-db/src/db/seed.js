/* =========================================================
   The data, and it is real.

   Dates and commit counts come from this repository's own git
   history; test counts are what the suites actually report.
   Nothing here is invented, which is the point — the queries
   answer real questions about real work.
   ========================================================= */

export const COURSES = [
  { id: 1, name: "Foundations", position: 1 },
  { id: 2, name: "Intermediate HTML & CSS", position: 2 },
  { id: 3, name: "JavaScript", position: 3 },
  { id: 4, name: "Computer Science", position: 4 },
  { id: 5, name: "React", position: 5 },
];

/* name, slug, course, started, updated, commits, tests, has_page */
export const PROJECTS = [
  ["Odin Recipes", "odin-recipes", 1, "2026-09-03", "2026-09-03", 4, 0, 1],
  ["Field Manual", "landing-page", 1, "2026-07-28", "2026-09-03", 5, 0, 1],
  ["Quartz, Parchment, Shears", "Quartz-Parchment-Shears", 1, "2026-09-03", "2026-09-03", 6, 0, 1],
  ["Etch-A-Sketch", "etch-a-sketch", 1, "2026-09-03", "2026-09-03", 3, 0, 1],
  ["Coolculator", "calculator", 1, "2026-09-03", "2026-09-03", 4, 0, 1],

  ["Quarry", "sign-up-form", 2, "2026-09-03", "2026-09-03", 1, 0, 1],
  ["Admin Dashboard", "admin-dashboard", 2, "2026-07-28", "2026-08-05", 3, 0, 1],

  ["The Ark", "library", 3, "2026-08-03", "2026-09-03", 4, 0, 1],
  ["Tic-Tac-Toe", "tic-tac-toe", 3, "2026-08-04", "2026-09-03", 7, 0, 1],
  ["KOI", "restaurant-page", 3, "2026-08-08", "2026-09-03", 5, 0, 1],
  ["Things to do", "todo-list", 3, "2026-09-03", "2026-09-03", 1, 0, 1],
  ["Weather", "weather-app", 3, "2026-09-03", "2026-09-03", 1, 0, 1],
  ["Testing Practice", "testing-practice", 3, "2026-09-03", "2026-09-03", 1, 58, 1],
  ["Battleship", "battleship", 3, "2026-09-03", "2026-09-03", 1, 58, 1],

  ["Recursion", "recursion", 4, "2026-09-03", "2026-09-03", 1, 0, 0],
  ["Linked Lists", "linked-lists", 4, "2026-09-03", "2026-09-03", 2, 0, 0],
  ["Buckets", "hash-map", 4, "2026-09-03", "2026-09-03", 1, 0, 1],
  ["Two Trees", "binary-search-trees", 4, "2026-09-03", "2026-09-03", 1, 35, 1],
  ["Knight's Travails", "knights-travails", 4, "2026-09-03", "2026-09-03", 1, 27, 1],

  ["CV Builder", "cv-builder", 5, "2026-09-03", "2026-09-03", 1, 0, 1],
  ["Don't Click Twice", "memory-card", 5, "2026-09-03", "2026-09-03", 2, 0, 1],
  ["Almgren", "shopping-cart", 5, "2026-09-03", "2026-09-03", 2, 46, 1],
];

/*
 * Which techniques each project actually used, by slug.
 *
 * Deliberately more complete than the one-line tags on the portfolio index:
 * the weather app really does use webpack even though its card mentions the
 * API instead, and being accurate here is what makes the join results worth
 * looking at.
 */
export const USES = {
  "odin-recipes": ["HTML", "Semantic HTML"],
  "landing-page": ["Flexbox", "Typography", "CSS custom properties"],
  "Quartz-Parchment-Shears": ["Web Audio", "Canvas", "SVG", "CSS custom properties"],
  "etch-a-sketch": ["Pointer Events", "CSS Grid", "CSS custom properties"],
  calculator: ["Keyboard input", "CSS gradients", "Typography"],
  "sign-up-form": ["Forms", "Form validation", "Flexbox"],
  "admin-dashboard": ["CSS Grid"],
  library: ["Prototypes", "localStorage", "CSS custom properties"],
  "tic-tac-toe": ["Closures", "Factory functions"],
  "restaurant-page": ["webpack", "ES Modules"],
  "todo-list": ["webpack", "ES Modules", "localStorage", "Architecture"],
  "weather-app": ["webpack", "async/await", "Fetch API", "ES Modules"],
  "testing-practice": ["Vitest", "Mutation testing", "ES Modules"],
  battleship: ["Vitest", "TDD", "SVG filters", "Pointer Events", "ES Modules"],
  recursion: ["Recursion", "Divide and conquer"],
  "linked-lists": ["Private fields", "Iterators", "Linked list"],
  "hash-map": ["Hashing", "Linked list", "Private fields"],
  "binary-search-trees": ["Binary search tree", "Tree traversal", "Recursion"],
  "knights-travails": ["Breadth-first search", "Graphs"],
  "cv-builder": ["React", "Vite", "Print stylesheet", "localStorage"],
  "memory-card": ["React", "Vite", "useEffect", "Fetch API", "CSS 3D transforms"],
  "shopping-cart": ["React", "Vite", "React Router", "React Context", "Testing Library", "Vitest", "Fetch API"],
};

/** Every distinct technique named above, in first-seen order. */
export const TECHNIQUES = [...new Set(Object.values(USES).flat())];
