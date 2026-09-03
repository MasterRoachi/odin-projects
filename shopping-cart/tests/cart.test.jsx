import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "../src/cart/CartContext.jsx";
import Layout from "../src/routes/Layout.jsx";
import Cart from "../src/routes/Cart.jsx";

/* =========================================================
   The basket page, seeded through storage.

   Writing localStorage before mounting is how a real returning
   visitor arrives, so this also covers the persistence path
   rather than needing a separate test for it.
   ========================================================= */

const KEY = "almgren:cart:v1";

const seed = (lines) => window.localStorage.setItem(KEY, JSON.stringify(lines));

const RING = { id: 7, title: "Gold Ring", image: "b.png", priceCents: 999, qty: 1 };
const BACKPACK = { id: 1, title: "Canvas Backpack", image: "a.png", priceCents: 10995, qty: 1 };

function mount() {
  return render(
    <MemoryRouter initialEntries={["/cart"]}>
      <CartProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="cart" element={<Cart />} />
          </Route>
        </Routes>
      </CartProvider>
    </MemoryRouter>
  );
}

/** The figure next to a label in the summary list: <dt>Total</dt><dd>…</dd> */
const sum = (label) => screen.getByText(label).nextElementSibling.textContent;

beforeEach(() => {
  window.localStorage.clear();
});

describe("an empty basket", () => {
  it("says so instead of showing an empty table", () => {
    mount();
    expect(screen.getByRole("heading", { name: /basket is empty/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /start looking/i })).toBeInTheDocument();
  });
});

describe("a basket with things in it", () => {
  it("loads what was saved", () => {
    seed([RING, BACKPACK]);
    mount();

    expect(screen.getByRole("link", { name: "Gold Ring" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Canvas Backpack" })).toBeInTheDocument();
    expect(screen.getByText("2 items")).toBeInTheDocument();
  });

  it("shows a line total and a subtotal", () => {
    seed([{ ...RING, qty: 3 }]);
    mount();

    // 3 × $9.99, appearing twice: as the line total and as the subtotal.
    // With one line in the basket those two must agree.
    expect(screen.getAllByText("$29.97")).toHaveLength(2);
    expect(sum("Subtotal")).toBe("$29.97");
  });

  it("charges shipping under the threshold and not over it", () => {
    seed([{ ...RING, qty: 1 }]);
    mount();
    expect(sum("Shipping")).toBe("$4.99");
    expect(sum("Total")).toBe("$14.98");
  });

  it("gives free shipping once the basket is big enough", () => {
    seed([{ ...BACKPACK, qty: 1 }]);
    mount();
    expect(sum("Shipping")).toBe("Free");
    expect(sum("Total")).toBe("$109.95");
  });

  it("does not let the checkout button do anything", () => {
    seed([RING]);
    mount();
    expect(screen.getByRole("button", { name: /checkout/i })).toBeDisabled();
  });
});

describe("changing a basket", () => {
  it("increases a quantity and re-totals", async () => {
    const user = userEvent.setup();
    seed([RING]);
    mount();

    await user.click(screen.getByRole("button", { name: /increase quantity of Gold Ring/i }));

    expect(screen.getByRole("spinbutton", { name: /quantity of Gold Ring/i })).toHaveValue(2);
    expect(sum("Subtotal")).toBe("$19.98");
  });

  it("decreases a quantity", async () => {
    const user = userEvent.setup();
    seed([{ ...RING, qty: 4 }]);
    mount();

    await user.click(screen.getByRole("button", { name: /decrease quantity of Gold Ring/i }));

    expect(screen.getByRole("spinbutton", { name: /quantity of Gold Ring/i })).toHaveValue(3);
  });

  it("removes the line rather than showing none of something", async () => {
    const user = userEvent.setup();
    seed([RING]);
    mount();

    await user.click(screen.getByRole("button", { name: /decrease quantity of Gold Ring/i }));

    expect(screen.getByRole("heading", { name: /basket is empty/i })).toBeInTheDocument();
  });

  it("removes a line with the remove button, leaving the others", async () => {
    const user = userEvent.setup();
    seed([RING, BACKPACK]);
    mount();

    await user.click(screen.getByRole("button", { name: /remove Gold Ring from basket/i }));

    expect(screen.queryByRole("link", { name: "Gold Ring" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Canvas Backpack" })).toBeInTheDocument();
  });

  it("empties the whole basket", async () => {
    const user = userEvent.setup();
    seed([RING, BACKPACK]);
    mount();

    await user.click(screen.getByRole("button", { name: /empty the basket/i }));

    expect(screen.getByRole("heading", { name: /basket is empty/i })).toBeInTheDocument();
  });

  it("writes changes back to storage", async () => {
    const user = userEvent.setup();
    seed([RING]);
    mount();

    await user.click(screen.getByRole("button", { name: /increase quantity of Gold Ring/i }));

    const stored = JSON.parse(window.localStorage.getItem(KEY));
    expect(stored).toEqual([{ ...RING, qty: 2 }]);
  });
});

describe("a corrupted saved basket", () => {
  it("is ignored rather than crashing the page", () => {
    window.localStorage.setItem(KEY, "{ not json");
    mount();
    expect(screen.getByRole("heading", { name: /basket is empty/i })).toBeInTheDocument();
  });

  it("drops lines that are the wrong shape", () => {
    seed([RING, { id: 99, title: "Broken" }, { nonsense: true }]);
    mount();

    expect(screen.getByRole("link", { name: "Gold Ring" })).toBeInTheDocument();
    expect(screen.getByText("1 item")).toBeInTheDocument();
  });
});
