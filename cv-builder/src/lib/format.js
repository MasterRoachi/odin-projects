/* =========================================================
   Turning stored values into printed ones.
   ========================================================= */

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/**
 * "2023-04" becomes "Apr 2023".
 *
 * Split rather than passed to Date, because `new Date("2023-04")` is parsed as
 * UTC midnight and then displayed in local time, which in any timezone behind
 * UTC lands in March. The Weather App was bitten by exactly this.
 */
export function formatMonth(value) {
  if (!value) return "";
  const [year, month] = value.split("-").map(Number);
  if (!year || !month) return value;
  return `${MONTHS[month - 1]} ${year}`;
}

/** "Apr 2023 — Present", or whatever part of it exists. */
export function formatRange(start, end) {
  const from = formatMonth(start);
  const to = end ? formatMonth(end) : from ? "Present" : "";
  if (!from && !to) return "";
  return from && to ? `${from} — ${to}` : from || to;
}

/** Splits a textarea into lines, dropping the blank ones. */
export const toLines = (text) =>
  (text || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
