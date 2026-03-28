// ---------------------------------------------------------------------------
// Voith Turbo — Spare Parts Pricing Intelligence
// Filter types, options & data model
// ---------------------------------------------------------------------------

// --- Filter options ---
export const regions = ['All Regions', 'Europe · UK', 'Europe · DE', 'Europe · NO', 'Europe · NL', 'Europe · DK', 'Americas · US', 'Americas · BR', 'APAC · CN', 'APAC · SG']
export const divisions = ['Voith Turbo']
export const segments = ['All Segments', 'Rail', 'Marine', 'Industry']
export const subSegments: Record<string, string[]> = {
  'All Segments': ['All Sub-Segments'],
  'Rail': ['All Sub-Segments', 'Mainline', 'Metro & Light Rail', 'Shunting', 'High-Speed'],
  'Marine': ['All Sub-Segments', 'Tugs', 'Ferries', 'OS Wind', 'OS Oil&Gas', 'Military', 'Yachts'],
  'Industry': ['All Sub-Segments', 'Mining', 'Oil & Gas', 'Power Generation', 'Metals', 'Paper & Board'],
}
export const materialCategories = ['All Categories', 'Cat 100 – Standard', 'Cat 200 – Mod. Standard', 'Cat 300 – Semi-custom', 'Cat 400 – Custom', 'Cat 500 – Core Competence']
export const matCatShort = ['Cat 100', 'Cat 200', 'Cat 300', 'Cat 400', 'Cat 500']
export const timePeriods = ['MTD', 'YTD', 'R12M', 'FY25']
export const comparisonPeriods = ['Prior Year (PY)', 'Prior Quarter (PQ)', 'Budget']

// Parts hierarchy: Scope → Category → Product Family → SKU
export const partsScope = ['Global Parts', 'Local Parts', 'All Parts']

export type UserRole = 'mc' | 'hq'

export interface Filters {
  timePeriod: string
  region: string
  division: string
  segment: string
  subSegment: string
  materialCategory: string
  comparisonPeriod: string
  partsScope: string
  role: UserRole
}

export const defaultFilters: Filters = {
  timePeriod: 'YTD',
  region: 'Europe · UK',
  division: 'Voith Turbo',
  segment: 'Marine',
  subSegment: 'Tugs',
  materialCategory: 'All Categories',
  comparisonPeriod: 'Prior Year (PY)',
  partsScope: 'Global Parts',
  role: 'mc',
}

// ---------------------------------------------------------------------------
// Deterministic variation helper
// ---------------------------------------------------------------------------
function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0
  }
  return h
}

function filterSeed(f: Filters): number {
  const key = `${f.timePeriod}|${f.region}|${f.segment}|${f.subSegment}|${f.materialCategory}`
  const h = Math.abs(hash(key))
  return (h % 1000) / 1000
}

function factor(f: Filters, offset = 0): number {
  const seed = filterSeed(f)
  const shifted = ((seed * 997 + offset * 131) % 1000) / 1000
  return 0.85 + shifted * 0.3 // tighter range for realistic %
}

function vary(base: number, f: Filters, offset = 0): number {
  return Math.round(base * factor(f, offset) * 10) / 10
}

function varyPct(base: number, f: Filters, offset = 0): number {
  // For percentages — smaller variation
  const seed = filterSeed(f)
  const shifted = ((seed * 997 + offset * 131) % 1000) / 1000
  const fac = 0.92 + shifted * 0.16
  return Math.round(base * fac * 10) / 10
}

// ---------------------------------------------------------------------------
// Low-n transaction threshold system
// When sparse filters produce few transactions, KPIs should be flagged
// PowerBI: conditional formatting rule on [TransactionCount] < threshold
// ---------------------------------------------------------------------------
export const LOW_N_THRESHOLD = 30 // below this, KPI is "low confidence"
export const SUPPRESS_THRESHOLD = 5 // below this, suppress value entirely

export interface TransactionCount {
  count: number
  isLowN: boolean
  isSuppressed: boolean
}

export function getTransactionCount(f: Filters): TransactionCount {
  // Simulate: narrower filters = fewer transactions
  let base = 1847
  if (f.subSegment !== 'All Sub-Segments') base = Math.round(base * 0.18)
  if (f.materialCategory !== 'All Categories') base = Math.round(base * 0.22)
  if (f.segment !== 'All Segments') base = Math.round(base * 0.35)
  if (f.timePeriod === 'MTD') base = Math.round(base * 0.08)
  const count = Math.max(2, Math.round(vary(base, f, 9999)))
  return {
    count,
    isLowN: count < LOW_N_THRESHOLD,
    isSuppressed: count < SUPPRESS_THRESHOLD,
  }
}

// Per-cell transaction count for heatmap
export function getCellTransactionCount(f: Filters, catIdx: number, subIdx: number): TransactionCount {
  const baseCounts = [45, 28, 15, 38, 52, 22, 12, 34, 48, 8, 42, 31, 19, 55, 37, 26, 14, 41, 3, 47, 33, 16, 44, 29, 11, 36, 50, 23, 7, 39]
  const idx = (catIdx * 6 + subIdx) % baseCounts.length
  let count = Math.round(vary(baseCounts[idx], f, 2000 + catIdx * 10 + subIdx))
  if (f.timePeriod === 'MTD') count = Math.round(count * 0.08)
  return {
    count: Math.max(1, count),
    isLowN: count < LOW_N_THRESHOLD,
    isSuppressed: count < SUPPRESS_THRESHOLD,
  }
}

// ---------------------------------------------------------------------------
// KPI Cards — differentiated per page
// ---------------------------------------------------------------------------
export interface OverviewKpi {
  id: string
  label: string
  value: string
  subtitle: string
  status: 'positive' | 'negative' | 'neutral'
  accentColor: 'red' | 'blue' | 'green' | 'amber' | 'grey'
}

