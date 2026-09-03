/* =========================================================
   Two Trees.

   The same values built two ways, searched side by side.

   Both drawings come from the real Tree class — there is no
   second implementation here. Tree A is `new Tree(values)`.
   Tree B is an empty Tree with the same values inserted one
   at a time in sorted order, which is the worst thing you can
   do to a binary search tree and takes no special effort to
   arrange: it is what happens whenever data arrives ordered.
   ========================================================= */

import { Tree } from "./binarySearchTree.js";

const SVG_NS = "http://www.w3.org/2000/svg";

const Y_STEP = 44;
const MARGIN_TOP = 26;
const MARGIN_X = 30;
const DIM_GUTTER = 34; // room down the right edge for the dimension line
const STEP_MS = 260;

const dom = {
  count: document.querySelector("#count"),
  reroll: document.querySelector("#reroll"),
  target: document.querySelector("#target"),
  search: document.querySelector("#search"),
  lucky: document.querySelector("#lucky"),
  missing: document.querySelector("#missing"),
  rebalance: document.querySelector("#rebalance"),
  hint: document.querySelector("#hint"),
  verdict: document.querySelector("#verdict"),
  labelB: document.querySelector("#label-b"),
  capBTitle: document.querySelector("#cap-b-title"),
  capBNote: document.querySelector("#cap-b-note"),
};

/* How tree B is described. It stops being degenerate the moment it is
   rebalanced, and the page should stop calling it that. */
const CAPTION_B = {
  skewed: {
    label: "degenerate",
    title: "B — insert() in sorted order",
    note: "every value is larger than the last, so every value goes right",
  },
  fixed: {
    label: "rebalanced",
    title: "B — after rebalance()",
    note: "read back in order, rebuilt from the middle out — same values, new shape",
  },
};

function describeB(state) {
  dom.labelB.textContent = CAPTION_B[state].label;
  dom.capBTitle.textContent = CAPTION_B[state].title;
  dom.capBNote.textContent = CAPTION_B[state].note;
  dom.rebalance.disabled = state === "fixed";
}

/** The two sides, each with its own tree, frame, svg and scoreboard cell. */
const sides = {
  balanced: {
    tree: null,
    svg: document.querySelector("#svg-balanced"),
    frame: document.querySelector("#frame-balanced"),
    score: document.querySelector("#score-balanced"),
    note: document.querySelector("[data-note-balanced]"),
    nodes: new Map(),
  },
  skewed: {
    tree: null,
    svg: document.querySelector("#svg-skewed"),
    frame: document.querySelector("#frame-skewed"),
    score: document.querySelector("#score-skewed"),
    note: document.querySelector("[data-note-skewed]"),
    nodes: new Map(),
  },
};

let values = [];
let timer = null;

/* ---------------------------------------------------------
   Values
   --------------------------------------------------------- */

/**
 * Distinct random values, spaced so that most numbers a person might type are
 * *not* in the tree — which makes an unsuccessful search easy to demonstrate.
 */
function makeValues(count) {
  const pool = new Set();
  while (pool.size < count) pool.add(1 + Math.floor(Math.random() * (count * 6)));
  return [...pool];
}

function rebuild() {
  stop();
  values = makeValues(Number(dom.count.value));

  sides.balanced.tree = new Tree(values);

  // sorted inserts into an empty tree: every value is bigger than the last,
  // so every value hangs off the right of the one before it
  const chain = new Tree();
  [...values].sort((a, b) => a - b).forEach((value) => chain.insert(value));
  sides.skewed.tree = chain;

  Object.values(sides).forEach(draw);
  describeB("skewed");
  resetScores();
  say(
    `${values.length} values, ${Math.min(...values)} to ${Math.max(...values)}. ` +
      `Both trees hold all of them, and both obey the search rule — only the shape differs.`
  );
}

/* ---------------------------------------------------------
   Layout
   --------------------------------------------------------- */

