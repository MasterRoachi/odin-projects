/* =========================================================
   Etch-A-Sketch
   Odin Project Foundations — DOM manipulation (rebuilt)

   Sections: state, grid, painting, knobs, free draw, controls.
   The paint model knows nothing about how a cell was reached —
   knobs, arrow keys and the mouse all end up calling paint(i).
   ========================================================= */

const MAX_SIDE = 100;
const STEP_DEGREES = 15; // knob rotation needed to advance one cell

const els = {
  screen: document.querySelector("#screen"),
  shell: document.querySelector("#shell"),
  knobX: document.querySelector("#knob-x"),
  knobY: document.querySelector("#knob-y"),
  ink: document.querySelector("#ink"),
  inkChip: document.querySelector("#ink-chip"),
  size: document.querySelector("#size"),
  sizeValue: document.querySelector("#size-value"),
  shake: document.querySelector("#shake"),
  save: document.querySelector("#save"),
  modeKnobs: document.querySelector("#mode-knobs"),
  modeFree: document.querySelector("#mode-free"),
  tools: document.querySelectorAll("[data-tool]"),
};

/* ---------------------------------------------------------
   1. State

   Cell colour and depth live in typed arrays rather than on
   the elements: at 100x100 that is 10,000 cells, and reading
   style back off the DOM for every pointer move is the thing
   that makes these grids feel sludgy.
   --------------------------------------------------------- */

const state = {
  n: 16,
  tool: "pen",
  mode: "knobs",
  ink: 0x1d1b17,
  cx: 0,
  cy: 0,
  started: false,
};

let cells = [];
let colors = new Int32Array(0); // packed rgb, or -1 for an untouched cell
let depth = new Uint8Array(0); // 0-10, how many passes have darkened it

const idx = (x, y) => y * state.n + x;
const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

/* ---------------------------------------------------------
   2. The grid
   --------------------------------------------------------- */

function sizeCells() {
  // clientWidth is rounded to an integer while the real content box is
  // fractional, so dividing by it can overflow the row by a fraction of a
  // pixel and wrap the last cell onto the next line. Measure the true width
  // and snap down to 1/64px — the unit the layout engine itself uses — so
  // a row can never round up past the container.
  const width = els.screen.getBoundingClientRect().width;
  if (!width) return;
  const px = Math.floor((width / state.n) * 64) / 64;
  els.screen.style.setProperty("--cell", `${px}px`);
}

function buildGrid(n) {
  state.n = clamp(Math.round(n), 2, MAX_SIDE);

  const total = state.n * state.n;
  colors = new Int32Array(total).fill(-1);
  depth = new Uint8Array(total);
  cells = new Array(total);

  const fragment = document.createDocumentFragment();
  for (let i = 0; i < total; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.dataset.i = i;
    cells[i] = cell;
    fragment.append(cell);
  }

  els.screen.replaceChildren(fragment);
  sizeCells();

  state.cx = Math.floor(state.n / 2);
  state.cy = Math.floor(state.n / 2);
  state.started = false;

  els.sizeValue.textContent = `${state.n} × ${state.n}`;
  drawCursor();
}

/* ---------------------------------------------------------
   3. Painting
   --------------------------------------------------------- */

function randomColor() {
  return (
    (Math.floor(Math.random() * 256) << 16) |
    (Math.floor(Math.random() * 256) << 8) |
    Math.floor(Math.random() * 256)
  );
}

function paint(i) {
  if (i < 0 || i >= colors.length) return;

  switch (state.tool) {
    case "pen":
      colors[i] = state.ink;
      depth[i] = 10;
      break;

    case "rainbow":
      colors[i] = randomColor();
      depth[i] = 10;
      break;

    // ten passes take a cell from untouched to solid
    case "shade":
      if (colors[i] < 0) colors[i] = state.ink;
      depth[i] = Math.min(10, depth[i] + 1);
      break;

    case "eraser":
      colors[i] = -1;
      depth[i] = 0;
      break;
  }

  render(i);
}