// Page 1: Executive Summary — revenue/volume focused
export function getExecSummaryKpis(f: Filters): OverviewKpi[] {
  const rev = Math.round(vary(4920, f, 50))
  const revPy = Math.round(vary(4680, f, 51))
  const revDelta = Math.round((rev - revPy) / revPy * 1000) / 10
  const qty = Math.round(vary(9870, f, 52))
  const qtyPy = Math.round(vary(9340, f, 53))
  const qtyDelta = Math.round((qty - qtyPy) / qtyPy * 1000) / 10
  const netIdx = varyPct(81.4, f, 54)
  const gm = varyPct(38.7, f, 55)
  const gmPy = varyPct(38.3, f, 56)
  const gmDelta = Math.round((gm - gmPy) * 10) / 10
  const activeSku = Math.round(vary(2840, f, 57))

  return [
    { id: 'revenue', label: 'Revenue YTD', value: `£${(rev / 1000).toFixed(1)}M`, subtitle: `${revDelta >= 0 ? '▲' : '▼'} ${Math.abs(revDelta).toFixed(1)}%  vs. PY £${(revPy / 1000).toFixed(1)}M`, status: revDelta >= 0 ? 'positive' : 'negative', accentColor: revDelta >= 0 ? 'green' : 'red' },
    { id: 'quantity', label: 'Quantity YTD', value: qty.toLocaleString(), subtitle: `${qtyDelta >= 0 ? '▲' : '▼'} ${Math.abs(qtyDelta).toFixed(1)}%  vs. PY`, status: qtyDelta >= 0 ? 'positive' : 'negative', accentColor: 'blue' },
    { id: 'net-index', label: 'Net Price Index', value: netIdx.toFixed(1), subtitle: 'vs. Global List = 100', status: 'neutral', accentColor: 'blue' },
    { id: 'gross-margin', label: 'Gross Margin', value: `${gm.toFixed(1)}%`, subtitle: `${gmDelta >= 0 ? '▲' : '▼'} ${Math.abs(gmDelta).toFixed(1)}pp  vs. PY`, status: gmDelta >= 0 ? 'positive' : 'negative', accentColor: gmDelta >= 0 ? 'green' : 'amber' },
    { id: 'active-sku', label: 'Active SKUs', value: activeSku.toLocaleString(), subtitle: `across ${f.partsScope === 'All Parts' ? 'all' : f.partsScope.toLowerCase()}`, status: 'neutral', accentColor: 'grey' },
  ]
}

// Page 2: Price Realization — realization/discount focused
export function getRealizationKpis(f: Filters): OverviewKpi[] {
  const real = varyPct(81.4, f, 1)
  const realPy = varyPct(83.7, f, 2)
  const listCov = varyPct(74.2, f, 3)
  const listCovPy = varyPct(75.3, f, 4)
  const lastMile = varyPct(-8.8, f, 7)
  const lastMilePy = varyPct(-7.6, f, 8)
  const txn = Math.round(vary(1847, f, 9))
  const below80 = Math.round(vary(8, f, 58))

  const realDelta = Math.round((real - realPy) * 10) / 10
  const listDelta = Math.round((listCov - listCovPy) * 10) / 10
  const lmDelta = Math.round((lastMile - lastMilePy) * 10) / 10

  return [
    { id: 'realization', label: 'Realization Rate', value: `${real.toFixed(1)}%`, subtitle: `${realDelta >= 0 ? '▲' : '▼'} ${Math.abs(realDelta).toFixed(1)}pp  vs. PY`, status: realDelta >= 0 ? 'positive' : 'negative', accentColor: realDelta >= 0 ? 'green' : 'red' },
    { id: 'list-coverage', label: 'List Price Coverage', value: `${listCov.toFixed(1)}%`, subtitle: `${listDelta >= 0 ? '▲' : '▼'} ${Math.abs(listDelta).toFixed(1)}pp  vs. PY`, status: listDelta >= 0 ? 'positive' : 'negative', accentColor: 'blue' },
    { id: 'last-mile', label: 'Avg. Last-Mile Discount', value: `${lastMile.toFixed(1)}%`, subtitle: `${lmDelta <= 0 ? '▲' : '▼'} ${Math.abs(lmDelta).toFixed(1)}pp  vs. PY`,
      status: lmDelta <= 0 ? 'positive' : 'negative',
      accentColor: lmDelta <= 0 ? 'green' : 'red',
    },
    { id: 'cells-below', label: 'Cells Below 80%', value: `${below80}`, subtitle: 'in heatmap — action required', status: below80 > 5 ? 'negative' : 'neutral', accentColor: below80 > 5 ? 'red' : 'grey' },
    { id: 'transactions', label: 'Transactions', value: txn.toLocaleString(), subtitle: `${f.timePeriod}`, status: 'neutral', accentColor: 'grey' },
  ]
}

// Backward compat
export function getOverviewKpis(f: Filters): OverviewKpi[] {
  return getRealizationKpis(f)
}

// ---------------------------------------------------------------------------
// Overview — Realization Rate Heatmap
// ---------------------------------------------------------------------------
export interface HeatmapCell {
  subSegment: string
  category: string
  value: number
}

export function getRealizationHeatmap(f: Filters): { subSegments: string[]; categories: string[]; cells: HeatmapCell[] } {
  const seg = f.segment === 'All Segments' ? 'Marine' : f.segment
  const subs = (subSegments[seg] || subSegments['Marine']).filter(s => s !== 'All Sub-Segments')
  const cats = matCatShort

  // Base realization rates — Cat 500 highest, Cat 100-200 lower
  const baseRates: Record<string, number[]> = {
    'Cat 100': [88, 85, 82, 86, 91, 83],
    'Cat 200': [81, 76, 78, 82, 87, 84],
    'Cat 300': [84, 81, 85, 77, 89, 83],
    'Cat 400': [86, 87, 80, 84, 90, 81],
    'Cat 500': [92, 90, 88, 93, 95, 89],
  }

  const cells: HeatmapCell[] = []
  cats.forEach((cat, ci) => {
    const bases = baseRates[cat] || baseRates['Cat 100']
    subs.forEach((sub, si) => {
      const base = bases[si % bases.length]
      cells.push({
        subSegment: sub,
        category: cat,
        value: Math.round(varyPct(base, f, 100 + ci * 10 + si)),
      })
    })
  })

  return { subSegments: subs, categories: cats, cells }
}

// ---------------------------------------------------------------------------
// Overview — Top Action Items
// ---------------------------------------------------------------------------
export interface ActionItem {
  partFamily: string
  category: string
  realizationPct: number
  gapPp: number
  revenueImpact: string
}

export function getTopActionItems(f: Filters): ActionItem[] {
  const base: ActionItem[] = [
    { partFamily: 'Coupling Plates', category: '200', realizationPct: 76, gapPp: -9, revenueImpact: '£42k' },
    { partFamily: 'OS Oil Filters', category: '300', realizationPct: 77, gapPp: -8, revenueImpact: '£31k' },
    { partFamily: 'Sealing Rings', category: '200', realizationPct: 78, gapPp: -7, revenueImpact: '£28k' },
    { partFamily: 'OS Oil&Gas Filters', category: '300', realizationPct: 80, gapPp: -5, revenueImpact: '£19k' },
    { partFamily: 'Thrust Bearings', category: '400', realizationPct: 80, gapPp: -5, revenueImpact: '£16k' },
  ]
  return base.map((item, i) => ({
    ...item,
    realizationPct: Math.round(varyPct(item.realizationPct, f, 200 + i)),
    gapPp: Math.round(vary(item.gapPp, f, 210 + i)),
  }))
}

