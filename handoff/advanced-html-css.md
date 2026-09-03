# Advanced HTML and CSS: the fifteen lessons before the Homepage

The JavaScript course is finished. This one is fifteen lessons and a single project, and it splits into three unequal parts: a short block on animation, a **long** block on accessibility, and a block on responsive design.

The accessibility block is the substance. It is also the part of the curriculum most likely to come up in a job interview, and the part most people skim.

Fifth in the series, after [whats-ahead.md](./whats-ahead.md), [complexity-and-structures.md](./complexity-and-structures.md), [hash-maps.md](./hash-maps.md) and [testing-for-real.md](./testing-for-real.md).

---

## Part one: animation

### Transitions vs keyframes

**A transition** animates *between two states* — normal and `:hover`, or a class being added. One start, one end, and the browser fills the middle.

**Keyframes** animate along a *timeline* you define, with as many stops as you like, and can loop. Anything with more than two states, or that runs without being triggered, needs `@keyframes`.

```css
/* two states */
.button { transition: background-color 160ms ease; }

/* a timeline */
@keyframes land { from { transform: translateY(-8px); opacity: 0; } }
```

You have already used both — the tiles in the HashMap visualiser drop in with a keyframe, and half the buttons in the repo have transitions.

### The performance rule that actually matters

**Animate `transform` and `opacity`. Try not to animate anything else.**

Changing `width`, `top`, `margin` or `padding` forces the browser to redo layout — recompute the position of everything — on every single frame. Changing `transform` and `opacity` does not: they are handled on the compositor, often on the GPU, and the rest of the page is untouched.

So `transform: translateX(20px)` instead of `left: 20px`, and `transform: scale(1.05)` instead of changing width and height.

### `prefers-reduced-motion`

Some people get genuinely ill from motion on screen — vestibular disorders make parallax and large sliding transitions cause nausea and dizziness. The operating system has a setting for it and CSS can read it:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Every project in this repo that animates anything already has a version of this. It is not optional politeness; it is the difference between a site someone can use and one that makes them unwell.

---

## Part two: accessibility (ten lessons, and the real content)

### What it is actually about

Not a checklist, and not only screen readers. Roughly 15% of people have some disability, and the categories that affect web use are broader than people expect: blindness and low vision, colour blindness, deafness, motor impairments that make a mouse impractical, cognitive differences, seizure disorders, and — a category everyone forgets — **temporary and situational**. A broken wrist. Bright sunlight. Holding a baby. A noisy train.

Everything below helps that last group too, which is everyone, eventually.

### WCAG, and POUR

The Web Content Accessibility Guidelines. Three conformance levels — **A**, **AA**, **AAA** — and **AA is the one that matters**; it is what laws and contracts almost always specify. AAA is rarely achievable across a whole site.

Four principles, POUR:

- **Perceivable** — it can be perceived by at least one sense. Images have text alternatives; video has captions; nothing depends on colour alone.
- **Operable** — it can be operated. Everything reachable by keyboard; nothing on a timer that cannot be extended; nothing that flashes more than three times a second.
- **Understandable** — text is readable, behaviour is predictable, errors are explained and correctable.
- **Robust** — it works with assistive technology, which mostly means valid, semantic markup.

### Semantic HTML is 80% of it

The single highest-leverage thing. A `<button>` is focusable, activates on Enter *and* Space, announces itself as a button, and appears in a screen reader's list of controls. A `<div onclick>` does none of that and you have to reimplement all of it, badly.

```html
<div class="btn" onclick="fire()">Fire</div>   <!-- invisible to a keyboard -->
<button type="button" onclick="fire()">Fire</button>   <!-- just works -->
```

Landmarks — `<header>`, `<nav>`, `<main>`, `<footer>`, `<aside>` — let a screen reader user jump straight to the content instead of listening through the navigation every time. Headings must descend in order (`h1` → `h2` → `h3`) because they are used as a table of contents; **never pick a heading level for its size**, that is what CSS is for.

Every Battleship square is a real `<button>`, which is why that grid can be played from a keyboard without a single line of extra code.

### Colour and contrast

The ratio between text and its background must be at least **4.5:1** for normal text and **3:1** for large text (roughly 24px, or 18.5px bold).

This has come up in almost every project here — the landing page had text at 3.46:1, the Knight's Travails ramp had a band where *neither* black nor white text reached 4.5:1 and the whole ramp had to move. Guessing does not work; the numbers are not intuitive. Compute them, or use a checker.

Separately: **colour must never be the only signal.** Red for error and green for success is invisible to the 8% of men with red-green colour blindness. Pair it with an icon, a word, or a shape.

