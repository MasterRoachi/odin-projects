function Gameboard() {
  const squares = 9;
  const board = [];

  for (let i = 0; i < squares; i++) {
    board[i] = "";
  }

  const resetBoard = () => {
    for (let i = 0; i < board.length; i++) {
      board[i] = "";
    }
  };

  const getBoard = () => board;

  const placeToken = (squareIndex, token) => {
    if (board[squareIndex] === "") {
      board[squareIndex] = token;
      return true;
    }

    return false;
  };

  return {
    getBoard,
    placeToken,
    resetBoard,
  };
}

function playGame(playerOneName, playerTwoName) {
  const gameboard = Gameboard();

  function Player(playerName, playerToken) {
    return {
      playerName,
      playerToken,
    };
  }

  const playerOne = Player(playerOneName, "X");
  const playerTwo = Player(playerTwoName, "O");

  let activePlayer = playerOne;
  let winningPlayer = null;
  let gameOver = false;

  const getBoard = () => gameboard.getBoard();
  const getActivePlayer = () => activePlayer;
  const getWinningPlayer = () => winningPlayer;
  const getGameOver = () => gameOver;

  const switchPlayerTurn = () => {
    activePlayer = activePlayer === playerOne ? playerTwo : playerOne;
  };

  function swapTokens() {
    const oldPlayerOneToken = playerOne.playerToken;

    playerOne.playerToken = playerTwo.playerToken;
    playerTwo.playerToken = oldPlayerOneToken;
  }

  function placePlayerToken(squareIndex) {
    if (gameOver) {
      return;
    }

    const board = gameboard.getBoard();
    const playerToken = activePlayer.playerToken;
    const tokenWasPlaced = gameboard.placeToken(squareIndex, playerToken);

    if (!tokenWasPlaced) {
      return;
    }

    if (checkForWin()) {
      gameOver = true;
      winningPlayer = activePlayer;
      return;
    }

    if (!board.includes("")) {
      gameOver = true;
      return;
    }

    switchPlayerTurn();
  }

  function checkForWin() {
    const winConditions = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [6, 4, 2],
    ];

    const board = gameboard.getBoard();

    for (const condition of winConditions) {
      const firstSquare = board[condition[0]];
      const secondSquare = board[condition[1]];
      const thirdSquare = board[condition[2]];

      if (
        firstSquare !== "" &&
        firstSquare === secondSquare &&
        firstSquare === thirdSquare
      ) {
        return true;
      }
    }

    return false;
  }

  function resetGame() {
    gameboard.resetBoard();
    gameOver = false;
    winningPlayer = null;

    activePlayer =
      playerOne.playerToken === "X" ? playerOne : playerTwo;
  }

  return {
    getActivePlayer,
    getWinningPlayer,
    placePlayerToken,
    resetGame,
    swapTokens,
    getBoard,
    getGameOver,
  };
}

function screenController() {
  const playerSetupDialog = document.querySelector(".player-setup");
  const playerSetupForm = document.querySelector(".player-form");
  const playerOneInput = document.querySelector("#player-one");
  const playerTwoInput = document.querySelector("#player-two");

  const gameboard = document.querySelector(".gameboard");
  const activeText = document.querySelector(".active-player");

  const winnerBox = document.querySelector(".winner-box");
  const winner = document.querySelector(".winner");
  const winnerHeading = document.querySelector(".yay");
  const playAgainButton = document.querySelector("#play-again");

  const swapButton = document.querySelector("#swap");
  const newPlayersButton = document.querySelector("#new");

  function renderBoard() {
    const board = game.getBoard();

    gameboard.replaceChildren();

    board.forEach((square, index) => {
      const currentSquare = document.createElement("button");

      currentSquare.classList.add("square");
      currentSquare.dataset.index = index;
      currentSquare.textContent = square;

      currentSquare.addEventListener("click", () => {
        game.placePlayerToken(index);
        renderBoard();
        showWinner();
      });

      gameboard.appendChild(currentSquare);
    });

    const activePlayer = game.getActivePlayer();

    activeText.textContent =
      `It's ${activePlayer.playerName}'s Turn (${activePlayer.playerToken})`;
  }

  function showWinner() {
    if (!game.getGameOver()) {
      return;
    }

    if (game.getWinningPlayer() === null) {
      winnerHeading.textContent = "Boo!!";
      winner.textContent = "It's a draw!";
    } else {
      winnerHeading.textContent = "Yayy";
      winner.textContent =
        `${game.getWinningPlayer().playerName} is the Winner!`;
    }

    winnerBox.showModal();
  }

  playerSetupForm.addEventListener("submit", (event) => {
    event.preventDefault();

    game = playGame(
      playerOneInput.value,
      playerTwoInput.value,
    );

    playerSetupDialog.close();
    renderBoard();
  });

  playAgainButton.addEventListener("click", () => {
    game.resetGame();
    renderBoard();
    winnerBox.close();
  });

  swapButton.addEventListener("click", () => {
    game.swapTokens();
    game.resetGame();
    renderBoard();
  });

  newPlayersButton.addEventListener("click", () => {
    playerSetupForm.reset();
    playerSetupDialog.showModal();
  });

  playerSetupDialog.addEventListener("cancel", (event) => {
  if (!game) {
    event.preventDefault();
  }
});

winnerBox.addEventListener("cancel", (event) => {
  event.preventDefault();
  game.resetGame();
  renderBoard();
  winnerBox.close();
});

  playerSetupDialog.showModal();
}

let game;

screenController();