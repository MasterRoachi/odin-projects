/* =========================================================
   Drawing a board.

   Reads a gameboard and puts marks on squares. It never
   changes one — every mutation goes through the game.
   ========================================================= */

export const FILES = "abcdefghij";
export const label = ([x, y]) => `${FILES[x]}${y + 1}`;

/**
 * Fills a container with 100 cell buttons.
 *
 * Buttons rather than divs so the grid can be played from a keyboard without
 * any extra work, and so a disabled square genuinely refuses clicks instead
 * of relying on a handler to ignore them.
 */
export function buildBoard(container, size, onPick) {
  container.replaceChildren();

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "cell";
      cell.dataset.x = x;
      cell.dataset.y = y;
      // placed explicitly rather than auto-flowed, so that the hull outlines
      // can be placed explicitly too and sit on top of these without
      // displacing them
      cell.style.gridColumn = x + 1;
      cell.style.gridRow = y + 1;
      cell.setAttribute("aria-label", label([x, y]));
      if (onPick) cell.addEventListener("click", () => onPick([x, y]));
      container.append(cell);
    }
  }

  return container;
}

export const cellAt = (container, [x, y]) =>
  container.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);

/** The rendered size of one square, measured rather than assumed. */
export function cellSize(container) {
  const first = container.querySelector(".cell");
  return first ? first.getBoundingClientRect().width : 0;
}

/**
 * Draws the state of a board.
 *
 * `reveal` decides whether ships that are still afloat are drawn. Your own
 * board reveals everything; the enemy's reveals only what has already sunk,
 * which is the whole tension of the game.
 */
export function renderBoard(container, board, { reveal = false, lastShot = null } = {}) {
  container.querySelectorAll(".mark").forEach((m) => m.remove());
  container.querySelectorAll(".hull-overlay").forEach((h) => h.remove());
  container.querySelectorAll(".cell").forEach((c) => c.classList.remove("last-shot"));

  const sunk = new Set(board.sunkCells().map((c) => c.join(",")));

  for (let x = 0; x < board.size; x++) {
    for (let y = 0; y < board.size; y++) {
      if (!board.wasAttacked([x, y])) continue;

      const cell = cellAt(container, [x, y]);
      if (!cell) continue;

      const mark = document.createElement("span");
      const isHit = board.shipAt([x, y]) !== null;
      mark.className = `mark ${isHit ? "hit" : "miss"}${sunk.has(`${x},${y}`) ? " sunk" : ""}`;
      cell.append(mark);
    }
  }

  drawHulls(container, board, reveal);

  if (lastShot) {
    const cell = cellAt(container, lastShot);
    if (cell) cell.classList.add("last-shot");
  }
}

/**
 * Outlines each ship as one shape across the squares it fills, rather than
 * shading the squares individually — a rectangle drawn round the whole hull
 * is what a person does on paper, and it reads as one object.
 *
 * Placed as a grid item spanning the right tracks, not positioned in pixels.
 * The pixel version worked until the board changed width, at which point
 * every outline was left at its old size — a five-square hull 126px long over
 * cells that had become 34px each. Spanning grid tracks costs no measurement
 * and cannot go stale, because the grid resizes it.
 */
function drawHulls(container, board, reveal) {
  board.ships.forEach((ship) => {
    const isSunk = ship.isSunk();
    if (!reveal && !isSunk) return;

    const cells = board.cellsOf(ship);
    if (cells.length === 0) return;

    const xs = cells.map((c) => c[0]);
    const ys = cells.map((c) => c[1]);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);

    const hull = document.createElement("div");
    hull.className = `hull-overlay${reveal ? "" : " enemy"}`;
    hull.style.gridColumn = `${minX + 1} / span ${Math.max(...xs) - minX + 1}`;
    hull.style.gridRow = `${minY + 1} / span ${Math.max(...ys) - minY + 1}`;
    hull.title = `${ship.name}${isSunk ? " (sunk)" : ""}`;
    container.append(hull);
  });
}

/** Locks or unlocks every square, e.g. while it is not your turn. */
export function setPlayable(container, playable, board = null) {
  container.querySelectorAll(".cell").forEach((cell) => {
    const coord = [Number(cell.dataset.x), Number(cell.dataset.y)];
    cell.disabled = !playable || (board !== null && board.wasAttacked(coord));
  });
}
