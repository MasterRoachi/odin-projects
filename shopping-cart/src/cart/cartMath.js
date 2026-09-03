/* =========================================================
   Everything the cart can do, as pure functions.

   No React in this file. Every one takes a cart and returns a
   new cart, which means the whole shopping model can be tested
   without rendering anything — the same split that made the
   Battleship logic testable.

   A line is: { id, title, image, priceCents, qty }
   ========================================================= */

import { priceOf } from "../lib/money.js";

export const MAX_QTY = 99;

/** Turns an API product into a cart line. */
export const lineFrom = (product, qty = 1) => ({
  id: product.id,
  title: product.title,
  image: product.image,
  priceCents: priceOf(product),
  qty: clampQty(qty),
});

const clampQty = (qty) => Math.max(1, Math.min(MAX_QTY, Math.trunc(Number(qty) || 1)));

/**
 * Adds a product, or increases the line that is already there.
 *
 * Adding something twice must not produce two lines for the same product —
 * that is the bug that makes a cart show "Backpack ×1" twice and a total
 * nobody can check.
 */
export function addLine(cart, product, qty = 1) {
  const existing = cart.find((line) => line.id === product.id);
  if (!existing) return [...cart, lineFrom(product, qty)];

  return cart.map((line) =>
    line.id === product.id ? { ...line, qty: clampQty(line.qty + qty) } : line
  );
}

/**
 * Sets a line's quantity outright.
 *
 * Zero removes the line rather than leaving one at zero, because a cart
 * containing nought of something is not a thing a person means.
 */
export function setQty(cart, id, qty) {
  const wanted = Math.trunc(Number(qty));
  if (!Number.isFinite(wanted) || wanted <= 0) return removeLine(cart, id);

  return cart.map((line) => (line.id === id ? { ...line, qty: clampQty(wanted) } : line));
}

export const removeLine = (cart, id) => cart.filter((line) => line.id !== id);

export const clearCart = () => [];

/** How many things are in the basket, counting quantities. */
export const countItems = (cart) => cart.reduce((total, line) => total + line.qty, 0);

/** In cents, always. */
export const subtotalCents = (cart) =>
  cart.reduce((total, line) => total + line.priceCents * line.qty, 0);

export const lineTotalCents = (line) => line.priceCents * line.qty;

export const inCart = (cart, id) => cart.some((line) => line.id === id);