// ---------------------------------------------------------------------------
// Overview — Insight Cards
// ---------------------------------------------------------------------------
export interface InsightCard {
  severity: 'warning' | 'info' | 'positive'
  title: string
  description: string
}

export function getInsightCards(f: Filters): InsightCard[] {
  const heatmap = getRealizationHeatmap(f)
  // Find worst category
  const catAvgs: Record<string, number[]> = {}
  heatmap.cells.forEach(c => {
    if (!catAvgs[c.category]) catAvgs[c.category] = []
    catAvgs[c.category].push(c.value)
  })
  const catMeans = Object.entries(catAvgs).map(([cat, vals]) => ({
    cat,
    avg: Math.round(vals.reduce((s, v) => s + v, 0) / vals.length * 10) / 10,
  })).sort((a, b) => a.avg - b.avg)

  const worst = catMeans[0]
  const best = catMeans[catMeans.length - 1]
  const sub = f.subSegment !== 'All Sub-Segments' ? f.subSegment : 'Ferries'

  // Template-based insights — each uses fixed structure + data slots
  // PowerBI: DAX measure with CONCATENATE / FORMAT / IF patterns
  return [
    {
      severity: 'warning',
      title: `${worst.cat} avg. realization ${worst.avg}% — ${sub}`,
      description: `Lowest category. Review discount authority thresholds. Last-mile discounts above policy for this sub-segment.`,
    },
    {
      severity: 'info',
      title: `${catMeans.length > 2 ? catMeans[2].cat : 'Cat 300'}: ${catMeans.length > 2 ? catMeans[2].avg : 83}% — below peer benchmark`,
      description: `No competitive pressure detected vs. peer group. Likely individual account concessions. Check customer-level pricing.`,
    },
    {
      severity: 'positive',
      title: `${best.cat} strong at ${best.avg}% across sub-segments`,
      description: `Pricing discipline template. Consider removing discretionary discount authority for ${best.cat} to protect position.`,
    },
  ]
}

// ---------------------------------------------------------------------------
// Price Waterfall — Indexed stepdown (Global List = 100)
// ---------------------------------------------------------------------------
export interface WaterfallStep {
  name: string
  value: number
  type: 'start' | 'end' | 'positive' | 'negative'
}

export function getPriceWaterfall(f: Filters): WaterfallStep[] {
  const regionalAdj = vary(-4.4, f, 400)
  const regionalList = 100 + regionalAdj
  const segmentAdj = vary(-5.4, f, 401) // from regional list to segment price
  const segmentPrice = regionalList + segmentAdj
  const lastMile = vary(-8.8, f, 402)
  const netPrice = Math.round((segmentPrice + lastMile) * 10) / 10

  return [
    { name: 'Global List', value: 100, type: 'start' },
    { name: 'Regional\nAdj.', value: regionalAdj, type: 'negative' },
    { name: 'Regional\nList', value: regionalList, type: 'end' },
    { name: 'Segment\nAdj.', value: segmentAdj, type: 'negative' },
    { name: 'Segment\nPrice', value: Math.round(segmentPrice * 10) / 10, type: 'end' },
    { name: 'Last-Mile\nDiscount', value: lastMile, type: 'negative' },
    { name: 'Net Price', value: netPrice, type: 'end' },
  ]
}

export interface WaterfallKpi {
  label: string
  value: string
  subtitle: string
  accentColor: 'blue' | 'red' | 'green' | 'amber' | 'grey'
}

export function getWaterfallKpis(f: Filters): WaterfallKpi[] {
  const structural = vary(-9.8, f, 410)
  const lastMile = vary(-8.8, f, 411)
  const netIdx = Math.round((100 + structural + lastMile) * 10) / 10
  const gm = varyPct(38.7, f, 412)
  const lmPyDelta = vary(-1.2, f, 413)
  const realDelta = vary(0.4, f, 414)

  return [
    { label: 'Global List (Index)', value: '100.0', subtitle: 'Reference base', accentColor: 'blue' },
    { label: 'Structural Discount', value: `${structural.toFixed(1)}%`, subtitle: `Regional + segment adj.`, accentColor: 'red' },
    { label: 'Last-Mile Discount', value: `${lastMile.toFixed(1)}%`, subtitle: `▼ ${Math.abs(lmPyDelta).toFixed(1)}pp vs. PY`, accentColor: 'red' },
    { label: 'Net Price (Index)', value: netIdx.toFixed(1), subtitle: `= Realization rate`, accentColor: 'blue' },
    { label: 'Gross Margin', value: `${gm.toFixed(1)}%`, subtitle: `▲ ${Math.abs(realDelta).toFixed(1)}pp vs. PY`, accentColor: 'green' },
  ]
}

// ---------------------------------------------------------------------------
// Price Waterfall — Last-Mile Discount Distribution
// ---------------------------------------------------------------------------
export interface LastMileCategory {
  category: string
  discount: number
  color: string
}

export function getLastMileDistribution(f: Filters): LastMileCategory[] {
  return [
    { category: 'Cat 500 – Core', discount: varyPct(-2.7, f, 420), color: '#1a8754' },
    { category: 'Cat 400 – Custom', discount: varyPct(-7.0, f, 421), color: '#173B7A' },
    { category: 'Cat 100 – Standard', discount: varyPct(-7.4, f, 422), color: '#667885' },
    { category: 'Cat 300 – Semi-custom', discount: varyPct(-9.8, f, 423), color: '#c8960c' },
    { category: 'Cat 200 – Mod. Std.', discount: varyPct(-11.2, f, 424), color: '#c43e3e' },
  ]
}

// ---------------------------------------------------------------------------
// Parts Deep Dive — Scatter data (Margin vs Realization)
// ---------------------------------------------------------------------------
export interface PartFamilyPoint {
  name: string
  category: string
  realizationPct: number
  marginPct: number
  revenue: number // for bubble size
}

