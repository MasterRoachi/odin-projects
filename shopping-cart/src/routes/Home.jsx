import { Link } from "react-router-dom";
import { money, priceOf } from "../lib/money.js";

/* =========================================================
   The front page.
   ========================================================= */

export default function Home({ catalogue }) {
  const { status, products } = catalogue;
  const featured = products.slice(0, 3);

  return (
    <div className="hold pad">
      <section className="hero">
        <p className="eyebrow">Everyday things</p>
        <h1>
          Fewer things, <em>chosen carefully</em>.
        </h1>
        <p className="lede">
          Twenty items. Clothing, jewellery and electronics, with nothing in the middle to
          distract you. Nothing here is really for sale.
        </p>
        <Link className="button" to="/shop">
          See everything
        </Link>
      </section>

      {status === "ready" && featured.length > 0 && (
        <section className="strip" aria-labelledby="featured">
          <h2 id="featured">A few to start with</h2>
          <ul className="strip-list">
            {featured.map((product) => (
              <li key={product.id}>
                <Link to={`/product/${product.id}`} className="strip-item">
                  <img src={product.image} alt="" loading="lazy" />
                  <span className="strip-title">{product.title}</span>
                  <span className="strip-price">{money(priceOf(product))}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
