/* =========================================================
   The high score, kept between visits.
   ========================================================= */

const KEY = "memory-card:best";

export function loadBest() {
  try {
    const raw = window.localStorage.getItem(KEY);
    const value = Number(raw);
    // a corrupted or hand-edited value must not poison the display
    return Number.isFinite(value) && value >= 0 ? value : 0;
  } catch {
    return 0;
  }
}

export function saveBest(value) {
  try {
    window.localStorage.setItem(KEY, String(value));
  } catch {
    /* private windows throw; the score still counts for this session */
  }
}
