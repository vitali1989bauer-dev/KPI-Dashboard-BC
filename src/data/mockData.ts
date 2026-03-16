// ---------------------------------------------------------------------------
// Filter types & options — K+S Agriculture / Fertilizer & Salt business
// ---------------------------------------------------------------------------
export const regions = ['All Regions', 'Europe', 'North America', 'South America', 'Asia Pacific']
export const countryClusters = ['All Clusters', 'DACH', 'Nordics', 'Benelux', 'Southern Europe', 'North America']
export const customerSegments = ['All Segments', 'Arable Farming', 'Specialty Crops', 'Horticulture', 'Livestock & Feed', 'Industrial']
export const customers = ['All Customers', 'BayWa', 'AGRAVIS', 'Nutrien', 'Yara', 'EuroChem']
export const pricingArchetypes = ['All Archetypes', 'Value Maximizer', 'Volume Partner', 'Spot Opportunist', 'Contract Loyal', 'Strategic Account']
export const productGroups = ['All Products', 'Korn-Kali\u00AE', 'Patentkali\u00AE', '60er Kali', 'ESTA\u00AE Kieserit', 'Epso Top\u00AE', 'De-icing Salt', 'Industrial Salt', 'Food Grade Salt']
export const timePeriods = ['Month-to-month', 'PL period', 'YTD', 'Full year / Fiscal year']

export interface Filters {
  timePeriod: string
  region: string
  cluster: string
  segment: string
  customer: string
  archetype: string
  product: string
}

