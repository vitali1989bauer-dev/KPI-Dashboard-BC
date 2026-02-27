import { TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { getTopKpis, type KpiCard } from '../data/mockData'
import { useFilters } from '../FilterContext'

function KpiCardComponent({ kpi }: { kpi: KpiCard }) {
  const statusColors = {
    positive: 'text-positive',
    negative: 'text-negative',
    warning: 'text-warning',
    neutral: 'text-primary',
  }

  const statusBg = {
    positive: 'bg-positive/10',
    negative: 'bg-negative/10',
    warning: 'bg-warning/10',
    neutral: 'bg-primary/10',
  }

  const StatusIcon =
    kpi.status === 'positive'
      ? TrendingUp
      : kpi.status === 'negative'
        ? TrendingDown
        : Minus

  const ChangeIcon =
    kpi.change !== undefined && kpi.change >= 0 ? ArrowUpRight : ArrowDownRight

  return (
    <div className="bg-card rounded-xl border border-border p-5 card-hover group">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-[13px] font-semibold text-text-secondary leading-tight pr-2">
          {kpi.title}
        </h3>
        <div className={`p-1.5 rounded-lg ${statusBg[kpi.status]}`}>
          <StatusIcon className={`w-4 h-4 ${statusColors[kpi.status]}`} />
        </div>
      </div>

      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-2xl font-bold text-text-primary">
          {typeof kpi.value === 'number'
            ? kpi.value > 0 && kpi.id !== 'actual-sco' && kpi.id !== 'volume-forecast' && kpi.id !== 'market-price-index'
              ? `+${kpi.value}`
              : kpi.value.toLocaleString('de-DE', { minimumFractionDigits: 1 })
            : kpi.value}
        </span>
        <span className="text-sm text-text-muted font-medium">{kpi.unit}</span>
      </div>

      {kpi.change !== undefined && (
        <div className="flex items-center gap-1.5">
          <div
            className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
              kpi.change >= 0
                ? 'text-positive bg-positive/10'
                : 'text-negative bg-negative/10'
            }`}
          >
            <ChangeIcon className="w-3 h-3" />
            {kpi.change >= 0 ? '+' : ''}
            {kpi.change}%
          </div>
          <span className="text-xs text-text-muted">{kpi.changeLabel}</span>
        </div>
      )}

      {kpi.subtitle && (
        <p className="text-xs text-text-muted mt-2">{kpi.subtitle}</p>
      )}
    </div>
  )
}

export default function TopKPIs() {
  const { filters } = useFilters()
  const kpis = getTopKpis(filters)
  const hero = kpis[0]
  const vsLy = kpis[1]
  const vsPl = kpis[2]
  const vsTgt = kpis[3]

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-text-primary">Top KPIs Overview</h2>
        <p className="text-sm text-text-secondary mt-1">
          Chocolate raw materials — key performance indicators at a glance
        </p>
      </div>

      {/* Main KPI - Actual SCO/MT */}
      <div className="mb-6">
        <div className="relative overflow-hidden bg-gradient-to-br from-[#3a1f14] via-primary to-[#4a2a1a] rounded-2xl p-7 text-white shadow-lg shadow-primary/15">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gold/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl" />

          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-accent-light/70 mb-2">Actual SCO/MT</p>
              <p className="text-5xl font-bold tracking-tight">{(hero.value as number).toFixed(1)}</p>
              <p className="text-sm text-white/50 mt-1.5 font-medium">&euro;/MT &middot; {filters.timePeriod}</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3.5 text-center border border-white/10">
                <p className="text-[11px] text-white/50 mb-1 font-medium uppercase tracking-wide">vs Last Year</p>
                <p className="text-xl font-bold">{(vsLy.value as number) >= 0 ? '+' : ''}{(vsLy.value as number).toFixed(1)}</p>
                <p className={`text-xs font-semibold mt-0.5 ${(vsLy.change ?? 0) >= 0 ? 'text-positive' : 'text-negative'}`}>{(vsLy.change ?? 0) >= 0 ? '+' : ''}{vsLy.change}%</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3.5 text-center border border-white/10">
                <p className="text-[11px] text-white/50 mb-1 font-medium uppercase tracking-wide">vs Plan</p>
                <p className="text-xl font-bold">{(vsPl.value as number) >= 0 ? '+' : ''}{(vsPl.value as number).toFixed(1)}</p>
                <p className={`text-xs font-semibold mt-0.5 ${(vsPl.change ?? 0) >= 0 ? 'text-positive' : 'text-negative'}`}>{(vsPl.change ?? 0) >= 0 ? '+' : ''}{vsPl.change}%</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3.5 text-center border border-white/10">
                <p className="text-[11px] text-white/50 mb-1 font-medium uppercase tracking-wide">vs Target</p>
                <p className="text-xl font-bold">{(vsTgt.value as number) >= 0 ? '+' : ''}{(vsTgt.value as number).toFixed(1)}</p>
                <p className={`text-xs font-semibold mt-0.5 ${(vsTgt.change ?? 0) >= 0 ? 'text-positive' : 'text-negative'}`}>{(vsTgt.change ?? 0) >= 0 ? '+' : ''}{vsTgt.change}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.slice(4).map((kpi) => (
          <KpiCardComponent key={kpi.id} kpi={kpi} />
        ))}
      </div>
    </div>
  )
}
