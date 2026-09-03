import { useState, useEffect, useCallback } from "react";

/* =========================================================
   Getting the roster.

   One request, not one per card. The list endpoint returns a
   name and a url for each Pokémon, the id is the last segment
   of that url, and the artwork path is derivable from the id —
   so sixteen cards cost a single fetch rather than sixteen.
   ========================================================= */

const LIST = "https://pokeapi.co/api/v2/pokemon";

const artworkFor = (id) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

/** "https://pokeapi.co/api/v2/pokemon/25/" → 25 */
const idFromUrl = (url) => Number(url.split("/").filter(Boolean).at(-1));

export function usePokemon(count = 151) {
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [roster, setRoster] = useState([]);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);

  const retry = useCallback(() => {
    setStatus("loading");
    setError(null);
    setAttempt((n) => n + 1);
  }, []);

  useEffect(() => {
    /*
     * Two separate guards, for two separate problems.
     *
     * `controller` cancels the request itself, so a fetch nobody is waiting
     * for stops using the network.
     *
     * `ignore` stops a response that arrives *after* this effect has been
     * cleaned up from calling setState on a component that has moved on.
     * Aborting alone is not enough — a response already in flight can land
     * between the abort and the browser noticing.
     *
     * StrictMode runs this twice in development precisely to catch code that
     * gets this wrong.
     */
    const controller = new AbortController();
    let ignore = false;

    async function load() {
      try {
        const response = await fetch(`${LIST}?limit=${count}`, {
          signal: controller.signal,
        });

        // fetch only rejects on network failure; a 404 or 500 resolves
        // perfectly happily and has to be checked by hand
        if (!response.ok) {
          throw new Error(`PokéAPI answered ${response.status}`);
        }

        const data = await response.json();
        const list = data.results.map((entry) => {
          const id = idFromUrl(entry.url);
          return { id, name: entry.name, image: artworkFor(id) };
        });

        if (ignore) return;
        setRoster(list);
        setStatus("ready");
      } catch (caught) {
        if (caught.name === "AbortError") return; // expected, not a failure
        if (ignore) return;
        setError(caught.message || "Could not reach PokéAPI.");
        setStatus("error");
      }
    }

    load();

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [count, attempt]);

  return { status, roster, error, retry };
}
