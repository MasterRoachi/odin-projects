/* =========================================================
   The game.

   Owns the two players, whose turn it is, and when it is over.
   Still no DOM — the whole game can be played from a test, and
   the test suite does exactly that.

   Turns alternate strictly. A hit does not buy another go.
   ========================================================= */

import { createPlayer } from "./player.js";
import { createGameboard } from "./gameboard.js";
import { FLEET, placeRandomly } from "./fleet.js";

export function createGame({ size = 10, fleet = FLEET, random = Math.random } = {}) {
  let players = {
    human: createPlayer({ name: "You", type: "human", size, random }),
    computer: createPlayer({ name: "The Enemy", type: "computer", size, random }),
  };

  let state = "setup"; // setup → playing → over
  let turn = "human";
  let winner = null;

  const other = (who) => (who === "human" ? "computer" : "human");
  const fleetIsDown = (who) => players[who].board.ships.length === fleet.length;

  function requirePlaying() {
    if (state !== "playing") {
      throw new Error(`the game is ${state}, not playing`);
    }
  }

  const game = {
    size,
    fleet,

    get state() {
      return state;
    },
    get turn() {
      return turn;
    },
    get winner() {
      return winner;
    },

    player(who) {
      return players[who];
    },

    /* --- setup ------------------------------------------ */

    /**
     * Throws away whatever that player had and scatters a fresh fleet.
     *
     * A new board rather than a cleared one — half-cleared state is a rich
     * source of bugs, and a board is cheap.
     */
    randomiseFleet(who) {
      if (state !== "setup") throw new Error("fleets are settled once the game starts");

      players[who] = createPlayer({
        name: players[who].name,
        type: players[who].type,
        size,
        random,
      });
      placeRandomly(players[who].board, fleet, random);
      return players[who].board;
    },

    /** Puts one ship down by hand, for the human dragging them about. */
    place(who, name, length, origin, orientation) {
      if (state !== "setup") throw new Error("fleets are settled once the game starts");
      return players[who].board.place(name, length, origin, orientation);
    },

    /** Empties a player's board back to nothing. */
    clearFleet(who) {
      if (state !== "setup") throw new Error("fleets are settled once the game starts");
      players[who] = createPlayer({
        name: players[who].name,
        type: players[who].type,
        size,
        random,
      });
      return players[who].board;
    },

    start() {
      if (!fleetIsDown("human") || !fleetIsDown("computer")) {
        throw new Error("both fleets have to be on the board before the shooting starts");
      }
      state = "playing";
      turn = "human";
      winner = null;
      return game;
    },

    /* --- playing ---------------------------------------- */

    /**
     * The human fires at the computer's board.
     *
     * A repeat costs nothing — the turn stays put, because spending a go on a
     * square you have already tried is a punishment for a misclick rather
     * than a move.
     */
    fireAt(coord) {
      requirePlaying();
      if (turn !== "human") throw new Error("it is not your turn");

      const result = players.computer.board.receiveAttack(coord);
      if (result.repeat) return result;

      if (players.computer.board.allSunk()) {
        state = "over";
        winner = "human";
        return result;
      }

      turn = "computer";
      return result;
    },

    /**
     * The computer fires back.
     *
     * It is handed only the result of its own shot — never the board — which
     * is what keeps it honest and what makes it testable.
     */
    computerTurn() {
      requirePlaying();
      if (turn !== "computer") throw new Error("it is not the computer's turn");

      const { hunter } = players.computer;
      const coord = hunter.nextShot();
      if (coord === null) throw new Error("the computer has nowhere left to fire");

      const result = players.human.board.receiveAttack(coord);
      hunter.record(coord, result);

      if (players.human.board.allSunk()) {
        state = "over";
        winner = "computer";
        return { coord, result };
      }

      turn = "human";
      return { coord, result };
    },

    /** Back to an empty setup, keeping nothing. */
    reset() {
      players = {
        human: createPlayer({ name: "You", type: "human", size, random }),
        computer: createPlayer({ name: "The Enemy", type: "computer", size, random }),
      };
      state = "setup";
      turn = "human";
      winner = null;
      return game;
    },
  };

  return game;
}

export { createGameboard };
export default createGame;
