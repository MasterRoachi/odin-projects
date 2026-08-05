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
  const getBoard = () => gameboard.getBoard()
  const playerOne = Player("Player One", "X");
  const playerTwo = Player("Player Two", "O");
  let gameOver = false;
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
    activePlayer = playerOne;
  }

  return { getActivePlayer, placePlayerToken, resetGame, getBoard };
}

const game = playGame();