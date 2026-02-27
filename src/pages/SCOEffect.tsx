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
        fill: '#3b82f6',
      })
      running = item.value
    } else if (item.type === 'end') {
      result.push({
        name: item.name.replace('\n', ' '),
        base: 0,
        value: item.value,
        displayValue: item.value,
        fill: '#3b82f6',
      })
    } else if (item.type === 'positive') {
      result.push({
        name: item.name.replace('\n', ' '),
        base: running,
        value: item.value,
        displayValue: item.value,
        fill: '#10b981',
      })
      running += item.value
    } else {
      result.push({
        name: item.name.replace('\n', ' '),
        base: running + item.value,
        value: Math.abs(item.value),
        displayValue: item.value,
        fill: '#ef4444',
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
  const isTotal = fill === '#3b82f6'
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
            className={`rounded-lg p-3 text-center border ${
              item.value >= 0
                ? 'bg-positive/5 border-positive/20'
                : 'bg-negative/5 border-negative/20'
            }`}
          >
            <p className="text-xs text-text-secondary font-medium mb-1">
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
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={false}
            />
            <YAxis
              domain={[0, 160]}
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `${v}`}
            />
            <Tooltip
              formatter={(_value, _name, props) => {
                const p = props.payload as WaterfallDataPoint
                return [
                  `${p.displayValue >= 0 ? '+' : ''}${p.displayValue.toFixed(1)} €/MT`,
                  p.fill === '#3b82f6' ? 'Total' : 'Effect',
                ]
              }}
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                fontSize: '13px',
              }}
            />
            <ReferenceLine y={0} stroke="#e2e8f0" />
            {/* Invisible base bar */}
            <Bar dataKey="base" stackId="waterfall" fill="transparent" radius={0} />
            {/* Value bar */}
            <Bar
              dataKey="value"
              stackId="waterfall"
              radius={[4, 4, 0, 0]}
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
