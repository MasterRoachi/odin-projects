/* =========================================================
   The interface.

   Holds what is on screen, asks the api module for data, and
   paints. It never formats a temperature itself and never
   decides what colour the sky is — those live in model/.
   ========================================================= */

import { fetchForecast, placeLabel, searchPlaces, shortLabel, WeatherError } from "../api/openMeteo.js";
import * as places from "../model/places.js";
import { phaseFor, PHASE_LABEL, skyFor } from "../model/sky.js";
import { clock, exactTemperature, rainfall, temperature, weekday, wind } from "../model/units.js";
import { hourlyChart } from "./chart.js";
import { el } from "./dom.js";

const state = {
  place: null,
  forecast: null,
  unit: places.getUnit(),
  status: "idle", // idle | loading | ready | error
  error: "",
  suggestions: [],
};

let root = null;
let searchValue = "";
let searchTimer = null;

/* ---------------------------------------------------------
   Loading data
   --------------------------------------------------------- */

async function load(place) {
  state.status = "loading";
  state.suggestions = [];
  state.place = place;
  render();

  try {
    state.forecast = await fetchForecast(place);
    state.place = state.forecast.place;
    state.status = "ready";
    places.remember(state.forecast.place);
  } catch (error) {
    state.status = "error";
    state.error =
      error instanceof WeatherError
        ? error.message
        : "Something went wrong fetching the forecast.";
  }

  render();
}

async function suggest(term) {
  if (term.trim().length < 2) {
    state.suggestions = [];
    render();
    return;
  }
  try {
    state.suggestions = await searchPlaces(term);
  } catch {
    state.suggestions = [];
  }
  render();
}

function useMyLocation() {
  if (!navigator.geolocation) {
    state.status = "error";
    state.error = "This browser cannot share a location.";
    render();
    return;
  }

  state.status = "loading";
  render();

  navigator.geolocation.getCurrentPosition(
    (position) =>
      load({
        name: "Your location",
        region: "",
        country: "",
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        timezone: "auto",
      }),
    () => {
      // declining is a normal answer, not a failure
      state.status = state.forecast ? "ready" : "idle";
      state.error = "";
      render();
    },
    { timeout: 10000 }
  );
}

/* ---------------------------------------------------------
   The sky
   --------------------------------------------------------- */

function applySky() {
  const style = document.documentElement.style;

  if (!state.forecast) {
    const sky = skyFor("cloudy", "day");
    setSky(style, sky);
    return { ...sky, phase: "day" };
  }

  const { current, today } = state.forecast;
  const phase = phaseFor({
    nowIso: current.time,
    sunriseIso: today?.sunrise,
    sunsetIso: today?.sunset,
  });

  const sky = skyFor(current.group, phase);
  setSky(style, sky);
  document.body.dataset.scheme = sky.scheme;
  return { ...sky, phase };
}

function setSky(style, sky) {
  style.setProperty("--sky-from", sky.from);
  style.setProperty("--sky-to", sky.to);
  style.setProperty("--ink", sky.ink);
  style.setProperty("--ink-soft", sky.soft);
  style.setProperty("--ink-faint", sky.faint);
  style.setProperty("--panel", sky.panel);
  style.setProperty("--line", sky.line);
}

/* ---------------------------------------------------------
   Pieces
   --------------------------------------------------------- */

function searchBar() {
  const input = el("input", {
    type: "search",
    id: "search",
    class: "search-input",
    placeholder: "Search for a town or city",
    autocomplete: "off",
    value: searchValue,
    onInput: (event) => {
      searchValue = event.target.value;
      clearTimeout(searchTimer);
      // one request per pause in typing, not one per keystroke
      searchTimer = setTimeout(() => suggest(searchValue), 280);
    },
    onKeydown: (event) => {
      if (event.key === "Enter" && state.suggestions[0]) {
        event.preventDefault();
        choose(state.suggestions[0]);
      }
      if (event.key === "Escape") {
        state.suggestions = [];
        render();
      }
    },
  });

  const list =
    state.suggestions.length > 0
      ? el(
          "ul",
          { class: "suggestions" },
          state.suggestions.map((place) =>
            el("li", {}, [
              el("button", {
                type: "button",
                text: placeLabel(place),
                onClick: () => choose(place),
              }),
            ])
          )
        )
      : null;

  return el("div", { class: "search" }, [
    el("form", { class: "search-form", onSubmit: (e) => e.preventDefault() }, [
      el("label", { class: "sr-only", for: "search", text: "Search for a place" }),
      input,
      el("button", {
        class: "locate",
        type: "button",
        title: "Use my location",
        "aria-label": "Use my location",
        text: "◎",
        onClick: useMyLocation,
      }),
    ]),
    list,
  ]);
}

function choose(place) {
  searchValue = "";
  load(place);
}

function unitToggle() {
  const button = (unit) =>
    el("button", {
      type: "button",
      class: state.unit === unit ? "is-on" : "",
      "aria-pressed": String(state.unit === unit),
      text: `°${unit}`,
      onClick: () => {
        state.unit = unit;
        places.setUnit(unit);
        render();
      },
    });

  return el("div", { class: "units" }, [button("C"), button("F")]);
}

