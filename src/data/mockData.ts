// ---------------------------------------------------------------------------
// Filter types & options — K+S Agriculture / Fertilizer & Salt business
// ---------------------------------------------------------------------------
export const regions = ['All Regions', 'Europe', 'North America', 'South America', 'Asia Pacific']
export const countryClusters = ['All Clusters', 'DACH', 'Nordics', 'Benelux', 'Southern Europe', 'North America']
export const customerSegments = ['All Segments', 'Arable Farming', 'Specialty Crops', 'Horticulture', 'Livestock & Feed', 'Industrial']
export const customers = ['All Customers', 'BayWa', 'AGRAVIS', 'Nutrien', 'Yara', 'EuroChem']
export const productGroups = ['All Products', 'Potash (MOP)', 'Kieserite', 'Fertilizer Specialties', 'De-icing Salt', 'Industrial Salt']
export const timePeriods = ['Month-to-month', 'PL period', 'YTD', 'Full year / Fiscal year']

export interface Filters {
  timePeriod: string
  region: string
  cluster: string
  segment: string
  customer: string
  product: string
}

export const defaultFilters: Filters = {
  timePeriod: 'YTD',
  region: 'All Regions',
  cluster: 'All Clusters',
  segment: 'All Segments',
  customer: 'All Customers',
  product: 'All Products',
}

// ---------------------------------------------------------------------------
// Deterministic variation helper – turns filter combo into a stable multiplier
// ---------------------------------------------------------------------------
function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0
  }
  return h
}

function filterSeed(f: Filters): number {
  const key = `${f.timePeriod}|${f.region}|${f.cluster}|${f.segment}|${f.customer}|${f.product}`
  const h = Math.abs(hash(key))
  return (h % 1000) / 1000
}

function factor(f: Filters, offset = 0): number {
  const seed = filterSeed(f)
  const shifted = ((seed * 997 + offset * 131) % 1000) / 1000
  return 0.65 + shifted * 0.7
}

function vary(base: number, f: Filters, offset = 0): number {
  return Math.round(base * factor(f, offset) * 10) / 10
}

function monthsForPeriod(period: string): number {
  switch (period) {
    case 'Month-to-month': return 1
    case 'PL period': return 4
    case 'YTD': return 9
    case 'Full year / Fiscal year': return 12
    default: return 9
  }
}

// ---------------------------------------------------------------------------
// KPI Cards
// ---------------------------------------------------------------------------
export interface KpiCard {
  id: string
  title: string
  value: number | string
  unit: string
  change?: number
  changeLabel?: string
  status: 'positive' | 'negative' | 'neutral' | 'warning'
  subtitle?: string
}

