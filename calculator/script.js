/* =========================================================
   Coolculator
   Odin Project Foundations — Calculator (rebuilt)

   Sections: arithmetic, formatting, state, tape, render,
   input, wiring.

   Arithmetic is pure and knows nothing about the DOM, and
   every input — mouse or keyboard — funnels through the same
   press() so there is only one place the machine can change.

   No eval() and no new Function(), as the lesson insists.
   ========================================================= */

/* ---------------------------------------------------------
   1. Arithmetic
   --------------------------------------------------------- */

function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

function multiply(a, b) {
  return a * b;
}

function divide(a, b) {
  if (b === 0) throw new RangeError("DIVIDE_BY_ZERO");
  return a / b;
}

function operate(operator, a, b) {
  switch (operator) {
    case "+":
      return add(a, b);
    case "-":
      return subtract(a, b);
    case "*":
      return multiply(a, b);
    case "/":
      return divide(a, b);
    default:
      throw new Error(`unknown operator: ${operator}`);
  }
}

const SYMBOL = { "+": "+", "-": "−", "*": "×", "/": "÷" };

const SNARK = [
  "Nice try. Nothing divides by zero.",
  "Dividing by zero. Bold. No.",
  "That way lies madness. Not by zero.",
  "Zero refuses to participate.",
];

/* ---------------------------------------------------------
   2. Formatting

   Floating point will happily hand back 0.30000000000000004,
   and a long result would run off the readout, so everything
   on the way to the display goes through here.
   --------------------------------------------------------- */

const PRECISION = 12;

function format(value) {
  if (!Number.isFinite(value)) return "Infinity";
  if (value === 0) return "0";

  const magnitude = Math.abs(value);
  if (magnitude >= 1e12 || magnitude < 1e-9) {
    return value.toExponential(6).replace("e+", "e");
  }

  // toPrecision then back through Number drops the float noise and any
  // trailing zeros it introduces
  return String(Number(value.toPrecision(PRECISION)));
}

/* ---------------------------------------------------------
   3. State
   --------------------------------------------------------- */

const state = {
  entry: "", // what is being typed right now, kept as text
  accumulator: null, // the running total, or null before one exists
  pendingOp: null,
  justEvaluated: false,
  memory: 0,
  error: null,
};

function currentValue() {
  if (state.entry !== "") return Number(state.entry);
  if (state.accumulator !== null) return state.accumulator;
  return 0;
}

function resetAll({ note = true } = {}) {
  state.entry = "";
  state.accumulator = null;
  state.pendingOp = null;
  state.justEvaluated = false;
  state.error = null;
  if (note) printNote("clear");
}

/* ---------------------------------------------------------
   4. The tape
   --------------------------------------------------------- */

const MAX_TAPE_LINES = 200;

const els = {
  tape: document.querySelector("#tape"),
  expression: document.querySelector("#expression"),
  result: document.querySelector("#result"),
  flagMemory: document.querySelector("#flag-memory"),
  flagError: document.querySelector("#flag-error"),
  keypad: document.querySelector("#keypad"),
  tear: document.querySelector("#tear"),
};

function appendTape(node) {
  els.tape.append(node);
  while (els.tape.children.length > MAX_TAPE_LINES) {
    els.tape.firstElementChild.remove();
  }
  els.tape.scrollTop = els.tape.scrollHeight;
}

function printEntry(text, symbol, isTotal = false) {
  const line = document.createElement("p");
  if (isTotal) line.className = "total";

  const num = document.createElement("span");
  num.className = "num";
  num.textContent = text;

  const sym = document.createElement("span");
  sym.className = "sym";
  sym.textContent = symbol;

  line.append(num, sym);
  appendTape(line);
}

function printNote(text) {
  const line = document.createElement("p");
  line.className = "tape-note";
  line.textContent = `— ${text} —`;
  appendTape(line);
}

function printError(text) {
  const line = document.createElement("p");
  line.className = "tape-error";
  line.textContent = text;
  appendTape(line);
}

/* ---------------------------------------------------------
   5. Render
   --------------------------------------------------------- */

function render() {
  if (state.error) {
    els.result.textContent = state.error;
    els.result.classList.add("is-error");
    els.expression.textContent = " ";
  } else {
    els.result.classList.remove("is-error");
    els.result.textContent =
      state.entry !== ""
        ? state.entry
        : state.accumulator !== null
          ? format(state.accumulator)
          : "0";

    let expression = " ";
    if (state.accumulator !== null && state.pendingOp) {
      expression = `${format(state.accumulator)} ${SYMBOL[state.pendingOp]}`;
      if (state.entry !== "") expression += ` ${state.entry}`;
    }
    els.expression.textContent = expression;
  }

  els.flagMemory.hidden = state.memory === 0;
  els.flagError.hidden = !state.error;

  // the lesson asks for the decimal key to be disabled once one is in play
  const dot = els.keypad.querySelector('[data-key="."]');
  dot.disabled = state.entry.includes(".");
}

/* ---------------------------------------------------------
   6. Input — every route in ends up here
   --------------------------------------------------------- */

const DIGITS = new Set(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]);

