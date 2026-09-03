/* =========================================================
   The computer's strategy.

   Two modes, which is how a person plays:

     hunt    — nothing is wounded, so look for something
     target  — something is wounded, so finish it

   It is handed the result of its own shots and nothing else.
   It cannot see the board it is firing at, which is both the
   point and the reason it is easy to test: give it results,
   check where it fires next.
   ========================================================= */

const key = ([x, y]) => `${x},${y}`;
const same = (a, b) => a[0] === b[0] && a[1] === b[1];

const NEIGHBOURS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

/**
 * @param {number} size
 * @param {() => number} random injected so tests can pin it down
 * @param {{targeting?: boolean, lattice?: boolean}} options for comparing strategies
 */
export function createHunter(size = 10, random = Math.random, options = {}) {
  const { targeting = true, lattice = true } = options;

  const tried = new Set();

  /** Hits that have not yet been accounted for by a ship going down. */
  let unresolved = [];

  const onBoard = ([x, y]) => x >= 0 && x < size && y >= 0 && y < size;
  const untried = (c) => onBoard(c) && !tried.has(key(c));
  const pick = (list) => list[Math.floor(random() * list.length)];

  /* ---------------------------------------------------- */

  /** Groups the outstanding hits into runs of touching squares. */
  function clusters() {
    const groups = [];
    const placed = new Set();

    unresolved.forEach((cell) => {
      if (placed.has(key(cell))) return;

      const group = [cell];
      placed.add(key(cell));

      // walk outward through any other unresolved hits touching this one
      for (let i = 0; i < group.length; i++) {
        NEIGHBOURS.forEach(([dx, dy]) => {
          const next = [group[i][0] + dx, group[i][1] + dy];
          if (placed.has(key(next))) return;
          if (!unresolved.some((c) => same(c, next))) return;
          group.push(next);
          placed.add(key(next));
        });
      }

      groups.push(group);
    });

    return groups;
  }

  /**
   * Where to shoot next given one run of hits.
   *
   * A single hit says nothing about which way the ship lies, so all four
   * neighbours are fair. Two or more in a line settle the orientation, and
   * then only the two ends can possibly be more of the same ship — the
   * squares to the side are a different ship or nothing.
   */
  function candidatesFor(group) {
    if (group.length === 1) {
      return NEIGHBOURS.map(([dx, dy]) => [group[0][0] + dx, group[0][1] + dy]);
    }

    const horizontal = group.every((c) => c[1] === group[0][1]);
    const vertical = group.every((c) => c[0] === group[0][0]);

    if (horizontal) {
      const y = group[0][1];
      const xs = group.map((c) => c[0]);
      return [
        [Math.min(...xs) - 1, y],
        [Math.max(...xs) + 1, y],
      ];
    }

    if (vertical) {
      const x = group[0][0];
      const ys = group.map((c) => c[1]);
      return [
        [x, Math.min(...ys) - 1],
        [x, Math.max(...ys) + 1],
      ];
    }

    // bent, so two ships are lying against each other — no line to follow,
    // and every neighbour is back in play
    return group.flatMap((c) => NEIGHBOURS.map(([dx, dy]) => [c[0] + dx, c[1] + dy]));
  }

  function targetShots() {
    for (const group of clusters()) {
      const options = candidatesFor(group).filter(untried);
      if (options.length > 0) return options;
    }
    return [];
  }

  /**
   * Where to shoot when nothing is wounded.
   *
   * The smallest ship is two squares long, so it must cross a square where
   * x + y is even. Sweeping that lattice first finds everything while firing
   * at half as many squares; the rest only get used once the lattice runs out.
   */
  function huntShots() {
    const open = [];
    const spare = [];

    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        if (tried.has(key([x, y]))) continue;
        if (!lattice || (x + y) % 2 === 0) open.push([x, y]);
        else spare.push([x, y]);
      }
    }

    return open.length > 0 ? open : spare;
  }

  /* ---------------------------------------------------- */

  return {
    /** The next square to fire at, or null when the board is used up. */
    nextShot() {
      const options = targeting ? targetShots() : [];
      const from = options.length > 0 ? options : huntShots();
      return from.length > 0 ? pick(from) : null;
    },

    /**
     * Takes in what happened.
     *
     * A sinking is where the outstanding hits get cleared — but only the ones
     * belonging to the ship that sank. Clearing all of them would lose track
     * of a second ship lying alongside the first, and the hunter would wander
     * off and have to find it again.
     */
    record(coord, result) {
      tried.add(key(coord));

      if (result.hit) unresolved.push([...coord]);

      if (result.sunk && result.sunkCells) {
        unresolved = unresolved.filter((c) => !result.sunkCells.some((s) => same(s, c)));
      }
    },

    /** Only for showing what it is thinking; nothing depends on it. */
    get mode() {
      return targeting && targetShots().length > 0 ? "target" : "hunt";
    },

    get wounded() {
      return unresolved.map((c) => [...c]);
    },

    get shotsFired() {
      return tried.size;
    },
  };
}

export default createHunter;
