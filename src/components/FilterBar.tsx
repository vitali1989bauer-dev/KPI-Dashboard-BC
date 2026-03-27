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
      {/* Top header bar */}
      <div className="bg-primary text-white px-6 py-2.5 flex items-center justify-between">
        <p className="text-sm font-medium text-white/70">
          Spare Parts · Global Pricing Monitor
        </p>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-white/40 font-medium uppercase tracking-wide">Simulate User Role:</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setFilter('role', 'mc' as UserRole)}
              className={`px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                filters.role === 'mc'
                  ? 'bg-accent text-white'
                  : 'bg-white/10 text-white/50 hover:bg-white/20'
              }`}
            >
              UK Marketing Co.
            </button>
            <button
              onClick={() => setFilter('role', 'hq' as UserRole)}
              className={`px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                filters.role === 'hq'
                  ? 'bg-accent text-white'
                  : 'bg-white/10 text-white/50 hover:bg-white/20'
              }`}
            >
              HQ View
            </button>
          </div>
          <div className="flex items-center gap-2 ml-3 pl-3 border-l border-white/15">
            <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-white text-[10px] font-bold">SJ</div>
            <div>
              <p className="text-xs font-semibold text-white/90">S. Jones · UK</p>
            </div>
            <span className="ml-1 px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-bold text-accent">MC</span>
          </div>
        </div>
      </div>

      {/* Bottom tab navigation — PowerBI-style */}
      <div className="fixed bottom-0 left-56 right-0 bg-white border-t border-border z-40">
        <div className="flex items-center px-2 h-11">
          {tabs.map((tab) => (
            <NavLink
              key={tab.path}
              to={tab.path}
              end={tab.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-5 h-full text-sm font-medium transition-all border-b-2 ${
                  isActive
                    ? 'text-primary border-primary bg-bg-warm/50'
                    : 'text-text-muted border-transparent hover:text-text-primary hover:bg-bg-warm/30'
                }`
              }
            >
              <span className="text-xs">{tab.icon}</span>
              {tab.label}
            </NavLink>
          ))}
        </div>
      </div>
    </>
  )
}
