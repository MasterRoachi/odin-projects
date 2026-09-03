/* =========================================================
   Knight's Travails.

   The shortest sequence of knight moves between two squares.

   The board is not stored anywhere. There is no array of 64
   things — a square's neighbours are worked out from the
   square itself, on demand. The graph is implied by the rules
   of the piece, which is the actual idea here: a graph does
   not have to be a data structure, it can just be a function
   that answers "what is next to this?"
   ========================================================= */

export const SIZE = 8;

/** The eight ways a knight moves: two one way, one the other. */
const OFFSETS = [
  [1, 2],
  [2, 1],
  [2, -1],
  [1, -2],
  [-1, -2],
  [-2, -1],
  [-2, 1],
  [-1, 2],
];

const onBoard = ([x, y]) => x >= 0 && x < SIZE && y >= 0 && y < SIZE;

const key = ([x, y]) => `${x},${y}`;
const unkey = (id) => id.split(",").map(Number);

function assertSquare(square, name) {
  if (!Array.isArray(square) || square.length !== 2 || !onBoard(square)) {
    throw new RangeError(`${name} must be two numbers from 0 to ${SIZE - 1}, got ${JSON.stringify(square)}`);
  }
}

/** Every legal square a knight can reach from here in one move. */
export function movesFrom(square) {
  const [x, y] = square;
  return OFFSETS.map(([dx, dy]) => [x + dx, y + dy]).filter(onBoard);
}

/**
 * Breadth-first search outward from a square.
 *
 * Breadth-first, not depth-first, and the difference is the whole assignment.
 * Depth-first would charge off down one line of moves and find *a* route,
 * probably a long one. Breadth-first visits every square one move away, then
 * every square two moves away, and so on — so the first time it arrives at a
 * square, it has arrived by the shortest route available. There is never any
 * need to go back and improve on an answer.
 *
 * Given a goal, it stops the moment that square is first reached, because at
 * that moment the answer for it is already final — nothing found later can be
 * closer. Without a goal it maps the whole board.
 *
 * Returns how far away each square reached is, which square each one was first
 * reached from, and the order they were visited in — that last one is only for
 * drawing the search, not for finding the path.
 */
export function explore(start, goal = null) {
  assertSquare(start, "start");
  if (goal !== null) assertSquare(goal, "goal");

  const distance = new Map([[key(start), 0]]);
  const cameFrom = new Map([[key(start), null]]);
  const order = [start];

  if (goal !== null && key(goal) === key(start)) {
    return { distance, cameFrom, order, found: true };
  }

  const queue = [start];
  for (let i = 0; i < queue.length; i++) {
    const square = queue[i];

    for (const next of movesFrom(square)) {
      const id = key(next);
      if (distance.has(id)) continue; // already reached, and by a shorter route

      distance.set(id, distance.get(key(square)) + 1);
      cameFrom.set(id, square);
      order.push(next);
      queue.push(next);

      if (goal !== null && id === key(goal)) {
        return { distance, cameFrom, order, found: true };
      }
    }
  }

  return { distance, cameFrom, order, found: goal === null };
}

/**
 * The shortest path from one square to another, inclusive of both.
 *
 * The search records where each square was first reached from, so the path is
 * read backwards from the target and reversed. Following the trail back is
 * cheaper than trying to remember a whole path for every square on the way.
 */
export function knightMoves(start, end) {
  assertSquare(start, "start");
  assertSquare(end, "end");

  const { cameFrom } = explore(start, end);

  const path = [];
  let current = end;
  while (current !== null) {
    path.push(current);
    current = cameFrom.get(key(current));
  }

  return path.reverse();
}

/**
 * How many moves to every square on the board, as an 8×8 grid indexed [x][y].
 *
 * Every square is reachable from every other, so nothing here is ever
 * undefined — which is not obvious, and is worth knowing before trusting it.
 */
export function distanceGrid(start) {
  const { distance } = explore(start);
  return Array.from({ length: SIZE }, (_, x) =>
    Array.from({ length: SIZE }, (_, y) => distance.get(key([x, y])))
  );
}

export { key, unkey, onBoard };
