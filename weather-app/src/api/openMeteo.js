/* =========================================================
   Open-Meteo.

   Two calls: one turns a typed place name into coordinates,
   the other returns the forecast for those coordinates. No
   API key is involved, so there is nothing to keep out of the
   repository.

   The brief asks for functions that hit the API and separate
   functions that *process* what comes back into just what the
   app needs. That is the shape here: fetchX does the request,
   shapeX flattens the response.
   ========================================================= */

import { describe } from "../model/weatherCodes.js";

const GEOCODE = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST = "https://api.open-meteo.com/v1/forecast";

class WeatherError extends Error {}

async function getJson(url) {
  let response;
  try {
    response = await fetch(url);
  } catch {
    // a failed fetch means the network, not the service
    throw new WeatherError("Could not reach the weather service. Check your connection.");
  }
  if (!response.ok) {
    throw new WeatherError(`The weather service replied ${response.status}.`);
  }
  return response.json();
}

/* ---------------------------------------------------------
   Places
   --------------------------------------------------------- */

export async function searchPlaces(query) {
  const term = query.trim();
  if (!term) return [];

  const url = `${GEOCODE}?name=${encodeURIComponent(term)}&count=6&language=en&format=json`;
  const data = await getJson(url);
  return (data.results ?? []).map(shapePlace);
}

function shapePlace(result) {
  return {
    id: result.id,
    name: result.name,
    region: result.admin1 || "",
    country: result.country || "",
    countryCode: result.country_code || "",
    latitude: result.latitude,
    longitude: result.longitude,
    timezone: result.timezone,
  };
}

/** "Reykjavik, Capital Region, Iceland" without the empty commas. */
export const placeLabel = (place) =>
  [place.name, place.region, place.country].filter(Boolean).join(", ");

export const shortLabel = (place) =>
  [place.name, place.country].filter(Boolean).join(", ");

/* ---------------------------------------------------------
   Forecast
   --------------------------------------------------------- */

export async function fetchForecast(place) {
  const params = new URLSearchParams({
    latitude: place.latitude,
    longitude: place.longitude,
    current:
      "temperature_2m,apparent_temperature,relative_humidity_2m,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure",
    hourly: "temperature_2m,weather_code,precipitation_probability",
    daily:
      "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max,wind_speed_10m_max",
    timezone: "auto",
    forecast_days: "7",
  });

  const data = await getJson(`${FORECAST}?${params}`);
  return shapeForecast(data, place);
}

/**
 * Open-Meteo returns parallel arrays — time[], temperature[], code[] — which
 * is efficient over the wire and awkward to render. This zips them into the
 * list of objects the interface actually wants, and drops everything else.
 */
function shapeForecast(data, place) {
  const timezone = data.timezone || place.timezone;

  const current = {
    time: data.current.time,
    temperature: data.current.temperature_2m,
    feelsLike: data.current.apparent_temperature,
    humidity: data.current.relative_humidity_2m,
    precipitation: data.current.precipitation,
    wind: data.current.wind_speed_10m,
    windDirection: data.current.wind_direction_10m,
    pressure: data.current.surface_pressure,
    isDay: Boolean(data.current.is_day),
    ...describe(data.current.weather_code),
  };

  const daily = data.daily.time.map((time, i) => ({
    date: time,
    high: data.daily.temperature_2m_max[i],
    low: data.daily.temperature_2m_min[i],
    sunrise: data.daily.sunrise[i],
    sunset: data.daily.sunset[i],
    rainChance: data.daily.precipitation_probability_max[i],
    maxWind: data.daily.wind_speed_10m_max[i],
    ...describe(data.daily.weather_code[i]),
  }));

  // the next 24 hours from now, not the last 24 — the response starts at
  // midnight local, so the earlier part of today is already history
  const nowIndex = Math.max(
    0,
    data.hourly.time.findIndex((time) => time >= data.current.time)
  );

  const hourly = data.hourly.time
    .slice(nowIndex, nowIndex + 24)
    .map((time, i) => ({
      time,
      temperature: data.hourly.temperature_2m[nowIndex + i],
      rainChance: data.hourly.precipitation_probability[nowIndex + i],
      ...describe(data.hourly.weather_code[nowIndex + i]),
    }));

  return {
    place: { ...place, timezone },
    timezone,
    current,
    hourly,
    daily,
    today: daily[0],
    fetchedAt: Date.now(),
  };
}

export { WeatherError };
