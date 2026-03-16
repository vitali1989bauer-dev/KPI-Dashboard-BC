import { useMemo } from 'react'
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
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { getScatterData, scatterCorridors, type ScatterPoint } from '../data/mockData'
import { useFilters } from '../FilterContext'

const SEGMENT_COLORS: Record<string, string> = {
  'Arable Farming': '#173B7A',
  'Specialty Crops': '#1a8754',
  'Horticulture': '#d49a1a',
  'Industrial': '#667885',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.[0]) return null
  const d = payload[0].payload as ScatterPoint
  const TrendIcon = d.trend === 'up' ? TrendingUp : d.trend === 'down' ? TrendingDown : Minus
  const trendColor = d.trend === 'up' ? 'text-positive' : d.trend === 'down' ? 'text-negative' : 'text-text-muted'

  return (
    <div className="bg-white border border-border rounded-xl shadow-lg p-3.5 text-sm min-w-[200px]">
      <p className="font-bold text-text-primary mb-1.5">{d.name}</p>
      <div className="space-y-1 text-text-secondary">
        <p>Segment: <span className="font-semibold">{d.segment}</span></p>
        <p>Volume: <span className="font-mono font-semibold">{d.volume.toLocaleString()} MT</span></p>
        <p>Price: <span className="font-mono font-semibold">&euro;{d.pricePerMT.toFixed(1)} /MT</span></p>
        <p>Margin: <span className="font-mono font-semibold">{d.marginPct.toFixed(1)}%</span></p>
        <div className="flex items-center gap-1 pt-1 border-t border-border mt-1">
          <TrendIcon className={`w-3.5 h-3.5 ${trendColor}`} />
          <span className={`font-semibold ${trendColor}`}>
            {d.trend === 'up' ? 'Growing' : d.trend === 'down' ? 'Declining' : 'Stable'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function ScatterAnalysis() {
  const { filters } = useFilters()
  const data = useMemo(() => getScatterData(filters), [filters])

  const segments = [...new Set(data.map(d => d.segment))]
  const grouped = segments.map(seg => ({
    segment: seg,
    points: data.filter(d => d.segment === seg),
  }))

  const aboveTarget = data.filter(d => d.pricePerMT >= scatterCorridors.targetPrice).length
  const inCorridor = data.filter(d => d.pricePerMT < scatterCorridors.targetPrice && d.pricePerMT >= scatterCorridors.limitPrice).length
  const belowLimit = data.filter(d => d.pricePerMT < scatterCorridors.limitPrice).length
  const avgPrice = data.reduce((s, d) => s + d.pricePerMT, 0) / data.length
  const totalVol = data.reduce((s, d) => s + d.volume, 0)

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-text-primary">Customer Portfolio Analysis</h2>
        <p className="text-sm text-text-secondary mt-1">
          Volume vs. price positioning — each dot represents one customer account
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-card rounded-xl border border-border p-5 card-hover">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">Customers</p>
          <p className="text-2xl font-bold text-text-primary">{data.length}</p>
          <p className="text-xs text-text-muted mt-1">active accounts</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 card-hover">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">Avg. Price</p>
          <p className="text-2xl font-bold text-primary">&euro;{avgPrice.toFixed(0)}/MT</p>
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

      {/* Scatter Chart */}
      <div className="bg-card rounded-xl border border-border p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
            Volume (MT) vs. Price (&euro;/MT) — Bubble size = Margin %
          </h3>
          <div className="flex items-center gap-4">
            {segments.map(seg => (
              <div key={seg} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: SEGMENT_COLORS[seg] ?? '#667885' }} />
                <span className="text-xs text-text-muted font-medium">{seg}</span>
              </div>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={480}>
          <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#d5dbe3" />
            <XAxis
              type="number"
              dataKey="volume"
              name="Volume"
              tick={{ fontSize: 12, fill: '#4a5568' }}
              axisLine={{ stroke: '#d5dbe3' }}
              tickLine={false}
              tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
              label={{ value: 'Volume (MT)', position: 'insideBottom', offset: -10, fontSize: 12, fill: '#667885' }}
            />
            <YAxis
              type="number"
              dataKey="pricePerMT"
              name="Price"
              tick={{ fontSize: 12, fill: '#4a5568' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `€${v}`}
              label={{ value: 'Price (€/MT)', angle: -90, position: 'insideLeft', offset: 10, fontSize: 12, fill: '#667885' }}
              domain={[200, 420]}
            />
            <ZAxis type="number" dataKey="marginPct" range={[120, 600]} name="Margin" />
            <Tooltip content={<CustomTooltip />} />

            {/* Target corridor band */}
            <ReferenceArea
              y1={scatterCorridors.targetPrice}
              y2={420}
              fill="#1a8754"
              fillOpacity={0.04}
              label={{ value: 'Above Target', position: 'insideTopRight', fontSize: 11, fill: '#1a8754' }}
            />
            <ReferenceArea
              y1={scatterCorridors.limitPrice}
              y2={scatterCorridors.targetPrice}
              fill="#d49a1a"
              fillOpacity={0.04}
              label={{ value: 'Corridor', position: 'insideTopRight', fontSize: 11, fill: '#d49a1a' }}
            />
            <ReferenceArea
              y1={200}
              y2={scatterCorridors.limitPrice}
              fill="#c43e3e"
              fillOpacity={0.04}
              label={{ value: 'Below Limit', position: 'insideTopRight', fontSize: 11, fill: '#c43e3e' }}
            />
            <ReferenceLine y={scatterCorridors.targetPrice} stroke="#1a8754" strokeDasharray="8 4" strokeWidth={1.5} />
            <ReferenceLine y={scatterCorridors.limitPrice} stroke="#c43e3e" strokeDasharray="8 4" strokeWidth={1.5} />

            {grouped.map(g => (
              <Scatter
                key={g.segment}
                name={g.segment}
                data={g.points}
                fill={SEGMENT_COLORS[g.segment] ?? '#667885'}
                fillOpacity={0.7}
                stroke={SEGMENT_COLORS[g.segment] ?? '#667885'}
                strokeWidth={1}
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Customer Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
            Customer Detail — sorted by volume
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-bg-warm">
                <th className="text-left px-5 py-3 text-xs font-semibold text-text-muted uppercase">Customer</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-text-muted uppercase">Segment</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-text-muted uppercase">Volume (MT)</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-text-muted uppercase">Price (&euro;/MT)</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-text-muted uppercase">Margin %</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-text-muted uppercase">Vol. Share</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-text-muted uppercase">Trend</th>
              </tr>
            </thead>
            <tbody>
              {[...data].sort((a, b) => b.volume - a.volume).map((d, idx) => {
                const TrendIcon = d.trend === 'up' ? TrendingUp : d.trend === 'down' ? TrendingDown : Minus
                const trendColor = d.trend === 'up' ? 'text-positive' : d.trend === 'down' ? 'text-negative' : 'text-text-muted'
                const priceZone = d.pricePerMT >= scatterCorridors.targetPrice
                  ? 'text-positive'
                  : d.pricePerMT >= scatterCorridors.limitPrice
                    ? 'text-warning'
                    : 'text-negative'
                return (
                  <tr key={d.name} className={`border-t border-border hover:bg-bg-warm/50 transition-colors ${idx % 2 === 0 ? '' : 'bg-bg/50'}`}>
                    <td className="px-5 py-3 text-sm font-semibold text-text-primary">{d.name}</td>
                    <td className="px-5 py-3 text-sm text-text-secondary">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: SEGMENT_COLORS[d.segment] }} />
                        {d.segment}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-right font-mono text-text-primary">{d.volume.toLocaleString()}</td>
                    <td className={`px-5 py-3 text-sm text-right font-mono font-semibold ${priceZone}`}>{d.pricePerMT.toFixed(1)}</td>
                    <td className="px-5 py-3 text-sm text-right font-mono text-text-primary">{d.marginPct.toFixed(1)}%</td>
                    <td className="px-5 py-3 text-sm text-right font-mono text-text-muted">{((d.volume / totalVol) * 100).toFixed(1)}%</td>
                    <td className="px-5 py-3 text-center">
                      <TrendIcon className={`w-4 h-4 ${trendColor} inline`} />
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
