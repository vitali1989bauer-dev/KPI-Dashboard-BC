import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
// Icons removed — cleaner PowerBI-style cards
import { getOverviewKpis, getRealizationHeatmap, getTopActionItems, getInsightCards, getCellTransactionCount, getTransactionCount, LOW_N_THRESHOLD } from '../data/mockData'
import { useFilters } from '../FilterContext'

function KpiCard({ kpi, txn }: { kpi: ReturnType<typeof getOverviewKpis>[0]; txn?: { isLowN: boolean; isSuppressed: boolean; count: number } }) {
  const subtitleColor = {
    positive: 'text-positive',
    negative: 'text-negative',
    neutral: 'text-text-muted',
  }

  const isLowN = txn?.isLowN ?? false
  const isSuppressed = txn?.isSuppressed ?? false

  return (
    <div className={`bg-card rounded-lg border border-border p-4 card-hover relative ${isLowN ? 'opacity-55' : ''}`}>
      <p className="text-[11px] font-medium text-text-muted uppercase tracking-wide mb-1">{kpi.label}</p>
      <p className={`text-2xl font-bold ${isSuppressed ? 'text-text-muted' : kpi.status === 'negative' ? 'text-negative' : kpi.status === 'positive' ? 'text-positive' : 'text-text-primary'}`}>
        {isSuppressed ? '—' : kpi.value}
      </p>
      <p className={`text-xs mt-1 ${isLowN ? 'text-text-muted' : subtitleColor[kpi.status]}`}>
        {isSuppressed ? 'Insufficient data' : kpi.subtitle}
      </p>
      {isLowN && !isSuppressed && (
        <span className="absolute top-2 right-2 px-1 py-0.5 rounded bg-bg-warm text-[9px] font-medium text-text-muted">n={txn?.count}</span>
      )}
    </div>
  )
}

function HeatmapCell({ value, txnCount, onClick }: { value: number; txnCount: { isLowN: boolean; isSuppressed: boolean; count: number }; onClick: () => void }) {
  const bg = txnCount.isSuppressed
    ? 'bg-bg-warm text-text-muted'
    : txnCount.isLowN
      ? value >= 85 ? 'bg-positive/40 text-white' : value >= 80 ? 'bg-warning/40 text-white' : 'bg-negative/40 text-white'
      : value >= 85 ? 'bg-positive text-white' : value >= 80 ? 'bg-warning text-white' : 'bg-negative text-white'

  return (
    <td className="px-2 py-2 text-center">
      <button
        onClick={onClick}
        className={`inline-block px-3 py-1.5 rounded-lg text-sm font-bold cursor-pointer hover:ring-2 hover:ring-accent/50 transition-all relative ${bg}`}
        title={txnCount.isLowN ? `n=${txnCount.count} — low sample` : `n=${txnCount.count}`}
      >
        {txnCount.isSuppressed ? '—' : `${value}%`}
        {txnCount.isLowN && !txnCount.isSuppressed && (
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-text-muted border border-white" title="Low sample size" />
        )}
      </button>
    </td>
  )
}

