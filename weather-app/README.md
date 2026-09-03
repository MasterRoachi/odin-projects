# Weather

A forecast that takes on the colour of the weather, built for [The Odin Project](https://www.theodinproject.com/)'s Weather App assignment.

## Overview

The brief asks for a searchable forecast with a Fahrenheit/Celsius toggle, and says to *"change the look of the page based on the data"*. That last part is the whole design here.

The page is coloured on two axes at once: **what the weather is doing**, and **what time it is where you are looking** — which is rarely what time it is for you. A drizzly morning in Reykjavik and a clear night in Los Angeles produce completely different pages, because they should.

Phase comes from that location's own sunrise and sunset, not from a clock: night, dawn, day, dusk. Eight condition groups times four phases gives thirty-two skies, each with its own gradient and its own decision about whether text on top should be light or dark.

## A deliberate deviation

The brief names the Visual Crossing API, which needs a key in the front-end. It notes that Odin's key is public so exposing it is harmless — but it still means a key sitting in a public repository, and a repo nobody else can run without supplying their own.

This uses [Open-Meteo](https://open-meteo.com/) instead: free, no key, no registration, CORS enabled. Nothing to leak, no GitHub secret-scanning alert, and anyone who clones this can run it immediately. The learning goal — fetch, process, display, handle failure — is untouched.

## Using it

* **Search** any town or city; suggestions appear as you type
* **◎** uses your location, and does nothing intrusive if you decline
* **°C / °F** converts everything without another request
* Places you look at are **remembered**, and it reopens where you left off

## Structure

```
src/
├── api/openMeteo.js     the two requests, and the shaping of what comes back
├── model/               pure. No DOM, no network.
│   ├── weatherCodes.js  WMO code → group + plain-language label
│   ├── sky.js           condition + local phase → the page's colours
│   ├── units.js         conversion, formatting, and naive-time parsing
│   └── places.js        remembered places and the chosen unit
└── ui/                  knows the DOM. Nothing else does.
    ├── app.js           renders, and asks the api module for data
    ├── chart.js         the hourly curve, drawn as SVG
    └── dom.js           a small element builder
```

The brief asks for functions that hit the API and *separate* functions that process the JSON into just what the app needs. That is the split in `api/openMeteo.js`: `fetchForecast` does the request, `shapeForecast` flattens it. Open-Meteo returns parallel arrays — `time[]`, `temperature[]`, `weather_code[]` — which is efficient over the wire and useless to render, so they are zipped into the list of objects the interface actually wants and everything else is dropped.

## The bug worth recording

Open-Meteo is asked for `timezone=auto`, which means every timestamp comes back as **the wall clock at that location with no offset attached** — `"2026-09-03T01:15"` is 1:15am in Los Angeles.

Passing that to `new Date()` makes the browser read it as *its own* local time. Formatting the result in the location's timezone then shifts it a second time. Los Angeles at 1:15am was displaying as 4:15 PM, while the sky correctly showed night — the phase logic compared three strings that were all wrong by the same amount, so it still worked, and only the clock gave the mistake away.

`parseNaive()` rebuilds the Date from its parts, so the wall clock survives.

## Going Beyond the Brief

* **Seven-day forecast** with highs, lows, rain chance and a range bar per day
* **Hourly curve** for the next 24 hours as inline SVG, with rain-chance bars, night shaded, and the peak marked
* **Use my location**, declining handled as a normal answer rather than an error
* **Remembered places**, kept in localStorage
* **A loading state** (the brief's optional extra) and **two distinct failure messages** — a dead network reads differently from a bad HTTP status, with a retry either way
* **Responsive** to 320px

## Built With

* Webpack 5, split dev/prod with `webpack-merge`
* Open-Meteo — forecast and geocoding, no key
* Figtree and DM Mono
* No framework, no charting library

## What I Practiced

* `fetch`, `async`/`await`, and error handling that distinguishes causes
* Separating the request from the shaping of its response
* Deriving presentation from data rather than hard-coding it
* Drawing a chart from coordinates instead of importing one
* Naive vs absolute timestamps, and why mixing them silently produces plausible wrong answers

## Project Status

Complete.

## Acknowledgements

Weather data from [Open-Meteo](https://open-meteo.com/). Completed as part of The Odin Project's JavaScript course.
