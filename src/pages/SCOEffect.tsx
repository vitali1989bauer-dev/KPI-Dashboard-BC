import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts'
import { getExecSummaryKpis, getPriceWaterfall, getLastMileDistribution, getVolumeByCategory, getMonthlyVolume, getRevenueBridge, getTransactionCount } from '../data/mockData'
import { useFilters } from '../FilterContext'

const TOTAL_COLOR = '#1a2332'
const NEGATIVE_COLOR = '#c43e3e'
const POSITIVE_COLOR = '#1a8754'
const INTERMEDIATE_COLOR = '#667885'
const TARGET_COLOR = '#1a8754'

interface WfPoint {
  name: string
  base: number
  value: number
  displayValue: number
  fill: string
}

function buildWf(steps: { name: string; value: number; type: string }[]): WfPoint[] {
  const result: WfPoint[] = []
  let running = 0
  for (const item of steps) {
    if (item.type === 'start') {
      result.push({ name: item.name.replace('\n', ' '), base: 0, value: item.value, displayValue: item.value, fill: TOTAL_COLOR })
      running = item.value
    } else if (item.type === 'end') {
      const isFinal = item.name.includes('Net') || item.name.includes('CY')
      result.push({ name: item.name.replace('\n', ' '), base: 0, value: item.value, displayValue: item.value, fill: isFinal ? TARGET_COLOR : INTERMEDIATE_COLOR })
      running = item.value
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

export default function ExecutiveSummary() {
  const { filters } = useFilters()
  const kpis = useMemo(() => getExecSummaryKpis(filters), [filters])
  const waterfallSteps = useMemo(() => getPriceWaterfall(filters), [filters])
  const wfData = useMemo(() => buildWf(waterfallSteps), [waterfallSteps])
  const lastMile = useMemo(() => getLastMileDistribution(filters), [filters])
  const volumeByCat = useMemo(() => getVolumeByCategory(filters), [filters])
  const monthlyVol = useMemo(() => getMonthlyVolume(filters), [filters])
  const revBridge = useMemo(() => getRevenueBridge(filters), [filters])
  const revBridgeData = useMemo(() => buildWf(revBridge), [revBridge])
  const txn = useMemo(() => getTransactionCount(filters), [filters])

  const targetLine = waterfallSteps.find(s => s.name.includes('Segment'))?.value ?? 90

  return (
    <div>
      {/* KPI Cards */}
      <div className="grid grid-cols-5 gap-3 mb-5">
        {kpis.map((kpi) => (
          <div key={kpi.id} className={`bg-card rounded-lg border border-border p-3.5 card-hover ${txn.isLowN ? 'opacity-55' : ''}`}>
            <p className="text-[10px] font-medium text-text-muted uppercase tracking-wide mb-0.5">{kpi.label}</p>
            <p className={`text-xl font-bold ${txn.isSuppressed ? 'text-text-muted' : kpi.status === 'negative' ? 'text-negative' : kpi.status === 'positive' ? 'text-positive' : 'text-text-primary'}`}>
              {txn.isSuppressed ? '—' : kpi.value}
            </p>
            <p className={`text-[11px] mt-0.5 ${kpi.status === 'negative' ? 'text-negative' : kpi.status === 'positive' ? 'text-positive' : 'text-text-muted'}`}>
              {txn.isSuppressed ? '' : kpi.subtitle}
            </p>
          </div>
        ))}
      </div>

      {/* Row 1: Price Waterfall + Last-Mile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <div className="lg:col-span-2 bg-card rounded-lg border border-border p-5">
          <h3 className="text-[13px] font-semibold text-text-primary mb-0.5">Price Waterfall — Average Transaction</h3>
          <p className="text-xs text-text-muted mb-3">Index: Global list = 100.</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={wfData} barCategoryGap="14%">
              <CartesianGrid strokeDasharray="3 3" stroke="#dde1e8" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#4a5568' }} axisLine={{ stroke: '#dde1e8' }} tickLine={false} />
              <YAxis domain={[50, 110]} tick={{ fontSize: 11, fill: '#4a5568' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(_v, _n, props) => { const p = (props as { payload: WfPoint }).payload; return [p.displayValue.toFixed(1), p.fill === NEGATIVE_COLOR ? 'Adj.' : 'Index'] }} contentStyle={{ borderRadius: '8px', border: '1px solid #dde1e8', fontSize: '12px' }} />
              <ReferenceLine y={targetLine} stroke="#1a8754" strokeDasharray="8 4" strokeWidth={1} label={{ value: `Target ${targetLine.toFixed(1)}`, position: 'right', fontSize: 9, fill: '#1a8754' }} />
              <Bar dataKey="base" stackId="wf" fill="transparent" radius={0} />
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <Bar dataKey="value" stackId="wf" radius={[4, 4, 0, 0]} label={(props: any) => {
                const { x, y, width, index } = props as { x: number; y: number; width: number; index: number }
                if (index == null || !wfData[index]) return null
                const e = wfData[index]
                return <text x={(x ?? 0) + (width ?? 0) / 2} y={(y ?? 0) - 6} textAnchor="middle" fill={e.fill} fontSize={11} fontWeight={600}>{e.displayValue.toFixed(1)}</text>
              }}>
                {wfData.map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-lg border border-border p-5">
          <h3 className="text-[13px] font-semibold text-text-primary mb-0.5">Last-Mile by Category</h3>
          <p className="text-xs text-text-muted mb-4">Discretionary discount by material category.</p>
          <div className="space-y-3">
            {lastMile.map((item) => (
              <div key={item.category} className="flex items-center gap-2">
                <div className="w-28 text-[11px] text-text-secondary font-medium text-right shrink-0">{item.category}</div>
                <div className="flex-1 h-5 bg-bg-warm rounded overflow-hidden">
                  <div className="h-full rounded" style={{ width: `${Math.min(100, Math.abs(item.discount) / 14 * 100)}%`, backgroundColor: item.color }} />
                </div>
                <span className="text-[12px] font-bold w-12 text-right" style={{ color: item.color }}>{item.discount.toFixed(1)}%</span>
              </div>
            ))}
          </div>
          {(() => {
            const sorted = [...lastMile].sort((a, b) => a.discount - b.discount)
            const worst = sorted[0], best = sorted[sorted.length - 1]
            const ratio = Math.round(Math.abs(worst.discount / best.discount) * 10) / 10
            return (
              <div className="mt-4 p-2.5 bg-bg-warm rounded-lg border-l-3 border-l-negative text-xs">
                <span className="font-semibold">{worst.category} at {worst.discount.toFixed(1)}%</span>
                <span className="text-text-muted"> — {ratio}× {best.category}</span>
              </div>
            )
          })()}
        </div>
      </div>

      {/* Row 2: Volume by Category + Revenue Bridge */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <div className="bg-card rounded-lg border border-border p-5">
          <h3 className="text-[13px] font-semibold text-text-primary mb-0.5">Quantity Development by Category</h3>
          <p className="text-xs text-text-muted mb-3">Volume ↑ + Revenue flat = price erosion signal.</p>
          <table className="w-full">
            <thead>
              <tr className="bg-bg-warm">
                <th className="text-left px-3 py-2 text-[10px] font-semibold text-text-muted uppercase">Cat.</th>
                <th className="text-right px-2 py-2 text-[10px] font-semibold text-text-muted uppercase">Qty CY</th>
                <th className="text-right px-2 py-2 text-[10px] font-semibold text-text-muted uppercase">Qty PY</th>
                <th className="text-right px-2 py-2 text-[10px] font-semibold text-text-muted uppercase">Qty Δ</th>
                <th className="text-right px-2 py-2 text-[10px] font-semibold text-text-muted uppercase">Rev £k</th>
                <th className="text-right px-2 py-2 text-[10px] font-semibold text-text-muted uppercase">Rev Δ</th>
              </tr>
            </thead>
            <tbody>
              {volumeByCat.map((row, idx) => {
                const erosion = row.deltaPct > 2 && row.revDeltaPct < row.deltaPct * 0.5
                return (
                  <tr key={row.category} className={`border-t border-border ${idx % 2 ? 'bg-bg/30' : ''}`}>
                    <td className="px-3 py-2 text-[13px] font-semibold">{row.category}</td>
                    <td className="px-2 py-2 text-[13px] text-right font-mono">{row.currentQty.toLocaleString()}</td>
                    <td className="px-2 py-2 text-[13px] text-right font-mono text-text-muted">{row.priorYearQty.toLocaleString()}</td>
                    <td className={`px-2 py-2 text-[13px] text-right font-mono font-semibold ${row.deltaPct >= 0 ? 'text-positive' : 'text-negative'}`}>{row.deltaPct >= 0 ? '+' : ''}{row.deltaPct.toFixed(1)}%</td>
                    <td className="px-2 py-2 text-[13px] text-right font-mono">£{row.revenueCurrentK}</td>
                    <td className="px-2 py-2 text-[13px] text-right">
                      <span className={`font-mono font-semibold ${row.revDeltaPct >= 0 ? 'text-positive' : 'text-negative'}`}>{row.revDeltaPct >= 0 ? '+' : ''}{row.revDeltaPct.toFixed(1)}%</span>
                      {erosion && <span className="ml-1 text-[9px] text-warning font-bold">⚠</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="bg-card rounded-lg border border-border p-5">
          <h3 className="text-[13px] font-semibold text-text-primary mb-0.5">Revenue Bridge — Price × Volume</h3>
          <p className="text-xs text-text-muted mb-3">What drove the change?</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={revBridgeData} barCategoryGap="12%">
              <CartesianGrid strokeDasharray="3 3" stroke="#dde1e8" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#4a5568' }} axisLine={{ stroke: '#dde1e8' }} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#4a5568' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `£${v}`} />
              <Tooltip formatter={(_v, _n, props) => { const p = (props as { payload: WfPoint }).payload; return [`£${p.displayValue >= 0 ? '+' : ''}${p.displayValue}k`, ''] }} contentStyle={{ borderRadius: '8px', border: '1px solid #dde1e8', fontSize: '12px' }} />
              <Bar dataKey="base" stackId="a" fill="transparent" radius={0} />
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <Bar dataKey="value" stackId="a" radius={[4, 4, 0, 0]} label={(props: any) => {
                const { x, y, width, index } = props as { x: number; y: number; width: number; index: number }
                if (index == null || !revBridgeData[index]) return null
                const e = revBridgeData[index]
                const isTotal = e.fill === TOTAL_COLOR
                return <text x={(x ?? 0) + (width ?? 0) / 2} y={(y ?? 0) - 5} textAnchor="middle" fill={e.fill} fontSize={10} fontWeight={600}>{isTotal ? `£${e.displayValue}` : `${e.displayValue >= 0 ? '+' : ''}${e.displayValue}`}</text>
              }}>
                {revBridgeData.map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3: Monthly Trend */}
      <div className="bg-card rounded-lg border border-border p-5">
        <h3 className="text-[13px] font-semibold text-text-primary mb-0.5">Monthly Quantity & Revenue</h3>
        <p className="text-xs text-text-muted mb-3">CY vs PY. Divergence signals price/mix shift.</p>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={monthlyVol} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#dde1e8" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#4a5568' }} axisLine={{ stroke: '#dde1e8' }} tickLine={false} />
            <YAxis yAxisId="qty" tick={{ fontSize: 10, fill: '#4a5568' }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="rev" orientation="right" tick={{ fontSize: 10, fill: '#4a5568' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #dde1e8', fontSize: '12px' }} />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} iconType="circle" iconSize={6} />
            <Line yAxisId="qty" type="monotone" dataKey="quantity" name="Qty CY" stroke="#1a2332" strokeWidth={2} dot={{ r: 2.5 }} />
            <Line yAxisId="qty" type="monotone" dataKey="quantityPY" name="Qty PY" stroke="#1a2332" strokeWidth={1} strokeDasharray="6 3" dot={false} />
            <Line yAxisId="rev" type="monotone" dataKey="revenueK" name="Rev CY £k" stroke="#c8960c" strokeWidth={2} dot={{ r: 2.5 }} />
            <Line yAxisId="rev" type="monotone" dataKey="revenuePYK" name="Rev PY £k" stroke="#c8960c" strokeWidth={1} strokeDasharray="6 3" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
