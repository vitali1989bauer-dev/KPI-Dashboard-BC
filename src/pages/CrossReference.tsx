import { useMemo, useState } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { getCrossRefParts, type CrossRefData } from '../data/mockData'
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
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 border-b border-border bg-bg-warm/50 flex items-center justify-between">
        <div>
          <h3 className="text-[15px] font-bold text-text-primary">{part.partFamily}</h3>
          <p className="text-xs text-text-muted">{part.category} · {part.transactionCount} transactions {part.isLowN ? '(low n)' : ''}</p>
        </div>
        {part.isLowN && (
          <span className="px-2 py-0.5 rounded bg-warning/10 text-warning text-[10px] font-bold">LOW N — n={part.transactionCount}</span>
        )}
      </div>

      <div className={`p-5 ${part.isLowN ? 'opacity-55' : ''}`}>
        {/* KPI row */}
        <div className="grid grid-cols-6 gap-3 mb-5">
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
              {part.qtyDeltaPct >= 0 ? '+' : ''}{part.qtyDeltaPct.toFixed(1)}% vs PY ({part.quantityPY.toLocaleString()})
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

        {/* Price ladder */}
        <div className="grid grid-cols-2 gap-5 mb-5">
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

          {/* Realization trend sparkline */}
          <div>
            <p className="text-[11px] font-semibold text-text-muted uppercase mb-2">Realization Trend (9 months)</p>
            <MiniSparkline data={monthlyRealData} dataKey="value" color="#c8960c" height={60} />
            <p className="text-[11px] font-semibold text-text-muted uppercase mt-3 mb-2">Quantity Trend</p>
            <MiniSparkline data={monthlyQtyData} dataKey="value" color="#1a2332" height={60} />
          </div>
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

  return (
    <div>
      {/* Part selector table + Detail panel side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* LEFT: Part selector */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-[13px] font-semibold text-text-primary">Part Families</h3>
            <p className="text-xs text-text-muted">Click to see full picture. {parts.length} families.</p>
          </div>
          <div className="overflow-y-auto max-h-[680px]">
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

        {/* RIGHT: Detail panel — 2 cols */}
        <div className="lg:col-span-2 space-y-5">
          {selected && <PartDetailPanel part={selected} />}

          {/* Comparison bar: all parts realization */}
          <div className="bg-card rounded-lg border border-border p-5">
            <h3 className="text-[13px] font-semibold text-text-primary mb-3">All Parts — Realization Comparison</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={parts} layout="vertical" barCategoryGap="20%" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#dde1e8" horizontal={false} />
                <XAxis type="number" domain={[50, 100]} tick={{ fontSize: 10, fill: '#4a5568' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${v}%`} />
                <YAxis type="category" dataKey="partFamily" tick={{ fontSize: 10, fill: '#4a5568' }} axisLine={false} tickLine={false} width={100} />
                <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Realization']} contentStyle={{ borderRadius: '8px', border: '1px solid #dde1e8', fontSize: '12px' }} />
                <Bar dataKey="realizationPct" radius={[0, 4, 4, 0]} maxBarSize={16}>
                  {parts.map((p, i) => (
                    <Cell key={i} fill={i === selectedIdx ? '#c8960c' : p.realizationPct < 80 ? '#c43e3e' : p.realizationPct < 85 ? '#d49a1a' : '#4a6fa5'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="text-[10px] text-text-muted mt-2 text-center">
              In PowerBI: this is a drill-through page. Click any part family in any visual across the report → lands here with full context.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
