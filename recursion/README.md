# Recursion

Two classic problems solved recursively, from [The Odin Project](https://www.theodinproject.com/)'s Recursion assignment.

There is no interface to this one — the brief specifies command line only.

```bash
node fibs.js
node mergeSort.js
```

## fibs.js

`fibs(count)` and `fibsRec(count)` both return the first `count` numbers of the Fibonacci sequence, where each number is the sum of the two before it.

```
fibs(8)     → [0, 1, 1, 2, 3, 5, 8, 13]
fibsRec(8)  → [0, 1, 1, 2, 3, 5, 8, 13]
```

The iterative version keeps the last two numbers and shuffles along. The recursive one asks for a sequence one shorter than the one it wants, then works out the next number from the last two it gets back.

The base cases are the sequences that cannot be built by adding anything to a shorter one: an empty list, `[0]`, and `[0, 1]`. Those are what stop it calling itself forever.

Running the file checks both versions agree at several lengths.

## mergeSort.js

`mergeSort(array)` returns a sorted copy.

```
mergeSort([3, 2, 1, 13, 8, 5, 0, 1])  → [0, 1, 1, 2, 3, 5, 8, 13]
mergeSort([105, 79, 100, 110])        → [79, 100, 105, 110]
mergeSort([])                         → []
mergeSort([73])                       → [73]
```

Split the array in half, sort each half, merge the two sorted halves back. The splitting bottoms out at arrays of one item, which are sorted by definition — that is the base case.

The merge step works because both sides are already sorted, so comparing only their front items is enough; nothing further back on either side can be smaller.

It returns a new array rather than sorting in place, which the run output checks.

## What I Practiced

* Base cases, and that a recursive function without one runs until the stack gives out
* Divide and conquer — reducing a problem to smaller versions of itself rather than to different problems
* Why an array of one item is the natural place for a sort to stop

## Project Status

Complete. Both files run standalone and print their results.

## Acknowledgements

Completed as part of The Odin Project's JavaScript course.
