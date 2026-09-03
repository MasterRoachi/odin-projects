/* =========================================================
   Fibonacci — the same sequence built two ways.

   Each number is the sum of the two before it:
   0, 1, 1, 2, 3, 5, 8, 13, ...

   Run with:  node fibs.js
   ========================================================= */

/**
 * Iteratively: keep the last two numbers, add them, shuffle along.
 */
function fibs(count) {
  if (!Number.isInteger(count) || count < 0) {
    throw new TypeError("fibs expects a count of zero or more");
  }

  const sequence = [];
  let previous = 0;
  let current = 1;

  for (let i = 0; i < count; i++) {
    sequence.push(previous);
    [previous, current] = [current, previous + current];
  }

  return sequence;
}

/**
 * Recursively: ask for one fewer number, then work out the next one from
 * the last two of whatever comes back.
 *
 * The base cases are the short sequences that cannot be built by adding
 * anything — an empty list, and the opening 0 and 1. Without those the
 * function would call itself forever.
 */
function fibsRec(count) {
  if (!Number.isInteger(count) || count < 0) {
    throw new TypeError("fibsRec expects a count of zero or more");
  }

  if (count === 0) return [];
  if (count === 1) return [0];
  if (count === 2) return [0, 1];

  const previous = fibsRec(count - 1);
  const next = previous[previous.length - 1] + previous[previous.length - 2];

  return [...previous, next];
}

/* --- run it --------------------------------------------- */

if (require.main === module) {
  console.log("fibs");
  [0, 1, 2, 8, 12].forEach((n) => {
    console.log(`  fibs(${n})`.padEnd(14), JSON.stringify(fibs(n)));
  });

  console.log("\nfibsRec");
  [0, 1, 2, 8, 12].forEach((n) => {
    console.log(`  fibsRec(${n})`.padEnd(14), JSON.stringify(fibsRec(n)));
  });

  const agree = [0, 1, 2, 5, 8, 12, 20].every(
    (n) => JSON.stringify(fibs(n)) === JSON.stringify(fibsRec(n))
  );
  console.log(`\nBoth versions agree: ${agree}`);
}

module.exports = { fibs, fibsRec };
