Library Project - The Odin Project

# The Ark

> A cover-first personal library built with vanilla JavaScript.
>
> An Arkitecture project — *As in the days of Noah.*

The Ark is a browser-based library app created for The Odin Project's Library assignment. Users can add books, view their details on interactive cover cards, update their reading status, and remove books from the collection.

## Features

* Add a book with its title, author, genre, description, page count, reading status, and cover
* Reveal book details by hovering over or focusing a cover card
* Toggle books between read and unread
* Remove books from the library
* Use either a direct image URL or a project-relative path for book covers
* Responsive add-book dialog with keyboard-friendly controls

## Built With

* HTML5
* CSS3
* Vanilla JavaScript

## Run Locally

No installation or build step is required.

1. Download or clone the project.
2. Open `index.html` in a browser.

For local cover images, place the file inside the project and enter a relative path such as `./images/dune.jpg`.

## Concepts Practised

* Constructor functions and prototypes
* Object and array manipulation
* DOM creation and rendering
* Form submission and validation
* Event handling
* The native HTML dialog element
* Responsive and accessible interface design

## Current Scope

The library is stored in memory, so its contents reset when the page reloads. Persistent storage, automatic cover lookup, accounts, and backend features are intentionally reserved for a future upgrade.
