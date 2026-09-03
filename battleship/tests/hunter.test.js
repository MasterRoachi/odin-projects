import { describe, it, expect } from "vitest";
import { createHunter } from "../src/model/hunter.js";
import { createGameboard } from "../src/model/gameboard.js";

const same = (a, b) => a[0] === b[0] && a[1] === b[1];
const isNeighbour = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) === 1;

/** Feeds the hunter a board and lets it fire until everything is sunk. */
function playOut(hunter, board, limit = 200) {
  let shots = 0;
  while (!board.allSunk() && shots < limit) {
    const shot = hunter.nextShot();
    hunter.record(shot, board.receiveAttack(shot));
    shots += 1;
  }
  return shots;
}

describe("choosing shots", () => {
  it("never fires at the same square twice", () => {
    const hunter = createHunter(10);
    const seen = new Set();
    for (let i = 0; i < 100; i++) {
      const shot = hunter.nextShot();
      const id = shot.join(",");
      expect(seen.has(id)).toBe(false);
      seen.add(id);
      hunter.record(shot, { hit: false, sunk: false });
    }
    expect(seen.size).toBe(100);
  });

  it("only fires at squares on the board", () => {
    const hunter = createHunter(10);
    for (let i = 0; i < 100; i++) {
      const [x, y] = hunter.nextShot();
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(10);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThan(10);
      hunter.record([x, y], { hit: false, sunk: false });
    }
  });

  it("returns null once there is nowhere left to fire", () => {
    const hunter = createHunter(3);
    for (let i = 0; i < 9; i++) hunter.record(hunter.nextShot(), { hit: false, sunk: false });
    expect(hunter.nextShot()).toBeNull();
  });

  it("is deterministic when given a fixed source of randomness", () => {
    const fixed = () => 0.5;
    const a = createHunter(10, fixed);
    const b = createHunter(10, fixed);
    for (let i = 0; i < 20; i++) {
      const shotA = a.nextShot();
      const shotB = b.nextShot();
      expect(shotA).toEqual(shotB);
      a.record(shotA, { hit: false, sunk: false });
      b.record(shotB, { hit: false, sunk: false });
    }
  });
});

describe("hunting", () => {
  it("searches on a diagonal lattice while nothing is wounded", () => {
    // the smallest ship is two long, so it must cross a square where
    // (x + y) is even — checking the others first is wasted effort
    const hunter = createHunter(10);
    for (let i = 0; i < 50; i++) {
      const shot = hunter.nextShot();
      expect((shot[0] + shot[1]) % 2).toBe(0);
      hunter.record(shot, { hit: false, sunk: false });
    }
  });

  it("falls back to the other squares once the lattice is used up", () => {
    const hunter = createHunter(10);
    for (let i = 0; i < 50; i++) hunter.record(hunter.nextShot(), { hit: false, sunk: false });
    const shot = hunter.nextShot();
    expect(shot).not.toBeNull();
    expect((shot[0] + shot[1]) % 2).toBe(1);
  });
});

describe("targeting", () => {
  it("goes after a square next to a hit", () => {
    const hunter = createHunter(10);
    hunter.record([4, 4], { hit: true, sunk: false });
    expect(isNeighbour(hunter.nextShot(), [4, 4])).toBe(true);
  });

  it("does not propose neighbours that are off the board", () => {
    const hunter = createHunter(10);
    hunter.record([0, 0], { hit: true, sunk: false });
    const shot = hunter.nextShot();
    expect([[1, 0], [0, 1]].some((c) => same(c, shot))).toBe(true);
  });

  it("follows the line once two hits are in a row", () => {
    const hunter = createHunter(10);
    hunter.record([4, 4], { hit: true, sunk: false });
    hunter.record([5, 4], { hit: true, sunk: false });
    // the ship runs horizontally, so the ends are the only sensible shots
    const shot = hunter.nextShot();
    expect([[3, 4], [6, 4]].some((c) => same(c, shot))).toBe(true);
  });

  it("follows a vertical line too", () => {
    const hunter = createHunter(10);
    hunter.record([4, 4], { hit: true, sunk: false });
    hunter.record([4, 5], { hit: true, sunk: false });
    const shot = hunter.nextShot();
    expect([[4, 3], [4, 6]].some((c) => same(c, shot))).toBe(true);
  });

  it("tries the other end when one end is a miss", () => {
    const hunter = createHunter(10);
    hunter.record([4, 4], { hit: true, sunk: false });
    hunter.record([5, 4], { hit: true, sunk: false });
    hunter.record([6, 4], { hit: false, sunk: false });
    expect(hunter.nextShot()).toEqual([3, 4]);
  });

  it("goes back to hunting once the wounded ship sinks", () => {
    const hunter = createHunter(10);
    hunter.record([4, 4], { hit: true, sunk: false });
    hunter.record([5, 4], {
      hit: true,
      sunk: true,
      sunkCells: [
        [4, 4],
        [5, 4],
      ],
    });
    // nothing is left wounded, so it is back on the lattice
    const shot = hunter.nextShot();
    expect((shot[0] + shot[1]) % 2).toBe(0);
  });

  it("keeps chasing a second ship when a sinking leaves other hits open", () => {
    // two ships lying alongside each other: sinking one must not make it
    // forget the hit belonging to the other
    const hunter = createHunter(10);
    hunter.record([4, 4], { hit: true, sunk: false });
    hunter.record([4, 5], { hit: true, sunk: false });
    hunter.record([7, 7], { hit: true, sunk: false });
    hunter.record([8, 7], {
      hit: true,
      sunk: true,
      sunkCells: [
        [7, 7],
        [8, 7],
      ],
    });
    const shot = hunter.nextShot();
    expect([[4, 3], [4, 6]].some((c) => same(c, shot))).toBe(true);
  });
});

describe("playing whole games", () => {
  const fleet = [
    ["Carrier", 5],
    ["Battleship", 4],
    ["Destroyer", 3],
    ["Submarine", 3],
    ["Patrol Boat", 2],
  ];

  const boardWithFleet = () => {
    const board = createGameboard(10);
    board.place("Carrier", 5, [0, 0], "horizontal");
    board.place("Battleship", 4, [0, 2], "horizontal");
    board.place("Destroyer", 3, [0, 4], "horizontal");
    board.place("Submarine", 3, [0, 6], "horizontal");
    board.place("Patrol Boat", 2, [0, 8], "horizontal");
    return board;
  };

  it("always finishes the board", () => {
    for (let game = 0; game < 40; game++) {
      const board = boardWithFleet();
      const shots = playOut(createHunter(10), board);
      expect(board.allSunk()).toBe(true);
      expect(shots).toBeLessThanOrEqual(100);
    }
  });

  it("needs far fewer shots than firing at random", () => {
    const average = (make) => {
      let total = 0;
      const games = 60;
      for (let i = 0; i < games; i++) total += playOut(make(), boardWithFleet());
      return total / games;
    };

    const hunting = average(() => createHunter(10));
    const blind = average(() => createHunter(10, Math.random, { targeting: false }));

    expect(hunting).toBeLessThan(blind);
    // the whole point of targeting; if this ever gets close, targeting broke
    expect(hunting).toBeLessThan(blind * 0.85);
  });

  it("cannot see the board it is firing at", () => {
    // the hunter is only ever handed the result of its own shots
    const hunter = createHunter(10);
    expect(Object.keys(hunter)).not.toContain("board");
    expect(hunter.nextShot.length).toBe(0);
  });

  void fleet;
});
