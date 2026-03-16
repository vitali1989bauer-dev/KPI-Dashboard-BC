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
import { TrendingUp, TrendingDown, Minus, AlertTriangle, XCircle, Bell, X } from 'lucide-react'
import { getScatterData, scatterCorridors, getPriceAlerts, type ScatterPoint, type PriceAlert } from '../data/mockData'
import { useFilters } from '../FilterContext'
import InfoTooltip from '../components/InfoTooltip'

const SEGMENT_COLORS: Record<string, string> = {
  'Arable Farming': '#173B7A',
  'Specialty Crops': '#1a8754',
  'Horticulture': '#d49a1a',
  'Industrial': '#667885',
}

const COLORS = {
  primary: '#173B7A',
  positive: '#1a8754',
  warning: '#d49a1a',
  negative: '#c43e3e',
  grey: '#667885',
  grid: '#d5dbe3',
  axisText: '#4a5568',
  muted: '#667885',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomScatterTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: ScatterPoint }> }) {
  if (!active || !payload?.[0]) return null
  const d = payload[0].payload
  const TrendIcon = d.trend === 'up' ? TrendingUp : d.trend === 'down' ? TrendingDown : Minus
  const trendColor = d.trend === 'up' ? COLORS.positive : d.trend === 'down' ? COLORS.negative : COLORS.muted

  return (
    <div className="bg-white border border-border rounded-xl shadow-lg p-3.5 text-sm min-w-[220px]">
      <p className="font-bold text-text-primary mb-1.5">{d.name}</p>
      <div className="space-y-1 text-text-secondary">
        <p>Archetype: <span className="font-semibold">{d.archetype}</span></p>
        <p>Segment: <span className="font-semibold">{d.segment}</span></p>
        <p>Volume: <span className="font-mono font-semibold">{d.volume.toLocaleString()} MT</span></p>
        <p>Price: <span className="font-mono font-semibold">&euro;{d.pricePerMT.toFixed(1)} /MT</span></p>
        <p>Margin: <span className="font-mono font-semibold">{d.marginPct.toFixed(1)}%</span></p>
        <p>Target Margin: <span className="font-mono font-semibold">{d.targetMargin.toFixed(1)}%</span></p>
        <div className="flex items-center gap-1 pt-1 border-t border-border mt-1">
          <TrendIcon className="w-3.5 h-3.5" style={{ color: trendColor }} />
          <span className="font-semibold" style={{ color: trendColor }}>
            {d.trend === 'up' ? 'Growing' : d.trend === 'down' ? 'Declining' : 'Stable'}
          </span>
        </div>
      </div>
    </div>
  )
}

function PriceZoneBadge({ price }: { price: number }) {
  if (price >= scatterCorridors.targetPrice) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full text-positive bg-positive/10">
        Above Target
      </span>
    )
  }
  if (price >= scatterCorridors.limitPrice) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full text-warning bg-warning/10">
        In Corridor
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full text-negative bg-negative/10">
      Below Limit
    </span>
  )
}

function MarginZoneBadge({ margin }: { margin: number }) {
  if (margin >= scatterCorridors.targetMargin) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full text-positive bg-positive/10">
        Above Target
      </span>
    )
  }
  if (margin >= scatterCorridors.limitMargin) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full text-warning bg-warning/10">
        In Corridor
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full text-negative bg-negative/10">
      Below Limit
    </span>
  )
}

