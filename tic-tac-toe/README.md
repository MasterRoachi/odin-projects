# Tic-Tac-Toe

Three in a row, from [The Odin Project](https://www.theodinproject.com/)'s Tic Tac Toe assignment.

[**Play it**](./index.html) — name both players, then take turns.

## What the assignment is really about

Not the game. The game is nine squares and eight winning lines. The assignment is about **keeping as little as possible in the global scope**, and it is the first project where that is the explicit goal rather than a side effect.

So the whole thing is three factories and one closure, and `window` gets nothing:

| | what it holds | how many exist |
| --- | --- | --- |
| `Gameboard()` | the nine squares, and the rule that you cannot play an occupied one | one per game |
| `Player()` | a name and a token | two |
| `playGame()` | whose turn it is, whether it is over, who won | one |
| `screenController()` | every DOM reference and every listener | one |

Nothing outside `Gameboard` can reach `board` — it is a `const` inside the factory, and only the four returned methods can touch it. `placeToken` returns `true` or `false` rather than throwing, so the caller can tell the difference between a legal move and a click on an occupied square without needing to look at the array itself.

## The parts worth pointing at

**`placeToken` refuses rather than overwrites.** It checks the square is empty and returns a boolean. `placePlayerToken` then does nothing at all if the placement failed, so clicking a taken square does not cost you your turn.

**The order of the checks after a move matters.** Win first, then draw, then swap turns:

```js
if (checkForWin()) { gameOver = true; winningPlayer = activePlayer; return; }
if (!board.includes("")) { gameOver = true; return; }
switchPlayerTurn();
```

If the draw check came first, filling the last square with a winning move would be reported as a draw. And the turn only switches when the game is still going, so the winner stays the active player and can be named.

**Tokens swap between rounds.** `swapTokens()` exchanges X and O between the two players, and `resetGame` then works out who starts from who is holding X rather than from who started last time:

```js
activePlayer = playerOne.playerToken === "X" ? playerOne : playerTwo;
```

That is a small thing that stops the same person going first forever, and deriving the starter from the token means the two functions cannot drift out of step.

**The screen is redrawn, not patched.** `renderBoard` empties the container with `replaceChildren()` and rebuilds all nine squares from the array every time. For nine elements that is far simpler than working out which one changed, and it means the display cannot disagree with the game state — there is only one place the truth lives.

## Structure

```
index.html      the shell, a dialog for names, and the board container
script.js       Gameboard, Player, playGame, screenController
style.css
```

## What I Practiced

* Factory functions and closures for genuine privacy, rather than convention
* Keeping the module that knows the rules separate from the one that knows the DOM
* Returning a result from a mutation so the caller can react to a refusal
* Deriving state from one source instead of tracking it in two places

## Project Status

Complete.

## Acknowledgements

Completed as part of The Odin Project's JavaScript course.
