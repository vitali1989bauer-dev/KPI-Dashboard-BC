import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { getVolumeDeepDiveData, getCostDeepDiveData } from '../data/mockData'
import { useFilters } from '../FilterContext'
import InfoTooltip from '../components/InfoTooltip'

export default function Operations() {
  const { filters } = useFilters()
  const volumeData = getVolumeDeepDiveData(filters)
  const costData = getCostDeepDiveData(filters)

  // Volume summary
  const totalActualVol = volumeData.reduce((sum, d) => sum + d.actual, 0)
  const totalForecast = volumeData.reduce((sum, d) => sum + d.forecast, 0)
  const fulfillment = ((totalActualVol / totalForecast) * 100).toFixed(1)

  // Cost summary
  const totalActualCost = costData.reduce((sum, d) => sum + d.actual, 0)
  const totalBudget = costData.reduce((sum, d) => sum + d.budget, 0)
  const totalVariance = totalActualCost - totalBudget
  const totalVariancePct = ((totalVariance / totalBudget) * 100).toFixed(1)

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-text-primary">
          Operations
          <InfoTooltip text="Operational overview combining volume fulfillment tracking against forecast and last year, with cost efficiency analysis across all production and distribution categories." />
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          Volume fulfillment and cost efficiency across production &amp; distribution
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-xl border border-border p-5 card-hover">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">Total Volume</p>
          <p className="text-2xl font-bold text-text-primary">{(totalActualVol / 1000).toFixed(1)}k MT</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 card-hover">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">Forecast Fulfillment</p>
          <p className={`text-2xl font-bold ${Number(fulfillment) >= 95 ? 'text-positive' : Number(fulfillment) >= 90 ? 'text-warning' : 'text-negative'}`}>
            {fulfillment}%
          </p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 card-hover">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">Total Cost</p>
          <p className="text-2xl font-bold text-text-primary">{totalActualCost.toFixed(1)} M&euro;</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 card-hover">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">Cost Variance vs Budget</p>
          <div className="flex items-center gap-2">
            <p className={`text-2xl font-bold ${totalVariance > 0 ? 'text-negative' : 'text-positive'}`}>
              {totalVariance > 0 ? '+' : ''}{totalVariancePct}%
            </p>
            {totalVariance > 0
              ? <ArrowUpRight className="w-5 h-5 text-negative" />
              : <ArrowDownRight className="w-5 h-5 text-positive" />}
          </div>
        </div>
      </div>

      {/* Side-by-side Charts */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* LEFT: Volume Trend Line Chart */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-sm font-semibold text-text-secondary mb-4 uppercase tracking-wide">
            Monthly Volume Trend (MT)
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={volumeData}>
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

        {/* RIGHT: Cost Horizontal Bar Chart */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-sm font-semibold text-text-secondary mb-4 uppercase tracking-wide">
            Cost by Category (M&euro;) — Actual vs Budget
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={costData} layout="vertical" barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d5dbe3" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12, fill: '#4a5568' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${v}M\u20AC`} />
              <YAxis type="category" dataKey="category" tick={{ fontSize: 11, fill: '#4a5568' }} axisLine={false} tickLine={false} width={130} />
              <Tooltip
                formatter={(value) => [`${Number(value).toFixed(1)} M€`]}
                contentStyle={{ borderRadius: '10px', border: '1px solid #d5dbe3', boxShadow: '0 4px 16px rgba(23,59,122,0.08)', fontSize: '13px' }}
              />
              <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '12px' }} iconType="square" iconSize={10} />
              <Bar dataKey="actual" name="Actual" fill="#173B7A" radius={[0, 6, 6, 0]} maxBarSize={24} />
              <Bar dataKey="budget" name="Budget" fill="#b8c2cf" radius={[0, 6, 6, 0]} maxBarSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cost Variance Detail Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">Cost Variance Detail</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-bg-warm">
                <th className="text-left px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Category</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Actual (M&euro;)</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Budget (M&euro;)</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Variance (M&euro;)</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Variance %</th>
              </tr>
            </thead>
            <tbody>
              {costData.map((row, idx) => (
                <tr key={row.category} className={`border-t border-border hover:bg-bg-warm/50 transition-colors ${idx % 2 === 0 ? '' : 'bg-bg/50'}`}>
                  <td className="px-6 py-3.5 text-sm font-semibold text-text-primary">{row.category}</td>
                  <td className="px-6 py-3.5 text-sm text-right font-mono text-text-primary">{row.actual.toFixed(1)}</td>
                  <td className="px-6 py-3.5 text-sm text-right font-mono text-text-primary">{row.budget.toFixed(1)}</td>
                  <td className="px-6 py-3.5 text-sm text-right">
                    <span className={`font-semibold ${row.variance > 0 ? 'text-negative' : 'text-positive'}`}>
                      {row.variance > 0 ? '+' : ''}{row.variance.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-sm text-right">
                    <span className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full text-xs ${
                      row.variancePct > 2 ? 'bg-red-50 text-negative' :
                      row.variancePct > 0 ? 'bg-amber-50 text-warning' :
                      'bg-emerald-50 text-positive'
                    }`}>
                      {row.variancePct > 0 ? '+' : ''}{row.variancePct.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
              {/* Total Row */}
              <tr className="border-t-2 border-border bg-bg-warm/70 font-bold">
                <td className="px-6 py-3.5 text-sm font-bold text-text-primary">Total</td>
                <td className="px-6 py-3.5 text-sm text-right font-mono font-bold text-text-primary">{totalActualCost.toFixed(1)}</td>
                <td className="px-6 py-3.5 text-sm text-right font-mono font-bold text-text-primary">{totalBudget.toFixed(1)}</td>
                <td className="px-6 py-3.5 text-sm text-right">
                  <span className={`font-bold ${totalVariance > 0 ? 'text-negative' : 'text-positive'}`}>
                    {totalVariance > 0 ? '+' : ''}{totalVariance.toFixed(1)}
                  </span>
                </td>
                <td className="px-6 py-3.5 text-sm text-right">
                  <span className={`font-bold ${Number(totalVariancePct) > 0 ? 'text-negative' : 'text-positive'}`}>
                    {Number(totalVariancePct) > 0 ? '+' : ''}{totalVariancePct}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
