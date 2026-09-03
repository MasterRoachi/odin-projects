import { useState, useEffect, useCallback } from "react";

/* =========================================================
   The catalogue.

   Same two guards as the memory game: abort the request, and
   ignore a response that lands after cleanup.
   ========================================================= */

const URL = "https://fakestoreapi.com/products";

export function useProducts() {
  const [status, setStatus] = useState("loading");
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);

  const retry = useCallback(() => {
    setStatus("loading");
    setError(null);
    setAttempt((n) => n + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let ignore = false;

    async function load() {
      try {
        const response = await fetch(URL, { signal: controller.signal });
        // fetch resolves happily on a 500, so the status is checked by hand
        if (!response.ok) throw new Error(`The shop answered ${response.status}`);

        const data = await response.json();
        if (!Array.isArray(data)) throw new Error("The shop sent something unexpected.");

        if (ignore) return;
        setProducts(data);
        setStatus("ready");
      } catch (caught) {
        if (caught.name === "AbortError") return;
        if (ignore) return;
        setError(caught.message || "Could not reach the shop.");
        setStatus("error");
      }
    }

    load();
    return () => {
      ignore = true;
      controller.abort();
    };
  }, [attempt]);

  return { status, products, error, retry };
}
