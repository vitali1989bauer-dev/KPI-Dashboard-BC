import { NavLink } from 'react-router-dom'
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Package,
  Layers,
  MoreHorizontal,
  LayoutDashboard,
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
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar flex flex-col z-50">
      {/* Logo / Brand */}
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-semibold text-base leading-tight">KPI Dashboard</h1>
            <p className="text-slate-400 text-xs">Business Controlling</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-primary text-white shadow-lg shadow-primary/25'
                      : 'text-slate-300 hover:bg-sidebar-hover hover:text-white'
                  }`
                }
              >
                <item.icon className="w-4.5 h-4.5 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Status */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-positive animate-pulse" />
          <span className="text-xs text-slate-400">Working</span>
        </div>
      </div>
    </aside>
  )
}
