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
