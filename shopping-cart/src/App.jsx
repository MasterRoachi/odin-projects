import { useState, useEffect } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { useProducts } from "./hooks/useProducts.js";
import { loadCart, saveCart } from "./lib/storage.js";
import { addLine, setQty, removeLine, clearCart, countItems } from "./cart/cartMath.js";
import Layout from "./routes/Layout.jsx";
import Home from "./routes/Home.jsx";
import Shop from "./routes/Shop.jsx";
import Product from "./routes/Product.jsx";
import Cart from "./routes/Cart.jsx";
import NotFound from "./routes/NotFound.jsx";

/* =========================================================
   The shop.

   ── First version: the cart lives here and is handed down. ──

   Everything that touches the cart therefore needs it passed
   in, and so does everything *between* here and there. Watch
   `cartCount` in particular: App gives it to Layout, Layout
   gives it to Nav, Nav gives it to CartBadge, and only the
   last of those three actually wants it.

   That is prop drilling, and it is the problem Context exists
   to solve. It is left in place, and measured, before being
   fixed — see the README.
   ========================================================= */

export default function App() {
  const { status, products, error, retry } = useProducts();

  /* read storage in the initialiser, not an effect: the cart is knowable
     before the first render, and an effect would flash an empty basket */
  const [cart, setCart] = useState(loadCart);

  /* a genuine effect — localStorage is outside React and has to be kept in step */
  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  const add = (product, qty = 1) => setCart((current) => addLine(current, product, qty));
  const changeQty = (id, qty) => setCart((current) => setQty(current, id, qty));
  const remove = (id) => setCart((current) => removeLine(current, id));
  const empty = () => setCart(clearCart());

  const catalogue = { status, products, error, retry };

  return (
    /*
     * HashRouter, not BrowserRouter.
     *
     * This is served as static files from a subfolder. With BrowserRouter,
     * /shop is a path the host has to know to answer with index.html — and a
     * static host does not, so a refresh or a shared link 404s. The hash is
     * never sent to the server, so every route works with no server config
     * at all. The cost is a # in the URL.
     */
    <HashRouter>
      <Routes>
        <Route element={<Layout cartCount={countItems(cart)} />}>
          <Route index element={<Home catalogue={catalogue} />} />
          <Route path="shop" element={<Shop catalogue={catalogue} cart={cart} onAdd={add} />} />
          <Route
            path="product/:id"
            element={<Product catalogue={catalogue} cart={cart} onAdd={add} />}
          />
          <Route
            path="cart"
            element={<Cart cart={cart} onChangeQty={changeQty} onRemove={remove} onEmpty={empty} />}
          />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
