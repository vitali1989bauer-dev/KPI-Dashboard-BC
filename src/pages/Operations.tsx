import { useMemo, useState } from 'react'
import {
  BarChart,
  Bar,
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'
import { getYoYByCategory, getCostVsPriceData, getTrendKpis, getMonthlyTrend, get3YearTrajectory, getTransactionCount, LOW_N_THRESHOLD } from '../data/mockData'
import { useFilters } from '../FilterContext'

type TabId = 'yoy' | 'trajectory' | 'monthly'

export default function Trends() {
  const { filters } = useFilters()
  const [activeTab, setActiveTab] = useState<TabId>('yoy')
  const yoyData = useMemo(() => getYoYByCategory(filters), [filters])
  const costVsPrice = useMemo(() => getCostVsPriceData(filters), [filters])
  const kpis = useMemo(() => getTrendKpis(filters), [filters])
  const monthlyData = useMemo(() => getMonthlyTrend(filters), [filters])
  const trajectoryData = useMemo(() => get3YearTrajectory(filters), [filters])
  const txn = useMemo(() => getTransactionCount(filters), [filters])

  const tabs: { id: TabId; label: string }[] = [
    { id: 'yoy', label: 'Year-on-Year' },
    { id: 'trajectory', label: '3-Year Trajectory' },
    { id: 'monthly', label: 'Monthly Detail' },
  ]

  return (
    <div>
      {/* Sub-tabs */}
      <div className="flex items-center gap-1 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-accent text-white'
                : 'text-text-muted hover:bg-bg-warm border border-border'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        {kpis.map((kpi) => {
          const accentBorder = {
            red: 'border-t-negative',
            blue: 'border-t-primary',
            green: 'border-t-positive',
            amber: 'border-t-warning',
          }
          return (
            <div key={kpi.label} className={`bg-card rounded-xl border border-border border-t-3 ${accentBorder[kpi.accentColor]} p-5 card-hover ${txn.isLowN ? 'opacity-60' : ''}`}>
              <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide mb-1">{kpi.label}</p>
              <p className={`text-3xl font-bold ${txn.isSuppressed ? 'text-text-muted' : kpi.status === 'negative' ? 'text-negative' : kpi.status === 'positive' ? 'text-positive' : 'text-primary'}`}>
                {txn.isSuppressed ? '—' : kpi.value}
              </p>
              <p className="text-xs text-text-muted mt-1">{txn.isSuppressed ? 'Insufficient data' : kpi.subtitle}</p>
              {txn.isLowN && !txn.isSuppressed && (
                <span className="text-[9px] font-bold text-text-muted bg-bg-warm px-1.5 py-0.5 rounded border border-border mt-1 inline-block">n={txn.count}</span>
              )}
            </div>
          )
        })}
      </div>

      {/* TAB: Year-on-Year */}
      {activeTab === 'yoy' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-text-primary">Realization YoY — by Material Category</h3>
                <p className="text-xs text-text-muted mt-0.5">2025 vs. 2026 YTD. Cat. 200 erosion most severe.</p>
              </div>
              <ResponsiveContainer width="100%" height={380}>
                <BarChart data={yoyData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d5dbe3" vertical={false} />
                  <XAxis dataKey="category" tick={{ fontSize: 12, fill: '#4a5568' }} axisLine={{ stroke: '#d5dbe3' }} tickLine={false} />
                  <YAxis domain={[70, 100]} tick={{ fontSize: 11, fill: '#4a5568' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${v}%`} />
                  <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`]} contentStyle={{ borderRadius: '10px', border: '1px solid #d5dbe3', fontSize: '13px' }} />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} iconType="square" iconSize={10} />
                  <Bar dataKey="priorYear" name="FY 2025" fill="#b8c2cf" radius={[6, 6, 0, 0]} maxBarSize={36} />
                  <Bar dataKey="currentYear" name="YTD 2026" fill="#4a6fa5" radius={[6, 6, 0, 0]} maxBarSize={36}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    label={(props: any) => {
                      const { x, y, width, index } = props as { x: number; y: number; width: number; index: number }
                      if (index == null || !yoyData[index]) return null
                      const delta = yoyData[index].deltaPp
                      if (Math.abs(delta) < 1) return null
                      return (
                        <text x={(x ?? 0) + (width ?? 0) / 2} y={(y ?? 0) - 8} textAnchor="middle" fill={delta >= 0 ? '#1a8754' : '#c43e3e'} fontSize={11} fontWeight={600}>
                          {delta >= 0 ? '+' : ''}{delta.toFixed(0)}pp
                        </text>
                      )
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-card rounded-xl border border-border p-6">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-text-primary">Cost vs. Price Inflation — Margin Squeeze</h3>
                <p className="text-xs text-text-muted mt-0.5">Cost increases outpacing price. Shaded area = cumulative margin erosion.</p>
              </div>
              <ResponsiveContainer width="100%" height={380}>
                <AreaChart data={costVsPrice} margin={{ top: 10, right: 20, bottom: 5, left: 10 }}>
                  <defs>
                    <linearGradient id="marginGap" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#c43e3e" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="#c43e3e" stopOpacity={0.03} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d5dbe3" vertical={false} />
                  <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#4a5568' }} axisLine={{ stroke: '#d5dbe3' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#4a5568' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${v >= 0 ? '+' : ''}${v}%`} domain={[-1, 6]} />
                  <Tooltip formatter={(value) => [`${Number(value) >= 0 ? '+' : ''}${Number(value).toFixed(1)}%`]} contentStyle={{ borderRadius: '10px', border: '1px solid #d5dbe3', fontSize: '13px' }} />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} iconType="circle" iconSize={8} />
                  <Area type="monotone" dataKey="costChange" name="Cost" stroke="#c43e3e" strokeWidth={2} fill="url(#marginGap)" dot={{ r: 4, fill: '#c43e3e', strokeWidth: 0 }} />
                  <Line type="monotone" dataKey="priceChange" name="Price" stroke="#173B7A" strokeWidth={2} dot={{ r: 4, fill: '#173B7A', strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
              <div className="mt-2 text-center">
                <span className="text-xs text-negative font-semibold">
                  Cumulative gap: ~{(costVsPrice[costVsPrice.length - 1]?.costChange - costVsPrice[costVsPrice.length - 1]?.priceChange).toFixed(1)}pp over 3 years
                </span>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border border-l-4 border-l-negative p-4">
            <p className="text-sm font-bold text-text-primary">Cost outpacing price increases for 3rd consecutive year</p>
            <p className="text-xs text-text-secondary mt-1">
              Requires above-inflation price increases in next price round. Cat. 200–300 priority — lowest realization, highest cost sensitivity.
            </p>
          </div>
        </>
      )}

      {/* TAB: 3-Year Trajectory */}
      {activeTab === 'trajectory' && (
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-text-primary">3-Year Realization & Margin Trajectory</h3>
            <p className="text-xs text-text-muted mt-0.5">Monthly view Jan 2024 – Sep 2026. Shows long-term pricing trend and seasonal patterns.</p>
          </div>
          <ResponsiveContainer width="100%" height={420}>
            <LineChart data={trajectoryData} margin={{ top: 10, right: 30, bottom: 5, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d5dbe3" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 9, fill: '#4a5568' }}
                axisLine={{ stroke: '#d5dbe3' }}
                tickLine={false}
                interval={2}
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 11, fill: '#4a5568' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `${v}%`}
                domain={[75, 90]}
                label={{ value: 'Realization %', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: '#4a5568' } }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 11, fill: '#4a5568' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `${v}%`}
                domain={[30, 45]}
                label={{ value: 'Margin %', angle: 90, position: 'insideRight', style: { fontSize: 10, fill: '#4a5568' } }}
              />
              <Tooltip
                formatter={(value, name) => [`${Number(value).toFixed(1)}%`, name]}
                contentStyle={{ borderRadius: '10px', border: '1px solid #d5dbe3', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} iconType="circle" iconSize={8} />
              <Line yAxisId="left" type="monotone" dataKey="realizationPct" name="Realization" stroke="#c8960c" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              <Line yAxisId="right" type="monotone" dataKey="marginPct" name="Margin" stroke="#173B7A" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-3 flex items-center gap-6 text-xs text-text-muted">
            <span>Realization trending <span className="font-semibold text-negative">downward</span> (-2.3pp over 3 years)</span>
            <span>Margin <span className="font-semibold text-positive">stable</span> despite realization decline — cost control offsetting</span>
          </div>
        </div>
      )}

      {/* TAB: Monthly Detail */}
      {activeTab === 'monthly' && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-bold text-text-primary">Monthly KPI Detail — {filters.timePeriod} 2026</h3>
            <p className="text-xs text-text-muted mt-0.5">Month-by-month realization, margin, and last-mile discount tracking.</p>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-bg-warm">
                <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-text-muted uppercase">Month</th>
                <th className="text-right px-4 py-2.5 text-[10px] font-semibold text-text-muted uppercase">Realization %</th>
                <th className="text-right px-4 py-2.5 text-[10px] font-semibold text-text-muted uppercase">Margin %</th>
                <th className="text-right px-4 py-2.5 text-[10px] font-semibold text-text-muted uppercase">Last-Mile %</th>
                <th className="text-center px-3 py-2.5 text-[10px] font-semibold text-text-muted uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((row, idx) => {
                const realStatus = row.realizationPct >= 83 ? 'positive' : row.realizationPct >= 80 ? 'warning' : 'negative'
                return (
                  <tr key={row.month} className={`border-t border-border ${idx % 2 === 0 ? '' : 'bg-bg/50'}`}>
                    <td className="px-5 py-2.5 text-sm font-semibold text-text-primary">{row.month} 2026</td>
                    <td className={`px-4 py-2.5 text-sm text-right font-mono font-semibold ${realStatus === 'negative' ? 'text-negative' : realStatus === 'warning' ? 'text-warning' : 'text-positive'}`}>
                      {row.realizationPct.toFixed(1)}%
                    </td>
                    <td className="px-4 py-2.5 text-sm text-right font-mono text-text-primary">{row.marginPct.toFixed(1)}%</td>
                    <td className="px-4 py-2.5 text-sm text-right font-mono text-negative">{row.lastMilePct.toFixed(1)}%</td>
                    <td className="px-3 py-2.5 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        realStatus === 'positive' ? 'bg-positive/10 text-positive' :
                        realStatus === 'warning' ? 'bg-warning/10 text-warning' :
                        'bg-negative/10 text-negative'
                      }`}>
                        {realStatus === 'positive' ? 'On target' : realStatus === 'warning' ? 'Watch' : 'Action'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div className="px-5 py-3 border-t border-border text-xs text-text-muted">
            {txn.isLowN && <span className="mr-3">⚠ Low transaction volume ({txn.count}) — monthly figures may be volatile. n&lt;{LOW_N_THRESHOLD} threshold.</span>}
            In PowerBI: this maps to a matrix visual with conditional formatting on Realization %.
          </div>
        </div>
      )}
    </div>
  )
}
