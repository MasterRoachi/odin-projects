# Almgren — a shopping cart

The last React project, from [The Odin Project](https://www.theodinproject.com/)'s Shopping Cart assignment. A small shop with routing, filtering held in the URL, and a basket that survives a refresh.

```bash
npm install
npm run dev
npm run build
npm test          # 46 tests
```

[**Open it**](./dist/) — nothing is for sale.

## The point of the project: prop drilling, then Context

This was built **twice on purpose**, in two commits, because being told prop drilling is a problem is not the same as running into it.

**The first commit** keeps the cart in `App` and hands it down. It works perfectly. It also produces this:

```
App ──cartCount──> Layout ──cartCount──> Nav ──count──> CartBadge
```

Three components carry that number and only the last one wants it. `Layout` and `Nav` mention the cart purely to pass it on. Same story with adding: `App → Shop → ProductCard`, where `Shop` never adds anything to anything. Nine cart-related props left `App` in total.

**The second commit** is `CartProvider` and a `useCart()` hook. Every one of those nine props is gone, `Layout` and `Nav` no longer mention the cart at all, and `CartBadge` asks for the count itself:

```jsx
function CartBadge() {
  const { count } = useCart();
  ...
}
```

Two things worth saying about the refactor:

**No behaviour changed.** Every cart operation is still the same pure function from `cartMath.js` — Context changed *how components reach them*, not what they do. That is why the tests written against the first version still pass against the second.

**Not everything moved.** `catalogue` is still passed as a prop, deliberately. It travels exactly one hop, from the router to a page that uses it, which is what props are for. Moving it into a context too would be copying the shape of the fix without the reason for it.

## Context, done carefully

Two details that are easy to leave out and cost real re-renders:

```jsx
const value = useMemo(() => ({ cart, count, subtotal, has, add, ... }), [cart, ...]);
```

Without the `useMemo`, that object is rebuilt on every provider render — a new reference every time, which re-renders **every** consumer even when the cart has not changed. The mutators are wrapped in `useCallback` for the same reason.

```jsx
export function useCart() {
  const value = useContext(CartContext);
  if (value === null) throw new Error("useCart has to be used inside a <CartProvider>");
  return value;
}
```

Without the check, using it outside the provider fails as `Cannot read properties of null (reading 'count')` somewhere deep in a component, which tells you nothing about the actual mistake.

## HashRouter, not BrowserRouter

This is served as static files from a subfolder. With real paths, `/shop` is an address the **host** has to know to answer with `index.html` — and a static host does not, so a refresh or a shared link 404s. The hash is never sent to the server, so every route works with no server configuration at all. The cost is a `#` in the URL.

Verified by loading `#/cart` cold, not by assuming.

## The filter lives in the URL

Category and sort are read from the query string with `useSearchParams`, not held in state:

```
#/shop?category=jewelery&sort=price-asc
```

Which means a filtered view can be linked to, and a reload does not silently reset what you were looking at. It also means the filter **is not state** — the visible list is *derived* from the URL during render, so there is no effect keeping two things in step and no way for them to disagree.

Filter changes use `replace`, so changing category twenty times does not leave twenty entries in the back button.

## Money is in cents

Prices arrive as floating-point dollars, and floats do not add up — `19.99 * 3` is `59.97000000000001`. Every total is computed in whole cents and only formatted for display. There is a test asserting `0.1 + 0.2 !== 0.3` next to the one asserting the subtotal is exactly `5997`, so the reason is written down where the code is.

## Tests

46, in three files:

* **`cartMath.test.js`** — the model, with no React in it: merging a repeat rather than making a second line, zero removing a line rather than leaving a line of nought, quantity clamping, nonsense quantities, counting quantities rather than lines, and the cents arithmetic.
* **`shop.test.jsx`** — the grid, filtering, sorting, reading a filter out of the URL it was opened with, and adding from a card updating the badge in the nav, which is nowhere near the button.
* **`cart.test.jsx`** — the basket seeded through `localStorage`, which is how a returning visitor actually arrives, so it covers persistence too. Includes a deliberately corrupted saved basket and one with malformed lines.

Everything is queried **by role and by text, never by class**. A test that breaks when a div is renamed was testing the build rather than the behaviour.

### What the tests caught

A real screen-reader bug, and one I would never have found by looking.

The add button was short visible text plus a hidden span:

```jsx
<button>Add<span className="visually-hidden"> {product.title} to basket</span></button>
```

Accessible-name computation **trims each node before joining them**, so the leading space is discarded and the button announced as **"AddCanvas Backpack to basket"**. The basket link had the same flaw — `"Basket0 items"`. Both now use an explicit `aria-label`, which cannot depend on JSX whitespace surviving.

The test failed on a name mismatch, which is exactly the failure a sighted person testing by clicking would never see.

## Verifying it

Beyond the tests, checked in the browser: the free-shipping threshold either side of $50 including the "$42.05 more for free shipping" nudge, a quantity of 0 removing the line, a bad product id (`#/product/banana`), an unknown route, a deep-linked filter populating both selects, and the basket surviving a reload.

Two things that were **not** bugs and cost time anyway: the preview browser served a cached `index.html` pointing at a bundle that no longer existed on disk, which made a fix look like it had not applied; and clearing `localStorage` after mount does not reset React state, which made an earlier basket look like it had leaked.

## What I Practiced

* Prop drilling as something felt rather than described, and Context as the answer to a specific problem
* Memoising a context value, and why a new object every render defeats the point
* Routing as addresses — `/product/7` being linkable and go-back-able is the whole reason it is a route
* URL as state, and that derived data needs no effect
* Testing by role and text, and finding an accessibility bug because of it

## Project Status

Complete, with product routes, URL-held filtering and sorting, a persistent basket, and 46 tests.

## Acknowledgements

Completed as part of The Odin Project's React course. Catalogue from [Fake Store API](https://fakestoreapi.com/).
