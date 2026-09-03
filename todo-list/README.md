# Things to do

A todo list with projects, dates and checklists, built for [The Odin Project](https://www.theodinproject.com/)'s Todo List assignment — the capstone of the "Organizing Your JavaScript Code" section.

## Overview

The assignment is really about one thing: keeping the application logic and the DOM apart. That split is the whole architecture here.

```
src/
├── index.js          wires the two halves together, and nothing else
├── model/            knows the rules. Never touches the DOM.
│   ├── todo.js       the todo factory, and pure questions about one
│   ├── project.js    the project factory and its colour
│   └── store.js      all state, all mutations, all queries, persistence
└── ui/               knows the DOM. Never reaches into the data.
    ├── app.js        renders the shell, the sidebar and the list
    ├── dialog.js     the new-todo and new-project dialogs
    ├── keyboard.js   single-key control
    └── dom.js        a small element builder
```

The store exposes `subscribe()`. The interface subscribes to it on mount and re-renders when told something moved. The model has no idea a browser is involved, and the interface never mutates data directly — it calls a store function and waits to be told.

## Using it

* **Views** cut across projects by date — Today, Upcoming, Overdue — or browse a project
* **Click a todo** to expand it and edit anything: title, description, due date, priority, notes, checklist
* **Drag** a todo to reorder it, or drop it on a project in the sidebar to move it there
* Everything persists to `localStorage`

### Keyboard

| Key | Does |
| --- | --- |
| <kbd>n</kbd> | New todo |
| <kbd>j</kbd> / <kbd>k</kbd> | Move the cursor down / up |
| <kbd>x</kbd> | Complete the focused todo |
| <kbd>e</kbd> | Expand the focused todo |
| <kbd>Delete</kbd> | Remove the focused todo |
| <kbd>1</kbd>–<kbd>9</kbd> | Jump to a project |
| <kbd>Esc</kbd> | Collapse, or drop the cursor |

Single-key bindings stand aside whenever the caret is in a field or a dialog is open — otherwise typing "n" in a title would open a dialog instead of writing a letter.

## Running it

```bash
npm install
npm run dev     # dev server on :8080, hot reload
npm run build   # production bundle into dist/
```

## Build setup

Webpack 5, split the way the *Revisiting Webpack* lesson teaches: one `webpack.common.js` holding what both modes share, and `webpack.dev.js` / `webpack.prod.js` merging their own settings on top with `webpack-merge`. Development gets inline source maps and a dev server; production gets minified output and no source maps. The npm scripts pick the right config, so neither has to be edited to switch.

## Notes on the build

**Todos are plain data from a factory, not class instances.** This is the deliberate answer to the problem the lesson flags — that `JSON.stringify` keeps the data and throws the methods away, so you have to re-attach them on the way back in. With behaviour in modules rather than on the objects, there is nothing to re-attach: a todo that comes out of storage is exactly as capable as one that never left.

**Storage is treated as untrusted.** Anything could be in `localStorage` — a half-written value, an older shape, something typed into devtools. Everything read back is put through the same factories and defaults a new todo would get, rather than trusted as-is. Corrupt JSON falls back to a fresh seed instead of throwing.

**Dates are stored as `YYYY-MM-DD` strings**, which is what `<input type="date">` gives and takes, and only parsed to a `Date` at local midnight when something needs comparing. `date-fns` handles the comparisons and the relative labels.

## Going Beyond the Brief

* **Date views** — Today, Upcoming and Overdue cut across every project, which is what makes a todo list usable rather than a list of lists
* **Checklists** — the spec mentions one as an optional property; here it is real, with progress showing on the collapsed row
* **Drag to reorder**, within a project or across them, using native drag and drop
* **Keyboard control** for the whole list
* **Responsive**, down to 320px

## Built With

* Webpack 5, split dev/prod with `webpack-merge`
* `date-fns` for date comparisons and labels
* Manrope, one typeface at several weights
* No framework

## What I Practiced

* ES modules, and drawing a real boundary between data and display
* A subscribe/notify loop so the model can stay ignorant of the interface
* Factory functions, and why they sidestep the serialisation problem entirely
* `<dialog>`, and why a form inside one needs `event.preventDefault()`
* Native drag and drop
* Splitting a Webpack config rather than editing one file to change mode

## Project Status

Complete.

## Acknowledgements

Completed as part of The Odin Project's JavaScript course.
