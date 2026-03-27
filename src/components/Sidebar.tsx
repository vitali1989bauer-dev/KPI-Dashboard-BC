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
    <div className="mb-3">
      <label className="text-[10px] font-semibold uppercase tracking-wider text-white/40 block mb-1">{label}</label>
      <div className="relative">
        <button
          onClick={() => !disabled && setOpen(!open)}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm border transition-all ${
            disabled
              ? 'bg-white/5 border-white/8 text-white/30 cursor-not-allowed'
              : 'bg-white/8 border-white/12 text-white hover:bg-white/12 cursor-pointer'
          }`}
        >
          <span className="truncate">{value}</span>
          <ChevronDown className={`w-3.5 h-3.5 flex-shrink-0 ml-1 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#243044] border border-white/15 rounded-lg shadow-xl shadow-black/30 py-1 z-50 max-h-60 overflow-y-auto">
              {options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => { onChange(opt); setOpen(false) }}
                  className={`w-full text-left px-3 py-1.5 text-sm transition-colors cursor-pointer ${
                    value === opt
                      ? 'text-accent font-semibold bg-white/8'
                      : 'text-white/70 hover:bg-white/8 hover:text-white'
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
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            value === period
              ? 'bg-accent text-white'
              : 'bg-white/8 text-white/50 hover:bg-white/12 hover:text-white/80'
          }`}
        >
          {period}
        </button>
      ))}
    </div>
  )
}

function PeerGroupPanel({ region }: { region: string }) {
  const segPeerMap: Record<string, string> = {
    'Marine': 'NORTH SEA',
    'Rail': 'CENTRAL EUROPE',
    'Industry': 'EMEA INDUSTRIAL',
  }
  // Default to North Sea
  const peerGroup = segPeerMap['Marine'] || 'NORTH SEA'
  const peers = ['GB UK', 'NO NO', 'NL NL', 'DK DK', 'DE DE']
  const regionCode = region.split(' · ')[1] || 'UK'

  return (
    <div className="mt-4 pt-4 border-t border-white/8">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-accent mb-2">Benchmark Peer Group</p>
      <div className="bg-white/5 rounded-lg border border-accent/30 p-3">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-accent text-xs font-bold">AUTO-MATCHED: {peerGroup}</span>
        </div>
        <p className="text-[10px] text-white/40 mb-2">Based on Marine segment. Edit below.</p>
        <div className="flex flex-wrap gap-1.5">
          {peers.map((peer) => {
            const code = peer.split(' ')[1]
            const isActive = code === regionCode.toUpperCase()
            return (
              <span
                key={peer}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  isActive
                    ? 'bg-accent text-white'
                    : 'bg-white/10 text-white/50'
                }`}
              >
                {peer}
              </span>
            )
          })}
        </div>
        <button className="mt-2 text-[10px] text-accent/70 hover:text-accent transition-colors cursor-pointer">
          + Add country to benchmark
        </button>
      </div>
    </div>
  )
}

export default function Sidebar() {
  const { filters, setFilter } = useFilters()

  // Get sub-segments for current segment
  const currentSubSegments = subSegments[filters.segment] || subSegments['Marine']

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-gradient-to-b from-sidebar to-[#0f1820] flex flex-col z-50 overflow-y-auto">
      {/* Logo / Brand */}
      <div className="px-4 py-4 border-b border-white/8">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center shadow-lg shadow-accent/30 text-white font-bold text-sm">
            VT
          </div>
          <div>
            <h1 className="text-white font-bold text-[14px] leading-tight tracking-tight">VOITH TURBO</h1>
            <p className="text-accent/80 text-[10px] font-semibold tracking-wider">PRICING INTELLIGENCE</p>
          </div>
        </div>
      </div>

      {/* MY CONTEXT filters */}
      <div className="px-4 py-4 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-white/25 mb-3">My Context</p>

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
        <div className="mt-4 pt-4 border-t border-white/8">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/25 mb-2">Time Period</p>
          <TimePeriodTabs
            value={filters.timePeriod}
            onChange={(v) => setFilter('timePeriod', v)}
          />

          <div className="mt-3">
            <FilterDropdown
              label="vs. Period"
              options={comparisonPeriods}
              value={filters.comparisonPeriod}
              onChange={(v) => setFilter('comparisonPeriod', v)}
            />
          </div>
        </div>

        {/* Peer Group */}
        <PeerGroupPanel region={filters.region} />
      </div>

      {/* Status */}
      <div className="px-4 py-3 border-t border-white/8">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          <span className="text-[10px] text-white/30 font-medium">Mock Data</span>
        </div>
      </div>
    </aside>
  )
}
