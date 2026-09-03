/* =========================================================
   Fisher-Yates, on a copy.
   ========================================================= */

/**
 * Returns a new shuffled array. Never sorts in place, because state handed
 * back to React has to be a new reference or the re-render is skipped.
 */
export function shuffle(list) {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

/** `count` distinct items, chosen at random. */
export function pick(list, count) {
  return shuffle(list).slice(0, count);
}
