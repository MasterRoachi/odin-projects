/* =========================================================
   Keeping the CV between visits.
   ========================================================= */

const KEY = "cv-builder:v1";

/**
 * Reads the saved CV, or null.
 *
 * Wrapped, because localStorage is not merely empty in a private window or
 * with site data blocked — accessing it throws outright, and an unhandled
 * throw here would take the whole app down before it rendered.
 */
export function load() {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function save(cv) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(cv));
  } catch {
    /* nothing sensible to do; the CV still works for this session */
  }
}

export function clear() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* as above */
  }
}
