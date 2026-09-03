import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { loadCart, saveCart } from "../lib/storage.js";
import {
  addLine,
  setQty,
  removeLine,
  clearCart,
  countItems,
  subtotalCents,
  inCart,
} from "./cartMath.js";

/* =========================================================
   The cart, available anywhere.

   This replaces threading the cart down through props. Before
   this existed, `cartCount` travelled App → Layout → Nav →
   CartBadge, and only the last of those four wanted it; `onAdd`
   travelled App → Shop → ProductCard, and Shop never added
   anything to anything.

   Nothing about the cart's behaviour changed — every operation
   is still the same pure function from cartMath.js. All that
   changed is how components get hold of them.
   ========================================================= */

const CartContext = createContext(null);

export function CartProvider({ children }) {
  /* still read in the initialiser rather than an effect, so the first render
     already has the saved basket and nothing flashes empty */
  const [cart, setCart] = useState(loadCart);

  /* localStorage is outside React, so keeping it in step is a real effect */
  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  /* stable identities, so a consumer that only calls `add` is not re-rendered
     because some unrelated part of the provider re-ran */
  const add = useCallback(
    (product, qty = 1) => setCart((current) => addLine(current, product, qty)),
    []
  );
  const changeQty = useCallback((id, qty) => setCart((current) => setQty(current, id, qty)), []);
  const remove = useCallback((id) => setCart((current) => removeLine(current, id)), []);
  const empty = useCallback(() => setCart(clearCart()), []);

  /*
   * Memoised on the cart.
   *
   * Without this the value object is rebuilt on every render of the provider,
   * which is a new reference, which re-renders every consumer even when the
   * cart itself has not changed — including every time the catalogue finishes
   * loading or a route changes.
   */
  const value = useMemo(
    () => ({
      cart,
      count: countItems(cart),
      subtotal: subtotalCents(cart),
      has: (id) => inCart(cart, id),
      add,
      changeQty,
      remove,
      empty,
    }),
    [cart, add, changeQty, remove, empty]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/**
 * The cart, from anywhere inside the provider.
 *
 * Throws rather than returning undefined when used outside one. Without the
 * check the failure is `Cannot read properties of null (reading 'count')`
 * somewhere deep in a component, which says nothing about the actual mistake.
 */
export function useCart() {
  const value = useContext(CartContext);
  if (value === null) {
    throw new Error("useCart has to be used inside a <CartProvider>");
  }
  return value;
}
