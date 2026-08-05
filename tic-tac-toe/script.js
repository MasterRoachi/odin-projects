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

  return { getBoard, placeToken, resetBoard };
}

function playGame() {
  const gameboard = Gameboard();

  function Player(playerName, playerToken) {
    return {
      playerName: playerName,
      playerToken: playerToken,
    };
  }
  const getBoard = () => gameboard.getBoard();
  const playerOne = Player("Player One", "X");
  const playerTwo = Player("Player Two", "O");
  let winningPlayer = null;
  const getWinningPlayer = () => winningPlayer;
  let gameOver = false;
  const getGameOver = () => gameOver;
  let activePlayer = playerOne;

  const getActivePlayer = () => activePlayer;

  const switchPlayerTurn = () => {
    activePlayer = activePlayer === playerOne ? playerTwo : playerOne;
  };

  function placePlayerToken(squareIndex) {
    if (gameOver) {
      return;
    }
    const board = gameboard.getBoard();
    const playerToken = getActivePlayer().playerToken;

    if (gameboard.placeToken(squareIndex, playerToken) === true) {
      if (checkForWin()) {
        gameOver = true;
        winningPlayer = activePlayer;
        console.log(`${activePlayer.playerName} is the winner!`);
        return;
      }
      if (!board.includes("")) {
        gameOver = true;
        console.log("It's a Draw");
        return;
      }

      switchPlayerTurn();
    }
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
    activePlayer = playerOne;
  }

  return {
    getActivePlayer,
    getWinningPlayer,
    placePlayerToken,
    resetGame,
    getBoard,
    getGameOver,
  };
}

function screenController() {
  const gameboard = document.querySelector(".gameboard");
  const activeText = document.querySelector(".active-player");
  const board = game.getBoard();

  function renderBoard() {
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
    activeText.textContent = `It's ${game.getActivePlayer().playerName}'s Turn`;
  }

  renderBoard();

  const winnerBox = document.querySelector(".winner-box");
  const winner = document.querySelector(".winner");
  const winnerHeading = document.querySelector(".yay");
  const playAgainButton = document.querySelector(".play-again");
  playAgainButton.addEventListener("click", () => {
    game.resetGame();
    renderBoard();
    winnerBox.close();
  });

  function showWinner() {
    if (game.getGameOver()) {
      if (game.getWinningPlayer() === null) {
        winner.textContent = `It's a draw!`;
        winnerHeading.textContent = `Boo!!`;
      } else {
        winnerHeading.textContent = "Yayy";
        winner.textContent = `${game.getWinningPlayer().playerName} is the winner`;
      }
      winnerBox.showModal();
    }
  }
}

const game = playGame();
screenController();