export function getTopKpis(f: Filters): KpiCard[] {
  const sco = vary(218.5, f, 1)
  const vsLy = vary(14.7, f, 2)
  const vsPl = vary(-4.8, f, 3)
  const vsTgt = vary(6.3, f, 4)
  const volFf = Math.min(99.8, vary(92.6, f, 5))
  const mpi = vary(112.4, f, 6)
  const posVal = vary(5.8, f, 7)
  const revLeak = vary(24.3, f, 8)

  return [
    { id: 'actual-sco', title: 'Actual SCO/MT', value: sco, unit: '€/MT', status: 'neutral', subtitle: 'Current Period' },
    { id: 'vs-ly', title: 'Δ vs Last Year', value: vsLy, unit: '€/MT', change: Math.round(vsLy / sco * 1000) / 10, changeLabel: 'vs LY', status: vsLy >= 0 ? 'positive' : 'negative', subtitle: vsLy >= 0 ? `+${(vsLy / sco * 100).toFixed(1)}% YoY improvement` : `${(vsLy / sco * 100).toFixed(1)}% YoY decline` },
    { id: 'vs-pl', title: 'Δ vs PL', value: vsPl, unit: '€/MT', change: Math.round(vsPl / sco * 1000) / 10, changeLabel: 'vs Plan', status: vsPl >= 0 ? 'positive' : 'negative', subtitle: vsPl >= 0 ? 'Above plan' : `${(vsPl / sco * 100).toFixed(1)}% below plan` },
    { id: 'vs-target', title: 'Δ vs Target', value: vsTgt, unit: '€/MT', change: Math.round(vsTgt / sco * 1000) / 10, changeLabel: 'vs Target', status: vsTgt >= 0 ? 'positive' : 'negative', subtitle: vsTgt >= 0 ? `+${(vsTgt / sco * 100).toFixed(1)}% above target` : 'Below target' },
    { id: 'volume-forecast', title: 'Volume Forecast Fulfillment Rate', value: volFf, unit: '%', change: vary(1.8, f, 9), changeLabel: 'vs LY', status: volFf >= 90 ? 'positive' : 'warning', subtitle: volFf >= 90 ? 'On track' : 'Below target' },
    { id: 'market-price-index', title: 'Potash Market Price Index', value: mpi, unit: 'Index', change: vary(-2.6, f, 10), changeLabel: 'vs LY', status: mpi > 110 ? 'warning' : 'neutral', subtitle: mpi > 110 ? 'Potash spot prices elevated' : 'Potash prices stabilizing' },
    { id: 'position-valuation', title: 'Position Valuation Potash & Inputs', value: posVal, unit: 'M€', change: vary(-8.7, f, 11), changeLabel: 'vs LY', status: posVal < 4 ? 'negative' : 'neutral', subtitle: posVal < 4 ? 'Below last year' : 'In line with targets' },
    { id: 'revenue-leakage', title: 'Revenue Leakage / Condition Spending', value: revLeak, unit: 'M€', change: vary(3.8, f, 12), changeLabel: 'vs LY', status: revLeak > 20 ? 'negative' : 'warning', subtitle: revLeak > 20 ? 'Increased spending' : 'Under control' },
  ]
}

// ---------------------------------------------------------------------------
// SCO Waterfall
// ---------------------------------------------------------------------------
export interface WaterfallItem {
  name: string
  value: number
  type: 'start' | 'end' | 'positive' | 'negative'
}

export function getScoWaterfallData(f: Filters): WaterfallItem[] {
  const lyBase = vary(203.8, f, 20)
  const price = vary(11.2, f, 21)
  const volume = vary(-3.4, f, 22)
  const cost = vary(5.6, f, 23)
  const newBiz = vary(3.9, f, 24)
  const mix = vary(-2.6, f, 25)
  const current = Math.round((lyBase + price + volume + cost + newBiz + mix) * 10) / 10

  return [
    { name: 'Actual SCO/MT\nLast Year', value: lyBase, type: 'start' },
    { name: 'Price\nEffect', value: price, type: price >= 0 ? 'positive' : 'negative' },
    { name: 'Volume\nEffect', value: volume, type: volume >= 0 ? 'positive' : 'negative' },
    { name: 'Cost\nEffect', value: cost, type: cost >= 0 ? 'positive' : 'negative' },
    { name: 'New Business\nEffect', value: newBiz, type: newBiz >= 0 ? 'positive' : 'negative' },
    { name: 'Portfolio Mix\nEffect', value: mix, type: mix >= 0 ? 'positive' : 'negative' },
    { name: 'Actual SCO/MT\nCurrent', value: current, type: 'end' },
  ]
}

// ---------------------------------------------------------------------------
// Condition Spending
// ---------------------------------------------------------------------------
export interface ConditionSpendingItem {
  month: string
  actual: number
  lastYear: number
}

const ALL_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const baseActual = [2.4, 2.1, 2.8, 3.2, 3.6, 2.5, 1.8, 1.6, 2.2, 2.7, 1.9, 1.4]
const baseLY = [2.0, 1.8, 2.3, 2.7, 3.1, 2.2, 1.6, 1.4, 1.9, 2.3, 1.7, 1.2]