export function getPartFamilyScatter(f: Filters): PartFamilyPoint[] {
  const base: Omit<PartFamilyPoint, 'realizationPct' | 'marginPct' | 'revenue'>[] = [
    { name: 'VSP Controls', category: 'Cat 500' },
    { name: 'Prop. Blades', category: 'Cat 500' },
    { name: 'Thrust Bearings', category: 'Cat 300-400' },
    { name: 'Hydr. Actuators', category: 'Cat 300-400' },
    { name: 'Coupling Plates', category: 'Cat 200' },
    { name: 'Sealing Rings', category: 'Cat 200' },
    { name: 'OS Oil Filters', category: 'Cat 200' },
    { name: 'Shaft Seals', category: 'Cat 300-400' },
    { name: 'Control Valves', category: 'Cat 300-400' },
    { name: 'Gear Wheels', category: 'Cat 300-400' },
    { name: 'Pressure Sensors', category: 'Cat 100' },
    { name: 'O-Rings', category: 'Cat 100' },
    { name: 'Bolts & Fasteners', category: 'Cat 100' },
    { name: 'Filter Elements', category: 'Cat 200' },
    { name: 'Clutch Discs', category: 'Cat 300-400' },
    { name: 'Impeller Units', category: 'Cat 500' },
    { name: 'Bearing Housings', category: 'Cat 300-400' },
    { name: 'Elec. Connectors', category: 'Cat 100' },
  ]

  const baseReal = [95, 92, 87, 86, 68, 70, 72, 84, 83, 82, 80, 78, 82, 75, 85, 93, 81, 79]
  const baseMargin = [58, 52, 42, 38, 22, 18, 15, 36, 34, 33, 28, 26, 30, 20, 37, 55, 32, 25]
  const baseRevenue = [420, 380, 310, 280, 520, 480, 350, 240, 220, 260, 180, 150, 120, 290, 270, 340, 200, 160]

  return base.map((pt, i) => ({
    ...pt,
    realizationPct: varyPct(baseReal[i], f, 500 + i),
    marginPct: varyPct(baseMargin[i], f, 530 + i),
    revenue: Math.round(vary(baseRevenue[i], f, 560 + i)),
  }))
}

// ---------------------------------------------------------------------------
// Parts Deep Dive — Summary KPIs
// ---------------------------------------------------------------------------
export interface PartsDeepDiveKpi {
  label: string
  value: string
  subtitle: string
  status: 'positive' | 'negative' | 'neutral'
}

export function getPartsDeepDiveKpis(f: Filters): PartsDeepDiveKpi[] {
  const avgGm = varyPct(38.7, f, 600)
  const belowThreshold = Math.round(vary(14, f, 601))
  const highestFamily = 'VSP Control Units'
  const highestFamilyCat = 'Cat 500'
  const highestPct = varyPct(61, f, 602)
  const spreadPp = Math.round(vary(39, f, 603))

  return [
    { label: 'Avg. Gross Margin', value: `${avgGm.toFixed(1)}%`, subtitle: `187 active part families`, status: 'neutral' },
    { label: 'Below 25% GM Threshold', value: `${belowThreshold} families`, subtitle: `£340k revenue at risk`, status: 'negative' },
    { label: 'Highest Margin Family', value: `${highestPct.toFixed(0)}%`, subtitle: `${highestFamily} (${highestFamilyCat})`, status: 'positive' },
    { label: 'Largest Margin Spread', value: `${spreadPp}pp`, subtitle: `Cat 200: 22%–61% range`, status: 'negative' },
  ]
}

// ---------------------------------------------------------------------------
// Regional Benchmark — Peer group comparison
// ---------------------------------------------------------------------------
export interface PeerCountry {
  code: string
  name: string
  realizationPct: number
  marginPct: number
  isYou: boolean
  flag: 'benchmark' | 'watch' | 'grey-market' | null
}

export function getPeerBenchmark(f: Filters): { peerGroupName: string; countries: PeerCountry[] } {
  // Auto-match peer group based on segment
  const segPeerMap: Record<string, string> = {
    'Marine': 'North Sea',
    'Rail': 'Central Europe',
    'Industry': 'EMEA Industrial',
    'All Segments': 'Global',
  }
  const peerGroupName = segPeerMap[f.segment] || 'North Sea'

  const regionCode = f.region.split(' · ')[1] || 'UK'

  const basePeers: Omit<PeerCountry, 'realizationPct' | 'marginPct'>[] = [
    { code: 'NO', name: 'Norway', isYou: regionCode === 'NO', flag: 'benchmark' },
    { code: 'UK', name: 'UK', isYou: regionCode === 'UK', flag: null },
    { code: 'DE', name: 'Germany', isYou: regionCode === 'DE', flag: null },
    { code: 'DK', name: 'Denmark', isYou: regionCode === 'DK', flag: null },
    { code: 'NL', name: 'Netherlands', isYou: regionCode === 'NL', flag: 'watch' },
  ]

  const baseReal = [84.1, 81.4, 80.9, 80.1, 79.3]
  const baseMargin = [41.2, 38.7, 37.4, 36.8, 35.1]

  const countries = basePeers.map((p, i) => ({
    ...p,
    isYou: p.code === regionCode,
    realizationPct: varyPct(baseReal[i], f, 700 + i),
    marginPct: varyPct(baseMargin[i], f, 720 + i),
  }))

  // Sort by realization descending
  countries.sort((a, b) => b.realizationPct - a.realizationPct)

  return { peerGroupName, countries }
}

// ---------------------------------------------------------------------------
// Regional Benchmark — Grey Market Alert
// ---------------------------------------------------------------------------
export interface GreyMarketAlert {
  country: string
  code: string
  realizationPct: number
  marginPct: number
  gapVsYou: number
  riskDescription: string
}

export function getGreyMarketAlerts(f: Filters): GreyMarketAlert[] {
  const plReal = varyPct(69.3, f, 750)
  const plMargin = varyPct(29.4, f, 751)
  const yourReal = varyPct(81.4, f, 752)

  return [
    {
      country: 'Poland',
      code: 'PL',
      realizationPct: plReal,
      marginPct: plMargin,
      gapVsYou: Math.round((plReal - yourReal) * 10) / 10,
      riskDescription: `${Math.abs(Math.round(plReal - yourReal))}pp gap vs. ${f.region.split(' · ')[1] || 'UK'}. Re-export risk at this price delta. Escalate to HQ pricing governance for minimum price harmonization.`,
    },
  ]
}

