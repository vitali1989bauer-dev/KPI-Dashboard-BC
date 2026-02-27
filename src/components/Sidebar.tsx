import { NavLink } from 'react-router-dom'
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Package,
  Layers,
  MoreHorizontal,
  LayoutDashboard,
  Bean,
} from 'lucide-react'

const navItems = [
  { path: '/', label: 'Top KPIs', icon: LayoutDashboard },
  { path: '/sco-effect', label: 'SCO Effect (SCO-bridge)', icon: TrendingUp },
  { path: '/condition-spending', label: 'Condition Spending', icon: DollarSign },
  { path: '/pricing-deep-dive', label: 'Pricing Deep-dives', icon: BarChart3 },
  { path: '/volume-deep-dive', label: 'Volume Deep-dive', icon: Package },
  { path: '/cost-deep-dive', label: 'Cost Related Deep-dive', icon: Layers },
  { path: '/other-deep-dive', label: 'Other Deep-dive', icon: MoreHorizontal },
]

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-sidebar to-[#1a0e09] flex flex-col z-50">
      {/* Logo / Brand */}
      <div className="px-5 py-5 border-b border-white/8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-gold flex items-center justify-center shadow-lg shadow-accent/20">
            <Bean className="w-5 h-5 text-sidebar" />
          </div>
          <div>
            <h1 className="text-white font-bold text-[15px] leading-tight tracking-tight">ChocMetrics</h1>
            <p className="text-accent-light/60 text-[11px] font-medium">Raw Materials KPI</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-accent/40">Navigation</p>
        <ul className="space-y-0.5">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-accent/20 to-accent/10 text-accent-light border border-accent/20'
                      : 'text-white/50 hover:bg-white/5 hover:text-white/80 border border-transparent'
                  }`
                }
              >
                <item.icon className="w-[18px] h-[18px] shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Status */}
      <div className="px-5 py-4 border-t border-white/8">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-positive animate-pulse" />
          <span className="text-[11px] text-white/40 font-medium">Live Data</span>
        </div>
      </div>
    </aside>
  )
}
