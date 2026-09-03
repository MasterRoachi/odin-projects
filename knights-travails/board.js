/* =========================================================
   The board.

   It draws the real search. `explore` returns the squares in
   the order it actually visited them and stops at the target,
   so the animation is not a reconstruction — it is a replay.
   ========================================================= */

import { knightMoves, explore, distanceGrid, SIZE } from "./knightMoves.js";

const FILES = "abcdefgh";
const square = ([x, y]) => `${FILES[x]}${y + 1}`;

const LOOK_MS = 34; // between squares while the search spreads
const PATH_MS = 110; // between squares while the route is drawn back
const HOP_MS = 300; // between squares while the knight moves

const dom = {
  board: document.querySelector("#board"),
  ranks: document.querySelector(".ranks"),
  files: document.querySelector(".files"),
  status: document.querySelector("#status"),
  moves: document.querySelector("#moves"),
  looked: document.querySelector("#looked"),
  route: document.querySelector("#route"),
  random: document.querySelector("#random"),
  reset: document.querySelector("#reset"),
  heat: document.querySelector("#heat"),
  legend: document.querySelector("#legend"),
  ramp: document.querySelector(".ramp"),
};

/** Every square button, indexed by "x,y". */
const cells = new Map();

let start = null;
let busy = false;
const timers = [];

/* ---------------------------------------------------------
   Building the board
   --------------------------------------------------------- */

function build() {
  // rank 8 at the top, file a on the left — the way a board is drawn, which is
  // not the way the array is indexed
  for (let y = SIZE - 1; y >= 0; y--) {
    for (let x = 0; x < SIZE; x++) {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = `sq${(x + y) % 2 === 0 ? " dark" : ""}`;
      cell.dataset.x = x;
      cell.dataset.y = y;
      cell.setAttribute("aria-label", square([x, y]));
      cell.addEventListener("click", () => choose([x, y]));
      dom.board.append(cell);
      cells.set(`${x},${y}`, cell);
    }
  }

  const knight = document.createElement("div");
  knight.className = "knight";
  knight.id = "knight";
  knight.textContent = "♞";
  knight.hidden = true;
  dom.board.append(knight);
  dom.knight = knight;

  for (let y = SIZE; y >= 1; y--) dom.ranks.append(label(y));
  for (const file of FILES) dom.files.append(label(file));

  for (let d = 0; d <= 6; d++) {
    const swatch = document.createElement("li");
    swatch.dataset.ring = d;
    swatch.style.background = `hsl(232 48% ${lightness(d)}%)`;
    swatch.textContent = d;
    dom.ramp.append(swatch);
  }
}

const label = (text) => {
  const span = document.createElement("span");
  span.textContent = text;
  return span;
};

/** Further away is darker. Six moves is the furthest anything can be. */
const lightness = (d) => 92 - Math.min(d, 6) * 7;

/* ---------------------------------------------------------
   State
   --------------------------------------------------------- */

function clearTimers() {
  timers.forEach(clearTimeout);
  timers.length = 0;
}

const later = (fn, ms) => timers.push(setTimeout(fn, ms));

function clearBoard() {
  cells.forEach((cell) => {
    cell.className = `sq${(Number(cell.dataset.x) + Number(cell.dataset.y)) % 2 === 0 ? " dark" : ""}`;
    cell.style.removeProperty("--ring-l");
    delete cell.dataset.ring;
    cell.textContent = "";
    cell.disabled = false;
  });
}

function placeKnight(sq) {
  const [x, y] = sq;
  dom.knight.hidden = false;
  // the board is drawn top-down, so rank 8 is row 0
  dom.knight.style.transform = `translate(${x * 100}%, ${(SIZE - 1 - y) * 100}%)`;
}

function reset() {
  clearTimers();
  busy = false;
  start = null;
  clearBoard();
  dom.knight.hidden = true;
  dom.moves.textContent = "—";
  dom.looked.textContent = "—";
  dom.route.textContent = "Nothing yet.";
  dom.heat.checked = false;
  dom.legend.hidden = true;
  say("Click any square to put the knight on it.");
}

function say(html) {
  dom.status.innerHTML = html;
}

/* ---------------------------------------------------------
   Choosing squares
   --------------------------------------------------------- */