### Keyboard navigation

Tab moves forward, Shift+Tab back, Enter and Space activate, Escape dismisses. Test it by unplugging the mouse and trying to use your own site.

Three rules:

1. **Never remove the focus outline** without replacing it with something equally visible. `outline: none` with nothing else is one of the most common and most damaging things people do to a page. Use `:focus-visible`, which shows the ring for keyboard users and hides it for mouse clicks.
2. **Do not fight the tab order.** Positive `tabindex` values (`tabindex="3"`) create a mess that is impossible to maintain. Only ever use `tabindex="0"` (put it in the natural order) and `tabindex="-1"` (focusable by script only, not by tabbing).
3. **Manage focus when the page changes.** Open a modal — move focus into it, trap it there, and return it to the trigger on close. Otherwise the keyboard user is still down at the bottom of a page they cannot see.

### Meaningful text

Alt text describes the *function* of the image in its context, not its appearance. A photo of a person on a "meet the team" page is `alt="Sarah Chen, Head of Design"`, not `alt="woman smiling"`. A purely decorative image takes `alt=""` — **empty, but present**, which tells a screen reader to skip it. Leaving `alt` off entirely makes it read the filename out.

Link text must make sense alone, because screen reader users list links out of context. "Click here" and "Read more" are useless in that list; "Read the accessibility report" is not.

### ARIA, and when not to use it

ARIA adds roles, states and properties that HTML lacks. The first rule of ARIA is **do not use ARIA**: if a native element does the job, use the native element.

The reason is blunt — **ARIA changes only how a thing is announced, never how it behaves.** `role="button"` on a div does not make it focusable, does not make Enter activate it, does not do anything except lie to a screen reader about what it is. Now it announces as a button and still does not work as one, which is worse than before.

The parts worth knowing:

- `aria-label` — an accessible name when there is no visible text (an icon-only button)
- `aria-labelledby` / `aria-describedby` — point at other elements for the name or description
- `aria-live="polite"` — announce changes in this region when the user is idle. This is how you tell a screen reader user that something updated without them having gone looking. The Battleship status line and the Knight's Travails status both use it.
- `aria-expanded`, `aria-current`, `aria-hidden`

### Hiding things, three different ways

These are not interchangeable and mixing them up is a classic bug:

| method | visually | to a screen reader |
| --- | --- | --- |
| `display: none` / `hidden` | gone | gone |
| `visibility: hidden` / `opacity: 0` | gone | gone |
| `aria-hidden="true"` | **still visible** | gone |
| a "visually hidden" class | gone | **still read** |

The last one — clipping an element to a 1px box off-screen — is how you give a screen reader extra context that sighted users get from layout. And never put `aria-hidden="true"` on anything focusable: you get a control that can be tabbed to but announces nothing at all.

---

## Part three: responsive design

### Natural responsiveness first

The lesson everybody skips. **A plain HTML document is already responsive** — text wraps, blocks fill the width. Responsiveness is not something you add; it is something you take away by over-constraining, and then have to put back with media queries.

So: avoid fixed widths, prefer `max-width`. Use `min-height` rather than `height`. Let flex and grid wrap on their own (`flex-wrap`, `repeat(auto-fit, minmax(...))`) before reaching for a breakpoint. `clamp()` handles most fluid sizing without any query at all.

Almost every layout in this repo does this — the Battleship boards wrap by themselves, the readouts use `auto-fit`, and the type is `clamp()`ed. The media queries that remain only change what the CSS cannot express on its own.

### Media queries as the last resort

```css
/* mobile first: this is the base, the query adds to it */
.layout { display: grid; gap: 1rem; }

@media (min-width: 48em) {
  .layout { grid-template-columns: 2fr 1fr; }
}
```

Mobile-first means the base styles are the small-screen ones and queries add complexity as space appears. Set breakpoints **where the design breaks**, not at device sizes — chasing specific phones is a losing game.

### Responsive images

Two different problems with two different tools:

- **`srcset` + `sizes`** — same image, several resolutions, browser picks by screen. This is about *bandwidth*.
- **`<picture>` with `<source>`** — genuinely different images or crops at different sizes, or modern formats with a fallback. This is about *art direction*.

`img { max-width: 100%; height: auto; }` remains the single most valuable line, and `width`/`height` attributes on `<img>` are worth setting even with CSS sizing — they let the browser reserve the space and stop the page jumping as images load.

---

## The project

One project: **build a homepage from a design**, properly responsive and properly accessible. It is a pure front-end exercise with no JavaScript required, and it is graded on the three things above.

After it: **React**.
