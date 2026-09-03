import { knightMoves, explore, movesFrom, distanceGrid, SIZE } from "./knightMoves.js";

let pass = 0, fail = 0;
const ok = (label, got, want) => {
  const a = JSON.stringify(got), b = JSON.stringify(want);
  if (a === b) pass++; else { fail++; console.log("FAIL " + label + ": got " + a + " want " + b); }
};
const len = (a, b) => knightMoves(a, b).length - 1;

// the examples in the brief
ok("[0,0] to [1,2] is 1 move", len([0,0],[1,2]), 1);
ok("[0,0] to [3,3] is 2 moves", len([0,0],[3,3]), 2);
ok("[3,3] to [0,0] is 2 moves", len([3,3],[0,0]), 2);
ok("[0,0] to [7,7] is 6 moves", len([0,0],[7,7]), 6);
ok("[3,3] to [4,3] is 3 moves", len([3,3],[4,3]), 3);

// the famous awkward one: the square diagonally touching the knight takes four
ok("[0,0] to [1,1] is 4 moves", len([0,0],[1,1]), 4);
// and the one orthogonally beside it takes three
ok("[0,0] to [0,1] is 3 moves", len([0,0],[0,1]), 3);

// a path is a real sequence of legal knight moves
const legal = (path) => path.slice(1).every((sq, i) => {
  const [dx, dy] = [Math.abs(sq[0]-path[i][0]), Math.abs(sq[1]-path[i][1])];
  return (dx === 1 && dy === 2) || (dx === 2 && dy === 1);
});
const sample = knightMoves([0,0],[7,7]);
ok("path starts at the start", sample[0], [0,0]);
ok("path ends at the end", sample.at(-1), [7,7]);
ok("every step is a legal knight move", legal(sample), true);

// same square
ok("no move needed", knightMoves([4,4],[4,4]), [[4,4]]);

// symmetry: distance is the same both ways, for every pair
let asymmetric = 0;
for (let ax = 0; ax < SIZE; ax++) for (let ay = 0; ay < SIZE; ay++) {
  const grid = distanceGrid([ax, ay]);
  for (let bx = 0; bx < SIZE; bx++) for (let by = 0; by < SIZE; by++) {
    if (grid[bx][by] !== distanceGrid([bx, by])[ax][ay]) asymmetric++;
  }
}
ok("distance is symmetric across all 4096 pairs", asymmetric, 0);

// every square reachable from every square, and nothing further than 6
const grids = [];
for (let x = 0; x < SIZE; x++) for (let y = 0; y < SIZE; y++) grids.push(distanceGrid([x,y]));
const all = grids.flat(2);
ok("every square reachable from every square", all.some(d => d === undefined), false);
ok("board is 64 squares", grids[0].flat().length, 64);
ok("furthest any two squares can be", Math.max(...all), 6);
ok("every BFS visits all 64", explore([0,0]).order.length, 64);

// move counts from the corner and the middle
ok("corner has 2 moves", movesFrom([0,0]).length, 2);
ok("centre has 8 moves", movesFrom([3,4]).length, 8);
ok("moves never leave the board", movesFrom([0,0]).every(([x,y]) => x>=0&&x<8&&y>=0&&y<8), true);

// BFS visits in non-decreasing distance order - this is why it is correct
const { order, distance } = explore([2,5]);
const ds = order.map(sq => distance.get(sq.join(",")));
ok("visited in order of distance", ds.every((d,i) => i === 0 || d >= ds[i-1]), true);

// bad input
for (const bad of [[8,0], [-1,3], [0], "a1", null]) {
  let threw = false;
  try { knightMoves([0,0], bad); } catch (e) { threw = e instanceof RangeError; }
  ok("rejects " + JSON.stringify(bad), threw, true);
}

// the early exit must not change any answer it gives
let drift = 0, stopped = 0, full = 0;
for (let ax = 0; ax < SIZE; ax++) for (let ay = 0; ay < SIZE; ay++) {
  const whole = explore([ax, ay]);
  for (let bx = 0; bx < SIZE; bx++) for (let by = 0; by < SIZE; by++) {
    const early = explore([ax, ay], [bx, by]);
    if (early.distance.get(bx + "," + by) !== whole.distance.get(bx + "," + by)) drift++;
    stopped += early.order.length;
    full += whole.order.length;
  }
}
ok("early exit changes no distance, over all 4096 pairs", drift, 0);
ok("early exit really does stop early", stopped < full, true);
console.log("  early exit visits " + Math.round((100 * stopped) / full) + "% of the squares a full sweep does");

console.log("\n" + pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
