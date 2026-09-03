# The Ark

> A personal library kept the way a library keeps books — as spines on a shelf.
>
> An Arkitecture project — *As in the days of Noah.*

Built for [The Odin Project](https://www.theodinproject.com/)'s Library assignment, in the JavaScript course.

## Overview

Most solutions to this assignment show books as cards in a grid. This one stands them upright on wooden shelves. A fat book gets a wide spine, every book stands a slightly different height, and the binding cloth is picked from the title so a given book always looks the same. Click a spine and it comes off the shelf.

* A **ribbon** marks the book you are currently reading
* A **gilt pip** at the foot of the spine marks one you have finished

## Using it

* **Click a spine** to open the book — cover, details, and a bookmark you can move
* **Add a book** either by looking it up on Open Library, or by typing it in
* **Search** by title or author, **sort** by title, author or length, **filter** to what you are reading
* Everything is kept in `localStorage`, so the shelf survives a reload

## The assignment's shape, kept exactly

The lesson is specific about the structure, and this follows it:

| The lesson asks for | Where it is |
| --- | --- |
| A `myLibrary` array | Top of `script.js` |
| A `Book` constructor | `function Book(title, author, pages, status, extra)` |
| A separate `addBookToLibrary()` | Takes arguments, makes a Book, pushes it |
| Unique ids from `crypto.randomUUID()` | Set in the constructor |
| A render function looping the array | `render()` → `spineFor(book)` |
| A `<dialog>` form with `event.preventDefault()` | The add sheet |
| Remove buttons tied to books by `data-` attribute | `spine.dataset.id` |
| Read status toggled by a **prototype method** | `Book.prototype.toggleRead` |

The lesson also asks that displaying books and storing them be treated as separate responsibilities. Nothing in the `Book` type knows the DOM exists; `render()` reads from `myLibrary` and rebuilds the shelf.

## Going Beyond the Brief

The lesson says storage is not required. This has it, plus:

* **Open Library lookup.** Type a title, get real matches with author, page count, first publication year and cover art, and fill the form from one click. Uses `fetch` and `async`/`await` from a later lesson.
* **Reading progress.** A book is not just read or unread — move the bookmark and the status follows from where it lands. Past the last page it is read; back to zero it is unread; anywhere in between it is in progress.
* **Search, sort and filter**, with a tally of what is shown against what is held.
* **Responsive.** The shelf wraps to as many rows as it needs, each with its own board.

## Two things worth noting

**JSON keeps the data and throws away the prototype.** A book read back from `localStorage` is a plain object — `JSON.parse` has no idea `Book` exists, so `toggleRead` would be gone and `book instanceof Book` would be false. `Book.revive` re-seats the stored data on `Book.prototype` rather than minting a new object, so the methods come back and the id stays put.

**The shelf boards are one repeating gradient, not one element per row.** Every slot is exactly one row tall, so a single `repeating-linear-gradient` on the container lines up with the bottom of each row no matter how many rows there are or how tall the individual books are.

**Spine type is sized to fit its own spine.** A long title on a short book is set smaller, the way a real binder would do it — computed from the height left once the bands and the author line are taken out. Verified that no title clips at any length in the collection.

## Built With

* HTML — including `<dialog>` for both sheets
* CSS — Flexbox shelving, `writing-mode: vertical-rl` for the spines
* JavaScript — constructor and prototype, `fetch`, `localStorage`. No libraries, no build step.

## Credits

Book data and cover art from [Open Library](https://openlibrary.org/), which is free to use. A cover that fails to load falls back to the title rather than an empty rectangle.

Cormorant Garamond for the spines and headings, Jost for the interface, Inconsolata for counts.

## What I Practiced

* Constructor functions, `prototype` methods, and what `Object.create` is actually for
* Keeping data and its presentation as genuinely separate concerns
* Serialising objects to storage and reconstructing them with their behaviour intact
* `<dialog>`, and why a form inside one needs `event.preventDefault()`
* Calling a public API and degrading gracefully when it is unreachable

## Project Status

Complete. Rebuilt from the earlier cover-card version, which remains in this repository's git history.

## Acknowledgements

Completed as part of The Odin Project's JavaScript course.
