/**
 * Summarises an array of numbers.
 *
 * Returns { average, min, max, length }.
 *
 * An empty array throws rather than returning something plausible-looking.
 * There is no honest average of nothing: returning 0 would be a lie, and
 * returning NaN would quietly poison whatever used it next.
 */
export function analyzeArray(numbers) {
  if (!Array.isArray(numbers)) {
    throw new TypeError("analyzeArray expects an array");
  }
  if (numbers.length === 0) {
    throw new RangeError("analyzeArray needs at least one number");
  }
  if (numbers.some((value) => typeof value !== "number" || Number.isNaN(value))) {
    throw new TypeError("analyzeArray expects an array of numbers");
  }

  const total = numbers.reduce((sum, value) => sum + value, 0);

  return {
    average: total / numbers.length,
    min: Math.min(...numbers),
    max: Math.max(...numbers),
    length: numbers.length,
  };
}

export default analyzeArray;
