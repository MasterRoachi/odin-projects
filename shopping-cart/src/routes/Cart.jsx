import { Link } from "react-router-dom";
import QuantityStepper from "../components/QuantityStepper.jsx";
import { money } from "../lib/money.js";
import { lineTotalCents } from "../cart/cartMath.js";
import { useCart } from "../cart/CartContext.jsx";

/* =========================================================
   The basket.

   Every number on this page is derived from the cart as it
   renders — the count, each line total, the subtotal. None of
   them is stored, so none of them can disagree with the cart.

   Keeping a `total` in state and updating it alongside is the
   classic way to end up with a basket whose sum is wrong.
   ========================================================= */

const SHIPPING_THRESHOLD_CENTS = 5000;
const SHIPPING_CENTS = 499;

export default function Cart() {
  /* the count and subtotal are computed by the provider, from the same pure
     functions, so there is exactly one place either number comes from */
  const { cart, count, subtotal, changeQty, remove, empty } = useCart();
  const shipping = subtotal === 0 || subtotal >= SHIPPING_THRESHOLD_CENTS ? 0 : SHIPPING_CENTS;

  if (cart.length === 0) {
    return (
      <div className="hold pad">
        <div className="empty-state">
          <h1>Your basket is empty</h1>
          <p>Nothing in it yet.</p>
          <Link className="button" to="/shop">
            Start looking
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="hold pad">
      <header className="page-head">
        <h1>Basket</h1>
        <p className="note">
          {count} {count === 1 ? "item" : "items"}
        </p>
      </header>

      <div className="basket">
        <ul className="lines">
          {cart.map((line) => (
            /* keyed by product id — lines are removed and reordered, and an
               index key would leave a stepper attached to the wrong row */
            <li key={line.id} className="line">
              <img className="line-img" src={line.image} alt="" />

              <div className="line-body">
                <h2 className="line-title">
                  <Link to={`/product/${line.id}`}>{line.title}</Link>
                </h2>
                <p className="note">{money(line.priceCents)} each</p>
              </div>

              <QuantityStepper
                qty={line.qty}
                onChange={(next) => changeQty(line.id, next)}
                label={`Quantity of ${line.title}`}
                compact
              />

              <p className="line-total">{money(lineTotalCents(line))}</p>

              <button
                type="button"
                className="remove"
                onClick={() => remove(line.id)}
                aria-label={`Remove ${line.title} from basket`}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>

        <aside className="summary" aria-labelledby="summary-title">
          <h2 id="summary-title">Summary</h2>

          <dl className="sums">
            <div>
              <dt>Subtotal</dt>
              <dd>{money(subtotal)}</dd>
            </div>
            <div>
              <dt>Shipping</dt>
              <dd>{shipping === 0 ? "Free" : money(shipping)}</dd>
            </div>
            <div className="sums-total">
              <dt>Total</dt>
              <dd>{money(subtotal + shipping)}</dd>
            </div>
          </dl>

          {shipping > 0 && (
            <p className="note">
              {money(SHIPPING_THRESHOLD_CENTS - subtotal)} more for free shipping.
            </p>
          )}

          <button type="button" className="button" disabled>
            Checkout
          </button>
          <p className="note">Nothing here is for sale, so this button does nothing.</p>

          <button type="button" className="quiet" onClick={empty}>
            Empty the basket
          </button>
        </aside>
      </div>
    </div>
  );
}
