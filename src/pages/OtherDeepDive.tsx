import { BarChart3, TrendingUp, Activity, FileText } from 'lucide-react'

const insights = [
  {
    icon: TrendingUp,
    title: 'Revenue Growth Trajectory',
    description:
      'Revenue is trending 4.2% above last year, driven primarily by pricing improvements in the Premium and Specialty segments.',
    status: 'On Track',
    statusColor: 'text-positive bg-positive/10',
  },
  {
    icon: Activity,
    title: 'Working Capital Efficiency',
    description:
      'Days Sales Outstanding reduced by 3 days vs LY. Inventory turnover improved by 0.8x, indicating better supply chain management.',
    status: 'Improved',
    statusColor: 'text-positive bg-positive/10',
  },
  {
    icon: BarChart3,
    title: 'Customer Retention',
    description:
      'Customer churn rate at 2.1%, slightly above the 1.8% target. Three key accounts flagged for proactive retention measures.',
    status: 'Attention',
    statusColor: 'text-warning bg-warning/10',
  },
  {
    icon: FileText,
    title: 'Contract Renewals Pipeline',
    description:
      '15 contracts worth 8.4 M€ up for renewal in Q2. Early engagement initiated for top 5 accounts.',
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
          Additional business insights and operational metrics
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {insights.map((item) => (
          <div
            key={item.title}
            className="bg-card rounded-xl border border-border p-5 hover:shadow-md hover:border-primary/20 transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-lg bg-primary/10 shrink-0">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-text-primary">{item.title}</h3>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${item.statusColor}`}
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
