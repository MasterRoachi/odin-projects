/**
 * The four basic operations.
 *
 * Dividing by zero throws rather than returning Infinity: a calculator that
 * silently hands back Infinity pushes the problem downstream, where it turns
 * into NaN three steps later and is much harder to trace.
 */
function assertNumbers(...values) {
  values.forEach((value) => {
    if (typeof value !== "number" || Number.isNaN(value)) {
      throw new TypeError("calculator expects numbers");
    }
  });
}

export const calculator = {
  add(a, b) {
    assertNumbers(a, b);
    return a + b;
  },

  subtract(a, b) {
    assertNumbers(a, b);
    return a - b;
  },

  multiply(a, b) {
    assertNumbers(a, b);
    return a * b;
  },

  divide(a, b) {
    assertNumbers(a, b);
    if (b === 0) throw new RangeError("cannot divide by zero");
    return a / b;
  },
};

export default calculator;
