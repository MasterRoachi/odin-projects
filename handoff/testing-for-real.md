# Before Battleship: testing things that touch the world

You have written tests already — `testing-practice` has 58 of them across five pure functions. Those were the easy kind: give the function a value, check the value it gives back.

Battleship is the other kind. A game has a board, ships that remember being hit, players who take turns, and a DOM that draws all of it. None of that is a pure function, and the lessons between here and that project are about how you test things that aren't.

Fourth in the series, after [whats-ahead.md](./whats-ahead.md), [complexity-and-structures.md](./complexity-and-structures.md) and [hash-maps.md](./hash-maps.md).

---

## The one rule that shapes the whole project

**The game logic must not know the DOM exists.**

Not "should preferably". The Battleship brief makes it a requirement, and the reason is testability: you cannot write a fast, reliable test for something that needs a browser and a click.

So the project splits in two:

| layer | knows about | tested |
| --- | --- | --- |
| `Ship`, `Gameboard`, `Player` | coordinates, hits, turns | thoroughly, in Vitest |
| the DOM layer | elements, clicks, rendering | barely, or by hand |

You have already built this exact split once — the Todo List has `src/model/` with no DOM in it and `src/ui/` with all of it. Battleship is the same shape, and this time the tests are the reason rather than a nicety.

The test for "a ship sinks after enough hits" should never mention an element, a click, or a colour. If it does, the split is in the wrong place.

---

## Test doubles: the vocabulary

This is where the naming gets confusing, and the lesson throws four words at you at once. They are all the same idea — **a fake thing you pass in instead of the real thing** — differing only in what you use it for.

**Stub** — a fake that returns a canned answer. You are not interested in the stub itself; you just need it to return something so the code under test can carry on. A stub `getRandomCoordinate()` that always returns `[0, 0]` makes an otherwise random test predictable.

**Mock / spy** — a fake that *records* how it was called. Now the fake is what you are checking. "Did `renderBoard` get called after the attack?" is a question about the call, not about a return value.

**Fake** — a working but simplified implementation. An in-memory store standing in for a real database.

**Dummy** — a value passed only to satisfy a parameter, never actually used.

In practice you will mostly say "mock" for all of them and nobody will mind. What matters is knowing *why* you reached for one.

### The bit worth internalising

You reach for a double when the real thing is one of:

- **random** — `Math.random()` in ship placement or a computer player's guesses
- **slow** — a network call
- **external** — an API, the clock, `localStorage`
- **not built yet** — you are testing against an interface that has no implementation
- **hard to trigger** — an error path you cannot easily cause for real

Randomness is the one that will bite you in Battleship. A computer player that guesses randomly cannot be tested for "does it avoid squares it already tried" unless you can control what it guesses. That is a stub.

### The trap

**Every mock is an assumption that can rot.** You mock `Gameboard` while testing `Player`, hard-coding that `receiveAttack` returns `true` on a hit. Later you change `receiveAttack` to return the ship instead. Every `Gameboard` test still passes, because you changed it there. Every `Player` test still passes, because it is talking to your fake — which still returns `true`, like the real one no longer does.

Both suites green, application broken. This is the single most common way a well-tested codebase lies to you.

The defence is to mock **as little as you can get away with**. If two of your own modules can be tested together honestly, test them together. Save mocks for genuine boundaries — randomness, the network, the clock.

---

## Dependency injection

Which brings up the technique that makes doubles possible at all. If a function reaches out and grabs what it needs, you cannot replace it:

```js
// cannot be tested without real randomness
function placeRandomly(board, ship) {
  const x = Math.floor(Math.random() * 10);
  ...
}
```

If it is *handed* what it needs, you can hand it something else:

```js
// the test passes in a function that returns whatever it likes
function placeRandomly(board, ship, random = Math.random) {
  const x = Math.floor(random() * 10);
  ...
}
```

The default argument means production code calls it unchanged. The test passes `() => 0.5` and gets a board it can make assertions about.

That is the whole idea, and it is worth noticing that **code you can test tends to be better code anyway** — a function that declares what it depends on is easier to read and reuse than one that reaches into the global scope.

---

## Test-driven development

Battleship is the project where the brief asks you to write the tests **first**. The loop:

1. **Red** — write a failing test for behaviour that does not exist
2. **Green** — write the least code that makes it pass
3. **Refactor** — clean it up, with the test holding you safe

The value is not really the tests. It is that writing the test first forces you to decide what a thing should *do* before you decide how it works — and you design the interface from the outside, as its caller, which is the only perspective that matters.

The failing step is not ceremony either. A test that has never failed has never been proven to test anything. You already met this in `testing-practice`, where a mutation survived — `capitalize('😀hello')` passed with both the correct implementation and a broken one, because an emoji has no uppercase form. A test that cannot fail is not a test.

Do not be dogmatic about it. Writing tests first for `Ship` and `Gameboard` is genuinely pleasant, because their rules are clear before you start. Writing tests first for the DOM layer is misery. The brief only asks it of the logic, which is the half where it pays.

---

## What Battleship actually asks for

So you can see where the pieces land:

- **`Ship`** — length, hits taken, `isSunk()`. Pure logic, trivially testable, write it first.
- **`Gameboard`** — places ships at coordinates, takes attacks, records misses, reports when every ship is sunk. Still no DOM.
- **`Player`** — human and computer. The computer must not repeat a guess, which is the part that needs its randomness injected.
- **The DOM layer** — draws two boards, takes clicks, runs turns. Not unit tested.

The brief is explicit that you test the first three and not the last one.

---

## The one after this

After Battleship, the JavaScript course is essentially over and **React** begins — the largest section in the path. It is a genuine change of gear: instead of writing "when this changes, update that element", you describe what the page should look like for a given state and let React work out the DOM operations.

Everything you have built by hand so far is preparation for that, and specifically:

- The model/UI split in the Todo List **is** the React mental model, done manually
- `subscribe()` in that project's store is what `useState` does for you
- Every `document.createElement` you have written is what JSX replaces

None of it was wasted. React is much easier to trust when you have already written the thing it is doing for you.
