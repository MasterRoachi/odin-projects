# Odin Recipes

A small recipe website built as part of [The Odin Project Foundations](https://www.theodinproject.com/) curriculum.

## Overview

Odin Recipes is an index page linking out to three individual recipe pages. It is deliberately unstyled — the project comes before the CSS Foundations lessons, so the goal is correct, well-structured HTML rather than a good-looking site. The same project gets revisited and styled later in the curriculum.

## Structure

```
odin-recipes/
├── index.html                          the recipe index
└── recipes/
    ├── lasagna.html
    ├── shakshuka.html
    └── chocolate-chip-cookies.html
```

Every recipe page uses an identical layout: title, photo, description, ingredients, steps, and a link back to the index.

## Features

* Index page listing every recipe in an unordered list
* Three recipe pages sharing one consistent structure
* Two-way navigation between the index and each recipe
* Unordered lists for ingredients, ordered lists for steps
* Descriptive `alt` text on every image
* Photo attribution for each image

## Built With

* HTML

## What I Practiced

This project helped me practise:

* Writing correct HTML boilerplate from scratch
* Choosing headings that reflect document structure rather than size
* The difference between unordered and ordered lists, and when each is correct
* Relative links between pages and across directories (`recipes/lasagna.html` vs `../index.html`)
* Embedding images with meaningful `alt` text
* Organising a multi-page project into directories
* Committing in meaningful increments rather than one large drop

## Image Credits

* Lasagna — Breville USA, [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/), via Wikimedia Commons
* Shakshuka — Andy Li, [CC0](https://creativecommons.org/publicdomain/zero/1.0/), via Wikimedia Commons
* Chocolate chip cookies — Mshuang2, [CC0](https://creativecommons.org/publicdomain/zero/1.0/), via Wikimedia Commons

## Project Status

Complete as a static, unstyled HTML project. Due to be revisited with CSS later in the curriculum.

## Acknowledgements

Completed as part of The Odin Project Foundations curriculum.
