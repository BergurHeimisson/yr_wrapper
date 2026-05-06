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
