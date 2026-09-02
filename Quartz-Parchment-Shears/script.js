/* =========================================================
   Quartz, Parchment, Shears
   Odin Project Foundations — Rock Paper Scissors (rebuilt)

   Game logic and DOM code are kept in separate sections and
   never call into each other's internals: `playRound` decides
   what happened, `render` decides how it looks. Swapping the
   UI out would not touch a line of the rules.
   ========================================================= */

/* ---------------------------------------------------------
   1. Rules — no DOM in here
   --------------------------------------------------------- */

const CHOICES = ["quartz", "parchment", "shears"];
const WINNING_SCORE = 5;

// what each choice defeats, and the verb it does it with
const BEATS = {
  quartz: { loser: "shears", verb: "blunts" },
  parchment: { loser: "quartz", verb: "wraps" },
  shears: { loser: "parchment", verb: "cuts" },
};

const KEYS = { q: "quartz", p: "parchment", s: "shears" };

const IMAGES = {
  quartz: "./images/Quartz.png",
  parchment: "./images/Parchment.png",
  shears: "./images/Shears.png",
};

function getComputerChoice() {
  return CHOICES[Math.floor(Math.random() * CHOICES.length)];
}

/**
 * Decides a single round. Returns a plain description of what
 * happened and leaves every consequence to the caller.
 */
function playRound(humanChoice, computerChoice) {
  const human = String(humanChoice).toLowerCase();
  const computer = String(computerChoice).toLowerCase();

  if (human === computer) {
    return {
      outcome: "drew",
      human,
      computer,
      message: `Dang flabbit, we drew! Two ${human}s and nothing to show for it.`,
    };
  }

  if (BEATS[human].loser === computer) {
    return {
      outcome: "won",
      human,
      computer,
      message: `Jolly good show! ${title(human)} ${BEATS[human].verb} ${computer}.`,
    };
  }

  return {
    outcome: "lost",
    human,
    computer,
    message: `Alas! ${title(computer)} ${BEATS[computer].verb} ${human}.`,
  };
}

function title(word) {
  return word[0].toUpperCase() + word.slice(1);
}

/* ---------------------------------------------------------
   2. State
   --------------------------------------------------------- */

const state = {
  humanScore: 0,
  computerScore: 0,
  round: 1,
  history: [],
  over: false,
  busy: false,
};

function isGameOver() {
  return (
    state.humanScore >= WINNING_SCORE || state.computerScore >= WINNING_SCORE
  );
}

/* ---------------------------------------------------------
   3. DOM
   --------------------------------------------------------- */

const els = {
  humanScore: document.querySelector("#human-score"),
  computerScore: document.querySelector("#computer-score"),
  humanPips: document.querySelectorAll("#human-pips li"),
  computerPips: document.querySelectorAll("#computer-pips li"),
  humanSlot: document.querySelector("#slot-human .slot-inner"),
  computerSlot: document.querySelector("#slot-computer .slot-inner"),
  verdict: document.querySelector("#verdict"),
  roundNo: document.querySelector("#round-no"),
  ledger: document.querySelector("#ledger"),
  choices: document.querySelectorAll(".choice"),
  reset: document.querySelector("#reset"),
};

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

const REVEAL_MS = prefersReducedMotion ? 0 : 700;

function renderScores() {
  els.humanScore.textContent = state.humanScore;
  els.computerScore.textContent = state.computerScore;

  els.humanPips.forEach((pip, i) => pip.classList.toggle("lit", i < state.humanScore));
  els.computerPips.forEach((pip, i) =>
    pip.classList.toggle("lit", i < state.computerScore)
  );
}

function renderVerdict(text, outcome, isFinal) {
  els.verdict.textContent = text;
  els.verdict.className = "verdict-line";
  if (outcome) els.verdict.classList.add(outcome);
  if (isFinal) els.verdict.classList.add("final");
}

function renderRoundNumber() {
  els.roundNo.textContent = state.over
    ? `${state.history.length} rounds played`
    : `Round ${state.round}`;
}

function showCard(slot, choice, animate) {
  slot.replaceChildren();

  const img = document.createElement("img");
  img.src = IMAGES[choice];
  img.alt = "";
  if (animate) img.classList.add("dealt");

  slot.append(img);
}

