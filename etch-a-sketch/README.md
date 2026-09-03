# Etch-A-Sketch

A browser sketchpad with working knobs, built as part of [The Odin Project Foundations](https://www.theodinproject.com/) curriculum.

## Overview

The assignment asks for a JavaScript-generated grid that colours in as the mouse passes over it, plus a control to rebuild the grid at any size up to 100 per side. This build keeps all of that and wraps it in the toy it is named after: a moulded shell, an aluminium screen, and two knobs you can actually drag.

## Playing

* **Knobs mode** — drag the left knob to move the cursor left and right, the right knob to move it up and down. One cell at a time, orthogonally, so the line never lifts. Arrow keys do the same thing.
* **Free draw** — the classic behaviour from the assignment: move over the screen and it draws.
* **Shake** — clears the screen, with the obvious animation.
* **Save PNG** — exports the sketch at 1024×1024.

## Tools

| Tool | Behaviour |
| --- | --- |
| Pen | Paints the chosen ink at full strength |
| Rainbow | A random RGB value per cell, per pass — the first extra-credit task |
| Shade | Each pass darkens a cell another 10%, so ten passes reach solid — the second extra-credit task |
| Eraser | Returns a cell to blank, rather than painting it white |

## Built With

* HTML
* CSS — Flexbox for the grid, as the lesson requires
* JavaScript — Pointer Events, Canvas for the export. No libraries, no build step.

## Notes on the build

**The grid is Flexbox, as instructed.** The lesson is explicit that this project is Flexbox practice and that CSS Grid comes later, so the cells wrap in a flex container rather than using `grid-template-columns`.

**Cell size is computed, not a percentage.** `clientWidth` is rounded to a whole pixel while the real content box is fractional, so dividing by it can overflow a row by a fraction of a pixel and wrap the last cell onto the next line — a 16×16 grid quietly renders 15 across. The size is measured from `getBoundingClientRect()` and snapped down to 1/64px, the unit the layout engine itself uses, so a row can never round up past its container. Verified at every side length from 2 to 100.

**Cell state lives in typed arrays.** At 100×100 that is 10,000 cells. Colour and shade depth are held in an `Int32Array` and a `Uint8Array` rather than read back off the DOM, and painting is wired up with one delegated listener rather than 10,000 of them.

**Knob steps are derived from absolute rotation.** The obvious approach — accumulate the angle turned and subtract a step's worth each time one fires — re-rounds on every subtraction, so a slow turn silently loses cells that a fast turn keeps. Instead the total rotation is kept and the step count derived from it, which cannot drift regardless of how the movement is chopped up. The knob's centre is also measured once per drag rather than per move: re-reading the rect of an element that is itself being rotated lets sub-pixel rendering wobble the centre by a fraction of a degree, and it forces a layout on every `pointermove`.

**Touch is hit-tested.** A mouse gets `pointerover` per cell for free; touch and pen do not, so those are resolved with `elementFromPoint` instead.

## Going Beyond the Brief

* Two working knobs, with the real toy's constraint that the line is continuous and orthogonal
* Arrow-key drawing as a first-class path
* A colour picker and a true eraser
* PNG export rendered to a canvas
* A slider for grid size rather than a `prompt()`, still capped at 100 per side
* Both extra-credit tasks (random RGB, and 10%-per-pass darkening) as selectable tools

## Accessibility

* Both knobs are real buttons with descriptive labels, and everything they do is also on the arrow keys
* Tool and mode controls report state through `aria-pressed`
* Visible focus rings throughout
* The shake animation is disabled under `prefers-reduced-motion`

## Design Tokens

| Token | Value | Role |
| --- | --- | --- |
| `shell` | `#CC3B2C` | The moulded body |
| `bezel` | `#F4ECD8` | The frame around the screen |
| `screen` | `#ADB2A2` | Aluminium powder |
| `knob` | `#F6F2E6` | Knob faces |
| `ink` | `#1D1B17` | Default drawing colour, and all text |

The title is set in Psychoart, the display face already in this project; everything else is Archivo, so the controls stay legible at small sizes.

## What I Practiced

* Generating and rebuilding a large DOM grid without it becoming sluggish
* Event delegation instead of per-element listeners
* Pointer Events, pointer capture, and the difference between mouse and touch behaviour
* Turning a continuous gesture (rotation) into discrete steps without drift
* Rendering DOM state to a canvas and handing back a file

## Project Status

Complete. Rebuilt from the earlier version, which remains in this repository's git history.

## Acknowledgements

Completed as part of The Odin Project Foundations curriculum.
