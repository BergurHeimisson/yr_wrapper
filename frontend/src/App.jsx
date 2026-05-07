import { useEffect, useState } from 'react'
import { House } from 'lucide-react'
import WeatherCard from './components/WeatherCard'
import { fetchWeather } from './api'
import { parseCurrent, parseForecast } from './utils/weather'

const LOCATIONS = [
  { name: 'Reykjavík', lat: 64.1355, lon: -21.8954 },
  { name: 'Vatnsendi', lat: 64.5419, lon: -21.5663 },
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
          <div className="flex items-center gap-2">
            <a href="/" aria-label="Home" className="text-gray-500 hover:text-gray-900 transition-colors">
              <House size={18} />
            </a>
            <h1 className="text-xl font-bold text-gray-900">Veður</h1>
          </div>
          <p className="text-sm text-gray-500">Reykjavík &amp; Vatnsendi</p>
        </div>

        {!data && !error && (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-amber-500 rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
            Gat ekki sótt veðurgögn: {error}
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
