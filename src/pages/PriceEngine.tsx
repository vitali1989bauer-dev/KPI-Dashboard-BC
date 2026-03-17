import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import {
  AlertTriangle,
  AlertCircle,
  Info,
  Anchor,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Link2,
  Zap,
  X,
} from 'lucide-react'
import { createPortal } from 'react-dom'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import {
  getPriceEngineRows,
  getPriceEngineAlerts,
  getAnchorMarketLinks,
  getPriceEngineWaterfall,
  type PriceEngineRow,
  type PriceEngineAlert,
  type PricingStrategy,
  type PriceWaterfallStep,
} from '../data/mockData'
import { useFilters } from '../FilterContext'
import InfoTooltip from '../components/InfoTooltip'

// ---------------------------------------------------------------------------
// Waterfall builder (reused pattern from SCOEffect)
// ---------------------------------------------------------------------------
interface WfPoint {
  name: string
  base: number
  value: number
  displayValue: number
  fill: string
}

const C_TOTAL = '#173B7A'
const C_POS = '#1a8754'
const C_NEG = '#c43e3e'

function buildWf(raw: PriceWaterfallStep[]): WfPoint[] {
  const result: WfPoint[] = []
  let running = 0
  for (const item of raw) {
    if (item.type === 'start') {
      result.push({ name: item.name.replace('\n', ' '), base: 0, value: item.value, displayValue: item.value, fill: C_TOTAL })
      running = item.value
    } else if (item.type === 'end') {
      result.push({ name: item.name.replace('\n', ' '), base: 0, value: item.value, displayValue: item.value, fill: C_TOTAL })
    } else if (item.type === 'positive') {
      result.push({ name: item.name.replace('\n', ' '), base: running, value: item.value, displayValue: item.value, fill: C_POS })
      running += item.value
    } else {
      result.push({ name: item.name.replace('\n', ' '), base: running + item.value, value: Math.abs(item.value), displayValue: item.value, fill: C_NEG })
      running += item.value
    }
  }
  return result
}

