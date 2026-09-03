/* =========================================================
   Quarry — sign-up form
   Odin Project, Intermediate HTML and CSS (Forms)

   The brief says password matching needs JavaScript from a
   later lesson and to skip it. This does it anyway, along
   with written error messages, a strength meter and reveal
   toggles.

   Validation rules are plain functions: given a value, they
   return a message or null. Nothing in them touches the DOM.
   ========================================================= */

const form = document.querySelector("#signup");
const done = document.querySelector("#done");
const strengthBox = document.querySelector("#strength");
const meterFill = document.querySelector("#meter-fill");
const strengthLabel = document.querySelector("#strength-label");

const fields = ["first", "last", "email", "phone", "password", "confirm"];
const inputs = Object.fromEntries(fields.map((id) => [id, document.querySelector(`#${id}`)]));
const errors = Object.fromEntries(
  fields.map((id) => [id, document.querySelector(`#${id}-error`)])
);

/* ---------------------------------------------------------
   1. Rules — no DOM in here
   --------------------------------------------------------- */

// deliberately loose: the only way to truly validate an address is to send
// mail to it, and over-strict patterns reject real addresses
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^[\d\s+()./-]{7,}$/;

const COMMON = [
  "password",
  "12345678",
  "qwertyui",
  "letmein",
  "iloveyou",
  "welcome1",
  "admin123",
];

const RULES = {
  first: (v) => (v.trim() ? null : "We need a first name."),
  last: (v) => (v.trim() ? null : "We need a last name."),
  email: (v) => {
    if (!v.trim()) return "We need an email address.";
    return EMAIL.test(v.trim()) ? null : "That needs an @ and a domain.";
  },
  phone: (v) => {
    if (!v.trim()) return null; // optional
    return PHONE.test(v.trim()) ? null : "Digits, spaces and + ( ) - . / only.";
  },
  password: (v) => {
    if (!v) return "Pick a password.";
    if (v.length < 8) return `At least 8 characters — ${8 - v.length} to go.`;
    return null;
  },
  confirm: (v, all) => {
    if (!v) return "Type the password again.";
    return v === all.password ? null : "These do not match.";
  },
};

/** Confirm is the one field with something positive to say. */
const AFFIRM = {
  confirm: (v, all) => (v && v === all.password ? "Passwords match." : null),
};

/**
 * Scores a password out of 100 on length and character variety, then knocks
 * it down for the handful of passwords everybody tries first.
 */
function scorePassword(password) {
  if (!password) return { score: 0, label: "" };

  const variety = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((re) =>
    re.test(password)
  ).length;

  let score = Math.min(password.length / 14, 1) * 55 + (variety - 1) * 15;

  const lower = password.toLowerCase();
  if (COMMON.some((common) => lower.startsWith(common))) score = Math.min(score, 15);
  if (/^(.)\1+$/.test(password)) score = Math.min(score, 8);
  if (/^\d+$/.test(password)) score = Math.min(score, 25);

  score = Math.max(0, Math.min(100, Math.round(score)));

  const label =
    score >= 80 ? "Strong" : score >= 58 ? "Good" : score >= 34 ? "Fair" : "Weak";

  return { score, label };
}

/* ---------------------------------------------------------
   2. Rendering
   --------------------------------------------------------- */

const values = () => Object.fromEntries(fields.map((id) => [id, inputs[id].value]));
const touched = new Set();

function showField(id) {
  const input = inputs[id];
  const slot = errors[id];
  const message = RULES[id](input.value, values());
  const affirm = AFFIRM[id]?.(input.value, values()) ?? null;

  input.classList.toggle("is-invalid", Boolean(message) && touched.has(id));
  input.classList.toggle("is-valid", !message && Boolean(affirm));
  input.setAttribute("aria-invalid", String(Boolean(message) && touched.has(id)));

  if (message && touched.has(id)) {
    slot.textContent = message;
    slot.classList.remove("is-ok");
  } else if (affirm) {
    slot.textContent = affirm;
    slot.classList.add("is-ok");
  } else {
    slot.textContent = "";
    slot.classList.remove("is-ok");
  }

  return !message;
}

function showStrength() {
  const password = inputs.password.value;
  strengthBox.hidden = password.length === 0;

  const { score, label } = scorePassword(password);
  meterFill.style.width = `${score}%`;
  meterFill.style.backgroundColor =
    score >= 80
      ? "var(--valid)"
      : score >= 58
        ? "#7a8f3f"
        : score >= 34
          ? "#c08a2b"
          : "var(--invalid)";
  strengthLabel.textContent = label;
}

/* ---------------------------------------------------------
   3. Wiring
   --------------------------------------------------------- */

fields.forEach((id) => {
  const input = inputs[id];
  input.setAttribute("aria-describedby", `${id}-error`);

  // a field is only scolded once the user has left it, but once they have
  // been told, the message updates live as they fix it
  input.addEventListener("blur", () => {
    touched.add(id);
    showField(id);
  });

  input.addEventListener("input", () => {
    if (touched.has(id)) showField(id);

    if (id === "password") {
      showStrength();
      // the confirm field's verdict depends on this one, so re-check it
      if (touched.has("confirm") || inputs.confirm.value) showField("confirm");
    }

    if (id === "confirm" && input.value) {
      touched.add("confirm");
      showField("confirm");
    }

    done.hidden = true;
  });
});

document.querySelectorAll(".reveal").forEach((button) => {
  button.addEventListener("click", () => {
    const input = inputs[button.dataset.reveals];
    const nowVisible = input.type === "password";
    input.type = nowVisible ? "text" : "password";
    button.textContent = nowVisible ? "Hide" : "Show";
    button.setAttribute("aria-pressed", String(nowVisible));
    input.focus({ preventScroll: true });
  });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  fields.forEach((id) => touched.add(id));
  const results = fields.map((id) => showField(id));

  const firstBad = fields.find((id, i) => !results[i]);
  if (firstBad) {
    done.hidden = true;
    inputs[firstBad].focus();
    return;
  }

  done.hidden = false;
  done.textContent = `Account created. Welcome to Quarry, ${inputs.first.value.trim()}.`;
});

showStrength();
