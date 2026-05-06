export default function ForecastRow({ date, high, low, condition }) {
  const d = new Date(date + 'T12:00:00Z')
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
