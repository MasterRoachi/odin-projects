/* =========================================================
   Quartz, Parchment, Shears
   Odin Project Foundations — Rock Paper Scissors (rebuilt)

   Four sections, in dependency order: rules, sound, state,
   DOM. The rules never touch the DOM and never make a noise —
   `playRound` decides what happened and hands back a plain
   description. Everything downstream reacts to that.
   ========================================================= */

/* ---------------------------------------------------------
   1. Rules — no DOM, no audio
   --------------------------------------------------------- */

const CHOICES = ["quartz", "parchment", "shears"];
const WINNING_SCORE = 5;

const BEATS = {
  quartz: { loser: "shears", verb: "blunts" },
  parchment: { loser: "quartz", verb: "wraps" },
  shears: { loser: "parchment", verb: "cuts" },
};

const KEYS = { q: "quartz", p: "parchment", s: "shears" };

const IMAGES = {
  quartz: "./images/cutouts/quartz.png",
  parchment: "./images/cutouts/parchment.png",
  shears: "./images/cutouts/shears.png",
};

function getComputerChoice() {
  return CHOICES[Math.floor(Math.random() * CHOICES.length)];
}

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
   2. Sound — synthesised, so there are no audio files to ship

   Every voice is built from oscillators and filtered noise at
   runtime. Browsers refuse to start an AudioContext until the
   user has interacted, so the context is created lazily and
   resumed on the first real gesture.
   --------------------------------------------------------- */

const Sound = (() => {
  const STORAGE_KEY = "qps-sound";
  let ctx = null;
  let master = null;
  let enabled = true;
  let lastPlayed = 0;

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) enabled = saved === "on";
  } catch {
    /* private mode, blocked storage — the default stands */
  }

  function ensure() {
    if (!ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      ctx = new Ctx();
      master = ctx.createGain();
      master.gain.value = 0.32;
      master.connect(ctx.destination);
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function noise(duration) {
    const frames = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    return src;
  }

  function burst({ at, duration, freq, q, gain, type = "bandpass" }) {
    const src = noise(duration);
    const filter = ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = freq;
    filter.Q.value = q;

    const env = ctx.createGain();
    env.gain.setValueAtTime(0, at);
    env.gain.linearRampToValueAtTime(gain, at + 0.006);
    env.gain.exponentialRampToValueAtTime(0.0001, at + duration);

    src.connect(filter).connect(env).connect(master);
    src.start(at);
    src.stop(at + duration);
  }

  function tone({ at, duration, freq, gain, type = "sine", glide }) {
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, at);
    if (glide) osc.frequency.exponentialRampToValueAtTime(glide, at + duration);

    const env = ctx.createGain();
    env.gain.setValueAtTime(0, at);
    env.gain.linearRampToValueAtTime(gain, at + 0.012);
    env.gain.exponentialRampToValueAtTime(0.0001, at + duration);

    osc.connect(env).connect(master);
    osc.start(at);
    osc.stop(at + duration + 0.02);
  }

  const voices = {
    // two metallic closes: the blades passing each other, twice
    shears() {
      const t = ctx.currentTime;
      [0, 0.11].forEach((offset) => {
        burst({ at: t + offset, duration: 0.07, freq: 4200, q: 7, gain: 0.55 });
        tone({
          at: t + offset + 0.004,
          duration: 0.09,
          freq: 2600,
          glide: 1800,
          gain: 0.16,
          type: "triangle",
        });
      });
    },

    // dry paper: broadband, low Q, a couple of overlapping shakes
    parchment() {
      const t = ctx.currentTime;
      [0, 0.06, 0.13].forEach((offset, i) => {
        burst({
          at: t + offset,
          duration: 0.17 - i * 0.03,
          freq: 1500 + i * 320,
          q: 0.9,
          gain: 0.3 - i * 0.06,
        });
      });
    },

    // a struck crystal: three partials ringing out together
    quartz() {
      const t = ctx.currentTime;
      [
        [1318, 0.16, 0.8],
        [1975, 0.1, 0.65],
        [2637, 0.07, 0.5],
      ].forEach(([freq, gain, duration]) => {
        tone({ at: t, duration, freq, gain, type: "sine" });
      });
      burst({ at: t, duration: 0.03, freq: 6000, q: 3, gain: 0.14 });
    },

    win() {
      const t = ctx.currentTime;
      [523, 659, 784, 1047].forEach((freq, i) => {
        tone({ at: t + i * 0.075, duration: 0.24, freq, gain: 0.2, type: "triangle" });
      });
    },

    lose() {
      const t = ctx.currentTime;
      [440, 370, 294].forEach((freq, i) => {
        tone({ at: t + i * 0.1, duration: 0.3, freq, gain: 0.2, type: "sawtooth" });
      });
    },

    draw() {
      const t = ctx.currentTime;
      tone({ at: t, duration: 0.2, freq: 392, gain: 0.16, type: "triangle" });
      tone({ at: t + 0.09, duration: 0.2, freq: 392, gain: 0.13, type: "triangle" });
    },
  };

  return {
    unlock() {
      if (enabled) ensure();
    },

    play(name, { throttle = 0 } = {}) {
      if (!enabled || !voices[name]) return;
      const now = performance.now();
      if (throttle && now - lastPlayed < throttle) return;
      if (!ensure()) return;
      lastPlayed = now;
      try {
        voices[name]();
      } catch {
        /* a voice failing is never worth breaking the game over */
      }
    },

    get enabled() {
      return enabled;
    },

    toggle() {
      enabled = !enabled;
      if (enabled) {
        ensure();
        this.play("quartz");
      }
      try {
        localStorage.setItem(STORAGE_KEY, enabled ? "on" : "off");
      } catch {
        /* nothing to do */
      }
      return enabled;
    },
  };
})();