// ---------------------------------------------------------------------------
// Regional Benchmark — Summary KPIs
// ---------------------------------------------------------------------------
export interface RegionalKpi {
  label: string
  value: string
  subtitle: string
  status: 'positive' | 'negative' | 'neutral'
  accentColor: 'blue' | 'red' | 'green' | 'amber'
}

export function getRegionalKpis(f: Filters): RegionalKpi[] {
  const peerData = getPeerBenchmark(f)
  const peerAvg = peerData.countries.reduce((s, c) => s + c.realizationPct, 0) / peerData.countries.length
  const you = peerData.countries.find(c => c.isYou)
  const vsAvg = you ? Math.round((you.realizationPct - peerAvg) * 10) / 10 : 0
  const leader = peerData.countries[0]
  const greyAlerts = getGreyMarketAlerts(f)
  const rank = you ? peerData.countries.findIndex(c => c.isYou) + 1 : 0

  return [
    {
      label: `${f.region.split(' · ')[1] || 'UK'} vs. ${peerData.peerGroupName} Avg.`,
      value: `${vsAvg >= 0 ? '+' : ''}${vsAvg.toFixed(1)}pp`,
      subtitle: `Above peer avg. ${peerAvg.toFixed(1)}%`,
      status: vsAvg >= 0 ? 'positive' : 'negative',
      accentColor: vsAvg >= 0 ? 'green' : 'red',
    },
    {
      label: 'Benchmark Leader',
      value: `${leader.realizationPct.toFixed(1)}%`,
      subtitle: `${leader.name} — potential target`,
      status: 'neutral',
      accentColor: 'blue',
    },
    {
      label: 'Grey Market Alerts',
      value: `${greyAlerts.length} market${greyAlerts.length !== 1 ? 's' : ''}`,
      subtitle: `Gap >15% vs. ${f.region.split(' · ')[1] || 'UK'} list`,
      status: greyAlerts.length > 0 ? 'negative' : 'positive',
      accentColor: greyAlerts.length > 0 ? 'red' : 'green',
    },
    {
      label: `${f.region.split(' · ')[1] || 'UK'} Percentile Rank`,
      value: `${rank}${rank === 1 ? 'st' : rank === 2 ? 'nd' : rank === 3 ? 'rd' : 'th'} / ${peerData.countries.length}`,
      subtitle: `In ${peerData.peerGroupName} peer group`,
      status: rank <= 2 ? 'positive' : rank <= 3 ? 'neutral' : 'negative',
      accentColor: rank <= 2 ? 'green' : 'amber',
    },
  ]
}

// ---------------------------------------------------------------------------
// Trends — YoY by Material Category
// ---------------------------------------------------------------------------
export interface YoYCategoryData {
  category: string
  priorYear: number
  currentYear: number
  deltaPp: number
}

export function getYoYByCategory(f: Filters): YoYCategoryData[] {
  const base = [
    { category: 'Cat 100', py: 84, cy: 82 },
    { category: 'Cat 200', py: 82, cy: 78 },
    { category: 'Cat 300', py: 84, cy: 83 },
    { category: 'Cat 400', py: 87, cy: 86 },
    { category: 'Cat 500', py: 91, cy: 93 },
  ]

  return base.map((row, i) => {
    const py = varyPct(row.py, f, 800 + i)
    const cy = varyPct(row.cy, f, 810 + i)
    return {
      category: row.category,
      priorYear: py,
      currentYear: cy,
      deltaPp: Math.round((cy - py) * 10) / 10,
    }
  })
}

// ---------------------------------------------------------------------------
// Trends — Cost vs Price Inflation (3-year trajectory)
// ---------------------------------------------------------------------------
export interface CostVsPricePoint {
  year: string
  costChange: number
  priceChange: number
}

export function getCostVsPriceData(f: Filters): CostVsPricePoint[] {
  return [
    { year: '2023', costChange: vary(1.2, f, 900), priceChange: vary(0.8, f, 901) },
    { year: '2024', costChange: vary(2.8, f, 902), priceChange: vary(2.1, f, 903) },
    { year: '2025', costChange: vary(3.6, f, 904), priceChange: vary(2.8, f, 905) },
    { year: '2026 YTD', costChange: vary(4.1, f, 906), priceChange: vary(3.2, f, 907) },
  ]
}

// ---------------------------------------------------------------------------
// Trends — Summary KPIs
// ---------------------------------------------------------------------------
export interface TrendKpi {
  label: string
  value: string
  subtitle: string
  status: 'positive' | 'negative' | 'neutral'
  accentColor: 'red' | 'green' | 'blue' | 'amber'
}

export function getTrendKpis(f: Filters): TrendKpi[] {
  const realDelta = vary(-2.3, f, 950)
  const marginDelta = vary(0.4, f, 951)
  const listIncrease = vary(3.2, f, 952)
  const costIncrease = vary(4.1, f, 953)
  const discountDelta = vary(-1.2, f, 954)
  const realPy = varyPct(83.7, f, 955)
  const realCy = varyPct(81.4, f, 956)
  const gmPy = varyPct(38.3, f, 957)
  const gmCy = varyPct(38.7, f, 958)

  return [
    {
      label: 'Realization Δ YoY',
      value: `${realDelta >= 0 ? '+' : ''}${realDelta.toFixed(1)}pp`,
      subtitle: `${realCy.toFixed(1)}% vs. ${realPy.toFixed(1)}% PY`,
      status: realDelta >= 0 ? 'positive' : 'negative',
      accentColor: realDelta >= 0 ? 'green' : 'red',
    },
    {
      label: 'Margin Δ YoY',
      value: `${marginDelta >= 0 ? '+' : ''}${marginDelta.toFixed(1)}pp`,
      subtitle: `${gmCy.toFixed(1)}% vs. ${gmPy.toFixed(1)}% PY`,
      status: marginDelta >= 0 ? 'positive' : 'negative',
      accentColor: marginDelta >= 0 ? 'green' : 'red',
    },
    {
      label: 'Avg. List Price Increase',
      value: `+${listIncrease.toFixed(1)}%`,
      subtitle: 'Passed through to regional list',
      status: 'positive',
      accentColor: 'green',
    },
    {
      label: 'Avg. Cost Increase',
      value: `+${costIncrease.toFixed(1)}%`,
      subtitle: 'Outpacing price — margin risk',
      status: 'negative',
      accentColor: 'amber',
    },
    {
      label: 'Discount Depth Δ',
      value: `${discountDelta.toFixed(1)}pp`,
      subtitle: 'More last-mile discount given',
      status: discountDelta <= 0 ? 'negative' : 'positive',
      accentColor: discountDelta <= 0 ? 'red' : 'green',
    },
  ]
}

