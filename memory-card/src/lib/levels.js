/* =========================================================
   How big the board gets.

   Seven levels. Four cards is winnable by accident; sixteen is
   genuinely hard once the board reshuffles between every pick.
   ========================================================= */

export const LEVELS = [4, 6, 8, 10, 12, 14, 16];

export const sizeFor = (level) => LEVELS[Math.min(level, LEVELS.length) - 1];

export const isLastLevel = (level) => level >= LEVELS.length;
