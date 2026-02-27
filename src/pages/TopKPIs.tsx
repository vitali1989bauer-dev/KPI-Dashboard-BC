import { TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { topKpis, type KpiCard } from '../data/mockData'

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
    <div className="bg-card rounded-xl border border-border p-5 hover:shadow-md hover:border-primary/20 transition-all duration-200 group">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-sm font-medium text-text-secondary leading-tight pr-2">
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
            className={`flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded ${
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
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-text-primary">Top KPIs Overview</h2>
        <p className="text-sm text-text-secondary mt-1">
          Key performance indicators at a glance
        </p>
      </div>

      {/* Main KPI - Actual SCO/MT */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-primary to-accent rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/80 mb-1">Actual SCO/MT</p>
              <p className="text-4xl font-bold">142.8</p>
              <p className="text-sm text-white/70 mt-1">€/MT &middot; Current Period</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/15 backdrop-blur-sm rounded-lg px-4 py-3 text-center">
                <p className="text-xs text-white/70 mb-1">vs Last Year</p>
                <p className="text-lg font-bold">+12.4</p>
                <p className="text-xs text-green-300 font-medium">+9.5%</p>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-lg px-4 py-3 text-center">
                <p className="text-xs text-white/70 mb-1">vs PL</p>
                <p className="text-lg font-bold">-3.2</p>
                <p className="text-xs text-red-300 font-medium">-2.2%</p>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-lg px-4 py-3 text-center">
                <p className="text-xs text-white/70 mb-1">vs Target</p>
                <p className="text-lg font-bold">+5.1</p>
                <p className="text-xs text-green-300 font-medium">+3.7%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {topKpis.slice(4).map((kpi) => (
          <KpiCardComponent key={kpi.id} kpi={kpi} />
        ))}
      </div>
    </div>
  )
}
