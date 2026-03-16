import { BarChart3, TrendingUp, Activity, FileText, Sprout, Truck } from 'lucide-react'
import { useFilters } from '../FilterContext'

const insightsBase = [
  {
    icon: TrendingUp,
    title: 'Potash Margin Recovery',
    description:
      'MOP margins recovered +1.5pp vs LY, driven by favorable global potash pricing and strong spring application demand in European arable farming. Fertilizer specialties show +2.8pp improvement.',
    status: 'On Track',
    statusColor: 'text-positive bg-positive/10',
  },
  {
    icon: Sprout,
    title: 'Agricultural Season Outlook',
    description:
      'Spring application season progressing well across DACH and Nordics. Farmer purchasing sentiment positive with early ordering up 14% vs LY. Specialty crop segment showing strongest growth at +18%.',
    status: 'Positive',
    statusColor: 'text-positive bg-positive/10',
  },
  {
    icon: Truck,
    title: 'Mining Output & Inventory Levels',
    description:
      'Bethune mine output at 96.2% of target capacity. Werra and Zielitz sites operating at 94.8%. Potash inventory at 11.4 weeks of cover, slightly below the 13-week target. Spot purchases initiated for Q2 commitments.',
    status: 'Attention',
    statusColor: 'text-warning bg-warning/10',
  },
  {
    icon: FileText,
    title: 'Customer Contract Renewals',
    description:
      '18 long-term supply contracts worth 28.5 M€ up for renewal in Q2. BayWa and AGRAVIS negotiations in progress with +3.5% price adjustment proposed. Nutrien framework agreement extended to 2027.',
    status: 'In Progress',
    statusColor: 'text-primary bg-primary/10',
  },
  {
    icon: Activity,
    title: 'Energy Efficiency & Process Optimization',
    description:
      'Natural gas consumption per MT of KCl reduced by 4.2% through heat recovery improvements at Zielitz. Electrolysis energy costs down 6.1% at Bernburg salt facility through off-peak scheduling.',
    status: 'Improved',
    statusColor: 'text-positive bg-positive/10',
  },
  {
    icon: BarChart3,
    title: 'Sustainability & Tailings Management',
    description:
      'Saline water injection program on track — 92% of production waste processed via deep well injection. CO₂ intensity per MT product reduced by 8.3% vs baseline. EMAS certification renewed for all German sites.',
    status: 'In Progress',
    statusColor: 'text-primary bg-primary/10',
  },
]

export default function OtherDeepDive() {
  const { filters } = useFilters()
  const regionLabel = filters.region === 'All Regions' ? 'Global' : filters.region

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-text-primary">Other Deep-dive</h2>
        <p className="text-sm text-text-secondary mt-1">
          {regionLabel} fertilizer &amp; salt supply chain insights and operational metrics
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {insightsBase.map((item) => (
          <div key={item.title} className="bg-card rounded-xl border border-border p-5 card-hover">
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-accent/10 shrink-0">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-text-primary">{item.title}</h3>
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${item.statusColor}`}>
                    {item.status}
                  </span>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">{item.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
