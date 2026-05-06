# Yr Weather Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a React + Vite + Tailwind weather page showing current conditions and a 9-day forecast for Reykjavík and Vatnsendi using the yr.no API.

**Architecture:** Pure client-side React app; two parallel fetches to api.met.no on load; raw timeseries aggregated into current conditions and daily forecast by utility functions; two stacked WeatherCard components rendered inside a narrow max-w-md layout matching the home-page style.

**Tech Stack:** React 18, Vite 5, Tailwind CSS 4 (`@tailwindcss/vite`), lucide-react, yr.no Locationforecast 2.0 API.

---

## File Map

| File | Responsibility |
|---|---|
| `frontend/package.json` | Dependencies and scripts |
| `frontend/vite.config.js` | Vite + React + Tailwind plugins |
| `frontend/index.html` | HTML shell |
| `frontend/src/index.css` | Tailwind base import |
| `frontend/src/main.jsx` | React entry point |
| `frontend/src/api.js` | `fetchWeather(lat, lon)` — fetch wrapper |
| `frontend/src/utils/weather.js` | Pure functions: `parseCurrent`, `parseForecast`, `symbolToLabel`, `degToCardinal`, `windChill` |
| `frontend/src/components/ForecastRow.jsx` | Single forecast day row |
| `frontend/src/components/WeatherCard.jsx` | Full location card (current + forecast list) |
| `frontend/src/App.jsx` | Root: fetches both locations, manages loading/error state, renders cards |

---

## Task 1: Scaffold the Vite + React + Tailwind project

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/vite.config.js`
- Create: `frontend/index.html`
- Create: `frontend/src/index.css`
- Create: `frontend/src/main.jsx`

- [ ] **Step 1: Create `frontend/package.json`**

```json
{
  "name": "yr-weather",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "lucide-react": "^0.511.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.1.5",
    "@vitejs/plugin-react": "^4.3.4",
    "tailwindcss": "^4.1.5",
    "vite": "^5.4.10"
  }
}
```

- [ ] **Step 2: Create `frontend/vite.config.js`**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

- [ ] **Step 3: Create `frontend/index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Veður</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 4: Create `frontend/src/index.css`**

```css
@import "tailwindcss";

body {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  -webkit-font-smoothing: antialiased;
}
```

- [ ] **Step 5: Create `frontend/src/main.jsx`**

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 6: Install dependencies**

```bash
cd frontend && npm install
```

Expected: packages installed, no errors.

- [ ] **Step 7: Verify dev server starts**

```bash
npm run dev
```

