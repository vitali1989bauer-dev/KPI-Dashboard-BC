import { TrendingUp, TrendingDown, Minus, Zap, DollarSign, Ship } from 'lucide-react'
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { getBenchmarkData, getInputCostData, getFxData, getMarketSignals } from '../data/mockData'
import { useFilters } from '../FilterContext'
import InfoTooltip from '../components/InfoTooltip'

const COLORS = {
  primary: '#173B7A',
  positive: '#1a8754',
  warning: '#d49a1a',
  negative: '#c43e3e',
  grey: '#667885',
  grid: '#d5dbe3',
  axisText: '#4a5568',
}

interface SummaryKpi {
  label: string
  value: string
  change: number
  changeLabel: string
  icon: React.ReactNode
  status: 'positive' | 'negative' | 'neutral'
}

function StatusArrow({ status }: { status: 'positive' | 'negative' | 'neutral' }) {
  if (status === 'positive') return <TrendingUp className="w-4 h-4 text-positive" />
  if (status === 'negative') return <TrendingDown className="w-4 h-4 text-negative" />
  return <Minus className="w-4 h-4 text-text-muted" />
}

function formatChange(value: number, suffix = '%'): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}${suffix}`
}

export default function MarketIntelligence() {
  const { filters } = useFilters()
  const benchmarkData = getBenchmarkData(filters)
  const inputCostData = getInputCostData(filters)
  const fxData = getFxData(filters)
  const marketSignals = getMarketSignals(filters)

  // Derive summary KPIs from the data
  const latestBenchmark = benchmarkData[benchmarkData.length - 1]

  const ksPremium = latestBenchmark
    ? ((latestBenchmark.ksRealized - latestBenchmark.mopVancouver) / latestBenchmark.mopVancouver) * 100
    : 0

  const latestInputCost = inputCostData[inputCostData.length - 1]
  const prevInputCost = inputCostData[inputCostData.length - 2]
  const gasChange = prevInputCost
    ? ((latestInputCost.naturalGas - prevInputCost.naturalGas) / prevInputCost.naturalGas) * 100
    : 0

  const latestFx = fxData[fxData.length - 1]
  const prevFx = fxData[fxData.length - 2]
  const fxChange = prevFx
    ? ((latestFx.eurUsd - prevFx.eurUsd) / prevFx.eurUsd) * 100
    : 0

  const latestFreight = inputCostData[inputCostData.length - 1]
  const prevFreight = inputCostData[inputCostData.length - 2]
  const freightChange = prevFreight
    ? ((latestFreight.freight - prevFreight.freight) / prevFreight.freight) * 100
    : 0

  const summaryKpis: SummaryKpi[] = [
    {
      label: 'K+S Premium vs Spot',
      value: `${ksPremium.toFixed(1)}%`,
      change: ksPremium - 5.0,
      changeLabel: 'vs target 5%',
      icon: <TrendingUp className="w-5 h-5 text-primary" />,
      status: ksPremium >= 5 ? 'positive' : 'negative',
    },
    {
      label: 'Gas Price (EUR/MWh)',
      value: `€${latestInputCost.naturalGas.toFixed(1)}`,
      change: gasChange,
      changeLabel: 'vs prev month',
      icon: <Zap className="w-5 h-5 text-warning" />,
      status: gasChange <= 0 ? 'positive' : 'negative',
    },
    {
      label: 'EUR/USD Rate',
      value: latestFx.eurUsd.toFixed(3),
      change: fxChange,
      changeLabel: 'vs prev month',
      icon: <DollarSign className="w-5 h-5 text-primary" />,
      status: Math.abs(fxChange) < 1 ? 'neutral' : fxChange < 0 ? 'positive' : 'negative',
    },
    {
      label: 'Freight Index',
      value: latestFreight.freight.toFixed(0),
      change: freightChange,
      changeLabel: 'vs prev month',
      icon: <Ship className="w-5 h-5 text-grey" />,
      status: freightChange <= 0 ? 'positive' : 'negative',
    },
  ]

  const signalBorderColor = (impact: 'positive' | 'negative' | 'neutral') => {
    if (impact === 'positive') return 'border-l-positive'
    if (impact === 'negative') return 'border-l-negative'
    return 'border-l-primary'
  }

  const signalIcon = (impact: 'positive' | 'negative' | 'neutral') => {
    if (impact === 'positive') return <TrendingUp className="w-4 h-4 text-positive flex-shrink-0" />
    if (impact === 'negative') return <TrendingDown className="w-4 h-4 text-negative flex-shrink-0" />
    return <Minus className="w-4 h-4 text-primary flex-shrink-0" />
  }

  // Custom tooltip for benchmark chart
  const BenchmarkTooltipContent = ({ active, payload, label }: {
    active?: boolean
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload?: Array<{ name: string; value: number; color: string; dataKey: string }>
    label?: string
  }) => {
    if (!active || !payload || !payload.length) return null
    return (
      <div className="bg-white border border-border rounded-lg shadow-lg p-3 text-xs">
        <p className="font-semibold text-text-primary mb-1.5">{label}</p>
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center gap-2 py-0.5">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
            <span className="text-text-secondary">{entry.name}:</span>
            <span className="font-semibold text-text-primary ml-auto">€{entry.value.toFixed(1)}</span>
          </div>
        ))}
      </div>
    )
  }

  // Custom tooltip for input cost chart
  const InputCostTooltipContent = ({ active, payload, label }: {
    active?: boolean
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload?: Array<{ name: string; value: number; color: string; dataKey: string }>
    label?: string
  }) => {
    if (!active || !payload || !payload.length) return null
    return (
      <div className="bg-white border border-border rounded-lg shadow-lg p-3 text-xs">
        <p className="font-semibold text-text-primary mb-1.5">{label}</p>
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center gap-2 py-0.5">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
            <span className="text-text-secondary">{entry.name}:</span>
            <span className="font-semibold text-text-primary ml-auto">{entry.value.toFixed(1)} EUR/MWh</span>
          </div>
        ))}
      </div>
    )
  }

  // Custom tooltip for FX chart
  const FxTooltipContent = ({ active, payload, label }: {
    active?: boolean
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload?: Array<{ name: string; value: number; color: string; dataKey: string }>
    label?: string
  }) => {
    if (!active || !payload || !payload.length) return null
    return (
      <div className="bg-white border border-border rounded-lg shadow-lg p-3 text-xs">
        <p className="font-semibold text-text-primary mb-1.5">{label}</p>
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center gap-2 py-0.5">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
            <span className="text-text-secondary">{entry.name}:</span>
            <span className="font-semibold text-text-primary ml-auto">{entry.value.toFixed(3)}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-text-primary">Market Intelligence</h2>
        <p className="text-sm text-text-secondary mt-1">
          External benchmarks, input costs &amp; FX rates for pricing context
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {summaryKpis.map((kpi) => (
          <div key={kpi.label} className="bg-card rounded-xl border border-border p-5 card-hover">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">{kpi.label}</p>
              {kpi.icon}
            </div>
            <p className="text-2xl font-bold text-text-primary">{kpi.value}</p>
            <div className="flex items-center gap-1 mt-1">
              <StatusArrow status={kpi.status} />
              <span className={`text-xs font-semibold ${
                kpi.status === 'positive' ? 'text-positive' : kpi.status === 'negative' ? 'text-negative' : 'text-text-muted'
              }`}>
                {formatChange(kpi.change)} {kpi.changeLabel}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Benchmark Chart */}
      <div className="bg-card rounded-xl border border-border p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
            Potash Price Benchmarks (€/MT)
          </h3>
          <InfoTooltip text="Monthly FOB/CFR benchmark prices for MOP (Muriate of Potash) from key export hubs compared to K+S realized pricing. Premium indicates K+S brand and quality positioning." />
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={benchmarkData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
              <defs>
                <linearGradient id="ksRealizedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.positive} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={COLORS.positive} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: COLORS.axisText }}
                axisLine={{ stroke: COLORS.grid }}
                tickLine={{ stroke: COLORS.grid }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: COLORS.axisText }}
                axisLine={{ stroke: COLORS.grid }}
                tickLine={{ stroke: COLORS.grid }}
                domain={['auto', 'auto']}
              />
              <Tooltip content={<BenchmarkTooltipContent />} />
              <Legend
                wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
              />
              <Line
                type="monotone"
                dataKey="mopVancouver"
                name="MOP Vancouver FOB"
                stroke={COLORS.primary}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="mopBaltic"
                name="MOP Baltic"
                stroke={COLORS.grey}
                strokeWidth={1.5}
                dot={false}
                activeDot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="mopBrazil"
                name="MOP Brazil CFR"
                stroke={COLORS.warning}
                strokeWidth={1.5}
                dot={false}
                activeDot={{ r: 3 }}
              />
              <Area
                type="monotone"
                dataKey="ksRealized"
                name="K+S Realized Price"
                stroke={COLORS.positive}
                strokeWidth={2}
                strokeDasharray="6 3"
                fill="url(#ksRealizedGradient)"
                dot={{ r: 3, fill: COLORS.positive, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: COLORS.positive }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two side-by-side charts */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Input Cost Tracker */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
              Input Cost Tracker
            </h3>
            <InfoTooltip text="Natural gas TTF and electricity spot prices drive K+S production costs. Rising energy costs compress margins unless offset by price increases." />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={inputCostData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10, fill: COLORS.axisText }}
                  axisLine={{ stroke: COLORS.grid }}
                  tickLine={{ stroke: COLORS.grid }}
                />
                <YAxis
                  yAxisId="gas"
                  tick={{ fontSize: 10, fill: COLORS.axisText }}
                  axisLine={{ stroke: COLORS.grid }}
                  tickLine={{ stroke: COLORS.grid }}
                  label={{ value: 'EUR/MWh', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: COLORS.axisText } }}
                />
                <YAxis
                  yAxisId="elec"
                  orientation="right"
                  tick={{ fontSize: 10, fill: COLORS.axisText }}
                  axisLine={{ stroke: COLORS.grid }}
                  tickLine={{ stroke: COLORS.grid }}
                  label={{ value: 'EUR/MWh', angle: 90, position: 'insideRight', style: { fontSize: 10, fill: COLORS.axisText } }}
                />
                <Tooltip content={<InputCostTooltipContent />} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                <Line
                  yAxisId="gas"
                  type="monotone"
                  dataKey="naturalGas"
                  name="Natural Gas TTF"
                  stroke={COLORS.warning}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 3 }}
                />
                <Line
                  yAxisId="elec"
                  type="monotone"
                  dataKey="electricity"
                  name="Electricity"
                  stroke={COLORS.negative}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* FX Impact */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
              FX Impact
            </h3>
            <InfoTooltip text="EUR/USD affects USD-denominated potash trade competitiveness. EUR/BRL impacts pricing for Brazil — K+S's largest export market in South America." />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={fxData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10, fill: COLORS.axisText }}
                  axisLine={{ stroke: COLORS.grid }}
                  tickLine={{ stroke: COLORS.grid }}
                />
                <YAxis
                  yAxisId="usd"
                  tick={{ fontSize: 10, fill: COLORS.axisText }}
                  axisLine={{ stroke: COLORS.grid }}
                  tickLine={{ stroke: COLORS.grid }}
                  domain={['auto', 'auto']}
                  label={{ value: 'EUR/USD', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: COLORS.axisText } }}
                />
                <YAxis
                  yAxisId="brl"
                  orientation="right"
                  tick={{ fontSize: 10, fill: COLORS.axisText }}
                  axisLine={{ stroke: COLORS.grid }}
                  tickLine={{ stroke: COLORS.grid }}
                  domain={['auto', 'auto']}
                  label={{ value: 'EUR/BRL', angle: 90, position: 'insideRight', style: { fontSize: 10, fill: COLORS.axisText } }}
                />
                <Tooltip content={<FxTooltipContent />} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                <Line
                  yAxisId="usd"
                  type="monotone"
                  dataKey="eurUsd"
                  name="EUR/USD"
                  stroke={COLORS.primary}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 3 }}
                />
                <Line
                  yAxisId="brl"
                  type="monotone"
                  dataKey="eurBrl"
                  name="EUR/BRL"
                  stroke={COLORS.positive}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Market Signals */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
            Market Signals
          </h3>
          <InfoTooltip text="Auto-derived pricing implications based on market benchmarks, input costs, FX movements, and competitive intelligence." />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {marketSignals.map((signal, idx) => (
            <div
              key={idx}
              className={`border border-border rounded-lg p-4 border-l-4 ${signalBorderColor(signal.impact)}`}
            >
              <div className="flex items-start gap-2 mb-2">
                {signalIcon(signal.impact)}
                <h4 className="text-sm font-semibold text-text-primary leading-tight">{signal.title}</h4>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed ml-6">{signal.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
