/* =========================================================
   Units and formatting.

   The API is asked for metric once and everything is
   converted here, so switching to Fahrenheit never costs
   another request.

   Pure. No DOM, no network.
   ========================================================= */

export const toF = (celsius) => (celsius * 9) / 5 + 32;
export const toMph = (kmh) => kmh * 0.621371;
export const toInches = (mm) => mm / 25.4;

export function temperature(celsius, unit) {
  if (celsius === null || celsius === undefined || Number.isNaN(celsius)) return "–";
  const value = unit === "F" ? toF(celsius) : celsius;
  return `${Math.round(value)}°`;
}

export function exactTemperature(celsius, unit) {
  if (celsius === null || celsius === undefined) return "–";
  const value = unit === "F" ? toF(celsius) : celsius;
  return `${value.toFixed(1)}°${unit}`;
}

export function wind(kmh, unit) {
  if (kmh === null || kmh === undefined) return "–";
  return unit === "F"
    ? `${Math.round(toMph(kmh))} mph`
    : `${Math.round(kmh)} km/h`;
}

export function rainfall(mm, unit) {
  if (!mm) return "none";
  return unit === "F" ? `${toInches(mm).toFixed(2)} in` : `${mm.toFixed(1)} mm`;
}

/**
 * Open-Meteo is asked for timezone=auto, which means every timestamp it
 * returns is already the wall clock at that location — "2026-09-03T01:15"
 * is 1:15am in Los Angeles, with no offset attached.
 *
 * Passing that to new Date() makes the browser read it as *its own* local
 * time, and formatting the result in the location timezone then shifts it a
 * second time. Building the Date from its parts keeps the wall clock intact.
 */
export function parseNaive(iso) {
  if (!iso) return null;
  const [datePart, timePart = "00:00"] = String(iso).split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);
  return new Date(year, month - 1, day, hour || 0, minute || 0);
}

export function clock(iso) {
  const date = parseNaive(iso);
  if (!date) return "–";
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function weekday(iso, style = "short") {
  const date = parseNaive(iso);
  if (!date) return "";
  return new Intl.DateTimeFormat(undefined, { weekday: style }).format(date);
}
