/* =========================================================
   A gameboard.

   Holds the ships, knows which squares they cover, and takes
   attacks. Like the ship, it has never heard of the DOM — the
   entire game can be played, and is tested, without one.
   ========================================================= */

import { createShip } from "./ship.js";

export const DEFAULT_SIZE = 10;

const key = ([x, y]) => `${x},${y}`;

/**
 * The squares a ship of this length would cover from here.
 *
 * Returned whether or not they are legal — the caller checks. Working out the
 * footprint and judging it are two different jobs, and separating them is what
 * lets `canPlace` ask the question without committing to an answer.
 */
function footprint(length, [x, y], orientation) {
  return Array.from({ length }, (_, i) =>
    orientation === "vertical" ? [x, y + i] : [x + i, y]
  );
}

export function createGameboard(size = DEFAULT_SIZE) {
  /** grid[x][y] holds the ship occupying that square, or null. */
  const grid = Array.from({ length: size }, () => Array.from({ length: size }, () => null));

  const fleet = []; // { ship, cells }
  const shots = new Set();
  const missedShots = [];

  const onBoard = ([x, y]) =>
    Number.isInteger(x) && Number.isInteger(y) && x >= 0 && x < size && y >= 0 && y < size;

  const legal = (cells) => cells.every((c) => onBoard(c) && grid[c[0]][c[1]] === null);

  const board = {
    size,

    get ships() {
      return fleet.map((entry) => entry.ship);
    },

    get missedShots() {
      return missedShots.map((c) => [...c]);
    },

    /** Would a ship of this length fit here, without asking for it to happen. */
    canPlace(length, origin, orientation = "horizontal") {
      if (!Number.isInteger(length) || length < 1) return false;
      return legal(footprint(length, origin, orientation));
    },

    /**
     * Puts a ship on the board.
     *
     * Throws rather than returning false, because a refused placement is a
     * bug in the caller — the UI is expected to ask `canPlace` first. Nothing
     * is written to the grid until the whole footprint has been checked, so a
     * refusal cannot leave half a ship behind.
     */
    place(name, length, origin, orientation = "horizontal") {
      const cells = footprint(length, origin, orientation);

      if (!cells.every(onBoard)) {
        throw new RangeError(`${name} would hang off the edge from ${key(origin)}`);
      }
      if (!legal(cells)) {
        throw new Error(`${name} would overlap another ship at ${key(origin)}`);
      }

      const ship = createShip(name, length);
      cells.forEach(([x, y]) => {
        grid[x][y] = ship;
      });
      fleet.push({ ship, cells });

      return ship;
    },

    shipAt(coord) {
      if (!onBoard(coord)) return null;
      return grid[coord[0]][coord[1]];
    },

    wasAttacked(coord) {
      return shots.has(key(coord));
    },

    /**
     * Takes a shot.
     *
     * Always returns a result rather than throwing for a repeat, because a
     * repeat is a thing a player can legitimately try — the answer is simply
     * "you already did that". An off-board shot is a different matter and is
     * a programming error.
     */
    receiveAttack(coord) {
      if (!onBoard(coord)) {
        throw new RangeError(`${key(coord)} is not on a ${size}×${size} board`);
      }

      if (shots.has(key(coord))) {
        return { repeat: true, hit: false, sunk: false, ship: null, sunkCells: null };
      }
      shots.add(key(coord));

      const ship = grid[coord[0]][coord[1]];
      if (ship === null) {
        missedShots.push([...coord]);
        return { repeat: false, hit: false, sunk: false, ship: null, sunkCells: null };
      }

      ship.hit();
      const sunk = ship.isSunk();

      return {
        repeat: false,
        hit: true,
        sunk,
        ship,
        // the attacker is told which squares the ship filled, exactly as a
        // person announcing "you sank my battleship" reveals it
        sunkCells: sunk ? board.cellsOf(ship).map((c) => [...c]) : null,
      };
    },

    cellsOf(ship) {
      const entry = fleet.find((e) => e.ship === ship);
      return entry ? entry.cells : [];
    },

    /** Every square belonging to a ship that has already gone down. */
    sunkCells() {
      return fleet.filter((e) => e.ship.isSunk()).flatMap((e) => e.cells.map((c) => [...c]));
    },

    /**
     * An empty board is not won. Without this, a game would be over before
     * anyone had placed anything.
     */
    allSunk() {
      return fleet.length > 0 && fleet.every((e) => e.ship.isSunk());
    },
  };

  return board;
}

export default createGameboard;
