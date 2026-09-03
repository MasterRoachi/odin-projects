import { Link } from "react-router-dom";
import { money, priceOf } from "../lib/money.js";
import { useCart } from "../cart/CartContext.jsx";

/* =========================================================
   One product in the grid.

   Takes only the product. It gets the cart itself, so nothing
   between here and the provider has to carry it.
   ========================================================= */

export default function ProductCard({ product }) {
  const { add, has } = useCart();
  const inBasket = has(product.id);

  return (
    <li className="card">
      <Link to={`/product/${product.id}`} className="card-media">
        <img src={product.image} alt="" loading="lazy" />
      </Link>

      <div className="card-body">
        <p className="card-cat">{product.category}</p>
        <h3 className="card-title">
          <Link to={`/product/${product.id}`}>{product.title}</Link>
        </h3>

        <div className="card-foot">
          <p className="price">{money(priceOf(product))}</p>
          {/*
            The name is an aria-label rather than short visible text plus a
            hidden span. Accessible-name computation trims each node before
            joining them, so "Add" + " Canvas Backpack to basket" was
            announced as "AddCanvas Backpack to basket". A test caught it.
          */}
          <button
            type="button"
            className="add"
            onClick={() => add(product, 1)}
            aria-label={`${inBasket ? "Add another" : "Add"} ${product.title} to basket`}
          >
            {inBasket ? "Add another" : "Add"}
          </button>
        </div>
      </div>
    </li>
  );
}
