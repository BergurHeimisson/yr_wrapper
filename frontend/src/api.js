const BASE = '/yr-api/compact'

export async function fetchWeather(lat, lon) {
  const res = await fetch(`${BASE}?lat=${lat}&lon=${lon}`)
  if (!res.ok) throw new Error(`yr.no ${res.status}: ${res.statusText}`)
  return res.json()
}