function render(i) {
  const packed = colors[i];

  if (packed < 0) {
    cells[i].style.backgroundColor = "";
    return;
  }

  const r = (packed >> 16) & 255;
  const g = (packed >> 8) & 255;
  const b = packed & 255;
  cells[i].style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${depth[i] / 10})`;
}

function clearAll() {
  colors.fill(-1);
  depth.fill(0);
  for (let i = 0; i < cells.length; i++) cells[i].style.backgroundColor = "";
  state.started = false;
}

/* ---------------------------------------------------------
   4. The cursor, and the knobs that drive it
   --------------------------------------------------------- */

let cursorCell = null;

function drawCursor() {
  if (cursorCell) cursorCell.classList.remove("cursor");
  if (state.mode !== "knobs") {
    cursorCell = null;
    return;
  }
  cursorCell = cells[idx(state.cx, state.cy)] || null;
  if (cursorCell) cursorCell.classList.add("cursor");
}

function moveCursor(dx, dy) {
  const nx = clamp(state.cx + dx, 0, state.n - 1);
  const ny = clamp(state.cy + dy, 0, state.n - 1);
  if (nx === state.cx && ny === state.cy) return;

  // the real toy starts drawing from wherever the stylus already is
  if (!state.started) {
    paint(idx(state.cx, state.cy));
    state.started = true;
  }

  state.cx = nx;
  state.cy = ny;
  paint(idx(nx, ny));
  drawCursor();
}

function angleFrom(centre, event) {
  return (
    (Math.atan2(event.clientY - centre.y, event.clientX - centre.x) * 180) / Math.PI
  );
}

function initKnob(knob, applyStep) {
  const face = knob.querySelector(".knob-face");
  let centre = null;
  let last = null;
  let rotation = 0; // total degrees turned since the page loaded
  let taken = 0; // cells stepped so far, kept in step with `rotation`

  knob.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    setMode("knobs");
    try {
      knob.setPointerCapture(event.pointerId);
    } catch {
      /* capture is a convenience; the drag still works without it */
    }
    // The centre is measured once per drag rather than per move. Re-reading
    // the rect of an element that is itself being rotated lets sub-pixel
    // rendering wobble the centre by a fraction of a degree, and it forces a
    // layout on every single pointermove.
    const rect = face.getBoundingClientRect();
    centre = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    last = angleFrom(centre, event);
  });

  knob.addEventListener("pointermove", (event) => {
    if (last === null || centre === null) return;

    const now = angleFrom(centre, event);
    let delta = now - last;
    // crossing the -180/180 seam would otherwise read as a full spin
    if (delta > 180) delta -= 360;
    else if (delta < -180) delta += 360;
    last = now;

    rotation += delta;
    face.style.rotate = `${rotation.toFixed(1)}deg`;

    // Steps are derived from the total rotation rather than a running carry.
    // Subtracting a step from a carry re-rounds every time, so a slow turn
    // silently loses cells a fast one keeps; comparing against the absolute
    // angle cannot drift no matter how the movement is chopped up.
    // an exact multiple can land a hair under after float division, so nudge
    // the boundary outward before truncating
    const turns = rotation / STEP_DEGREES;
    const target = Math.trunc(turns + (turns < 0 ? -1e-6 : 1e-6));
    while (taken < target) {
      taken += 1;
      applyStep(1);
    }
    while (taken > target) {
      taken -= 1;
      applyStep(-1);
    }
  });

  const release = (event) => {
    if (last === null) return;
    last = null;
    centre = null;
    try {
      knob.releasePointerCapture(event.pointerId);
    } catch {
      /* the pointer was already gone */
    }
  };

  knob.addEventListener("pointerup", release);
  knob.addEventListener("pointercancel", release);
}

initKnob(els.knobX, (direction) => moveCursor(direction, 0));
initKnob(els.knobY, (direction) => moveCursor(0, direction));

document.addEventListener("keydown", (event) => {
  if (state.mode !== "knobs") return;

  const moves = {
    ArrowLeft: [-1, 0],
    ArrowRight: [1, 0],
    ArrowUp: [0, -1],
    ArrowDown: [0, 1],
  };
  const move = moves[event.key];
  if (!move) return;

  event.preventDefault();
  moveCursor(move[0], move[1]);
});

/* ---------------------------------------------------------
   5. Free draw
   --------------------------------------------------------- */

function cellIndexFrom(target) {
  if (!target || !target.dataset || target.dataset.i === undefined) return -1;
  return Number(target.dataset.i);
}

// a mouse gets pointerover per cell for free
els.screen.addEventListener("pointerover", (event) => {
  if (state.mode !== "free" || event.pointerType !== "mouse") return;
  paint(cellIndexFrom(event.target));
});

// touch and pen do not, so those are resolved by hit-testing instead
els.screen.addEventListener("pointermove", (event) => {
  if (state.mode !== "free" || event.pointerType === "mouse") return;
  event.preventDefault();
  const target = document.elementFromPoint(event.clientX, event.clientY);
  paint(cellIndexFrom(target));
});

/* ---------------------------------------------------------
   6. Controls
   --------------------------------------------------------- */

function setMode(mode) {
  state.mode = mode;
  els.modeKnobs.setAttribute("aria-pressed", String(mode === "knobs"));
  els.modeFree.setAttribute("aria-pressed", String(mode === "free"));
  els.screen.classList.toggle("is-knobs", mode === "knobs");
  drawCursor();
}

function setTool(tool) {
  state.tool = tool;
  els.tools.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.tool === tool));
  });
}

els.modeKnobs.addEventListener("click", () => setMode("knobs"));
els.modeFree.addEventListener("click", () => setMode("free"));
els.tools.forEach((button) => {
  button.addEventListener("click", () => setTool(button.dataset.tool));
});

els.ink.addEventListener("input", () => {
  state.ink = parseInt(els.ink.value.slice(1), 16);
  els.inkChip.style.background = els.ink.value;
});

els.size.addEventListener("input", () => {
  els.sizeValue.textContent = `${els.size.value} × ${els.size.value}`;
});

// rebuilding on every tick of the drag would throw away the sketch 100 times
els.size.addEventListener("change", () => buildGrid(Number(els.size.value)));

els.shake.addEventListener("click", () => {
  clearAll();
  els.shell.classList.remove("shaking");
  void els.shell.offsetWidth;
  els.shell.classList.add("shaking");
});

els.shell.addEventListener("animationend", () => {
  els.shell.classList.remove("shaking");
});

function savePng() {
  const SIZE = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;

  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#adb2a2";
  ctx.fillRect(0, 0, SIZE, SIZE);

  const step = SIZE / state.n;
  for (let i = 0; i < colors.length; i++) {
    if (colors[i] < 0) continue;
    const r = (colors[i] >> 16) & 255;
    const g = (colors[i] >> 8) & 255;
    const b = colors[i] & 255;
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${depth[i] / 10})`;
    ctx.fillRect(
      (i % state.n) * step,
      Math.floor(i / state.n) * step,
      Math.ceil(step),
      Math.ceil(step)
    );
  }

  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `etch-a-sketch-${state.n}x${state.n}.png`;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, "image/png");
}

els.save.addEventListener("click", savePng);

// the screen is fluid, so cell size has to be recomputed when it changes
new ResizeObserver(sizeCells).observe(els.screen);

els.inkChip.style.background = els.ink.value;
setMode("knobs");
setTool("pen");
buildGrid(16);