/**
 * Where each node goes.
 *
 * Horizontal position is the node's place in the in-order traversal, which for
 * a search tree means left-to-right is also smallest-to-largest — the drawing
 * is a sorted list with the structure drawn above it. Vertical position is
 * depth.
 *
 * Both drawings are fitted to the same width, so the difference between them
 * shows up as height. That is the honest comparison: tree A is five rows deep,
 * tree B is as deep as it has values.
 */
function layout(root, width) {
  const placed = [];
  let order = 0;
  let deepest = 0;

  (function walk(node, depth) {
    if (node === null) return;
    walk(node.left, depth + 1);
    deepest = Math.max(deepest, depth);
    placed.push({ node, order: order++, depth });
    walk(node.right, depth + 1);
  })(root, 0);

  const span = Math.max(1, placed.length - 1);
  const usable = Math.max(40, width - MARGIN_X * 2 - DIM_GUTTER);
  const xStep = usable / span;

  const positions = new Map();
  placed.forEach(({ node, order: i, depth }) => {
    positions.set(node, { x: MARGIN_X + i * xStep, y: MARGIN_TOP + depth * Y_STEP });
  });

  return {
    positions,
    xStep,
    height: MARGIN_TOP * 2 + deepest * Y_STEP,
    depth: deepest,
    /*
     * Sized from the gap between neighbours, with almost no floor. A floor of
     * 6 looked fine until 63 values, where the gap drops under 7px and every
     * circle overlapped its neighbours.
     */
    radius: Math.max(2.4, Math.min(11, xStep * 0.44)),
  };
}

/* ---------------------------------------------------------
   Drawing
   --------------------------------------------------------- */

const svgEl = (tag, attrs = {}) => {
  const node = document.createElementNS(SVG_NS, tag);
  Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
  return node;
};

function draw(side) {
  const width = side.frame.clientWidth || 460;
  const { positions, xStep, height, depth, radius } = layout(side.tree.root, width);

  side.svg.setAttribute("width", width);
  side.svg.setAttribute("height", height);
  side.svg.replaceChildren();
  side.nodes = new Map();
  side.layoutHeight = height;
  side.drawnWidth = width;

  const edges = svgEl("g");
  const nodes = svgEl("g");

  positions.forEach((point, node) => {
    ["left", "right"].forEach((branch) => {
      const child = node[branch];
      if (!child) return;
      const to = positions.get(child);
      const line = svgEl("line", { x1: point.x, y1: point.y, x2: to.x, y2: to.y });
      line.classList.add("edge");
      edges.append(line);
      // remembered on the child, since a path arrives at a child along one edge
      side.nodes.set(child, { ...(side.nodes.get(child) || {}), edge: line });
    });
  });

  // a three-digit label is about 15px wide, so the gap between neighbours is
  // what decides whether numbers fit — not the radius
  const labelled = xStep >= 13;

  positions.forEach((point, node) => {
    const group = svgEl("g");
    group.classList.add("node");

    const circle = svgEl("circle", { cx: point.x, cy: point.y, r: radius });
    group.append(circle);

    if (labelled) {
      const text = svgEl("text", { x: point.x, y: point.y });
      text.textContent = node.data;
      group.append(text);
    } else {
      // no room for the number, so the value goes in a tooltip instead
      const title = svgEl("title");
      title.textContent = node.data;
      group.append(title);
    }

    nodes.append(group);
    side.nodes.set(node, { ...(side.nodes.get(node) || {}), group, y: point.y });
  });

  side.svg.append(edges, nodes, dimension(width, depth, height));

  const rows = depth + 1;
  const overflows = height > side.frame.clientHeight;
  const tight = labelled ? "" : " · too tight to label, hover for values";
  side.note.textContent = overflows
    ? `${rows} rows — taller than the frame, so it scrolls${tight}`
    : `${rows} rows — the whole drawing fits${tight}`;
  side.note.classList.toggle("is-long", overflows);
}