Expected output includes: `Local: http://localhost:5173/`  
Open `http://localhost:5173` — blank white page is correct at this stage (App.jsx doesn't exist yet). Stop with Ctrl+C.

- [ ] **Step 8: Commit**

```bash
cd frontend && git init .. 2>/dev/null || true
git add frontend/
git commit -m "feat: scaffold yr-weather Vite + React + Tailwind project"
```

---

## Task 2: Weather utility functions

**Files:**
- Create: `frontend/src/utils/weather.js`

- [ ] **Step 1: Create `frontend/src/utils/weather.js`**

```js
const SYMBOL_LABELS = {
  clearsky_day: 'Clear sky',
  clearsky_night: 'Clear sky',
  fair_day: 'Fair',
  fair_night: 'Fair',
  partlycloudy_day: 'Partly cloudy',
  partlycloudy_night: 'Partly cloudy',
  cloudy: 'Cloudy',
  fog: 'Fog',
  lightrain: 'Light rain',
  rain: 'Rain',
  heavyrain: 'Heavy rain',
  lightrainshowers_day: 'Light showers',
  lightrainshowers_night: 'Light showers',
  rainshowers_day: 'Rain showers',
  rainshowers_night: 'Rain showers',
  heavyrainshowers_day: 'Heavy showers',
  heavyrainshowers_night: 'Heavy showers',
  lightsleet: 'Light sleet',
  sleet: 'Sleet',
  heavysleet: 'Heavy sleet',
  lightsleetshowers_day: 'Light sleet showers',
  lightsleetshowers_night: 'Light sleet showers',
  sleetshowers_day: 'Sleet showers',
  sleetshowers_night: 'Sleet showers',
  heavysleetshowers_day: 'Heavy sleet showers',
  heavysleetshowers_night: 'Heavy sleet showers',
  lightsnow: 'Light snow',
  snow: 'Snow',
  heavysnow: 'Heavy snow',
  lightsnowshowers_day: 'Light snow showers',
  lightsnowshowers_night: 'Light snow showers',
  snowshowers_day: 'Snow showers',
  snowshowers_night: 'Snow showers',
  heavysnowshowers_day: 'Heavy snow showers',
  heavysnowshowers_night: 'Heavy snow showers',
  thunder: 'Thunder',
  lightrainandthunder: 'Rain and thunder',
  rainandthunder: 'Rain and thunder',
  heavyrainandthunder: 'Heavy rain and thunder',
  lightsleetandthunder: 'Sleet and thunder',
  sleetandthunder: 'Sleet and thunder',
  lightsnowandthunder: 'Snow and thunder',
  snowandthunder: 'Snow and thunder',
}

export function symbolToLabel(code) {
  return SYMBOL_LABELS[code] ?? code.replace(/_/g, ' ')
}

const CARDINALS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']

export function degToCardinal(deg) {
  return CARDINALS[Math.round(deg / 45) % 8]
}

export function windChill(tempC, windMs) {
  const V = windMs * 3.6
  if (tempC > 10 || V < 4.8) return tempC
  const Vp = Math.pow(V, 0.16)
  return 13.12 + 0.6215 * tempC - 11.37 * Vp + 0.3965 * tempC * Vp
}

export function parseCurrent(timeseries) {
  const first = timeseries[0]
  const d = first.data.instant.details
  const next1 = first.data.next_1_hours
  const tempC = d.air_temperature
  const windMs = d.wind_speed
  return {
    temp: Math.round(tempC),
    feelsLike: Math.round(windChill(tempC, windMs)),
    condition: next1 ? symbolToLabel(next1.summary.symbol_code) : '—',
    windSpeed: windMs,
    windDir: degToCardinal(d.wind_from_direction),
    precip: next1 ? next1.details.precipitation_amount : 0,
  }
}

export function parseForecast(timeseries) {
  const byDate = {}
  for (const entry of timeseries) {
    const date = entry.time.slice(0, 10)
    if (!byDate[date]) byDate[date] = []
    byDate[date].push(entry)
  }
  const today = new Date().toISOString().slice(0, 10)
  const days = Object.keys(byDate).filter(d => d > today).slice(0, 9)
  return days.map(date => {
    const entries = byDate[date]
    const temps = entries.map(e => e.data.instant.details.air_temperature)
    const noonEntry = entries.find(e => e.time.includes('T12:00')) ?? entries[0]
    const next6 = noonEntry.data.next_6_hours
    return {
      date,
      high: Math.round(Math.max(...temps)),
      low: Math.round(Math.min(...temps)),
      condition: next6 ? symbolToLabel(next6.summary.symbol_code) : '—',
    }
  })
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/utils/weather.js
git commit -m "feat: add weather parsing utilities (parseCurrent, parseForecast, windChill)"
```

---

## Task 3: API module

**Files:**
- Create: `frontend/src/api.js`

- [ ] **Step 1: Create `frontend/src/api.js`**

```js
const BASE = 'https://api.met.no/weatherapi/locationforecast/2.0/compact'

export async function fetchWeather(lat, lon) {
  const res = await fetch(`${BASE}?lat=${lat}&lon=${lon}`)
  if (!res.ok) throw new Error(`yr.no ${res.status}: ${res.statusText}`)
  return res.json()
}
```

Note: browsers cannot set a custom `User-Agent` header (it is a forbidden header). For a personal/local-use app this is acceptable — api.met.no still responds. If strict compliance is needed later, add a Cloudflare Worker proxy that injects the header.

- [ ] **Step 2: Commit**

```bash
git add frontend/src/api.js
git commit -m "feat: add yr.no API fetch wrapper"
```

---

## Task 4: ForecastRow component

**Files:**
- Create: `frontend/src/components/ForecastRow.jsx`

- [ ] **Step 1: Create `frontend/src/components/ForecastRow.jsx`**

```jsx
export default function ForecastRow({ date, high, low, condition }) {
  const d = new Date(date + 'T12:00:00')
  const day = d.toLocaleDateString('en-GB', { weekday: 'short' })

  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className="w-8 text-gray-700 font-medium">{day}</span>
      <span className="flex-1 text-center text-xs text-gray-500">{condition}</span>
      <span className="text-gray-900 font-medium tabular-nums">
        {high}° / {low}°
      </span>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/ForecastRow.jsx
git commit -m "feat: add ForecastRow component"
```

---

## Task 5: WeatherCard component

**Files:**
- Create: `frontend/src/components/WeatherCard.jsx`

- [ ] **Step 1: Create `frontend/src/components/WeatherCard.jsx`**

```jsx
import ForecastRow from './ForecastRow'

export default function WeatherCard({ name, current, forecast }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
        <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">
          {name}
        </span>
      </div>

      <div className="flex items-start gap-4 mb-4">
        <div className="text-5xl font-bold text-gray-900 leading-none tabular-nums">
          {current.temp}°
        </div>
        <div className="mt-1 min-w-0">
          <div className="text-sm text-gray-700">{current.condition}</div>
          <div className="text-xs text-gray-500 mt-0.5">
            Wind {current.windSpeed} m/s {current.windDir} · {current.precip} mm
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            Feels like {current.feelsLike}°
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-2 divide-y divide-gray-50">
        {forecast.map(day => (
          <ForecastRow key={day.date} {...day} />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/WeatherCard.jsx
git commit -m "feat: add WeatherCard component"
```

---

## Task 6: App root and full integration

**Files:**
- Create: `frontend/src/App.jsx`

- [ ] **Step 1: Create `frontend/src/App.jsx`**

```jsx
import { useEffect, useState } from 'react'
import WeatherCard from './components/WeatherCard'
import { fetchWeather } from './api'
import { parseCurrent, parseForecast } from './utils/weather'

const LOCATIONS = [
  { name: 'Reykjavík', lat: 64.1355, lon: -21.8954 },
  { name: 'Vatnsendi', lat: 64.0899, lon: -21.9200 },
]

export default function App() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all(LOCATIONS.map(loc => fetchWeather(loc.lat, loc.lon)))
      .then(responses => {
        setData(responses.map((json, i) => ({
          name: LOCATIONS[i].name,
          current: parseCurrent(json.properties.timeseries),
          forecast: parseForecast(json.properties.timeseries),
        })))
      })
      .catch(err => setError(err.message))
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Veður</h1>
          <p className="text-sm text-gray-500">Reykjavík &amp; Vatnsendi</p>
        </div>

        {!data && !error && (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-amber-500 rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
            Could not load weather data: {error}
          </div>
        )}

        {data && (
          <div className="flex flex-col gap-4">
            {data.map(loc => (
              <WeatherCard key={loc.name} {...loc} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Start the dev server**

```bash
cd frontend && npm run dev
```

Open `http://localhost:5173`. Expected:
- Amber spinner appears briefly
- Two cards appear: Reykjavík on top, Vatnsendi below
- Each card shows temperature, condition, wind, feels like, and 9 forecast rows

- [ ] **Step 3: Check network tab**

In browser DevTools → Network → filter by `api.met.no`. Confirm:
- Two requests, both returning `200 OK`
- Response contains `properties.timeseries` array

- [ ] **Step 4: Verify forecast rows**

Count the forecast rows in each card. Should be exactly 9 (the next 9 calendar days after today).

- [ ] **Step 5: Test error state**

In DevTools → Network → tick "Offline". Reload. Expected: red error card with message "Could not load weather data: Failed to fetch". Un-tick Offline.

- [ ] **Step 6: Build**

```bash
npm run build
```

Expected: `dist/` folder created, no errors.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/App.jsx
git commit -m "feat: wire up App root with loading, error, and weather card rendering"
```

---

## Verification Checklist

- [ ] `npm run dev` → page loads at `http://localhost:5173`
- [ ] Both location cards render with live yr.no data
- [ ] Current conditions show: temperature, condition label, wind (speed + cardinal), precip, feels like
- [ ] Each card has exactly 9 forecast rows (day name + condition + high/low)
- [ ] Feels like differs from temperature when wind is strong
- [ ] Spinner shows before data arrives
- [ ] Error card shows when network is offline
- [ ] `npm run build` completes without errors
