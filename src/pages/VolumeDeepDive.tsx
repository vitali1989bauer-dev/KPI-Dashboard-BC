import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { getVolumeDeepDiveData } from '../data/mockData'
import { useFilters } from '../FilterContext'

export default function VolumeDeepDive() {
  const { filters } = useFilters()
  const data = getVolumeDeepDiveData(filters)

  const totalActual = data.reduce((sum, d) => sum + d.actual, 0)
  const totalForecast = data.reduce((sum, d) => sum + d.forecast, 0)
  const fulfillment = ((totalActual / totalForecast) * 100).toFixed(1)

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-text-primary">Volume Deep-dive</h2>
        <p className="text-sm text-text-secondary mt-1">
          K+S product volume trends — Actual vs Forecast vs Last Year
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-xl border border-border p-5 card-hover">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">Total Actual Volume</p>
          <p className="text-2xl font-bold text-text-primary">{(totalActual / 1000).toFixed(1)}k MT</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 card-hover">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">Total Forecast</p>
          <p className="text-2xl font-bold text-text-primary">{(totalForecast / 1000).toFixed(1)}k MT</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 card-hover">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">Forecast Fulfillment</p>
          <p className={`text-2xl font-bold ${Number(fulfillment) >= 95 ? 'text-positive' : Number(fulfillment) >= 90 ? 'text-warning' : 'text-negative'}`}>{fulfillment}%</p>
        </div>
      </div>

      {/* Line Chart */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-sm font-semibold text-text-secondary mb-4 uppercase tracking-wide">
          Monthly Volume Trend (MT)
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#d5dbe3" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#4a5568' }} axisLine={{ stroke: '#d5dbe3' }} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#4a5568' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              formatter={(value) => [`${Number(value).toLocaleString()} MT`]}
              contentStyle={{ borderRadius: '10px', border: '1px solid #d5dbe3', boxShadow: '0 4px 16px rgba(23,59,122,0.08)', fontSize: '13px' }}
            />
            <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '12px' }} iconType="circle" iconSize={8} />
            <Line type="monotone" dataKey="actual" name="Actual" stroke="#173B7A" strokeWidth={2.5} dot={{ r: 4, fill: '#173B7A' }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="forecast" name="Forecast" stroke="#1a8754" strokeWidth={2} strokeDasharray="6 3" dot={{ r: 3, fill: '#1a8754' }} />
            <Line type="monotone" dataKey="lastYear" name="Last Year" stroke="#667885" strokeWidth={1.5} dot={{ r: 3, fill: '#667885' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
