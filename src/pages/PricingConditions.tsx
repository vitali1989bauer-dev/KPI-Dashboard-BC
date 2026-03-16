import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown } from 'lucide-react'
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
import { getPricingDeepDiveData, getConditionSpendingData } from '../data/mockData'
import { useFilters } from '../FilterContext'
import InfoTooltip from '../components/InfoTooltip'

export default function PricingConditions() {
  const { filters } = useFilters()
  const pricingData = getPricingDeepDiveData(filters)
  const conditionData = getConditionSpendingData(filters)

  // Pricing summary calculations
  const totalVol = pricingData.reduce((s, r) => s + r.volume, 0)
  const avgPrice = pricingData.reduce((s, r) => s + r.avgPrice * r.volume, 0) / totalVol
  const avgMargin = pricingData.reduce((s, r) => s + r.margin * r.volume, 0) / totalVol

  // Condition spending summary calculations
  const totalActual = conditionData.reduce((sum, d) => sum + d.actual, 0)
  const totalLY = conditionData.reduce((sum, d) => sum + d.lastYear, 0)
  const changePct = ((totalActual - totalLY) / totalLY) * 100
  const isUp = totalActual > totalLY

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-text-primary">
          Pricing &amp; Conditions
          <InfoTooltip text="Covers net price realization across all product categories and condition spending analysis including discounts, rebates, logistics allowances, and promotional conditions." />
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          Net price analysis and condition spending by product category
        </p>
      </div>

      {/* Summary Cards — 4 cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-xl border border-border p-5 card-hover">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">Avg Price / MT</p>
          <p className="text-2xl font-bold text-text-primary">&euro; {avgPrice.toFixed(1)}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 card-hover">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">Avg Margin %</p>
          <p className="text-2xl font-bold text-text-primary">{avgMargin.toFixed(1)}%</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 card-hover">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">Total Condition Spending</p>
          <p className="text-2xl font-bold text-text-primary">{totalActual.toFixed(1)} M&euro;</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 card-hover">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">Change vs LY</p>
          <div className="flex items-center gap-2">
            <p className={`text-2xl font-bold ${isUp ? 'text-negative' : 'text-positive'}`}>
              {isUp ? '+' : ''}{changePct.toFixed(1)}%
            </p>
            {isUp
              ? <TrendingUp className="w-5 h-5 text-negative" />
              : <TrendingDown className="w-5 h-5 text-positive" />}
          </div>
        </div>
      </div>

      {/* Pricing Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
            Product Category Pricing Analysis
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-bg-warm">
                <th className="text-left px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Product</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Avg Price (&euro;/MT)</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Price vs LY</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Margin %</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Margin vs LY</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Volume (MT)</th>
              </tr>
            </thead>
            <tbody>
              {pricingData.map((row, idx) => (
                <tr key={row.segment} className={`border-t border-border hover:bg-bg-warm/50 transition-colors ${idx % 2 === 0 ? '' : 'bg-bg/50'}`}>
                  <td className="px-6 py-3.5 text-sm font-semibold text-text-primary">{row.segment}</td>
                  <td className="px-6 py-3.5 text-sm text-right font-mono text-text-primary">{row.avgPrice.toFixed(1)}</td>
                  <td className="px-6 py-3.5 text-sm text-right">
                    <span className={`inline-flex items-center gap-0.5 font-semibold ${row.priceVsLY >= 0 ? 'text-positive' : 'text-negative'}`}>
                      {row.priceVsLY >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                      {row.priceVsLY >= 0 ? '+' : ''}{row.priceVsLY.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-sm text-right font-mono text-text-primary">{row.margin.toFixed(1)}%</td>
                  <td className="px-6 py-3.5 text-sm text-right">
                    <span className={`inline-flex items-center gap-0.5 font-semibold ${row.marginVsLY >= 0 ? 'text-positive' : 'text-negative'}`}>
                      {row.marginVsLY >= 0 ? '+' : ''}{row.marginVsLY.toFixed(1)}pp
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-sm text-right font-mono text-text-primary">{row.volume.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Condition Spending Bar Chart */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-sm font-semibold text-text-secondary mb-4 uppercase tracking-wide">
          Monthly Condition Spending (M&euro;) — Actual vs Last Year
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={conditionData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#d5dbe3" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#4a5568' }} axisLine={{ stroke: '#d5dbe3' }} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#4a5568' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${v}M\u20AC`} />
            <Tooltip
              formatter={(value) => [`${Number(value).toFixed(1)} M\u20AC`]}
              contentStyle={{ borderRadius: '10px', border: '1px solid #d5dbe3', boxShadow: '0 4px 16px rgba(23,59,122,0.08)', fontSize: '13px' }}
            />
            <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '12px' }} iconType="square" iconSize={10} />
            <Bar dataKey="actual" name="Actual" fill="#173B7A" radius={[6, 6, 0, 0]} maxBarSize={36} />
            <Bar dataKey="lastYear" name="Last Year" fill="#b8c2cf" radius={[6, 6, 0, 0]} maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
