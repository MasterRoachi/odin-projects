/* =========================================================
   The next twenty-four hours, drawn as inline SVG.

   A temperature curve with rain-chance bars underneath it and
   sunrise and sunset marked where they fall. Drawn rather
   than charted with a library, because it is one line and a
   handful of rectangles and a library would be four hundred
   kilobytes to avoid writing them.
   ========================================================= */

import { clock, parseNaive, toF } from "../model/units.js";

const NS = "http://www.w3.org/2000/svg";
const W = 720;
const H = 150;
const PAD = { top: 24, right: 14, bottom: 30, left: 14 };

const make = (tag, attrs = {}) => {
  const node = document.createElementNS(NS, tag);
  Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
  return node;
};

export function hourlyChart(hourly, { unit, daily }) {
  const svg = make("svg", {
    viewBox: `0 0 ${W} ${H}`,
    class: "chart",
    preserveAspectRatio: "none",
    role: "img",
    "aria-label": "Temperature over the next twenty-four hours",
  });

  if (hourly.length < 2) return svg;

  const temps = hourly.map((hour) => hour.temperature);
  const min = Math.min(...temps);
  const max = Math.max(...temps);
  // a flat day would otherwise divide by zero and draw a line through the middle
  const span = Math.max(1, max - min);

  const plotWidth = W - PAD.left - PAD.right;
  const plotHeight = H - PAD.top - PAD.bottom;

  const x = (i) => PAD.left + (i / (hourly.length - 1)) * plotWidth;
  const y = (value) => PAD.top + (1 - (value - min) / span) * plotHeight;

  // --- night bands, so you can see where the dark hours fall ---
  const nightBand = (fromIso, toIso) => {
    const from = parseNaive(fromIso).getTime();
    const to = parseNaive(toIso).getTime();
    const first = parseNaive(hourly[0].time).getTime();
    const last = parseNaive(hourly[hourly.length - 1].time).getTime();
    if (to <= first || from >= last) return null;

    const clamp = (t) => Math.min(1, Math.max(0, (t - first) / (last - first)));
    const startX = PAD.left + clamp(from) * plotWidth;
    const endX = PAD.left + clamp(to) * plotWidth;
    if (endX - startX < 1) return null;

    return make("rect", {
      x: startX,
      y: PAD.top - 10,
      width: endX - startX,
      height: plotHeight + 14,
      class: "chart-night",
    });
  };

  daily.slice(0, 3).forEach((day, i) => {
    const next = daily[i + 1];
    if (!next) return;
    const band = nightBand(day.sunset, next.sunrise);
    if (band) svg.append(band);
  });

  // --- rain chance, as bars along the floor ---
  hourly.forEach((hour, i) => {
    const chance = hour.rainChance ?? 0;
    if (chance <= 0) return;
    const height = (chance / 100) * 26;
    svg.append(
      make("rect", {
        x: x(i) - plotWidth / hourly.length / 2.6,
        y: H - PAD.bottom - height + 12,
        width: plotWidth / hourly.length / 1.3,
        height,
        rx: 1.5,
        class: "chart-rain",
      })
    );
  });

  // --- the temperature line, and a soft fill under it ---
  const points = hourly.map((hour, i) => `${x(i)},${y(hour.temperature)}`);

  svg.append(
    make("path", {
      d: `M ${PAD.left},${H - PAD.bottom} L ${points.join(" L ")} L ${W - PAD.right},${H - PAD.bottom} Z`,
      class: "chart-fill",
    })
  );

  svg.append(
    make("polyline", { points: points.join(" "), class: "chart-line" })
  );

  // --- labels: now, the peak, and every sixth hour ---
  const label = (i, text, className) =>
    make("text", { x: x(i), y: H - 8, class: `chart-label ${className}` }).appendChild(
      document.createTextNode(text)
    ).parentNode;

  hourly.forEach((hour, i) => {
    if (i !== 0 && i % 6 !== 0) return;
    svg.append(label(i, i === 0 ? "now" : clock(hour.time), ""));
  });

  const peak = temps.indexOf(max);
  svg.append(make("circle", { cx: x(peak), cy: y(max), r: 3.5, class: "chart-peak" }));
  svg.append(
    make("text", {
      x: x(peak),
      y: y(max) - 9,
      class: "chart-label chart-peak-label",
    }).appendChild(
      document.createTextNode(
        `${Math.round(unit === "F" ? toF(max) : max)}°`
      )
    ).parentNode
  );

  return svg;
}
