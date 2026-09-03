/* =========================================================
   Knight's Travails, on the command line.

   Run with:  node main.js
   ========================================================= */

import { knightMoves, distanceGrid, movesFrom, explore, SIZE } from "./knightMoves.js";

const rule = (title) => console.log(`\n${title}\n${"─".repeat(title.length)}`);

/** Algebraic notation, so a square can be checked against a real board. */
const square = ([x, y]) => `${"abcdefgh"[x]}${y + 1}`;

/**
 * Draws the board with the path marked.
 *
 * Rank 8 is printed first and file a on the left, so it reads the way a
 * chessboard is drawn rather than the way the array is indexed.
 */
function drawPath(path) {
  const step = new Map(path.map(([x, y], i) => [`${x},${y}`, i]));

  for (let y = SIZE - 1; y >= 0; y--) {
    let row = ` ${y + 1} `;
    for (let x = 0; x < SIZE; x++) {
      const at = step.get(`${x},${y}`);
      if (at === undefined) row += (x + y) % 2 === 0 ? " · " : "   ";
      else if (at === 0) row += " ♞ ";
      else if (at === path.length - 1) row += " ✕ ";
      else row += ` ${at} `;
    }
    console.log(row);
  }
  console.log("   " + [..."abcdefgh"].map((f) => ` ${f} `).join(""));
}

function report(start, end) {
  const path = knightMoves(start, end);
  const moves = path.length - 1;

  console.log(
    `\n  ${square(start)} → ${square(end)}   ${moves} ${moves === 1 ? "move" : "moves"}` +
      `   ${path.map(square).join(" → ")}`
  );
  console.log(`  ${JSON.stringify(path)}\n`);
  drawPath(path);
}

/* --- the examples in the brief ----------------------------- */

rule("The examples from the assignment");
[
  [[0, 0], [1, 2]],
  [[0, 0], [3, 3]],
  [[3, 3], [0, 0]],
  [[0, 0], [7, 7]],
].forEach(([start, end]) => report(start, end));

/* --- the awkward ones -------------------------------------- */

rule("The squares people get wrong");
console.log(`
  A knight standing on a1 is touching b2, and cannot get there in fewer than
  four moves. It is touching a2 as well, and that takes three. Adjacency on a
  chessboard has almost nothing to do with adjacency for a knight, which is
  exactly why this needs a search rather than arithmetic.
`);
[
  [[0, 0], [1, 1]],
  [[0, 0], [0, 1]],
].forEach(([start, end]) => report(start, end));

/* --- the shape of the board -------------------------------- */

rule("Moves to every square, from a1");
const grid = distanceGrid([0, 0]);
for (let y = SIZE - 1; y >= 0; y--) {
  console.log(` ${y + 1} ` + Array.from({ length: SIZE }, (_, x) => ` ${grid[x][y]} `).join(""));
}
console.log("   " + [..."abcdefgh"].map((f) => ` ${f} `).join(""));

const flat = grid.flat();
console.log(`
  Furthest square from a1: ${Math.max(...flat)} moves.
  No square on the board is more than 6 moves from any other.
`);

/* --- why breadth first ------------------------------------- */

rule("Why breadth first");
const { order, distance } = explore([0, 0]);
const rings = order.reduce((acc, sq) => {
  const d = distance.get(sq.join(","));
  (acc[d] ||= []).push(square(sq));
  return acc;
}, []);

rings.forEach((squares, d) => {
  console.log(`  ${d} ${d === 1 ? "move " : "moves"}  ${String(squares.length).padStart(2)} squares   ${squares.join(" ")}`);
});

console.log(`
  The search finishes one ring before starting the next, so the first time it
  reaches a square it has reached it by the shortest route. Depth first would
  find a path too — just not that one.
`);

/* --- degree ------------------------------------------------ */

rule("How many moves a knight has, by square");
for (let y = SIZE - 1; y >= 0; y--) {
  console.log(
    ` ${y + 1} ` + Array.from({ length: SIZE }, (_, x) => ` ${movesFrom([x, y]).length} `).join("")
  );
}
console.log("   " + [..."abcdefgh"].map((f) => ` ${f} `).join(""));
console.log("\n  Two in the corners, eight in the middle — the edge of the board is the constraint.\n");
