# Yr Weather Page — Design Spec

**Date:** 2026-05-06  
**Project:** yr_wrapper  

---

## Context

A simple personal weather page showing current conditions and a 9-day forecast for two Icelandic locations: Reykjavík and Vatnsendi. Data comes from the free yr.no API (api.met.no). The visual design mirrors the existing home-page project — same React + Vite + Tailwind stack, same gray/amber color system, same narrow `max-w-md` single-column layout.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 + Vite 5 |
| Styling | Tailwind CSS 4 (via `@tailwindcss/vite`) |
| Icons | lucide-react |
| Data | yr.no Locationforecast 2.0 API |
| Build | `npm run build` → static `dist/` |
| No backend | Pure client-side fetch, no server needed |

---

## Data Source

**API:** `https://api.met.no/weatherapi/locationforecast/2.0/compact`

**Required header:** `User-Agent: yr-weather/1.0 bergur.heimisson@gmail.com`  
(yr.no requires identification — without it requests are rejected)

**Locations:**

| Name | Latitude | Longitude |
|---|---|---|
| Reykjavík | 64.1355 | -21.8954 |
| Vatnsendi | 64.0899 | -21.9200 |

**Fetch strategy:** Both locations fetched in parallel on page load (`Promise.all`). No caching, no refresh.

---

## Data Parsing

The API returns a `properties.timeseries` array of hourly entries. Two derivations are needed:

### Current conditions (from first timeseries entry)
- Temperature: `data.instant.details.air_temperature` (°C)
- Wind speed: `data.instant.details.wind_speed` (m/s)
- Wind direction: `data.instant.details.wind_from_direction` (degrees → cardinal label)
- Precipitation next hour: `data.next_1_hours.details.precipitation_amount` (mm)
- Symbol: `data.next_1_hours.summary.symbol_code` → human-readable label
- Feels like: calculated from temperature + wind speed using the Environment Canada wind chill formula:
  `WAT = 13.12 + 0.6215T - 11.37V^0.16 + 0.3965T·V^0.16`
  where T = air temp (°C), V = wind speed (km/h = m/s × 3.6).
  Only shown when T ≤ 10°C and V > 4.8 km/h; otherwise display actual temperature as feels-like.

### 9-day daily forecast
- Group timeseries entries by date (UTC)
- For each date, take the noon entry (12:00 UTC) as the representative entry
- Daily high/low: scan all entries for that date, take max/min `air_temperature`
- Condition label: from noon entry's `next_6_hours.summary.symbol_code`
- Skip today (already shown in current conditions)
- Take next 9 calendar days

### Symbol → label mapping
A small lookup table converts yr.no symbol codes (e.g. `partlycloudy_day`, `heavyrain`) to readable English strings (e.g. "Partly cloudy", "Heavy rain").

---

## Component Structure

```
src/
  main.jsx              React entry point
  App.jsx               Root: fetches both locations, passes data down
  index.css             Tailwind base (identical to home-page)
  api.js                fetch wrapper for yr.no (handles User-Agent, error)
  utils/
    weather.js          parseCurrent(), parseForecast(), symbolToLabel(), degToCardinal()
  components/
    WeatherCard.jsx     Full card for one location (current + forecast list)
    ForecastRow.jsx     Single day row (day name, condition, high/low)
```

---

## Visual Design

Matches home-page design system:
- **Background:** `bg-gray-50`
- **Cards:** `bg-white border border-gray-200 rounded-xl`
- **Font:** system-ui (no web font loading)
- **Accent:** amber-500 for location label dot/icon
- **Layout:** `max-w-md mx-auto px-4 py-8` — same as home-page

### WeatherCard layout
```
┌─────────────────────────────────┐
│  ● REYKJAVÍK                    │  ← amber dot + uppercase label
│                                 │
│  7°    Partly cloudy            │  ← large temp + condition
│        Wind 8 m/s NW · 0mm     │  ← wind + precip
│        Feels like 3°            │  ← wind chill (calculated)
│─────────────────────────────────│
│  Tue   Partly cloudy   9° / 4° │  ← ForecastRow ×9
│  Wed   Rain           11° / 6° │
│  Thu   Cloudy          8° / 3° │
│  ...                            │
└─────────────────────────────────┘
```

### States
- **Loading:** Simple centered spinner (Tailwind animate-spin border trick)
- **Error:** Red-tinted message card matching home-page error style (`bg-red-50 border-red-200`)
- **Success:** Two WeatherCards stacked with `gap-4`

---

## Page Header

Small header above the cards:
- Title: "Veður" (Icelandic for "Weather") — `text-xl font-bold`
- Subtitle: "Reykjavík & Vatnsendi" — `text-sm text-gray-500`

---

## File Layout

```
yr_wrapper/
  frontend/
    index.html
    vite.config.js
    package.json
    src/
      main.jsx
      App.jsx
      index.css
      api.js
      utils/weather.js
      components/
        WeatherCard.jsx
        ForecastRow.jsx
```

No backend. No auth. No tests required for this initial version.

---

## Verification

1. `cd frontend && npm install && npm run dev`
2. Open `http://localhost:5173` — both cards render with real yr.no data
3. Check network tab: two requests to `api.met.no`, both return 200
4. Check that 9 forecast rows appear under each card
5. Throttle network to Slow 3G — loading spinner appears, then data loads
6. Kill network — error state renders cleanly
7. `npm run build` — builds without errors to `dist/`
