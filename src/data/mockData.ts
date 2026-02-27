// ---------------------------------------------------------------------------
// Filter types & options
// ---------------------------------------------------------------------------
export const regions = ['All Regions', 'Europe', 'North America', 'Asia Pacific', 'Latin America']
export const countryClusters = ['All Clusters', 'DACH', 'Nordics', 'Benelux', 'Southern Europe', 'UK & Ireland']
export const customerSegments = ['All Segments', 'Confectionery', 'Bakery & Pastry', 'Dairy & Ice Cream', 'Beverage', 'Industrial']
export const customers = ['All Customers', 'Nestlé', 'Mondelez', 'Ferrero', 'Lindt & Sprüngli', 'Mars']
export const productGroups = ['All Products', 'Cocoa Butter', 'Cocoa Powder', 'Cocoa Liquor', 'Couverture', 'Compounds']
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

/** Returns a factor between 0.65 and 1.35 based on filters */
function factor(f: Filters, offset = 0): number {
  const seed = filterSeed(f)
  const shifted = ((seed * 997 + offset * 131) % 1000) / 1000
  return 0.65 + shifted * 0.7
}

/** Vary a base number by filters with a unique offset */
function vary(base: number, f: Filters, offset = 0): number {
  return Math.round(base * factor(f, offset) * 10) / 10
}

// Time period determines how many months of data to show
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
  const sco = vary(142.8, f, 1)
  const vsLy = vary(12.4, f, 2)
  const vsPl = vary(-3.2, f, 3)
  const vsTgt = vary(5.1, f, 4)
  const volFf = Math.min(99.8, vary(94.2, f, 5))
  const mpi = vary(108.5, f, 6)
  const posVal = vary(2.4, f, 7)
  const revLeak = vary(18.7, f, 8)

  return [
    { id: 'actual-sco', title: 'Actual SCO/MT', value: sco, unit: '€/MT', status: 'neutral', subtitle: 'Current Period' },
    { id: 'vs-ly', title: 'Δ vs Last Year', value: vsLy, unit: '€/MT', change: Math.round(vsLy / sco * 1000) / 10, changeLabel: 'vs LY', status: vsLy >= 0 ? 'positive' : 'negative', subtitle: vsLy >= 0 ? `+${(vsLy / sco * 100).toFixed(1)}% YoY improvement` : `${(vsLy / sco * 100).toFixed(1)}% YoY decline` },
    { id: 'vs-pl', title: 'Δ vs PL', value: vsPl, unit: '€/MT', change: Math.round(vsPl / sco * 1000) / 10, changeLabel: 'vs Plan', status: vsPl >= 0 ? 'positive' : 'negative', subtitle: vsPl >= 0 ? 'Above plan' : `${(vsPl / sco * 100).toFixed(1)}% below plan` },
    { id: 'vs-target', title: 'Δ vs Target', value: vsTgt, unit: '€/MT', change: Math.round(vsTgt / sco * 1000) / 10, changeLabel: 'vs Target', status: vsTgt >= 0 ? 'positive' : 'negative', subtitle: vsTgt >= 0 ? `+${(vsTgt / sco * 100).toFixed(1)}% above target` : 'Below target' },
    { id: 'volume-forecast', title: 'Volume Forecast Fulfillment Rate', value: volFf, unit: '%', change: vary(1.8, f, 9), changeLabel: 'vs LY', status: volFf >= 90 ? 'positive' : 'warning', subtitle: volFf >= 90 ? 'On track' : 'Below target' },
    { id: 'market-price-index', title: 'Cocoa Commodity Price Index', value: mpi, unit: 'Index', change: vary(-3.1, f, 10), changeLabel: 'vs LY', status: mpi > 110 ? 'warning' : 'neutral', subtitle: mpi > 110 ? 'ICCO prices elevated' : 'ICCO daily price softening' },
    { id: 'position-valuation', title: 'Position Valuation Cocoa & Inputs', value: posVal, unit: 'M€', change: vary(-12.3, f, 11), changeLabel: 'vs LY', status: posVal < 2 ? 'negative' : 'neutral', subtitle: posVal < 2 ? 'Below last year' : 'In line with targets' },
    { id: 'revenue-leakage', title: 'Revenue Leakage / Condition Spending', value: revLeak, unit: 'M€', change: vary(4.2, f, 12), changeLabel: 'vs LY', status: revLeak > 15 ? 'negative' : 'warning', subtitle: revLeak > 15 ? 'Increased spending' : 'Under control' },
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
  const lyBase = vary(130.4, f, 20)
  const price = vary(8.6, f, 21)
  const volume = vary(-2.1, f, 22)
  const cost = vary(3.8, f, 23)
  const newBiz = vary(4.5, f, 24)
  const mix = vary(-2.4, f, 25)
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
const baseActual = [1.8, 1.6, 2.1, 1.9, 2.3, 1.7, 1.5, 1.4, 1.6, 1.2, 0.9, 0.7]
const baseLY = [1.5, 1.4, 1.7, 1.6, 1.8, 1.5, 1.3, 1.2, 1.4, 1.1, 0.8, 0.6]

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
    { segment: 'Cocoa Butter', avgPrice: 285.4, priceVsLY: 5.2, margin: 32.1, marginVsLY: 1.8, volume: 12400 },
    { segment: 'Cocoa Powder', avgPrice: 178.2, priceVsLY: 3.1, margin: 22.5, marginVsLY: -0.4, volume: 34500 },
    { segment: 'Cocoa Liquor', avgPrice: 112.6, priceVsLY: -1.2, margin: 14.8, marginVsLY: -2.1, volume: 28700 },
    { segment: 'Chocolate Couverture', avgPrice: 89.3, priceVsLY: 2.8, margin: 8.2, marginVsLY: 0.6, volume: 52100 },
    { segment: 'Specialty Compounds', avgPrice: 342.1, priceVsLY: 7.5, margin: 38.4, marginVsLY: 3.2, volume: 5600 },
  ]

  const productFilter = f.product
  const filtered = productFilter === 'All Products'
    ? base
    : base.filter(r => r.segment.toLowerCase().includes(productFilter.toLowerCase().replace('s', '')))

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

const baseVolActual = [11200, 10800, 12500, 11900, 13200, 12100, 10500, 9800, 11600, 12800, 11400, 10200]
const baseVolFc = [11500, 11000, 12000, 12200, 12800, 12500, 11000, 10200, 11800, 12500, 11800, 10800]
const baseVolLY = [10800, 10200, 11700, 11400, 12100, 11800, 10100, 9500, 11000, 12200, 10900, 9800]

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
    { category: 'Cocoa Beans', actual: 45.2, budget: 42.8 },
    { category: 'Sugar & Sweeteners', actual: 12.8, budget: 11.5 },
    { category: 'Milk Powder', actual: 8.4, budget: 8.9 },
    { category: 'Packaging', actual: 6.2, budget: 6.0 },
    { category: 'Energy & Processing', actual: 15.1, budget: 15.4 },
    { category: 'Logistics', actual: 9.8, budget: 10.2 },
  ]

  return base.map((row, i) => {
    const actual = vary(row.actual, f, 180 + i)
    const budget = vary(row.budget, f, 190 + i)
    const variance = Math.round((actual - budget) * 10) / 10
    const variancePct = Math.round((variance / budget) * 1000) / 10
    return { category: row.category, actual, budget, variance, variancePct }
  })
}
