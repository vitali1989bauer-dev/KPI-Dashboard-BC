import { useState } from 'react'
import {
  ChevronDown,
  Compass,
  BarChart3,
  SlidersHorizontal,
  Database,
  RefreshCw,
  Upload,
  Globe,
  Shield,
  Users,
  Puzzle,
  Wrench,
  Clock,
  Layers,
  Target,
  Zap,
  type LucideIcon,
} from 'lucide-react'

interface FAQItem {
  id: string
  icon: LucideIcon
  question: string
  answer: string[]
}

interface FAQSection {
  id: string
  title: string
  subtitle: string
  color: string
  items: FAQItem[]
}

const faqSections: FAQSection[] = [
  {
    id: 'understanding',
    title: 'Understanding the Tool',
    subtitle: 'What it is, who it\'s for, and why it exists',
    color: '#173B7A',
    items: [
      {
        id: 'what-is',
        icon: Compass,
        question: 'What is this dashboard and who is it for?',
        answer: [
          'This is a Pricing & Profitability Intelligence Platform designed for commercial leadership in the fertilizer and salt business. It gives pricing managers, controllers, and senior leadership a single source of truth for all pricing-related KPIs.',
          'The primary users are: (1) Pricing Managers who monitor customer-level price realization and corridor compliance, (2) Commercial Controllers who track SCO/MT performance and condition spending, (3) Senior Leadership who need a consolidated view of profitability drivers and market context.',
          'Unlike traditional reporting, this tool doesn\'t just show what happened — it highlights why it happened (SCO bridge decomposition), where to act (price alerts, corridor violations), and what external forces are at play (market intelligence).',
        ],
      },
      {
        id: 'vs-powerbi',
        icon: Layers,
        question: 'How is this different from PowerBI or Excel reporting?',
        answer: [
          'PowerBI and Excel are general-purpose tools. This is a purpose-built pricing cockpit with domain logic baked in — SCO waterfall decomposition, target/limit corridor analysis, pricing archetype segmentation, and gross-to-net revenue waterfalls are native features, not manually assembled charts.',
          'Key advantages: (1) Sub-second performance even with complex calculations across millions of transactions. (2) Custom UX designed for pricing workflows — not generic chart-building. (3) Real-time market data integration (Argus FMB, Bloomberg) that Excel cannot replicate. (4) Automatic alerting when prices breach limit corridors. (5) Embeddable in existing portals (SAP Fiori, SharePoint, intranet).',
          'Think of it as the difference between a generic spreadsheet and a Bloomberg terminal — both show data, but one is purpose-built for the job.',
        ],
      },
      {
        id: 'sco-explained',
        icon: BarChart3,
        question: 'What is "SCO" and why is it the central KPI?',
        answer: [
          'SCO stands for Standard Contribution (Standarddeckungsbeitrag). It measures profitability per metric ton after deducting all variable costs — production, logistics, and condition spending — from net revenue.',
          'SCO/MT is the single most important KPI for a pricing organization because it captures the full commercial picture: price realization, cost efficiency, and condition discipline in one number. A high revenue per ton means nothing if conditions and costs eat the margin.',
          'The SCO Bridge on the dashboard decomposes the year-over-year change into 9 individual effects (list price, conditions, volume, energy, raw materials, logistics, FX, product mix, new business) so you can see exactly what\'s driving profitability up or down.',
        ],
      },
    ],
  },
  {
    id: 'navigation',
    title: 'Navigation & Daily Use',
    subtitle: 'How to navigate, filter, and interpret the views',
    color: '#1a8754',
    items: [
      {
        id: 'structure',
        icon: Compass,
        question: 'How is the dashboard structured?',
        answer: [
          'The left sidebar organizes everything into four groups:',
          'Overview — The main dashboard with top KPIs, SCO/MT trend, and product contribution. This is your daily starting point.',
          'Analysis — Five analytical modules: SCO Bridge (profitability drivers), Market Intelligence (external benchmarks and competitor landscape), Customer Portfolio (scatter analysis with target/limit corridors), Pricing & Conditions (net price and condition spending), and Operations (volume, cost, and production sites).',
          'Deep-dives — Detailed tables for Pricing (product-level analysis with gross-to-net waterfall) and Cost (category-level variance analysis).',
          'System — Data Connections (source systems and sync status) and this FAQ page.',
        ],
      },
      {
        id: 'filters',
        icon: SlidersHorizontal,
        question: 'What do the filters do and how should I use them?',
        answer: [
          'The filter bar at the top controls all views simultaneously. Every chart, table, and KPI card reacts to your filter selection in real-time.',
          'Time Period: Choose from month-to-month, PL period (4 months), YTD (9 months), or full fiscal year. This controls how much history you see in trend charts and whether KPIs aggregate monthly or cumulatively.',
          'Region / Cluster / Segment / Customer: Progressive drill-down from global to individual customer. Start broad, then narrow to investigate specific issues.',
          'Pricing Archetype: Filter by customer strategy type (Value Maximizer, Volume Partner, Spot Opportunist, Contract Loyal, Strategic Account). This is especially powerful in the Customer Portfolio scatter view to compare how different strategy groups perform.',
          'Product: Filter to a specific K+S product (Korn-Kali®, Patentkali®, etc.) to see product-specific KPIs and pricing.',
        ],
      },
      {
        id: 'archetypes',
        icon: Target,
        question: 'What are "Pricing Archetypes" and why do they matter?',
        answer: [
          'Pricing Archetypes classify customers by their commercial behavior and strategic importance, not just by segment or size. Each archetype calls for a different pricing strategy:',
          'Value Maximizer — Customers willing to pay premium for quality, service, and reliability. Strategy: protect and expand margins, emphasize value-added services.',
          'Volume Partner — Large-volume buyers who stabilize plant utilization. Strategy: competitive pricing within corridors, secure long-term contracts.',
          'Spot Opportunist — Price-sensitive buyers who switch suppliers frequently. Strategy: only serve at or above limit prices, no special conditions.',
          'Contract Loyal — Reliable repeat customers with predictable demand. Strategy: reward loyalty with moderate conditions, prioritize retention.',
          'Strategic Account — Key accounts with strategic importance beyond volume (market access, innovation partnerships). Strategy: invest in relationship, accept corridor flexibility for strategic value.',
        ],
      },
      {
        id: 'alerts',
        icon: Zap,
        question: 'What are price alerts and what should I do when I see them?',
        answer: [
          'Price alerts appear on the Customer Portfolio page when a customer\'s actual realized price falls below the defined limit price. This is the minimum acceptable price — going below it destroys value.',
          'Critical alerts (red) indicate significant breaches that require immediate action — typically escalation to the pricing committee or commercial director. Warning alerts (amber) signal prices approaching the limit and need monitoring.',
          'When you see an alert: (1) Check the customer and product combination. (2) Review whether it\'s a one-time exception or a pattern. (3) Check the customer\'s archetype — Spot Opportunists below limit should be declined; Strategic Accounts may warrant a corridor exception with documented justification. (4) Dismiss the alert only after taking action.',
        ],
      },
      {
        id: 'report',
        icon: Upload,
        question: 'What does the "Create Mgmt Report" button do?',
        answer: [
          'The report button (top right of the filter bar) generates a management-ready PDF or PowerPoint export of the current dashboard state — applying all active filters.',
          'The export includes: executive summary with top KPIs, SCO bridge waterfall, customer portfolio highlights (corridor violations), market context summary, and a condition spending overview. It\'s designed to be presentation-ready for board meetings or pricing committee reviews.',
          'In the production version, this will connect to your document template system. Reports can be scheduled (e.g., weekly Monday morning) or generated on-demand.',
        ],
      },
    ],
  },
  {
    id: 'data',
    title: 'Data & Integration',
    subtitle: 'Where data comes from and how it stays current',
    color: '#d49a1a',
    items: [
      {
        id: 'sources',
        icon: Database,
        question: 'Where does the data come from?',
        answer: [
          'The platform integrates data from multiple source systems:',
          'Transactional data (sales, volumes, prices, costs) — SAP S/4HANA or SAP BW via certified RFC/OData connectors. This is the backbone: every invoice, delivery, and cost posting feeds the SCO calculation.',
          'Market benchmarks (MOP prices, competitor indices) — Argus FMB and Bloomberg terminal feeds via REST API. Updated daily or intraday depending on the data provider.',
          'Input costs (energy, freight) — TTF natural gas and electricity spot prices from European Energy Exchange (EEX). Freight indices from Baltic Exchange.',
          'FX rates — European Central Bank (ECB) daily reference rates for EUR/USD, EUR/BRL, and other relevant pairs.',
          'Strategy & targets (target prices, limit corridors, archetypes) — Maintained by the pricing team directly in the admin interface or via structured Excel upload.',
        ],
      },
      {
        id: 'refresh',
        icon: RefreshCw,
        question: 'How often is data refreshed?',
        answer: [
          'Different data sources refresh at different frequencies:',
          'Sales & volume data: Every 15–60 minutes via incremental sync from SAP. You\'re always looking at near-real-time actuals.',
          'Cost data: Daily batch load (overnight), as cost allocations in SAP typically run as batch jobs.',
          'Market prices: Daily (Argus FMB publishes once per business day). Intraday feeds available from Bloomberg if needed.',
          'FX rates: Daily from ECB. Intraday from Bloomberg/Reuters if required for trading operations.',
          'The "Data Connections" page in the System section shows the exact sync status, last update timestamp, and latency for each source.',
        ],
      },
      {
        id: 'manual',
        icon: Upload,
        question: 'Can I upload or edit data manually?',
        answer: [
          'Yes — but only for strategy and target data, not for transactional data. The principle: actuals are always system-sourced (no manual overrides), while strategy inputs are user-managed.',
          'What you can upload/edit: target prices per product/region, limit price corridors, pricing archetype assignments per customer, budget/plan figures, and custom benchmark data.',
          'Upload methods: (1) Self-service admin UI with inline editing and validation. (2) Structured Excel template upload with error checking. (3) API endpoint for automated feeds from planning systems.',
          'All uploads are versioned — you can see who changed what and when, and roll back to any previous version.',
        ],
      },
    ],
  },
  {
    id: 'access',
    title: 'Access & Security',
    subtitle: 'Who can see what and how access is controlled',
    color: '#667885',
    items: [
      {
        id: 'permissions',
        icon: Shield,
        question: 'Who can access the dashboard and what can they see?',
        answer: [
          'Access is controlled through Role-Based Access Control (RBAC) integrated with your existing identity provider (Azure AD, SAP IDP, or any SAML/OIDC provider). Users log in with their existing corporate credentials — no separate account needed.',
          'Typical roles: (1) Viewer — can see dashboards and export reports, but not edit targets or dismiss alerts. (2) Pricing Manager — full access to their region/segment, can edit targets and manage alerts. (3) Admin — can manage all regions, edit global settings, and configure data connections. (4) Executive — read-only access to all regions with aggregated views.',
          'Data visibility is granular: a DACH pricing manager sees only DACH customers and pricing data. A global head sees everything. This is enforced at the data layer, not just the UI — even API calls respect the permission boundary.',
        ],
      },
      {
        id: 'audit',
        icon: Users,
        question: 'Is there an audit trail?',
        answer: [
          'Yes. Every action is logged: who accessed which data, when reports were exported, when target prices were changed, and when alerts were dismissed. This satisfies compliance requirements for SOX, GDPR, and internal audit standards.',
          'The audit log is tamper-proof and retained for a configurable period (default: 2 years). It can be exported for compliance reviews or integrated into your existing SIEM system.',
        ],
      },
    ],
  },
  {
    id: 'technical',
    title: 'Technology & Deployment',
    subtitle: 'How the system runs and how it\'s maintained',
    color: '#173B7A',
    items: [
      {
        id: 'tech-stack',
        icon: Globe,
        question: 'What technology does this run on?',
        answer: [
          'The frontend is a modern React/TypeScript single-page application (SPA). It runs in any modern browser — no plugins, no Java, no desktop installation. The entire UI you\'re looking at right now is a fully functional prototype of the production system.',
          'The backend is a REST API (Node.js or Python) that handles data aggregation, caching, and business logic (SCO calculations, alert generation, corridor checks). It sits between the frontend and your data sources.',
          'Deployment options: (1) Azure (recommended for Microsoft-centric enterprises — pairs with Azure AD, Azure SQL, Power Automate). (2) AWS or GCP. (3) On-premises / private cloud if required by data policy. (4) Embedded in SAP Fiori Launchpad or SharePoint as an iframe or web component.',
        ],
      },
      {
        id: 'maintenance',
        icon: Wrench,
        question: 'Who maintains the system after go-live?',
        answer: [
          'The system is designed for low maintenance. Day-to-day operations require no IT involvement — pricing managers maintain their own targets, corridors, and archetype assignments through the admin UI.',
          'Technical maintenance: data pipeline monitoring (automated alerts if a sync fails), quarterly security patches, and infrastructure scaling are handled by your IT team or a managed service agreement. The Data Connections page gives IT a real-time health dashboard.',
          'Feature evolution: new modules, KPIs, or integrations are delivered in 2–4 week sprints. The modular architecture means adding a new analysis view doesn\'t require rebuilding existing ones.',
        ],
      },
      {
        id: 'timeline',
        icon: Clock,
        question: 'How long does implementation take?',
        answer: [
          'Phase 1 — MVP (8–12 weeks): Core dashboard with SCO bridge, customer portfolio, and pricing analysis. Connected to SAP for transactional data. Basic role-based access. This is what you\'re seeing in this prototype, connected to live data instead of mock data.',
          'Phase 2 — Full Platform (16–20 weeks): Market intelligence integration (Argus, Bloomberg), condition spending deep-dives, production site analytics, automated alerting, scheduled report generation, and full RBAC with data-level security.',
          'Phase 3 — Advanced Analytics (ongoing): Predictive pricing recommendations, what-if simulation for condition changes, automated anomaly detection, and AI-driven market signal interpretation.',
          'Delivery is agile with bi-weekly demos and stakeholder feedback. You\'ll see working software from week 2, not a specification document.',
        ],
      },
    ],
  },
  {
    id: 'evolution',
    title: 'Customization & Evolution',
    subtitle: 'How to adapt, extend, and improve over time',
    color: '#1a8754',
    items: [
      {
        id: 'new-kpis',
        icon: Puzzle,
        question: 'Can we add new KPIs or change existing ones?',
        answer: [
          'Yes. The KPI framework is fully configurable. Adding a new KPI card to the dashboard takes 1–2 days if the underlying data exists in your source systems. Changing thresholds, labels, or calculation logic is even faster.',
          'Examples of KPIs that can be added: customer lifetime value, working capital impact of payment terms, seasonal price index, tender win/loss ratio, or any custom metric your pricing team tracks today in Excel.',
          'The SCO bridge effects can also be customized — if your internal reporting splits cost effects differently (e.g., separating fixed vs. variable energy costs), the waterfall adapts accordingly.',
        ],
      },
      {
        id: 'new-modules',
        icon: Layers,
        question: 'Can we add entirely new analytical modules?',
        answer: [
          'Absolutely. The modular architecture means new pages plug in without affecting existing ones. Common additions requested by pricing teams:',
          'Tender Management — Track open tenders, competitor intelligence per tender, win probability, and historical win/loss analysis by archetype.',
          'What-If Simulation — Model the SCO impact of a 3% list price increase on Korn-Kali® in DACH, or the margin effect of granting an additional 2% rebate to a Volume Partner.',
          'Customer Health Score — Combine pricing compliance, volume trend, payment behavior, and complaint frequency into a single score per customer.',
          'Seasonal Planning — Overlay weather data and agricultural planting cycles with volume forecasts to optimize seasonal pricing.',
        ],
      },
      {
        id: 'integrations',
        icon: Database,
        question: 'Can it connect to systems beyond SAP?',
        answer: [
          'Yes. The integration layer is system-agnostic. While SAP S/4HANA and BW are the primary sources for K+S, the platform can also connect to:',
          'CRM systems (Salesforce, SAP C4C) — for customer relationship context and pipeline data.',
          'Planning tools (Anaplan, SAP IBP) — for budget and forecast figures.',
          'Data lakes and warehouses (Snowflake, Databricks, Azure Synapse) — if you consolidate data centrally.',
          'Custom APIs — any system that exposes data via REST, GraphQL, or database connection can be integrated. The Data Connections page you see in the System section is exactly how this is monitored in production.',
        ],
      },
    ],
  },
]

