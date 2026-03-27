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

export type UserRole = 'mc' | 'hq'

export interface Filters {
  timePeriod: string
  region: string
  division: string
  segment: string
  subSegment: string
  materialCategory: string
  comparisonPeriod: string
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
// Overview — KPI Cards
// ---------------------------------------------------------------------------
export interface OverviewKpi {
  id: string
  label: string
  value: string
  subtitle: string
  status: 'positive' | 'negative' | 'neutral'
  accentColor: 'red' | 'blue' | 'green' | 'amber' | 'grey'
}

export function getOverviewKpis(f: Filters): OverviewKpi[] {
  const real = varyPct(81.4, f, 1)
  const realPy = varyPct(83.7, f, 2)
  const listCov = varyPct(74.2, f, 3)
  const listCovPy = varyPct(75.3, f, 4)
  const gm = varyPct(38.7, f, 5)
  const gmPy = varyPct(38.3, f, 6)
  const lastMile = varyPct(-8.8, f, 7)
  const lastMilePy = varyPct(-7.6, f, 8)
  const txn = Math.round(vary(1847, f, 9))

  const realDelta = Math.round((real - realPy) * 10) / 10
  const listDelta = Math.round((listCov - listCovPy) * 10) / 10
  const gmDelta = Math.round((gm - gmPy) * 10) / 10
  const lmDelta = Math.round((lastMile - lastMilePy) * 10) / 10

  return [
    {
      id: 'realization',
      label: 'Realization Rate',
      value: `${real.toFixed(1)}%`,
      subtitle: `${realDelta >= 0 ? '▲' : '▼'} ${Math.abs(realDelta).toFixed(1)}pp  vs. PY ${realPy.toFixed(1)}%`,
      status: realDelta >= 0 ? 'positive' : 'negative',
      accentColor: realDelta >= 0 ? 'green' : 'red',
    },
    {
      id: 'list-coverage',
      label: 'List Price Coverage',
      value: `${listCov.toFixed(1)}%`,
      subtitle: `${listDelta >= 0 ? '▲' : '▼'} ${Math.abs(listDelta).toFixed(1)}pp  vs. PY ${listCovPy.toFixed(1)}%`,
      status: listDelta >= 0 ? 'positive' : 'negative',
      accentColor: 'blue',
    },
    {
      id: 'gross-margin',
      label: 'Gross Margin',
      value: `${gm.toFixed(1)}%`,
      subtitle: `${gmDelta >= 0 ? '▲' : '▼'} ${Math.abs(gmDelta).toFixed(1)}pp  vs. PY ${gmPy.toFixed(1)}%`,
      status: gmDelta >= 0 ? 'positive' : 'negative',
      accentColor: gmDelta >= 0 ? 'green' : 'amber',
    },
    {
      id: 'last-mile',
      label: 'Avg. Last-Mile Discount',
      value: `${lastMile.toFixed(1)}%`,
      subtitle: `${lmDelta <= 0 ? '▲' : '▼'} ${Math.abs(lmDelta).toFixed(1)}pp  vs. PY`,
      status: lmDelta <= 0 ? 'positive' : 'negative',
      accentColor: lmDelta <= 0 ? 'green' : 'red',
    },
    {
      id: 'transactions',
      label: 'Transactions YTD',
      value: txn.toLocaleString(),
      subtitle: `▲ +12%  vs. PY`,
      status: 'positive',
      accentColor: 'green',
    },
  ]
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
  const real200 = varyPct(77, f, 300)
  return [
    {
      severity: 'warning',
      title: `Cat. 200 price erosion accelerating — ${f.subSegment !== 'All Sub-Segments' ? f.subSegment : 'Ferry'} segment`,
      description: `Coupling Plates & Sealing Rings at ${real200.toFixed(0)}–78% realization. Last-mile discounts averaging -13.2% in Ferries. Suggest reviewing discount authority threshold for this sub-segment.`,
    },
    {
      severity: 'info',
      title: `OS Oil & Gas Cat. 300 below benchmark`,
      description: `Filters at 77% despite no apparent competitive pressure vs. North Sea peers (NO avg. 84%). Likely individual account concessions. Check customer-level pricing for OS Oil accounts.`,
    },
    {
      severity: 'positive',
      title: `Cat. 500 proprietary parts — strong and stable`,
      description: `88–95% across all sub-segments. Pricing discipline template. Consider removing discretionary discount authority entirely for Cat. 500 to protect the position.`,
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
      riskDescription: `~15pp realization vs. UK. Cat 200 parts ~£40 cheaper/unit. Risk of arbitrage to UK customers. Escalate to HQ pricing governance for minimum price harmonization.`,
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
