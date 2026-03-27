import { useMemo } from 'react'
import { AlertTriangle, Info, CheckCircle2 } from 'lucide-react'
import { getOverviewKpis, getRealizationHeatmap, getTopActionItems, getInsightCards } from '../data/mockData'
import { useFilters } from '../FilterContext'

function KpiCard({ kpi }: { kpi: ReturnType<typeof getOverviewKpis>[0] }) {
  const accentBorder = {
    red: 'border-t-negative',
    blue: 'border-t-primary',
    green: 'border-t-positive',
    amber: 'border-t-warning',
    grey: 'border-t-accent',
  }
  const subtitleColor = {
    positive: 'text-positive',
    negative: 'text-negative',
    neutral: 'text-text-muted',
  }

  return (
    <div className={`bg-card rounded-xl border border-border border-t-3 ${accentBorder[kpi.accentColor]} p-5 card-hover`}>
      <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide mb-1">{kpi.label}</p>
      <p className={`text-3xl font-bold ${kpi.status === 'negative' ? 'text-negative' : kpi.status === 'positive' ? 'text-positive' : 'text-text-primary'}`}>
        {kpi.value}
      </p>
      <p className={`text-xs mt-1 font-medium ${subtitleColor[kpi.status]}`}>
        {kpi.subtitle}
      </p>
    </div>
  )
}

function HeatmapCell({ value }: { value: number }) {
  const bg = value >= 85 ? 'bg-positive' : value >= 80 ? 'bg-warning' : 'bg-negative'
  return (
    <td className="px-2 py-2 text-center">
      <span className={`inline-block px-3 py-1.5 rounded-lg text-sm font-bold text-white ${bg}`}>
        {value}%
      </span>
    </td>
  )
}

export default function Overview() {
  const { filters } = useFilters()
  const kpis = useMemo(() => getOverviewKpis(filters), [filters])
  const heatmap = useMemo(() => getRealizationHeatmap(filters), [filters])
  const actionItems = useMemo(() => getTopActionItems(filters), [filters])
  const insights = useMemo(() => getInsightCards(filters), [filters])

  const cellsBelow80 = heatmap.cells.filter(c => c.value < 80).length

  return (
    <div>
      {/* KPI Cards */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.id} kpi={kpi} />
        ))}
      </div>

      {/* Main content: Heatmap + Action Items side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Heatmap — 2 cols */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border overflow-hidden">
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
                {heatmap.categories.map(cat => (
                  <tr key={cat}>
                    <td className="px-2 py-2 text-xs font-semibold text-text-secondary whitespace-nowrap">{cat}</td>
                    {heatmap.subSegments.map(sub => {
                      const cell = heatmap.cells.find(c => c.subSegment === sub && c.category === cat)
                      return <HeatmapCell key={`${cat}-${sub}`} value={cell?.value ?? 0} />
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center gap-5 mt-3 px-2 text-xs text-text-muted">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-positive inline-block" /> &ge;85% On target</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-warning inline-block" /> 80–84% Watch</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-negative inline-block" /> &lt;80% Action required</span>
            </div>
          </div>
        </div>

        {/* Top Action Items */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
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

      {/* Insight Cards */}
      <div className="grid grid-cols-3 gap-4">
        {insights.map((insight, idx) => {
          const borderColor = insight.severity === 'warning' ? 'border-l-negative' : insight.severity === 'info' ? 'border-l-primary' : 'border-l-positive'
          const Icon = insight.severity === 'warning' ? AlertTriangle : insight.severity === 'info' ? Info : CheckCircle2
          const iconColor = insight.severity === 'warning' ? 'text-negative' : insight.severity === 'info' ? 'text-primary' : 'text-positive'

          return (
            <div key={idx} className={`bg-card rounded-xl border border-border border-l-4 ${borderColor} p-4`}>
              <div className="flex items-start gap-2 mb-1.5">
                <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${iconColor}`} />
                <h4 className="text-sm font-bold text-text-primary leading-tight">{insight.title}</h4>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed ml-6">{insight.description}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
