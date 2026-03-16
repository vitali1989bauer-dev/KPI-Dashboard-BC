import { useMemo } from 'react'
import { TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { getTopKpis, getScoTrendData, getProductScoContribution, type KpiCard } from '../data/mockData'
import { useFilters } from '../FilterContext'
import InfoTooltip from '../components/InfoTooltip'

const kpiTooltips: Record<string, string> = {
  'actual-sco': 'Standard Contribution / Metric Ton — the primary profitability measure per unit sold, after deducting variable costs and condition spending from net revenue.',
  'vs-ly': 'Change in SCO/MT compared to the same period last year. Positive = margin improvement year-over-year.',
  'vs-pl': 'Deviation from the planned (budgeted) SCO/MT. Shows how actual profitability compares to the annual operating plan.',
  'vs-target': 'Delta to the stretch target SCO/MT set by management. A positive value means the target is being exceeded.',
  'volume-forecast': 'Percentage of forecasted volume actually delivered. Measures supply chain reliability and demand planning accuracy.',
  'market-price-index': 'Composite index of global potash spot prices (CFR standard grades). Base 100 = prior year average. Source: Argus FMB.',
  'position-valuation': 'Mark-to-market value of open potash purchase positions and input commodity hedges relative to current spot prices.',
  'revenue-leakage': 'Total value of conditions, rebates, discounts, and logistics allowances granted to customers in the selected period.',
}

function KpiCardComponent({ kpi, tooltip }: { kpi: KpiCard; tooltip?: string }) {
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
          {tooltip && <InfoTooltip text={tooltip} />}
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
  const trendData = useMemo(() => getScoTrendData(filters), [filters])
  const productSco = useMemo(() => getProductScoContribution(filters), [filters])

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-text-primary">Top KPIs Overview</h2>
        <p className="text-sm text-text-secondary mt-1">
          Fertilizer &amp; salt products — key performance indicators at a glance
        </p>
      </div>

      {/* Main KPI - Actual SCO/MT */}
      <div className="mb-6">
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0f2654] via-[#173B7A] to-[#0f2654] rounded-2xl p-7 text-white shadow-lg shadow-primary/20 border border-white/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/8 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl" />

          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary-light/80 mb-2">
                Actual SCO/MT
                <InfoTooltip text="Standard Contribution (SCO) per Metric Ton — the key profitability KPI. Calculated as net revenue minus variable production costs, logistics, and condition spending, divided by volume sold." />
              </p>
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
          <KpiCardComponent key={kpi.id} kpi={kpi} tooltip={kpiTooltips[kpi.id]} />
        ))}
      </div>

      {/* SCO/MT 12-Month Trend */}
      <div className="mt-6 bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">SCO/MT — 12 Month Trend</h3>
            <p className="text-xs text-text-muted mt-0.5">Actual vs. Plan (&euro;/MT)</p>
          </div>
          <div className="flex items-center gap-5 text-xs text-text-muted">
            <span className="flex items-center gap-1.5"><span className="w-6 h-[3px] rounded-full bg-primary inline-block" /> Actual</span>
            <span className="flex items-center gap-1.5"><span className="w-6 h-[3px] rounded-full bg-accent inline-block opacity-60" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #667885 0, #667885 4px, transparent 4px, transparent 8px)' }} /> Plan</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={trendData} margin={{ top: 16, right: 12, bottom: 0, left: -12 }}>
            <defs>
              <linearGradient id="scoGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#173B7A" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#173B7A" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#d5dbe3" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#667885' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#667885' }} axisLine={false} tickLine={false} domain={['dataMin - 15', 'dataMax + 10']} tickFormatter={(v: number) => `€${v}`} />
            <Tooltip
              formatter={(value) => [`€ ${Number(value).toFixed(1)} /MT`]}
              contentStyle={{ borderRadius: '10px', border: '1px solid #d5dbe3', boxShadow: '0 4px 16px rgba(23,59,122,0.08)', fontSize: '13px' }}
            />
            <Area
              type="monotone"
              dataKey="plan"
              stroke="#667885"
              strokeWidth={1.5}
              strokeDasharray="6 4"
              fill="none"
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="actual"
              stroke="#173B7A"
              strokeWidth={2.5}
              fill="url(#scoGrad)"
              dot={{ r: 3.5, fill: '#173B7A', stroke: '#fff', strokeWidth: 2 }}
              activeDot={{ r: 5, fill: '#173B7A', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Product SCO Contribution */}
      <div className="mt-6 bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
            Product SCO Contribution
            <InfoTooltip text="Shows each product's contribution to total Standard Contribution. SCO/MT indicates profitability per ton, while Total SCO M€ reflects the absolute value impact. Potash specialties (Patentkali®, Epso Top®) have higher margins but lower volumes." />
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-bg-warm">
                <th className="text-left px-5 py-3 text-xs font-semibold text-text-muted uppercase">Product</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-text-muted uppercase">SCO/MT (&euro;)</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-text-muted uppercase">Volume (MT)</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-text-muted uppercase">Total SCO (M&euro;)</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-text-muted uppercase">Share</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-text-muted uppercase">vs LY</th>
              </tr>
            </thead>
            <tbody>
              {productSco.map((row, idx) => (
                <tr key={row.product} className={`border-t border-border hover:bg-bg-warm/50 transition-colors ${idx % 2 === 0 ? '' : 'bg-bg/50'}`}>
                  <td className="px-5 py-3 text-sm font-semibold text-text-primary">{row.product}</td>
                  <td className="px-5 py-3 text-sm text-right font-mono text-text-primary">{row.scoPerMT.toFixed(1)}</td>
                  <td className="px-5 py-3 text-sm text-right font-mono text-text-secondary">{(row.volumeMT / 1000).toFixed(0)}k</td>
                  <td className="px-5 py-3 text-sm text-right font-mono font-semibold text-text-primary">{row.totalScoM.toFixed(1)}</td>
                  <td className="px-5 py-3 text-sm text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-bg-warm overflow-hidden">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, row.shareOfTotal)}%` }} />
                      </div>
                      <span className="font-mono text-text-secondary">{row.shareOfTotal.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-right">
                    <span className={`inline-flex items-center gap-0.5 font-semibold ${row.vsLY >= 0 ? 'text-positive' : 'text-negative'}`}>
                      {row.vsLY >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                      {row.vsLY >= 0 ? '+' : ''}{row.vsLY.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
