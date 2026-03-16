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
            <CartesianGrid strokeDasharray="3 3" stroke="#e8dfd4" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b5c52' }} axisLine={{ stroke: '#e8dfd4' }} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#6b5c52' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              formatter={(value) => [`${Number(value).toLocaleString()} MT`]}
              contentStyle={{ borderRadius: '10px', border: '1px solid #e8dfd4', boxShadow: '0 4px 16px rgba(44,24,16,0.08)', fontSize: '13px' }}
            />
            <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '12px' }} iconType="circle" iconSize={8} />
            <Line type="monotone" dataKey="actual" name="Actual" stroke="#6b3a2a" strokeWidth={2.5} dot={{ r: 4, fill: '#6b3a2a' }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="forecast" name="Forecast" stroke="#c8956c" strokeWidth={2} strokeDasharray="6 3" dot={{ r: 3, fill: '#c8956c' }} />
            <Line type="monotone" dataKey="lastYear" name="Last Year" stroke="#9b8b7e" strokeWidth={1.5} dot={{ r: 3, fill: '#9b8b7e' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
