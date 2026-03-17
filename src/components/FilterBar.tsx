import { useState } from 'react'
import { ChevronDown, SlidersHorizontal, X, FileText, Download } from 'lucide-react'
import {
  regions,
  countryClusters,
  customerSegments,
  customers,
  pricingArchetypes,
  productGroups,
  timePeriods,
  type Filters,
} from '../data/mockData'
import { useFilters } from '../FilterContext'
import { generateManagementReport } from '../utils/generateReport'

function Dropdown({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: string[]
  value: string
  onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  const isFiltered = !value.startsWith('All ')

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-sm transition-all cursor-pointer ${
          isFiltered
            ? 'bg-primary/5 border-primary/25 text-primary hover:bg-primary/10'
            : 'bg-bg border-border text-text-secondary hover:border-primary/30 hover:bg-white'
        }`}
      >
        <span className="text-text-muted text-[11px] font-semibold uppercase tracking-wide">{label}</span>
        <span className={`font-medium max-w-[120px] truncate ${isFiltered ? 'text-primary' : 'text-text-primary'}`}>{value.replace('All ', '')}</span>
        {isFiltered ? (
          <X
            className="w-3.5 h-3.5 text-primary/60 hover:text-primary"
            onClick={(e) => { e.stopPropagation(); onChange(options[0]) }}
          />
        ) : (
          <ChevronDown className={`w-3.5 h-3.5 text-text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 bg-white border border-border rounded-xl shadow-lg shadow-black/8 py-1.5 z-50 min-w-[200px]">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  onChange(opt)
                  setOpen(false)
                }}
                className={`w-full text-left px-3.5 py-2 text-sm hover:bg-bg-warm transition-colors cursor-pointer ${
                  value === opt ? 'text-primary font-semibold bg-primary/5' : 'text-text-secondary'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function ReportButton() {
  const { filters } = useFilters()
  const [state, setState] = useState<'idle' | 'generating' | 'done'>('idle')

  async function handleClick() {
    if (state === 'generating') return
    setState('generating')
    try {
      await generateManagementReport(filters)
      setState('done')
      setTimeout(() => setState('idle'), 3500)
    } catch {
      setState('idle')
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={state === 'generating'}
      className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-300 cursor-pointer border ${
        state === 'done'
          ? 'bg-positive/10 border-positive/30 text-positive'
          : state === 'generating'
            ? 'bg-primary/5 border-primary/20 text-primary animate-pulse'
            : 'bg-primary text-white border-primary hover:bg-primary-light shadow-sm'
      }`}
    >
      {state === 'done' ? (
        <><Download className="w-4 h-4" /> PDF Downloaded</>
      ) : state === 'generating' ? (
        <><FileText className="w-4 h-4" /> Generating PDF...</>
      ) : (
        <><FileText className="w-4 h-4" /> Create Mgmt Report</>
      )}
    </button>
  )
}

export default function FilterBar() {
  const { filters, setFilter } = useFilters()

  const dropdowns: { label: string; key: keyof Filters; options: string[] }[] = [
    { label: 'Archetype', key: 'archetype', options: pricingArchetypes },
    { label: 'Region', key: 'region', options: regions },
    { label: 'Cluster', key: 'cluster', options: countryClusters },
    { label: 'Segment', key: 'segment', options: customerSegments },
    { label: 'Customer', key: 'customer', options: customers },
    { label: 'Product', key: 'product', options: productGroups },
  ]

  const activeCount = dropdowns.filter(d => !filters[d.key].startsWith('All ')).length

  return (
    <div className="bg-white border-b border-border">
      {/* Time period tabs + Report button */}
      <div className="px-6 pt-3 flex items-center gap-0.5">
        {timePeriods.map((period) => (
          <button
            key={period}
            onClick={() => setFilter('timePeriod', period)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all duration-200 cursor-pointer ${
              filters.timePeriod === period
                ? 'bg-primary text-white shadow-sm'
                : 'text-text-muted hover:text-text-primary hover:bg-bg-warm'
            }`}
          >
            {period}
          </button>
        ))}
        <div className="ml-auto">
          <ReportButton />
        </div>
      </div>

      {/* Filter dropdowns */}
      <div className="px-6 py-3 flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 mr-1">
          <SlidersHorizontal className="w-4 h-4 text-primary/60" />
          {activeCount > 0 && (
            <span className="text-[10px] font-bold text-white bg-primary rounded-full w-4.5 h-4.5 flex items-center justify-center leading-none px-1.5 py-0.5">
              {activeCount}
            </span>
          )}
        </div>
        {dropdowns.map((d) => (
          <Dropdown
            key={d.key}
            label={d.label}
            options={d.options}
            value={filters[d.key]}
            onChange={(v) => setFilter(d.key, v)}
          />
        ))}
      </div>
    </div>
  )
}
