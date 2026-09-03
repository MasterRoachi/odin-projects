/* =========================================================
   A player.

   Owns a board — their own, holding their own ships, which is
   the board that receives the enemy's attacks. A computer
   player also owns a strategy; a human owns nothing else,
   because the strategy is the person sitting there.
   ========================================================= */

import { createGameboard } from "./gameboard.js";
import { createHunter } from "./hunter.js";

export function createPlayer({ name, type = "human", size = 10, random = Math.random }) {
  const board = createGameboard(size);
  const hunter = type === "computer" ? createHunter(size, random) : null;

  return {
    name,
    type,
    board,
    hunter,
    get isComputer() {
      return type === "computer";
    },
  };
}

export default createPlayer;
