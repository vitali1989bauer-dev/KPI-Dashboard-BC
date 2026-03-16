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
import { getScoWaterfallData } from '../data/mockData'
import { useFilters } from '../FilterContext'
import InfoTooltip from '../components/InfoTooltip'

interface WaterfallDataPoint {
  name: string
  base: number
  value: number
  displayValue: number
  fill: string
}

const TOTAL_COLOR = '#173B7A'
const POSITIVE_COLOR = '#1a8754'
const NEGATIVE_COLOR = '#c43e3e'

function buildWaterfallData(f: ReturnType<typeof useFilters>['filters']): WaterfallDataPoint[] {
  const raw = getScoWaterfallData(f)
  const result: WaterfallDataPoint[] = []
  let running = 0

  for (const item of raw) {
    if (item.type === 'start') {
      result.push({ name: item.name.replace('\n', ' '), base: 0, value: item.value, displayValue: item.value, fill: TOTAL_COLOR })
      running = item.value
    } else if (item.type === 'end') {
      result.push({ name: item.name.replace('\n', ' '), base: 0, value: item.value, displayValue: item.value, fill: TOTAL_COLOR })
    } else if (item.type === 'positive') {
      result.push({ name: item.name.replace('\n', ' '), base: running, value: item.value, displayValue: item.value, fill: POSITIVE_COLOR })
      running += item.value
    } else {
      result.push({ name: item.name.replace('\n', ' '), base: running + item.value, value: Math.abs(item.value), displayValue: item.value, fill: NEGATIVE_COLOR })
      running += item.value
    }
  }
  return result
}

export default function SCOEffect() {
  const { filters } = useFilters()
  const rawData = getScoWaterfallData(filters)
  const data = useMemo(() => buildWaterfallData(filters), [filters])

  const maxVal = Math.max(...data.map(d => d.base + d.value))
  const yMax = Math.ceil(maxVal / 20) * 20 + 20

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function renderLabel(props: any) {
    const { x, y, width, index } = props as { x: number; y: number; width: number; index: number }
    if (index == null || !data[index]) return null
    const entry = data[index]
    const isTotal = entry.fill === TOTAL_COLOR
    const label = isTotal
      ? entry.displayValue.toFixed(1)
      : `${entry.displayValue >= 0 ? '+' : ''}${entry.displayValue.toFixed(1)}`
    return (
      <text x={(x ?? 0) + (width ?? 0) / 2} y={(y ?? 0) - 8} textAnchor="middle" fill={entry.fill} fontSize={13} fontWeight={600}>
        {label}
      </text>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-text-primary">
              SCO Effect (Standard Contribution Bridge)
              <InfoTooltip text="SCO = Standard Contribution — measures profitability per metric ton after deducting variable costs (production, logistics, conditions) from net revenue. The bridge breaks down what drove the change from last year to current period." />
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              Margin impact breakdown — from Last Year SCO/MT to Current SCO/MT
            </p>
          </div>
          <div className="bg-primary/5 border border-primary/15 rounded-lg px-4 py-2.5 max-w-xs">
            <p className="text-xs font-semibold text-primary mb-0.5">What is the SCO Bridge?</p>
            <p className="text-[11px] text-text-secondary leading-relaxed">
              Decomposes the year-over-year change in Standard Contribution per MT into its key drivers: price, volume, cost, new business, and portfolio mix effects.
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {rawData.slice(1, 6).map((item) => (
          <div
            key={item.name}
            className={`rounded-xl p-3.5 text-center border card-hover ${
              item.value >= 0
                ? 'bg-positive/5 border-positive/20'
                : 'bg-negative/5 border-negative/20'
            }`}
          >
            <p className="text-xs text-text-secondary font-semibold mb-1">
              {item.name.replace('\n', ' ')}
            </p>
            <p className={`text-lg font-bold ${item.value >= 0 ? 'text-positive' : 'text-negative'}`}>
              {item.value >= 0 ? '+' : ''}{item.value.toFixed(1)} €/MT
            </p>
          </div>
        ))}
      </div>

      {/* Waterfall Chart */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-sm font-semibold text-text-secondary mb-4 uppercase tracking-wide">
          SCO/MT Waterfall Bridge
        </h3>
        <ResponsiveContainer width="100%" height={420}>
          <BarChart data={data} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke="#d5dbe3" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#4a5568' }} axisLine={{ stroke: '#d5dbe3' }} tickLine={false} />
            <YAxis domain={[0, yMax]} tick={{ fontSize: 11, fill: '#4a5568' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${v}`} />
            <Tooltip
              formatter={(_value, _name, props) => {
                const p = (props as { payload: WaterfallDataPoint }).payload
                return [
                  `${p.displayValue >= 0 ? '+' : ''}${p.displayValue.toFixed(1)} €/MT`,
                  p.fill === TOTAL_COLOR ? 'Total' : 'Effect',
                ]
              }}
              contentStyle={{ borderRadius: '10px', border: '1px solid #d5dbe3', boxShadow: '0 4px 16px rgba(23,59,122,0.08)', fontSize: '13px' }}
            />
            <ReferenceLine y={0} stroke="#d5dbe3" />
            <Bar dataKey="base" stackId="waterfall" fill="transparent" radius={0} />
            <Bar dataKey="value" stackId="waterfall" radius={[6, 6, 0, 0]} label={renderLabel}>
              {data.map((entry, idx) => (
                <Cell key={idx} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
