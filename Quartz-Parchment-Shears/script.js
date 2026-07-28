const options = ['quartz', 'parchment', 'shears'];

let humanScore = 0;
let computerScore = 0;
let gameOver = false;

const quartzButton = document.querySelector(".quartz");
const parchmentButton = document.querySelector(".parchment");
const shearsButton = document.querySelector(".shears");

const humanScoreDisplay = document.querySelector("#human-score");
const computerScoreDisplay = document.querySelector("#computer-score");
const roundResult = document.querySelector("#round-result");

function getComputerChoice() {
    const randomIndex = Math.floor(Math.random() * options.length);
    const computerChoice = options[randomIndex];
    return computerChoice;
}

function playRound(humanChoice, computerChoice) {
    const human = humanChoice.toLowerCase();
    const computer = computerChoice.toLowerCase();

    if (human === computer) {
        return "Dang Flabbit, we Drew!"
    } else if (
        (human === "quartz" && computer === "shears") ||
        (human === "parchment" && computer === "quartz") ||
        (human === "shears" && computer === "parchment")
    ) {
        humanScore++;
        return `Jolly good show! ${human} triumphs over ${computer}!`;
    } else {
        computerScore++;
        return `Alas! ${computer} triumphs over ${human}!`;
    }
}

function checkWinner() {
    if (humanScore >= 5) {
        gameOver = true;
        roundResult.textContent = "Huzzah! You are the victor!";

        setTimeout(resetGame, 1000);
    } else if (computerScore >= 5) {
        gameOver = true;
        roundResult.textContent = "Alas! The computer has bested you!";

        setTimeout(resetGame, 1000)
    }
}

function resetGame() {
    humanScore = 0
    computerScore = 0
    gameOver = false;

    humanScoreDisplay.textContent = humanScore;
    computerScoreDisplay.textContent = computerScore;

    roundResult.textContent = "Choose wisely.";
}

function handleChoiceClick(humanChoice) {
    if (gameOver) {
        return;
    }

    const computerChoice = getComputerChoice();
    const resultMessage = playRound(humanChoice, computerChoice)

    roundResult.textContent = resultMessage;

    humanScoreDisplay.textContent = humanScore;
    computerScoreDisplay.textContent = computerScore;

    checkWinner();
}


quartzButton.addEventListener("click", () => {
    handleChoiceClick("quartz");
})

parchmentButton.addEventListener("click", () => {
    handleChoiceClick("parchment");
})

shearsButton.addEventListener("click", () => {
    handleChoiceClick("shears");
})