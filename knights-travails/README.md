# Knight's Travails

The shortest sequence of moves a knight can take between any two squares, from [The Odin Project](https://www.theodinproject.com/)'s Knight's Travails assignment.

```bash
node main.js        # the examples from the brief, drawn on a board
node check.mjs      # 27 assertions
```

[**The board**](./index.html) — click where the knight starts, click where it should end up, and watch the search spread out and stop.

## The board is not stored anywhere

There is no array of sixty-four things. A square's neighbours are worked out from the square itself:

```js
export function movesFrom([x, y]) {
  return OFFSETS.map(([dx, dy]) => [x + dx, y + dy]).filter(onBoard);
}
```

That is the idea the assignment is really about. A graph does not have to be a data structure — it can be a function that answers *what is next to this?* The eight knight moves and the edge of the board are the entire graph, and it is never built.

## Breadth first, and why it matters here

Depth-first search would pick a move, then a move from there, and charge on until it stumbled into the target. It would find **a** route. It would not find the shortest one, and it would have no way of knowing.

Breadth-first visits every square one move away, then every square two moves away, and so on. So the first time it reaches a square, it has reached it by the shortest route available — and it never has to go back and improve on an answer it already gave.

That guarantee is what makes the early exit safe:

```js
if (goal !== null && id === key(goal)) {
  return { distance, cameFrom, order, found: true };
}
```

The moment the goal is first reached its distance is final, so there is nothing left to look at. `check.mjs` verifies this over all 4,096 pairs of squares: the early exit changes no answer, and visits **51%** of the squares a full sweep does.

## Reading the path back

The search does not remember paths. It remembers, for each square, the one square it was first reached from — and a path is then read backwards from the target:

```js
let current = end;
while (current !== null) {
  path.push(current);
  current = cameFrom.get(key(current));
}
return path.reverse();
```

Keeping one predecessor per square costs a single entry each. Keeping a whole path per square would mean storing sixty-four lists to use one of them.

## Knight geometry is not board geometry

A knight on a1 is *touching* b2. Getting there takes **four** moves. a2 is also adjacent, and takes **three**.

| from a1 to | moves |
| --- | --- |
| b3 | 1 |
| a2 | 3 |
| b2 | 4 |
| h8 | 6 |

This is why the problem needs a search rather than arithmetic — there is no formula from the coordinates that a person would guess correctly. The page has a toggle that fills the whole board in with move counts, which makes the strange shape of it obvious at once.

No two squares on the board are more than six moves apart, and every square is reachable from every other. Both are checked rather than assumed.

## The page

Click a square, click another, and the board fills in with every square the search examined, in the order it examined them, tinted by how far out it had got. Then the route is drawn back and the knight walks it.

Nothing is staged. `explore` returns the visit order and the animation replays it, so what is on screen is what the algorithm did — including the stop. A short hop like `d4 → e6` examines **2** squares; `a1 → h8` has to look at all **64**, because h8 is as far away as anything can be.

## Verifying it

`check.mjs` covers the brief's examples, the awkward adjacent squares, that every returned path is a sequence of genuinely legal knight moves, both symmetry and reachability across all 4,096 pairs, that BFS really does visit in non-decreasing distance order, the early exit, and the input guards.

## Complexity

| | |
| --- | --- |
| time | `O(V + E)` — 64 squares, at most 8 moves each, so bounded and tiny |
| space | `O(V)` for the distance and predecessor maps |

On a board this size none of that matters. It matters that the shape of the solution is the one that scales, because the same search over a large graph is the thing this is practice for.

## What I Practiced

* A graph as a rule rather than a stored structure
* Why breadth-first gives the shortest path and depth-first cannot
* Predecessor maps, and reconstructing a route backwards from the end
* Stopping a search as soon as its answer is final, and proving that is safe

## Project Status

Complete.

## Acknowledgements

Completed as part of The Odin Project's JavaScript course.
