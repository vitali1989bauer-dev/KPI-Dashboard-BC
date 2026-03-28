import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts'
import { getPriceWaterfall, getWaterfallKpis, getLastMileDistribution, getTransactionCount } from '../data/mockData'
import { useFilters } from '../FilterContext'

const TOTAL_COLOR = '#1a2332'
const NEGATIVE_COLOR = '#c43e3e'
const INTERMEDIATE_COLOR = '#667885'
const TARGET_COLOR = '#1a8754'

interface WfPoint {
  name: string
  base: number
  value: number
  displayValue: number
  fill: string
  isIntermediate: boolean
}

function buildWaterfallData(steps: ReturnType<typeof getPriceWaterfall>): WfPoint[] {
  const result: WfPoint[] = []
  let running = 0

  for (const item of steps) {
    if (item.type === 'start') {
      result.push({ name: item.name.replace('\n', ' '), base: 0, value: item.value, displayValue: item.value, fill: TOTAL_COLOR, isIntermediate: false })
      running = item.value
    } else if (item.type === 'end') {
      // Check if this is the final "Net Price" or an intermediate subtotal
      const isFinal = item.name.includes('Net')
      const isIntermediate = !isFinal && item.name !== 'Global List'
      result.push({ name: item.name.replace('\n', ' '), base: 0, value: item.value, displayValue: item.value, fill: isFinal ? TARGET_COLOR : INTERMEDIATE_COLOR, isIntermediate })
      running = item.value
    } else {
      result.push({ name: item.name.replace('\n', ' '), base: running + item.value, value: Math.abs(item.value), displayValue: item.value, fill: NEGATIVE_COLOR, isIntermediate: false })
      running += item.value
    }
  }
  return result
}

function KpiCard({ kpi, txn }: { kpi: ReturnType<typeof getWaterfallKpis>[0]; txn?: { isLowN: boolean; isSuppressed: boolean; count: number } }) {
  const accentBorder = {
    red: 'border-t-negative',
    blue: 'border-t-primary',
    green: 'border-t-positive',
    amber: 'border-t-warning',
    grey: 'border-t-accent',
  }
  const isLowN = txn?.isLowN ?? false
  const isSuppressed = txn?.isSuppressed ?? false

  return (
    <div className={`bg-card rounded-xl border border-border border-t-3 ${accentBorder[kpi.accentColor]} p-5 card-hover ${isLowN ? 'opacity-60' : ''}`}>
      <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide mb-1">{kpi.label}</p>
      <p className={`text-3xl font-bold ${isSuppressed ? 'text-text-muted' : kpi.accentColor === 'red' ? 'text-negative' : kpi.accentColor === 'green' ? 'text-positive' : 'text-text-primary'}`}>
        {isSuppressed ? '—' : kpi.value}
      </p>
      <p className="text-xs text-text-muted mt-1">{isSuppressed ? 'Insufficient data' : kpi.subtitle}</p>
      {isLowN && !isSuppressed && (
        <span className="text-[9px] font-bold text-text-muted bg-bg-warm px-1.5 py-0.5 rounded border border-border mt-1 inline-block">n={txn?.count}</span>
      )}
    </div>
  )
}

