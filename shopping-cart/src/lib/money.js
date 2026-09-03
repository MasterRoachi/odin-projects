/* =========================================================
   Money.

   Prices arrive as floating point dollars, and floats do not
   add up: 19.99 + 0.01 is not 20 in binary. Every total is
   therefore computed in whole cents and only turned back into
   a decimal for display.
   ========================================================= */

const formatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export const toCents = (dollars) => Math.round(Number(dollars) * 100);

export const money = (cents) => formatter.format(cents / 100);

/** For a raw API price, which is a float in dollars. */
export const priceOf = (product) => toCents(product.price);
