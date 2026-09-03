# Coolculator

A printing adding machine, built as part of [The Odin Project Foundations](https://www.theodinproject.com/) curriculum.

## Overview

The final Foundations project asks for an on-screen calculator: functions for the four operators, an `operate` that dispatches between them, a display, and a keypad — with a long list of edge cases to get right.

This build is a desktop adding machine lying on a workbench. Every entry and every total rolls out on a paper tape above the keys, which turns calculation history from a bolted-on extra into the point of the object. The readout below shows the calculation in progress and the current value.

Beside it sits the project notebook, open at the page where the name was worked out:

> **Operation:** **C**raft **O**ur **O**wn **L**ovely **C**alculator **U**sing **L**anguages **A**nd **T**ools **O**btained **R**ecently

The title is cut into the tabletop itself — two offset shadows, one dark up and left, one light down and right, which is what reads as an incision rather than a raised letter.

## Using it

* Click the keys, or type: digits, `+` `-` `*` `/`, <kbd>Enter</kbd> to total, <kbd>Backspace</kbd> to delete, <kbd>Esc</kbd> to clear. Keys depress on screen as you type.
* **MC / MR / M+ / M−** store a running value; an **M** lights on the readout while memory holds something.
* **%** behaves the way a desk calculator does — in `200 − 10 %` the 10 becomes ten percent *of 200*, so the answer is 180.
* **±** flips the sign, **⌫** deletes a digit, **C** clears the calculation.
* **Tear off tape** starts a fresh roll.

## The tape

Entries print right-aligned with the key that committed them, and totals print with a ★ and a rule above, the way a real printing calculator marks them:

```
      1250   +
       375   −
─────────────────
      1625   ★
        90   =
─────────────────
      1535   ★
```

## Built With

* HTML
* CSS — Grid for the keypad, Flexbox for the scene, and a procedural wood bench
* JavaScript — no libraries, no build step, and **no `eval()` or `new Function()`**, which the lesson explicitly rules out

## Notes on the build

**Arithmetic is pure.** `add`, `subtract`, `multiply`, `divide` and `operate` take numbers and return numbers. They never touch the DOM and never format anything. `divide` throws a `RangeError` on a zero divisor rather than returning `Infinity`, so the caller decides what a division by zero should look like.

**Every input funnels through one `press()`.** Mouse clicks and keyboard events both resolve to the same key token before anything happens, so there is exactly one place the machine's state can change, and the two input paths cannot drift apart.

**Results go through one formatter.** Floating point will happily hand back `0.30000000000000004`, so everything on the way to the readout is rounded to 12 significant digits and passed back through `Number` to drop the noise and any trailing zeros. Very large or very small magnitudes switch to exponential rather than overflowing the display.

**The display is right-aligned with flexbox, not `direction: rtl`.** The obvious way to right-align a readout is `direction: rtl`, and it works until the content contains spaces and operators — at which point it reverses the visual order of the run and `99 + 1` renders as `1 + 99`. End-justified flex aligns the same way and clips overflow at the start, without touching bidirectional ordering.

## Edge cases the lesson asks for

| Case | Behaviour |
| --- | --- |
| `12 + 7 - 1 =` | Shows `19` when `−` is pressed, then `18` |
| Consecutive operators | `2 + + =` stays `2`; the second operator replaces the first rather than evaluating |
| `0.1 + 0.2 =` | `0.3` |
| `=` pressed early | No-op, no crash |
| Divide by zero | A snarky message on the readout and a red line on the tape; the next key press recovers |
| Clear | Wipes entry, accumulator and pending operator |
| Digit after a total | Starts a new calculation instead of appending to the result |
| Second decimal point | Ignored, and the `.` key disables while one is in play |

## Accessibility

* The readout is an `aria-live` region, so results are announced
* Symbol keys carry text labels (`÷` is "Divide", `±` is "Change sign")
* Visible focus rings, and the keyboard path highlights the matching key
* Key transitions are disabled under `prefers-reduced-motion`

## Design Tokens

| Token | Value | Role |
| --- | --- | --- |
| `body` | `#DDD4BF` | Enamelled machine body |
| `plinth` | `#34302A` | The base it sits on |
| `paper` | `#FBF7EC` | Tape stock |
| `screen` | `#171E1A` | Readout glass |
| `digit` | `#8EE6A8` | Readout digits |
| `equals` | `#9C3B33` | The equals key, and error text |

Barlow Condensed for the machine's labels, Courier Prime for the printed tape, Share Tech Mono for the readout.

The scene keeps the project's own display faces: **The Last Trunks** for the title carved into the bench, **OverScribble** for the notebook heading and the acrostic letters, and **Estie Bestie** for the handwriting.

The bench is CSS — knots with cathedral arcs curving around them, three grain passes at slightly different angles and spacings so the repeat never lines up into visible corduroy, and plank joins every 320px. The 2.4MB `images/wood.png` is left in the project but not loaded, since it is a lot of weight for a page that is otherwise image-free.

## What I Practiced

* Modelling a small state machine, and keeping its rules separate from its rendering
* Funnelling several input methods into a single entry point
* Handling floating-point display honestly rather than hoping
* Throwing and catching for a genuinely exceptional case instead of returning a sentinel
* Working through a long list of specified edge cases and verifying each one

## Project Status

Complete. Rebuilt from the earlier version, which remains in this repository's git history.

## Acknowledgements

Completed as part of The Odin Project Foundations curriculum.
