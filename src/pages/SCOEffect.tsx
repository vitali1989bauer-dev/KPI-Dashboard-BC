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
  Text,
} from 'recharts'
import { scoWaterfallData } from '../data/mockData'

interface WaterfallDataPoint {
  name: string
  base: number
  value: number
  displayValue: number
  fill: string
}

const TOTAL_COLOR = '#6b3a2a'
const POSITIVE_COLOR = '#2d8659'
const NEGATIVE_COLOR = '#c43e3e'

function buildWaterfallData(): WaterfallDataPoint[] {
  const result: WaterfallDataPoint[] = []
  let running = 0

  for (const item of scoWaterfallData) {
    if (item.type === 'start') {
      result.push({
        name: item.name.replace('\n', ' '),
        base: 0,
        value: item.value,
        displayValue: item.value,
        fill: TOTAL_COLOR,
      })
      running = item.value
    } else if (item.type === 'end') {
      result.push({
        name: item.name.replace('\n', ' '),
        base: 0,
        value: item.value,
        displayValue: item.value,
        fill: TOTAL_COLOR,
      })
    } else if (item.type === 'positive') {
      result.push({
        name: item.name.replace('\n', ' '),
        base: running,
        value: item.value,
        displayValue: item.value,
        fill: POSITIVE_COLOR,
      })
      running += item.value
    } else {
      result.push({
        name: item.name.replace('\n', ' '),
        base: running + item.value,
        value: Math.abs(item.value),
        displayValue: item.value,
        fill: NEGATIVE_COLOR,
      })
      running += item.value
    }
  }

  return result
}

function CustomLabel(props: Record<string, unknown>) {
  const { x, y, width, displayValue, fill } = props as {
    x: number
    y: number
    width: number
    displayValue: number
    fill: string
  }
  const isTotal = fill === TOTAL_COLOR
  return (
    <Text
      x={(x ?? 0) + (width ?? 0) / 2}
      y={(y ?? 0) - 8}
      textAnchor="middle"
      fill={fill}
      fontSize={13}
      fontWeight={600}
    >
      {isTotal
        ? displayValue.toFixed(1)
        : `${displayValue >= 0 ? '+' : ''}${displayValue.toFixed(1)}`}
    </Text>
  )
}

export default function SCOEffect() {
  const data = buildWaterfallData()

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-text-primary">SCO Effect (SCO-Bridge)</h2>
        <p className="text-sm text-text-secondary mt-1">
          Margin impact breakdown — from Last Year SCO/MT to Current SCO/MT
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {scoWaterfallData.slice(1, 6).map((item) => (
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
            <p
              className={`text-lg font-bold ${
                item.value >= 0 ? 'text-positive' : 'text-negative'
              }`}
            >
              {item.value >= 0 ? '+' : ''}
              {item.value.toFixed(1)} €/MT
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
            <CartesianGrid strokeDasharray="3 3" stroke="#e8dfd4" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: '#6b5c52' }}
              axisLine={{ stroke: '#e8dfd4' }}
              tickLine={false}
            />
            <YAxis
              domain={[0, 160]}
              tick={{ fontSize: 11, fill: '#6b5c52' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `${v}`}
            />
            <Tooltip
              formatter={(_value, _name, props) => {
                const p = props.payload as WaterfallDataPoint
                return [
                  `${p.displayValue >= 0 ? '+' : ''}${p.displayValue.toFixed(1)} €/MT`,
                  p.fill === TOTAL_COLOR ? 'Total' : 'Effect',
                ]
              }}
              contentStyle={{
                borderRadius: '10px',
                border: '1px solid #e8dfd4',
                boxShadow: '0 4px 16px rgba(44,24,16,0.08)',
                fontSize: '13px',
              }}
            />
            <ReferenceLine y={0} stroke="#e8dfd4" />
            <Bar dataKey="base" stackId="waterfall" fill="transparent" radius={0} />
            <Bar
              dataKey="value"
              stackId="waterfall"
              radius={[6, 6, 0, 0]}
              label={<CustomLabel />}
            >
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
