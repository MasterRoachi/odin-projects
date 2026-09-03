/* =========================================================
   Drawing the hash map.

   It renders the real HashMap — bucketSizes() and entries()
   come straight off the instance, and there is no second copy
   of the logic here.
   ========================================================= */

import { HashMap } from "./hashMap.js";

const el = (tag, props = {}, children = []) => {
  const node = document.createElement(tag);
  Object.entries(props).forEach(([key, value]) => {
    if (value === null || value === undefined || value === false) return;
    if (key === "class") node.className = value;
    else if (key === "text") node.textContent = value;
    else if (key === "style") {
      // custom properties have to go through setProperty — assigning
      // node.style["--hue"] does nothing at all, silently
      Object.entries(value).forEach(([prop, val]) => {
        if (prop.startsWith("--")) node.style.setProperty(prop, val);
        else node.style[prop] = val;
      });
    }
    else if (key.startsWith("on")) node.addEventListener(key.slice(2).toLowerCase(), value);
    else node.setAttribute(key, value);
  });
  [].concat(children).forEach((child) => {
    if (child === null || child === undefined || child === false) return;
    node.append(child.nodeType ? child : document.createTextNode(String(child)));
  });
  return node;
};

const map = new HashMap();
const dom = {
  readout: document.querySelector("#readout"),
  chart: document.querySelector("#chart"),
  log: document.querySelector("#log"),
  hint: document.querySelector("#hint"),
  key: document.querySelector("#key"),
  value: document.querySelector("#value"),
};

let lastCapacity = map.capacity;
let flashKeys = new Set();

/* ---------------------------------------------------------
   Colour
   --------------------------------------------------------- */

/**
 * A hue for a key, from the key itself — so a tile keeps its colour when the
 * map grows and it lands in a different bucket. That is what makes the
 * redeal legible: you can follow a colour across the resize.
 */
function hueFor(key) {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) % 360;
  return hash;
}

/* ---------------------------------------------------------
   Rendering
   --------------------------------------------------------- */

function renderReadout() {
  const atCapacity = map.load >= map.loadFactor;

  dom.readout.replaceChildren(
    stat("capacity", map.capacity),
    stat("entries", map.length()),
    stat("load", map.load.toFixed(2)),
    stat("grows at", `${Math.floor(map.capacity * map.loadFactor) + 1} entries`),
    el("div", { class: "gauge" }, [
      el("div", { class: "gauge-track" }, [
        el("div", {
          class: `gauge-fill${atCapacity ? " is-full" : ""}`,
          style: { width: `${Math.min(100, map.load * 100)}%` },
        }),
        el("div", {
          class: "gauge-mark",
          style: { left: `${map.loadFactor * 100}%` },
          title: `load factor ${map.loadFactor}`,
        }),
      ]),
      el("p", { class: "gauge-label", text: `load factor ${map.loadFactor}` }),
    ])
  );
}

const stat = (label, value) =>
  el("div", { class: "stat" }, [
    el("span", { class: "stat-label", text: label }),
    el("span", { class: "stat-value", text: String(value) }),
  ]);

function renderChart() {
  // group the entries by which bucket they hash into
  const byBucket = Array.from({ length: map.capacity }, () => []);
  map.entries().forEach(([key, value]) => byBucket[map.hash(key)].push([key, value]));

  const tallest = Math.max(1, ...byBucket.map((b) => b.length));
  dom.chart.style.setProperty("--tallest", tallest);
  dom.chart.classList.toggle("is-wide", map.capacity > 16);

  dom.chart.replaceChildren(
    ...byBucket.map((entries, index) =>
      el("div", { class: `column${entries.length > 1 ? " is-collision" : ""}` }, [
        el(
          "div",
          { class: "stack" },
          entries.map(([key, value]) =>
            el("div", {
              class: `tile${flashKeys.has(key) ? " is-new" : ""}`,
              style: {
                "--hue": hueFor(key),
              },
              title: `${key} → ${value}  (bucket ${index})`,
              text: key,
            })
          )
        ),
        el("span", { class: "index", text: String(index) }),
      ])
    )
  );

  flashKeys = new Set();
}

function note(text, kind = "") {
  dom.log.prepend(el("li", { class: kind, text }));
  while (dom.log.children.length > 40) dom.log.lastElementChild.remove();
}

function render() {
  renderReadout();
  renderChart();
}

/* ---------------------------------------------------------
   Actions
   --------------------------------------------------------- */

function set(key, value, { quiet = false } = {}) {
  if (!key) {
    dom.hint.textContent = "A key is needed.";
    return;
  }

  const existed = map.has(key);
  const before = map.capacity;

  map.set(key, value);
  flashKeys.add(key);

  if (!quiet) {
    dom.hint.textContent = "";
    note(
      existed
        ? `set('${key}') updated an existing key — length unchanged at ${map.length()}`
        : `set('${key}') → bucket ${map.hash(key)}`
    );
  }

  if (map.capacity !== before) {
    lastCapacity = map.capacity;
    note(
      `grew ${before} → ${map.capacity} buckets and rehashed all ${map.length()} entries — load is now ${map.load.toFixed(2)}`,
      "is-grow"
    );
  }

  render();
}

function remove(key) {
  if (!key) {
    dom.hint.textContent = "A key is needed.";
    return;
  }
  const removed = map.remove(key);
  dom.hint.textContent = "";
  note(removed ? `remove('${key}') → true` : `remove('${key}') → false, it was not there`);
  render();
}

const BRIEF = [
  ["apple", "red"], ["banana", "yellow"], ["carrot", "orange"], ["dog", "brown"],
  ["elephant", "gray"], ["frog", "green"], ["grape", "purple"], ["hat", "black"],
  ["ice cream", "white"], ["jacket", "blue"], ["kite", "pink"], ["lion", "golden"],
];

const EXTRA = [
  ["mango", "amber"], ["newt", "olive"], ["otter", "sable"], ["pear", "russet"],
  ["quince", "gold"], ["raven", "jet"], ["swan", "chalk"], ["tiger", "flame"],
  ["urchin", "ink"], ["viper", "moss"], ["wolf", "slate"], ["yak", "umber"],
];

/* ---------------------------------------------------------
   Wiring
   --------------------------------------------------------- */

document.querySelector("#set").addEventListener("click", () => {
  set(dom.key.value.trim(), dom.value.value.trim() || "—");
  dom.key.value = "";
  dom.value.value = "";
  dom.key.focus();
});

document.querySelector("#remove").addEventListener("click", () => {
  remove(dom.key.value.trim());
  dom.key.value = "";
  dom.key.focus();
});

[dom.key, dom.value].forEach((input) =>
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") document.querySelector("#set").click();
  })
);

document.querySelector("#fill").addEventListener("click", () => {
  BRIEF.forEach(([key, value]) => set(key, value, { quiet: true }));
  note(`filled with the brief's twelve — load is exactly ${map.load.toFixed(2)}`);
  render();
});

document.querySelector("#moon").addEventListener("click", () => set("moon", "silver"));

document.querySelector("#random").addEventListener("click", () => {
  const unused = EXTRA.filter(([key]) => !map.has(key));
  if (unused.length === 0) {
    dom.hint.textContent = "All the spare keys are already in.";
    return;
  }
  const [key, value] = unused[Math.floor(Math.random() * unused.length)];
  set(key, value);
});

document.querySelector("#clear").addEventListener("click", () => {
  map.clear();
  note(`clear() — ${map.capacity} buckets kept, all entries gone`);
  render();
});

render();
note("empty map, 16 buckets");
