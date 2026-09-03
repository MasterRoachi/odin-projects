/**
 * Returns a string with its first character capitalised.
 *
 * Only the first character is touched — "hello world" becomes "Hello world",
 * not "Hello World". A string starting with something that has no uppercase
 * form (a digit, a symbol) comes back unchanged.
 */
export function capitalize(text) {
  if (typeof text !== "string") {
    throw new TypeError("capitalize expects a string");
  }
  if (text.length === 0) return "";

  // spread rather than [0], so a leading emoji is not split down the middle
  const [first, ...rest] = [...text];
  return first.toUpperCase() + rest.join("");
}

export default capitalize;
