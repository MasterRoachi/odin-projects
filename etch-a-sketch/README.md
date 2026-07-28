# Etch-A-Sketch

A browser-based Etch-A-Sketch project built for [The Odin Project Foundations Course](https://www.theodinproject.com/lessons/foundations-etch-a-sketch).

This project uses JavaScript to generate a dynamic drawing grid in the browser. Users can sketch by hovering over the grid, refresh the board, choose a custom grid size, and toggle extra drawing effects using dedicated control buttons.

## Live Preview

[View the live project](https://masterroachi.github.io/etch-a-sketch/)

## Overview

The goal of this project was to build an interactive sketchpad without hardcoding the grid squares in HTML. The grid is created entirely with JavaScript, and each square is sized dynamically based on the selected grid dimensions.

The project starts with a default 16 × 16 grid and allows users to create a new grid up to 100 × 100 squares. It also includes extra drawing modes inspired by The Odin Project’s optional challenges, including randomized rainbow colors and progressive opacity/darkening.

## Features

The sketchpad includes a refresh button, custom grid size input, hover-to-draw behavior, rainbow mode, opacity mode, and a responsive square drawing area. The rainbow and opacity effects are controlled by their own buttons, allowing the drawing behavior to be changed without rebuilding the whole page manually.

The visual design uses a dark and gold Master Roachi theme, custom button styling, a responsive layout, and a decorative heading font.

## Built With

HTML, CSS, JavaScript, and Flexbox.

## What I Practiced

This project helped me practice DOM manipulation, creating elements with JavaScript, adding event listeners, using loops, handling user input, validating prompt values, updating inline styles dynamically, and using state variables to control drawing modes.

It also helped me understand how dynamically created elements behave. Since the grid can be cleared and recreated, each new square needs drawing behavior attached when it is generated.

## Project Notes

One of the biggest improvements was restructuring the drawing logic so the buttons control the current drawing state. Instead of each button creating a completely separate drawing system, the grid squares check which effects are active when they are hovered over.

This made it possible for rainbow mode and opacity mode to work together. Rainbow mode controls the color, while opacity mode controls the transparency/darkening effect.

## Author

**Master Roachi**

GitHub: [MasterRoachi](https://github.com/MasterRoachi)
