/* =========================================================
   A ship.

   It knows how long it is and how many times it has been hit.
   It does not know where it is — that is the gameboard's
   business, and keeping it out of here is what makes a ship
   trivial to test.
   ========================================================= */

/**
 * @param {string} name
 * @param {number} length how many squares it occupies
 */
export function createShip(name, length) {
  if (!Number.isInteger(length) || length < 1) {
    throw new RangeError(`a ship must be at least one square long, got ${length}`);
  }

  let hits = 0;

  return {
    name,
    length,

    /* Read only. A ship whose damage could be assigned from outside would
       make isSunk() meaningless. */
    get hits() {
      return hits;
    },

    /**
     * Records a hit.
     *
     * Capped at its length. The gameboard refuses repeat attacks so this
     * should never be reachable, but a ship that recorded six hits on five
     * squares would quietly break any count built on top of it.
     */
    hit() {
      if (hits < length) hits += 1;
      return this;
    },

    isSunk() {
      return hits >= length;
    },
  };
}

export default createShip;
