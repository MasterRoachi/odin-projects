# CV Builder

The first React project, from [The Odin Project](https://www.theodinproject.com/)'s CV Application assignment. Type on the left, and the document redraws on the right as you go.

```bash
npm install
npm run dev
npm run build
```

[**Open it**](./dist/) — it starts with an example CV so there is something to look at.

## Why this project is the right first one

Every other project in this repo updates the page by hand: find the element, change the text, add the class. This one never does. There is not a single `document.createElement` in the application code, and the only DOM node touched directly is a hidden file input.

Instead there is one object holding the whole CV, and a function that turns that object into a document. Change the object, and the document is correct. That is the entire idea, and typing into the name field is the cheapest way to see it — one piece of state changes and everything downstream of it agrees.

## Where the state lives

All of it is in `App.jsx`, and nothing below owns any of the document:

```
App                      holds the CV, and every function that changes it
├── Toolbar              example / clear / export / import / print
├── DetailsEditor        name, contact, summary
├── SectionEditor ×3     experience, education, skills
└── Preview              the CV
```

The form and the preview cannot disagree, because they are reading the same object. Getting that for free is the point of lifting state up.

The one exception is deliberate: `SectionEditor` keeps **which entry is expanded** in its own `useState`. That is state about the interface, not about the CV — nothing else needs it, and pushing it up would make the whole app re-render every time a disclosure opened.

## Three things I would have got wrong

**Reading storage belongs in the initialiser, not an effect.**

```jsx
const [cv, setCv] = useState(() => load() ?? sampleCv());
```

The instinctive version is `useEffect(() => setCv(load()), [])`, which renders once with the wrong value and again with the right one — a visible flash of an empty form. Anything knowable before the first render belongs in the initialiser. The function form matters too: `useState(load())` would call `load()` on *every* render and throw the result away.

**Most effects should not exist, but this one should.** There is exactly one `useEffect` in the app:

```jsx
useEffect(() => { save(cv); }, [cv]);
```

localStorage is genuinely outside React and genuinely needs keeping in step. That is what effects are for. The kind that should not exist is the kind that copies state into other state — if a value can be computed from what you already have, compute it while rendering.

**Returning the state unchanged is a real answer.** `moveEntry` can be asked to move the first item up:

```jsx
if (from === -1 || to < 0 || to >= list.length) return prev;
```

Returning `prev` rather than a new object means React compares the reference, finds it identical, and skips the re-render entirely. The same fact is what makes mutation fail — `list.push(x); setCv(cv)` hands back the same reference, React concludes nothing changed, and the screen silently does not update.

## Sections are data, not components

Education and experience differ only in which fields they have, so they are not written twice. `schema.js` describes them:

```js
{
  key: "experience",
  title: "Experience",
  fields: [ { name: "role", label: "Role", type: "text" }, ... ],
  summarise: (entry) => [entry.role, entry.company].filter(Boolean).join(" · "),
}
```

One `SectionEditor` reads that and can edit any of them. Adding a fourth section is an entry in that array and no new component at all — which is how the skills section was added after the other two were finished.

## Keys

Entries are keyed by `crypto.randomUUID()`, never by array index, because these reorder and delete. With index keys, deleting the first job would leave the *second* job's form open showing the third job's data — React would match up the wrong elements. The one place an index key is used is the bullet points inside an entry, which have no identity of their own and cannot move independently of the text they are split from.

## The document

Swiss typographic: one sans, a two-column grid with dates in a fixed-width left column, hairline rules, and one red used twice. The date column is a fixed width rather than `auto` deliberately — auto sizing lets one long date range shift that entry's text and nothing else, and the eye catches it immediately.

`Preview.jsx` is a pure function of the CV object. It holds no state and changes nothing, which is why it can be printed, and why swapping in a second template later would touch one file.

## Printing

`Ctrl/Cmd+P` produces a clean document, because the application is not part of it:

```css
@page { size: A4; margin: 15mm 14mm; }

@media print {
  .bar, .editor, .skip { display: none !important; }
  .cv { max-width: none; padding: 0; box-shadow: none; font-size: 10.5pt; }
  .cv-entry { break-inside: avoid; }
  .cv-section h2 { break-after: avoid; }
}
```

The page margin comes from `@page` rather than padding on the sheet, so the browser knows where the text block actually is and can break pages properly. `break-inside: avoid` stops a job being split across two pages and `break-after: avoid` stops a heading being stranded at the foot of one.

## Import, and not trusting the file

Export writes the CV as JSON via a Blob; import reads one back. A file off somebody's disk is not assumed to have the right shape — a missing array would crash the first `.map` that reached it, and an entry with no `id` would break list reconciliation. So everything imported goes through `normalise`, which fills in missing sections from a blank CV and mints an id for any entry lacking one. Malformed JSON produces a message rather than a blank screen.

## Verifying it

Checked in the browser rather than assumed:

* Typing the name updates the document on the same keystroke
* Adding an entry opens it, and its first field reaches the CV
* Reorder and delete act on the right rows
* Edits survive a reload
* A file with no ids and a missing section imports cleanly; malformed JSON reports and leaves the CV alone
* Dates render as `Jan 2020 — Jun 2021`, with no timezone drift
* Every colour pair is at least 5.2:1, and there is no horizontal scroll at 375px

## What I Practiced

* Describing what the page should be for a given state, instead of updating it step by step
* Lifting state up, and recognising the one piece that should not be
* Immutable updates, and why mutation fails silently rather than loudly
* Stable keys, and what breaks without them
* That most `useEffect` calls are a mistake, and what the legitimate one looks like

## Project Status

Complete, including the print stylesheet, persistence and JSON import/export.

## Acknowledgements

Completed as part of The Odin Project's React course.
