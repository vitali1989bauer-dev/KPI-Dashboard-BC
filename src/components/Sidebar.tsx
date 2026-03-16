import { NavLink } from 'react-router-dom'
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Layers,
  LayoutDashboard,
  Sprout,
  Crosshair,
  Database,
  Globe,
  HelpCircle,
  Activity,
} from 'lucide-react'

const navGroups = [
  {
    label: 'Overview',
    items: [
      { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Analysis',
    items: [
      { path: '/sco-effect', label: 'SCO Bridge', icon: TrendingUp },
      { path: '/market-intelligence', label: 'Market Intelligence', icon: Globe },
      { path: '/customer-portfolio', label: 'Customer Portfolio', icon: Crosshair },
      { path: '/pricing-conditions', label: 'Pricing & Conditions', icon: DollarSign },
      { path: '/operations', label: 'Operations', icon: Activity },
    ],
  },
  {
    label: 'Deep-dives',
    items: [
      { path: '/pricing-deep-dive', label: 'Pricing Detail', icon: BarChart3 },
      { path: '/cost-deep-dive', label: 'Cost Detail', icon: Layers },
    ],
  },
  {
    label: 'System',
    items: [
      { path: '/data-connections', label: 'Data Connections', icon: Database },
      { path: '/implementation', label: 'Implementation', icon: HelpCircle },
    ],
  },
]

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-sidebar to-[#091a3d] flex flex-col z-50">
      {/* Logo / Brand */}
      <div className="px-5 py-5 border-b border-white/8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <Sprout className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-[15px] leading-tight tracking-tight">K+S AgriMetrics</h1>
            <p className="text-white/40 text-[11px] font-medium">Fertilizer & Salt KPI</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-white/25">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-primary/15 text-white border border-primary/30'
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
          </div>
        ))}
      </nav>

      {/* Status */}
      <div className="px-5 py-4 border-t border-white/8">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-[11px] text-white/40 font-medium">Live Data</span>
        </div>
      </div>
    </aside>
  )
}
