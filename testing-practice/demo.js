/* =========================================================
   The demo page.

   It imports the same modules the test suite imports — there
   is no second copy of the logic here, so if the page shows
   the right answer, the tested code produced it.
   ========================================================= */

import { capitalize } from "./src/capitalize.js";
import { reverseString } from "./src/reverseString.js";
import { calculator } from "./src/calculator.js";
import { caesarCipher } from "./src/caesarCipher.js";
import { analyzeArray } from "./src/analyzeArray.js";

const el = (tag, props = {}, children = []) => {
  const node = document.createElement(tag);
  Object.entries(props).forEach(([key, value]) => {
    if (value === null || value === undefined || value === false) return;
    if (key === "class") node.className = value;
    else if (key === "text") node.textContent = value;
    else if (key.startsWith("on")) node.addEventListener(key.slice(2).toLowerCase(), value);
    else node.setAttribute(key, value);
  });
  [].concat(children).forEach((child) => {
    if (child === null || child === undefined || child === false) return;
    node.append(child.nodeType ? child : document.createTextNode(String(child)));
  });
  return node;
};

/* ---------------------------------------------------------
   The demos
   --------------------------------------------------------- */

const DEMOS = [
  {
    name: "capitalize",
    signature: "capitalize(text)",
    blurb: "Only the first character — not every word.",
    fields: [{ key: "text", label: "text", value: "hello world", width: "wide" }],
    run: ({ text }) => capitalize(text),
  },
  {
    name: "reverseString",
    signature: "reverseString(text)",
    blurb: "Reversed by code point, so emoji survive the trip.",
    fields: [{ key: "text", label: "text", value: "The quick brown 🦊", width: "wide" }],
    run: ({ text }) => reverseString(text),
  },
  {
    name: "calculator",
    signature: "calculator[op](a, b)",
    blurb: "Dividing by zero throws rather than returning Infinity.",
    fields: [
      { key: "a", label: "a", value: "9", type: "number" },
      { key: "op", label: "operation", value: "divide", options: ["add", "subtract", "multiply", "divide"] },
      { key: "b", label: "b", value: "0", type: "number" },
    ],
    run: ({ a, op, b }) => calculator[op](Number(a), Number(b)),
  },
  {
    name: "caesarCipher",
    signature: "caesarCipher(text, shift)",
    blurb: "Wraps round the alphabet, keeps case, ignores punctuation. Negative shifts decipher.",
    fields: [
      { key: "text", label: "text", value: "Hello, World!", width: "wide" },
      { key: "shift", label: "shift", value: "3", type: "number" },
    ],
    run: ({ text, shift }) => caesarCipher(text, Number(shift)),
  },
  {
    name: "analyzeArray",
    signature: "analyzeArray(numbers)",
    blurb: "An empty array throws — there is no honest average of nothing.",
    fields: [{ key: "numbers", label: "numbers", value: "1, 8, 3, 4, 2, 6", width: "wide" }],
    run: ({ numbers }) => {
      const parsed = numbers
        .split(",")
        .map((part) => part.trim())
        .filter((part) => part !== "")
        .map(Number);
      return analyzeArray(parsed);
    },
  },
];

function show(value) {
  if (typeof value === "object" && value !== null) return JSON.stringify(value, null, 2);
  return String(value);
}

function demoCard(demo) {
  const inputs = {};
  const output = el("pre", { class: "output" });

  const update = () => {
    const args = Object.fromEntries(
      Object.entries(inputs).map(([key, node]) => [key, node.value])
    );
    try {
      output.textContent = show(demo.run(args));
      output.className = "output";
    } catch (error) {
      // the refusals are part of the design, so they are shown as results
      output.textContent = `${error.constructor.name}: ${error.message}`;
      output.className = "output is-throw";
    }
  };

  const controls = demo.fields.map((field) => {
    const node = field.options
      ? el(
          "select",
          { onInput: update },
          field.options.map((option) =>
            el("option", { value: option, selected: option === field.value, text: option })
          )
        )
      : el("input", {
          type: field.type ?? "text",
          value: field.value,
          spellcheck: "false",
          onInput: update,
        });

    inputs[field.key] = node;

    return el("label", { class: `field ${field.width ?? ""}` }, [
      el("span", { text: field.label }),
      node,
    ]);
  });

  update();

  return el("section", { class: "demo" }, [
    el("div", { class: "demo-head" }, [
      el("h2", { text: demo.name }),
      el("code", { class: "sig", text: demo.signature }),
    ]),
    el("p", { class: "blurb", text: demo.blurb }),
    el("div", { class: "controls" }, controls),
    el("div", { class: "result" }, [el("span", { class: "arrow", text: "→" }), output]),
  ]);
}

document.querySelector("#demos").append(...DEMOS.map(demoCard));

/* ---------------------------------------------------------
   The suite's last result
   --------------------------------------------------------- */

const suite = document.querySelector("#suite");

fetch("./test-summary.json")
  .then((response) => (response.ok ? response.json() : Promise.reject()))
  .then((summary) => {
    const when = new Date(summary.startTime).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    suite.append(
      el("p", { class: `verdict ${summary.success ? "is-pass" : "is-fail"}` }, [
        el("span", { class: "tick", text: summary.success ? "✓" : "✕" }),
        `${summary.numPassedTests} of ${summary.numTotalTests} tests passing`,
      ]),
      el(
        "ul",
        { class: "files" },
        summary.files.map((file) =>
          el("li", {}, [
            el("code", { text: file.name }),
            el("span", { class: "n", text: `${file.assertions}` }),
          ])
        )
      ),
      el("p", {
        class: "when",
        // a recorded number, not a live one — say so rather than implying
        // the suite ran when the page loaded
        text: `Recorded from npm test on ${when}. Run it yourself to check.`,
      })
    );
  })
  .catch(() => {
    suite.append(
      el("p", { class: "when", text: "Run npm test to see the suite." })
    );
  });
