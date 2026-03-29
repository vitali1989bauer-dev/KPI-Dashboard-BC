import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface Section {
  title: string
  page: string
  items: {
    name: string
    formula: string
    unit: string
    source: string
    powerbi: string
    threshold?: string
  }[]
}

const sections: Section[] = [
  {
    title: 'Executive Summary KPIs',
    page: 'Page 1 — Executive Summary',
    items: [
      { name: 'Revenue YTD', formula: 'SUM( [NetPrice] × [Quantity] )  for selected period', unit: '£ / € / local', source: 'SAP SD — Billing docs (VBRK/VBRP)', powerbi: 'Card visual. Measure: [Revenue] = SUMX(Transactions, [NetPrice] * [Qty])' },
      { name: 'Quantity YTD', formula: 'SUM( [Quantity] )  for selected period', unit: 'units', source: 'SAP SD — Billing docs', powerbi: 'Card visual. Measure: [TotalQty] = SUM(Transactions[Qty])' },
      { name: 'Net Price Index', formula: 'AVG( [NetPrice] / [GlobalListPrice] ) × 100', unit: 'index (100 = list)', source: 'SAP SD + Price Master', powerbi: 'Card visual. Measure: [NetPriceIndex] = AVERAGEX(Transactions, [NetPrice]/[GlobalList]*100)' },
      { name: 'Gross Margin', formula: '( SUM([NetPrice] × [Qty]) − SUM([COGS] × [Qty]) ) / SUM([NetPrice] × [Qty]) × 100', unit: '%', source: 'SAP CO — Cost centers + SD billing', powerbi: 'Card. [GM%] = DIVIDE([Revenue]-[TotalCOGS], [Revenue])' },
      { name: 'Active SKUs', formula: 'DISTINCTCOUNT( [MaterialNumber] )  WHERE [Qty] > 0 in period', unit: 'count', source: 'SAP MM — Material master', powerbi: 'Card. [ActiveSKU] = CALCULATE(DISTINCTCOUNT(Trans[MaterialNo]), Trans[Qty]>0)' },
    ],
  },
  {
    title: 'Price Waterfall (Indexed)',
    page: 'Page 1 — Executive Summary',
    items: [
      { name: 'Global List (=100)', formula: 'Reference base. All steps indexed to this.', unit: 'index', source: 'Price Master — Global list price per material', powerbi: 'Stacked bar (waterfall pattern). Base bar transparent, adjustment bars colored.' },
      { name: 'Regional Adjustment', formula: '( [RegionalListPrice] − [GlobalListPrice] ) / [GlobalListPrice] × 100', unit: 'index points', source: 'Price Master — Regional price list', powerbi: 'Negative bar (red). DAX: [RegAdj] = AVERAGEX(Trans, ([RegList]-[GlobList])/[GlobList]*100)' },
      { name: 'Regional List', formula: '[GlobalList index] + [Regional Adjustment]', unit: 'index', source: 'Calculated', powerbi: 'Subtotal bar (grey)' },
      { name: 'Segment Adjustment', formula: '( [SegmentPrice] − [RegionalListPrice] ) / [GlobalListPrice] × 100', unit: 'index points', source: 'Price Master — Segment price list', powerbi: 'Negative bar (red). [SegAdj] = AVERAGEX(Trans, ([SegPrice]-[RegList])/[GlobList]*100)' },
      { name: 'Segment Price', formula: '[Regional List index] + [Segment Adjustment]', unit: 'index', source: 'Calculated', powerbi: 'Subtotal bar (grey)' },
      { name: 'Last-Mile Discount', formula: '( [NetPrice] − [SegmentPrice] ) / [GlobalListPrice] × 100', unit: 'index points', source: 'SAP SD — Condition records (KONV)', powerbi: 'Negative bar (red). This is the discretionary discount granted by MC.' },
      { name: 'Net Price', formula: '[Segment Price index] + [Last-Mile Discount]', unit: 'index', source: 'Calculated', powerbi: 'Final bar (green). = Realization Rate when compared to Segment Price.' },
    ],
  },
  {
    title: 'Revenue Bridge',
    page: 'Page 1 — Executive Summary',
    items: [
      { name: 'PY Revenue', formula: 'SUM( [NetPrice_PY] × [Qty_PY] )  prior year same period', unit: '£k', source: 'SAP SD — Prior year billing', powerbi: 'Waterfall visual (native). Start bar.' },
      { name: 'Price Effect', formula: 'SUM( ([NetPrice_CY] − [NetPrice_PY]) × [Qty_CY] )  — what changed due to price', unit: '£k', source: 'Calculated — hold qty constant at CY, vary price', powerbi: 'Green/red bar. [PriceEffect] = SUMX(Trans, ([NetPriceCY]-[NetPricePY])*[QtyCY])' },
      { name: 'Volume Effect', formula: 'SUM( [NetPrice_PY] × ([Qty_CY] − [Qty_PY]) )  — what changed due to volume', unit: '£k', source: 'Calculated — hold price constant at PY, vary qty', powerbi: '[VolumeEffect] = SUMX(Trans, [NetPricePY]*([QtyCY]-[QtyPY]))' },
      { name: 'Mix Effect', formula: 'Residual: [CY Revenue] − [PY Revenue] − [Price Effect] − [Volume Effect] − [FX Effect]', unit: '£k', source: 'Calculated', powerbi: 'Residual measure. Captures category/product mix shifts.' },
      { name: 'FX Effect', formula: 'SUM( [Revenue_LocalCcy] × ([FXRate_CY] − [FXRate_PY]) )', unit: '£k', source: 'Treasury / SAP FI exchange rates', powerbi: '[FXEffect] = SUMX(Trans, [RevLocal]*([FX_CY]-[FX_PY]))' },
    ],
  },
  {
    title: 'Price Realization KPIs',
    page: 'Page 2 — Price Realization',
    items: [
      { name: 'Realization Rate', formula: 'AVG( [NetPrice] / [SegmentTargetPrice] ) × 100', unit: '%', source: 'SAP SD (net price) + Price Master (segment target)', powerbi: 'Card. [Realization] = AVERAGEX(Trans, DIVIDE([NetPrice],[SegTarget]))*100', threshold: '≥85% green, 80–84% amber, <80% red' },
      { name: 'List Price Coverage', formula: 'AVG( [NetPrice] / [GlobalListPrice] ) × 100', unit: '%', source: 'SAP SD + Price Master', powerbi: 'Card. [ListCoverage] = AVERAGEX(Trans, DIVIDE([NetPrice],[GlobalList]))*100' },
      { name: 'Avg. Last-Mile Discount', formula: 'AVG( ([NetPrice] − [SegmentPrice]) / [SegmentPrice] ) × 100', unit: '% (negative)', source: 'SAP SD — Condition records', powerbi: 'Card. [LastMile] = AVERAGEX(Trans, DIVIDE([NetPrice]-[SegPrice],[SegPrice]))*100' },
      { name: 'Cells Below 80%', formula: 'COUNT of (SubSegment × Category) combinations WHERE [Realization] < 80%', unit: 'count', source: 'Calculated from heatmap', powerbi: 'Card. COUNTROWS(FILTER(HeatmapTable, [AvgReal]<80))' },
    ],
  },
  {
    title: 'Realization Heatmap',
    page: 'Page 2 — Price Realization',
    items: [
      { name: 'Cell value', formula: 'AVG( [NetPrice] / [SegmentTargetPrice] ) × 100  grouped by [SubSegment] × [MaterialCategory]', unit: '%', source: 'SAP SD + Price Master', powerbi: 'Matrix visual. Rows = MaterialCategory, Columns = SubSegment. Value = [Realization]. Background color = conditional formatting rule.', threshold: '≥85% green, 80–84% amber, <80% red. n<30 faded, n<5 suppressed.' },
      { name: 'Transaction count (n)', formula: 'COUNT( [TransactionID] )  per cell', unit: 'count', source: 'SAP SD', powerbi: 'Tooltip page showing n. Conditional formatting: font color grey + italic when n<30.' },
    ],
  },
  {
    title: 'Parts Deep Dive — Scatter',
    page: 'Page 3 — Parts Deep Dive',
    items: [
      { name: 'X-axis: Realization Rate', formula: 'AVG( [NetPrice] / [SegmentTargetPrice] ) × 100  per [ProductFamily]', unit: '%', source: 'SAP SD + Price Master', powerbi: 'Scatter chart. X = [Realization], Y = [GrossMargin%], Size = [Revenue]' },
      { name: 'Y-axis: Gross Margin %', formula: '( AVG([NetPrice]) − AVG([COGS]) ) / AVG([NetPrice]) × 100  per [ProductFamily]', unit: '%', source: 'SAP SD + CO', powerbi: 'Legend = [MaterialCategory]. Reference line at Y=25% (margin floor).' },
      { name: 'Bubble size: Revenue', formula: 'SUM( [NetPrice] × [Qty] )  per [ProductFamily]', unit: '£k', source: 'SAP SD', powerbi: 'Size field in scatter visual.' },
      { name: '25% Margin Floor', formula: 'Fixed threshold — parts below this require cost review', unit: '%', source: 'Business rule (confirm with Finance)', powerbi: 'Constant line visual element at Y=25.', threshold: 'Below 25% = red zone. Confirm if 25% is approved threshold.' },
    ],
  },
  {
    title: 'Discount Variance',
    page: 'Page 3 — Parts Deep Dive (tab 2)',
    items: [
      { name: 'Approved Discount', formula: 'MAX approved discount % per [MaterialCategory] from pricing policy', unit: '%', source: 'Pricing Policy table / SAP condition master', powerbi: 'Table visual column. From dimension table [PolicyDiscount].' },
      { name: 'Actual Discount', formula: 'AVG( ([NetPrice] − [SegmentPrice]) / [SegmentPrice] ) × 100  per [ProductFamily]', unit: '%', source: 'SAP SD', powerbi: '[ActualDiscount] = AVERAGEX(FILTER(Trans, [Family]=SELECTEDVALUE(...)), ...)' },
      { name: 'Authority Exceeded', formula: 'IF( ABS([ActualDiscount]) > ABS([ApprovedDiscount]) × 1.5, TRUE )', unit: 'flag', source: 'Calculated', powerbi: 'Conditional formatting icon set (flag/cross).' },
    ],
  },
  {
    title: 'Regional Benchmark',
    page: 'Page 4 — Regional Benchmark',
    items: [
      { name: 'Peer Realization', formula: 'AVG( [NetPrice] / [SegmentTargetPrice] ) × 100  per [Country/MC]', unit: '%', source: 'SAP SD — cross-MC data (HQ role only sees aggregates)', powerbi: 'Bar chart. Each bar = one MC/country. Your bar = gold, peers = blue.' },
      { name: 'Peer Group Auto-Match', formula: 'SWITCH( [Segment], "Marine" → "North Sea", "Rail" → "Central Europe", "Industry" → "EMEA Industrial" )', unit: 'text', source: 'Configuration table', powerbi: 'DAX: [PeerGroup] = SWITCH([Segment], "Marine","North Sea", ...). Slicer pre-filtered.' },
      { name: 'Grey Market Alert', formula: 'FLAG WHERE ABS( [Realization_Country] − [Realization_YourMC] ) > 15pp AND Country NOT IN PeerGroup', unit: 'flag', source: 'Calculated', powerbi: 'Conditional row formatting. [GreyFlag] = IF(ABS([Real]-[YourReal])>15, "Grey Market", BLANK())', threshold: '>15pp gap = grey market risk. Escalation to HQ.' },
    ],
  },
  {
    title: 'Cross-Reference View',
    page: 'Page 5 — Cross-Reference',
    items: [
      { name: 'Price Ladder', formula: '[GlobalListPrice] → [SegmentPrice] → [AvgNetPrice] → [COGS]  per part family', unit: '£', source: 'Price Master + SAP SD + CO', powerbi: 'Table or card visuals in drill-through page. Triggered by clicking any part family.' },
      { name: 'Realization Trend', formula: 'AVG( [NetPrice] / [SegmentTarget] ) × 100  per [Month]  for selected part family', unit: '%', source: 'SAP SD + Price Master', powerbi: 'Sparkline / line chart. In PowerBI: use sparkline column in table, or separate line chart filtered by drill-through.' },
      { name: 'Quantity Trend', formula: 'SUM( [Qty] )  per [Month]  for selected part family', unit: 'units', source: 'SAP SD', powerbi: 'Sparkline. Same approach as realization trend.' },
      { name: 'vs Peer Best', formula: '[YourRealization] − MAX( [PeerRealization] )  per part family', unit: 'pp', source: 'Cross-MC aggregated data', powerbi: 'Card. [vsPeerBest] = [MyReal] - MAXX(PeerTable, [PeerReal])' },
    ],
  },
  {
    title: 'Low-N Confidence System',
    page: 'All pages',
    items: [
      { name: 'Transaction Count', formula: 'COUNT( [TransactionID] )  per visual context (cell, card, row)', unit: 'count', source: 'SAP SD', powerbi: 'Conditional formatting on all visuals. Two thresholds:', threshold: 'n < 30: reduced opacity (60%), show "n=X" badge. n < 5: suppress value, show "—".' },
      { name: 'PowerBI Implementation', formula: 'Create [ConfidenceFlag] = SWITCH(TRUE(), [n]<5, "Suppressed", [n]<30, "LowN", "OK")', unit: 'text', source: 'Calculated column or measure', powerbi: 'Conditional formatting → Rules → Font color grey when [ConfidenceFlag]="LowN". Background grey when "Suppressed".' },
    ],
  },
  {
    title: 'Parts Hierarchy (Data Model)',
    page: 'Filter panel / all pages',
    items: [
      { name: 'Scope', formula: 'Global Parts = centrally managed. Local Parts = MC-sourced.', unit: 'dimension', source: 'Material master — custom field or plant assignment', powerbi: 'Slicer. [Scope] column in Material dimension table.' },
      { name: 'Material Category', formula: 'Cat 100 (Standard) → Cat 500 (Core Competence). Defines pricing authority and expected margins.', unit: 'dimension', source: 'Material master — WGBEZ / Material Group', powerbi: 'Slicer + hierarchy drill. Part of [Scope] → [Category] → [Family] → [SKU] hierarchy.' },
      { name: 'Product Family', formula: 'Grouping of related SKUs (e.g., "Coupling Plates", "VSP Controls")', unit: 'dimension', source: 'Material master — Product hierarchy or custom grouping', powerbi: 'Drill-down level. Enable hierarchy drill in matrix/chart visuals.' },
      { name: 'SKU (Material Number)', formula: 'Individual part number. Lowest granularity.', unit: 'dimension', source: 'SAP MM — MATNR', powerbi: 'Drill-through target. Click any family → see SKU-level table.' },
    ],
  },
  {
    title: 'Row-Level Security (RLS)',
    page: 'System / deployment',
    items: [
      { name: 'MC Role', formula: 'User sees only their region/MC data. Region filter locked.', unit: 'role', source: 'Azure AD / Entra ID → user email → MC mapping table', powerbi: 'RLS role in data model. DAX: [UserMC] = LOOKUPVALUE(UserTable[MC], UserTable[Email], USERPRINCIPALNAME())' },
      { name: 'HQ Role', formula: 'User sees all MCs. Can compare cross-region. Region filter unlocked.', unit: 'role', source: 'Azure AD group membership', powerbi: 'RLS role with no filter, or separate "HQ" role that passes all rows.' },
      { name: 'Peer Data Privacy', formula: 'MC users see peer aggregates only (bar charts), not raw transaction data. HQ sees all.', unit: 'rule', source: 'Business rule', powerbi: 'Separate measures: [PeerAvg] visible to MC, [PeerDetail] visible to HQ only via RLS.' },
    ],
  },
]

