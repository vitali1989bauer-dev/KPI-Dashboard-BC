import { useMemo } from 'react'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { getPricingDeepDiveData, getNetRevenueWaterfall } from '../data/mockData'
import { useFilters } from '../FilterContext'
import InfoTooltip from '../components/InfoTooltip'

const TOTAL_COLOR = '#173B7A'
const NEGATIVE_COLOR = '#c43e3e'

interface WfPoint {
  name: string
  base: number
  value: number
  displayValue: number
  fill: string
}

function buildNetRevWaterfall(steps: ReturnType<typeof getNetRevenueWaterfall>): WfPoint[] {
  const result: WfPoint[] = []
  let running = 0
  for (const item of steps) {
    if (item.type === 'start') {
      result.push({ name: item.name, base: 0, value: item.value, displayValue: item.value, fill: TOTAL_COLOR })
      running = item.value
    } else if (item.type === 'end') {
      result.push({ name: item.name, base: 0, value: item.value, displayValue: item.value, fill: TOTAL_COLOR })
    } else {
      result.push({ name: item.name.replace('\n', ' '), base: running + item.value, value: Math.abs(item.value), displayValue: item.value, fill: NEGATIVE_COLOR })
      running += item.value
    }
  }
  return result
}

export default function PricingDeepDive() {
  const { filters } = useFilters()
  const data = getPricingDeepDiveData(filters)
  const netRevSteps = getNetRevenueWaterfall(filters)
  const wfData = useMemo(() => buildNetRevWaterfall(netRevSteps), [netRevSteps])

  const totalVol = data.reduce((s, r) => s + r.volume, 0)
  const avgPrice = data.reduce((s, r) => s + r.avgPrice * r.volume, 0) / totalVol
  const avgMargin = data.reduce((s, r) => s + r.margin * r.volume, 0) / totalVol
  const avgPriceVsLY = data.reduce((s, r) => s + r.priceVsLY * r.volume, 0) / totalVol
  const avgMarginVsLY = data.reduce((s, r) => s + r.marginVsLY * r.volume, 0) / totalVol

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-text-primary">Pricing Deep-dives</h2>
        <p className="text-sm text-text-secondary mt-1">
          Pricing analysis by fertilizer &amp; salt product category
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-xl border border-border p-5 card-hover">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">Avg. Price / MT</p>
          <p className="text-2xl font-bold text-text-primary">&euro; {avgPrice.toFixed(1)}</p>
          <div className="flex items-center gap-1 mt-1">
            {avgPriceVsLY >= 0 ? <ArrowUpRight className="w-3.5 h-3.5 text-positive" /> : <ArrowDownRight className="w-3.5 h-3.5 text-negative" />}
            <span className={`text-xs font-semibold ${avgPriceVsLY >= 0 ? 'text-positive' : 'text-negative'}`}>{avgPriceVsLY >= 0 ? '+' : ''}{avgPriceVsLY.toFixed(1)}% vs LY</span>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 card-hover">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">Avg. Margin</p>
          <p className="text-2xl font-bold text-text-primary">{avgMargin.toFixed(1)}%</p>
          <div className="flex items-center gap-1 mt-1">
            {avgMarginVsLY >= 0 ? <ArrowUpRight className="w-3.5 h-3.5 text-positive" /> : <ArrowDownRight className="w-3.5 h-3.5 text-negative" />}
            <span className={`text-xs font-semibold ${avgMarginVsLY >= 0 ? 'text-positive' : 'text-negative'}`}>{avgMarginVsLY >= 0 ? '+' : ''}{avgMarginVsLY.toFixed(1)}pp vs LY</span>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 card-hover">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">Total Volume</p>
          <p className="text-2xl font-bold text-text-primary">{(totalVol / 1000).toFixed(1)}k MT</p>
        </div>
      </div>

      {/* Net Revenue Waterfall (Gross-to-Net) */}
      <div className="bg-card rounded-xl border border-border p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
            Net Revenue Waterfall — Gross to Net (M€)
          </h3>
          <InfoTooltip text="Shows how gross revenue is reduced by trade discounts, logistics allowances, volume rebates, promotional conditions, and early payment discounts to arrive at net revenue. Key metric for revenue leakage analysis." />
        </div>
        <ResponsiveContainer width="100%" height={380}>
          <BarChart data={wfData} barCategoryGap="16%">
            <CartesianGrid strokeDasharray="3 3" stroke="#d5dbe3" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#4a5568' }} axisLine={{ stroke: '#d5dbe3' }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#4a5568' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${v}M€`} />
            <Tooltip
              formatter={(_value, _name, props) => {
                const p = (props as { payload: WfPoint }).payload
                return [
                  `${p.displayValue >= 0 ? '' : ''}${p.displayValue.toFixed(1)} M€`,
                  p.fill === TOTAL_COLOR ? 'Total' : 'Deduction',
                ]
              }}
              contentStyle={{ borderRadius: '10px', border: '1px solid #d5dbe3', boxShadow: '0 4px 16px rgba(23,59,122,0.08)', fontSize: '13px' }}
            />
            <Bar dataKey="base" stackId="wf" fill="transparent" radius={0} />
            <Bar dataKey="value" stackId="wf" radius={[6, 6, 0, 0]} label={({ x, y, width, index }: { x: number; y: number; width: number; index: number }) => {
              if (index == null || !wfData[index]) return null
              const entry = wfData[index]
              const isTotal = entry.fill === TOTAL_COLOR
              const label = isTotal ? entry.displayValue.toFixed(1) : entry.displayValue.toFixed(1)
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
        <div className="mt-3 flex items-center gap-6 text-xs text-text-muted">
          <span>Total Conditions: <strong className="text-negative">{(netRevSteps[0].value - netRevSteps[netRevSteps.length - 1].value).toFixed(1)} M€</strong></span>
          <span>Condition Ratio: <strong className="text-text-primary">{((netRevSteps[0].value - netRevSteps[netRevSteps.length - 1].value) / netRevSteps[0].value * 100).toFixed(1)}%</strong> of gross revenue</span>
          <span>Net/Gross Ratio: <strong className="text-positive">{(netRevSteps[netRevSteps.length - 1].value / netRevSteps[0].value * 100).toFixed(1)}%</strong></span>
        </div>
      </div>

      {/* Pricing Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
            Product Category Pricing Analysis
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-bg-warm">
                <th className="text-left px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Product</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Avg Price (&euro;/MT)</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Price vs LY</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Margin %</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Margin vs LY</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Volume (MT)</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr key={row.segment} className={`border-t border-border hover:bg-bg-warm/50 transition-colors ${idx % 2 === 0 ? '' : 'bg-bg/50'}`}>
                  <td className="px-6 py-3.5 text-sm font-semibold text-text-primary">{row.segment}</td>
                  <td className="px-6 py-3.5 text-sm text-right font-mono text-text-primary">{row.avgPrice.toFixed(1)}</td>
                  <td className="px-6 py-3.5 text-sm text-right">
                    <span className={`inline-flex items-center gap-0.5 font-semibold ${row.priceVsLY >= 0 ? 'text-positive' : 'text-negative'}`}>
                      {row.priceVsLY >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                      {row.priceVsLY >= 0 ? '+' : ''}{row.priceVsLY.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-sm text-right font-mono text-text-primary">{row.margin.toFixed(1)}%</td>
                  <td className="px-6 py-3.5 text-sm text-right">
                    <span className={`inline-flex items-center gap-0.5 font-semibold ${row.marginVsLY >= 0 ? 'text-positive' : 'text-negative'}`}>
                      {row.marginVsLY >= 0 ? '+' : ''}{row.marginVsLY.toFixed(1)}pp
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-sm text-right font-mono text-text-primary">{row.volume.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
