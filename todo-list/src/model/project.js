/* =========================================================
   A project: a named list of todos, with a colour that
   follows it everywhere in the interface.

   Nothing in this file touches the DOM.
   ========================================================= */

export const PALETTE = [
  { name: "sky", tint: "#8fb8c9" },
  { name: "sage", tint: "#a3c0a0" },
  { name: "clay", tint: "#dfb2a3" },
  { name: "lilac", tint: "#b3aad2" },
  { name: "sand", tint: "#e0cb9f" },
  { name: "mint", tint: "#9cc6bd" },
  { name: "rose", tint: "#dcabbb" },
];

export function createProject(name, tint) {
  return {
    id: crypto.randomUUID(),
    name: String(name).trim(),
    tint: tint || PALETTE[0].tint,
    todos: [],
    created: Date.now(),
  };
}

/** Picks the least-used colour, so a new project rarely clashes with a neighbour. */
export function nextTint(projects) {
  const counts = new Map(PALETTE.map((entry) => [entry.tint, 0]));
  projects.forEach((project) => {
    if (counts.has(project.tint)) counts.set(project.tint, counts.get(project.tint) + 1);
  });
  return [...counts.entries()].sort((a, b) => a[1] - b[1])[0][0];
}
