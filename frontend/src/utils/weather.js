const SYMBOL_LABELS = {
  clearsky_day: 'Skýlaust',
  clearsky_night: 'Skýlaust',
  fair_day: 'Létt ský',
  fair_night: 'Létt ský',
  partlycloudy_day: 'Skýjað að hluta',
  partlycloudy_night: 'Skýjað að hluta',
  cloudy: 'Skýjað',
  fog: 'Þoka',
  lightrain: 'Létt rigning',
  rain: 'Rigning',
  heavyrain: 'Mikil rigning',
  lightrainshowers_day: 'Léttar skúrir',
  lightrainshowers_night: 'Léttar skúrir',
  rainshowers_day: 'Skúrir',
  rainshowers_night: 'Skúrir',
  heavyrainshowers_day: 'Miklar skúrir',
  heavyrainshowers_night: 'Miklar skúrir',
  lightsleet: 'Létt slydda',
  sleet: 'Slydda',
  heavysleet: 'Mikil slydda',
  lightsleetshowers_day: 'Léttar slydduskúrir',
  lightsleetshowers_night: 'Léttar slydduskúrir',
  sleetshowers_day: 'Slydduskúrir',
  sleetshowers_night: 'Slydduskúrir',
  heavysleetshowers_day: 'Miklar slydduskúrir',
  heavysleetshowers_night: 'Miklar slydduskúrir',
  lightsnow: 'Létt snjókoma',
  snow: 'Snjókoma',
  heavysnow: 'Mikil snjókoma',
  lightsnowshowers_day: 'Léttar snjóskúrir',
  lightsnowshowers_night: 'Léttar snjóskúrir',
  snowshowers_day: 'Snjóskúrir',
  snowshowers_night: 'Snjóskúrir',
  heavysnowshowers_day: 'Miklar snjóskúrir',
  heavysnowshowers_night: 'Miklar snjóskúrir',
  thunder: 'Þruma',
  lightrainandthunder: 'Rigning og þruma',
  rainandthunder: 'Rigning og þruma',
  heavyrainandthunder: 'Mikil rigning og þruma',
  lightsleetandthunder: 'Slydda og þruma',
  sleetandthunder: 'Slydda og þruma',
  lightsnowandthunder: 'Snjókoma og þruma',
  snowandthunder: 'Snjókoma og þruma',
}

export function symbolToLabel(code) {
  return SYMBOL_LABELS[code] ?? code.replace(/_/g, ' ')
}

const CARDINALS = ['N', 'NA', 'A', 'SA', 'S', 'SV', 'V', 'NV']

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
    windSpeed: Math.round(windMs * 10) / 10,
    windDir: degToCardinal(d.wind_from_direction),
    precip: next1?.details?.precipitation_amount ?? 0,
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
