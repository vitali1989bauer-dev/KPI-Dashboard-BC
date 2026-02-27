import { useState } from 'react'
import { ChevronDown, Filter } from 'lucide-react'
import {
  regions,
  countryClusters,
  customerSegments,
  timePeriods,
} from '../data/mockData'

function Dropdown({ label, options }: { label: string; options: string[] }) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(options[0])

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-border rounded-lg text-sm text-text-secondary hover:border-primary/40 hover:text-text-primary transition-colors cursor-pointer"
      >
        <span className="text-text-muted text-xs font-medium">{label}:</span>
        <span className="font-medium max-w-[120px] truncate">{selected}</span>
        <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 bg-white border border-border rounded-lg shadow-lg py-1 z-50 min-w-[180px]">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  setSelected(opt)
                  setOpen(false)
                }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-bg transition-colors cursor-pointer ${
                  selected === opt ? 'text-primary font-medium bg-primary/5' : 'text-text-secondary'
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

interface FilterBarProps {
  activeTimePeriod: string
  onTimePeriodChange: (period: string) => void
}

export default function FilterBar({ activeTimePeriod, onTimePeriodChange }: FilterBarProps) {
  return (
    <div className="bg-white border-b border-border">
      {/* Time period tabs */}
      <div className="px-6 pt-4 flex items-center gap-1">
        {timePeriods.map((period) => (
          <button
            key={period}
            onClick={() => onTimePeriodChange(period)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all cursor-pointer ${
              activeTimePeriod === period
                ? 'bg-primary text-white'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg'
            }`}
          >
            {period}
          </button>
        ))}
      </div>

      {/* Filter dropdowns */}
      <div className="px-6 py-3 flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-text-muted mr-1" />
        <Dropdown label="Region" options={regions} />
        <Dropdown label="Country-cluster" options={countryClusters} />
        <Dropdown label="Customer segment" options={customerSegments} />
        <Dropdown
          label="Customer"
          options={['All Customers', 'Nestlé', 'Unilever', 'P&G', 'BASF']}
        />
        <Dropdown
          label="Product group"
          options={['All Products', 'Group A', 'Group B', 'Group C']}
        />
      </div>
    </div>
  )
}