function AlertBanner({ alerts }: { alerts: PriceAlert[] }) {
  const [isOpen, setIsOpen] = useState(true)
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())

  const visibleAlerts = alerts.filter(a => !dismissedIds.has(a.id))
  const criticalCount = visibleAlerts.filter(a => a.severity === 'critical').length
  const warningCount = visibleAlerts.filter(a => a.severity === 'warning').length

  if (visibleAlerts.length === 0) return null

  function dismissAlert(id: string) {
    setDismissedIds(prev => new Set(prev).add(id))
  }

  return (
    <div className="mb-6">
      {/* Header bar */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-t-xl border border-border bg-negative/5 hover:bg-negative/8 transition-colors cursor-pointer"
        style={{ borderColor: criticalCount > 0 ? COLORS.negative : COLORS.warning }}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="w-5 h-5" style={{ color: criticalCount > 0 ? COLORS.negative : COLORS.warning }} />
            <span
              className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold text-white rounded-full px-1"
              style={{ backgroundColor: criticalCount > 0 ? COLORS.negative : COLORS.warning }}
            >
              {visibleAlerts.length}
            </span>
          </div>
          <span className="text-sm font-semibold text-text-primary">
            Price Alerts
          </span>
          {criticalCount > 0 && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: COLORS.negative }}>
              {criticalCount} critical
            </span>
          )}
          {warningCount > 0 && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: COLORS.warning }}>
              {warningCount} warning
            </span>
          )}
        </div>
        <span className="text-xs text-text-muted">{isOpen ? 'Collapse' : 'Expand'}</span>
      </button>

      {/* Collapsible body */}
      {isOpen && (
        <div
          className="border border-t-0 rounded-b-xl divide-y divide-border overflow-hidden"
          style={{ borderColor: criticalCount > 0 ? COLORS.negative : COLORS.warning }}
        >
          {visibleAlerts.map(alert => {
            const isCritical = alert.severity === 'critical'
            const bgColor = isCritical ? 'rgba(196, 62, 62, 0.06)' : 'rgba(212, 154, 26, 0.06)'
            const accentColor = isCritical ? COLORS.negative : COLORS.warning
            const Icon = isCritical ? XCircle : AlertTriangle

            return (
              <div
                key={alert.id}
                className="flex items-center justify-between px-4 py-3 gap-4"
                style={{ backgroundColor: bgColor }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className="w-4 h-4 flex-shrink-0" style={{ color: accentColor }} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-text-primary">
                      {alert.customer} &mdash; {alert.product}
                    </p>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Actual: <span className="font-mono font-semibold" style={{ color: accentColor }}>&euro;{alert.actualPrice.toFixed(1)}</span>
                      {' '} vs Limit: <span className="font-mono font-semibold">&euro;{alert.limitPrice.toFixed(1)}</span>
                      {' '}&middot;{' '}
                      <span className="font-semibold" style={{ color: accentColor }}>{alert.deviation.toFixed(1)}%</span> deviation
                      {' '}&middot;{' '}
                      <span className="text-text-muted">{alert.timestamp}</span>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => dismissAlert(alert.id)}
                  className="p-1 rounded-lg hover:bg-black/5 transition-colors flex-shrink-0"
                  title="Dismiss alert"
                >
                  <X className="w-4 h-4 text-text-muted" />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function CustomerPortfolio() {
  const { filters } = useFilters()
  const data = useMemo(() => getScatterData(filters), [filters])
  const alerts = useMemo(() => getPriceAlerts(filters), [filters])

  const segments = [...new Set(data.map(d => d.segment))]
  const grouped = segments.map(seg => ({
    segment: seg,
    points: data.filter(d => d.segment === seg),
  }))

  const aboveTarget = data.filter(d => d.pricePerMT >= scatterCorridors.targetPrice).length
  const inCorridor = data.filter(d => d.pricePerMT < scatterCorridors.targetPrice && d.pricePerMT >= scatterCorridors.limitPrice).length
  const belowLimit = data.filter(d => d.pricePerMT < scatterCorridors.limitPrice).length
  const avgPrice = data.length > 0 ? data.reduce((s, d) => s + d.pricePerMT, 0) / data.length : 0

  const sortedData = useMemo(() => [...data].sort((a, b) => b.volume - a.volume), [data])

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-text-primary">
          Customer Portfolio
          <InfoTooltip text="Merged view of customer price positioning and margin corridors. Each bubble represents one customer account, sized by margin percentage." />
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          Volume vs. price &amp; margin positioning — corridor analysis with target and limit thresholds
        </p>
      </div>

      {/* Alert Banner */}
      <AlertBanner alerts={alerts} />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-card rounded-xl border border-border p-5 card-hover">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">Customers</p>
          <p className="text-2xl font-bold text-text-primary">{data.length}</p>
          <p className="text-xs text-text-muted mt-1">active accounts</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 card-hover">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">Avg. Price</p>
          <p className="text-2xl font-bold" style={{ color: COLORS.primary }}>&euro;{avgPrice.toFixed(0)}/MT</p>
          <p className="text-xs text-text-muted mt-1">across portfolio</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 card-hover">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">Above Target</p>
          <p className="text-2xl font-bold text-positive">{aboveTarget}</p>
          <p className="text-xs text-text-muted mt-1">&ge; &euro;{scatterCorridors.targetPrice}/MT</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 card-hover">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">In Corridor</p>
          <p className="text-2xl font-bold text-warning">{inCorridor}</p>
          <p className="text-xs text-text-muted mt-1">between target &amp; limit</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 card-hover">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">Below Limit</p>
          <p className="text-2xl font-bold text-negative">{belowLimit}</p>
          <p className="text-xs text-text-muted mt-1">&lt; &euro;{scatterCorridors.limitPrice}/MT</p>
        </div>
      </div>

      {/* Two Scatter Charts Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* LEFT: Volume vs Price Corridor */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
              Volume vs. Price Corridor
              <InfoTooltip text="Y-axis shows price per MT, X-axis shows volume. Green zone is above target, yellow is the corridor, red is below limit." />
            </h3>
            <div className="flex items-center gap-4 mt-2">
              {segments.map(seg => (
                <div key={seg} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: SEGMENT_COLORS[seg] ?? COLORS.grey }} />
                  <span className="text-xs text-text-muted font-medium">{seg}</span>
                </div>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={420}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
              <XAxis
                type="number"
                dataKey="volume"
                name="Volume"
                tick={{ fontSize: 11, fill: COLORS.axisText }}
                axisLine={{ stroke: COLORS.grid }}
                tickLine={false}
                tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
                label={{ value: 'Volume (MT)', position: 'insideBottom', offset: -10, fontSize: 11, fill: COLORS.muted }}
              />
              <YAxis
                type="number"
                dataKey="pricePerMT"
                name="Price"
                tick={{ fontSize: 11, fill: COLORS.axisText }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `€${v}`}
                label={{ value: 'Price (€/MT)', angle: -90, position: 'insideLeft', offset: 10, fontSize: 11, fill: COLORS.muted }}
                domain={[200, 420]}
              />
              <ZAxis type="number" dataKey="marginPct" range={[100, 500]} name="Margin" />
              <Tooltip content={<CustomScatterTooltip />} />

              <ReferenceArea
                y1={scatterCorridors.targetPrice}
                y2={420}
                fill={COLORS.positive}
                fillOpacity={0.04}
                label={{ value: 'Above Target', position: 'insideTopRight', fontSize: 10, fill: COLORS.positive }}
              />
              <ReferenceArea
                y1={scatterCorridors.limitPrice}
                y2={scatterCorridors.targetPrice}
                fill={COLORS.warning}
                fillOpacity={0.04}
                label={{ value: 'Corridor', position: 'insideTopRight', fontSize: 10, fill: COLORS.warning }}
              />
              <ReferenceArea
                y1={200}
                y2={scatterCorridors.limitPrice}
                fill={COLORS.negative}
                fillOpacity={0.04}
                label={{ value: 'Below Limit', position: 'insideTopRight', fontSize: 10, fill: COLORS.negative }}
              />
              <ReferenceLine y={scatterCorridors.targetPrice} stroke={COLORS.positive} strokeDasharray="8 4" strokeWidth={1.5} />
              <ReferenceLine y={scatterCorridors.limitPrice} stroke={COLORS.negative} strokeDasharray="8 4" strokeWidth={1.5} />

              {grouped.map(g => (
                <Scatter
                  key={g.segment}
                  name={g.segment}
                  data={g.points}
                  fill={SEGMENT_COLORS[g.segment] ?? COLORS.grey}
                  fillOpacity={0.7}
                  stroke={SEGMENT_COLORS[g.segment] ?? COLORS.grey}
                  strokeWidth={1}
                />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* RIGHT: Volume vs Margin Corridor */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
              Volume vs. Margin Corridor
              <InfoTooltip text="Y-axis shows margin %, X-axis shows volume. Green zone is above target margin, yellow is the corridor, red is below limit margin." />
            </h3>
            <div className="flex items-center gap-4 mt-2">
              {segments.map(seg => (
                <div key={seg} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: SEGMENT_COLORS[seg] ?? COLORS.grey }} />
                  <span className="text-xs text-text-muted font-medium">{seg}</span>
                </div>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={420}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
              <XAxis
                type="number"
                dataKey="volume"
                name="Volume"
                tick={{ fontSize: 11, fill: COLORS.axisText }}
                axisLine={{ stroke: COLORS.grid }}
                tickLine={false}
                tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
                label={{ value: 'Volume (MT)', position: 'insideBottom', offset: -10, fontSize: 11, fill: COLORS.muted }}
              />
              <YAxis
                type="number"
                dataKey="marginPct"
                name="Margin"
                tick={{ fontSize: 11, fill: COLORS.axisText }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `${v}%`}
                label={{ value: 'Margin (%)', angle: -90, position: 'insideLeft', offset: 10, fontSize: 11, fill: COLORS.muted }}
                domain={[10, 45]}
              />
              <ZAxis type="number" dataKey="marginPct" range={[100, 500]} name="Margin" />
              <Tooltip content={<CustomScatterTooltip />} />

              <ReferenceArea
                y1={scatterCorridors.targetMargin}
                y2={45}
                fill={COLORS.positive}
                fillOpacity={0.04}
                label={{ value: 'Above Target', position: 'insideTopRight', fontSize: 10, fill: COLORS.positive }}
              />
              <ReferenceArea
                y1={scatterCorridors.limitMargin}
                y2={scatterCorridors.targetMargin}
                fill={COLORS.warning}
                fillOpacity={0.04}
                label={{ value: 'Corridor', position: 'insideTopRight', fontSize: 10, fill: COLORS.warning }}
              />
              <ReferenceArea
                y1={10}
                y2={scatterCorridors.limitMargin}
                fill={COLORS.negative}
                fillOpacity={0.04}
                label={{ value: 'Below Limit', position: 'insideTopRight', fontSize: 10, fill: COLORS.negative }}
              />
              <ReferenceLine y={scatterCorridors.targetMargin} stroke={COLORS.positive} strokeDasharray="8 4" strokeWidth={1.5} />
              <ReferenceLine y={scatterCorridors.limitMargin} stroke={COLORS.negative} strokeDasharray="8 4" strokeWidth={1.5} />

              {grouped.map(g => (
                <Scatter
                  key={g.segment}
                  name={g.segment}
                  data={g.points}
                  fill={SEGMENT_COLORS[g.segment] ?? COLORS.grey}
                  fillOpacity={0.7}
                  stroke={SEGMENT_COLORS[g.segment] ?? COLORS.grey}
                  strokeWidth={1}
                />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Customer Detail Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
            Customer Detail — sorted by volume ({data.length} accounts)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-bg-warm">
                <th className="text-left px-5 py-3 text-xs font-semibold text-text-muted uppercase">Customer</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-text-muted uppercase">Archetype</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-text-muted uppercase">Segment</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-text-muted uppercase">Volume (MT)</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-text-muted uppercase">Price (&euro;/MT)</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-text-muted uppercase">Margin %</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-text-muted uppercase">Price Zone</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-text-muted uppercase">Margin Zone</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-text-muted uppercase">Trend</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((d, idx) => {
                const TrendIcon = d.trend === 'up' ? TrendingUp : d.trend === 'down' ? TrendingDown : Minus
                const trendColor = d.trend === 'up' ? COLORS.positive : d.trend === 'down' ? COLORS.negative : COLORS.muted
                return (
                  <tr
                    key={d.name}
                    className={`border-t border-border hover:bg-bg-warm/50 transition-colors ${idx % 2 === 0 ? '' : 'bg-bg/50'}`}
                  >
                    <td className="px-5 py-3 text-sm font-semibold text-text-primary">{d.name}</td>
                    <td className="px-5 py-3 text-sm text-text-secondary">{d.archetype}</td>
                    <td className="px-5 py-3 text-sm text-text-secondary">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: SEGMENT_COLORS[d.segment] }} />
                        {d.segment}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-right font-mono text-text-primary">{d.volume.toLocaleString()}</td>
                    <td className="px-5 py-3 text-sm text-right font-mono font-semibold text-text-primary">&euro;{d.pricePerMT.toFixed(1)}</td>
                    <td className="px-5 py-3 text-sm text-right font-mono text-text-primary">{d.marginPct.toFixed(1)}%</td>
                    <td className="px-5 py-3 text-center"><PriceZoneBadge price={d.pricePerMT} /></td>
                    <td className="px-5 py-3 text-center"><MarginZoneBadge margin={d.marginPct} /></td>
                    <td className="px-5 py-3 text-center">
                      <TrendIcon className="w-4 h-4 inline" style={{ color: trendColor }} />
                    </td>
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
