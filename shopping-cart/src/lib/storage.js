/* =========================================================
   The basket, kept between visits.
   ========================================================= */

const KEY = "almgren:cart:v1";

export function loadCart() {
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    // a hand-edited or half-written value must not crash the shop
    return Array.isArray(parsed) ? parsed.filter(isLine) : [];
  } catch {
    return [];
  }
}

const isLine = (line) =>
  line &&
  typeof line.id !== "undefined" &&
  typeof line.title === "string" &&
  Number.isFinite(line.priceCents) &&
  Number.isInteger(line.qty) &&
  line.qty > 0;

export function saveCart(cart) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(cart));
  } catch {
    /* private windows throw; the cart still works for this session */
  }
}