function savedPlaces() {
  const saved = places.getPlaces();
  if (saved.length === 0) return null;

  return el(
    "ul",
    { class: "saved" },
    saved.map((place) =>
      el("li", { class: places.keyOf(place) === currentKey() ? "is-current" : "" }, [
        el("button", {
          class: "saved-name",
          type: "button",
          text: shortLabel(place),
          onClick: () => load(place),
        }),
        el("button", {
          class: "saved-forget",
          type: "button",
          "aria-label": `Forget ${place.name}`,
          text: "×",
          onClick: () => {
            places.forget(place);
            render();
          },
        }),
      ])
    )
  );
}

const currentKey = () =>
  state.place && Number.isFinite(state.place.latitude)
    ? places.keyOf(state.place)
    : null;

function currentPanel(sky) {
  const { current, place, today } = state.forecast;

  return el("section", { class: "now" }, [
    el("p", { class: "place", text: placeLabel(place) || "Your location" }),
    el("p", {
      class: "local-time",
      text: `${clock(current.time)} local · ${PHASE_LABEL[sky.phase]}`,
    }),

    el("p", { class: "temp", text: temperature(current.temperature, state.unit) }),
    el("p", { class: "condition", text: current.label }),
    el("p", {
      class: "feels",
      text: `Feels like ${exactTemperature(current.feelsLike, state.unit)}`,
    }),

    el("dl", { class: "readings" }, [
      reading("Humidity", `${current.humidity}%`),
      reading("Wind", wind(current.wind, state.unit)),
      reading("Rain now", rainfall(current.precipitation, state.unit)),
      reading("High", temperature(today?.high, state.unit)),
      reading("Low", temperature(today?.low, state.unit)),
      reading("Sunrise", clock(today?.sunrise)),
      reading("Sunset", clock(today?.sunset)),
    ]),
  ]);
}

const reading = (term, value) =>
  el("div", { class: "reading" }, [
    el("dt", { text: term }),
    el("dd", { text: value }),
  ]);

function hourlyPanel() {
  const { hourly, daily } = state.forecast;
  return el("section", { class: "panel" }, [
    el("h2", { text: "Next 24 hours" }),
    hourlyChart(hourly, { unit: state.unit, daily }),
  ]);
}

function weekPanel() {
  const { daily } = state.forecast;

  const highs = daily.map((day) => day.high);
  const lows = daily.map((day) => day.low);
  const top = Math.max(...highs);
  const bottom = Math.min(...lows);
  const span = Math.max(1, top - bottom);

  return el("section", { class: "panel" }, [
    el("h2", { text: "The week" }),
    el(
      "ul",
      { class: "week" },
      daily.map((day, i) =>
        el("li", { class: "day" }, [
          el("span", { class: "day-name", text: i === 0 ? "Today" : weekday(day.date) }),
          el("span", { class: "day-cond", text: day.label }),
          el("span", {
            class: "day-rain",
            text: day.rainChance ? `${day.rainChance}%` : "",
          }),
          el("span", { class: "day-low", text: temperature(day.low, state.unit) }),
          el("span", { class: "day-range" }, [
            el("span", {
              class: "day-bar",
              style: {
                marginLeft: `${((day.low - bottom) / span) * 100}%`,
                width: `${Math.max(6, ((day.high - day.low) / span) * 100)}%`,
              },
            }),
          ]),
          el("span", { class: "day-high", text: temperature(day.high, state.unit) }),
        ])
      )
    ),
  ]);
}

/* ---------------------------------------------------------
   Render
   --------------------------------------------------------- */

export function render() {
  const sky = applySky();

  const header = el("header", { class: "bar" }, [searchBar(), unitToggle()]);
  const saved = savedPlaces();

  let body;
  if (state.status === "loading") {
    body = el("div", { class: "state" }, [
      el("span", { class: "spinner", "aria-hidden": "true" }),
      el("p", { text: "Looking up the sky…" }),
    ]);
  } else if (state.status === "error") {
    body = el("div", { class: "state" }, [
      el("p", { class: "error", text: state.error }),
      el("button", {
        class: "retry",
        type: "button",
        text: "Try again",
        onClick: () => (state.place ? load(state.place) : render()),
      }),
    ]);
  } else if (state.status === "ready" && state.forecast) {
    body = el("div", { class: "content" }, [
      currentPanel(sky),
      hourlyPanel(),
      weekPanel(),
    ]);
  } else {
    body = el("div", { class: "state" }, [
      el("p", { class: "prompt", text: "Where would you like to look?" }),
      el("p", { class: "prompt-sub", text: "Search for a place, or use your location." }),
    ]);
  }

  const footer = el("footer", { class: "colophon" }, [
    "Weather from ",
    el("a", { href: "https://open-meteo.com/", text: "Open-Meteo", target: "_blank", rel: "noreferrer" }),
    ". Built for ",
    el("a", { href: "https://www.theodinproject.com/", text: "The Odin Project", target: "_blank", rel: "noreferrer" }),
    ".",
  ]);

  root.replaceChildren(
    el("div", { class: "page" }, [header, saved, body, footer].filter(Boolean))
  );

  // keep the caret where it was after a re-render
  if (searchValue) {
    const input = root.querySelector("#search");
    if (input && document.activeElement !== input) {
      input.value = searchValue;
    }
  }
}

export function mount(node) {
  root = node;

  const saved = places.getPlaces();
  if (saved.length > 0) {
    load(saved[0]);
  } else {
    render();
  }
}
