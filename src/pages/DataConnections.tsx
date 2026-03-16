import { Database, CheckCircle2, AlertCircle, Clock, RefreshCw, Plug, Server, FileSpreadsheet } from 'lucide-react'

interface DataSource {
  name: string
  type: string
  icon: typeof Database
  status: 'connected' | 'warning' | 'error'
  lastSync: string
  nextSync: string
  records: string
  latency: string
  description: string
}

const dataSources: DataSource[] = [
  {
    name: 'SAP S/4HANA',
    type: 'ERP System',
    icon: Server,
    status: 'connected',
    lastSync: '2026-03-16 08:42:15',
    nextSync: '2026-03-16 09:00:00',
    records: '2.4M rows',
    latency: '< 120ms',
    description: 'Primary source for sales orders, billing documents, condition records, and material master data.',
  },
  {
    name: 'SAP BW/4HANA',
    type: 'Data Warehouse',
    icon: Database,
    status: 'connected',
    lastSync: '2026-03-16 06:00:00',
    nextSync: '2026-03-17 06:00:00',
    records: '18.7M rows',
    latency: '< 340ms',
    description: 'Historical SCO/MT data, margin bridge calculations, and volume forecasts. Daily ETL at 06:00 CET.',
  },
  {
    name: 'Argus FMB Price Feed',
    type: 'Market Data API',
    icon: Plug,
    status: 'connected',
    lastSync: '2026-03-16 07:30:00',
    nextSync: '2026-03-16 12:00:00',
    records: '4,218 records',
    latency: '< 85ms',
    description: 'Global potash, kieserite, and salt spot price indices. Updated twice daily (07:30, 12:00 CET).',
  },
  {
    name: 'CRM (Salesforce)',
    type: 'Customer Data',
    icon: Database,
    status: 'warning',
    lastSync: '2026-03-15 22:15:00',
    nextSync: '2026-03-16 10:00:00',
    records: '156k records',
    latency: '< 210ms',
    description: 'Customer master data, contract renewals, and segment classifications. Sync delayed — API rate limit.',
  },
  {
    name: 'Excel Uploads',
    type: 'Manual Data',
    icon: FileSpreadsheet,
    status: 'warning',
    lastSync: '2026-03-14 16:30:00',
    nextSync: 'Manual',
    records: '342 rows',
    latency: 'N/A',
    description: 'Target prices, limit prices, and customer group overrides uploaded by Pricing team. Last upload: 2 days ago.',
  },
  {
    name: 'Mine Production System',
    type: 'Operational Data',
    icon: Server,
    status: 'connected',
    lastSync: '2026-03-16 08:55:00',
    nextSync: '2026-03-16 09:15:00',
    records: '890k records',
    latency: '< 95ms',
    description: 'Real-time production volumes from Werra, Zielitz, and Bethune mining sites. Refresh every 20 minutes.',
  },
]

const statusConfig = {
  connected: { label: 'Connected', color: 'text-positive', bg: 'bg-positive/10', icon: CheckCircle2 },
  warning: { label: 'Attention', color: 'text-warning', bg: 'bg-warning/10', icon: AlertCircle },
  error: { label: 'Disconnected', color: 'text-negative', bg: 'bg-negative/10', icon: AlertCircle },
}

export default function DataConnections() {
  const connected = dataSources.filter(d => d.status === 'connected').length
  const warnings = dataSources.filter(d => d.status === 'warning').length
  const errors = dataSources.filter(d => d.status === 'error').length

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-text-primary">Data Connections</h2>
        <p className="text-sm text-text-secondary mt-1">
          Source systems, sync status, and data pipeline health
        </p>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-xl border border-border p-5 card-hover">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">Total Sources</p>
          <p className="text-2xl font-bold text-text-primary">{dataSources.length}</p>
          <p className="text-xs text-text-muted mt-1">data connections</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 card-hover">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">Connected</p>
          <p className="text-2xl font-bold text-positive">{connected}</p>
          <p className="text-xs text-text-muted mt-1">syncing normally</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 card-hover">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">Warnings</p>
          <p className="text-2xl font-bold text-warning">{warnings}</p>
          <p className="text-xs text-text-muted mt-1">attention needed</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 card-hover">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">Errors</p>
          <p className="text-2xl font-bold text-negative">{errors}</p>
          <p className="text-xs text-text-muted mt-1">disconnected</p>
        </div>
      </div>

      {/* Data Source Cards */}
      <div className="space-y-3">
        {dataSources.map((source) => {
          const sc = statusConfig[source.status]
          const StatusIcon = sc.icon
          return (
            <div key={source.name} className="bg-card rounded-xl border border-border p-5 card-hover">
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-primary/5 shrink-0">
                  <source.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-sm font-bold text-text-primary">{source.name}</h3>
                      <span className="text-[11px] font-medium text-text-muted bg-bg-warm px-2 py-0.5 rounded">{source.type}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${sc.color} ${sc.bg}`}>
                        <StatusIcon className="w-3 h-3" />
                        {sc.label}
                      </span>
                      <button className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-primary/5 transition-colors cursor-pointer" title="Refresh connection">
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed mb-3">{source.description}</p>
                  <div className="flex items-center gap-6 text-xs text-text-muted">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Last sync: <span className="font-mono font-medium text-text-secondary">{source.lastSync}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <RefreshCw className="w-3 h-3" />
                      Next: <span className="font-mono font-medium text-text-secondary">{source.nextSync}</span>
                    </span>
                    <span>
                      Records: <span className="font-mono font-medium text-text-secondary">{source.records}</span>
                    </span>
                    <span>
                      Latency: <span className="font-mono font-medium text-text-secondary">{source.latency}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
