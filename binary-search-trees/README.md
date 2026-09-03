# Binary Search Trees

A balanced binary search tree built from scratch, from [The Odin Project](https://www.theodinproject.com/)'s Binary Search Trees assignment.

```bash
node main.js        # the driver script the brief asks for
```

[**Two Trees**](./index.html) — the same values built two ways, searched side by side, counting comparisons. That count is the whole argument.

## What it is

Every node holds a value. Everything smaller sits to its left, everything larger to its right. That single rule is the entire structure, and it is what lets a search discard half of what remains at every step.

The catch is that the rule says nothing about *shape*. A tree can obey it perfectly and still be a straight line.

## The line the whole project is about

Insert values in sorted order and every one of them is larger than the last, so every one goes right. You get a chain — a linked list wearing a tree costume — and searching it means visiting every node.

This is not a contrived worst case. Sorted input is the most ordinary thing in the world; database exports, log files and CSVs all arrive that way.

| | balanced | degenerate |
| --- | --- | --- |
| height, 31 values | 4 | 30 |
| find a value | ~5 comparisons | up to 31 |
| rule out a value | 5 | 31, every time |

So `buildTree` takes the middle value as the root and repeats on each half. Both sides get the same number of values, all the way down.

## Two Trees

The page builds the same random values both ways and races a search through them, one comparison at a time. Ruling out a value that is not there is the cruellest case, and there is a button for it: the balanced tree says no in 5 comparisons, the degenerate one has to walk all 31 before it can be sure.

The drawings are laid out with **horizontal position from the in-order traversal** — which for a search tree means left-to-right is also smallest-to-largest. Both are fitted to the same width, so the difference between them shows up entirely as height, with a dimension line down the side of each giving it. Tree B does not fit in its frame. That is the point, and pressing **rebalance B** makes it fit.

Nothing on the page reimplements the tree. It draws the real `Tree`, and the search it animates makes the same comparisons `find` does, in the same order.

## Things worth getting right

**Deleting a node with two children.** Neither child can simply be promoted without breaking the ordering. The only other value that can legally sit there is the **in-order successor** — the smallest value in the right subtree. Copy it up, then delete it from the right subtree, where it is guaranteed to have at most one child, so the problem cannot recur.

**`isBalanced` has to check every node, not just the root.** A root can have equal heights on both sides while each of those sides is a long thin chain. There is a test for exactly this case in `check.mjs`, and it fails against the naive version.

It is done in one pass rather than by calling `height` at every node — a height call is itself a full walk of the subtree, so doing that per node walks the tree over and over.

**Height and depth run in opposite directions.** Height counts edges downward to the furthest leaf, so a leaf is 0. Depth counts edges upward from the root, so the root is 0.

**`levelOrder` is a queue, not recursion.** Recursion goes deep by its nature; going wide means holding a whole row of nodes at once, and that row is the queue. The queue is drained with a moving index instead of `shift()`, which renumbers the entire array each time it is called.

## The driver

`node main.js` runs the sequence the assignment specifies — build from random numbers, prove it balanced, walk it four ways, wreck it, prove it unbalanced, rebalance, walk it again — printing the tree with the ASCII renderer the brief provides:

```
Is it balanced?
───────────────
  isBalanced()       true
  height             3

Unbalancing it
──────────────
  inserting          101 202 303 404 505 606

│                                   ┌── 606
│                               ┌── 505
│                           ┌── 404
│                       ┌── 303
│                   ┌── 202
│               ┌── 101
│           ┌── 97
...

Is it balanced now?
───────────────────
  isBalanced()       false
  height             9
  left side          2
  right side         8
```

Six inserts, six new levels, all on one side.

## Verifying it

```bash
node check.mjs      # 35 assertions
```

Covers all three delete shapes, the successor promotion, every traversal order against a known tree, the callback guards, the per-node balance check, an empty tree, and strings as well as numbers.

## Complexity

| Operation | Balanced | Degenerate |
| --- | --- | --- |
| `find`, `insert`, `deleteItem` | `O(log n)` | `O(n)` |
| the four traversals | `O(n)` | `O(n)` |
| `rebalance` | `O(n)` | `O(n)` |

A real self-balancing tree — AVL, red-black — rotates during insertion so it can never degenerate in the first place. This one does not; `rebalance` is the manual version of that, and knowing why it is needed is the point of building the plain one first.

## What I Practiced

* Why the shape of a structure, not just its rules, decides its performance
* The in-order successor, and why it is the only value that can replace a deleted node with two children
* Breadth-first as a queue, depth-first as recursion — and that the difference is where the pending work is kept
* Checking a property at every node in one pass rather than re-measuring from each one

## Project Status

Complete.

## Acknowledgements

Completed as part of The Odin Project's JavaScript course. The ASCII tree printer in `main.js` is the one given in the assignment.