export default function Overview() {
  const { filters } = useFilters()
  const navigate = useNavigate()
  const kpis = useMemo(() => getOverviewKpis(filters), [filters])
  const heatmap = useMemo(() => getRealizationHeatmap(filters), [filters])
  const actionItems = useMemo(() => getTopActionItems(filters), [filters])
  const insights = useMemo(() => getInsightCards(filters), [filters])
  const globalTxn = useMemo(() => getTransactionCount(filters), [filters])

  const cellsBelow80 = heatmap.cells.filter(c => c.value < 80).length

  return (
    <div>
      {/* KPI Cards */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.id} kpi={kpi} txn={globalTxn} />
        ))}
      </div>

      {/* Main content: Heatmap + Action Items side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Heatmap — 2 cols */}
        <div className="lg:col-span-2 bg-card rounded-lg border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-text-primary">
                Realization Rate — Sub-Segment &times; Material Category
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                Concentration view: where is price pressure highest? Click cell to drill to Parts page.
              </p>
            </div>
            {cellsBelow80 > 0 && (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold text-negative bg-negative/10">
                {cellsBelow80} cells below 80%
              </span>
            )}
          </div>
          <div className="p-4 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left px-2 py-2 text-xs font-semibold text-text-muted" />
                  {heatmap.subSegments.map(sub => (
                    <th key={sub} className="px-2 py-2 text-xs font-semibold text-text-muted text-center">{sub}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {heatmap.categories.map((cat, ci) => (
                  <tr key={cat}>
                    <td className="px-2 py-2 text-xs font-semibold text-text-secondary whitespace-nowrap">{cat}</td>
                    {heatmap.subSegments.map((sub, si) => {
                      const cell = heatmap.cells.find(c => c.subSegment === sub && c.category === cat)
                      const cellTxn = getCellTransactionCount(filters, ci, si)
                      return (
                        <HeatmapCell
                          key={`${cat}-${sub}`}
                          value={cell?.value ?? 0}
                          txnCount={cellTxn}
                          onClick={() => navigate('/parts-deep-dive')}
                        />
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center gap-5 mt-3 px-2 text-xs text-text-muted">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-positive inline-block" /> &ge;85% On target</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-warning inline-block" /> 80–84% Watch</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-negative inline-block" /> &lt;80% Action required</span>
              <span className="flex items-center gap-1.5 ml-2 pl-2 border-l border-border"><span className="w-2 h-2 rounded-full bg-text-muted inline-block" /> Low sample (n&lt;{LOW_N_THRESHOLD})</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-bg-warm inline-block border border-border" /> Suppressed (n&lt;5)</span>
            </div>
          </div>
        </div>

        {/* Top Action Items */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-bold text-text-primary">Top Price Action Items</h3>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold text-accent bg-accent/10">
              {actionItems.length} items
            </span>
          </div>
          <div className="px-5 py-3 text-xs text-text-muted">
            Ranked by revenue impact of closing realization gap
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-bg-warm">
                <th className="text-left px-4 py-2 text-[10px] font-semibold text-text-muted uppercase">Part Family</th>
                <th className="text-center px-2 py-2 text-[10px] font-semibold text-text-muted uppercase">Cat.</th>
                <th className="text-right px-3 py-2 text-[10px] font-semibold text-text-muted uppercase">Real.%</th>
                <th className="text-right px-3 py-2 text-[10px] font-semibold text-text-muted uppercase">Gap</th>
                <th className="text-right px-4 py-2 text-[10px] font-semibold text-text-muted uppercase">Rev. Impact</th>
              </tr>
            </thead>
            <tbody>
              {actionItems.map((item, idx) => (
                <tr key={item.partFamily} className={`border-t border-border ${idx % 2 === 0 ? '' : 'bg-bg/50'}`}>
                  <td className="px-4 py-2.5 text-sm font-semibold text-text-primary">{item.partFamily}</td>
                  <td className="px-2 py-2.5 text-center">
                    <span className="inline-block px-2 py-0.5 rounded bg-accent/15 text-accent text-xs font-bold">{item.category}</span>
                  </td>
                  <td className="px-3 py-2.5 text-sm text-right font-mono text-negative font-semibold">{item.realizationPct}%</td>
                  <td className="px-3 py-2.5 text-sm text-right font-mono text-negative font-semibold">{item.gapPp}pp</td>
                  <td className="px-4 py-2.5 text-sm text-right font-mono text-text-primary">{item.revenueImpact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insight Cards — clean, minimal */}
      <div className="grid grid-cols-3 gap-4">
        {insights.map((insight, idx) => {
          const borderColor = insight.severity === 'warning' ? 'border-l-negative' : insight.severity === 'info' ? 'border-l-primary' : 'border-l-positive'

          return (
            <div key={idx} className={`bg-card rounded-lg border border-border border-l-3 ${borderColor} p-3.5`}>
              <p className="text-[13px] font-semibold text-text-primary leading-snug mb-1">{insight.title}</p>
              <p className="text-xs text-text-secondary leading-relaxed">{insight.description}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
