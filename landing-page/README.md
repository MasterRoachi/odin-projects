# Master Roachi — Landing Page

A personal landing page built as part of [The Odin Project Foundations](https://www.theodinproject.com/) curriculum.

## Overview

The Odin brief supplies a design to reproduce: a dark header and hero, a four-card information section, a pull quote, a call-to-action banner, and a footer. The brief explicitly invites you to substitute your own content, colours, and fonts, so this build keeps the five-section skeleton and replaces everything else.

The direction is **Field Manual** — technical documentation as an aesthetic. Monospace for anything machine-facing (navigation, labels, buttons, data), a sans for anything human, hairline rules doing the structural work, and a single burnt-orange signal colour used sparingly. The hero's image slot is a specification panel rather than a photograph, which suits the subject better than stock photography and avoids an image licence entirely.

## Sections

| §   | Section  | Contents                                                   |
| --- | -------- | ---------------------------------------------------------- |
| 01  | Who      | Headline, introduction, calls to action, at-a-glance panel |
| 02  | Work     | Four project cards linking to their repositories           |
| 03  | Approach | Pull quote                                                 |
| 04  | Contact  | Call-to-action banner                                      |

## Built With

* HTML
* CSS — Grid, Flexbox, custom properties, `clamp()`
* IBM Plex Sans and IBM Plex Mono, via Google Fonts

## Going Beyond the Brief

The lesson only requires a fixed-width desktop layout built with Flexbox, and explicitly says responsiveness is not needed. This build ignores that:

* **Fully responsive from 320px up.** Verified for horizontal overflow at 320px, and laid out at 390px, 768px and 1240px.
* **CSS Grid** for the hero and the card row, with Flexbox reserved for the one-dimensional cases it actually suits.
* **Custom properties** for the entire palette and rhythm scale.
* **`clamp()`** for fluid type and section spacing, so there are only three breakpoints in the whole stylesheet.
* **Baseline accessibility** — skip link, semantic landmarks, visible focus states, and all text at WCAG AA contrast or better against its own background.
* **`prefers-reduced-motion`** honoured for both smooth scrolling and button transitions.

## Design Tokens

| Token       | Value     | Role                              |
| ----------- | --------- | --------------------------------- |
| `paper`     | `#F4F3EF` | Page ground                       |
| `paper-sunk`| `#ECEAE3` | Quote section ground              |
| `ink`       | `#1A1D1A` | Body text, footer ground          |
| `slate`     | `#4A5450` | Secondary text                    |
| `faint`     | `#6A716D` | Labels and metadata               |
| `rule`      | `#D9D7CF` | Hairlines and card borders        |
| `signal`    | `#B4491C` | Section marks, primary button, CTA|

Single-theme by design. This is a paper document, so it commits to one light palette and paints every colour explicitly rather than inheriting any of them.

## What I Practiced

* Translating a supplied design brief into an independent art direction
* Building a full page layout with Grid and Flexbox together
* A fluid type and spacing scale using `clamp()` instead of breakpoint stacking
* Custom properties as a single source of truth for a palette
* Checking colour contrast rather than assuming it

## Project Status

Complete. Replaces the earlier Questicles version of this project, which remains in the repository's git history.

## Acknowledgements

Completed as part of The Odin Project Foundations curriculum.
