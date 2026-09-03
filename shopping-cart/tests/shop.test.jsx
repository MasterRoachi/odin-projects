import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "../src/cart/CartContext.jsx";
import Layout from "../src/routes/Layout.jsx";
import Shop from "../src/routes/Shop.jsx";
import Cart from "../src/routes/Cart.jsx";

/* =========================================================
   Queried by role and by text throughout, never by class.

   A test that breaks when a div is renamed was testing the
   build rather than the behaviour — and the point of these is
   to survive the next reskin, which this project has already
   had one of elsewhere.
   ========================================================= */

const PRODUCTS = [
  { id: 1, title: "Canvas Backpack", price: 109.95, category: "bags", image: "a.png", description: "Roomy.", rating: { rate: 3.9, count: 120 } },
  { id: 7, title: "Gold Ring", price: 9.99, category: "jewelery", image: "b.png", description: "Shiny.", rating: { rate: 4.6, count: 400 } },
  { id: 8, title: "Silver Earrings", price: 10.99, category: "jewelery", image: "c.png", description: "Small.", rating: { rate: 3.0, count: 12 } },
];

const catalogue = { status: "ready", products: PRODUCTS, error: null, retry: () => {} };

/** The shop and the basket under one Layout, so the badge is real. */
function mount(route = "/shop") {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <CartProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="shop" element={<Shop catalogue={catalogue} />} />
            <Route path="cart" element={<Cart />} />
          </Route>
        </Routes>
      </CartProvider>
    </MemoryRouter>
  );
}

/* the count is part of the link name now, which is what a screen reader
   would actually hear */
const badgeName = () => screen.getByRole("link", { name: /basket/i }).getAttribute("aria-label");

beforeEach(() => {
  window.localStorage.clear();
});

describe("the shop", () => {
  it("lists every product", () => {
    mount();
    expect(screen.getByRole("heading", { name: "Everything" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Canvas Backpack" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Gold Ring" })).toBeInTheDocument();
    expect(screen.getByText("3 items")).toBeInTheDocument();
  });

  it("shows a price for each", () => {
    mount();
    expect(screen.getByText("$109.95")).toBeInTheDocument();
    expect(screen.getByText("$9.99")).toBeInTheDocument();
  });

  it("starts with an empty basket", () => {
    mount();
    expect(badgeName()).toBe("Basket, 0 items");
  });

  it("filters by category", async () => {
    const user = userEvent.setup();
    mount();

    await user.selectOptions(screen.getByLabelText(/category/i), "jewelery");

    expect(screen.getByRole("link", { name: "Gold Ring" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Canvas Backpack" })).not.toBeInTheDocument();
    expect(screen.getByText("2 items in jewelery")).toBeInTheDocument();
  });

  it("sorts by price", async () => {
    const user = userEvent.setup();
    mount();

    await user.selectOptions(screen.getByLabelText(/sort by/i), "price-asc");

    const titles = screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent);
    expect(titles).toEqual(["Gold Ring", "Silver Earrings", "Canvas Backpack"]);
  });

  it("reads the filter out of the URL it was opened with", () => {
    mount("/shop?category=jewelery&sort=price-desc");

    expect(screen.getByLabelText(/category/i)).toHaveValue("jewelery");
    const titles = screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent);
    expect(titles).toEqual(["Silver Earrings", "Gold Ring"]);
  });
});

describe("adding to the basket", () => {
  it("updates the badge in the nav, which is nowhere near the button", async () => {
    const user = userEvent.setup();
    mount();

    await user.click(screen.getByRole("button", { name: /add Canvas Backpack to basket/i }));

    expect(badgeName()).toBe("Basket, 1 item");
  });

  it("counts quantities rather than lines when the same thing is added twice", async () => {
    const user = userEvent.setup();
    mount();

    const add = () => screen.getByRole("button", { name: /Canvas Backpack to basket/i });
    await user.click(add());
    await user.click(add());

    expect(badgeName()).toBe("Basket, 2 items");
  });

  it("says so on the button once something is in the basket", async () => {
    const user = userEvent.setup();
    mount();

    await user.click(screen.getByRole("button", { name: /add Canvas Backpack to basket/i }));

    expect(
      screen.getByRole("button", { name: /add another Canvas Backpack to basket/i })
    ).toBeInTheDocument();
  });

  it("carries the basket across a route change", async () => {
    const user = userEvent.setup();
    mount();

    await user.click(screen.getByRole("button", { name: /add Gold Ring to basket/i }));
    await user.click(screen.getByRole("link", { name: /basket/i }));

    expect(screen.getByRole("heading", { name: "Basket" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Gold Ring" })).toBeInTheDocument();
  });
});

describe("when the shop is down", () => {
  it("says so and offers to try again", () => {
    render(
      <MemoryRouter initialEntries={["/shop"]}>
        <CartProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route
                path="shop"
                element={
                  <Shop
                    catalogue={{
                      status: "error",
                      products: [],
                      error: "The shop answered 500",
                      retry: () => {},
                    }}
                  />
                }
              />
            </Route>
          </Routes>
        </CartProvider>
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: /not answering/i })).toBeInTheDocument();
    expect(screen.getByText("The shop answered 500")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
  });
});
