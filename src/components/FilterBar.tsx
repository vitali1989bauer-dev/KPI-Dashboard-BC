import { NavLink } from 'react-router-dom'
import { useFilters } from '../FilterContext'
import type { UserRole } from '../data/mockData'

const tabs = [
  { path: '/', label: 'Overview', icon: '◆' },
  { path: '/price-waterfall', label: 'Price Waterfall', icon: '▽' },
  { path: '/parts-deep-dive', label: 'Parts Deep Dive', icon: '◉' },
  { path: '/regional-benchmark', label: 'Regional Benchmark', icon: '⊕' },
  { path: '/trends', label: 'Trends', icon: '╱' },
]

export default function FilterBar() {
  const { filters, setFilter } = useFilters()

  return (
    <>
      {/* Top header bar — lighter, less dominant */}
      <div className="bg-white border-b border-border px-6 py-2 flex items-center justify-between">
        <p className="text-sm font-medium text-text-muted">
          Spare Parts · Global Pricing Monitor
        </p>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-text-muted font-medium uppercase tracking-wide">Role:</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setFilter('role', 'mc' as UserRole)}
              className={`px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer border ${
                filters.role === 'mc'
                  ? 'bg-accent text-white border-accent'
                  : 'bg-white text-text-muted border-border hover:border-accent/40'
              }`}
            >
              UK Marketing Co.
            </button>
            <button
              onClick={() => setFilter('role', 'hq' as UserRole)}
              className={`px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer border ${
                filters.role === 'hq'
                  ? 'bg-accent text-white border-accent'
                  : 'bg-white text-text-muted border-border hover:border-accent/40'
              }`}
            >
              HQ View
            </button>
          </div>
          <div className="flex items-center gap-2 ml-2 pl-2 border-l border-border">
            <div className="w-6 h-6 rounded-full bg-accent/15 flex items-center justify-center text-accent text-[10px] font-bold">SJ</div>
            <span className="text-xs text-text-secondary font-medium">S. Jones · UK</span>
            <span className="px-1.5 py-0.5 rounded bg-bg-warm text-[10px] font-bold text-text-muted border border-border">MC</span>
          </div>
        </div>
      </div>

      {/* Bottom tab navigation — PowerBI-style */}
      <div className="fixed bottom-0 left-56 right-0 bg-white border-t border-border z-40">
        <div className="flex items-center px-2 h-10">
          {tabs.map((tab) => (
            <NavLink
              key={tab.path}
              to={tab.path}
              end={tab.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-4 h-full text-[13px] font-medium transition-all border-b-2 ${
                  isActive
                    ? 'text-primary border-accent'
                    : 'text-text-muted border-transparent hover:text-text-primary hover:bg-bg-warm/50'
                }`
              }
            >
              <span className="text-[10px] opacity-50">{tab.icon}</span>
              {tab.label}
            </NavLink>
          ))}
        </div>
      </div>
    </>
  )
}
