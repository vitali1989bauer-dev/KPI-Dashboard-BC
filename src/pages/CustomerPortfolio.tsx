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
import { getPartFamilyScatter, getPartsDeepDiveKpis, type PartFamilyPoint } from '../data/mockData'
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

export default function PartsDeepDive() {
  const { filters } = useFilters()
  const data = useMemo(() => getPartFamilyScatter(filters), [filters])
  const kpis = useMemo(() => getPartsDeepDiveKpis(filters), [filters])

  const categories = [...new Set(data.map(d => d.category))]
  const grouped = categories.map(cat => ({
    category: cat,
    points: data.filter(d => d.category === cat),
  }))

  return (
    <div>
      {/* Sub-tabs */}
      <div className="flex items-center gap-1 mb-6">
        <button className="px-4 py-2 rounded-lg text-sm font-semibold bg-accent text-white">
          Margin vs. Realization
        </button>
        <button className="px-4 py-2 rounded-lg text-sm font-medium text-text-muted hover:bg-bg-warm transition-colors cursor-pointer border border-border">
          Discount Variance
        </button>
        <button className="px-4 py-2 rounded-lg text-sm font-medium text-text-muted hover:bg-bg-warm transition-colors cursor-pointer border border-border">
          Priority Matrix
        </button>
        <button className="px-4 py-2 rounded-lg text-sm font-medium text-text-muted hover:bg-bg-warm transition-colors cursor-pointer border border-border">
          Part Detail
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {kpis.map((kpi) => (
          <div key={kpi.label} className={`bg-card rounded-xl border border-border border-t-3 ${kpi.status === 'negative' ? 'border-t-negative' : kpi.status === 'positive' ? 'border-t-positive' : 'border-t-primary'} p-5 card-hover`}>
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide mb-1">{kpi.label}</p>
            <p className={`text-3xl font-bold ${kpi.status === 'negative' ? 'text-negative' : kpi.status === 'positive' ? 'text-positive' : 'text-primary'}`}>
              {kpi.value}
            </p>
            <p className="text-xs text-text-muted mt-1">{kpi.subtitle}</p>
          </div>
        ))}
      </div>

      {/* Scatter Chart */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-text-primary">
              Gross Margin vs. Realization Rate — Part Family Level
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Bubble = revenue volume. Same category, very different positions = pricing inconsistency signal. Hover/click a bubble to drill to Part Detail.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold text-primary bg-primary/10">
            {data.length} part families
          </span>
        </div>

        {/* Legend */}
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
            <XAxis
              type="number"
              dataKey="realizationPct"
              name="Realization"
              tick={{ fontSize: 11, fill: COLORS.axisText }}
              axisLine={{ stroke: COLORS.grid }}
              tickLine={false}
              tickFormatter={(v: number) => `${v}%`}
              domain={[55, 100]}
              label={{ value: 'Realization Rate (% of segment target price)', position: 'insideBottom', offset: -15, fontSize: 11, fill: COLORS.muted }}
            />
            <YAxis
              type="number"
              dataKey="marginPct"
              name="Margin"
              tick={{ fontSize: 11, fill: COLORS.axisText }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `${v}%`}
              domain={[5, 70]}
              label={{ value: 'Gross Margin %', angle: -90, position: 'insideLeft', offset: 0, fontSize: 11, fill: COLORS.muted }}
            />
            <ZAxis type="number" dataKey="revenue" range={[80, 800]} name="Revenue" />
            <Tooltip content={<CustomTooltip />} />

            {/* Quadrant labels */}
            <ReferenceArea
              x1={55} x2={75} y1={25} y2={70}
              fill="transparent"
              label={{ value: 'Low Real. / High Margin\n→ Price discipline gap', position: 'center', fontSize: 9, fill: '#1a8754' }}
            />
            <ReferenceArea
              x1={85} x2={100} y1={25} y2={70}
              fill="transparent"
              label={{ value: 'High Real. / High Margin\n✓ Sweet spot', position: 'center', fontSize: 9, fill: '#1a8754' }}
            />
            <ReferenceArea
              x1={55} x2={75} y1={5} y2={25}
              fill="transparent"
              label={{ value: '⚠ Low Real. / Low Margin\n→ Urgent review', position: 'center', fontSize: 9, fill: '#c43e3e' }}
            />
            <ReferenceArea
              x1={85} x2={100} y1={5} y2={25}
              fill="transparent"
              label={{ value: 'High Real. / Low Margin\n→ Cost review', position: 'center', fontSize: 9, fill: '#667885' }}
            />

            {/* 25% margin floor */}
            <ReferenceLine y={25} stroke="#c43e3e" strokeDasharray="8 4" strokeWidth={1} label={{ value: 'Margin floor 25%', position: 'right', fontSize: 10, fill: '#c43e3e' }} />

            {grouped.map(g => (
              <Scatter
                key={g.category}
                name={g.category}
                data={g.points}
                fill={CATEGORY_COLORS[g.category] ?? COLORS.muted}
                fillOpacity={0.7}
                stroke={CATEGORY_COLORS[g.category] ?? COLORS.muted}
                strokeWidth={1}
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
