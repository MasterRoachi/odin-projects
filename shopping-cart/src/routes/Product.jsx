import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import QuantityStepper from "../components/QuantityStepper.jsx";
import { money, priceOf } from "../lib/money.js";
import { useCart } from "../cart/CartContext.jsx";

/* =========================================================
   One product, on its own route.

   This is what the router is actually for: /product/7 is a
   real address that can be shared, bookmarked and gone back
   from. Doing it with a piece of state and a conditional would
   look the same and be none of those things.
   ========================================================= */

export default function Product({ catalogue }) {
  const { add, has } = useCart();
  const { id } = useParams();
  const navigate = useNavigate();
  const { status, products } = catalogue;

  /* the quantity chosen before adding is local: nothing else in the app has
     any use for a number that has not been committed to the basket yet */
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  if (status === "loading") {
    return (
      <div className="hold pad">
        <p className="note">Loading…</p>
      </div>
    );
  }

  /* the id comes out of the URL as a string, and anybody can type anything
     into a URL, so this has to cope with both "7" and "banana" */
  const product = products.find((item) => String(item.id) === String(id));

  if (!product) {
    return (
      <div className="hold pad">
        <div className="empty-state">
          <h1>No such product</h1>
          <p>Nothing here has the id “{id}”.</p>
          <Link className="button" to="/shop">
            Back to the shop
          </Link>
        </div>
      </div>
    );
  }

  const handleAdd = () => {
    add(product, qty);
    setAdded(true);
  };

  return (
    <div className="hold pad">
      <nav aria-label="Breadcrumb" className="crumbs">
        <Link to="/shop">Shop</Link>
        <span aria-hidden="true">/</span>
        <Link to={`/shop?category=${encodeURIComponent(product.category)}`}>
          {product.category}
        </Link>
      </nav>

      <article className="detail">
        <div className="detail-media">
          <img src={product.image} alt={product.title} />
        </div>

        <div className="detail-body">
          <h1>{product.title}</h1>

          <p className="detail-price">{money(priceOf(product))}</p>

          <p className="rating">
            <span aria-hidden="true">★</span> {product.rating.rate.toFixed(1)}
            <span className="note"> from {product.rating.count} ratings</span>
          </p>

          <p className="detail-desc">{product.description}</p>

          <div className="detail-buy">
            <QuantityStepper qty={qty} onChange={(next) => setQty(clamp(next))} />
            <button type="button" className="button" onClick={handleAdd}>
              Add to basket
            </button>
          </div>

          <p className="note" role="status" aria-live="polite">
            {added
              ? `Added. ${has(product.id) ? "It is in your basket." : ""}`
              : " "}
          </p>

          <p className="detail-links">
            <button type="button" className="quiet" onClick={() => navigate(-1)}>
              Go back
            </button>
            <Link to="/cart">View basket</Link>
          </p>
        </div>
      </article>
    </div>
  );
}

const clamp = (value) => {
  const n = Math.trunc(Number(value));
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(99, n);
};