// ---------------------------------------------------------------------------
// Alert severity badge
// ---------------------------------------------------------------------------
function SeverityBadge({ severity }: { severity: 'critical' | 'warning' | 'info' }) {
  const cfg = {
    critical: { bg: 'bg-red-50 border-red-200', text: 'text-red-700', icon: <AlertTriangle className="w-3.5 h-3.5" />, label: 'Critical' },
    warning: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', icon: <AlertCircle className="w-3.5 h-3.5" />, label: 'Warning' },
    info: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', icon: <Info className="w-3.5 h-3.5" />, label: 'Info' },
  }[severity]

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${cfg.bg} ${cfg.text}`}>
      {cfg.icon} {cfg.label}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Inline field tooltip (the (i) mouseover on highlighted fields)
// ---------------------------------------------------------------------------
function FieldAlertTooltip({ alert }: { alert: PriceEngineAlert }) {
  const [show, setShow] = useState(false)
  const [pos, setPos] = useState<{ top: number; left: number; flipped: boolean } | null>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  const updatePos = useCallback(() => {
    if (!btnRef.current) return
    const rect = btnRef.current.getBoundingClientRect()
    const tooltipH = tooltipRef.current?.offsetHeight || 160
    const flipped = rect.top < tooltipH + 12
    const tooltipW = 320
    const centerX = rect.left + rect.width / 2
    const minLeft = tooltipW / 2 + 8
    const maxLeft = window.innerWidth - tooltipW / 2 - 8
    setPos({
      top: flipped ? rect.bottom + 8 : rect.top - 8,
      left: Math.max(minLeft, Math.min(maxLeft, centerX)),
      flipped,
    })
  }, [])

  useEffect(() => {
    if (!show) return
    updatePos()
    requestAnimationFrame(updatePos)
    window.addEventListener('scroll', updatePos, true)
    window.addEventListener('resize', updatePos)
    return () => {
      window.removeEventListener('scroll', updatePos, true)
      window.removeEventListener('resize', updatePos)
    }
  }, [show, updatePos])

  return (
    <span className="relative inline-flex items-center ml-1">
      <button
        ref={btnRef}
        className="p-0.5 rounded-full text-amber-500 hover:text-amber-700 hover:bg-amber-50 transition-colors cursor-help"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
        type="button"
      >
        <Info className="w-3.5 h-3.5" />
      </button>
      {show && pos && createPortal(
        <div
          ref={tooltipRef}
          className="fixed z-[9999] w-80 bg-white border border-amber-200 rounded-xl shadow-xl p-4 text-xs leading-relaxed font-normal pointer-events-none"
          style={{
            top: pos.top,
            left: pos.left,
            transform: pos.flipped ? 'translate(-50%, 0)' : 'translate(-50%, -100%)',
          }}
        >
          <div className="flex items-center gap-1.5 mb-2">
            <SeverityBadge severity={alert.severity} />
            <span className="text-[10px] text-text-muted">Archetype: {alert.archetypeContext}</span>
          </div>
          <p className="font-semibold text-text-primary mb-1">{alert.title}</p>
          <p className="text-text-secondary mb-2">{alert.rationale}</p>
          <div className="bg-primary/5 border border-primary/15 rounded-lg p-2.5">
            <p className="font-semibold text-primary text-[11px]">Recommendation</p>
            <p className="text-text-primary mt-0.5">{alert.recommendation}</p>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {alert.relatedDrivers.map(d => (
              <span key={d} className="px-1.5 py-0.5 bg-bg-warm rounded text-[10px] text-text-muted">{d}</span>
            ))}
          </div>
          {pos.flipped ? (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-0 w-0 h-0 border-l-[6px] border-r-[6px] border-b-[6px] border-transparent border-b-white" />
          ) : (
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-white" />
          )}
        </div>,
        document.body
      )}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Editable cell component
// ---------------------------------------------------------------------------
function EditableCell({
  value,
  suffix,
  onChange,
  highlighted,
  alert,
}: {
  value: number
  suffix: string
  onChange: (v: number) => void
  highlighted?: boolean
  alert?: PriceEngineAlert
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(String(value))

  const commit = () => {
    const parsed = parseFloat(draft)
    if (!isNaN(parsed)) onChange(parsed)
    setEditing(false)
  }

  if (editing) {
    return (
      <input
        type="text"
        className="w-full px-2 py-1 text-sm font-mono text-right border border-primary rounded bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/30"
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false) }}
        autoFocus
      />
    )
  }

  return (
    <div
      className={`flex items-center justify-end gap-0.5 cursor-pointer rounded px-2 py-1 transition-all ${
        highlighted
          ? 'bg-amber-50 border border-amber-300 ring-1 ring-amber-200'
          : 'hover:bg-primary/5 border border-transparent'
      }`}
      onClick={() => { setDraft(String(value)); setEditing(true) }}
    >
      <span className="text-sm font-mono text-text-primary">{typeof value === 'number' ? value.toFixed(1) : value}</span>
      <span className="text-xs text-text-muted ml-0.5">{suffix}</span>
      {alert && <FieldAlertTooltip alert={alert} />}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Strategy selector
// ---------------------------------------------------------------------------
function StrategySelect({ value, onChange }: { value: PricingStrategy; onChange: (v: PricingStrategy) => void }) {
  return (
    <select
      className="text-xs border border-border rounded-lg px-2 py-1.5 bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
      value={value}
      onChange={e => onChange(e.target.value as PricingStrategy)}
    >
      <option value="">Select...</option>
      <option value="volume-driven">Volume-driven</option>
      <option value="price-driven">Price-driven</option>
    </select>
  )
}

// ---------------------------------------------------------------------------
// Alert card (expanded view in the alerts panel)
// ---------------------------------------------------------------------------
function AlertCard({
  alert,
  onApply,
  onDismiss,
}: {
  alert: PriceEngineAlert
  onApply: () => void
  onDismiss: () => void
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={`rounded-xl border p-4 transition-all ${
      alert.severity === 'critical' ? 'bg-red-50/50 border-red-200' :
      alert.severity === 'warning' ? 'bg-amber-50/50 border-amber-200' :
      'bg-blue-50/50 border-blue-200'
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <SeverityBadge severity={alert.severity} />
            <span className="text-[10px] text-text-muted font-medium uppercase tracking-wide">{alert.archetypeContext} Archetype</span>
          </div>
          <p className="text-sm font-semibold text-text-primary leading-snug">{alert.title}</p>
          <p className="text-xs text-text-secondary mt-1">{alert.description}</p>
        </div>
        <button onClick={onDismiss} className="p-1 rounded-lg hover:bg-black/5 text-text-muted">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Recommendation box */}
      <div className="mt-3 bg-white/80 border border-primary/15 rounded-lg p-3">
        <div className="flex items-center gap-1.5 mb-1">
          <Zap className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-semibold text-primary">Recommended Action</span>
        </div>
        <p className="text-xs text-text-primary">{alert.recommendation}</p>
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={onApply}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary/90 transition-colors"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Apply Recommendation
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-1 px-2 py-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors"
          >
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {expanded ? 'Less detail' : 'Rationale & drivers'}
          </button>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="mt-3 space-y-2">
          <div className="bg-white/60 rounded-lg p-3 border border-border/50">
            <p className="text-[11px] font-semibold text-text-secondary mb-1 uppercase tracking-wide">Archetype & Situation Context</p>
            <p className="text-xs text-text-primary">{alert.rationale}</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <span className="text-[10px] text-text-muted font-medium">Related analytics:</span>
            {alert.relatedDrivers.map(d => (
              <span key={d} className="px-2 py-0.5 bg-primary/5 border border-primary/10 rounded-full text-[10px] text-primary font-medium">{d}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Anchor Market panel
// ---------------------------------------------------------------------------
function AnchorMarketPanel({ rows, onPropagate }: {
  rows: PriceEngineRow[]
  onPropagate: (anchorId: string) => void
}) {
  const links = getAnchorMarketLinks()

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center gap-2 mb-4">
        <Anchor className="w-5 h-5 text-primary" />
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
          Anchor Markets (Ankermärkte)
        </h3>
        <InfoTooltip text="Anchor markets set the price reference for linked regions. When you adjust prices in an anchor market, linked markets can be automatically updated based on parity rules (e.g., CIF parity + logistics delta)." />
      </div>
      <div className="space-y-3">
        {links.map(link => {
          const anchor = rows.find(r => r.id === link.anchorId)
          if (!anchor) return null
          return (
            <div key={link.anchorId} className="bg-bg-warm/50 rounded-lg border border-border/70 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 rounded-lg">
                  <Anchor className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-semibold text-primary">{link.anchorLabel}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-text-muted" />
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-bg-warm rounded-lg">
                  <Link2 className="w-3.5 h-3.5 text-text-secondary" />
                  <span className="text-xs text-text-secondary">{link.linkedLabel}</span>
                </div>
              </div>
              <p className="text-[11px] text-text-muted mb-3">{link.rule}</p>
              <button
                onClick={() => onPropagate(link.anchorId)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary text-xs font-semibold rounded-lg hover:bg-primary/20 transition-colors border border-primary/20"
              >
                <Link2 className="w-3.5 h-3.5" />
                Propagate to linked markets
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Price Engine page
// ---------------------------------------------------------------------------
export default function PriceEngine() {
  const { filters } = useFilters()
  const initialRows = useMemo(() => getPriceEngineRows(filters), [filters])
  const alerts = useMemo(() => getPriceEngineAlerts(filters), [filters])
  const waterfallRaw = useMemo(() => getPriceEngineWaterfall(filters), [filters])
  const waterfallData = useMemo(() => buildWf(waterfallRaw), [waterfallRaw])

  const [rows, setRows] = useState<PriceEngineRow[]>(initialRows)
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set())
  const [appliedAlerts, setAppliedAlerts] = useState<Set<string>>(new Set())
  const [propagated, setPropagated] = useState<Set<string>>(new Set())

  // Reset rows when filters change
  useMemo(() => {
    setRows(initialRows)
    setDismissedAlerts(new Set())
    setAppliedAlerts(new Set())
    setPropagated(new Set())
  }, [initialRows])

  const activeAlerts = alerts.filter(a => !dismissedAlerts.has(a.id) && !appliedAlerts.has(a.id))
  const alertsByRow = useMemo(() => {
    const map = new Map<string, Map<string, PriceEngineAlert>>()
    for (const a of activeAlerts) {
      if (!map.has(a.rowId)) map.set(a.rowId, new Map())
      map.get(a.rowId)!.set(a.field, a)
    }
    return map
  }, [activeAlerts])

  const updateRow = useCallback((id: string, field: keyof PriceEngineRow, value: number | string) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r))
  }, [])

  const applyAlert = useCallback((alert: PriceEngineAlert) => {
    // Apply the recommended delta to the affected field
    setRows(prev => prev.map(r => {
      if (r.id !== alert.rowId) return r
      const fieldVal = r[alert.field as keyof PriceEngineRow] as number
      const newVal = Math.round((fieldVal * (1 + alert.recommendedDelta / 100)) * 10) / 10
      return { ...r, [alert.field]: newVal }
    }))
    setAppliedAlerts(prev => new Set(prev).add(alert.id))
  }, [])

  const propagateAnchor = useCallback((anchorId: string) => {
    const links = getAnchorMarketLinks()
    const link = links.find(l => l.anchorId === anchorId)
    if (!link) return
    const anchor = rows.find(r => r.id === anchorId)
    if (!anchor) return

    setRows(prev => prev.map(r => {
      if (!link.linkedIds.includes(r.id)) return r
      // Apply proportional adjustment based on the anchor's current values
      // Simple rule: match the anchor's margin targets with a regional offset
      const marginOffset = r.targetMargin - anchor.targetMargin
      return {
        ...r,
        targetMargin: Math.round((anchor.targetMargin + marginOffset * 0.8) * 10) / 10,
        limitMargin: Math.round((anchor.limitMargin + (r.limitMargin - anchor.limitMargin) * 0.8) * 10) / 10,
      }
    }))
    setPropagated(prev => new Set(prev).add(anchorId))
  }, [rows])

  // Count auto-filled vs manual
  const autoCount = rows.filter(r => !r.isAnchor && r.anchorMarket).length
  const manualCount = rows.length - autoCount

  // Volume totals
  const totalVolTarget = rows.reduce((s, r) => s + r.volumeTargetMT, 0)
  const totalVolActual = rows.reduce((s, r) => s + r.volumeActualMT, 0)
  const totalVolPct = totalVolTarget > 0 ? (totalVolActual / totalVolTarget) * 100 : 0

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-text-primary">
          Price Engine
          <InfoTooltip text="Central pricing tool for managing target prices, limit prices, and margin corridors across all regions, products, and customer archetypes. Includes archetype & situation-based recommendations and anchor market propagation." />
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          Limit- &amp; target price strategy — input, adjust, propagate
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-card rounded-xl border border-border p-5 card-hover">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">Pricing Rows</p>
          <p className="text-2xl font-bold text-text-primary">{rows.length}</p>
          <p className="text-[11px] text-text-secondary mt-0.5">{manualCount} manual · {autoCount} auto-linked</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 card-hover">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">Active Alerts</p>
          <div className="flex items-center gap-2">
            <p className={`text-2xl font-bold ${activeAlerts.length > 0 ? 'text-amber-600' : 'text-positive'}`}>
              {activeAlerts.length}
            </p>
            {activeAlerts.filter(a => a.severity === 'critical').length > 0 && (
              <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-full">
                {activeAlerts.filter(a => a.severity === 'critical').length} critical
              </span>
            )}
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 card-hover">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">Anchor Markets</p>
          <p className="text-2xl font-bold text-text-primary">{rows.filter(r => r.isAnchor).length}</p>
          <p className="text-[11px] text-text-secondary mt-0.5">{getAnchorMarketLinks().length} linkage rules active</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 card-hover">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">Recommendations Applied</p>
          <p className="text-2xl font-bold text-positive">{appliedAlerts.size}</p>
          <p className="text-[11px] text-text-secondary mt-0.5">{propagated.size} anchor propagations</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 card-hover">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">Volume Achievement</p>
          <div className="flex items-baseline gap-1.5">
            <p className={`text-2xl font-bold ${totalVolPct >= 80 ? 'text-positive' : totalVolPct >= 60 ? 'text-warning' : 'text-negative'}`}>
              {totalVolPct.toFixed(0)}%
            </p>
            <span className="text-xs text-text-muted">YTD</span>
          </div>
          <p className="text-[11px] text-text-secondary mt-0.5">
            {(totalVolActual / 1000).toFixed(0)}k / {(totalVolTarget / 1000).toFixed(0)}k MT
          </p>
        </div>
      </div>

      {/* Alerts Panel */}
      {activeAlerts.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            Price Alerts &amp; Recommendations
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {activeAlerts.map(alert => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onApply={() => applyAlert(alert)}
                onDismiss={() => setDismissedAlerts(prev => new Set(prev).add(alert.id))}
              />
            ))}
          </div>
        </div>
      )}

      {/* Main Pricing Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
            General Parameters — Pricing Strategy
          </h3>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-primary/10 border border-primary/30 inline-block" />
              Auto-filled
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-white border border-border inline-block" />
              Manual input
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-amber-50 border border-amber-300 inline-block" />
              Alert — review needed
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-bg-warm">
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider w-10"></th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Region</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Customer</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Product</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Target Price</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Limit Price</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Target Margin</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Limit Margin</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Strategy</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Vol. Target</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Vol. Actual</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Achievement</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => {
                const rowAlerts = alertsByRow.get(row.id)
                const isLinked = !!row.anchorMarket
                return (
                  <tr
                    key={row.id}
                    className={`border-t border-border hover:bg-bg-warm/50 transition-colors ${
                      idx % 2 === 0 ? '' : 'bg-bg/50'
                    } ${isLinked ? 'bg-primary/[0.02]' : ''}`}
                  >
                    <td className="px-4 py-2.5 text-center">
                      {row.isAnchor && (
                        <span title="Anchor market — price reference for linked regions">
                          <Anchor className="w-4 h-4 text-primary" />
                        </span>
                      )}
                      {isLinked && (
                        <span title={`Linked to anchor: ${rows.find(r => r.id === row.anchorMarket)?.region || ''}`}>
                          <Link2 className="w-4 h-4 text-text-muted" />
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-sm font-semibold text-text-primary">{row.region}</td>
                    <td className="px-4 py-2.5 text-sm text-text-secondary">{row.customerType}</td>
                    <td className="px-4 py-2.5 text-sm text-text-primary">{row.customer}</td>
                    <td className="px-4 py-2.5 text-sm text-text-primary">{row.product}</td>
                    <td className="px-4 py-2.5">
                      <EditableCell
                        value={row.targetPrice}
                        suffix={row.currency}
                        onChange={v => updateRow(row.id, 'targetPrice', v)}
                        highlighted={rowAlerts?.has('targetPrice')}
                        alert={rowAlerts?.get('targetPrice')}
                      />
                    </td>
                    <td className="px-4 py-2.5">
                      <EditableCell
                        value={row.limitPrice}
                        suffix={row.currency}
                        onChange={v => updateRow(row.id, 'limitPrice', v)}
                        highlighted={rowAlerts?.has('limitPrice')}
                        alert={rowAlerts?.get('limitPrice')}
                      />
                    </td>
                    <td className="px-4 py-2.5">
                      <EditableCell
                        value={row.targetMargin}
                        suffix="%"
                        onChange={v => updateRow(row.id, 'targetMargin', v)}
                        highlighted={rowAlerts?.has('targetMargin')}
                        alert={rowAlerts?.get('targetMargin')}
                      />
                    </td>
                    <td className="px-4 py-2.5">
                      <EditableCell
                        value={row.limitMargin}
                        suffix="%"
                        onChange={v => updateRow(row.id, 'limitMargin', v)}
                        highlighted={rowAlerts?.has('limitMargin')}
                        alert={rowAlerts?.get('limitMargin')}
                      />
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <StrategySelect
                        value={row.strategy}
                        onChange={v => updateRow(row.id, 'strategy', v)}
                      />
                    </td>
                    <td className="px-4 py-2.5 text-right text-sm text-text-secondary font-mono">
                      {(row.volumeTargetMT / 1000).toFixed(0)}k
                    </td>
                    <td className="px-4 py-2.5 text-right text-sm text-text-primary font-mono">
                      {(row.volumeActualMT / 1000).toFixed(0)}k
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      {(() => {
                        const pct = row.volumeTargetMT > 0 ? (row.volumeActualMT / row.volumeTargetMT) * 100 : 0
                        const color = pct >= 80 ? 'text-positive bg-positive/10' : pct >= 60 ? 'text-warning bg-warning/10' : 'text-negative bg-negative/10'
                        return (
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}>
                            {pct.toFixed(0)}%
                          </span>
                        )
                      })()}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Price Waterfall — full width */}
      <div className="bg-card rounded-xl border border-border p-5 mb-6">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-4 flex items-center gap-2">
          Impact on Price Waterfall
          <InfoTooltip text="Shows how individual pricing components (list price adjustments, index changes, energy surcharges, freight, FX, conditions, rebates) build up from the base price to the current net price." />
        </h3>
        <ResponsiveContainer width="100%" height={360}>
          <BarChart data={waterfallData} barGap={0}>
            <CartesianGrid strokeDasharray="3 3" stroke="#d5dbe3" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: '#4a5568' }}
              axisLine={{ stroke: '#d5dbe3' }}
              tickLine={false}
              interval={0}
              angle={-15}
              textAnchor="end"
              height={55}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#4a5568' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `${v}`}
            />
            <RechartsTooltip
              formatter={(_value, _name, entry) => {
                const dv = (entry as unknown as { payload: WfPoint }).payload.displayValue
                return [`${dv >= 0 ? '+' : ''}${dv.toFixed(1)} €/MT`, '']
              }}
              contentStyle={{ borderRadius: '10px', border: '1px solid #d5dbe3', boxShadow: '0 4px 16px rgba(23,59,122,0.08)', fontSize: '12px' }}
            />
            <Bar dataKey="base" stackId="a" fill="transparent" radius={0} />
            <Bar dataKey="value" stackId="a" radius={[4, 4, 0, 0]} maxBarSize={52}>
              {waterfallData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Anchor Markets — below waterfall */}
      <AnchorMarketPanel rows={rows} onPropagate={propagateAnchor} />
    </div>
  )
}
