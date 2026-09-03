/* =========================================================
   The fleet, and how to scatter one across a board.
   ========================================================= */

export const FLEET = [
  { name: "Carrier", length: 5 },
  { name: "Battleship", length: 4 },
  { name: "Destroyer", length: 3 },
  { name: "Submarine", length: 3 },
  { name: "Patrol Boat", length: 2 },
];

/**
 * Drops a whole fleet on an empty board at random.
 *
 * Rejection sampling — guess a spot, keep it if it fits, guess again if it
 * does not. Crude, but on a ten by ten board with seventeen squares of ship
 * it lands almost immediately, and the alternative (working out every legal
 * arrangement in advance) is a great deal of work for a board this empty.
 *
 * The attempt limit exists so that a caller passing a fleet too big for the
 * board gets an error rather than a hung tab.
 */
export function placeRandomly(board, fleet = FLEET, random = Math.random) {
  fleet.forEach(({ name, length }) => {
    for (let attempt = 0; attempt < 1000; attempt++) {
      const orientation = random() < 0.5 ? "horizontal" : "vertical";
      const origin = [
        Math.floor(random() * board.size),
        Math.floor(random() * board.size),
      ];

      if (board.canPlace(length, origin, orientation)) {
        board.place(name, length, origin, orientation);
        return;
      }
    }

    throw new Error(`could not find room for the ${name} after 1000 tries`);
  });

  return board;
}

export default FLEET;
