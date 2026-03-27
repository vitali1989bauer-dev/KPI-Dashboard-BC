import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'
import { getYoYByCategory, getCostVsPriceData, getTrendKpis, getMonthlyTrend } from '../data/mockData'
import { useFilters } from '../FilterContext'

export default function Trends() {
  const { filters } = useFilters()
  const yoyData = useMemo(() => getYoYByCategory(filters), [filters])
  const costVsPrice = useMemo(() => getCostVsPriceData(filters), [filters])
  const kpis = useMemo(() => getTrendKpis(filters), [filters])
  const _mt = getMonthlyTrend(filters); void _mt

  return (
    <div>
      {/* Sub-tabs */}
      <div className="flex items-center gap-1 mb-6">
        <button className="px-4 py-2 rounded-lg text-sm font-semibold bg-accent text-white">
          Year-on-Year
        </button>
        <button className="px-4 py-2 rounded-lg text-sm font-medium text-text-muted hover:bg-bg-warm transition-colors cursor-pointer border border-border">
          3-Year Trajectory
        </button>
        <button className="px-4 py-2 rounded-lg text-sm font-medium text-text-muted hover:bg-bg-warm transition-colors cursor-pointer border border-border">
          Monthly Detail
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        {kpis.map((kpi) => {
          const accentBorder = {
            red: 'border-t-negative',
            blue: 'border-t-primary',
            green: 'border-t-positive',
            amber: 'border-t-warning',
          }
          return (
            <div key={kpi.label} className={`bg-card rounded-xl border border-border border-t-3 ${accentBorder[kpi.accentColor]} p-5 card-hover`}>
              <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide mb-1">{kpi.label}</p>
              <p className={`text-3xl font-bold ${kpi.status === 'negative' ? 'text-negative' : kpi.status === 'positive' ? 'text-positive' : 'text-primary'}`}>
                {kpi.value}
              </p>
              <p className="text-xs text-text-muted mt-1">{kpi.subtitle}</p>
            </div>
          )
        })}
      </div>

      {/* Charts side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* YoY by Material Category */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-text-primary">
              Realization YoY — by Material Category
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              2025 vs. 2026 YTD. Cat. 200 erosion most severe.
            </p>
          </div>
          <ResponsiveContainer width="100%" height={380}>
            <BarChart data={yoyData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d5dbe3" vertical={false} />
              <XAxis dataKey="category" tick={{ fontSize: 12, fill: '#4a5568' }} axisLine={{ stroke: '#d5dbe3' }} tickLine={false} />
              <YAxis domain={[70, 100]} tick={{ fontSize: 11, fill: '#4a5568' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${v}%`} />
              <Tooltip
                formatter={(value) => [`${Number(value).toFixed(1)}%`]}
                contentStyle={{ borderRadius: '10px', border: '1px solid #d5dbe3', boxShadow: '0 4px 16px rgba(26,35,50,0.08)', fontSize: '13px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} iconType="square" iconSize={10} />
              <Bar dataKey="priorYear" name="FY 2025" fill="#b8c2cf" radius={[6, 6, 0, 0]} maxBarSize={36} />
              <Bar dataKey="currentYear" name="YTD 2026" fill="#4a6fa5" radius={[6, 6, 0, 0]} maxBarSize={36}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                label={(props: any) => {
                  const { x, y, width, index } = props as { x: number; y: number; width: number; index: number }
                  if (index == null || !yoyData[index]) return null
                  const delta = yoyData[index].deltaPp
                  if (Math.abs(delta) < 1) return null
                  return (
                    <text x={(x ?? 0) + (width ?? 0) / 2} y={(y ?? 0) - 8} textAnchor="middle" fill={delta >= 0 ? '#1a8754' : '#c43e3e'} fontSize={11} fontWeight={600}>
                      {delta >= 0 ? '+' : ''}{delta.toFixed(0)}pp
                    </text>
                  )
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Cost vs Price Inflation */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-text-primary">
              Cost vs. Price Inflation — Margin Squeeze
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Cost increases outpacing price. Shaded area = cumulative margin erosion.
            </p>
          </div>
          <ResponsiveContainer width="100%" height={380}>
            <AreaChart data={costVsPrice} margin={{ top: 10, right: 20, bottom: 5, left: 10 }}>
              <defs>
                <linearGradient id="marginGap" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c43e3e" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#c43e3e" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#d5dbe3" vertical={false} />
              <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#4a5568' }} axisLine={{ stroke: '#d5dbe3' }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#4a5568' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${v >= 0 ? '+' : ''}${v}%`} domain={[-1, 6]} />
              <Tooltip
                formatter={(value) => [`${Number(value) >= 0 ? '+' : ''}${Number(value).toFixed(1)}%`]}
                contentStyle={{ borderRadius: '10px', border: '1px solid #d5dbe3', boxShadow: '0 4px 16px rgba(26,35,50,0.08)', fontSize: '13px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} iconType="circle" iconSize={8} />
              <Area
                type="monotone"
                dataKey="costChange"
                name="Cost"
                stroke="#c43e3e"
                strokeWidth={2}
                fill="url(#marginGap)"
                dot={{ r: 4, fill: '#c43e3e', strokeWidth: 0 }}
              />
              <Line
                type="monotone"
                dataKey="priceChange"
                name="Price"
                stroke="#173B7A"
                strokeWidth={2}
                dot={{ r: 4, fill: '#173B7A', strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>

          {/* Gap annotation */}
          <div className="mt-2 text-center">
            <span className="text-xs text-negative font-semibold">
              Cumulative gap: ~{(costVsPrice[costVsPrice.length - 1]?.costChange - costVsPrice[costVsPrice.length - 1]?.priceChange).toFixed(1)}pp over 3 years
            </span>
          </div>
        </div>
      </div>

      {/* Insight Card */}
      <div className="bg-card rounded-xl border border-border border-l-4 border-l-negative p-4">
        <p className="text-sm font-bold text-text-primary">Cost outpacing price increases for 3rd consecutive year</p>
        <p className="text-xs text-text-secondary mt-1">
          Requires above-inflation price increases in next price round. Cat. 200–300 priority — lowest realization, highest cost sensitivity.
        </p>
      </div>
    </div>
  )
}
