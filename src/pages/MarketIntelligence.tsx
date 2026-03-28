import { useMemo, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts'
import { getPeerBenchmark, getGreyMarketAlerts, getRegionalKpis, getSubSegmentBenchmark, getTransactionCount, LOW_N_THRESHOLD } from '../data/mockData'
import { useFilters } from '../FilterContext'

type TabId = 'peer' | 'subsegments'

export default function RegionalBenchmark() {
  const { filters } = useFilters()
  const [activeTab, setActiveTab] = useState<TabId>('peer')
  const { peerGroupName, countries } = useMemo(() => getPeerBenchmark(filters), [filters])
  const greyAlerts = useMemo(() => getGreyMarketAlerts(filters), [filters])
  const kpis = useMemo(() => getRegionalKpis(filters), [filters])
  const subSegBenchmark = useMemo(() => getSubSegmentBenchmark(filters), [filters])
  const txn = useMemo(() => getTransactionCount(filters), [filters])

  const peerAvg = countries.reduce((s, c) => s + c.realizationPct, 0) / countries.length
  const regionCode = filters.region.split(' · ')[1] || 'UK'

  return (
    <div>
      {/* Sub-tabs */}
      <div className="flex items-center gap-1 mb-6">
        <button
          onClick={() => setActiveTab('peer')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${activeTab === 'peer' ? 'bg-accent text-white' : 'text-text-muted hover:bg-bg-warm border border-border'}`}
        >
          Peer Benchmark
        </button>
        <button
          onClick={() => setActiveTab('subsegments')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${activeTab === 'subsegments' ? 'bg-accent text-white' : 'text-text-muted hover:bg-bg-warm border border-border'}`}
        >
          My Sub-Segments
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {kpis.map((kpi) => {
          const accentBorder = {
            red: 'border-t-negative',
            blue: 'border-t-primary',
            green: 'border-t-positive',
            amber: 'border-t-warning',
          }
          return (
            <div key={kpi.label} className={`bg-card rounded-xl border border-border border-t-3 ${accentBorder[kpi.accentColor]} p-5 card-hover ${txn.isLowN ? 'opacity-60' : ''}`}>
              <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide mb-1">{kpi.label}</p>
              <p className={`text-3xl font-bold ${txn.isSuppressed ? 'text-text-muted' : kpi.status === 'negative' ? 'text-negative' : kpi.status === 'positive' ? 'text-positive' : 'text-primary'}`}>
                {txn.isSuppressed ? '—' : kpi.value}
              </p>
              <p className="text-xs text-text-muted mt-1">{txn.isSuppressed ? 'Insufficient data' : kpi.subtitle}</p>
              {txn.isLowN && !txn.isSuppressed && (
                <span className="text-[9px] font-bold text-text-muted bg-bg-warm px-1.5 py-0.5 rounded border border-border mt-1 inline-block">n={txn.count}</span>
              )}
            </div>
          )
        })}
      </div>

      {/* TAB: Peer Benchmark */}
      {activeTab === 'peer' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-1">
              <div>
                <h3 className="text-sm font-bold text-text-primary">
                  Realization Rate — {peerGroupName} Peer Benchmark
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  {filters.segment} segment · {filters.timePeriod} 2026. {regionCode} user sees own bar (gold) + peer range. Raw peer transactions not visible (RLS).
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold text-accent bg-accent/10">
                Auto-matched peer group
              </span>
            </div>

            <ResponsiveContainer width="100%" height={380}>
              <BarChart data={countries} barCategoryGap="25%" margin={{ top: 30, right: 20, bottom: 10, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d5dbe3" vertical={false} />
                <XAxis
                  dataKey="code"
                  tick={{ fontSize: 12, fill: '#4a5568' }}
                  axisLine={{ stroke: '#d5dbe3' }}
                  tickLine={false}
                  tickFormatter={(v: string) => {
                    const c = countries.find(c => c.code === v)
                    return c?.isYou ? `${v} (You)` : v
                  }}
                />
                <YAxis domain={[75, 90]} tick={{ fontSize: 11, fill: '#4a5568' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${v}%`} />
                <Tooltip
                  formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Realization']}
                  contentStyle={{ borderRadius: '10px', border: '1px solid #d5dbe3', boxShadow: '0 4px 16px rgba(26,35,50,0.08)', fontSize: '13px' }}
                />
                <ReferenceLine y={peerAvg} stroke="#667885" strokeDasharray="8 4" strokeWidth={1} label={{ value: `Peer avg ${peerAvg.toFixed(1)}%`, position: 'right', fontSize: 10, fill: '#667885' }} />
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <Bar dataKey="realizationPct" radius={[6, 6, 0, 0]} maxBarSize={52} label={(props: any) => {
                  const { x, y, width, index } = props as { x: number; y: number; width: number; index: number }
                  if (index == null || !countries[index]) return null
                  return (
                    <text x={(x ?? 0) + (width ?? 0) / 2} y={(y ?? 0) - 8} textAnchor="middle" fill={countries[index].isYou ? '#c8960c' : '#1a2332'} fontSize={12} fontWeight={600}>
                      {countries[index].realizationPct.toFixed(1)}%
                    </text>
                  )
                }}>
                  {countries.map((c, idx) => (
                    <Cell key={idx} fill={c.isYou ? '#c8960c' : '#4a6fa5'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {greyAlerts.length > 0 && (
              <div className="mt-3 px-4 py-2 bg-negative/5 border border-negative/20 rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-negative flex-shrink-0" />
                <p className="text-xs text-text-secondary">
                  <strong className="text-negative">{greyAlerts[0].country} ({greyAlerts[0].code})</strong>, not in peer group at {greyAlerts[0].realizationPct.toFixed(1)}% — grey market alert: price gap &gt;15% vs. {regionCode}
                </p>
              </div>
            )}
          </div>

          {/* Margin by Category Table */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="text-sm font-bold text-text-primary">Margin Benchmark by Category</h3>
              <p className="text-xs text-text-muted mt-0.5">
                Cat. 200 only. Spot where {regionCode} leaves money on table vs. {peerGroupName} leaders.
              </p>
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-bg-warm">
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-text-muted uppercase">Country</th>
                  <th className="text-right px-3 py-2.5 text-[10px] font-semibold text-text-muted uppercase">Realiz.</th>
                  <th className="text-right px-3 py-2.5 text-[10px] font-semibold text-text-muted uppercase">GM%</th>
                  <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-text-muted uppercase">Flag</th>
                </tr>
              </thead>
              <tbody>
                {countries.map((c, idx) => (
                  <tr key={c.code} className={`border-t border-border ${idx % 2 === 0 ? '' : 'bg-bg/50'}`}>
                    <td className="px-4 py-2.5 text-sm">
                      <span className={`font-semibold ${c.isYou ? 'text-accent' : 'text-text-primary'}`}>
                        {c.code} {c.name} {c.isYou ? '(You)' : ''}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-sm text-right font-mono font-semibold text-text-primary">{c.realizationPct.toFixed(1)}%</td>
                    <td className="px-3 py-2.5 text-sm text-right font-mono font-semibold text-text-primary">{c.marginPct.toFixed(1)}%</td>
                    <td className="px-3 py-2.5 text-sm">
                      {c.flag === 'benchmark' && <span className="text-positive text-xs font-semibold">↑ Benchmark</span>}
                      {c.flag === 'watch' && <span className="text-warning text-xs font-semibold">↓ Watch</span>}
                      {c.flag === 'grey-market' && <span className="text-negative text-xs font-semibold">⚠ Grey mkt.</span>}
                      {!c.flag && <span className="text-text-muted text-xs">—</span>}
                    </td>
                  </tr>
                ))}
                {greyAlerts.map(alert => (
                  <tr key={alert.code} className="border-t-2 border-negative/20 bg-negative/5">
                    <td className="px-4 py-2.5 text-sm">
                      <span className="font-semibold text-negative">{alert.code} {alert.country} ⚠</span>
                    </td>
                    <td className="px-3 py-2.5 text-sm text-right font-mono font-semibold text-negative">{alert.realizationPct.toFixed(1)}%</td>
                    <td className="px-3 py-2.5 text-sm text-right font-mono font-semibold text-negative">{alert.marginPct.toFixed(1)}%</td>
                    <td className="px-3 py-2.5 text-sm">
                      <span className="text-negative text-xs font-semibold">⚠ Grey mkt.</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {greyAlerts.length > 0 && (
              <div className="m-4 p-3 bg-negative/5 border-l-4 border-l-negative rounded-r-lg">
                <p className="text-xs font-bold text-text-primary">{greyAlerts[0].country} price gap creates re-export risk</p>
                <p className="text-xs text-text-secondary mt-1">{greyAlerts[0].riskDescription}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: My Sub-Segments */}
      {activeTab === 'subsegments' && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-bold text-text-primary">Sub-Segment Performance — {filters.segment}</h3>
            <p className="text-xs text-text-muted mt-0.5">Realization and margin by sub-segment within your selected segment. Low-n rows shown at reduced opacity.</p>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-bg-warm">
                <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-text-muted uppercase">Sub-Segment</th>
                <th className="text-right px-4 py-2.5 text-[10px] font-semibold text-text-muted uppercase">Realization</th>
                <th className="text-right px-4 py-2.5 text-[10px] font-semibold text-text-muted uppercase">Margin %</th>
                <th className="text-right px-4 py-2.5 text-[10px] font-semibold text-text-muted uppercase">vs. Seg. Avg</th>
                <th className="text-right px-4 py-2.5 text-[10px] font-semibold text-text-muted uppercase">Transactions</th>
                <th className="text-center px-3 py-2.5 text-[10px] font-semibold text-text-muted uppercase">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {subSegBenchmark.map((row, idx) => {
                const isLow = row.transactionCount < LOW_N_THRESHOLD
                const isSuppressed = row.transactionCount < 5
                return (
                  <tr key={row.subSegment} className={`border-t border-border ${idx % 2 === 0 ? '' : 'bg-bg/50'} ${isLow ? 'opacity-50' : ''}`}>
                    <td className="px-5 py-3 text-sm font-semibold text-text-primary">{row.subSegment}</td>
                    <td className="px-4 py-3 text-sm text-right font-mono font-semibold text-text-primary">
                      {isSuppressed ? '—' : `${row.realizationPct.toFixed(1)}%`}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-mono text-text-primary">
                      {isSuppressed ? '—' : `${row.marginPct.toFixed(1)}%`}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      {isSuppressed ? (
                        <span className="text-text-muted">—</span>
                      ) : (
                        <span className={`font-mono font-semibold ${row.vsSegmentAvg >= 0 ? 'text-positive' : 'text-negative'}`}>
                          {row.vsSegmentAvg >= 0 ? '+' : ''}{row.vsSegmentAvg.toFixed(1)}pp
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-mono text-text-muted">{row.transactionCount}</td>
                    <td className="px-3 py-3 text-center">
                      {isSuppressed ? (
                        <span className="px-2 py-0.5 rounded-full bg-bg-warm text-[10px] font-bold text-text-muted border border-border">Suppressed</span>
                      ) : isLow ? (
                        <span className="px-2 py-0.5 rounded-full bg-warning/10 text-[10px] font-bold text-warning">Low n</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-positive/10 text-[10px] font-bold text-positive">OK</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div className="px-5 py-3 border-t border-border text-xs text-text-muted">
            In PowerBI: confidence column maps to conditional formatting rule on [TransactionCount]. Suppressed = n&lt;5, Low n = n&lt;{LOW_N_THRESHOLD}.
          </div>
        </div>
      )}
    </div>
  )
}
