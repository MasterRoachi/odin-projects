/* =========================================================
   Wiring.

   Everything below this line knows about the DOM. Everything
   in ../model knows nothing about it, and that split is the
   reason the game has 58 tests and this file has none.
   ========================================================= */

import { createGame } from "../model/game.js";
import { FLEET } from "../model/fleet.js";
import { buildBoard, renderBoard, setPlayable, label } from "./boardView.js";
import { createPlacement } from "./placement.js";

const SHIP_SQUARES = FLEET.reduce((total, ship) => total + ship.length, 0);
const REPLY_DELAY = 620; // long enough to read what happened

const dom = {
  mine: document.querySelector("#board-mine"),
  theirs: document.querySelector("#board-theirs"),
  setup: document.querySelector("#setup"),
  tray: document.querySelector("#tray"),
  shuffle: document.querySelector("#shuffle"),
  clear: document.querySelector("#clear"),
  ready: document.querySelector("#ready"),
  again: document.querySelector("#again"),
  subtitle: document.querySelector("#subtitle"),
  noteMine: document.querySelector("#note-mine"),
  noteTheirs: document.querySelector("#note-theirs"),
  scoreMine: document.querySelector("#score-mine"),
  scoreTheirs: document.querySelector("#score-theirs"),
  log: document.querySelector("#log"),
};

let game = createGame();
let placement = null;
let lastEnemyShot = null;
let busy = false;

/* ---------------------------------------------------------
   Drawing
   --------------------------------------------------------- */

const damage = (board) => board.ships.reduce((total, ship) => total + ship.hits, 0);

function draw() {
  const human = game.player("human").board;
  const enemy = game.player("computer").board;

  renderBoard(dom.mine, human, { reveal: true, lastShot: lastEnemyShot });
  renderBoard(dom.theirs, enemy, { reveal: false });

  setPlayable(dom.mine, false);
  setPlayable(dom.theirs, game.state === "playing" && game.turn === "human" && !busy, enemy);

  dom.scoreMine.innerHTML = `<span class="score-num">${damage(human)}</span> of ${SHIP_SQUARES} hit`;
  dom.scoreTheirs.innerHTML = `<span class="score-num">${damage(enemy)}</span> of ${SHIP_SQUARES} hit`;

  if (game.state === "setup") {
    const left = FLEET.length - placement.placed.length;
    dom.noteMine.textContent = left === 0 ? "all five down" : `${left} still to place`;
    dom.noteTheirs.textContent = "hidden until you fire";
    dom.ready.disabled = !placement.complete;
  }
}

function say(text) {
  dom.subtitle.innerHTML = text;
}

function note(text, who) {
  const li = document.createElement("li");
  li.className = who;
  li.textContent = text;
  dom.log.prepend(li);
  while (dom.log.children.length > 40) dom.log.lastElementChild.remove();
}

/* ---------------------------------------------------------
   Setup
   --------------------------------------------------------- */

function beginSetup() {
  game = createGame();
  lastEnemyShot = null;
  busy = false;
  dom.log.replaceChildren();
  dom.again.hidden = true;
  dom.setup.hidden = false;
  dom.ready.hidden = false;

  buildBoard(dom.theirs, game.size, fire);
  buildBoard(dom.mine, game.size, null);

  placement = createPlacement({
    game,
    container: dom.mine,
    fleet: FLEET,
    tray: dom.tray,
    onChange: draw,
  });
  placement.render();

  // a placed ship can be picked back up by dragging it off again
  dom.mine.addEventListener("pointerdown", onMineDown);

  say("Drag your fleet onto the left grid. Press <b>R</b> while dragging to turn a ship, or hit <b>shuffle</b>.");
  draw();
}

function onMineDown(event) {
  if (game.state !== "setup") return;
  const cell = event.target.closest(".cell");
  if (!cell) return;
  placement.tryPickUp(event, [Number(cell.dataset.x), Number(cell.dataset.y)]);
}

/* ---------------------------------------------------------
   Playing
   --------------------------------------------------------- */

function start() {
  if (!placement.complete) return;

  game.randomiseFleet("computer");
  game.start();

  dom.setup.hidden = true;
  dom.mine.removeEventListener("pointerdown", onMineDown);
  say("Your shot. Click a square on <b>their</b> grid.");
  note("Fleets down. You fire first.", "mine");
  draw();
}

function fire(coord) {
  if (game.state !== "playing" || game.turn !== "human" || busy) return;

  const result = game.fireAt(coord);
  if (result.repeat) {
    say(`You have already fired at <b>${label(coord)}</b>.`);
    return;
  }

  if (result.sunk) note(`You sank their ${result.ship.name}!`, "mine");
  else note(`You → ${label(coord)}: ${result.hit ? "hit" : "miss"}`, "mine");

  draw();

  if (game.state === "over") return finish();

  busy = true;
  setPlayable(dom.theirs, false);
  say("They are thinking…");
  setTimeout(reply, REPLY_DELAY);
}

function reply() {
  const { coord, result } = game.computerTurn();
  lastEnemyShot = coord;

  if (result.sunk) note(`They sank your ${result.ship.name}!`, "theirs");
  else note(`Them → ${label(coord)}: ${result.hit ? "hit" : "miss"}`, "theirs");

  busy = false;
  draw();

  if (game.state === "over") return finish();

  say(
    result.hit
      ? `They hit you at <b>${label(coord)}</b>. Your shot.`
      : `They missed at <b>${label(coord)}</b>. Your shot.`
  );
}

function finish() {
  const won = game.winner === "human";

  // there is no reason to keep their fleet secret once it is over
  renderBoard(dom.theirs, game.player("computer").board, { reveal: true });
  setPlayable(dom.theirs, false);

  say(
    won
      ? "<b>You won.</b> Their whole fleet is on the bottom."
      : "<b>They won.</b> Every ship you had is sunk."
  );
  note(won ? "You won." : "They won.", won ? "mine" : "theirs");

  dom.noteTheirs.textContent = "all revealed";
  dom.again.hidden = false;
  dom.again.focus({ preventScroll: true });
}

/* ---------------------------------------------------------
   Wiring
   --------------------------------------------------------- */

dom.shuffle.addEventListener("click", () => {
  if (game.state !== "setup") return;
  placement.shuffle();
  draw();
});

dom.clear.addEventListener("click", () => {
  if (game.state !== "setup") return;
  placement.clear();
  draw();
});

dom.ready.addEventListener("click", start);
dom.again.addEventListener("click", beginSetup);

beginSetup();
