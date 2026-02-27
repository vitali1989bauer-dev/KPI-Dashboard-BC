import { useState } from 'react'
import { ChevronDown, SlidersHorizontal } from 'lucide-react'
import {
  regions,
  countryClusters,
  customerSegments,
  customers,
  productGroups,
  timePeriods,
  type Filters,
} from '../data/mockData'
import { useFilters } from '../FilterContext'

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

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-bg border border-border rounded-lg text-sm text-text-secondary hover:border-accent/40 hover:bg-white transition-all cursor-pointer"
      >
        <span className="text-text-muted text-[11px] font-semibold uppercase tracking-wide">{label}</span>
        <span className="font-medium max-w-[120px] truncate text-text-primary">{value}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
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
                  value === opt ? 'text-primary font-semibold bg-accent/8' : 'text-text-secondary'
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

export default function FilterBar() {
  const { filters, setFilter } = useFilters()

  const dropdowns: { label: string; key: keyof Filters; options: string[] }[] = [
    { label: 'Region', key: 'region', options: regions },
    { label: 'Cluster', key: 'cluster', options: countryClusters },
    { label: 'Segment', key: 'segment', options: customerSegments },
    { label: 'Customer', key: 'customer', options: customers },
    { label: 'Product', key: 'product', options: productGroups },
  ]

  return (
    <div className="bg-white border-b border-border">
      {/* Time period tabs */}
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
      </div>

      {/* Filter dropdowns */}
      <div className="px-6 py-3 flex items-center gap-2 flex-wrap">
        <SlidersHorizontal className="w-4 h-4 text-accent mr-1" />
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