export function getConditionSpendingData(f: Filters): ConditionSpendingItem[] {
  const months = monthsForPeriod(f.timePeriod)
  return ALL_MONTHS.slice(0, months).map((month, i) => ({
    month,
    actual: vary(baseActual[i], f, 30 + i),
    lastYear: vary(baseLY[i], f, 50 + i),
  }))
}

// ---------------------------------------------------------------------------
// Pricing Deep-Dive
// ---------------------------------------------------------------------------
export interface PricingData {
  segment: string
  avgPrice: number
  priceVsLY: number
  margin: number
  marginVsLY: number
  volume: number
}

export function getPricingDeepDiveData(f: Filters): PricingData[] {
  const base = [
    { segment: 'Potash (MOP/KCl)', avgPrice: 312.5, priceVsLY: 4.8, margin: 28.3, marginVsLY: 1.5, volume: 245000 },
    { segment: 'Kieserite (MgSO₄)', avgPrice: 186.7, priceVsLY: 2.4, margin: 21.2, marginVsLY: -0.6, volume: 128000 },
    { segment: 'Fertilizer Specialties', avgPrice: 425.8, priceVsLY: 6.1, margin: 35.6, marginVsLY: 2.8, volume: 67000 },
    { segment: 'De-icing Salt', avgPrice: 48.3, priceVsLY: 1.9, margin: 18.4, marginVsLY: 0.3, volume: 890000 },
    { segment: 'Industrial Salt', avgPrice: 62.1, priceVsLY: -0.8, margin: 15.7, marginVsLY: -1.2, volume: 520000 },
    { segment: 'Food Grade Salt', avgPrice: 142.6, priceVsLY: 3.5, margin: 24.9, marginVsLY: 1.1, volume: 95000 },
  ]

  const productFilter = f.product
  const filtered = productFilter === 'All Products'
    ? base
    : base.filter(r => r.segment.toLowerCase().includes(productFilter.toLowerCase().replace('s', '').replace(' (mop)', '')))

  const rows = (filtered.length > 0 ? filtered : base)

  return rows.map((row, i) => ({
    segment: row.segment,
    avgPrice: vary(row.avgPrice, f, 70 + i),
    priceVsLY: vary(row.priceVsLY, f, 80 + i),
    margin: vary(row.margin, f, 90 + i),
    marginVsLY: vary(row.marginVsLY, f, 100 + i),
    volume: Math.round(vary(row.volume, f, 110 + i)),
  }))
}

// ---------------------------------------------------------------------------
// Volume Deep-Dive
// ---------------------------------------------------------------------------
export interface VolumeData {
  month: string
  actual: number
  forecast: number
  lastYear: number
}

const baseVolActual = [156000, 142000, 178000, 195000, 210000, 168000, 134000, 121000, 158000, 183000, 165000, 138000]
const baseVolFc = [160000, 148000, 172000, 190000, 205000, 175000, 140000, 128000, 162000, 178000, 170000, 145000]
const baseVolLY = [148000, 135000, 165000, 182000, 198000, 160000, 128000, 115000, 150000, 172000, 156000, 130000]

export function getVolumeDeepDiveData(f: Filters): VolumeData[] {
  const months = monthsForPeriod(f.timePeriod)
  return ALL_MONTHS.slice(0, months).map((month, i) => ({
    month,
    actual: Math.round(vary(baseVolActual[i], f, 120 + i)),
    forecast: Math.round(vary(baseVolFc[i], f, 140 + i)),
    lastYear: Math.round(vary(baseVolLY[i], f, 160 + i)),
  }))
}

// ---------------------------------------------------------------------------
// Cost Deep-Dive
// ---------------------------------------------------------------------------
export interface CostItem {
  category: string
  actual: number
  budget: number
  variance: number
  variancePct: number
}

