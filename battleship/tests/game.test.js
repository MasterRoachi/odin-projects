import { describe, it, expect } from "vitest";
import { createGame } from "../src/model/game.js";
import { createPlayer } from "../src/model/player.js";

/** A game with both fleets already scattered, ready to play. */
const started = () => {
  const game = createGame();
  game.randomiseFleet("human");
  game.randomiseFleet("computer");
  game.start();
  return game;
};

describe("players", () => {
  it("gives each player their own board", () => {
    const a = createPlayer({ name: "You", type: "human" });
    const b = createPlayer({ name: "Them", type: "computer" });
    expect(a.board).not.toBe(b.board);
  });

  it("only gives the computer a strategy", () => {
    expect(createPlayer({ name: "You", type: "human" }).hunter).toBeNull();
    expect(createPlayer({ name: "Them", type: "computer" }).hunter).not.toBeNull();
  });
});

describe("setting up", () => {
  it("starts in setup, not playing", () => {
    const game = createGame();
    expect(game.state).toBe("setup");
  });

  it("will not start until both fleets are placed", () => {
    const game = createGame();
    expect(() => game.start()).toThrow();
    game.randomiseFleet("human");
    expect(() => game.start()).toThrow();
  });

  it("starts once both fleets are down", () => {
    expect(started().state).toBe("playing");
  });

  it("can re-scatter a fleet during setup", () => {
    const game = createGame();
    game.randomiseFleet("human");
    const before = game.player("human").board.ships.length;
    game.randomiseFleet("human");
    expect(game.player("human").board.ships.length).toBe(before);
  });

  it("refuses shots before it has started", () => {
    const game = createGame();
    expect(() => game.fireAt([0, 0])).toThrow();
  });
});

describe("taking turns", () => {
  it("gives the first turn to the human", () => {
    expect(started().turn).toBe("human");
  });

  it("passes the turn to the computer after a shot", () => {
    const game = started();
    game.fireAt([0, 0]);
    expect(game.turn).toBe("computer");
  });

  it("refuses a second human shot before the computer has replied", () => {
    const game = started();
    game.fireAt([0, 0]);
    expect(() => game.fireAt([1, 1])).toThrow();
  });

  it("does not spend a turn on a square already fired at", () => {
    const game = started();
    game.fireAt([0, 0]);
    game.computerTurn();
    const again = game.fireAt([0, 0]);
    expect(again.repeat).toBe(true);
    expect(game.turn).toBe("human");
  });

  it("hands the turn back after the computer fires", () => {
    const game = started();
    game.fireAt([0, 0]);
    const shot = game.computerTurn();
    expect(shot.coord).toHaveLength(2);
    expect(game.turn).toBe("human");
  });

  it("will not let the computer fire out of turn", () => {
    expect(() => started().computerTurn()).toThrow();
  });
});

describe("finishing", () => {
  /** Every square on a board that has a ship under it. */
  const shipCells = (board) => {
    const cells = [];
    for (let x = 0; x < board.size; x++) {
      for (let y = 0; y < board.size; y++) {
        if (board.shipAt([x, y])) cells.push([x, y]);
      }
    }
    return cells;
  };

  /**
   * The human fires only at squares that are known to hold a ship, so they
   * win in exactly seventeen shots. Firing in raster order instead would lose
   * most games — the computer averages fifty-two shots and a sweep takes a
   * hundred — which is a fact about the opponent, not about ending a game.
   */
  const humanWins = () => {
    const game = started();
    for (const cell of shipCells(game.player("computer").board)) {
      if (game.state !== "playing") break;
      if (game.turn === "computer") game.computerTurn();
      if (game.state !== "playing") break;
      game.fireAt(cell);
    }
    return game;
  };

  it("ends when one side has lost everything", () => {
    const game = humanWins();
    expect(game.player("computer").board.allSunk()).toBe(true);
    expect(game.state).toBe("over");
    expect(game.winner).toBe("human");
  });

  it("refuses shots once it is over", () => {
    expect(() => humanWins().fireAt([0, 0])).toThrow();
  });

  it("does not hand the turn over on the winning shot", () => {
    // the computer must not get a free shot after it has already lost
    expect(() => humanWins().computerTurn()).toThrow();
  });

  it("lets the computer win too", () => {
    // a small board and a single small ship, so the computer gets there
    // quickly and the human — firing only at open water — never can
    const game = createGame({ size: 5, fleet: [{ name: "Patrol Boat", length: 2 }] });
    game.randomiseFleet("human");
    game.randomiseFleet("computer");
    game.start();

    const enemy = game.player("computer").board;
    const water = [];
    for (let x = 0; x < 5; x++) {
      for (let y = 0; y < 5; y++) if (!enemy.shipAt([x, y])) water.push([x, y]);
    }

    let i = 0;
    while (game.state === "playing" && i < water.length) {
      if (game.turn === "human") game.fireAt(water[i++]);
      else game.computerTurn();
    }

    expect(game.state).toBe("over");
    expect(game.winner).toBe("computer");
    expect(game.player("human").board.allSunk()).toBe(true);
  });
});