function FAQCard({ item, sectionColor }: { item: FAQItem; sectionColor: string }) {
  const [open, setOpen] = useState(false)
  const Icon = item.icon

  return (
    <button
      type="button"
      onClick={() => setOpen((prev) => !prev)}
      className={`w-full text-left bg-card rounded-xl border overflow-hidden card-hover transition-all duration-200 ${
        open ? 'border-primary/25 shadow-sm' : 'border-border'
      }`}
      style={{ borderLeft: `4px solid ${sectionColor}` }}
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
        <div className="px-6 pb-5 pt-0 ml-[52px] space-y-2.5">
          {item.answer.map((paragraph, i) => (
            <p key={i} className="text-sm text-text-secondary leading-relaxed">{paragraph}</p>
          ))}
        </div>
      )}
    </button>
  )
}

export default function ImplementationFAQ() {
  const totalQuestions = faqSections.reduce((s, sec) => s + sec.items.length, 0)

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-text-primary">
          Frequently Asked Questions
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          Everything you need to know — from &ldquo;what is this?&rdquo; to &ldquo;how do we evolve it?&rdquo;
        </p>
        <p className="text-xs text-text-muted mt-2">
          {faqSections.length} sections &middot; {totalQuestions} questions
        </p>
      </div>

      {/* Quick Navigation */}
      <div className="flex flex-wrap gap-2 mb-8">
        {faqSections.map((section) => (
          <a
            key={section.id}
            href={`#faq-${section.id}`}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border border-border bg-card hover:bg-bg-warm transition-colors text-text-secondary"
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: section.color }} />
            {section.title}
          </a>
        ))}
      </div>

      {/* Sections */}
      <div className="space-y-10">
        {faqSections.map((section) => (
          <div key={section.id} id={`faq-${section.id}`}>
            <div className="mb-4 flex items-center gap-3">
              <div className="w-1 h-8 rounded-full" style={{ backgroundColor: section.color }} />
              <div>
                <h3 className="text-sm font-bold text-text-primary uppercase tracking-wide">{section.title}</h3>
                <p className="text-xs text-text-muted mt-0.5">{section.subtitle}</p>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              {section.items.map((item) => (
                <FAQCard key={item.id} item={item} sectionColor={section.color} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
