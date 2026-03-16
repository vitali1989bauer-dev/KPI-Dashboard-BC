import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { ArrowUpRight, ArrowDownRight, ShieldCheck, AlertTriangle, XCircle } from 'lucide-react'
import { getTargetPriceData, getTargetPriceSummary, type TargetPriceRow } from '../data/mockData'
import { useFilters } from '../FilterContext'

function StatusBadge({ row }: { row: TargetPriceRow }) {
  if (row.actualPrice >= row.targetPrice) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full text-positive bg-positive/10">
        <ShieldCheck className="w-3 h-3" /> Above Target
      </span>
    )
  }
  if (row.actualPrice >= row.limitPrice) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full text-warning bg-warning/10">
        <AlertTriangle className="w-3 h-3" /> In Corridor
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full text-negative bg-negative/10">
      <XCircle className="w-3 h-3" /> Below Limit
    </span>
  )
}

export default function TargetPrices() {
  const { filters } = useFilters()
  const rows = useMemo(() => getTargetPriceData(filters), [filters])
  const summary = useMemo(() => getTargetPriceSummary(rows), [rows])

  // Chart data: aggregate by customer group
  const chartData = useMemo(() => {
    const byCustomer = new Map<string, { target: number; limit: number; actual: number; vol: number }>()
    for (const r of rows) {
      const prev = byCustomer.get(r.customerGroup) ?? { target: 0, limit: 0, actual: 0, vol: 0 }
      prev.target += r.targetPrice * r.volumeMT
      prev.limit += r.limitPrice * r.volumeMT
      prev.actual += r.actualPrice * r.volumeMT
      prev.vol += r.volumeMT
      byCustomer.set(r.customerGroup, prev)
    }
    return Array.from(byCustomer.entries()).map(([name, d]) => ({
      name,
      'Target Price': Math.round(d.target / d.vol * 10) / 10,
      'Limit Price': Math.round(d.limit / d.vol * 10) / 10,
      'Actual Price': Math.round(d.actual / d.vol * 10) / 10,
    }))
  }, [rows])

  const overallAvgTarget = chartData.reduce((s, d) => s + d['Target Price'], 0) / (chartData.length || 1)

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-text-primary">Target & Limit Prices</h2>
        <p className="text-sm text-text-secondary mt-1">
          Price realization by customer group — target corridors vs actuals
        </p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-card rounded-xl border border-border p-5 card-hover">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">Avg. Realization</p>
          <p className={`text-2xl font-bold ${summary.avgRealization >= 95 ? 'text-positive' : summary.avgRealization >= 85 ? 'text-warning' : 'text-negative'}`}>
            {summary.avgRealization}%
          </p>
          <p className="text-xs text-text-muted mt-1">of target price</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 card-hover">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">Above Target</p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-positive">{summary.aboveTarget}</p>
            <ArrowUpRight className="w-5 h-5 text-positive" />
          </div>
          <p className="text-xs text-text-muted mt-1">of {summary.totalRows} positions</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 card-hover">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">In Corridor</p>
          <p className="text-2xl font-bold text-warning">{summary.inCorridor}</p>
          <p className="text-xs text-text-muted mt-1">between target &amp; limit</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 card-hover">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">Below Limit</p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-negative">{summary.belowLimit}</p>
            <ArrowDownRight className="w-5 h-5 text-negative" />
          </div>
          <p className="text-xs text-text-muted mt-1">action required</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 card-hover">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">Revenue at Risk</p>
          <p className="text-2xl font-bold text-negative">{summary.revenueAtRisk} M&euro;</p>
          <p className="text-xs text-text-muted mt-1">from below-limit items</p>
        </div>
      </div>

      {/* Chart: Avg price by customer group */}
      <div className="bg-card rounded-xl border border-border p-6 mb-6">
        <h3 className="text-sm font-semibold text-text-secondary mb-4 uppercase tracking-wide">
          Weighted Avg. Price by Customer Group (&euro;/MT)
        </h3>
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={chartData} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="#dde1e8" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#4a5568' }} axisLine={{ stroke: '#dde1e8' }} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#4a5568' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `€${v}`} />
            <Tooltip
              formatter={(value) => [`€ ${Number(value).toFixed(1)} /MT`]}
              contentStyle={{ borderRadius: '10px', border: '1px solid #dde1e8', boxShadow: '0 4px 16px rgba(26,31,46,0.08)', fontSize: '13px' }}
            />
            <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '12px' }} iconType="square" iconSize={10} />
            <ReferenceLine y={overallAvgTarget} stroke="#d41e25" strokeDasharray="6 3" label={{ value: 'Avg Target', position: 'right', fontSize: 11, fill: '#d41e25' }} />
            <Bar dataKey="Target Price" fill="#1a1f2e" radius={[4, 4, 0, 0]} maxBarSize={32} />
            <Bar dataKey="Actual Price" fill="#00965e" radius={[4, 4, 0, 0]} maxBarSize={32} />
            <Bar dataKey="Limit Price" fill="#e8a317" radius={[4, 4, 0, 0]} maxBarSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detail Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
            Price Position Detail — {rows.length} positions
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-bg-warm">
                <th className="text-left px-5 py-3 text-xs font-semibold text-text-muted uppercase">Customer</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-text-muted uppercase">Product</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-text-muted uppercase">Target (&euro;/MT)</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-text-muted uppercase">Limit (&euro;/MT)</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-text-muted uppercase">Actual (&euro;/MT)</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-text-muted uppercase">Δ vs Target</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-text-muted uppercase">Volume (MT)</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-text-muted uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => {
                const delta = row.actualPrice - row.targetPrice
                const deltaPct = ((delta / row.targetPrice) * 100).toFixed(1)
                return (
                  <tr key={`${row.customerGroup}-${row.product}`} className={`border-t border-border hover:bg-bg-warm/50 transition-colors ${idx % 2 === 0 ? '' : 'bg-bg/50'}`}>
                    <td className="px-5 py-3 text-sm font-semibold text-text-primary">{row.customerGroup}</td>
                    <td className="px-5 py-3 text-sm text-text-secondary">{row.product}</td>
                    <td className="px-5 py-3 text-sm text-right font-mono text-text-primary">{row.targetPrice.toFixed(1)}</td>
                    <td className="px-5 py-3 text-sm text-right font-mono text-text-muted">{row.limitPrice.toFixed(1)}</td>
                    <td className="px-5 py-3 text-sm text-right font-mono font-semibold text-text-primary">{row.actualPrice.toFixed(1)}</td>
                    <td className="px-5 py-3 text-sm text-right">
                      <span className={`font-semibold ${delta >= 0 ? 'text-positive' : 'text-negative'}`}>
                        {delta >= 0 ? '+' : ''}{deltaPct}%
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-right font-mono text-text-primary">{row.volumeMT.toLocaleString()}</td>
                    <td className="px-5 py-3 text-center"><StatusBadge row={row} /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