// ---------------------------------------------------------------------------
// Trends — Monthly detail
// ---------------------------------------------------------------------------
export interface MonthlyTrend {
  month: string
  realizationPct: number
  marginPct: number
  lastMilePct: number
}

const ALL_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function getMonthlyTrend(f: Filters): MonthlyTrend[] {
  const baseReal = [82.1, 81.8, 80.5, 81.2, 82.0, 81.6, 80.8, 81.4, 81.9, 82.3, 81.7, 82.0]
  const baseMargin = [39.1, 38.8, 38.2, 38.5, 39.0, 38.7, 38.3, 38.7, 39.0, 39.2, 38.8, 39.1]
  const baseLM = [-8.2, -8.5, -9.1, -8.8, -8.4, -8.6, -9.0, -8.8, -8.5, -8.3, -8.7, -8.4]

  const monthCount = f.timePeriod === 'MTD' ? 1 : f.timePeriod === 'YTD' ? 9 : f.timePeriod === 'R12M' ? 12 : 12

  return ALL_MONTHS.slice(0, monthCount).map((month, i) => ({
    month,
    realizationPct: varyPct(baseReal[i], f, 1000 + i),
    marginPct: varyPct(baseMargin[i], f, 1020 + i),
    lastMilePct: varyPct(baseLM[i], f, 1040 + i),
  }))
}

// ---------------------------------------------------------------------------
// Parts Deep Dive — Discount Variance tab
// ---------------------------------------------------------------------------
export interface DiscountVarianceItem {
  partFamily: string
  category: string
  approvedDiscount: number
  actualDiscount: number
  variancePp: number
  authorityExceeded: boolean
  transactionCount: number
}

export function getDiscountVariance(f: Filters): DiscountVarianceItem[] {
  const base: Omit<DiscountVarianceItem, 'actualDiscount' | 'variancePp' | 'authorityExceeded' | 'transactionCount'>[] = [
    { partFamily: 'Coupling Plates', category: 'Cat 200', approvedDiscount: -5.0 },
    { partFamily: 'Sealing Rings', category: 'Cat 200', approvedDiscount: -5.0 },
    { partFamily: 'OS Oil Filters', category: 'Cat 300', approvedDiscount: -4.0 },
    { partFamily: 'Thrust Bearings', category: 'Cat 400', approvedDiscount: -3.5 },
    { partFamily: 'Filter Elements', category: 'Cat 200', approvedDiscount: -5.0 },
    { partFamily: 'Shaft Seals', category: 'Cat 300', approvedDiscount: -4.0 },
    { partFamily: 'Control Valves', category: 'Cat 300', approvedDiscount: -4.0 },
    { partFamily: 'Gear Wheels', category: 'Cat 300', approvedDiscount: -3.5 },
    { partFamily: 'VSP Controls', category: 'Cat 500', approvedDiscount: -2.0 },
    { partFamily: 'Prop. Blades', category: 'Cat 500', approvedDiscount: -2.0 },
  ]

  const baseActuals = [-11.2, -9.8, -7.4, -5.2, -8.6, -6.1, -5.8, -4.9, -2.7, -2.3]
  const baseTxn = [82, 65, 48, 34, 71, 42, 38, 29, 55, 47]

  return base.map((item, i) => {
    const actual = varyPct(baseActuals[i], f, 1100 + i)
    const txn = Math.max(2, Math.round(vary(baseTxn[i], f, 1130 + i)))
    return {
      ...item,
      actualDiscount: actual,
      variancePp: Math.round((actual - item.approvedDiscount) * 10) / 10,
      authorityExceeded: actual < item.approvedDiscount * 1.5,
      transactionCount: txn,
    }
  }).sort((a, b) => a.variancePp - b.variancePp) // worst first
}

// ---------------------------------------------------------------------------
// Parts Deep Dive — Priority Matrix
// ---------------------------------------------------------------------------
export interface PriorityMatrixPoint {
  partFamily: string
  category: string
  realizationGapPp: number  // how far below target
  revenueAtRisk: number     // £k
  quadrant: 'quick-win' | 'strategic' | 'monitor' | 'low-priority'
}

export function getPriorityMatrix(f: Filters): PriorityMatrixPoint[] {
  const base = [
    { partFamily: 'Coupling Plates', category: 'Cat 200', gap: 14, rev: 520 },
    { partFamily: 'Sealing Rings', category: 'Cat 200', gap: 12, rev: 480 },
    { partFamily: 'OS Oil Filters', category: 'Cat 300', gap: 8, rev: 350 },
    { partFamily: 'Filter Elements', category: 'Cat 200', gap: 10, rev: 290 },
    { partFamily: 'Thrust Bearings', category: 'Cat 400', gap: 5, rev: 310 },
    { partFamily: 'Shaft Seals', category: 'Cat 300', gap: 6, rev: 240 },
    { partFamily: 'O-Rings', category: 'Cat 100', gap: 7, rev: 150 },
    { partFamily: 'Bolts & Fasteners', category: 'Cat 100', gap: 3, rev: 120 },
    { partFamily: 'Pressure Sensors', category: 'Cat 100', gap: 5, rev: 180 },
    { partFamily: 'VSP Controls', category: 'Cat 500', gap: 2, rev: 420 },
    { partFamily: 'Prop. Blades', category: 'Cat 500', gap: 3, rev: 380 },
    { partFamily: 'Impeller Units', category: 'Cat 500', gap: 1, rev: 340 },
  ]

  return base.map((item, i) => {
    const gap = Math.round(vary(item.gap, f, 1200 + i))
    const rev = Math.round(vary(item.rev, f, 1230 + i))
    const highGap = gap >= 8
    const highRev = rev >= 300
    const quadrant: PriorityMatrixPoint['quadrant'] = highGap && highRev ? 'quick-win' : highGap ? 'strategic' : highRev ? 'monitor' : 'low-priority'
    return { partFamily: item.partFamily, category: item.category, realizationGapPp: gap, revenueAtRisk: rev, quadrant }
  })
}

// ---------------------------------------------------------------------------
// Regional — Sub-Segment Benchmark
// ---------------------------------------------------------------------------
export interface SubSegmentBenchmark {
  subSegment: string
  realizationPct: number
  marginPct: number
  transactionCount: number
  vsSegmentAvg: number
}

