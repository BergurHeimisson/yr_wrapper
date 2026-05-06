const BASE = 'https://api.met.no/weatherapi/locationforecast/2.0/compact'

export async function fetchWeather(lat, lon) {
  const res = await fetch(`${BASE}?lat=${lat}&lon=${lon}`)
  if (!res.ok) throw new Error(`yr.no ${res.status}: ${res.statusText}`)
  return res.json()
}
