import { useMemo, useState } from 'react'
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
  ZAxis,
} from 'recharts'
import { getPartFamilyScatter, getPartsDeepDiveKpis, getDiscountVariance, getPriorityMatrix, getTransactionCount, LOW_N_THRESHOLD, type PartFamilyPoint } from '../data/mockData'
import { useFilters } from '../FilterContext'

const CATEGORY_COLORS: Record<string, string> = {
  'Cat 500': '#1a8754',
  'Cat 300-400': '#173B7A',
  'Cat 200': '#c43e3e',
  'Cat 100': '#667885',
}

const COLORS = {
  grid: '#d5dbe3',
  axisText: '#4a5568',
  muted: '#667885',
}

const QUADRANT_COLORS: Record<string, string> = {
  'quick-win': '#c43e3e',
  'strategic': '#c8960c',
  'monitor': '#173B7A',
  'low-priority': '#667885',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: PartFamilyPoint }> }) {
  if (!active || !payload?.[0]) return null
  const d = payload[0].payload
  return (
    <div className="bg-white border border-border rounded-xl shadow-lg p-3.5 text-sm min-w-[200px]">
      <p className="font-bold text-text-primary mb-1">{d.name}</p>
      <div className="space-y-0.5 text-text-secondary text-xs">
        <p>Category: <span className="font-semibold">{d.category}</span></p>
        <p>Realization: <span className="font-mono font-semibold">{d.realizationPct.toFixed(1)}%</span></p>
        <p>Margin: <span className="font-mono font-semibold">{d.marginPct.toFixed(1)}%</span></p>
        <p>Revenue: <span className="font-mono font-semibold">&pound;{d.revenue}k</span></p>
      </div>
    </div>
  )
}

type TabId = 'scatter' | 'discount' | 'priority' | 'detail'

