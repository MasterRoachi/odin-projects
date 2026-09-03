/* =========================================================
   Merge sort.

   Split the array in half, sort each half, then merge the two
   sorted halves back together. The splitting bottoms out at
   arrays of one item, which are already sorted by definition —
   that is the base case, and it is what stops the recursion.

   Run with:  node mergeSort.js
   ========================================================= */

/**
 * Walks two already-sorted arrays at once, always taking whichever front
 * item is smaller. Because both sides are sorted, comparing only their
 * fronts is enough — nothing further back can be smaller.
 */
function merge(left, right) {
  const merged = [];
  let l = 0;
  let r = 0;

  while (l < left.length && r < right.length) {
    if (left[l] <= right[r]) {
      merged.push(left[l]);
      l += 1;
    } else {
      merged.push(right[r]);
      r += 1;
    }
  }

  // one side is now exhausted; whatever is left of the other is already
  // sorted and all larger, so it goes on the end as it is
  return merged.concat(left.slice(l), right.slice(r));
}

function mergeSort(array) {
  if (!Array.isArray(array)) {
    throw new TypeError("mergeSort expects an array");
  }

  // an empty array and a single item are both already sorted
  if (array.length <= 1) return [...array];

  const middle = Math.floor(array.length / 2);

  return merge(mergeSort(array.slice(0, middle)), mergeSort(array.slice(middle)));
}

/* --- run it --------------------------------------------- */

if (require.main === module) {
  const cases = [
    [],
    [73],
    [1, 2, 3, 4, 5],
    [3, 2, 1, 13, 8, 5, 0, 1],
    [105, 79, 100, 110],
    [5, 4, 3, 2, 1],
    [-3, 12, -7, 0, 4],
  ];

  cases.forEach((input) => {
    const before = JSON.stringify(input);
    console.log(`  mergeSort(${before})`.padEnd(38), "→", JSON.stringify(mergeSort(input)));
  });

  const original = [3, 2, 1];
  mergeSort(original);
  console.log(`\nLeaves the original alone: ${JSON.stringify(original) === "[3,2,1]"}`);
}

module.exports = { mergeSort, merge };
