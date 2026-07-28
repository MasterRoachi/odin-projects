/* DOM Elements */

const container = document.querySelector(".container");
const refreshButton = document.querySelector("#refresh");
const rainbowButton = document.querySelector("#rainbow");
const opacityButton = document.querySelector("#opacity");

/* State */

let rainbowEffect = false;
let opacityEffect = false;
let isDrawing = false;

/* Constants */

const DEFAULT_GRID_SIZE = 16;
const DEFAULT_COLOUR = "217, 164, 65";

/* Initial Grid */

createGrid(DEFAULT_GRID_SIZE, DEFAULT_GRID_SIZE);

/* Events */

container.addEventListener("pointerdown", (event) => {
  isDrawing = true;
  drawFromPointer(event);
});

container.addEventListener("pointermove", (event) => {
  if (isDrawing) {
    drawFromPointer(event);
  }
});

document.addEventListener("pointerup", () => {
  isDrawing = false;
});

document.addEventListener("pointercancel", () => {
  isDrawing = false;
});

document.addEventListener("pointerleave", () => {
  isDrawing = false;
});

refreshButton.addEventListener("click", () => {
  isDrawing = false;
  clearGrid();
  getGridSize();
});

rainbowButton.addEventListener("click", () => {
  isDrawing = false;
  rainbowEffect = !rainbowEffect;

  if (rainbowEffect) {
    rainbowButton.style.backgroundColor = `rgb(${getRandomColor()})`;
    rainbowButton.style.border = `2px solid rgb(${getRandomColor()})`;
    rainbowButton.style.color = `rgb(${getRandomColor()})`;
  } else {
    rainbowButton.style.backgroundColor = "#1f2933";
    rainbowButton.style.color = "#d9a441";
    rainbowButton.style.border = "2px solid #1f2933";
  }
});

opacityButton.addEventListener("click", () => {
  isDrawing = false;
  opacityEffect = !opacityEffect;

  if (opacityEffect) {
    opacityButton.style.backgroundColor = "#d9a441";
    opacityButton.style.color = "#1f2933";
    opacityButton.style.border = "2px solid #1f2933";
  } else {
    opacityButton.style.backgroundColor = "#1f2933";
    opacityButton.style.color = "#d9a441";
    opacityButton.style.border = "2px solid #1f2933";
  }
});

/* Drawing */

/*
  Decides how each square should be coloured.
  Rainbow controls the colour.
  Opacity controls the transparency.
  Both effects can be active at the same time.
*/

function drawSquare(square) {
  let color;
  if (rainbowEffect) {
    color = getRandomColor();
  } else {
    color = DEFAULT_COLOUR;
  }

  let opacity;
  if (opacityEffect) {
    opacity = Number(square.dataset.opacity);

    if (opacity < 1) {
      opacity = Math.min(1, opacity + 0.1);
      square.dataset.opacity = opacity;
    }
  } else {
    opacity = 1;
  }
  square.style.backgroundColor = `rgba(${color}, ${opacity})`;
}

function drawFromPointer(event) {
  const square = document.elementFromPoint(event.clientX, event.clientY);

  if (square && square.classList.contains("block")) {
    drawSquare(square);
  }
}

/* Grid Functions */

function createGrid(gridHeight, gridWidth) {
  for (let i = 1; i <= gridHeight * gridWidth; i++) {
    const gridBlock = document.createElement("div");
    gridBlock.classList.add("block");

    gridBlock.style.width = `${100 / gridWidth}%`;
    gridBlock.style.height = `${100 / gridHeight}%`;

    /*
      Each square stores its own opacity.
      This lets opacity increase separately for each block.
    */

    gridBlock.dataset.opacity = 0;

    container.appendChild(gridBlock);
  }
}

function clearGrid() {
  document.querySelectorAll(".block").forEach((gridBlock) => {
    gridBlock.remove();
  });
}

function getGridSize() {
  let size = Number(prompt("How many squares per side?"));
  while (!Number.isInteger(size) || size < 1 || size > 100) {
    size = Number(prompt("Please enter a whole number between 1 and 100."));
  }
  createGrid(size, size);
}

/* Utility Functions */

function getRandomColor() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `${r}, ${g}, ${b}`;
}
