// Global Variables //

let firstNumber = 0;
let currentOperator = "";
let resetScreen = false;
let secondNumber = 0;

// === Auxiliary === //


function rounded(x) {
  return Math.round(x * 100000) / 100000;
}
// Basic Math Functions //

function add(a, b) {
  return a + b;
}
function subtract(a, b) {
  return a - b;
}
function divide(a, b) {
  return a / b;
}
function multiply(a, b) {
  return a * b;
}

// Operate Function //

function operate(num1, operator, num2) {
  if (operator === "+") {
    return add(num1, num2);
  } else if (operator === "-") {
    return subtract(num1, num2);
  } else if (operator === "*") {
    return multiply(num1, num2);
  } else if (operator === "/") {
    return divide(num1, num2);
  }
}

// Numbers //

const screen = document.querySelector("#screen");

const numButtons = document.querySelectorAll(".number");
numButtons.forEach((number) => {
  number.addEventListener("click", () => {
    numberInput(number.textContent);
  });
});

function numberInput(number) {
  if (screen.textContent === "0" || resetScreen) {
    screen.textContent = number;
    resetScreen = false;
  } else if (screen.textContent.length >= 18) {
    return;
  } else {
    screen.textContent += number;
  }
}

// Operators //

const opsButtons = document.querySelectorAll(".operator");
opsButtons.forEach((operator) => {
  operator.addEventListener("click", () => {
    operatorInput(operator.textContent);
  });
});

function operatorInput(operator) {
  let newOperator = "";
  if (operator === "+") {
    newOperator = "+";
  } else if (operator === "-") {
    newOperator = "-";
  } else if (operator === "÷" || operator === "/") {
    newOperator = "/";
  } else if (operator === "×" || operator === "*" || operator === "x") {
    newOperator = "*";
  }
  if (currentOperator !== "" && resetScreen === false) {
    secondNumber = Number(screen.textContent);
    if (currentOperator === "/" && secondNumber === 0) {
      screen.textContent = "Nuh-uh, Nice Try!";
      firstNumber = 0;
      secondNumber = 0;
      currentOperator = "";
      resetScreen = true;
      return;
    }
    const result = operate(firstNumber, currentOperator, secondNumber);
    screen.textContent = rounded(result);
    firstNumber = rounded(result);
  } else {
    firstNumber = Number(screen.textContent);
  }
  currentOperator = newOperator;
  resetScreen = true;
}

// Equals Button //

const equalsButton = document.querySelector("#equals-button");
equalsButton.addEventListener("click", () => {
  equalsInput();
});

function equalsInput() {
  if (currentOperator === "" || resetScreen) {
    return;
  }
  secondNumber = Number(screen.textContent);
  if (currentOperator === "/" && secondNumber === 0) {
    screen.textContent = "Nuh-uh, Nice Try!";
    firstNumber = 0;
    secondNumber = 0;
    currentOperator = "";
    resetScreen = true;
    return;
  }
  const result = operate(firstNumber, currentOperator, secondNumber);
  screen.textContent = rounded(result);
  resetScreen = true;
  firstNumber = 0;
  secondNumber = 0;
  currentOperator = "";
}

// Clear Function //

const clearButton = document.querySelector("#clear-button");
clearButton.addEventListener("click", () => {
  clearInput();
});

function clearInput() {
  firstNumber = 0;
  secondNumber = 0;
  currentOperator = "";
  resetScreen = false;
  screen.textContent = "0";
}

// Decimal Function //

const decimal = document.querySelector(".decimal");
decimal.addEventListener("click", () => {
  decimalInput();
});

function decimalInput() {
  if (resetScreen === true) {
    screen.textContent = "0.";
    resetScreen = false;
  } else if (screen.textContent.includes(".")) {
    return;
  } else if (screen.textContent.length >= 18) {
    return;
  } else {
    screen.textContent += ".";
  }
}

// Backspace Function //

const backspace = document.querySelector(".back");
backspace.addEventListener("click", () => {
  backInput();
});

function backInput() {
  if (resetScreen) {
    return;
  } else if (screen.textContent.length === 1) {
    screen.textContent = "0";
  } else {
    screen.textContent = screen.textContent.slice(0, -1);
  }
}

// Keyboard Support //

const numberKeys = "0123456789";
const operatorKeys = "-+*/";
const equalsKeys = ["Enter", "="];
const clearKeys = ["Escape", "Delete"];
const backKeys = ["Backspace"];
const decimalKeys = ["."];

document.addEventListener("keydown", (event) => {
  if (numberKeys.includes(event.key)) {
    event.preventDefault();
    numberInput(event.key);
  } else if (operatorKeys.includes(event.key)) {
    event.preventDefault();
    operatorInput(event.key);
  } else if (equalsKeys.includes(event.key)) {
    event.preventDefault();
    equalsInput();
  } else if (clearKeys.includes(event.key)) {
    event.preventDefault();
    clearInput();
  } else if (backKeys.includes(event.key)) {
    event.preventDefault();
    backInput();
  } else if (decimalKeys.includes(event.key)) {
    event.preventDefault();
    decimalInput();
  }
});