function showCardBack(slot) {
  slot.replaceChildren();
  const back = document.createElement("div");
  back.className = "card-back";
  back.setAttribute("aria-hidden", "true");
  slot.append(back);
}

function renderLedger() {
  els.ledger.replaceChildren();

  if (state.history.length === 0) {
    const empty = document.createElement("li");
    empty.className = "ledger-empty";
    empty.textContent = "No rounds played yet.";
    els.ledger.append(empty);
    return;
  }

  const labels = { won: "Won", lost: "Lost", drew: "Drew" };

  // newest first — the round you just played is the one you want to see
  [...state.history].reverse().forEach((entry) => {
    const li = document.createElement("li");

    const no = document.createElement("span");
    no.className = "ledger-round";
    no.textContent = `R${entry.round}`;

    const throws = document.createElement("span");
    throws.className = "ledger-throws";

    const mine = document.createElement("b");
    mine.className = entry.human[0];
    mine.textContent = entry.human;

    const vs = document.createElement("span");
    vs.className = "vs";
    vs.textContent = "vs";

    const theirs = document.createElement("b");
    theirs.className = entry.computer[0];
    theirs.textContent = entry.computer;

    throws.append(mine, vs, theirs);

    const outcome = document.createElement("span");
    outcome.className = `ledger-outcome ${entry.outcome}`;
    outcome.textContent = labels[entry.outcome];

    li.append(no, throws, outcome);
    els.ledger.append(li);
  });
}

function setChoicesEnabled(enabled) {
  els.choices.forEach((btn) => {
    btn.disabled = !enabled;
  });
}

/* ---------------------------------------------------------
   4. Playing
   --------------------------------------------------------- */

async function takeTurn(humanChoice) {
  if (state.busy || state.over) return;

  state.busy = true;
  setChoicesEnabled(false);

  const computerChoice = getComputerChoice();

  showCard(els.humanSlot, humanChoice, true);
  showCardBack(els.computerSlot);
  renderVerdict("…", null, false);

  if (REVEAL_MS > 0) {
    els.computerSlot.classList.add("shuffling");
    await wait(REVEAL_MS);
    els.computerSlot.classList.remove("shuffling");
  }

  const result = playRound(humanChoice, computerChoice);
  showCard(els.computerSlot, computerChoice, true);

  if (result.outcome === "won") state.humanScore += 1;
  if (result.outcome === "lost") state.computerScore += 1;

  state.history.push({ ...result, round: state.round });
  state.round += 1;

  renderScores();
  renderLedger();

  if (isGameOver()) {
    state.over = true;
    const won = state.humanScore > state.computerScore;
    renderVerdict(
      won
        ? "The match is yours. Handsomely done."
        : "The adversary takes the match. Regroup.",
      won ? "won" : "lost",
      true
    );
    setChoicesEnabled(false);
  } else {
    renderVerdict(result.message, result.outcome, false);
    setChoicesEnabled(true);
  }

  renderRoundNumber();
  state.busy = false;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function newGame() {
  state.humanScore = 0;
  state.computerScore = 0;
  state.round = 1;
  state.history = [];
  state.over = false;
  state.busy = false;

  showCardBack(els.humanSlot);
  showCardBack(els.computerSlot);
  renderScores();
  renderLedger();
  renderVerdict("Choose wisely.", null, false);
  renderRoundNumber();
  setChoicesEnabled(true);
}

/* ---------------------------------------------------------
   5. Wiring
   --------------------------------------------------------- */

els.choices.forEach((button) => {
  button.addEventListener("click", () => takeTurn(button.dataset.choice));
});

els.reset.addEventListener("click", newGame);

document.addEventListener("keydown", (event) => {
  if (event.metaKey || event.ctrlKey || event.altKey) return;

  const choice = KEYS[event.key.toLowerCase()];

  if (choice) {
    event.preventDefault();
    takeTurn(choice);
    return;
  }

  if (state.over && (event.key === "Enter" || event.key === " ")) {
    event.preventDefault();
    newGame();
  }
});

newGame();