/** The dimension line down the right edge, giving the tree height in edges. */
function dimension(width, depth, height) {
  const group = svgEl("g");
  const x = width - DIM_GUTTER / 2 - 4;
  const top = MARGIN_TOP;
  const bottom = MARGIN_TOP + depth * Y_STEP;

  const spine = svgEl("line", { x1: x, y1: top, x2: x, y2: bottom });
  spine.classList.add("dim");
  group.append(spine);

  [top, bottom].forEach((y) => {
    const tick = svgEl("line", { x1: x - 4, y1: y, x2: x + 4, y2: y });
    tick.classList.add("dim");
    group.append(tick);
  });

  const label = svgEl("text", {
    x: x + 8,
    y: (top + bottom) / 2,
    transform: `rotate(-90 ${x + 8} ${(top + bottom) / 2})`,
    "text-anchor": "middle",
  });
  label.classList.add("dim-label");
  label.textContent = `h = ${depth}`;
  group.append(label);

  // keeps the label inside the drawing when the tree is only a row or two
  if (bottom - top < 40) label.setAttribute("transform", "");
  void height;
  return group;
}

/* ---------------------------------------------------------
   Searching
   --------------------------------------------------------- */

/**
 * The nodes a search touches, in order.
 *
 * This is the search itself, written out so the steps can be drawn — it makes
 * the same comparisons `Tree.find` does, in the same order.
 */
function pathTo(tree, target) {
  const path = [];
  let current = tree.root;

  while (current !== null) {
    path.push(current);
    if (current.data === target) return { path, found: true };
    current = target < current.data ? current.left : current.right;
  }

  return { path, found: false };
}

function stop() {
  if (timer) clearInterval(timer);
  timer = null;
  dom.search.disabled = false;
}

function clearMarks() {
  Object.values(sides).forEach((side) => {
    side.nodes.forEach(({ group, edge }) => {
      if (group) group.classList.remove("is-seen", "is-live", "is-found");
      if (edge) edge.classList.remove("is-path");
    });
    side.score.classList.remove("is-live");
  });
}

function resetScores() {
  Object.entries(sides).forEach(([, side]) => {
    side.score.querySelector("[data-count]").textContent = "0";
    side.score.querySelector("[data-meta]").textContent = `height ${side.tree.height(
      side.tree.root
    )}`;
  });
  dom.verdict.className = "verdict";
  dom.verdict.textContent = "ready";
}

function search(target) {
  stop();
  clearMarks();

  if (!Number.isFinite(target)) {
    say("Type a number to look for.", true);
    return;
  }

  const runs = Object.entries(sides).map(([name, side]) => ({
    name,
    side,
    ...pathTo(side.tree, target),
  }));

  const longest = Math.max(...runs.map((run) => run.path.length));
  let step = 0;

  dom.search.disabled = true;
  runs.forEach(({ side }) => side.score.classList.add("is-live"));
  dom.verdict.className = "verdict";
  dom.verdict.textContent = "searching";

  const tick = () => {
    runs.forEach((run) => {
      if (step >= run.path.length) return;

      const node = run.path[step];
      const record = run.side.nodes.get(node);
      if (!record) return;

      // demote the previous node, promote this one
      if (step > 0) {
        const previous = run.side.nodes.get(run.path[step - 1]);
        if (previous?.group) {
          previous.group.classList.remove("is-live");
          previous.group.classList.add("is-seen");
        }
      }

      record.group.classList.add("is-live");
      if (record.edge) record.edge.classList.add("is-path");
      run.side.score.querySelector("[data-count]").textContent = step + 1;

      keepInView(run.side, record.y);

      const last = step === run.path.length - 1;
      if (last && run.found) {
        record.group.classList.remove("is-live");
        record.group.classList.add("is-found");
      }
    });

    step += 1;
    if (step < longest) return;

    clearInterval(timer);
    timer = null;
    dom.search.disabled = false;
    finish(runs, target);
  };

  tick();
  timer = setInterval(tick, STEP_MS);
}

