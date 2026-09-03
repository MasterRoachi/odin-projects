# Battleship

Battleship on squared paper, from [The Odin Project](https://www.theodinproject.com/)'s Battleship assignment — the one where the tests come first.

```bash
npm install
npm test            # 58 tests
npm run watch
node bench.mjs      # 3000 games per strategy
```

[**Play it**](./index.html) — drag your fleet onto the grid, press <kbd>R</kbd> to turn a ship, then start firing.

## The split that the whole project hangs on

The brief requires that the game logic never touch the DOM. It is a testability requirement, not a style preference, and it is the reason this repository has 58 tests that run in half a second without a browser:

| | knows about | tested |
| --- | --- | --- |
| `src/model/` | coordinates, hits, turns, whose go it is | 58 tests |
| `src/ui/` | elements, pointers, drawing | not unit tested |

A whole game can be played from a test — and one of them does exactly that, playing until somebody loses. Nothing in `src/model/` mentions an element, a click or a colour.

## Written test first

The order was: `ship.test.js`, watch it fail for want of a module, then `ship.js`. Then the gameboard. Then the hunter. Then the game.

Writing the test first meant deciding what a gameboard should *do* before deciding how it works, from the position of its caller — which is the only position that matters. Two of the more useful bits of the design fell out of that:

- **`canPlace` exists because the tests wanted it.** Working out a ship's footprint and judging whether it is legal are two jobs, and the drag-and-drop needs to ask the question continuously without committing to an answer. Splitting them was not foresight, it was a test that was awkward to write.
- **`receiveAttack` returns a result object rather than a boolean.** A test wanted to know *which* ship sank and *which squares it filled*, and once that existed the computer opponent could use it too.

Three tests failed for a while and were my fault rather than the code's: I had the human firing in raster order and asserting they would win. They do not. The computer averages 52 shots and a sweep of the board takes 100, so it wins nearly every time. The tests now sink the enemy fleet directly, which is a fact about ending a game rather than a fact about the opponent.

## The opponent

The brief asks only that the computer not fire at the same square twice. Random guessing loses almost every game and never looks like it is thinking, so this one hunts.

**Hunt** — nothing is wounded, so search. **Target** — something is wounded, so finish it. After a hit it probes the four neighbours; once two hits line up, the orientation is settled and only the two ends of the line can be more of the same ship.

Measured over 3,000 games each:

| strategy | mean shots | median | best |
| --- | --- | --- | --- |
| random, as the brief allows | 95.3 | 97 | 59 |
| lattice only, no targeting | 95.6 | 97 | 73 |
| targeting only, no lattice | 60.3 | 60 | 24 |
| **hunt and target** | **52.0** | **53** | **19** |

The lattice is the interesting row. The smallest ship is two squares long, so it must cross a square where `x + y` is even — checking only those finds everything while firing at half as many squares. **On its own it is worth nothing at all** (95.6 against 95.3), because without targeting you still have to hit every square of every ship individually and the search was never the expensive part. Combined with targeting it is worth 14%.

The other thing worth doing properly is what happens when a ship sinks. Clearing every outstanding hit is the obvious move and it is wrong — if two ships are lying alongside each other, it throws away the hit belonging to the second one and the hunter wanders off and has to find it again. So the board reports which squares the sunk ship filled, exactly as a person announcing *you sank my battleship* reveals it, and only those are cleared. There is a test for it.

The hunter is never handed the board. It only ever sees the results of its own shots, which is both the honest way to write it and the reason it is easy to test: give it results, check where it fires next.

## Squared paper

Everything the player writes is in a handwriting face; everything the worksheet was printed with is not. Hits are crossed out in red biro, misses are a single dot, ships are outlined by hand.

The wobble is a real filter rather than a texture: `feTurbulence` generates a field of noise and `feDisplacementMap` shifts each pixel by however much noise sits under it, so dead-straight CSS borders come out looking drawn by someone not concentrating.

### One bug worth recording

The ship outlines were first drawn at pixel positions computed from a measured cell size. That works exactly until the board changes width, at which point every outline is left at its old size — a five-square hull 126px long sitting over cells that had become 34px each.

The fix was to stop measuring. Each outline is now a grid item spanning its own tracks:

```js
hull.style.gridColumn = `${minX + 1} / span ${width}`;
hull.style.gridRow = `${minY + 1} / span ${height}`;
```

The grid sizes it, so it cannot go stale, and no JavaScript runs on resize at all. The cells are given explicit grid positions too, so that the outlines can share their tracks without displacing them — grid items are allowed to overlap.

## Placement

Pointer events rather than HTML drag-and-drop, because the drop has to be judged *while* the ship is moving and it has to work under a finger. The footprint lights up blue or red as you go, <kbd>R</kbd> turns the ship mid-drag, <kbd>Esc</kbd> abandons it, and a ship already on the board can be picked back up and moved.

The placed fleet is held as a plain list and the board is rebuilt from it whenever it changes. That is why picking a ship back up needs no `remove` on the gameboard — there is only ever one way a board gets built.

## No bundler

Native ES modules, loaded straight by the browser. The Todo List already does the webpack build the curriculum asks for, so repeating it here would add a build step, a `dist/` and a class of failure without teaching anything new. Vitest reads the same modules the browser does.

## What I Practiced

* Writing the test before the thing, and letting the caller's view shape the interface
* Keeping game rules completely free of the DOM, and what that buys
* Injecting randomness so that a thing which depends on chance can still be pinned down in a test
* Measuring a design decision instead of assuming it helped — the lattice looked clever and was worth nothing until it had something to combine with

## Project Status

Complete.

## Acknowledgements

Completed as part of The Odin Project's JavaScript course.