export const defaultFilters: Filters = {
  timePeriod: 'YTD',
  region: 'All Regions',
  cluster: 'All Clusters',
  segment: 'All Segments',
  customer: 'All Customers',
  archetype: 'All Archetypes',
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
  const key = `${f.timePeriod}|${f.region}|${f.cluster}|${f.segment}|${f.customer}|${f.archetype}|${f.product}`
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

const ALL_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

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
// SCO/MT 12-month trend for dashboard area chart
// ---------------------------------------------------------------------------
export interface ScoTrendPoint {
  month: string
  actual: number
  plan: number
}

const baseScoTrend = [198, 204, 195, 211, 218, 223, 215, 208, 220, 226, 230, 234]
const basePlanTrend = [205, 208, 210, 212, 215, 217, 219, 221, 223, 225, 227, 230]

export function getScoTrendData(f: Filters): ScoTrendPoint[] {
  return ALL_MONTHS.map((month, i) => ({
    month,
    actual: vary(baseScoTrend[i], f, 500 + i),
    plan: vary(basePlanTrend[i], f, 520 + i),
  }))
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
// Pricing & Conditions — merged view
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
    { segment: 'Korn-Kali\u00AE (40% K\u2082O)', avgPrice: 312.5, priceVsLY: 4.8, margin: 28.3, marginVsLY: 1.5, volume: 245000 },
    { segment: 'Patentkali\u00AE (30% K\u2082O)', avgPrice: 358.2, priceVsLY: 5.2, margin: 32.1, marginVsLY: 2.1, volume: 118000 },
    { segment: '60er Kali (KCl gran.)', avgPrice: 286.4, priceVsLY: 3.1, margin: 24.8, marginVsLY: 0.9, volume: 198000 },
    { segment: 'ESTA\u00AE Kieserit', avgPrice: 186.7, priceVsLY: 2.4, margin: 21.2, marginVsLY: -0.6, volume: 128000 },
    { segment: 'Epso Top\u00AE', avgPrice: 425.8, priceVsLY: 6.1, margin: 35.6, marginVsLY: 2.8, volume: 67000 },
    { segment: 'De-icing Salt', avgPrice: 48.3, priceVsLY: 1.9, margin: 18.4, marginVsLY: 0.3, volume: 890000 },
    { segment: 'Industrial Salt', avgPrice: 62.1, priceVsLY: -0.8, margin: 15.7, marginVsLY: -1.2, volume: 520000 },
    { segment: 'Food Grade Salt', avgPrice: 142.6, priceVsLY: 3.5, margin: 24.9, marginVsLY: 1.1, volume: 95000 },
  ]

  const productFilter = f.product
  const filtered = productFilter === 'All Products'
    ? base
    : base.filter(r => r.segment.toLowerCase().includes(productFilter.toLowerCase().replace(/[®\u00AE]/g, '').slice(0, 6)))

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

export interface ConditionSpendingItem {
  month: string
  actual: number
  lastYear: number
}

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
// Operations — Volume + Cost merged
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
// Customer Portfolio — scatter + margin corridor + target/limits
// ---------------------------------------------------------------------------
export interface ScatterPoint {
  name: string
  segment: string
  archetype: string
  volume: number
  pricePerMT: number
  marginPct: number
  targetMargin: number
  limitMargin: number
  trend: 'up' | 'down' | 'flat'
}

const scatterBase: Omit<ScatterPoint, 'volume' | 'pricePerMT' | 'marginPct' | 'targetMargin' | 'limitMargin'>[] = [
  { name: 'BayWa', segment: 'Arable Farming', archetype: 'Contract Loyal', trend: 'up' },
  { name: 'AGRAVIS', segment: 'Arable Farming', archetype: 'Volume Partner', trend: 'flat' },
  { name: 'Nutrien', segment: 'Specialty Crops', archetype: 'Strategic Account', trend: 'up' },
  { name: 'Yara', segment: 'Specialty Crops', archetype: 'Value Maximizer', trend: 'up' },
  { name: 'EuroChem', segment: 'Industrial', archetype: 'Spot Opportunist', trend: 'down' },
  { name: 'Südzucker AG', segment: 'Specialty Crops', archetype: 'Contract Loyal', trend: 'flat' },
  { name: 'Raiffeisen', segment: 'Arable Farming', archetype: 'Volume Partner', trend: 'up' },
  { name: 'Agrarfrost', segment: 'Horticulture', archetype: 'Value Maximizer', trend: 'down' },
  { name: 'Nordsaat', segment: 'Arable Farming', archetype: 'Contract Loyal', trend: 'flat' },
  { name: 'CropEnergies', segment: 'Specialty Crops', archetype: 'Strategic Account', trend: 'up' },
  { name: 'SKW Piesteritz', segment: 'Industrial', archetype: 'Spot Opportunist', trend: 'flat' },
  { name: 'Helm AG', segment: 'Industrial', archetype: 'Spot Opportunist', trend: 'down' },
  { name: 'Lemken', segment: 'Arable Farming', archetype: 'Value Maximizer', trend: 'up' },
  { name: 'Borealis L.A.T', segment: 'Specialty Crops', archetype: 'Strategic Account', trend: 'flat' },
  { name: 'ICL Group', segment: 'Industrial', archetype: 'Volume Partner', trend: 'up' },
  { name: 'Evonik Industries', segment: 'Industrial', archetype: 'Contract Loyal', trend: 'flat' },
  { name: 'Compo Expert', segment: 'Horticulture', archetype: 'Value Maximizer', trend: 'up' },
  { name: 'Haifa Group', segment: 'Horticulture', archetype: 'Strategic Account', trend: 'up' },
  { name: 'Tessenderlo', segment: 'Specialty Crops', archetype: 'Volume Partner', trend: 'down' },
  { name: 'BASF Agro', segment: 'Arable Farming', archetype: 'Strategic Account', trend: 'up' },
]

const baseVols = [48200, 42800, 61500, 55200, 38700, 22400, 31500, 15800, 18900, 26700, 44100, 35600, 19400, 28300, 52800, 33200, 12600, 17800, 24500, 39800]
const basePricePts = [312, 295, 335, 328, 278, 348, 302, 385, 290, 356, 265, 252, 318, 342, 288, 275, 395, 372, 315, 308]
const baseMargins = [26.4, 24.1, 31.2, 29.8, 21.5, 33.8, 25.2, 36.1, 23.8, 34.5, 19.2, 17.8, 27.6, 32.4, 22.8, 20.1, 38.2, 35.4, 28.9, 26.8]
const baseTargetMargins = [28, 26, 30, 30, 24, 32, 26, 34, 25, 33, 22, 20, 28, 31, 24, 22, 36, 34, 29, 27]
const baseLimitMargins = [20, 18, 22, 22, 16, 24, 18, 26, 17, 25, 14, 12, 20, 23, 16, 14, 28, 26, 21, 19]

export function getScatterData(f: Filters): ScatterPoint[] {
  let data = scatterBase.map((pt, i) => ({
    ...pt,
    volume: Math.round(vary(baseVols[i], f, 400 + i)),
    pricePerMT: vary(basePricePts[i], f, 420 + i),
    marginPct: vary(baseMargins[i], f, 440 + i),
    targetMargin: vary(baseTargetMargins[i], f, 460 + i),
    limitMargin: vary(baseLimitMargins[i], f, 480 + i),
  }))

  if (f.archetype !== 'All Archetypes') {
    data = data.filter(d => d.archetype === f.archetype)
  }

  return data
}

export const scatterCorridors = {
  targetPrice: 310,
  limitPrice: 260,
  targetMargin: 28,
  limitMargin: 18,
}

// ---------------------------------------------------------------------------
// Price Alerts
// ---------------------------------------------------------------------------
export interface PriceAlert {
  id: string
  customer: string
  product: string
  actualPrice: number
  limitPrice: number
  deviation: number
  severity: 'critical' | 'warning'
  timestamp: string
}

export function getPriceAlerts(f: Filters): PriceAlert[] {
  const base: PriceAlert[] = [
    { id: 'a1', customer: 'EuroChem', product: '60er Kali', actualPrice: vary(248, f, 600), limitPrice: 270, deviation: 0, severity: 'critical', timestamp: '2026-03-16 07:42' },
    { id: 'a2', customer: 'Helm AG', product: 'Korn-Kali\u00AE', actualPrice: vary(262, f, 601), limitPrice: 285, deviation: 0, severity: 'critical', timestamp: '2026-03-15 16:20' },
    { id: 'a3', customer: 'SKW Piesteritz', product: 'Industrial Salt', actualPrice: vary(51, f, 602), limitPrice: 55, deviation: 0, severity: 'warning', timestamp: '2026-03-15 11:05' },
    { id: 'a4', customer: 'Tessenderlo', product: 'ESTA\u00AE Kieserit', actualPrice: vary(158, f, 603), limitPrice: 170, deviation: 0, severity: 'warning', timestamp: '2026-03-14 14:30' },
    { id: 'a5', customer: 'Nordsaat', product: 'Patentkali\u00AE', actualPrice: vary(305, f, 604), limitPrice: 320, deviation: 0, severity: 'warning', timestamp: '2026-03-14 09:15' },
  ]
  return base.map(a => ({
    ...a,
    deviation: Math.round((a.actualPrice - a.limitPrice) / a.limitPrice * 1000) / 10,
  }))
}

// ---------------------------------------------------------------------------
// Market Intelligence — benchmarks, FX, input costs
// ---------------------------------------------------------------------------
export interface BenchmarkPoint {
  month: string
  mopVancouver: number
  mopBaltic: number
  mopBrazil: number
  ksRealized: number
}

export function getBenchmarkData(f: Filters): BenchmarkPoint[] {
  const baseMopVan = [285, 292, 288, 305, 318, 325, 312, 308, 322, 330, 335, 340]
  const baseMopBalt = [275, 280, 278, 292, 308, 315, 302, 298, 312, 320, 325, 330]
  const baseMopBrz = [310, 318, 312, 328, 342, 350, 335, 330, 345, 355, 360, 365]
  const baseKsReal = [312, 320, 315, 335, 348, 355, 340, 332, 350, 358, 362, 368]

  return ALL_MONTHS.map((month, i) => ({
    month,
    mopVancouver: vary(baseMopVan[i], f, 700 + i),
    mopBaltic: vary(baseMopBalt[i], f, 720 + i),
    mopBrazil: vary(baseMopBrz[i], f, 740 + i),
    ksRealized: vary(baseKsReal[i], f, 760 + i),
  }))
}

export interface InputCostPoint {
  month: string
  naturalGas: number  // EUR/MWh
  electricity: number // EUR/MWh
  freight: number     // index
}

export function getInputCostData(f: Filters): InputCostPoint[] {
  const baseGas = [28.5, 31.2, 29.8, 26.4, 24.1, 22.8, 21.5, 23.2, 25.8, 28.4, 32.1, 35.6]
  const baseElec = [62, 68, 65, 58, 54, 52, 50, 53, 57, 63, 70, 75]
  const baseFreight = [104, 108, 106, 112, 118, 115, 110, 108, 114, 120, 124, 128]

  return ALL_MONTHS.map((month, i) => ({
    month,
    naturalGas: vary(baseGas[i], f, 800 + i),
    electricity: vary(baseElec[i], f, 820 + i),
    freight: vary(baseFreight[i], f, 840 + i),
  }))
}

export interface FxPoint {
  month: string
  eurUsd: number
  eurBrl: number
}

export function getFxData(f: Filters): FxPoint[] {
  const baseEurUsd = [1.08, 1.09, 1.07, 1.10, 1.12, 1.11, 1.09, 1.08, 1.10, 1.11, 1.12, 1.13]
  const baseEurBrl = [5.32, 5.41, 5.28, 5.45, 5.52, 5.48, 5.38, 5.35, 5.42, 5.50, 5.55, 5.60]

  return ALL_MONTHS.map((month, i) => ({
    month,
    eurUsd: vary(baseEurUsd[i], f, 900 + i),
    eurBrl: vary(baseEurBrl[i], f, 920 + i),
  }))
}

export interface MarketSignal {
  title: string
  description: string
  impact: 'positive' | 'negative' | 'neutral'
}

export function getMarketSignals(f: Filters): MarketSignal[] {
  const premium = vary(4.2, f, 950)
  const gasChange = vary(-8.3, f, 951)
  const fxImpact = vary(1.4, f, 952)

  return [
    {
      title: `K+S Premium at ${premium.toFixed(1)}% above MOP Vancouver`,
      description: premium > 5
        ? 'Premium is healthy — K+S quality & logistics advantages are well priced-in. Maintain current list prices.'
        : 'Premium narrowing vs. Q1 (+8.1%). Review list prices for Korn-Kali\u00AE and 60er Kali in DACH region.',
      impact: premium > 5 ? 'positive' : 'negative',
    },
    {
      title: `Natural gas TTF ${gasChange >= 0 ? '+' : ''}${gasChange.toFixed(1)}% vs. prior quarter`,
      description: gasChange < 0
        ? 'Falling gas prices improve potash production margins. Consider passing savings selectively to Volume Partners to secure contract renewals.'
        : 'Rising energy costs put pressure on margins. Evaluate price surcharge activation for Industrial Salt segment.',
      impact: gasChange < 0 ? 'positive' : 'negative',
    },
    {
      title: `EUR/USD impact: ${fxImpact >= 0 ? '+' : ''}${fxImpact.toFixed(1)} M€ revenue effect`,
      description: fxImpact >= 0
        ? 'Weaker EUR supports USD-denominated export revenues. South America and Asia Pacific margins benefit.'
        : 'Stronger EUR reduces export competitiveness. Monitor pricing in BRL-denominated Brazil contracts.',
      impact: fxImpact >= 0 ? 'positive' : 'negative',
    },
    {
      title: 'Competitor signal: Belaruskali capacity constraints continue',
      description: 'Sanctions-related supply disruptions keep global MOP supply tight. Supports K+S pricing power in European markets through H2. Strategic Accounts may accept +3-5% on renewals.',
      impact: 'positive',
    },
  ]
}