export function getCostDeepDiveData(f: Filters): CostItem[] {
  const base = [
    { category: 'Potash Ore Extraction', actual: 52.4, budget: 49.8 },
    { category: 'Energy & Utilities', actual: 38.6, budget: 36.2 },
    { category: 'Salt Mining & Brine', actual: 22.1, budget: 23.4 },
    { category: 'Processing & Granulation', actual: 18.7, budget: 18.0 },
    { category: 'Packaging & Handling', actual: 8.4, budget: 8.1 },
    { category: 'Logistics & Distribution', actual: 14.3, budget: 15.0 },
  ]

  return base.map((row, i) => {
    const actual = vary(row.actual, f, 180 + i)
    const budget = vary(row.budget, f, 190 + i)
    const variance = Math.round((actual - budget) * 10) / 10
    const variancePct = Math.round((variance / budget) * 1000) / 10
    return { category: row.category, actual, budget, variance, variancePct }
  })
}

// ---------------------------------------------------------------------------
// Target & Limit Prices — by customer group and product
// ---------------------------------------------------------------------------
export interface TargetPriceRow {
  customerGroup: string
  product: string
  targetPrice: number
  limitPrice: number
  actualPrice: number
  volumeMT: number
}

const customerGroups = ['BayWa', 'AGRAVIS', 'Nutrien', 'Yara', 'EuroChem']
const productLines = ['Potash (MOP)', 'Kieserite', 'Fert. Specialties', 'De-icing Salt', 'Industrial Salt']

const basePrices: Record<string, { target: number; limit: number; actual: number; vol: number }> = {
  'Potash (MOP)': { target: 320, limit: 285, actual: 312, vol: 48000 },
  'Kieserite': { target: 195, limit: 170, actual: 187, vol: 25000 },
  'Fert. Specialties': { target: 440, limit: 395, actual: 426, vol: 13000 },
  'De-icing Salt': { target: 52, limit: 42, actual: 48, vol: 178000 },
  'Industrial Salt': { target: 68, limit: 55, actual: 62, vol: 104000 },
}

// Customer-specific multipliers (each customer has slightly different pricing)
const custMul: Record<string, number> = {
  'BayWa': 1.0,
  'AGRAVIS': 0.97,
  'Nutrien': 1.04,
  'Yara': 1.02,
  'EuroChem': 0.95,
}

export function getTargetPriceData(f: Filters): TargetPriceRow[] {
  const rows: TargetPriceRow[] = []

  const custFilter = f.customer
  const prodFilter = f.product
  const custs = custFilter === 'All Customers' ? customerGroups : customerGroups.filter(c => c === custFilter)
  const prods = prodFilter === 'All Products'
    ? productLines
    : productLines.filter(p => p.toLowerCase().includes(prodFilter.toLowerCase().slice(0, 6)))

  const activeCusts = custs.length > 0 ? custs : customerGroups
  const activeProds = prods.length > 0 ? prods : productLines

  for (const cust of activeCusts) {
    for (const prod of activeProds) {
      const bp = basePrices[prod] ?? basePrices['Potash (MOP)']
      const cm = custMul[cust] ?? 1.0
      const i = activeCusts.indexOf(cust) * 10 + activeProds.indexOf(prod)

      rows.push({
        customerGroup: cust,
        product: prod,
        targetPrice: vary(bp.target * cm, f, 200 + i),
        limitPrice: vary(bp.limit * cm, f, 250 + i),
        actualPrice: vary(bp.actual * cm, f, 300 + i),
        volumeMT: Math.round(vary(bp.vol / activeCusts.length, f, 350 + i)),
      })
    }
  }

  return rows
}

// Summary for Target & Limit page
export interface TargetPriceSummary {
  totalRows: number
  aboveTarget: number
  inCorridor: number
  belowLimit: number
  avgRealization: number
  totalVolume: number
  revenueAtRisk: number
}

