/**
 * Returns a string reversed.
 *
 * Spreading the string iterates by code point rather than by UTF-16 unit, so
 * characters outside the basic plane — emoji, some CJK — survive the trip.
 * "abc".split("") and [..."abc"] agree; "😀a".split("") does not.
 */
export function reverseString(text) {
  if (typeof text !== "string") {
    throw new TypeError("reverseString expects a string");
  }
  return [...text].reverse().join("");
}

export default reverseString;