function press(key) {
  // an error is cleared by anything except the memory keys
  if (state.error && !key.startsWith("M")) {
    state.error = null;
    state.entry = "";
    state.accumulator = null;
    state.pendingOp = null;
    state.justEvaluated = false;
    if (key === "C") {
      render();
      return;
    }
  }

  if (DIGITS.has(key)) return inputDigit(key);

  switch (key) {
    case ".":
      return inputDecimal();
    case "+":
    case "-":
    case "*":
    case "/":
      return inputOperator(key);
    case "=":
      return inputEquals();
    case "C":
      resetAll();
      return render();
    case "back":
      return inputBackspace();
    case "sign":
      return inputSign();
    case "%":
      return inputPercent();
    case "MC":
      state.memory = 0;
      return render();
    case "MR":
      state.entry = format(state.memory);
      state.justEvaluated = false;
      return render();
    case "M+":
      state.memory += currentValue();
      state.justEvaluated = true;
      return render();
    case "M-":
      state.memory -= currentValue();
      state.justEvaluated = true;
      return render();
  }
}

function inputDigit(digit) {
  // a fresh digit after a total starts a new calculation rather than
  // being appended to the result
  if (state.justEvaluated) {
    state.entry = "";
    state.accumulator = null;
    state.pendingOp = null;
    state.justEvaluated = false;
  }

  if (state.entry === "0") state.entry = "";
  else if (state.entry === "-0") state.entry = "-";

  state.entry += digit;
  render();
}

function inputDecimal() {
  if (state.justEvaluated) {
    state.entry = "";
    state.accumulator = null;
    state.pendingOp = null;
    state.justEvaluated = false;
  }
  if (state.entry.includes(".")) return;
  state.entry = state.entry === "" || state.entry === "-" ? `${state.entry}0.` : `${state.entry}.`;
  render();
}

function inputOperator(operator) {
  state.justEvaluated = false;

  // nothing new typed: swap the pending operator instead of evaluating,
  // so pressing + + does not turn into 2 + 2
  if (state.entry === "") {
    if (state.accumulator === null) state.accumulator = 0;
    state.pendingOp = operator;
    render();
    return;
  }

  const value = Number(state.entry);
  printEntry(state.entry, SYMBOL[operator]);

  if (state.accumulator === null || state.pendingOp === null) {
    state.accumulator = value;
  } else {
    const result = evaluate(state.pendingOp, state.accumulator, value);
    if (result === null) return;
    state.accumulator = result;
    printEntry(format(result), "★", true);
  }

  state.entry = "";
  state.pendingOp = operator;
  render();
}

function inputEquals() {
  // pressing equals with nothing to work on is a no-op rather than a crash
  if (state.pendingOp === null || state.entry === "") {
    state.justEvaluated = state.entry !== "" || state.accumulator !== null;
    render();
    return;
  }

  const value = Number(state.entry);
  printEntry(state.entry, "=");

  const result = evaluate(state.pendingOp, state.accumulator, value);
  if (result === null) return;

  printEntry(format(result), "★", true);
  state.accumulator = result;
  state.entry = "";
  state.pendingOp = null;
  state.justEvaluated = true;
  render();
}

/** Runs an operation, turning a divide-by-zero into a message not a crash. */
function evaluate(operator, a, b) {
  try {
    return operate(operator, a, b);
  } catch (err) {
    if (err instanceof RangeError) {
      state.error = SNARK[Math.floor(Math.random() * SNARK.length)];
      printError("cannot divide by zero");
      state.entry = "";
      state.accumulator = null;
      state.pendingOp = null;
      render();
      return null;
    }
    throw err;
  }
}

function inputBackspace() {
  if (state.justEvaluated) {
    state.entry = "";
    state.justEvaluated = false;
    state.accumulator = null;
    state.pendingOp = null;
    render();
    return;
  }
  state.entry = state.entry.slice(0, -1);
  if (state.entry === "-") state.entry = "";
  render();
}

function inputSign() {
  if (state.entry === "") {
    if (state.accumulator !== null) state.accumulator = -state.accumulator;
  } else {
    state.entry = state.entry.startsWith("-") ? state.entry.slice(1) : `-${state.entry}`;
  }
  render();
}

function inputPercent() {
  if (state.entry === "") return;

  const value = Number(state.entry);
  // on a desk calculator "200 - 10 %" means ten percent *of 200*
  const isAdditive = state.pendingOp === "+" || state.pendingOp === "-";
  const percent =
    isAdditive && state.accumulator !== null
      ? (state.accumulator * value) / 100
      : value / 100;

  state.entry = format(percent);
  render();
}

/* ---------------------------------------------------------
   7. Wiring
   --------------------------------------------------------- */

els.keypad.addEventListener("click", (event) => {
  const button = event.target.closest(".key");
  if (!button || button.disabled) return;
  press(button.dataset.key);
});

els.tear.addEventListener("click", () => {
  els.tape.replaceChildren();
  printNote("coolculator — ready");
});

const KEYMAP = {
  ".": ".",
  ",": ".",
  "+": "+",
  "-": "-",
  "*": "*",
  x: "*",
  "/": "/",
  "=": "=",
  Enter: "=",
  Backspace: "back",
  Escape: "C",
  Delete: "C",
  c: "C",
  "%": "%",
  n: "sign",
};

document.addEventListener("keydown", (event) => {
  if (event.metaKey || event.ctrlKey || event.altKey) return;

  const key = DIGITS.has(event.key) ? event.key : KEYMAP[event.key] ?? KEYMAP[event.key.toLowerCase()];
  if (!key) return;

  event.preventDefault();

  const button = els.keypad.querySelector(`[data-key="${CSS.escape(key)}"]`);
  if (button && button.disabled) return;

  press(key);

  // show the press on the machine so keyboard use looks like key use
  if (button) {
    button.classList.add("pressed");
    setTimeout(() => button.classList.remove("pressed"), 110);
  }
});

render();
