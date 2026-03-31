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

      {/* ================================================================== */}
      {/* PowerBI Build Guide — Step by Step for First-Time Users            */}
      {/* ================================================================== */}
      <div className="mt-8 mb-4">
        <h2 className="text-lg font-bold text-text-primary">PowerBI Build Guide — Step by Step</h2>
        <p className="text-xs text-text-muted mt-1">
          Complete instructions to rebuild this dashboard in PowerBI Desktop. Written for someone opening PowerBI for the first time.
        </p>
      </div>

      {/* Phase 0: Setup */}
      <div className="bg-card rounded-lg border border-border p-5 mb-4">
        <h3 className="text-[14px] font-bold text-accent mb-3">Phase 0 — Install & Setup</h3>
        <ol className="text-[13px] text-text-secondary space-y-3 list-decimal list-inside">
          <li><strong>Download PowerBI Desktop</strong> — Free from Microsoft Store or powerbi.microsoft.com. Windows only (Mac users need a VM or use the web version at app.powerbi.com after publishing).</li>
          <li><strong>Open PowerBI Desktop</strong> — You'll see a blank canvas with three views on the left sidebar: Report (chart icon), Data (table icon), Model (relationship icon).</li>
          <li><strong>Get a PowerBI Pro license</strong> — Needed to publish and share. £7.50/user/month. Your IT admin can assign one through Microsoft 365 admin center.</li>
          <li><strong>Prepare your data</strong> — For the prototype, export SAP data to Excel files. Later you'll connect directly to SAP via gateway. You need these tables as Excel sheets:
            <div className="mt-2 ml-4 bg-bg-warm rounded p-3 text-[12px] font-mono space-y-1">
              <p><strong>Transactions.xlsx</strong> — One row per billing line: MaterialNo, Qty, NetPrice, GlobalListPrice, RegionalListPrice, SegmentPrice, COGS, CustomerNo, Date, Country, Segment, SubSegment</p>
              <p><strong>Materials.xlsx</strong> — Material master: MaterialNo, Description, ProductFamily, MaterialCategory (100-500), Scope (Global/Local)</p>
              <p><strong>PricingPolicy.xlsx</strong> — Approved discount thresholds per MaterialCategory</p>
              <p><strong>Countries.xlsx</strong> — Country code, name, region, peer group assignment</p>
            </div>
          </li>
        </ol>
      </div>

      {/* Phase 1: Data Model */}
      <div className="bg-card rounded-lg border border-border p-5 mb-4">
        <h3 className="text-[14px] font-bold text-accent mb-3">Phase 1 — Load Data & Build the Model</h3>
        <ol className="text-[13px] text-text-secondary space-y-3 list-decimal list-inside">
          <li><strong>Load data</strong> — Click "Get Data" → "Excel Workbook" → select your file → check the tables you want → "Load". Repeat for each file.</li>
          <li><strong>Switch to Model view</strong> — Click the relationship icon (3rd icon) on the left sidebar. You'll see your tables as boxes.</li>
          <li><strong>Create relationships</strong> — Drag and drop to connect:
            <div className="mt-1 ml-4 text-[12px] font-mono bg-bg-warm rounded p-2 space-y-0.5">
              <p>Transactions[MaterialNo] → Materials[MaterialNo] (many-to-one)</p>
              <p>Transactions[Country] → Countries[Code] (many-to-one)</p>
            </div>
          </li>
          <li><strong>Create a Date table</strong> — This is critical for time intelligence (YTD, PY, etc.):
            <div className="mt-1 ml-4 text-[12px] font-mono bg-bg-warm rounded p-2">
              <p>Click "Modeling" tab → "New Table" → paste this DAX:</p>
              <p className="mt-1">Calendar = CALENDAR(DATE(2023,1,1), DATE(2026,12,31))</p>
              <p className="mt-1">Then add columns: Year, Month, MonthName, Quarter, FiscalYear</p>
            </div>
          </li>
          <li><strong>Mark as Date Table</strong> — Right-click the Calendar table → "Mark as Date Table" → select the Date column.</li>
          <li><strong>Connect Date</strong> — Drag Transactions[Date] → Calendar[Date].</li>
          <li><strong>Create the Parts Hierarchy</strong> — In Data view, select Materials table → right-click "Scope" → "Create Hierarchy" → drag MaterialCategory, ProductFamily, MaterialNo into it. Name it "Parts Hierarchy".</li>
        </ol>
      </div>

      {/* Phase 2: Core Measures */}
      <div className="bg-card rounded-lg border border-border p-5 mb-4">
        <h3 className="text-[14px] font-bold text-accent mb-3">Phase 2 — Create DAX Measures</h3>
        <p className="text-[12px] text-text-muted mb-3">Click "Modeling" → "New Measure" for each. Put them all in a "Measures" table (create one by clicking "Enter Data" → name it "_Measures" → add measures there).</p>
        <div className="space-y-3">
          {[
            { name: 'Revenue', dax: 'Revenue = SUMX(Transactions, Transactions[NetPrice] * Transactions[Qty])' },
            { name: 'Revenue PY', dax: 'Revenue PY = CALCULATE([Revenue], SAMEPERIODLASTYEAR(Calendar[Date]))' },
            { name: 'Total Quantity', dax: 'Total Qty = SUM(Transactions[Qty])' },
            { name: 'Total Qty PY', dax: 'Total Qty PY = CALCULATE([Total Qty], SAMEPERIODLASTYEAR(Calendar[Date]))' },
            { name: 'Total COGS', dax: 'Total COGS = SUMX(Transactions, Transactions[COGS] * Transactions[Qty])' },
            { name: 'Gross Margin %', dax: 'GM% = DIVIDE([Revenue] - [Total COGS], [Revenue], 0)' },
            { name: 'Realization Rate', dax: 'Realization = AVERAGEX(Transactions, DIVIDE(Transactions[NetPrice], Transactions[SegmentPrice], 0))' },
            { name: 'List Price Coverage', dax: 'ListCoverage = AVERAGEX(Transactions, DIVIDE(Transactions[NetPrice], Transactions[GlobalListPrice], 0))' },
            { name: 'Net Price Index', dax: 'NetPriceIndex = AVERAGEX(Transactions, DIVIDE(Transactions[NetPrice], Transactions[GlobalListPrice], 0)) * 100' },
            { name: 'Last-Mile Discount', dax: 'LastMile = AVERAGEX(Transactions, DIVIDE(Transactions[NetPrice] - Transactions[SegmentPrice], Transactions[SegmentPrice], 0))' },
            { name: 'Active SKUs', dax: 'ActiveSKU = CALCULATE(DISTINCTCOUNT(Transactions[MaterialNo]), Transactions[Qty] > 0)' },
            { name: 'Transaction Count', dax: 'TxnCount = COUNTROWS(Transactions)' },
            { name: 'Confidence Flag', dax: 'Confidence = SWITCH(TRUE(), [TxnCount] < 5, "Suppressed", [TxnCount] < 30, "LowN", "OK")' },
            { name: 'Price Effect', dax: 'PriceEffect = SUMX(Transactions, (Transactions[NetPrice] - Transactions[NetPricePY]) * Transactions[Qty])' },
            { name: 'Volume Effect', dax: 'VolumeEffect = SUMX(Transactions, Transactions[NetPricePY] * (Transactions[Qty] - Transactions[QtyPY]))' },
          ].map(m => (
            <div key={m.name} className="bg-bg-warm rounded p-2.5">
              <p className="text-[12px] font-semibold text-text-primary mb-0.5">{m.name}</p>
              <code className="text-[11px] font-mono text-accent">{m.dax}</code>
            </div>
          ))}
        </div>
      </div>

      {/* Phase 3: Pages */}
      <div className="bg-card rounded-lg border border-border p-5 mb-4">
        <h3 className="text-[14px] font-bold text-accent mb-3">Phase 3 — Build the Report Pages</h3>
        <p className="text-[12px] text-text-muted mb-3">Each page corresponds to a tab at the bottom of PowerBI. Right-click a page tab → "Add Page" to create new pages. Rename them.</p>

        <div className="space-y-4">
          <div className="border-l-3 border-l-accent pl-4">
            <h4 className="text-[13px] font-bold text-text-primary mb-1">Page 1: Executive Summary</h4>
            <ol className="text-[12px] text-text-secondary space-y-1.5 list-decimal list-inside">
              <li><strong>KPI Cards (top row)</strong> — Insert → Card visual (5 times). Drag Revenue, Total Qty, NetPriceIndex, GM%, ActiveSKU into each.</li>
              <li><strong>Price Waterfall</strong> — Insert → "Waterfall chart" visual. Category = step names (Global List, Regional Adj, etc.). Values = adjustment amounts. This is the trickiest visual — you need a helper table with waterfall steps. Alternative: use a stacked bar chart with transparent base bar (same technique as this prototype).</li>
              <li><strong>Last-Mile Distribution</strong> — Insert → "Bar chart". Axis = MaterialCategory. Values = [LastMile]. Sort descending.</li>
              <li><strong>Volume Table</strong> — Insert → Table. Columns: MaterialCategory, [Total Qty], [Total Qty PY], qty delta %, [Revenue], rev delta %. Add conditional formatting: Format → Cell elements → Background color → Rules → if qty delta &gt; 0 AND rev delta &lt; qty delta * 0.5 → amber.</li>
              <li><strong>Revenue Bridge</strong> — Same waterfall technique. Steps: PY Revenue, Price Effect, Volume Effect, Mix Effect, FX Effect, CY Revenue.</li>
              <li><strong>Monthly Trend</strong> — Insert → "Line chart". Axis = Calendar[MonthName]. Values = [Total Qty] and [Revenue]. Add [Total Qty PY] and [Revenue PY] as dotted lines (Format → Line style → Dashed).</li>
            </ol>
          </div>

          <div className="border-l-3 border-l-accent pl-4">
            <h4 className="text-[13px] font-bold text-text-primary mb-1">Page 2: Price Realization</h4>
            <ol className="text-[12px] text-text-secondary space-y-1.5 list-decimal list-inside">
              <li><strong>KPI Cards</strong> — 5 cards: [Realization], [ListCoverage], [LastMile], cells below 80 count, [TxnCount].</li>
              <li><strong>Heatmap</strong> — Insert → "Matrix" visual. Rows = MaterialCategory. Columns = SubSegment. Values = [Realization]. Format → Cell elements → Background color → Rules: ≥0.85 green, ≥0.80 amber, &lt;0.80 red. For low-n: add [Confidence] as tooltip, and use conditional formatting → Font color → grey when [Confidence] = "LowN".</li>
              <li><strong>Action Items</strong> — Insert → Table. Columns: ProductFamily, MaterialCategory, [Realization], gap calculation, revenue impact. Sort by revenue impact descending. Top N filter = 5.</li>
              <li><strong>Insight Cards</strong> — Insert → "Card" or "Multi-row card". Use DAX measures that concatenate text with data values. Example: <code className="font-mono text-[10px] bg-bg-warm px-1 rounded">"Cat " &amp; [WorstCategory] &amp; " avg " &amp; FORMAT([WorstReal], "0.0%")</code></li>
              <li><strong>Drill-through</strong> — Enable drill-through: right-click any table row → "Drill through" → Cross-Reference page (set up in step 5 below).</li>
            </ol>
          </div>

          <div className="border-l-3 border-l-accent pl-4">
            <h4 className="text-[13px] font-bold text-text-primary mb-1">Page 3: Parts Deep Dive</h4>
            <ol className="text-[12px] text-text-secondary space-y-1.5 list-decimal list-inside">
              <li><strong>Scatter Chart</strong> — Insert → "Scatter chart". X = [Realization]. Y = [GM%]. Size = [Revenue]. Legend = MaterialCategory. Details = ProductFamily. Add a constant line at Y=25% (Format → Analytics → Constant Line).</li>
              <li><strong>Bookmarks for tabs</strong> — Create 3 bookmarks (View → Bookmarks): "Scatter", "Discount Variance", "Priority Matrix". Each shows/hides different visuals. Add 3 buttons at top → assign bookmark to each button (Format → Action → Bookmark).</li>
              <li><strong>Discount Variance Table</strong> — Table visual with columns: ProductFamily, MaterialCategory, ApprovedDiscount, [ActualDiscount], variance, authority exceeded flag. Hide initially, show via bookmark.</li>
              <li><strong>Priority Matrix</strong> — Second scatter chart. X = realization gap (pp). Y = revenue at risk. Add reference lines at X=8 and Y=300. Color by quadrant using a calculated column.</li>
            </ol>
          </div>

          <div className="border-l-3 border-l-accent pl-4">
            <h4 className="text-[13px] font-bold text-text-primary mb-1">Page 4: Regional Benchmark</h4>
            <ol className="text-[12px] text-text-secondary space-y-1.5 list-decimal list-inside">
              <li><strong>Bar Chart</strong> — Insert → "Clustered bar chart". Axis = Country. Values = [Realization]. Conditional formatting on bars: your country = gold (#c8960c), others = blue (#4a6fa5). Add average line (Format → Analytics → Average Line).</li>
              <li><strong>Margin Table</strong> — Table with Country, [Realization], [GM%], flag column. Conditional formatting on flag column.</li>
              <li><strong>Grey Market Row</strong> — Use conditional formatting: if ABS([Realization] - [YourRealization]) &gt; 15pp → red background, red font.</li>
              <li><strong>Sub-Segments tab</strong> — Same bookmark technique. Second table grouped by SubSegment with confidence column.</li>
            </ol>
          </div>

          <div className="border-l-3 border-l-accent pl-4">
            <h4 className="text-[13px] font-bold text-text-primary mb-1">Page 5: Cross-Reference (Drill-Through)</h4>
            <ol className="text-[12px] text-text-secondary space-y-1.5 list-decimal list-inside">
              <li><strong>Set as drill-through page</strong> — Drag ProductFamily to the "Drill-through" field well (at the bottom of the Visualizations pane when this page is selected). This means clicking any ProductFamily anywhere in the report → right-click → "Drill through" → lands here filtered to that family.</li>
              <li><strong>KPI Cards</strong> — 6 cards: [Realization], [GM%], [Total Qty], [Revenue], [LastMile], vs peer best.</li>
              <li><strong>Price Ladder</strong> — Multi-row card or table with 4 rows: Global List, Segment Price, Avg Net Price, COGS.</li>
              <li><strong>Sparklines</strong> — Use "Sparkline" column in a table (available in newer PowerBI versions): add [Realization] by Calendar[Month] as a sparkline column. Or use a small line chart visual.</li>
              <li><strong>SKU Table</strong> — Table visual at the bottom. Columns: MaterialNo, Description, GlobalListPrice, NetPrice, [Realization], [GM%], [Total Qty], [Revenue], last transaction date. Enable drill-down from ProductFamily to MaterialNo using the Parts Hierarchy.</li>
              <li><strong>Back button</strong> — Insert → Button → "Back". Set Action = Back. This returns to wherever the user drilled from.</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Phase 4: Filters & RLS */}
      <div className="bg-card rounded-lg border border-border p-5 mb-4">
        <h3 className="text-[14px] font-bold text-accent mb-3">Phase 4 — Slicers, Filters & Row-Level Security</h3>
        <ol className="text-[13px] text-text-secondary space-y-3 list-decimal list-inside">
          <li><strong>Add Slicers</strong> — For each filter in the left sidebar of this prototype, add a Slicer visual to the left of each page:
            <div className="mt-1 ml-4 text-[12px] bg-bg-warm rounded p-2 space-y-0.5">
              <p>• Countries[Region] — slicer, dropdown style</p>
              <p>• Materials[Scope] — slicer (Global / Local / All)</p>
              <p>• Materials[MaterialCategory] — slicer</p>
              <p>• Transactions[Segment] — slicer</p>
              <p>• Transactions[SubSegment] — slicer</p>
              <p>• Calendar[FiscalYear] + Calendar[Quarter] — slicer for time</p>
            </div>
          </li>
          <li><strong>Sync slicers across pages</strong> — View → Sync Slicers. Check all pages for each slicer. This makes filters persist when switching tabs.</li>
          <li><strong>Set up RLS</strong> — Modeling → "Manage Roles" → New Role → name it "MC User" → add filter: Countries[Code] = USERPRINCIPALNAME() lookup. Second role: "HQ" with no filters. After publishing, assign users to roles in the PowerBI Service.</li>
          <li><strong>Test RLS</strong> — Modeling → "View as Roles" → select "MC User" → verify you only see one country's data.</li>
        </ol>
      </div>

      {/* Phase 5: Publish */}
      <div className="bg-card rounded-lg border border-border p-5 mb-4">
        <h3 className="text-[14px] font-bold text-accent mb-3">Phase 5 — Formatting, Publishing & Sharing</h3>
        <ol className="text-[13px] text-text-secondary space-y-3 list-decimal list-inside">
          <li><strong>Theme</strong> — View → Themes → "Customize current theme". Set:
            <div className="mt-1 ml-4 text-[12px] bg-bg-warm rounded p-2 space-y-0.5">
              <p>• Primary color: #1a2332 (navy)</p>
              <p>• Secondary: #c8960c (gold)</p>
              <p>• Data colors: #4a6fa5, #1a8754, #c43e3e, #d49a1a, #667885</p>
              <p>• Font: Segoe UI, 9pt for labels, 24pt for KPI values</p>
              <p>• Background: #f0f2f5</p>
              <p>• Card background: #ffffff</p>
            </div>
          </li>
          <li><strong>Conditional formatting rules</strong> — For every KPI card and table column, set up: positive = green (#1a8754), negative = red (#c43e3e), warning = amber (#d49a1a). For low-n: font color = grey (#8492a6).</li>
          <li><strong>Page names</strong> — Right-click each page tab → rename to match: "Executive Summary", "Price Realization", "Parts Deep Dive", "Regional Benchmark", "Cross-Reference".</li>
          <li><strong>Publish</strong> — Home → Publish → select your workspace. This uploads the .pbix file to the PowerBI Service (cloud).</li>
          <li><strong>Create an App</strong> — In PowerBI Service (app.powerbi.com): go to your workspace → "Create app". This gives users a clean URL and hides the workspace complexity.</li>
          <li><strong>Schedule refresh</strong> — In PowerBI Service: Dataset settings → Scheduled refresh → set to daily (or as needed). If using Excel files, you need a Gateway installed on a machine with access to the files.</li>
          <li><strong>Assign RLS</strong> — In PowerBI Service: Dataset → Security → add users/groups to "MC User" or "HQ" roles.</li>
          <li><strong>Share</strong> — Either share the App link, or add users to the workspace with "Viewer" role.</li>
        </ol>
      </div>

      {/* Tips */}
      <div className="bg-card rounded-lg border border-border border-l-3 border-l-positive p-4 mb-4">
        <h3 className="text-[13px] font-semibold text-positive mb-2">Tips for First-Time PowerBI Users</h3>
        <ul className="text-[12px] text-text-secondary space-y-1.5">
          <li>• <strong>Save often</strong> — PowerBI Desktop saves as .pbix files. Save after every major change.</li>
          <li>• <strong>Use Format Painter</strong> — Select a visual → click Format Painter → click another visual. Copies all formatting instantly.</li>
          <li>• <strong>Ctrl+Click to multi-select</strong> — Select multiple visuals to align or resize them together.</li>
          <li>• <strong>Alt+Enter in DAX</strong> — Creates a new line in the formula bar. Makes long measures readable.</li>
          <li>• <strong>Performance Analyzer</strong> — View → Performance Analyzer → Start Recording. Shows which visuals are slow.</li>
          <li>• <strong>Start with Import mode</strong> — Don't use DirectQuery until you need real-time data. Import is much faster.</li>
          <li>• <strong>Phone layout</strong> — View → Mobile Layout. Drag visuals into the phone canvas for mobile users. Optional but nice.</li>
          <li>• <strong>Bookmarks = tabs</strong> — PowerBI doesn't have native sub-tabs. Use Bookmarks + Buttons to simulate tabs (like our Scatter/Discount Variance/Priority Matrix tabs).</li>
          <li>• <strong>Ask Copilot</strong> — If you have Copilot for PowerBI (M365 license), you can ask it to create measures and visuals in natural language.</li>
        </ul>
      </div>

      {/* Estimated timeline */}
      <div className="bg-card rounded-lg border border-border p-4">
        <h3 className="text-[13px] font-semibold text-text-primary mb-2">Estimated Build Effort</h3>
        <table className="w-full text-[12px]">
          <thead>
            <tr className="bg-bg-warm">
              <th className="text-left px-3 py-1.5 font-semibold text-text-muted uppercase text-[10px]">Phase</th>
              <th className="text-left px-3 py-1.5 font-semibold text-text-muted uppercase text-[10px]">Effort</th>
              <th className="text-left px-3 py-1.5 font-semibold text-text-muted uppercase text-[10px]">Prerequisite</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-border"><td className="px-3 py-1.5">Phase 0: Setup</td><td className="px-3 py-1.5">1 hour</td><td className="px-3 py-1.5">Windows PC, M365 license</td></tr>
            <tr className="border-t border-border bg-bg/30"><td className="px-3 py-1.5">Phase 1: Data Model</td><td className="px-3 py-1.5">2–4 hours</td><td className="px-3 py-1.5">SAP extracts in Excel</td></tr>
            <tr className="border-t border-border"><td className="px-3 py-1.5">Phase 2: DAX Measures</td><td className="px-3 py-1.5">3–5 hours</td><td className="px-3 py-1.5">Phase 1 complete</td></tr>
            <tr className="border-t border-border bg-bg/30"><td className="px-3 py-1.5">Phase 3: Report Pages</td><td className="px-3 py-1.5">6–10 hours</td><td className="px-3 py-1.5">Phase 2 complete</td></tr>
            <tr className="border-t border-border"><td className="px-3 py-1.5">Phase 4: Filters & RLS</td><td className="px-3 py-1.5">2–3 hours</td><td className="px-3 py-1.5">Phase 3 complete</td></tr>
            <tr className="border-t border-border bg-bg/30"><td className="px-3 py-1.5">Phase 5: Publish & Share</td><td className="px-3 py-1.5">1–2 hours</td><td className="px-3 py-1.5">PowerBI Pro license, Gateway for refresh</td></tr>
            <tr className="border-t-2 border-border font-semibold"><td className="px-3 py-1.5">Total</td><td className="px-3 py-1.5 text-accent">15–25 hours</td><td className="px-3 py-1.5">Spread over 1–2 weeks</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