export default function PartsDeepDive() {
  const { filters } = useFilters()
  const [activeTab, setActiveTab] = useState<TabId>('scatter')
  const data = useMemo(() => getPartFamilyScatter(filters), [filters])
  const kpis = useMemo(() => getPartsDeepDiveKpis(filters), [filters])
  const discountData = useMemo(() => getDiscountVariance(filters), [filters])
  const priorityData = useMemo(() => getPriorityMatrix(filters), [filters])
  const txn = useMemo(() => getTransactionCount(filters), [filters])

  const categories = [...new Set(data.map(d => d.category))]
  const grouped = categories.map(cat => ({
    category: cat,
    points: data.filter(d => d.category === cat),
  }))

  const tabs: { id: TabId; label: string }[] = [
    { id: 'scatter', label: 'Margin vs. Realization' },
    { id: 'discount', label: 'Discount Variance' },
    { id: 'priority', label: 'Priority Matrix' },
    { id: 'detail', label: 'Part Detail' },
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
      <div className="grid grid-cols-4 gap-4 mb-6">
        {kpis.map((kpi) => (
          <div key={kpi.label} className={`bg-card rounded-xl border border-border border-t-3 ${kpi.status === 'negative' ? 'border-t-negative' : kpi.status === 'positive' ? 'border-t-positive' : 'border-t-primary'} p-5 card-hover ${txn.isLowN ? 'opacity-60' : ''}`}>
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide mb-1">{kpi.label}</p>
            <p className={`text-3xl font-bold ${txn.isSuppressed ? 'text-text-muted' : kpi.status === 'negative' ? 'text-negative' : kpi.status === 'positive' ? 'text-positive' : 'text-primary'}`}>
              {txn.isSuppressed ? '—' : kpi.value}
            </p>
            <p className="text-xs text-text-muted mt-1">{txn.isSuppressed ? 'Insufficient data' : kpi.subtitle}</p>
            {txn.isLowN && !txn.isSuppressed && (
              <span className="text-[9px] font-bold text-text-muted bg-bg-warm px-1.5 py-0.5 rounded border border-border mt-1 inline-block">n={txn.count}</span>
            )}
          </div>
        ))}
      </div>

      {/* TAB: Scatter */}
      {activeTab === 'scatter' && (
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-text-primary">
                Gross Margin vs. Realization Rate — Part Family Level
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                Bubble = revenue volume. Same category, very different positions = pricing inconsistency signal.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold text-primary bg-primary/10">
              {data.length} part families
            </span>
          </div>

          <div className="flex items-center gap-5 mb-4">
            {categories.map(cat => (
              <div key={cat} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[cat] ?? COLORS.muted }} />
                <span className="text-xs text-text-muted font-medium">{cat === 'Cat 300-400' ? 'Cat 300–400' : cat} {cat === 'Cat 500' ? '– Core competence' : cat === 'Cat 200' ? '– Pressure zone' : cat === 'Cat 100' ? '– Standard' : ''}</span>
              </div>
            ))}
            <span className="text-xs text-text-muted ml-3">Bubble size = revenue</span>
          </div>

          <ResponsiveContainer width="100%" height={500}>
            <ScatterChart margin={{ top: 20, right: 40, bottom: 30, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
              <XAxis type="number" dataKey="realizationPct" name="Realization" tick={{ fontSize: 11, fill: COLORS.axisText }} axisLine={{ stroke: COLORS.grid }} tickLine={false} tickFormatter={(v: number) => `${v}%`} domain={[55, 100]} label={{ value: 'Realization Rate (% of segment target price)', position: 'insideBottom', offset: -15, fontSize: 11, fill: COLORS.muted }} />
              <YAxis type="number" dataKey="marginPct" name="Margin" tick={{ fontSize: 11, fill: COLORS.axisText }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${v}%`} domain={[5, 70]} label={{ value: 'Gross Margin %', angle: -90, position: 'insideLeft', offset: 0, fontSize: 11, fill: COLORS.muted }} />
              <ZAxis type="number" dataKey="revenue" range={[80, 800]} name="Revenue" />
              <Tooltip content={<CustomTooltip />} />

              <ReferenceArea x1={55} x2={75} y1={25} y2={70} fill="transparent" label={{ value: 'Low Real. / High Margin\n→ Price discipline gap', position: 'center', fontSize: 9, fill: '#1a8754' }} />
              <ReferenceArea x1={85} x2={100} y1={25} y2={70} fill="transparent" label={{ value: 'High Real. / High Margin\n✓ Sweet spot', position: 'center', fontSize: 9, fill: '#1a8754' }} />
              <ReferenceArea x1={55} x2={75} y1={5} y2={25} fill="#c43e3e" fillOpacity={0.03} label={{ value: '⚠ Low Real. / Low Margin\n→ Urgent review', position: 'center', fontSize: 9, fill: '#c43e3e' }} />
              <ReferenceArea x1={85} x2={100} y1={5} y2={25} fill="transparent" label={{ value: 'High Real. / Low Margin\n→ Cost review', position: 'center', fontSize: 9, fill: '#667885' }} />

              <ReferenceLine y={25} stroke="#c43e3e" strokeDasharray="8 4" strokeWidth={1} label={{ value: 'Margin floor 25%', position: 'right', fontSize: 10, fill: '#c43e3e' }} />

              {grouped.map(g => (
                <Scatter key={g.category} name={g.category} data={g.points} fill={CATEGORY_COLORS[g.category] ?? COLORS.muted} fillOpacity={0.7} stroke={CATEGORY_COLORS[g.category] ?? COLORS.muted} strokeWidth={1} />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* TAB: Discount Variance */}
      {activeTab === 'discount' && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-bold text-text-primary">Discount Variance — Approved vs. Actual</h3>
            <p className="text-xs text-text-muted mt-0.5">Sorted by largest negative variance. Red = authority exceeded.</p>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-bg-warm">
                <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-text-muted uppercase">Part Family</th>
                <th className="text-center px-3 py-2.5 text-[10px] font-semibold text-text-muted uppercase">Category</th>
                <th className="text-right px-3 py-2.5 text-[10px] font-semibold text-text-muted uppercase">Approved</th>
                <th className="text-right px-3 py-2.5 text-[10px] font-semibold text-text-muted uppercase">Actual</th>
                <th className="text-right px-3 py-2.5 text-[10px] font-semibold text-text-muted uppercase">Variance</th>
                <th className="text-center px-3 py-2.5 text-[10px] font-semibold text-text-muted uppercase">Authority</th>
                <th className="text-right px-4 py-2.5 text-[10px] font-semibold text-text-muted uppercase">n</th>
              </tr>
            </thead>
            <tbody>
              {discountData.map((row, idx) => {
                const isLow = row.transactionCount < LOW_N_THRESHOLD
                return (
                  <tr key={row.partFamily} className={`border-t border-border ${idx % 2 === 0 ? '' : 'bg-bg/50'} ${isLow ? 'opacity-50' : ''}`}>
                    <td className="px-5 py-2.5 text-sm font-semibold text-text-primary">{row.partFamily}</td>
                    <td className="px-3 py-2.5 text-center">
                      <span className="px-2 py-0.5 rounded bg-accent/15 text-accent text-xs font-bold">{row.category}</span>
                    </td>
                    <td className="px-3 py-2.5 text-sm text-right font-mono text-text-secondary">{row.approvedDiscount.toFixed(1)}%</td>
                    <td className="px-3 py-2.5 text-sm text-right font-mono font-semibold text-negative">{row.actualDiscount.toFixed(1)}%</td>
                    <td className="px-3 py-2.5 text-sm text-right font-mono font-semibold text-negative">{row.variancePp.toFixed(1)}pp</td>
                    <td className="px-3 py-2.5 text-center">
                      {row.authorityExceeded ? (
                        <span className="px-2 py-0.5 rounded-full bg-negative/10 text-negative text-[10px] font-bold">EXCEEDED</span>
                      ) : (
                        <span className="text-text-muted text-xs">OK</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-right font-mono text-text-muted">
                      {row.transactionCount}
                      {isLow && <span className="ml-1 text-[9px] text-text-muted">⚠</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div className="px-5 py-3 border-t border-border text-xs text-text-muted flex items-center gap-4">
            <span>Rows with n&lt;{LOW_N_THRESHOLD} shown at reduced opacity — interpret with caution</span>
          </div>
        </div>
      )}

      {/* TAB: Priority Matrix */}
      {activeTab === 'priority' && (
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-text-primary">Priority Matrix — Realization Gap vs. Revenue at Risk</h3>
            <p className="text-xs text-text-muted mt-0.5">Quick wins = high gap + high revenue. Focus pricing actions here first.</p>
          </div>

          {/* Quadrant legend */}
          <div className="flex items-center gap-5 mb-5">
            {[
              { q: 'quick-win', label: 'Quick Win (high gap, high rev)' },
              { q: 'strategic', label: 'Strategic (high gap, lower rev)' },
              { q: 'monitor', label: 'Monitor (lower gap, high rev)' },
              { q: 'low-priority', label: 'Low Priority' },
            ].map(({ q, label }) => (
              <div key={q} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: QUADRANT_COLORS[q] }} />
                <span className="text-xs text-text-muted">{label}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {(['quick-win', 'strategic', 'monitor', 'low-priority'] as const).map(quadrant => {
              const items = priorityData.filter(p => p.quadrant === quadrant)
              const labels = { 'quick-win': '🎯 Quick Wins', 'strategic': 'Strategic', 'monitor': 'Monitor', 'low-priority': 'Low Priority' }
              return (
                <div key={quadrant} className={`rounded-xl border p-4 ${quadrant === 'quick-win' ? 'border-negative/30 bg-negative/3' : 'border-border'}`}>
                  <p className="text-xs font-bold text-text-primary mb-2" style={{ color: QUADRANT_COLORS[quadrant] }}>
                    {labels[quadrant]} ({items.length})
                  </p>
                  {items.length === 0 ? (
                    <p className="text-xs text-text-muted">No items</p>
                  ) : (
                    <div className="space-y-1.5">
                      {items.map(item => (
                        <div key={item.partFamily} className="flex items-center justify-between text-xs">
                          <div>
                            <span className="font-semibold text-text-primary">{item.partFamily}</span>
                            <span className="ml-2 px-1.5 py-0.5 rounded bg-accent/10 text-accent text-[10px] font-bold">{item.category}</span>
                          </div>
                          <div className="flex items-center gap-3 text-right">
                            <span className="font-mono text-negative font-semibold">-{item.realizationGapPp}pp</span>
                            <span className="font-mono text-text-secondary">£{item.revenueAtRisk}k</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* TAB: Part Detail */}
      {activeTab === 'detail' && (
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-sm font-bold text-text-primary mb-2">Part Family Detail View</h3>
          <p className="text-xs text-text-muted mb-4">Select a part family from the scatter chart or tables to see detailed price history, discount log, and recommendations.</p>
          <div className="bg-bg-warm rounded-xl border border-border p-8 text-center">
            <p className="text-text-muted text-sm">Click a bubble in "Margin vs. Realization" or a row in other tabs to drill into part-level detail.</p>
            <p className="text-text-muted text-xs mt-2">In PowerBI: this will be a drill-through page triggered by clicking any part family across the report.</p>
          </div>
        </div>
      )}
    </div>
  )
}