export function getSubSegmentBenchmark(f: Filters): SubSegmentBenchmark[] {
  const seg = f.segment === 'All Segments' ? 'Marine' : f.segment
  const subs = (subSegments[seg] || subSegments['Marine']).filter(s => s !== 'All Sub-Segments')

  const baseReal = [83.2, 81.4, 79.8, 78.5, 85.1, 80.3]
  const baseMargin = [40.1, 38.7, 36.2, 35.8, 42.3, 37.9]
  const baseTxn = [320, 280, 180, 150, 95, 210]

  const segAvg = baseReal.slice(0, subs.length).reduce((s, v) => s + v, 0) / subs.length

  return subs.map((sub, i) => {
    const real = varyPct(baseReal[i % baseReal.length], f, 1300 + i)
    const txn = Math.max(3, Math.round(vary(baseTxn[i % baseTxn.length], f, 1330 + i)))
    return {
      subSegment: sub,
      realizationPct: real,
      marginPct: varyPct(baseMargin[i % baseMargin.length], f, 1360 + i),
      transactionCount: txn,
      vsSegmentAvg: Math.round((real - segAvg) * 10) / 10,
    }
  })
}

// ---------------------------------------------------------------------------
// Trends — 3-Year Trajectory (monthly granularity)
// ---------------------------------------------------------------------------
export interface TrajectoryPoint {
  label: string
  realizationPct: number
  marginPct: number
  lastMilePct: number
}

export function get3YearTrajectory(f: Filters): TrajectoryPoint[] {
  const years = [2024, 2025, 2026]
  const result: TrajectoryPoint[] = []
  const baseReal = [84.5, 83.2, 81.4]
  const baseMargin = [39.8, 38.6, 38.7]
  const baseLM = [-7.2, -8.0, -8.8]

  years.forEach((year, yi) => {
    const months = year === 2026 ? 9 : 12
    for (let m = 0; m < months; m++) {
      const monthLabel = `${ALL_MONTHS[m]} ${String(year).slice(2)}`
      const seasonalFactor = 1 + Math.sin((m - 3) * Math.PI / 6) * 0.01
      result.push({
        label: monthLabel,
        realizationPct: varyPct(baseReal[yi] * seasonalFactor, f, 1400 + yi * 12 + m),
        marginPct: varyPct(baseMargin[yi] * seasonalFactor, f, 1450 + yi * 12 + m),
        lastMilePct: varyPct(baseLM[yi], f, 1500 + yi * 12 + m),
      })
    }
  })
  return result
}

// ---------------------------------------------------------------------------
// Volume / Quantity Development — for Executive Summary
// ---------------------------------------------------------------------------
export interface VolumeByCategory {
  category: string
  currentQty: number
  priorYearQty: number
  deltaPct: number
  revenueCurrentK: number
  revenuePriorK: number
  revDeltaPct: number
}

export function getVolumeByCategory(f: Filters): VolumeByCategory[] {
  const base = [
    { category: 'Cat 100', cq: 4200, pq: 4500, cr: 680, pr: 710 },
    { category: 'Cat 200', cq: 2800, pq: 2400, cr: 920, pr: 840 },
    { category: 'Cat 300', cq: 1600, pq: 1550, cr: 1100, pr: 1050 },
    { category: 'Cat 400', cq: 850, pq: 820, cr: 1340, pr: 1280 },
    { category: 'Cat 500', cq: 420, pq: 390, cr: 1680, pr: 1520 },
  ]

  return base.map((row, i) => {
    const cq = Math.round(vary(row.cq, f, 1600 + i))
    const pq = Math.round(vary(row.pq, f, 1610 + i))
    const cr = Math.round(vary(row.cr, f, 1620 + i))
    const pr = Math.round(vary(row.pr, f, 1630 + i))
    return {
      category: row.category,
      currentQty: cq,
      priorYearQty: pq,
      deltaPct: Math.round((cq - pq) / pq * 1000) / 10,
      revenueCurrentK: cr,
      revenuePriorK: pr,
      revDeltaPct: Math.round((cr - pr) / pr * 1000) / 10,
    }
  })
}

export interface MonthlyVolume {
  month: string
  quantity: number
  quantityPY: number
  revenueK: number
  revenuePYK: number
}

export function getMonthlyVolume(f: Filters): MonthlyVolume[] {
  const baseQty = [980, 1020, 1150, 1080, 1200, 950, 880, 920, 1100, 1050, 980, 900]
  const baseQtyPY = [940, 980, 1100, 1040, 1150, 920, 850, 890, 1060, 1010, 950, 870]
  const baseRev = [520, 540, 610, 570, 640, 500, 460, 490, 580, 560, 520, 480]
  const baseRevPY = [480, 500, 570, 530, 600, 470, 430, 460, 540, 520, 490, 450]
  const monthCount = f.timePeriod === 'MTD' ? 1 : f.timePeriod === 'YTD' ? 9 : 12

  return ALL_MONTHS.slice(0, monthCount).map((month, i) => ({
    month,
    quantity: Math.round(vary(baseQty[i], f, 1700 + i)),
    quantityPY: Math.round(vary(baseQtyPY[i], f, 1720 + i)),
    revenueK: Math.round(vary(baseRev[i], f, 1740 + i)),
    revenuePYK: Math.round(vary(baseRevPY[i], f, 1760 + i)),
  }))
}

// ---------------------------------------------------------------------------
// Price × Volume Decomposition — Revenue bridge
// ---------------------------------------------------------------------------
export interface RevenueBridge {
  name: string
  value: number
  type: 'start' | 'end' | 'positive' | 'negative'
}

export function getRevenueBridge(f: Filters): RevenueBridge[] {
  const pyRev = vary(4820, f, 1800)
  const priceEffect = vary(-180, f, 1801)
  const volumeEffect = vary(240, f, 1802)
  const mixEffect = vary(85, f, 1803)
  const fxEffect = vary(-42, f, 1804)
  const cyRev = Math.round(pyRev + priceEffect + volumeEffect + mixEffect + fxEffect)

  return [
    { name: 'PY Revenue', value: pyRev, type: 'start' },
    { name: 'Price\nEffect', value: priceEffect, type: priceEffect >= 0 ? 'positive' : 'negative' },
    { name: 'Volume\nEffect', value: volumeEffect, type: volumeEffect >= 0 ? 'positive' : 'negative' },
    { name: 'Mix\nEffect', value: mixEffect, type: mixEffect >= 0 ? 'positive' : 'negative' },
    { name: 'FX\nEffect', value: fxEffect, type: fxEffect >= 0 ? 'positive' : 'negative' },
    { name: 'CY Revenue', value: cyRev, type: 'end' },
  ]
}

