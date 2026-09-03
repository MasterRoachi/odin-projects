/**
 * A Caesar cipher.
 *
 * Each letter moves along the alphabet by `shift`, wrapping round the end.
 * Case is preserved, and anything that is not an English letter — spaces,
 * punctuation, digits, accented characters — is left exactly as it was.
 *
 * The brief notes that only the public function needs testing, so the two
 * helpers below are not exported. If `caesarCipher` behaves, they do.
 */

const A_LOWER = 97;
const A_UPPER = 65;
const ALPHABET = 26;

/**
 * Brings any shift into 0–25.
 *
 * A plain `shift % 26` is not enough: JavaScript's remainder keeps the sign,
 * so -3 % 26 is -3, and adding that to a code point walks off the front of
 * the alphabet. Adding 26 before the second modulo folds it back round.
 */
function normaliseShift(shift) {
  return ((shift % ALPHABET) + ALPHABET) % ALPHABET;
}

function shiftLetter(character, shift) {
  const code = character.charCodeAt(0);

  const base =
    code >= A_LOWER && code <= A_LOWER + 25
      ? A_LOWER
      : code >= A_UPPER && code <= A_UPPER + 25
        ? A_UPPER
        : null;

  // not an English letter — hand it back untouched
  if (base === null) return character;

  return String.fromCharCode(((code - base + shift) % ALPHABET) + base);
}

export function caesarCipher(text, shift) {
  if (typeof text !== "string") {
    throw new TypeError("caesarCipher expects a string");
  }
  if (!Number.isInteger(shift)) {
    throw new TypeError("caesarCipher expects a whole-number shift");
  }

  const normalised = normaliseShift(shift);
  return [...text].map((character) => shiftLetter(character, normalised)).join("");
}

export default caesarCipher;
