import { describe, it, expect } from "vitest";
import { createShip } from "../src/model/ship.js";

describe("createShip", () => {
  it("remembers its name and length", () => {
    const ship = createShip("Destroyer", 3);
    expect(ship.name).toBe("Destroyer");
    expect(ship.length).toBe(3);
  });

  it("starts undamaged", () => {
    const ship = createShip("Destroyer", 3);
    expect(ship.hits).toBe(0);
    expect(ship.isSunk()).toBe(false);
  });

  it("counts hits", () => {
    const ship = createShip("Destroyer", 3);
    ship.hit();
    expect(ship.hits).toBe(1);
    ship.hit();
    expect(ship.hits).toBe(2);
  });

  it("is not sunk while it has length left", () => {
    const ship = createShip("Carrier", 5);
    for (let i = 0; i < 4; i++) ship.hit();
    expect(ship.isSunk()).toBe(false);
  });

  it("sinks on the hit that matches its length", () => {
    const ship = createShip("Patrol Boat", 2);
    ship.hit();
    expect(ship.isSunk()).toBe(false);
    ship.hit();
    expect(ship.isSunk()).toBe(true);
  });

  it("cannot be hit more times than it is long", () => {
    // the gameboard refuses repeat attacks, so this should be unreachable —
    // but a ship that could record six hits on five squares would make the
    // sunk count meaningless if that guarantee ever broke
    const ship = createShip("Carrier", 5);
    for (let i = 0; i < 9; i++) ship.hit();
    expect(ship.hits).toBe(5);
  });

  it("refuses a length that could not be placed", () => {
    expect(() => createShip("Nothing", 0)).toThrow();
    expect(() => createShip("Backwards", -3)).toThrow();
  });

  it("does not let callers set hits directly", () => {
    // hits is a getter over a closed-over count, so this throws rather than
    // quietly corrupting the ship — modules are strict mode
    const ship = createShip("Destroyer", 3);
    expect(() => {
      ship.hits = 99;
    }).toThrow(TypeError);
    expect(ship.hits).toBe(0);
    expect(ship.isSunk()).toBe(false);
  });
});