/**
 * Follows the search down a drawing that is taller than its frame.
 *
 * scrollTop is assigned outright. Smooth scrolling was tried both ways —
 * scrollTo({behavior:"smooth"}) and scroll-behavior in CSS — and both are
 * silently ignored on this container, leaving the drawing parked at the top
 * while the search ran on somewhere below. A jump that works beats an easing
 * that does not, and between discrete comparison steps it reads fine.
 *
 * Only scrolls when the node has actually gone out of view, so a drawing that
 * fits is left where the reader put it.
 */
function keepInView(side, y) {
  const frame = side.frame;
  if (side.layoutHeight <= frame.clientHeight) return;

  const pad = 70;
  const top = frame.scrollTop;
  const bottom = top + frame.clientHeight;
  if (y > top + pad && y < bottom - pad) return;

  frame.scrollTop = Math.max(0, y - frame.clientHeight / 2);
}

function finish(runs, target) {
  const [a, b] = runs;
  const fast = a.path.length;
  const slow = b.path.length;
  const found = a.found;

  dom.verdict.className = `verdict ${found ? "is-done" : "is-miss"}`;
  dom.verdict.textContent = found ? `${target} found` : `${target} not here`;

  runs.forEach(({ side }) => side.score.classList.remove("is-live"));

  const ratio = fast === 0 ? 0 : slow / fast;
  const verb = found ? "found" : "ruled out";

  say(
    slow === fast
      ? `${target} ${verb} in ${fast} comparisons either way — this one happened to sit near the top of both.`
      : `${target} ${verb} in ${fast} comparisons on the left and ${slow} on the right. ` +
          `The degenerate tree did ${ratio.toFixed(1)}× the work for the same answer.`
  );
}

function say(text, warn = false) {
  dom.hint.textContent = text;
  dom.hint.classList.toggle("is-warn", warn);
}

/* ---------------------------------------------------------
   Wiring
   --------------------------------------------------------- */

dom.reroll.addEventListener("click", rebuild);
dom.count.addEventListener("change", rebuild);

dom.search.addEventListener("click", () => search(Number(dom.target.value)));

dom.target.addEventListener("keydown", (event) => {
  if (event.key === "Enter") dom.search.click();
});

dom.lucky.addEventListener("click", () => {
  // bias towards deep values, since a value near the root is a dull race
  const sorted = [...values].sort((a, b) => a - b);
  const pick = sorted[Math.floor(sorted.length * (0.55 + Math.random() * 0.42))];
  dom.target.value = pick;
  search(pick);
});

dom.missing.addEventListener("click", () => {
  const held = new Set(values);
  let guess = Math.max(...values);
  while (held.has(guess)) guess -= 1;
  dom.target.value = guess;
  search(guess);
});

dom.rebalance.addEventListener("click", () => {
  stop();
  const before = sides.skewed.tree.height(sides.skewed.tree.root);
  sides.skewed.tree.rebalance();
  draw(sides.skewed);
  clearMarks();
  describeB("fixed");
  resetScores();
  say(
    `rebalance() read tree B in order, which gave back the sorted values, and rebuilt it from the middle out. ` +
      `Height ${before} → ${sides.skewed.tree.height(sides.skewed.tree.root)}, same values, same rules.`
  );
});

/*
 * Redrawing when a frame changes width.
 *
 * The drawings are laid out in pixels against the frame they sit in, so a
 * width change makes them wrong until they are rebuilt.
 *
 * This polls rather than listening. Both event-based options were tried and
 * both failed here: the window resize event did not arrive when the layout
 * restacked, and ResizeObserver never fired at all, not even the initial
 * callback the spec promises — leaving a 521px drawing clipped inside a 346px
 * frame. Comparing two integers twice a second costs nothing and cannot be
 * stubbed out.
 *
 * Only width matters, and a redraw discards whatever search is on screen, so
 * nothing happens unless a frame has genuinely changed.
 */
function checkWidths() {
  const stale = Object.values(sides).filter((side) => side.frame.clientWidth !== side.drawnWidth);
  if (stale.length === 0) return;

  stop();
  stale.forEach((side) => draw(side));
  clearMarks();
  resetScores();
}

setInterval(checkWidths, 500);

rebuild();
