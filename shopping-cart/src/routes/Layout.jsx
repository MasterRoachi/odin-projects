import { NavLink, Link, Outlet } from "react-router-dom";

/* =========================================================
   The frame every page sits in.

   Note what Layout does with `cartCount`: nothing. It takes
   it only so that it can hand it to Nav, which hands it to
   CartBadge. Two of those three components have no interest
   in the cart whatsoever.
   ========================================================= */

export default function Layout({ cartCount }) {
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>

      <Nav cartCount={cartCount} />

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

function Nav({ cartCount }) {
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

        <CartBadge count={cartCount} />
      </div>
    </header>
  );
}

function CartBadge({ count }) {
  return (
    <NavLink to="/cart" className="cart-link">
      <span>Basket</span>
      {/* the count is in the accessible name, not only the visual pill, or a
          screen reader hears "Basket" and no number */}
      <span className="pill" aria-hidden="true">
        {count}
      </span>
      <span className="visually-hidden">
        {count === 1 ? "1 item" : `${count} items`}
      </span>
    </NavLink>
  );
}
