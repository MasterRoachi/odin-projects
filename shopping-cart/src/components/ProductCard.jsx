import { Link } from "react-router-dom";
import { money, priceOf } from "../lib/money.js";

/* =========================================================
   One product in the grid.

   `onAdd` is passed in from Shop, which was passed it by App.
   Shop never adds anything itself.
   ========================================================= */

export default function ProductCard({ product, onAdd, inBasket }) {
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
          <button type="button" className="add" onClick={() => onAdd(product, 1)}>
            {inBasket ? "Add another" : "Add"}
            <span className="visually-hidden"> {product.title} to basket</span>
          </button>
        </div>
      </div>
    </li>
  );
}
