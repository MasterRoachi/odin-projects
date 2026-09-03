import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard.jsx";
import { priceOf } from "../lib/money.js";

/* =========================================================
   The grid, with the filter in the URL.

   The category and sort are held in the query string rather
   than in component state. That is not decoration: it means a
   filtered view can be linked to, the back button steps
   through filter changes, and a refresh does not silently
   reset what you were looking at.

   It also means the filter is not state at all — it is read
   from the URL, and the visible list is *derived* from it. No
   effect keeps them in step, because there is nothing to keep
   in step.
   ========================================================= */

const SORTS = {
  featured: { label: "Featured", compare: null },
  "price-asc": { label: "Price, low to high", compare: (a, b) => priceOf(a) - priceOf(b) },
  "price-desc": { label: "Price, high to low", compare: (a, b) => priceOf(b) - priceOf(a) },
  rating: { label: "Best rated", compare: (a, b) => b.rating.rate - a.rating.rate },
  title: { label: "Name", compare: (a, b) => a.title.localeCompare(b.title) },
};

export default function Shop({ catalogue }) {
  const { status, products, error, retry } = catalogue;
  const [params, setParams] = useSearchParams();

  const category = params.get("category") ?? "all";
  const sort = SORTS[params.get("sort")] ? params.get("sort") : "featured";

  const categories = useMemo(
    () => ["all", ...new Set(products.map((product) => product.category))],
    [products]
  );

  const shown = useMemo(() => {
    const filtered =
      category === "all" ? products : products.filter((p) => p.category === category);
    const compare = SORTS[sort].compare;
    // sorted on a copy; sort mutates, and mutating props is how you get a
    // list that reorders itself when something unrelated re-renders
    return compare ? [...filtered].sort(compare) : filtered;
  }, [products, category, sort]);

  /** Writes one filter to the URL, keeping the other. */
  const update = (key, value) => {
    const next = new URLSearchParams(params);
    if (value === "all" || value === "featured") next.delete(key);
    else next.set(key, value);
    // replace, so twenty filter changes do not become twenty back-button steps
    setParams(next, { replace: true });
  };

  if (status === "loading") {
    return (
      <div className="hold pad">
        <p className="note">Fetching the catalogue…</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="hold pad">
        <div className="empty-state">
          <h1>The shop is not answering</h1>
          <p className="note note--bad">{error}</p>
          <button type="button" className="button" onClick={retry}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="hold pad">
      <header className="page-head">
        <h1>Everything</h1>
        <p className="note" role="status" aria-live="polite">
          {shown.length} {shown.length === 1 ? "item" : "items"}
          {category !== "all" && ` in ${category}`}
        </p>
      </header>

      <div className="filters">
        <label className="field">
          <span>Category</span>
          <select value={category} onChange={(event) => update("category", event.target.value)}>
            {categories.map((name) => (
              <option key={name} value={name}>
                {name === "all" ? "All categories" : name}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Sort by</span>
          <select value={sort} onChange={(event) => update("sort", event.target.value)}>
            {Object.entries(SORTS).map(([value, { label }]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {shown.length === 0 ? (
        <p className="note">Nothing in that category.</p>
      ) : (
        <ul className="grid">
          {shown.map((product) => (
            /* ProductCard now asks the cart for itself; Shop is out of it */
            <ProductCard key={product.id} product={product} />
          ))}
        </ul>
      )}
    </div>
  );
}