// ---------------------------------------------------------------------------
// Cross-Reference — Full picture for a single part family
// ---------------------------------------------------------------------------
export interface CrossRefData {
  partFamily: string
  category: string
  // Price
  realizationPct: number
  listPrice: number
  segmentPrice: number
  avgNetPrice: number
  lastMilePct: number
  // Margin
  marginPct: number
  marginPY: number
  cogs: number
  // Volume
  quantityCY: number
  quantityPY: number
  qtyDeltaPct: number
  // Revenue
  revenueCYk: number
  revenuePYk: number
  revDeltaPct: number
  // Trend (mini-series)
  monthlyReal: number[]
  monthlyQty: number[]
  months: string[]
  // Peers
  peerAvgReal: number
  peerBestReal: number
  // Flags
  transactionCount: number
  isLowN: boolean
}

export function getCrossRefParts(f: Filters): CrossRefData[] {
  const parts = [
    { name: 'Coupling Plates', cat: 'Cat 200', lp: 185, sp: 162, np: 124, cogs: 78, real: 68, mgn: 22, mgnPy: 24, qCy: 820, qPy: 680, rCy: 102, rPy: 88, peerAvg: 76, peerBest: 82, txn: 82 },
    { name: 'Sealing Rings', cat: 'Cat 200', lp: 42, sp: 37, np: 28, cogs: 18, real: 70, mgn: 18, mgnPy: 21, qCy: 1450, qPy: 1200, rCy: 41, rPy: 36, peerAvg: 75, peerBest: 81, txn: 65 },
    { name: 'OS Oil Filters', cat: 'Cat 300', lp: 320, sp: 285, np: 221, cogs: 142, real: 72, mgn: 15, mgnPy: 18, qCy: 380, qPy: 350, rCy: 84, rPy: 78, peerAvg: 78, peerBest: 84, txn: 48 },
    { name: 'Thrust Bearings', cat: 'Cat 400', lp: 890, sp: 802, np: 698, cogs: 385, real: 87, mgn: 42, mgnPy: 40, qCy: 145, qPy: 130, rCy: 101, rPy: 88, peerAvg: 85, peerBest: 89, txn: 34 },
    { name: 'VSP Controls', cat: 'Cat 500', lp: 4200, sp: 3950, np: 3760, cogs: 1580, real: 95, mgn: 58, mgnPy: 56, qCy: 42, qPy: 38, rCy: 158, rPy: 138, peerAvg: 92, peerBest: 96, txn: 22 },
    { name: 'Prop. Blades', cat: 'Cat 500', lp: 2800, sp: 2650, np: 2440, cogs: 1120, real: 92, mgn: 52, mgnPy: 50, qCy: 68, qPy: 62, rCy: 166, rPy: 148, peerAvg: 90, peerBest: 94, txn: 28 },
    { name: 'Filter Elements', cat: 'Cat 200', lp: 65, sp: 57, np: 44, cogs: 28, real: 75, mgn: 20, mgnPy: 22, qCy: 1100, qPy: 980, rCy: 48, rPy: 44, peerAvg: 77, peerBest: 83, txn: 71 },
    { name: 'Shaft Seals', cat: 'Cat 300', lp: 145, sp: 128, np: 108, cogs: 62, real: 84, mgn: 36, mgnPy: 35, qCy: 420, qPy: 400, rCy: 45, rPy: 42, peerAvg: 82, peerBest: 86, txn: 42 },
    { name: 'Gear Wheels', cat: 'Cat 300', lp: 580, sp: 520, np: 432, cogs: 252, real: 83, mgn: 33, mgnPy: 32, qCy: 210, qPy: 195, rCy: 91, rPy: 82, peerAvg: 81, peerBest: 85, txn: 29 },
    { name: 'Impeller Units', cat: 'Cat 500', lp: 3400, sp: 3200, np: 2980, cogs: 1340, real: 93, mgn: 55, mgnPy: 53, qCy: 55, qPy: 48, rCy: 164, rPy: 140, peerAvg: 91, peerBest: 95, txn: 18 },
  ]

  const baseMonthlyReal = [82, 81, 80, 81, 82, 81, 80, 81, 82]
  const baseMonthlyQty = [90, 95, 110, 100, 115, 88, 82, 92, 105]

  return parts.map((p, i) => {
    const txn = Math.max(3, Math.round(vary(p.txn, f, 1900 + i)))
    return {
      partFamily: p.name,
      category: p.cat,
      realizationPct: varyPct(p.real, f, 1920 + i),
      listPrice: Math.round(vary(p.lp, f, 1940 + i)),
      segmentPrice: Math.round(vary(p.sp, f, 1960 + i)),
      avgNetPrice: Math.round(vary(p.np, f, 1980 + i)),
      lastMilePct: varyPct(-(100 - p.real) * 0.45, f, 2000 + i),
      marginPct: varyPct(p.mgn, f, 2020 + i),
      marginPY: varyPct(p.mgnPy, f, 2040 + i),
      cogs: Math.round(vary(p.cogs, f, 2060 + i)),
      quantityCY: Math.round(vary(p.qCy, f, 2080 + i)),
      quantityPY: Math.round(vary(p.qPy, f, 2100 + i)),
      qtyDeltaPct: Math.round((vary(p.qCy, f, 2080 + i) - vary(p.qPy, f, 2100 + i)) / vary(p.qPy, f, 2100 + i) * 1000) / 10,
      revenueCYk: Math.round(vary(p.rCy, f, 2120 + i)),
      revenuePYk: Math.round(vary(p.rPy, f, 2140 + i)),
      revDeltaPct: Math.round((vary(p.rCy, f, 2120 + i) - vary(p.rPy, f, 2140 + i)) / vary(p.rPy, f, 2140 + i) * 1000) / 10,
      monthlyReal: ALL_MONTHS.slice(0, 9).map((_, mi) => varyPct(baseMonthlyReal[mi] + (p.real - 81) * 0.3, f, 2200 + i * 12 + mi)),
      monthlyQty: ALL_MONTHS.slice(0, 9).map((_, mi) => Math.round(vary(baseMonthlyQty[mi] * p.qCy / 900, f, 2300 + i * 12 + mi))),
      months: ALL_MONTHS.slice(0, 9),
      peerAvgReal: varyPct(p.peerAvg, f, 2400 + i),
      peerBestReal: varyPct(p.peerBest, f, 2420 + i),
      transactionCount: txn,
      isLowN: txn < LOW_N_THRESHOLD,
    }
  })
}
