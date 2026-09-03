import { createHunter } from "./src/model/hunter.js";
import { createGameboard } from "./src/model/gameboard.js";
import { FLEET, placeRandomly } from "./src/model/fleet.js";

function play(make) {
  const board = createGameboard(10);
  placeRandomly(board);
  const hunter = make();
  let shots = 0;
  while (!board.allSunk() && shots < 100) {
    const shot = hunter.nextShot();
    hunter.record(shot, board.receiveAttack(shot));
    shots += 1;
  }
  return shots;
}

const stats = (label, make, games = 3000) => {
  const runs = Array.from({ length: games }, () => play(make));
  runs.sort((a, b) => a - b);
  const mean = runs.reduce((a, b) => a + b, 0) / games;
  console.log(
    label.padEnd(26),
    "mean " + mean.toFixed(1),
    " median " + runs[Math.floor(games / 2)],
    " best " + runs[0],
    " worst " + runs[games - 1]
  );
  return mean;
};

const a = stats("random (the brief)", () => createHunter(10, Math.random, { targeting: false, lattice: false }));
const b = stats("lattice, no targeting", () => createHunter(10, Math.random, { targeting: false }));
const c = stats("hunt and target", () => createHunter(10));
console.log("\ntargeting saves", (100 - (c / b) * 100).toFixed(0) + "% over the lattice alone");
console.log("the whole thing saves", (100 - (c / a) * 100).toFixed(0) + "% over pure random");
const d = stats("targeting, no lattice", () => createHunter(10, Math.random, { lattice: false }));
console.log("lattice adds", (100 - (c / d) * 100).toFixed(1) + "% on top of targeting");