function choose(sq) {
  if (busy) return;

  // no start yet, or starting over after a completed run
  if (start === null) {
    start = sq;
    clearBoard();
    placeKnight(sq);
    cells.get(`${sq[0]},${sq[1]}`).classList.add("is-start");
    dom.moves.textContent = "—";
    dom.looked.textContent = "—";
    dom.route.textContent = "Nothing yet.";

    if (dom.heat.checked) {
      showHeat();
      say(`Knight on <b>${square(sq)}</b>. Every square shows how many moves away it is.`);
    } else {
      say(`Knight on <b>${square(sq)}</b>. Now click where it should end up.`);
    }
    return;
  }

  if (square(start) === square(sq)) {
    say(`The knight is already on <b>${square(sq)}</b>. Pick a different square, or Clear.`);
    return;
  }

  run(start, sq);
}

/* ---------------------------------------------------------
   Running the search
   --------------------------------------------------------- */

function run(from, to) {
  clearTimers();
  busy = true;
  dom.heat.checked = false;
  dom.legend.hidden = true;
  clearBoard();

  cells.get(`${from[0]},${from[1]}`).classList.add("is-start");
  cells.get(`${to[0]},${to[1]}`).classList.add("is-target");
  placeKnight(from);

  const { order, distance } = explore(from, to);
  const path = knightMoves(from, to);

  dom.looked.textContent = order.length;
  dom.moves.textContent = "…";
  dom.route.textContent = "searching…";
  say(
    `Looking outward from <b>${square(from)}</b> — every square one move away, then every square ` +
      `two moves away, and so on.`
  );

  // 1. the search spreading, in the order it really happened
  order.forEach((sq, i) => {
    later(() => {
      const cell = cells.get(`${sq[0]},${sq[1]}`);
      const d = distance.get(`${sq[0]},${sq[1]}`);
      cell.classList.add("reached");
      cell.dataset.ring = d;
      cell.style.setProperty("--ring-l", `${lightness(d)}%`);
      cell.textContent = d;
    }, i * LOOK_MS);
  });

  const spread = order.length * LOOK_MS;

  // 2. the route, read back from the target
  later(() => {
    say(
      `Reached <b>${square(to)}</b> after looking at <b>${order.length}</b> squares. ` +
        `The search stopped there — nothing found later could be closer.`
    );
    path.forEach((sq, i) => {
      later(() => {
        const cell = cells.get(`${sq[0]},${sq[1]}`);
        cell.classList.add("on-path");
        cell.textContent = i;
      }, i * PATH_MS);
    });
  }, spread + 220);

  const traced = spread + 220 + path.length * PATH_MS;

  // 3. the knight actually going
  later(() => {
    path.forEach((sq, i) => later(() => placeKnight(sq), i * HOP_MS));
  }, traced + 200);

  const moves = path.length - 1;
  later(() => {
    busy = false;
    start = null;
    dom.moves.textContent = moves;
    dom.route.textContent = path.map(square).join(" → ");
    say(
      `<b>${square(from)}</b> to <b>${square(to)}</b> in <b>${moves} ${
        moves === 1 ? "move" : "moves"
      }</b>, after examining ${order.length} of the 64 squares. Click anywhere to start again.`
    );
  }, traced + 200 + path.length * HOP_MS);
}

/* ---------------------------------------------------------
   The whole-board view
   --------------------------------------------------------- */

function showHeat() {
  if (start === null) return;
  const grid = distanceGrid(start);

  cells.forEach((cell, id) => {
    const [x, y] = id.split(",").map(Number);
    const d = grid[x][y];
    cell.classList.add("reached");
    cell.dataset.ring = d;
    cell.style.setProperty("--ring-l", `${lightness(d)}%`);
    cell.textContent = d;
  });

  cells.get(`${start[0]},${start[1]}`).classList.add("is-start");
  dom.legend.hidden = false;
}

/* ---------------------------------------------------------
   Wiring
   --------------------------------------------------------- */

dom.reset.addEventListener("click", reset);

dom.random.addEventListener("click", () => {
  clearTimers();
  busy = false;
  const pick = () => [Math.floor(Math.random() * SIZE), Math.floor(Math.random() * SIZE)];
  const from = pick();
  let to = pick();
  while (square(to) === square(from)) to = pick();
  start = from;
  run(from, to);
});

dom.heat.addEventListener("change", () => {
  if (busy) {
    dom.heat.checked = false;
    return;
  }
  if (!dom.heat.checked) {
    clearBoard();
    dom.legend.hidden = true;
    if (start) {
      placeKnight(start);
      cells.get(`${start[0]},${start[1]}`).classList.add("is-start");
    }
    return;
  }
  if (start === null) {
    dom.heat.checked = false;
    say("Put the knight on a square first, then this will fill the board in around it.");
    return;
  }
  clearBoard();
  showHeat();
  say(
    `Every square, numbered by how many moves it is from <b>${square(start)}</b>. ` +
      `Note the square diagonally touching the knight: <b>four</b> moves.`
  );
});

build();
reset();
