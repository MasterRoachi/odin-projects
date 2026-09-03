/* =========================================================
   The colour of the page.

   The brief asks that the page change with the data. It does
   that here on two axes at once: what the weather is doing,
   and what time it is *where you are looking* — which is not
   the same as what time it is for you.

   A bright morning in Reykjavik and a wet dusk in Lagos are
   not meant to resemble each other.

   Pure. No DOM, no network.
   ========================================================= */

import { parseNaive } from "./units.js";

/** Where the local clock sits relative to that location's own sunrise and sunset. */
export function phaseFor({ nowIso, sunriseIso, sunsetIso }) {
  if (!sunriseIso || !sunsetIso) return "day";

  // all three are naive local strings from the same place, so they must be
  // read the same way for the comparison to mean anything
  const now = parseNaive(nowIso).getTime();
  const sunrise = parseNaive(sunriseIso).getTime();
  const sunset = parseNaive(sunsetIso).getTime();
  const minutes = 60 * 1000;

  if (now < sunrise - 45 * minutes) return "night";
  if (now < sunrise + 60 * minutes) return "dawn";
  if (now < sunset - 60 * minutes) return "day";
  if (now < sunset + 45 * minutes) return "dusk";
  return "night";
}

// from → to are the two ends of the page gradient; `scheme` says whether
// text on top of it needs to be light or dark
const SKIES = {
  clear: {
    day: { from: "#3f9fdc", to: "#a7d9f2", scheme: "dark" },
    dawn: { from: "#f0a061", to: "#8ec4de", scheme: "dark" },
    dusk: { from: "#e0754c", to: "#4c4d8c", scheme: "light" },
    night: { from: "#08152c", to: "#1a3766", scheme: "light" },
  },
  cloudy: {
    day: { from: "#7d97ab", to: "#c8d5de", scheme: "dark" },
    dawn: { from: "#d2a184", to: "#a8bccb", scheme: "dark" },
    dusk: { from: "#a97a72", to: "#4f5878", scheme: "light" },
    night: { from: "#131d2e", to: "#2c3d55", scheme: "light" },
  },
  overcast: {
    day: { from: "#6e7883", to: "#aab2ba", scheme: "dark" },
    dawn: { from: "#9a8f8a", to: "#b0b6bb", scheme: "dark" },
    dusk: { from: "#7c7078", to: "#4a4f5e", scheme: "light" },
    night: { from: "#15181f", to: "#2b303a", scheme: "light" },
  },
  fog: {
    day: { from: "#9aa3a8", to: "#d5dadd", scheme: "dark" },
    dawn: { from: "#b3a89f", to: "#d3d6d6", scheme: "dark" },
    dusk: { from: "#8b868a", to: "#5a5c66", scheme: "light" },
    night: { from: "#191b1f", to: "#33373d", scheme: "light" },
  },
  drizzle: {
    day: { from: "#5c7183", to: "#9dafbb", scheme: "dark" },
    dawn: { from: "#8a8698", to: "#9fb0bd", scheme: "light" },
    dusk: { from: "#5f5c74", to: "#3d4557", scheme: "light" },
    night: { from: "#101724", to: "#26313f", scheme: "light" },
  },
  rain: {
    day: { from: "#455a6a", to: "#7f8f9c", scheme: "light" },
    dawn: { from: "#6d6e83", to: "#8695a3", scheme: "light" },
    dusk: { from: "#464459", to: "#33394a", scheme: "light" },
    night: { from: "#0c121b", to: "#1f2836", scheme: "light" },
  },
  snow: {
    day: { from: "#93a5b5", to: "#e0e8ef", scheme: "dark" },
    dawn: { from: "#b0aab6", to: "#dde4ea", scheme: "dark" },
    dusk: { from: "#7d8093", to: "#4d5468", scheme: "light" },
    night: { from: "#141b28", to: "#333f52", scheme: "light" },
  },
  thunder: {
    day: { from: "#3a3d52", to: "#5f5a6d", scheme: "light" },
    dawn: { from: "#4b4358", to: "#6b6070", scheme: "light" },
    dusk: { from: "#312e44", to: "#4a3f52", scheme: "light" },
    night: { from: "#0a0b14", to: "#241f33", scheme: "light" },
  },
};

const INK = {
  light: {
    ink: "#ffffff",
    soft: "rgba(255, 255, 255, 0.72)",
    faint: "rgba(255, 255, 255, 0.42)",
    panel: "rgba(255, 255, 255, 0.12)",
    line: "rgba(255, 255, 255, 0.22)",
  },
  dark: {
    ink: "#11202b",
    soft: "rgba(17, 32, 43, 0.72)",
    faint: "rgba(17, 32, 43, 0.42)",
    panel: "rgba(255, 255, 255, 0.34)",
    line: "rgba(17, 32, 43, 0.16)",
  },
};

export function skyFor(group, phase) {
  const family = SKIES[group] ?? SKIES.cloudy;
  const sky = family[phase] ?? family.day;
  return { ...sky, ...INK[sky.scheme] };
}

export const PHASE_LABEL = {
  dawn: "dawn",
  day: "daytime",
  dusk: "dusk",
  night: "night",
};
