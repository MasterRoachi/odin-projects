# Quartz, Parchment, Shears

Rock Paper Scissors, reskinned and rebuilt, from [The Odin Project Foundations](https://www.theodinproject.com/) curriculum.

## Overview

Quartz blunts shears. Shears cut parchment. Parchment wraps quartz. First to five takes the match.

The Odin curriculum splits this project in two: a console-only version in the JavaScript Basics section, then a "Revisiting Rock Paper Scissors" lesson that adds a UI once DOM manipulation has been covered. This build is the finished article — buttons rather than `prompt()`, a running score, and a match that ends when someone reaches five.

The illustrations are original artwork, and they set the direction: cream cards with heavy ink borders want a dark table to sit on. The palette is sampled from the cards themselves — violet from the quartz, umber from the parchment, rust from the shears — with brass fittings for the scoreboard.

## Playing

* Click a card, or press **Q**, **P** or **S**
* First to five points wins
* **New game** button, or press **Enter** once the match is over

## Structure

```
Quartz-Parchment-Shears/
├── index.html
├── style.css
├── script.js
└── images/          original illustrations
```

`script.js` is organised in five labelled sections, and the split that matters is the first one: **the rules never touch the DOM**. `getComputerChoice` and `playRound` take choices and return a plain description of what happened — an outcome, the two throws, and a message. Every consequence (incrementing a score, drawing a card, writing to the ledger) is the caller's job. The UI could be replaced wholesale without editing a line of the rules.

This anticipates the Single Responsibility lesson later in the JavaScript course, which uses almost exactly this example — game logic that reaches into the DOM — as the thing not to do.

## Built With

* HTML
* CSS — Grid, custom properties, `clamp()`, keyframe animation
* JavaScript — no libraries, no build step

## Going Beyond the Brief

The lesson asks for three buttons, a results div, a running score, and a winner at five points. This build adds:

* **A round ledger** — every round recorded with both throws and the outcome, newest first, colour-coded per card.
* **Keyboard play** — Q, P and S as first-class input, with the binding shown on each card.
* **A reveal beat** — your card is dealt immediately, the adversary's shuffles face-down for a moment before turning over. Skipped entirely under `prefers-reduced-motion`.
* **A card back drawn in CSS** rather than shipped as another image.
* **Responsive from 320px** — the arena reflows to two-up with the verdict above it, and the keycap badge moves clear of the card lettering.
* **Score pips** alongside the numerals, so the state of the match reads at a glance.

The adversary is honestly random, as the assignment requires — `Math.random` over the three choices, with no memory of what you have played.

## Accessibility

* The verdict line is an `aria-live` region, so outcomes are announced rather than only shown
* Choice buttons carry screen-reader labels; the decorative card images have empty `alt`
* Visible focus rings on every interactive element
* Buttons disable during the reveal and after the match ends, so the state is never ambiguous

## Design Tokens

| Token       | Value     | Role                            |
| ----------- | --------- | ------------------------------- |
| `felt`      | `#23261D` | The table                       |
| `cream`     | `#E8DCBC` | Card ground, sampled from art   |
| `quartz`    | `#6E5F8C` | Quartz violet                   |
| `parchment` | `#8A6A33` | Parchment umber                 |
| `shears`    | `#A8574A` | Shears rust                     |
| `brass`     | `#B39355` | Scoreboard fittings, focus ring |

## What I Practiced

* Separating game rules from rendering, and keeping the boundary honest
* Driving state changes through a single render pass rather than patching the DOM ad hoc
* `async`/`await` to sequence a reveal without nesting timeouts
* Guarding against input during animation with a busy flag
* Keyboard input as a real path, not an afterthought

## Project Status

Complete. Rebuilt from the earlier version, which remains in this repository's git history.

## Acknowledgements

Illustrations by Master Roachi. Completed as part of The Odin Project Foundations curriculum.