/* ---------------------------------------------------------
   3. State
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
  return state.humanScore >= WINNING_SCORE || state.computerScore >= WINNING_SCORE;
}

/* ---------------------------------------------------------
   4. DOM
   --------------------------------------------------------- */

const els = {
  humanScore: document.querySelector("#human-score"),
  computerScore: document.querySelector("#computer-score"),
  humanPips: document.querySelectorAll("#human-pips li"),
  computerPips: document.querySelectorAll("#computer-pips li"),
  humanSlot: document.querySelector("#slot-human"),
  computerSlot: document.querySelector("#slot-computer"),
  verdict: document.querySelector("#verdict"),
  roundNo: document.querySelector("#round-no"),
  ledger: document.querySelector("#ledger"),
  choices: document.querySelectorAll(".choice"),
  reset: document.querySelector("#reset"),
  sound: document.querySelector("#sound"),
};

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

const REVEAL_MS = prefersReducedMotion ? 0 : 700;

function renderScores() {
  els.humanScore.textContent = state.humanScore;
  els.computerScore.textContent = state.computerScore;
  els.humanPips.forEach((p, i) => p.classList.toggle("lit", i < state.humanScore));
  els.computerPips.forEach((p, i) =>
    p.classList.toggle("lit", i < state.computerScore)
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

/** Replaces a stage's contents, keeping its ground shadow. */
function setStage(slot, node) {
  slot.replaceChildren();
  const shadow = document.createElement("span");
  shadow.className = "shadow";
  shadow.setAttribute("aria-hidden", "true");
  slot.append(shadow, node);
}

function showObject(slot, choice, animate) {
  const img = document.createElement("img");
  img.src = IMAGES[choice];
  img.alt = "";
  if (animate) img.classList.add("dealt");
  setStage(slot, img);
}

function showWaiting(slot) {
  const mark = document.createElement("span");
  mark.className = "waiting";
  mark.textContent = "?";
  mark.setAttribute("aria-hidden", "true");
  setStage(slot, mark);
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
   5. Playing
   --------------------------------------------------------- */

async function takeTurn(humanChoice) {
  if (state.busy || state.over) return;

  state.busy = true;
  setChoicesEnabled(false);
  Sound.play(humanChoice);

  const computerChoice = getComputerChoice();

  showObject(els.humanSlot, humanChoice, true);
  showWaiting(els.computerSlot);
  renderVerdict("…", null, false);

  if (REVEAL_MS > 0) {
    els.computerSlot.classList.add("shuffling");
    await wait(REVEAL_MS);
    els.computerSlot.classList.remove("shuffling");
  }

  const result = playRound(humanChoice, computerChoice);
  showObject(els.computerSlot, computerChoice, true);

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
    Sound.play(won ? "win" : "lose");
    setChoicesEnabled(false);
  } else {
    renderVerdict(result.message, result.outcome, false);
    Sound.play(result.outcome === "drew" ? "draw" : result.outcome === "won" ? "win" : "lose");
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

  showWaiting(els.humanSlot);
  showWaiting(els.computerSlot);
  renderScores();
  renderLedger();
  renderVerdict("Choose wisely.", null, false);
  renderRoundNumber();
  setChoicesEnabled(true);
}

/* ---------------------------------------------------------
   6. Wiring
   --------------------------------------------------------- */

els.choices.forEach((button) => {
  const choice = button.dataset.choice;

  button.addEventListener("click", () => takeTurn(choice));

  // the hover performance: each object makes its own noise
  button.addEventListener("pointerenter", () => {
    if (button.disabled) return;
    Sound.play(choice, { throttle: 260 });
  });

  // keyboard users get the same beat when the button takes focus
  button.addEventListener("focus", () => {
    if (button.disabled) return;
    Sound.play(choice, { throttle: 260 });
  });
});

els.reset.addEventListener("click", newGame);

els.sound.addEventListener("click", () => {
  const on = Sound.toggle();
  els.sound.setAttribute("aria-pressed", String(on));
  els.sound.innerHTML = `<span aria-hidden="true">${on ? "♪" : "✕"}</span> Sound: ${on ? "on" : "off"}`;
});

document.addEventListener("keydown", (event) => {
  if (event.metaKey || event.ctrlKey || event.altKey) return;

  const choice = KEYS[event.key.toLowerCase()];

  if (choice) {
    event.preventDefault();
    const button = document.querySelector(`.choice[data-choice="${choice}"]`);
    if (button && !button.disabled) {
      // mirror the hover performance so key play looks the same
      button.classList.add("playing");
      setTimeout(() => button.classList.remove("playing"), 640);
    }
    takeTurn(choice);
    return;
  }

  if (state.over && (event.key === "Enter" || event.key === " ")) {
    event.preventDefault();
    newGame();
  }
});

// browsers will not start audio until the user has actually done something
["pointerdown", "keydown"].forEach((type) => {
  document.addEventListener(type, () => Sound.unlock(), { once: true });
});

// reflect the stored sound preference on load
els.sound.setAttribute("aria-pressed", String(Sound.enabled));
els.sound.innerHTML = `<span aria-hidden="true">${Sound.enabled ? "♪" : "✕"}</span> Sound: ${Sound.enabled ? "on" : "off"}`;

newGame();
