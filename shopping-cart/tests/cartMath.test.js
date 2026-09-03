import { describe, it, expect } from "vitest";
import {
  addLine,
  setQty,
  removeLine,
  countItems,
  subtotalCents,
  lineTotalCents,
  inCart,
  lineFrom,
  MAX_QTY,
} from "../src/cart/cartMath.js";

/* The shopping model has no React in it, so none of this renders anything. */

const backpack = { id: 1, title: "Backpack", image: "a.png", price: 109.95, category: "bags" };
const ring = { id: 7, title: "Ring", image: "b.png", price: 9.99, category: "jewelery" };

describe("adding", () => {
  it("puts a product in an empty cart", () => {
    const cart = addLine([], backpack);
    expect(cart).toHaveLength(1);
    expect(cart[0]).toMatchObject({ id: 1, title: "Backpack", qty: 1 });
  });

  it("converts the price to whole cents", () => {
    expect(addLine([], backpack)[0].priceCents).toBe(10995);
    expect(addLine([], ring)[0].priceCents).toBe(999);
  });

  it("merges a repeat instead of making a second line", () => {
    const cart = addLine(addLine([], backpack), backpack);
    expect(cart).toHaveLength(1);
    expect(cart[0].qty).toBe(2);
  });

  it("adds a requested quantity", () => {
    expect(addLine([], backpack, 3)[0].qty).toBe(3);
  });

  it("keeps different products apart", () => {
    const cart = addLine(addLine([], backpack), ring);
    expect(cart.map((line) => line.id)).toEqual([1, 7]);
  });

  it("never mutates the cart it was given", () => {
    const before = [];
    addLine(before, backpack);
    expect(before).toHaveLength(0);
  });

  it("refuses to go past the maximum", () => {
    expect(addLine([], backpack, 500)[0].qty).toBe(MAX_QTY);
    expect(addLine(addLine([], backpack, MAX_QTY), backpack, 5)[0].qty).toBe(MAX_QTY);
  });

  it("treats nonsense quantities as one", () => {
    expect(lineFrom(backpack, "banana").qty).toBe(1);
    expect(lineFrom(backpack, 0).qty).toBe(1);
    expect(lineFrom(backpack, -4).qty).toBe(1);
  });
});

describe("changing quantity", () => {
  const cart = addLine(addLine([], backpack), ring);

  it("sets a line outright", () => {
    expect(setQty(cart, 1, 4).find((l) => l.id === 1).qty).toBe(4);
  });

  it("leaves the other lines alone", () => {
    expect(setQty(cart, 1, 4).find((l) => l.id === 7).qty).toBe(1);
  });

  it("removes the line at zero rather than keeping a line of none", () => {
    const next = setQty(cart, 1, 0);
    expect(next).toHaveLength(1);
    expect(inCart(next, 1)).toBe(false);
  });

  it("treats a negative as a removal", () => {
    expect(setQty(cart, 1, -2)).toHaveLength(1);
  });

  it("copes with a typed string", () => {
    expect(setQty(cart, 1, "6").find((l) => l.id === 1).qty).toBe(6);
  });

  it("ignores an id that is not there", () => {
    expect(setQty(cart, 999, 3)).toHaveLength(2);
  });
});

describe("removing", () => {
  it("takes the line out", () => {
    const cart = addLine(addLine([], backpack), ring);
    expect(removeLine(cart, 1).map((l) => l.id)).toEqual([7]);
  });

  it("does nothing for an unknown id", () => {
    expect(removeLine(addLine([], backpack), 42)).toHaveLength(1);
  });
});

describe("counting and totals", () => {
  it("counts quantities, not lines", () => {
    const cart = addLine(addLine([], backpack, 3), ring, 2);
    expect(cart).toHaveLength(2);
    expect(countItems(cart)).toBe(5);
  });

  it("is zero for an empty cart", () => {
    expect(countItems([])).toBe(0);
    expect(subtotalCents([])).toBe(0);
  });

  it("totals a line", () => {
    expect(lineTotalCents({ priceCents: 999, qty: 5 })).toBe(4995);
  });

  /*
   * The reason everything is in cents. In floating point,
   * 19.99 * 3 is 59.97000000000001, and a few of those in a subtotal shows
   * up as a penny out on the page.
   */
  it("adds up exactly where floating point would not", () => {
    const awkward = { id: 2, title: "Odd", image: "", price: 19.99 };
    const cart = addLine([], awkward, 3);
    expect(subtotalCents(cart)).toBe(5997);
    expect(0.1 + 0.2).not.toBe(0.3); // the thing being avoided
  });

  it("sums several lines", () => {
    const cart = addLine(addLine([], backpack, 2), ring, 1);
    expect(subtotalCents(cart)).toBe(10995 * 2 + 999);
  });
});
