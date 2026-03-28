import { ChevronDown } from 'lucide-react'
import {
  regions,
  segments,
  subSegments,
  materialCategories,
  timePeriods,
  comparisonPeriods,
} from '../data/mockData'
import { useFilters } from '../FilterContext'
import { useState } from 'react'

function FilterDropdown({
  label,
  options,
  value,
  onChange,
  disabled,
}: {
  label: string
  options: string[]
  value: string
  onChange: (v: string) => void
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="mb-2.5">
      <label className="text-[10px] font-semibold uppercase tracking-wider text-text-muted block mb-1">{label}</label>
      <div className="relative">
        <button
          onClick={() => !disabled && setOpen(!open)}
          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-[13px] border transition-all ${
            disabled
              ? 'bg-bg-warm border-border text-text-muted cursor-not-allowed'
              : 'bg-white border-border text-text-primary hover:border-accent cursor-pointer'
          }`}
        >
          <span className="truncate">{value}</span>
          <ChevronDown className={`w-3 h-3 flex-shrink-0 ml-1 text-text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-lg shadow-lg shadow-black/8 py-1 z-50 max-h-60 overflow-y-auto">
              {options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => { onChange(opt); setOpen(false) }}
                  className={`w-full text-left px-3 py-1.5 text-[13px] transition-colors cursor-pointer ${
                    value === opt
                      ? 'text-accent font-semibold bg-accent/5'
                      : 'text-text-secondary hover:bg-bg-warm'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function TimePeriodTabs({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1">
      {timePeriods.map((period) => (
        <button
          key={period}
          onClick={() => onChange(period)}
          className={`px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
            value === period
              ? 'bg-accent text-white'
              : 'bg-bg-warm text-text-muted hover:bg-border hover:text-text-primary'
          }`}
        >
          {period}
        </button>
      ))}
    </div>
  )
}

function PeerGroupPanel({ region, segment }: { region: string; segment: string }) {
  const segPeerMap: Record<string, { name: string; peers: string[] }> = {
    'Marine': { name: 'NORTH SEA', peers: ['GB UK', 'NO NO', 'NL NL', 'DK DK', 'DE DE'] },
    'Rail': { name: 'CENTRAL EUROPE', peers: ['DE DE', 'GB UK', 'FR FR', 'AT AT', 'PL PL'] },
    'Industry': { name: 'EMEA INDUSTRIAL', peers: ['DE DE', 'GB UK', 'US US', 'CN CN', 'BR BR'] },
    'All Segments': { name: 'GLOBAL', peers: ['GB UK', 'DE DE', 'US US', 'CN CN', 'NO NO'] },
  }
  const config = segPeerMap[segment] || segPeerMap['Marine']
  const peerGroup = config.name
  const peers = config.peers
  const regionCode = region.split(' · ')[1] || 'UK'

  return (
    <div className="mt-3 pt-3 border-t border-border">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-2">Benchmark Peer Group</p>
      <div className="bg-white rounded-lg border border-accent/25 p-2.5">
        <p className="text-accent text-[10px] font-bold mb-1">AUTO-MATCHED: {peerGroup}</p>
        <p className="text-[10px] text-text-muted mb-2">Based on {segment} segment.</p>
        <div className="flex flex-wrap gap-1">
          {peers.map((peer) => {
            const code = peer.split(' ')[1]
            const isActive = code === regionCode.toUpperCase()
            return (
              <span
                key={peer}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  isActive
                    ? 'bg-accent text-white'
                    : 'bg-bg-warm text-text-muted border border-border'
                }`}
              >
                {peer}
              </span>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function Sidebar() {
  const { filters, setFilter } = useFilters()
  const currentSubSegments = subSegments[filters.segment] || subSegments['Marine']

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-sidebar border-r border-border flex flex-col z-50 overflow-y-auto">
      {/* Logo / Brand — dark header strip */}
      <div className="px-4 py-3 bg-primary">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white font-bold text-[11px]">
            VT
          </div>
          <div>
            <h1 className="text-white font-bold text-[13px] leading-tight">VOITH TURBO</h1>
            <p className="text-accent text-[9px] font-semibold tracking-wider">PRICING INTELLIGENCE</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-3 py-3 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted mb-2">My Context</p>

        <FilterDropdown
          label="Region (pre-filtered)"
          options={regions}
          value={filters.region}
          onChange={(v) => setFilter('region', v)}
          disabled={filters.role === 'mc'}
        />

        <FilterDropdown
          label="Division"
          options={['Voith Turbo']}
          value={filters.division}
          onChange={(v) => setFilter('division', v)}
          disabled
        />

        <FilterDropdown
          label="Segment"
          options={segments}
          value={filters.segment}
          onChange={(v) => {
            setFilter('segment', v)
            setFilter('subSegment', 'All Sub-Segments')
          }}
        />

        <FilterDropdown
          label="Sub-Segment"
          options={currentSubSegments}
          value={filters.subSegment}
          onChange={(v) => setFilter('subSegment', v)}
        />

        <FilterDropdown
          label="Material Category"
          options={materialCategories}
          value={filters.materialCategory}
          onChange={(v) => setFilter('materialCategory', v)}
        />

        {/* Time Period */}
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted mb-2">Time Period</p>
          <TimePeriodTabs
            value={filters.timePeriod}
            onChange={(v) => setFilter('timePeriod', v)}
          />
          <div className="mt-2">
            <FilterDropdown
              label="vs. Period"
              options={comparisonPeriods}
              value={filters.comparisonPeriod}
              onChange={(v) => setFilter('comparisonPeriod', v)}
            />
          </div>
        </div>

        <PeerGroupPanel region={filters.region} segment={filters.segment} />
      </div>
    </aside>
  )
}
