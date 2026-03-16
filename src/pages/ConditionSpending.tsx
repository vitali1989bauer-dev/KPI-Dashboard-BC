import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { getConditionSpendingData } from '../data/mockData'
import { useFilters } from '../FilterContext'
import { TrendingUp, TrendingDown } from 'lucide-react'

export default function ConditionSpending() {
  const { filters } = useFilters()
  const data = getConditionSpendingData(filters)

  const totalActual = data.reduce((sum, d) => sum + d.actual, 0)
  const totalLY = data.reduce((sum, d) => sum + d.lastYear, 0)
  const changePct = (((totalActual - totalLY) / totalLY) * 100).toFixed(1)
  const isUp = totalActual > totalLY

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-text-primary">Condition Spending</h2>
        <p className="text-sm text-text-secondary mt-1">
          Monthly comparison of condition spending — Actual vs Last Year
        </p>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-xl border border-border p-5 card-hover">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">
            Total Actual ({filters.timePeriod})
          </p>
          <p className="text-2xl font-bold text-text-primary">{totalActual.toFixed(1)} M&euro;</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 card-hover">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">
            Total Last Year
          </p>
          <p className="text-2xl font-bold text-text-primary">{totalLY.toFixed(1)} M&euro;</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 card-hover">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">
            Change vs LY
          </p>
          <div className="flex items-center gap-2">
            <p className={`text-2xl font-bold ${isUp ? 'text-negative' : 'text-positive'}`}>
              {isUp ? '+' : ''}{changePct}%
            </p>
            {isUp ? <TrendingUp className="w-5 h-5 text-negative" /> : <TrendingDown className="w-5 h-5 text-positive" />}
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-sm font-semibold text-text-secondary mb-4 uppercase tracking-wide">
          Monthly Condition Spending (M&euro;)
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#dde1e8" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#4a5568' }} axisLine={{ stroke: '#dde1e8' }} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#4a5568' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${v}M€`} />
            <Tooltip
              formatter={(value) => [`${Number(value).toFixed(1)} M€`]}
              contentStyle={{ borderRadius: '10px', border: '1px solid #dde1e8', boxShadow: '0 4px 16px rgba(26,31,46,0.08)', fontSize: '13px' }}
            />
            <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '12px' }} iconType="square" iconSize={10} />
            <Bar dataKey="actual" name="Actual" fill="#d41e25" radius={[6, 6, 0, 0]} maxBarSize={36} />
            <Bar dataKey="lastYear" name="Last Year" fill="#c5cbd6" radius={[6, 6, 0, 0]} maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
