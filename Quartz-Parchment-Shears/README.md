# Quartz, Parchment, Shears

Rock Paper Scissors, reskinned and rebuilt, from [The Odin Project Foundations](https://www.theodinproject.com/) curriculum.

## Overview

Quartz blunts shears. Shears cut parchment. Parchment wraps quartz. First to five takes the match.

The Odin curriculum splits this project in two: a console-only version in the JavaScript Basics section, then a "Revisiting Rock Paper Scissors" lesson that adds a UI once DOM manipulation has been covered. This build is the finished article — buttons rather than `prompt()`, a running score, and a match that ends when someone reaches five.

The direction is Saturday-morning cartoon: flat colour, heavy ink outlines, and a park on a very blue afternoon. The whole background — sky, sun, clouds, hills — is CSS, so it costs nothing to ship.

## Playing

* Click an object, or press **Q**, **P** or **S**
* First to five points wins
* **New game**, or press **Enter** once the match is over
* **Sound** toggles the audio; the preference persists

## The objects

The three illustrations were originally drawn as complete cards — the object, its name, and a cream parchment ground inside a heavy black border. For this build the objects needed to float free of their cards.

Rather than redraw them, they were cut out programmatically. Each illustration has a heavy ink outline, which means a flood fill seeded inside the card border spreads across the cream ground and stops dead at the object's edge. The remaining pixels are grouped into connected components; the card border is discarded as the one component touching the frame, the baked-in title letters are discarded as small components sitting high in the image, and what survives is the object plus its sparkles. Quartz needed one extra pass to remove the mound of earth it was drawn standing on, which read as a dirt clod once it started floating.

The shears needed one more. Their finger holes are *enclosed* card ground, so an outside flood can never reach them and they came through as little scraps of page. Colour alone could not remove them either: the cream and the grey blades sit in the same brightness band, and cutting by brightness hollowed the blades out completely. What separates them is warmth. Measured on this art the trapped card reads R−B ≈ 51 while the blades are near-neutral at 13–17, so the punch removes enclosed regions above a warmth threshold and leaves the blades whole.

```
images/
├── heading.png          the banner logo, used as-is
├── source/              the original card art, kept as the master
│   ├── Quartz.png
│   ├── Parchment.png
│   └── Shears.png
└── cutouts/             generated: transparent, cropped, floating
    ├── quartz.png
    ├── parchment.png
    └── shears.png
```

## Hover performances

Each object animates in character when you hover, focus or play it, with a matching sound:

| Object    | Motion                                   | Sound                                              |
| --------- | ---------------------------------------- | -------------------------------------------------- |
| Quartz    | Swells and glows                         | Three sine partials ringing out, like a struck crystal |
| Parchment | Shakes out and settles, like an unfurl   | Three overlapping low-Q noise bursts — dry paper   |
| Shears    | Two quick closes                         | Two filtered noise cracks with a metallic ring     |

All three keep their idle bob running underneath, and everything is disabled under `prefers-reduced-motion`.

## Sound

There are no audio files in this project. Every sound is synthesised at runtime from oscillators and filtered noise through the Web Audio API — noise bursts shaped by a bandpass filter for the shears and parchment, stacked sine partials for the quartz, and short arpeggios for the win, loss and draw stingers.

Browsers refuse to start an `AudioContext` until the user has actually interacted with the page, so the context is created lazily and resumed on the first real gesture. Hover sounds are throttled so sweeping the cursor across the row does not machine-gun them.

## Structure

`script.js` is organised in labelled sections, and the split that matters is the first: **the rules never touch the DOM, never make a noise, and never write a sentence.** `playRound` is pure and deterministic — the same two throws always return the same `{ outcome, human, computer }`. The commentary lives in a separate `flavour()`, which picks from a set of lines per outcome so the game does not repeat itself. Every consequence (incrementing a score, showing an object, writing to the ledger, playing a stinger) is the caller's job.

This anticipates the Single Responsibility lesson later in the JavaScript course, which uses almost exactly this example — game logic that reaches into the DOM — as the thing not to do.

## Built With

* HTML
* CSS — Grid, custom properties, `clamp()`, keyframe animation
* JavaScript — Web Audio API, Canvas (for the one-off cutout extraction). No libraries, no build step.

## Going Beyond the Brief

The lesson asks for three buttons, a results div, a running score, and a winner at five points. This build adds:

* **Objects cut free of their cards**, floating with a bob and a ground shadow that shrinks as they rise
* **A performance per object** on hover, focus and play, each with its own synthesised sound
* **A round ledger** — every round with both throws and the outcome, newest first, colour-coded
* **Keyboard play** — Q, P and S, which trigger the same performance as hovering
* **A reveal beat** before the adversary's play is turned over
* **A CSS park** — sky, sun, clouds and hills, no image payload
* **Locked to the viewport** — the game never scrolls. Object heights are driven by shared `--stage-h` and `--object-h` lengths in `vh`, the ledger becomes a full-height sidebar above 64rem and a short scrolling strip below it, and the masthead drops out entirely on very short screens. Verified for scroll and overlap at 1440x900, 1280x800, 1024x768, 844x390 and 390x844.
* **Commentary that varies** — fifteen win lines, fifteen loss lines, twelve draws, plus separate lines for taking or dropping a match

The adversary is honestly random, as the assignment requires — `Math.random` over the three choices, with no memory of what you have played.

## Accessibility

* The verdict line is an `aria-live` region, so outcomes are announced rather than only shown
* The sound toggle reports state through `aria-pressed`
* Decorative art carries empty `alt`; the park is `aria-hidden`
* Visible focus rings, and focus triggers the same performance as hover
* Buttons disable during the reveal and after the match ends
* Every animation is disabled under `prefers-reduced-motion`

## Design Tokens

| Token     | Value     | Role                          |
| --------- | --------- | ----------------------------- |
| `sky-top` | `#58C8E8` | Sky, top of the gradient      |
| `grass`   | `#7CC24A` | The near hill                 |
| `ink`     | `#201C17` | Every outline, and body text  |
| `wood-face` | `#F0D3A6` | Signs, tags and placards    |
| `quartz`  | `#6E5F8C` | Sampled from the illustration |
| `parchment` | `#8A6A33` | Sampled from the illustration |
| `shears`  | `#A8574A` | Sampled from the illustration |

## What I Practiced

* Separating game rules from rendering *and* from audio, keeping the boundary honest
* Synthesising sound from scratch rather than shipping assets
* Isolating artwork programmatically with flood fill and connected-component labelling
* `async`/`await` to sequence a reveal without nesting timeouts
* Guarding against input during animation with a busy flag
* Building an illustrated scene entirely in CSS

## Project Status

Complete. Rebuilt from the earlier card-table version, which remains in this repository's git history.

## Acknowledgements

Illustrations by Master Roachi. Completed as part of The Odin Project Foundations curriculum.