export default function PriceWaterfall() {
  const { filters } = useFilters()
  const waterfallSteps = useMemo(() => getPriceWaterfall(filters), [filters])
  const wfData = useMemo(() => buildWaterfallData(waterfallSteps), [waterfallSteps])
  const kpis = useMemo(() => getWaterfallKpis(filters), [filters])
  const lastMile = useMemo(() => getLastMileDistribution(filters), [filters])
  const txn = useMemo(() => getTransactionCount(filters), [filters])

  const yMax = 110
  const targetLine = waterfallSteps.find(s => s.name.includes('Segment'))?.value ?? 90

  return (
    <div>
      {/* KPI Cards */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} kpi={kpi} txn={txn} />
        ))}
      </div>

      {/* Waterfall + Last-Mile side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Waterfall Chart — 2 cols */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-text-primary">
              Price Waterfall — {filters.region} {filters.segment} {filters.subSegment !== 'All Sub-Segments' ? filters.subSegment : ''} · Average Transaction
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Index: Global list = 100. Shows price leakage at each waterfall level.
            </p>
          </div>
          <ResponsiveContainer width="100%" height={380}>
            <BarChart data={wfData} barCategoryGap="14%">
              <CartesianGrid strokeDasharray="3 3" stroke="#d5dbe3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#4a5568' }} axisLine={{ stroke: '#d5dbe3' }} tickLine={false} />
              <YAxis domain={[50, yMax]} tick={{ fontSize: 11, fill: '#4a5568' }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(_value, _name, props) => {
                  const p = (props as { payload: WfPoint }).payload
                  const isTotal = p.fill === TOTAL_COLOR || p.fill === INTERMEDIATE_COLOR || p.fill === TARGET_COLOR
                  return [
                    isTotal ? p.displayValue.toFixed(1) : `${p.displayValue.toFixed(1)}`,
                    isTotal ? 'Index' : 'Adjustment',
                  ]
                }}
                contentStyle={{ borderRadius: '10px', border: '1px solid #d5dbe3', boxShadow: '0 4px 16px rgba(26,35,50,0.08)', fontSize: '13px' }}
              />
              <ReferenceLine y={targetLine} stroke="#1a8754" strokeDasharray="8 4" strokeWidth={1} label={{ value: `Target ${targetLine.toFixed(1)}`, position: 'right', fontSize: 10, fill: '#1a8754' }} />
              <ReferenceLine y={60} stroke="#c43e3e" strokeDasharray="8 4" strokeWidth={1} label={{ value: 'Cost floor 60.1', position: 'right', fontSize: 10, fill: '#c43e3e' }} />
              <Bar dataKey="base" stackId="waterfall" fill="transparent" radius={0} />
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <Bar dataKey="value" stackId="waterfall" radius={[6, 6, 0, 0]} label={(props: any) => {
                const { x, y, width, index } = props as { x: number; y: number; width: number; index: number }
                if (index == null || !wfData[index]) return null
                const entry = wfData[index]
                const isTotal = entry.fill === TOTAL_COLOR || entry.fill === INTERMEDIATE_COLOR || entry.fill === TARGET_COLOR
                const label = isTotal ? entry.displayValue.toFixed(1) : `${entry.displayValue.toFixed(1)}`
                return (
                  <text x={(x ?? 0) + (width ?? 0) / 2} y={(y ?? 0) - 8} textAnchor="middle" fill={entry.fill} fontSize={12} fontWeight={600}>
                    {label}
                  </text>
                )
              }}>
                {wfData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Last-Mile Discount Distribution */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-text-primary">Last-Mile Discount Distribution</h3>
            <p className="text-xs text-text-muted mt-0.5">By material category — where is discretionary discount highest?</p>
          </div>
          <div className="space-y-4 mt-6">
            {lastMile.map((item) => {
              const absDiscount = Math.abs(item.discount)
              const maxWidth = 14 // max discount %
              const widthPct = Math.min(100, (absDiscount / maxWidth) * 100)
              return (
                <div key={item.category} className="flex items-center gap-3">
                  <div className="w-36 text-xs text-text-secondary font-medium text-right shrink-0">{item.category}</div>
                  <div className="flex-1 h-6 bg-bg-warm rounded overflow-hidden">
                    <div
                      className="h-full rounded"
                      style={{ width: `${widthPct}%`, backgroundColor: item.color }}
                    />
                  </div>
                  <span className="text-sm font-bold w-14 text-right" style={{ color: item.color }}>
                    {item.discount.toFixed(1)}%
                  </span>
                </div>
              )
            })}
            {/* Average line */}
            <div className="flex items-center gap-3 pt-3 border-t border-border">
              <div className="w-36 text-xs text-text-primary font-bold text-right">Average</div>
              <div className="flex-1 h-6 bg-bg-warm rounded overflow-hidden">
                <div className="h-full rounded bg-text-muted" style={{ width: `${(8.8 / 14) * 100}%` }} />
              </div>
              <span className="text-sm font-bold w-14 text-right text-text-primary">
                -8.8%
              </span>
            </div>
          </div>

          {/* Insight */}
          <div className="mt-6 p-3 bg-negative/5 border-l-4 border-l-negative rounded-r-lg">
            <p className="text-xs font-bold text-text-primary">Cat. 200 last-mile discount ~4&times; Cat. 500</p>
            <p className="text-xs text-text-secondary mt-1">
              Tighten approval thresholds for Cat. 200. Potential annual uplift ~&pound;180k at current volumes.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