export function getTargetPriceSummary(rows: TargetPriceRow[]): TargetPriceSummary {
  let aboveTarget = 0
  let inCorridor = 0
  let belowLimit = 0
  let totalVol = 0
  let revenueAtRisk = 0

  for (const r of rows) {
    totalVol += r.volumeMT
    if (r.actualPrice >= r.targetPrice) aboveTarget++
    else if (r.actualPrice >= r.limitPrice) inCorridor++
    else {
      belowLimit++
      revenueAtRisk += (r.limitPrice - r.actualPrice) * r.volumeMT / 1_000_000
    }
  }

  const avgRealization = rows.length > 0
    ? rows.reduce((s, r) => s + (r.actualPrice / r.targetPrice) * 100, 0) / rows.length
    : 0

  return {
    totalRows: rows.length,
    aboveTarget,
    inCorridor,
    belowLimit,
    avgRealization: Math.round(avgRealization * 10) / 10,
    totalVolume: totalVol,
    revenueAtRisk: Math.round(revenueAtRisk * 10) / 10,
  }
}

// ---------------------------------------------------------------------------
// Scatter Plot — Customer positioning: volume vs. price point
// ---------------------------------------------------------------------------
export interface ScatterPoint {
  name: string
  segment: string
  volume: number       // MT
  pricePerMT: number   // €/MT
  marginPct: number    // %
  trend: 'up' | 'down' | 'flat'
}

const scatterBase: Omit<ScatterPoint, 'volume' | 'pricePerMT' | 'marginPct'>[] = [
  { name: 'BayWa', segment: 'Arable Farming', trend: 'up' },
  { name: 'AGRAVIS', segment: 'Arable Farming', trend: 'flat' },
  { name: 'Nutrien', segment: 'Specialty Crops', trend: 'up' },
  { name: 'Yara', segment: 'Specialty Crops', trend: 'up' },
  { name: 'EuroChem', segment: 'Industrial', trend: 'down' },
  { name: 'Südzucker AG', segment: 'Specialty Crops', trend: 'flat' },
  { name: 'Raiffeisen', segment: 'Arable Farming', trend: 'up' },
  { name: 'Agrarfrost', segment: 'Horticulture', trend: 'down' },
  { name: 'Nordsaat', segment: 'Arable Farming', trend: 'flat' },
  { name: 'CropEnergies', segment: 'Specialty Crops', trend: 'up' },
  { name: 'SKW Piesteritz', segment: 'Industrial', trend: 'flat' },
  { name: 'Helm AG', segment: 'Industrial', trend: 'down' },
  { name: 'Lemken', segment: 'Arable Farming', trend: 'up' },
  { name: 'Borealis L.A.T', segment: 'Specialty Crops', trend: 'flat' },
  { name: 'ICL Group', segment: 'Industrial', trend: 'up' },
  { name: 'Evonik Industries', segment: 'Industrial', trend: 'flat' },
  { name: 'Compo Expert', segment: 'Horticulture', trend: 'up' },
  { name: 'Haifa Group', segment: 'Horticulture', trend: 'up' },
  { name: 'Tessenderlo', segment: 'Specialty Crops', trend: 'down' },
  { name: 'BASF Agro', segment: 'Arable Farming', trend: 'up' },
]

const baseVols = [48200, 42800, 61500, 55200, 38700, 22400, 31500, 15800, 18900, 26700, 44100, 35600, 19400, 28300, 52800, 33200, 12600, 17800, 24500, 39800]
const basePricePts = [312, 295, 335, 328, 278, 348, 302, 385, 290, 356, 265, 252, 318, 342, 288, 275, 395, 372, 315, 308]
const baseMargins = [26.4, 24.1, 31.2, 29.8, 21.5, 33.8, 25.2, 36.1, 23.8, 34.5, 19.2, 17.8, 27.6, 32.4, 22.8, 20.1, 38.2, 35.4, 28.9, 26.8]

export function getScatterData(f: Filters): ScatterPoint[] {
  return scatterBase.map((pt, i) => ({
    ...pt,
    volume: Math.round(vary(baseVols[i], f, 400 + i)),
    pricePerMT: vary(basePricePts[i], f, 420 + i),
    marginPct: vary(baseMargins[i], f, 440 + i),
  }))
}

export const scatterCorridors = {
  targetPrice: 310,
  limitPrice: 260,
}
