import { describe, it, expect } from "vitest";
import { createGameboard } from "../src/model/gameboard.js";

const board = () => createGameboard(10);

describe("placing ships", () => {
  it("places a ship horizontally and reports the squares it occupies", () => {
    const b = board();
    b.place("Destroyer", 3, [2, 4], "horizontal");
    expect(b.shipAt([2, 4])).not.toBeNull();
    expect(b.shipAt([3, 4])).not.toBeNull();
    expect(b.shipAt([4, 4])).not.toBeNull();
    expect(b.shipAt([5, 4])).toBeNull();
  });

  it("places a ship vertically", () => {
    const b = board();
    b.place("Destroyer", 3, [2, 4], "vertical");
    expect(b.shipAt([2, 5])).not.toBeNull();
    expect(b.shipAt([2, 6])).not.toBeNull();
    expect(b.shipAt([3, 4])).toBeNull();
  });

  it("refuses a ship that would hang off the edge", () => {
    const b = board();
    expect(() => b.place("Carrier", 5, [8, 0], "horizontal")).toThrow();
    expect(() => b.place("Carrier", 5, [0, 8], "vertical")).toThrow();
  });

  it("refuses a ship that would overlap another", () => {
    const b = board();
    b.place("Carrier", 5, [0, 0], "horizontal");
    expect(() => b.place("Destroyer", 3, [2, 0], "vertical")).toThrow();
  });

  it("leaves the board unchanged when a placement is refused", () => {
    const b = board();
    b.place("Carrier", 5, [0, 0], "horizontal");
    try {
      b.place("Destroyer", 3, [4, 0], "horizontal");
    } catch {
      /* expected */
    }
    expect(b.ships).toHaveLength(1);
    expect(b.shipAt([5, 0])).toBeNull();
  });

  it("can say whether a placement would be legal without making it", () => {
    const b = board();
    b.place("Carrier", 5, [0, 0], "horizontal");
    expect(b.canPlace(3, [0, 1], "horizontal")).toBe(true);
    expect(b.canPlace(3, [2, 0], "vertical")).toBe(false);
    expect(b.canPlace(5, [8, 0], "horizontal")).toBe(false);
    expect(b.ships).toHaveLength(1);
  });

  it("allows two ships to touch", () => {
    const b = board();
    b.place("Carrier", 5, [0, 0], "horizontal");
    expect(() => b.place("Patrol Boat", 2, [0, 1], "horizontal")).not.toThrow();
  });
});

describe("receiving attacks", () => {
  it("reports a miss and records it", () => {
    const b = board();
    const result = b.receiveAttack([9, 9]);
    expect(result.hit).toBe(false);
    expect(b.missedShots).toContainEqual([9, 9]);
  });

  it("reports a hit and passes it to the right ship", () => {
    const b = board();
    b.place("Destroyer", 3, [2, 4], "horizontal");
    const result = b.receiveAttack([3, 4]);
    expect(result.hit).toBe(true);
    expect(result.sunk).toBe(false);
    expect(b.shipAt([3, 4]).hits).toBe(1);
  });

  it("does not add a hit to the missed list", () => {
    const b = board();
    b.place("Destroyer", 3, [2, 4], "horizontal");
    b.receiveAttack([3, 4]);
    expect(b.missedShots).toHaveLength(0);
  });

  it("says when an attack sank a ship, and which squares it filled", () => {
    const b = board();
    b.place("Patrol Boat", 2, [0, 0], "horizontal");
    expect(b.receiveAttack([0, 0]).sunk).toBe(false);
    const killing = b.receiveAttack([1, 0]);
    expect(killing.sunk).toBe(true);
    expect(killing.ship.name).toBe("Patrol Boat");
    expect(killing.sunkCells).toEqual([
      [0, 0],
      [1, 0],
    ]);
  });

  it("refuses a square that has already been attacked", () => {
    const b = board();
    b.receiveAttack([5, 5]);
    const again = b.receiveAttack([5, 5]);
    expect(again.repeat).toBe(true);
    expect(b.missedShots).toHaveLength(1);
  });

  it("does not let a repeat attack damage a ship twice", () => {
    const b = board();
    b.place("Destroyer", 3, [2, 4], "horizontal");
    b.receiveAttack([2, 4]);
    b.receiveAttack([2, 4]);
    expect(b.shipAt([2, 4]).hits).toBe(1);
  });

  it("refuses a square that is not on the board", () => {
    const b = board();
    expect(() => b.receiveAttack([10, 0])).toThrow();
    expect(() => b.receiveAttack([-1, 0])).toThrow();
  });
});

describe("knowing when it is over", () => {
  it("is not over while anything floats", () => {
    const b = board();
    b.place("Patrol Boat", 2, [0, 0], "horizontal");
    b.place("Destroyer", 3, [0, 2], "horizontal");
    b.receiveAttack([0, 0]);
    b.receiveAttack([1, 0]);
    expect(b.allSunk()).toBe(false);
  });

  it("is over when every ship has sunk", () => {
    const b = board();
    b.place("Patrol Boat", 2, [0, 0], "horizontal");
    b.place("Destroyer", 3, [0, 2], "horizontal");
    [
      [0, 0],
      [1, 0],
      [0, 2],
      [1, 2],
      [2, 2],
    ].forEach((c) => b.receiveAttack(c));
    expect(b.allSunk()).toBe(true);
  });

  it("an empty board is not already won", () => {
    // otherwise a game would end the moment it started
    expect(board().allSunk()).toBe(false);
  });
});
