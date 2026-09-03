/* =========================================================
   WMO weather codes.

   Open-Meteo returns a bare number. This turns it into
   something the interface can use: a plain-language label and
   a group, because a page does not need to look different for
   "slight drizzle" and "moderate drizzle" — it needs to look
   wet.

   Pure. No DOM, no network.
   ========================================================= */

const CODES = {
  0: ["clear", "Clear"],

  1: ["clear", "Mainly clear"],
  2: ["cloudy", "Partly cloudy"],
  3: ["overcast", "Overcast"],

  45: ["fog", "Fog"],
  48: ["fog", "Freezing fog"],

  51: ["drizzle", "Light drizzle"],
  53: ["drizzle", "Drizzle"],
  55: ["drizzle", "Heavy drizzle"],
  56: ["drizzle", "Freezing drizzle"],
  57: ["drizzle", "Freezing drizzle"],

  61: ["rain", "Light rain"],
  63: ["rain", "Rain"],
  65: ["rain", "Heavy rain"],
  66: ["rain", "Freezing rain"],
  67: ["rain", "Freezing rain"],

  71: ["snow", "Light snow"],
  73: ["snow", "Snow"],
  75: ["snow", "Heavy snow"],
  77: ["snow", "Snow grains"],

  80: ["rain", "Light showers"],
  81: ["rain", "Showers"],
  82: ["rain", "Violent showers"],
  85: ["snow", "Snow showers"],
  86: ["snow", "Heavy snow showers"],

  95: ["thunder", "Thunderstorm"],
  96: ["thunder", "Thunderstorm with hail"],
  99: ["thunder", "Thunderstorm with hail"],
};

export function describe(code) {
  const [group, label] = CODES[code] ?? ["cloudy", "Unsettled"];
  return { group, label, code };
}

export const groupOf = (code) => describe(code).group;
