import { HashRouter, Routes, Route } from "react-router-dom";
import { useProducts } from "./hooks/useProducts.js";
import { CartProvider } from "./cart/CartContext.jsx";
import Layout from "./routes/Layout.jsx";
import Home from "./routes/Home.jsx";
import Shop from "./routes/Shop.jsx";
import Product from "./routes/Product.jsx";
import Cart from "./routes/Cart.jsx";
import NotFound from "./routes/NotFound.jsx";

/* =========================================================
   The shop.

   The cart used to live here and be handed down. It now lives
   in CartProvider, and anything that wants it calls useCart().
   Compare this file against the previous commit: nine cart
   props threaded out of here, and two components that were
   only forwarding them, are all gone.

   What is still passed down is `catalogue` — and deliberately.
   It travels exactly one hop, from the router to a page that
   uses it, which is what props are for. Moving it into a
   context as well would be cargo-culting the fix.
   ========================================================= */

export default function App() {
  const catalogue = useProducts();

  return (
    /*
     * HashRouter, not BrowserRouter.
     *
     * This is served as static files from a subfolder. With real paths, /shop
     * is an address the host has to know to answer with index.html — and a
     * static host does not, so a refresh or a shared link 404s. The hash is
     * never sent to the server, so every route works with no server config.
     * The cost is a # in the URL.
     */
    <HashRouter>
      <CartProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home catalogue={catalogue} />} />
            <Route path="shop" element={<Shop catalogue={catalogue} />} />
            <Route path="product/:id" element={<Product catalogue={catalogue} />} />
            <Route path="cart" element={<Cart />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </CartProvider>
    </HashRouter>
  );
}