function SectionPanel({ section }: { section: Section }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3 hover:bg-bg-warm/50 transition-colors cursor-pointer"
      >
        <div className="text-left">
          <h3 className="text-[13px] font-semibold text-text-primary">{section.title}</h3>
          <p className="text-[11px] text-text-muted">{section.page} · {section.items.length} items</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-bg-warm text-[10px] font-bold text-text-muted">{section.items.length}</span>
          {open ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-border">
          <table className="w-full">
            <thead>
              <tr className="bg-bg-warm">
                <th className="text-left px-4 py-2 text-[10px] font-semibold text-text-muted uppercase w-40">Metric</th>
                <th className="text-left px-4 py-2 text-[10px] font-semibold text-text-muted uppercase">Formula / Definition</th>
                <th className="text-left px-4 py-2 text-[10px] font-semibold text-text-muted uppercase w-20">Unit</th>
                <th className="text-left px-4 py-2 text-[10px] font-semibold text-text-muted uppercase w-52">Data Source</th>
                <th className="text-left px-4 py-2 text-[10px] font-semibold text-text-muted uppercase">PowerBI Implementation</th>
              </tr>
            </thead>
            <tbody>
              {section.items.map((item, idx) => (
                <tr key={item.name} className={`border-t border-border ${idx % 2 ? 'bg-bg/30' : ''}`}>
                  <td className="px-4 py-2.5 text-[12px] font-semibold text-text-primary align-top">{item.name}</td>
                  <td className="px-4 py-2.5 text-[12px] text-text-secondary align-top">
                    <code className="text-[11px] bg-bg-warm px-1.5 py-0.5 rounded font-mono text-text-primary">{item.formula}</code>
                    {item.threshold && (
                      <p className="mt-1 text-[10px] text-accent font-semibold">Threshold: {item.threshold}</p>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-[12px] text-text-muted align-top">{item.unit}</td>
                  <td className="px-4 py-2.5 text-[11px] text-text-secondary align-top">{item.source}</td>
                  <td className="px-4 py-2.5 text-[11px] text-text-secondary align-top">{item.powerbi}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function Reference() {
  return (
    <div>
      <div className="mb-5">
        <h2 className="text-lg font-bold text-text-primary">Reference — Formulas, Data Sources & PowerBI Mapping</h2>
        <p className="text-xs text-text-muted mt-1">
          Every KPI, visual, and calculated field documented with formula, source system, and PowerBI implementation guidance.
          Use this as the specification for the PowerBI rebuild.
        </p>
      </div>

      {/* Quick reference cards */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        <div className="bg-card rounded-lg border border-border p-3">
          <p className="text-[10px] font-medium text-text-muted uppercase">Total Metrics</p>
          <p className="text-xl font-bold text-text-primary">{sections.reduce((s, sec) => s + sec.items.length, 0)}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-3">
          <p className="text-[10px] font-medium text-text-muted uppercase">Pages Covered</p>
          <p className="text-xl font-bold text-text-primary">5 + system</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-3">
          <p className="text-[10px] font-medium text-text-muted uppercase">Primary Source</p>
          <p className="text-xl font-bold text-text-primary">SAP SD/CO/MM</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-3">
          <p className="text-[10px] font-medium text-text-muted uppercase">Key Open Item</p>
          <p className="text-xl font-bold text-negative">Target Price def.</p>
          <p className="text-[10px] text-text-muted">Segment list vs calculated?</p>
        </div>
      </div>

      {/* Open items */}
      <div className="bg-card rounded-lg border border-border border-l-3 border-l-accent p-4 mb-5">
        <h3 className="text-[13px] font-semibold text-accent mb-2">Open Items for Client Discussion</h3>
        <ul className="text-xs text-text-secondary space-y-1.5">
          <li>1. <strong>Target Price definition</strong> — Is it the segment price list, or a calculated field (cost + target margin)? Affects Realization Rate formula.</li>
          <li>2. <strong>SAP field mapping</strong> — Exact column names for Global List Price, Regional List, Segment Price in condition tables (KONV). Need T-code/table spec.</li>
          <li>3. <strong>Material Category assignment</strong> — Where is Cat 100–500 stored? MARA-MATKL? Custom field? Product hierarchy?</li>
          <li>4. <strong>25% GM floor threshold</strong> — Is this an approved business rule from Finance, or illustrative? Needs sign-off.</li>
          <li>5. <strong>Grey market governance</strong> — Dashboard flags &gt;15pp gaps. What is the actual escalation workflow? Who acts?</li>
          <li>6. <strong>Currency handling</strong> — Local MC currency or EUR-normalized? Affects all cross-region comparisons.</li>
          <li>7. <strong>Local Parts scope</strong> — How to identify in material master? Plant-level flag? Purchasing org assignment?</li>
          <li>8. <strong>Refresh cadence</strong> — Daily? Weekly? Real-time? Determines PowerBI dataset mode (Import vs DirectQuery).</li>
        </ul>
      </div>

      {/* All sections */}
      <div className="space-y-2">
        {sections.map((section) => (
          <SectionPanel key={section.title} section={section} />
        ))}
      </div>
    </div>
  )
}
