import { useState } from 'react'
import { ChevronDown, Globe, Shield, Database, Upload, Clock, Server } from 'lucide-react'

interface FAQItem {
  id: string
  icon: typeof Server
  question: string
  answer: string
}

const faqItems: FAQItem[] = [
  {
    id: 'solution',
    icon: Globe,
    question: 'This is not PowerBI — what would the solution look like?',
    answer:
      'Custom React/TypeScript SPA deployed as a standalone web application. Unlike PowerBI, it offers full UX control, custom visualizations, and seamless embedding into existing portals. Performance is superior for complex calculations like SCO bridges and real-time market data integration.',
  },
  {
    id: 'web',
    icon: Server,
    question: 'Can this run as a web solution?',
    answer:
      'Yes, this IS a native web application. Deployable on any cloud (Azure, AWS, GCP) or on-premises. Accessible via any modern browser — no desktop installation needed. Can be embedded in existing SAP Fiori or SharePoint environments.',
  },
  {
    id: 'access',
    icon: Shield,
    question: 'How are access rights managed?',
    answer:
      'Role-based access control (RBAC) with SSO integration (Azure AD, SAP IDP). Granular permissions by region, customer segment, and data sensitivity level. Audit logging of all access and data exports.',
  },
  {
    id: 'data',
    icon: Database,
    question: 'How does data get into the system?',
    answer:
      'Automated ETL pipelines connect to SAP S/4HANA, SAP BW, and CRM systems. Market data feeds (Argus FMB, Bloomberg) via REST APIs. Strategy and target data can be uploaded via structured Excel templates or maintained directly in the UI.',
  },
  {
    id: 'uploads',
    icon: Upload,
    question: 'Manual uploads or automatic?',
    answer:
      'Both. Transactional data (sales, costs, volumes) syncs automatically every 15-60 minutes. Strategy inputs (target prices, limit corridors, pricing archetypes) are maintained via a self-service admin interface or Excel upload. Full version history and rollback capability.',
  },
  {
    id: 'timeline',
    icon: Clock,
    question: 'How long does development take?',
    answer:
      'MVP with core modules (Dashboard, SCO Bridge, Customer Portfolio, Market Intelligence): 8-12 weeks. Full rollout including all integrations, access management, and user training: 16-20 weeks. Agile delivery with bi-weekly demos and stakeholder feedback loops.',
  },
]

function FAQCard({ item }: { item: FAQItem }) {
  const [open, setOpen] = useState(false)
  const Icon = item.icon

  return (
    <button
      type="button"
      onClick={() => setOpen((prev) => !prev)}
      className={`w-full text-left bg-card rounded-xl border overflow-hidden card-hover transition-all duration-200 ${
        open ? 'border-primary/25 shadow-sm' : 'border-border'
      }`}
      style={{ borderLeft: '4px solid #173B7A' }}
    >
      <div className="flex items-center gap-4 px-6 py-5">
        <div className={`flex-shrink-0 p-2.5 rounded-lg transition-colors ${open ? 'bg-primary/10' : 'bg-bg-warm'}`}>
          <Icon className={`w-5 h-5 ${open ? 'text-primary' : 'text-text-muted'}`} />
        </div>
        <h3 className={`flex-1 text-sm font-semibold leading-snug ${open ? 'text-primary' : 'text-text-primary'}`}>
          {item.question}
        </h3>
        <ChevronDown
          className={`w-5 h-5 text-text-muted flex-shrink-0 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </div>
      {open && (
        <div className="px-6 pb-5 pt-0 ml-[52px]">
          <p className="text-sm text-text-secondary leading-relaxed">{item.answer}</p>
        </div>
      )}
    </button>
  )
}

export default function ImplementationFAQ() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-text-primary">
          Implementation &amp; Technology
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          Answers to key questions about deployment, integration, and operations
        </p>
      </div>

      {/* FAQ Cards */}
      <div className="flex flex-col gap-4">
        {faqItems.map((item) => (
          <FAQCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  )
}
