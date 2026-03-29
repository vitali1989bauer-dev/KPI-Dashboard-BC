import { useMemo, useState } from 'react'
import {
  LineChart,
  Line,
  ResponsiveContainer,
} from 'recharts'
import { getCrossRefParts, getSkuData, type CrossRefData } from '../data/mockData'
import { useFilters } from '../FilterContext'

function MiniSparkline({ data, dataKey, color, height = 50 }: { data: { month: string; value: number }[]; dataKey: string; color: string; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
        <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={1.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}

function PartDetailPanel({ part }: { part: CrossRefData }) {
  const monthlyRealData = part.months.map((m, i) => ({ month: m, value: part.monthlyReal[i] }))
  const monthlyQtyData = part.months.map((m, i) => ({ month: m, value: part.monthlyQty[i] }))

  return (
    <div className={`${part.isLowN ? 'opacity-55' : ''}`}>
      {/* KPI row */}
      <div className="grid grid-cols-6 gap-3 mb-4">
        <div>
          <p className="text-[10px] text-text-muted uppercase font-medium mb-0.5">Realization</p>
          <p className={`text-lg font-bold ${part.realizationPct < 80 ? 'text-negative' : part.realizationPct < 85 ? 'text-warning' : 'text-positive'}`}>{part.realizationPct.toFixed(1)}%</p>
          <p className="text-[10px] text-text-muted">Peer avg: {part.peerAvgReal.toFixed(1)}%</p>
        </div>
        <div>
          <p className="text-[10px] text-text-muted uppercase font-medium mb-0.5">Gross Margin</p>
          <p className={`text-lg font-bold ${part.marginPct < 25 ? 'text-negative' : 'text-text-primary'}`}>{part.marginPct.toFixed(1)}%</p>
          <p className={`text-[10px] ${part.marginPct >= part.marginPY ? 'text-positive' : 'text-negative'}`}>
            {part.marginPct >= part.marginPY ? '▲' : '▼'} {Math.abs(part.marginPct - part.marginPY).toFixed(1)}pp vs PY
          </p>
        </div>
        <div>
          <p className="text-[10px] text-text-muted uppercase font-medium mb-0.5">Qty CY / PY</p>
          <p className="text-lg font-bold text-text-primary">{part.quantityCY.toLocaleString()}</p>
          <p className={`text-[10px] ${part.qtyDeltaPct >= 0 ? 'text-positive' : 'text-negative'}`}>
            {part.qtyDeltaPct >= 0 ? '+' : ''}{part.qtyDeltaPct.toFixed(1)}% ({part.quantityPY.toLocaleString()})
          </p>
        </div>
        <div>
          <p className="text-[10px] text-text-muted uppercase font-medium mb-0.5">Revenue</p>
          <p className="text-lg font-bold text-text-primary">£{part.revenueCYk}k</p>
          <p className={`text-[10px] ${part.revDeltaPct >= 0 ? 'text-positive' : 'text-negative'}`}>
            {part.revDeltaPct >= 0 ? '+' : ''}{part.revDeltaPct.toFixed(1)}% vs PY
          </p>
        </div>
        <div>
          <p className="text-[10px] text-text-muted uppercase font-medium mb-0.5">Last-Mile</p>
          <p className="text-lg font-bold text-negative">{part.lastMilePct.toFixed(1)}%</p>
        </div>
        <div>
          <p className="text-[10px] text-text-muted uppercase font-medium mb-0.5">vs Peer Best</p>
          <p className={`text-lg font-bold ${part.realizationPct >= part.peerBestReal ? 'text-positive' : 'text-negative'}`}>
            {(part.realizationPct - part.peerBestReal).toFixed(1)}pp
          </p>
          <p className="text-[10px] text-text-muted">Best: {part.peerBestReal.toFixed(1)}%</p>
        </div>
      </div>

      {/* Price ladder + sparklines side by side */}
      <div className="grid grid-cols-2 gap-5">
        <div>
          <p className="text-[11px] font-semibold text-text-muted uppercase mb-2">Price Ladder</p>
          <div className="space-y-1.5">
            {[
              { label: 'Global List', value: part.listPrice, color: '#1a2332' },
              { label: 'Segment Price', value: part.segmentPrice, color: '#667885' },
              { label: 'Avg Net Price', value: part.avgNetPrice, color: '#1a8754' },
              { label: 'COGS', value: part.cogs, color: '#c43e3e' },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between text-[13px]">
                <span className="text-text-secondary">{row.label}</span>
                <span className="font-mono font-semibold" style={{ color: row.color }}>£{row.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[11px] font-semibold text-text-muted uppercase mb-1">Realization (9mo)</p>
          <MiniSparkline data={monthlyRealData} dataKey="value" color="#c8960c" height={45} />
          <p className="text-[11px] font-semibold text-text-muted uppercase mt-2 mb-1">Quantity (9mo)</p>
          <MiniSparkline data={monthlyQtyData} dataKey="value" color="#1a2332" height={45} />
        </div>
      </div>
    </div>
  )
}

export default function CrossReference() {
  const { filters } = useFilters()
  const parts = useMemo(() => getCrossRefParts(filters), [filters])
  const [selectedIdx, setSelectedIdx] = useState(0)

  const selected = parts[selectedIdx]
  const skus = useMemo(() => selected ? getSkuData(selected.partFamily, filters) : [], [selected, filters])

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* LEFT: Part family selector */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-[13px] font-semibold text-text-primary">Part Families</h3>
            <p className="text-xs text-text-muted">Select family → see KPIs + SKU breakdown</p>
          </div>
          <div className="overflow-y-auto max-h-[700px]">
            {parts.map((part, idx) => {
              const isSelected = idx === selectedIdx
              const realColor = part.realizationPct < 80 ? 'text-negative' : part.realizationPct < 85 ? 'text-warning' : 'text-positive'
              return (
                <button
                  key={part.partFamily}
                  onClick={() => setSelectedIdx(idx)}
                  className={`w-full text-left px-4 py-2.5 border-b border-border transition-all cursor-pointer ${
                    isSelected ? 'bg-accent/8 border-l-3 border-l-accent' : 'hover:bg-bg-warm border-l-3 border-l-transparent'
                  } ${part.isLowN ? 'opacity-55' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-[13px] font-semibold ${isSelected ? 'text-accent' : 'text-text-primary'}`}>{part.partFamily}</p>
                      <p className="text-[10px] text-text-muted">{part.category} · n={part.transactionCount}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-[13px] font-bold font-mono ${realColor}`}>{part.realizationPct.toFixed(1)}%</p>
                      <p className="text-[10px] text-text-muted font-mono">GM {part.marginPct.toFixed(0)}%</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* RIGHT: Detail + SKU table */}
        <div className="lg:col-span-2 space-y-4">
          {/* Family header */}
          {selected && (
            <div className="bg-card rounded-lg border border-border overflow-hidden">
              <div className="px-5 py-3 border-b border-border bg-bg-warm/50 flex items-center justify-between">
                <div>
                  <h3 className="text-[15px] font-bold text-text-primary">{selected.partFamily}</h3>
                  <p className="text-xs text-text-muted">{selected.category} · {selected.transactionCount} transactions</p>
                </div>
                {selected.isLowN && (
                  <span className="px-2 py-0.5 rounded bg-warning/10 text-warning text-[10px] font-bold">LOW N</span>
                )}
              </div>
              <div className="p-5">
                <PartDetailPanel part={selected} />
              </div>
            </div>
          )}

          {/* SKU table */}
          {selected && (
            <div className="bg-card rounded-lg border border-border overflow-hidden">
              <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                <div>
                  <h3 className="text-[13px] font-semibold text-text-primary">SKU Breakdown — {selected.partFamily}</h3>
                  <p className="text-xs text-text-muted">Individual material numbers. {skus.length} SKUs in this family.</p>
                </div>
                <span className="text-[10px] text-text-muted">Scope → {selected.category} → {selected.partFamily} → SKU</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-bg-warm">
                      <th className="text-left px-3 py-2 text-[10px] font-semibold text-text-muted uppercase">SKU</th>
                      <th className="text-left px-3 py-2 text-[10px] font-semibold text-text-muted uppercase">Description</th>
                      <th className="text-right px-3 py-2 text-[10px] font-semibold text-text-muted uppercase">List £</th>
                      <th className="text-right px-3 py-2 text-[10px] font-semibold text-text-muted uppercase">Net £</th>
                      <th className="text-right px-3 py-2 text-[10px] font-semibold text-text-muted uppercase">Real.%</th>
                      <th className="text-right px-3 py-2 text-[10px] font-semibold text-text-muted uppercase">GM%</th>
                      <th className="text-right px-3 py-2 text-[10px] font-semibold text-text-muted uppercase">Qty CY</th>
                      <th className="text-right px-3 py-2 text-[10px] font-semibold text-text-muted uppercase">Rev £k</th>
                      <th className="text-center px-3 py-2 text-[10px] font-semibold text-text-muted uppercase">Trend</th>
                      <th className="text-right px-3 py-2 text-[10px] font-semibold text-text-muted uppercase">Last Txn</th>
                      <th className="text-right px-2 py-2 text-[10px] font-semibold text-text-muted uppercase">n</th>
                    </tr>
                  </thead>
                  <tbody>
                    {skus.map((sku, idx) => (
                      <tr key={sku.sku} className={`border-t border-border cursor-pointer hover:bg-accent/5 ${idx % 2 ? 'bg-bg/30' : ''} ${sku.isLowN ? 'opacity-50' : ''}`}>
                        <td className="px-3 py-2 text-[12px] font-mono font-semibold text-accent">{sku.sku}</td>
                        <td className="px-3 py-2 text-[12px] text-text-secondary max-w-[200px] truncate">{sku.description}</td>
                        <td className="px-3 py-2 text-[12px] text-right font-mono text-text-muted">£{sku.listPrice}</td>
                        <td className="px-3 py-2 text-[12px] text-right font-mono font-semibold text-text-primary">£{sku.netPrice}</td>
                        <td className={`px-3 py-2 text-[12px] text-right font-mono font-semibold ${sku.realizationPct < 80 ? 'text-negative' : sku.realizationPct < 85 ? 'text-warning' : 'text-positive'}`}>
                          {sku.realizationPct.toFixed(1)}%
                        </td>
                        <td className={`px-3 py-2 text-[12px] text-right font-mono ${sku.marginPct < 25 ? 'text-negative font-semibold' : 'text-text-primary'}`}>
                          {sku.marginPct.toFixed(1)}%
                        </td>
                        <td className="px-3 py-2 text-[12px] text-right font-mono text-text-primary">{sku.qtyCY}</td>
                        <td className="px-3 py-2 text-[12px] text-right font-mono text-text-primary">£{sku.revenueCY}</td>
                        <td className="px-3 py-2 text-center">
                          <span className={`text-[11px] ${sku.priceChange === 'up' ? 'text-positive' : sku.priceChange === 'down' ? 'text-negative' : 'text-text-muted'}`}>
                            {sku.priceChange === 'up' ? '▲' : sku.priceChange === 'down' ? '▼' : '—'}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-[11px] text-right font-mono text-text-muted">{sku.lastTransactionDate}</td>
                        <td className="px-2 py-2 text-[11px] text-right font-mono text-text-muted">
                          {sku.transactionCount}
                          {sku.isLowN && <span className="ml-0.5 text-[9px]">⚠</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-2 border-t border-border text-[10px] text-text-muted">
                PowerBI: drill-through table. Click any family in scatter/heatmap → lands here with SKU-level detail. Hierarchy: Scope → Category → Family → SKU.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
