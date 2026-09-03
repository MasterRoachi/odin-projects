import { NavLink, Link, Outlet } from "react-router-dom";
import { useCart } from "../cart/CartContext.jsx";

/* =========================================================
   The frame every page sits in.

   Layout and Nav used to take a `cartCount` prop purely to
   forward it. Neither mentions the cart now — only CartBadge
   does, and it asks for it directly.
   ========================================================= */

export default function Layout() {
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>

      <Nav />

      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>

      <footer className="site-foot">
        <div className="hold">
          <p>
            A shop that sells nothing, built for{" "}
            <a href="https://www.theodinproject.com/">The Odin Project</a>. Catalogue from{" "}
            <a href="https://fakestoreapi.com/">Fake Store API</a>.
          </p>
          <p>
            <a href="../../">Back to the projects</a> · <a href="../README.md">README</a>
          </p>
        </div>
      </footer>
    </>
  );
}

function Nav() {
  return (
    <header className="site-head">
      <div className="hold nav-row">
        <Link to="/" className="wordmark">
          Almgren
        </Link>

        <nav aria-label="Main">
          <ul className="nav-links">
            <li>
              <NavLink to="/" end>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/shop">Shop</NavLink>
            </li>
          </ul>
        </nav>

        <CartBadge />
      </div>
    </header>
  );
}

function CartBadge() {
  /* straight from the context: no prop, no parent involved */
  const { count } = useCart();

  const items = count === 1 ? "1 item" : `${count} items`;

  return (
    /*
     * The count belongs in the accessible name, or a screen reader hears
     * "Basket" and no number at all. It goes in as an aria-label rather than
     * a hidden span for the same reason as the Add button: names are trimmed
     * and joined with no separator, which gave "Basket0 items".
     */
    <NavLink to="/cart" className="cart-link" aria-label={`Basket, ${items}`}>
      <span>Basket</span>
      <span className="pill" aria-hidden="true">
        {count}
      </span>
    </NavLink>
  );
}
