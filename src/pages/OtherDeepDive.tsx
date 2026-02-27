import { BarChart3, TrendingUp, Activity, FileText, Bean, Truck } from 'lucide-react'

const insights = [
  {
    icon: TrendingUp,
    title: 'Cocoa Butter Margin Recovery',
    description:
      'Cocoa butter margins recovered +1.8pp vs LY, driven by favorable press ratios and strong demand from confectionery clients. Specialty compounds show +3.2pp improvement.',
    status: 'On Track',
    statusColor: 'text-positive bg-positive/10',
  },
  {
    icon: Bean,
    title: 'Origin Sourcing Diversification',
    description:
      'Ivory Coast dependency reduced from 62% to 54%. Ghana and Ecuador volumes increased by 18% and 12% respectively, improving supply chain resilience.',
    status: 'Improved',
    statusColor: 'text-positive bg-positive/10',
  },
  {
    icon: Truck,
    title: 'Cocoa Bean Inventory Levels',
    description:
      'Current bean stock at 14.2 weeks of cover, slightly below the 16-week target. Spot purchases initiated for Q2 production requirements. ICCO prices volatile.',
    status: 'Attention',
    statusColor: 'text-warning bg-warning/10',
  },
  {
    icon: FileText,
    title: 'Customer Contract Renewals',
    description:
      '12 long-term supply contracts worth 11.2 M€ up for renewal in Q2. Nestlé and Mondelez negotiations in progress with +4% price adjustment proposed.',
    status: 'In Progress',
    statusColor: 'text-primary bg-primary/10',
  },
  {
    icon: Activity,
    title: 'Processing Yield Optimization',
    description:
      'Cocoa nib-to-liquor yield improved to 83.4% (+0.6pp vs target). New roasting profiles for Ecuadorian beans delivering better flavor extraction with lower energy consumption.',
    status: 'Improved',
    statusColor: 'text-positive bg-positive/10',
  },
  {
    icon: BarChart3,
    title: 'Sustainability Certification Progress',
    description:
      'Rainforest Alliance certified volume at 38% of total intake (target: 45% by year-end). UTZ conversion program on track for DACH and Nordics clusters.',
    status: 'In Progress',
    statusColor: 'text-primary bg-primary/10',
  },
]

export default function OtherDeepDive() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-text-primary">Other Deep-dive</h2>
        <p className="text-sm text-text-secondary mt-1">
          Cocoa supply chain insights and operational metrics
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {insights.map((item) => (
          <div
            key={item.title}
            className="bg-card rounded-xl border border-border p-5 card-hover"
          >
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-accent/10 shrink-0">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-text-primary">{item.title}</h3>
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${item.statusColor}`}
                  >
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
