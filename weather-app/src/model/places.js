/* =========================================================
   Remembered places and the chosen unit, kept in
   localStorage. Storage is treated as untrusted — anything
   read back is checked before it is used.

   No DOM, no network.
   ========================================================= */

const KEY = "odin-weather";
const MAX = 8;

const DEFAULT_STATE = { places: [], unit: "C", lastId: null };

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_STATE };

    const stored = JSON.parse(raw);
    return {
      places: Array.isArray(stored.places)
        ? stored.places.filter(isUsablePlace).slice(0, MAX)
        : [],
      unit: stored.unit === "F" ? "F" : "C",
      lastId: stored.lastId ?? null,
    };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

function isUsablePlace(place) {
  return (
    place &&
    typeof place.name === "string" &&
    Number.isFinite(place.latitude) &&
    Number.isFinite(place.longitude)
  );
}

function write(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* private mode or a full quota — the app still works for this session */
  }
}

const state = read();

export const getPlaces = () => state.places;
export const getUnit = () => state.unit;
export const getLastId = () => state.lastId;

const keyOf = (place) => `${place.latitude.toFixed(3)},${place.longitude.toFixed(3)}`;

export function remember(place) {
  const key = keyOf(place);
  state.places = [place, ...state.places.filter((entry) => keyOf(entry) !== key)].slice(0, MAX);
  state.lastId = key;
  write(state);
}

export function forget(place) {
  const key = keyOf(place);
  state.places = state.places.filter((entry) => keyOf(entry) !== key);
  if (state.lastId === key) state.lastId = state.places[0] ? keyOf(state.places[0]) : null;
  write(state);
}

export function setUnit(unit) {
  state.unit = unit === "F" ? "F" : "C";
  write(state);
}

export const isRemembered = (place) =>
  state.places.some((entry) => keyOf(entry) === keyOf(place));

export { keyOf };
