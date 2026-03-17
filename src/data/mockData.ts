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
  const listPrice = vary(8.4, f, 21)
  const conditions = vary(-3.2, f, 22)
  const volume = vary(-2.1, f, 23)
  const energy = vary(-4.8, f, 24)
  const rawMat = vary(2.3, f, 25)
  const logistics = vary(-1.5, f, 26)
  const fx = vary(1.8, f, 27)
  const productMix = vary(-1.6, f, 28)
  const newBiz = vary(3.2, f, 29)
  const current = Math.round((lyBase + listPrice + conditions + volume + energy + rawMat + logistics + fx + productMix + newBiz) * 10) / 10

  return [
    { name: 'Actual SCO/MT\nLast Year', value: lyBase, type: 'start' },
    { name: 'List Price\nEffect', value: listPrice, type: listPrice >= 0 ? 'positive' : 'negative' },
    { name: 'Condition\nEffect', value: conditions, type: conditions >= 0 ? 'positive' : 'negative' },
    { name: 'Volume /\nCapacity', value: volume, type: volume >= 0 ? 'positive' : 'negative' },
    { name: 'Energy\nCosts', value: energy, type: energy >= 0 ? 'positive' : 'negative' },
    { name: 'Raw Material\n& Mining', value: rawMat, type: rawMat >= 0 ? 'positive' : 'negative' },
    { name: 'Logistics &\nFreight', value: logistics, type: logistics >= 0 ? 'positive' : 'negative' },
    { name: 'FX\nEffect', value: fx, type: fx >= 0 ? 'positive' : 'negative' },
    { name: 'Product Mix\nEffect', value: productMix, type: productMix >= 0 ? 'positive' : 'negative' },
    { name: 'New Business\nEffect', value: newBiz, type: newBiz >= 0 ? 'positive' : 'negative' },
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

// ---------------------------------------------------------------------------
// Net Revenue Waterfall (Gross-to-Net) for Pricing Deep Dive
// ---------------------------------------------------------------------------
export interface NetRevenueStep {
  name: string
  value: number
  type: 'start' | 'end' | 'positive' | 'negative'
}

export function getNetRevenueWaterfall(f: Filters): NetRevenueStep[] {
  const grossRev = vary(485.2, f, 1000)
  const tradeDisc = vary(-28.4, f, 1001)
  const logAllow = vary(-14.7, f, 1002)
  const rebates = vary(-18.2, f, 1003)
  const promo = vary(-8.6, f, 1004)
  const earlyPay = vary(-3.8, f, 1005)
  const netRev = Math.round((grossRev + tradeDisc + logAllow + rebates + promo + earlyPay) * 10) / 10

  return [
    { name: 'Gross Revenue', value: grossRev, type: 'start' },
    { name: 'Trade Discounts', value: tradeDisc, type: 'negative' },
    { name: 'Logistics\nAllowances', value: logAllow, type: 'negative' },
    { name: 'Volume\nRebates', value: rebates, type: 'negative' },
    { name: 'Promotional\nConditions', value: promo, type: 'negative' },
    { name: 'Early Payment\nDiscounts', value: earlyPay, type: 'negative' },
    { name: 'Net Revenue', value: netRev, type: 'end' },
  ]
}

// ---------------------------------------------------------------------------
// Condition Spending by Type (for PricingConditions breakdown)
// ---------------------------------------------------------------------------
export interface ConditionTypeItem {
  type: string
  actual: number
  budget: number
  variance: number
  variancePct: number
  shareOfRevenue: number
}

export function getConditionBreakdown(f: Filters): ConditionTypeItem[] {
  const base = [
    { type: 'Trade Discounts', actual: 28.4, budget: 26.0, shareOfRevenue: 5.8 },
    { type: 'Volume Rebates', actual: 18.2, budget: 19.5, shareOfRevenue: 3.7 },
    { type: 'Logistics Allowances', actual: 14.7, budget: 13.8, shareOfRevenue: 3.0 },
    { type: 'Promotional Conditions', actual: 8.6, budget: 7.2, shareOfRevenue: 1.8 },
    { type: 'Early Payment Discounts', actual: 3.8, budget: 3.5, shareOfRevenue: 0.8 },
    { type: 'Special Agreements', actual: 5.1, budget: 4.8, shareOfRevenue: 1.0 },
  ]

  return base.map((row, i) => {
    const actual = vary(row.actual, f, 1100 + i)
    const budget = vary(row.budget, f, 1110 + i)
    const variance = Math.round((actual - budget) * 10) / 10
    const variancePct = Math.round((variance / budget) * 1000) / 10
    return { type: row.type, actual, budget, variance, variancePct, shareOfRevenue: vary(row.shareOfRevenue, f, 1120 + i) }
  })
}

// ---------------------------------------------------------------------------
// Production Site Performance (for Operations)
// ---------------------------------------------------------------------------
export interface ProductionSite {
  site: string
  location: string
  product: string
  capacityMT: number
  utilizationPct: number
  outputMT: number
  costPerMT: number
  costVsBudget: number
  status: 'on-track' | 'attention' | 'critical'
}

export function getProductionSites(f: Filters): ProductionSite[] {
  const base: ProductionSite[] = [
    { site: 'Werra Plant', location: 'Heringen, Hesse', product: 'Korn-Kali\u00AE / 60er Kali', capacityMT: 2200000, utilizationPct: 91.2, outputMT: 2006400, costPerMT: 82.4, costVsBudget: 3.2, status: 'on-track' },
    { site: 'Zielitz Mine', location: 'Saxony-Anhalt', product: 'KCl / Korn-Kali\u00AE', capacityMT: 2000000, utilizationPct: 88.5, outputMT: 1770000, costPerMT: 78.6, costVsBudget: -1.4, status: 'on-track' },
    { site: 'Bernburg Plant', location: 'Saxony-Anhalt', product: 'Industrial & Food Salt', capacityMT: 1800000, utilizationPct: 94.1, outputMT: 1693800, costPerMT: 24.8, costVsBudget: 5.1, status: 'attention' },
    { site: 'Bethune Mine', location: 'Saskatchewan, CA', product: 'KCl / Potash', capacityMT: 2000000, utilizationPct: 72.3, outputMT: 1446000, costPerMT: 95.2, costVsBudget: 8.7, status: 'critical' },
    { site: 'Sigmundshall', location: 'Lower Saxony', product: 'Patentkali\u00AE / Kieserit', capacityMT: 800000, utilizationPct: 85.8, outputMT: 686400, costPerMT: 105.3, costVsBudget: 2.1, status: 'on-track' },
  ]

  return base.map((site, i) => ({
    ...site,
    utilizationPct: vary(site.utilizationPct, f, 1200 + i),
    outputMT: Math.round(vary(site.outputMT, f, 1210 + i)),
    costPerMT: vary(site.costPerMT, f, 1220 + i),
    costVsBudget: vary(site.costVsBudget, f, 1230 + i),
  }))
}

// ---------------------------------------------------------------------------
// Product SCO Contribution (for Dashboard)
// ---------------------------------------------------------------------------
export interface ProductScoContribution {
  product: string
  scoPerMT: number
  volumeMT: number
  totalScoM: number
  shareOfTotal: number
  vsLY: number
}

export function getProductScoContribution(f: Filters): ProductScoContribution[] {
  const base = [
    { product: 'Korn-Kali\u00AE', scoPerMT: 218, volumeMT: 245000, vsLY: 6.2 },
    { product: 'Patentkali\u00AE', scoPerMT: 285, volumeMT: 118000, vsLY: 8.4 },
    { product: '60er Kali', scoPerMT: 195, volumeMT: 198000, vsLY: 3.1 },
    { product: 'ESTA\u00AE Kieserit', scoPerMT: 142, volumeMT: 128000, vsLY: -2.8 },
    { product: 'Epso Top\u00AE', scoPerMT: 312, volumeMT: 67000, vsLY: 9.5 },
    { product: 'De-icing Salt', scoPerMT: 12, volumeMT: 890000, vsLY: 1.2 },
    { product: 'Industrial Salt', scoPerMT: 8, volumeMT: 520000, vsLY: -4.1 },
    { product: 'Food Grade Salt', scoPerMT: 28, volumeMT: 95000, vsLY: 5.3 },
  ]

  const items = base.map((row, i) => {
    const sco = vary(row.scoPerMT, f, 1300 + i)
    const vol = Math.round(vary(row.volumeMT, f, 1310 + i))
    return {
      product: row.product,
      scoPerMT: sco,
      volumeMT: vol,
      totalScoM: Math.round(sco * vol / 1000000 * 10) / 10,
      shareOfTotal: 0,
      vsLY: vary(row.vsLY, f, 1320 + i),
    }
  })

  const totalSco = items.reduce((s, r) => s + r.totalScoM, 0)
  return items.map(r => ({ ...r, shareOfTotal: Math.round(r.totalScoM / totalSco * 1000) / 10 }))
}

// ---------------------------------------------------------------------------
// SOP (Sulphate of Potash) and competitor data for Market Intelligence
// ---------------------------------------------------------------------------
export interface CompetitorCapacity {
  producer: string
  region: string
  capacityMT: string
  status: string
  priceImpact: 'bullish' | 'bearish' | 'neutral'
  note: string
}

export function getCompetitorData(): CompetitorCapacity[] {
  return [
    { producer: 'Belaruskali', region: 'Belarus', capacityMT: '~12M', status: 'Sanctions — reduced exports', priceImpact: 'bullish', note: '30-40% of capacity offline since 2022. Supports K+S European pricing.' },
    { producer: 'Uralkali', region: 'Russia', capacityMT: '~13M', status: 'Limited Western access', priceImpact: 'bullish', note: 'Redirecting to India/China at discounts. Less competition in DACH.' },
    { producer: 'Nutrien', region: 'Canada', capacityMT: '~27M', status: 'Expanding Vanscoy', priceImpact: 'bearish', note: '+2M MT by 2027. Watch for price pressure in North American exports.' },
    { producer: 'ICL', region: 'Israel/EU', capacityMT: '~5M', status: 'Stable production', priceImpact: 'neutral', note: 'Direct competitor in European specialty fertilizers (SOP segment).' },
    { producer: 'Arab Potash', region: 'Jordan', capacityMT: '~2.5M', status: 'At capacity', priceImpact: 'neutral', note: 'Primarily serves Indian and SE Asian markets.' },
  ]
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

// ---------------------------------------------------------------------------
// Price Engine — Editable pricing rows, anchor markets, situation-based alerts
// ---------------------------------------------------------------------------

export type PricingStrategy = 'volume-driven' | 'price-driven' | ''

export interface PriceEngineRow {
  id: string
  region: string
  customerType: string
  customer: string
  product: string
  targetPrice: number
  limitPrice: number
  targetMargin: number
  limitMargin: number
  strategy: PricingStrategy
  currency: string
  anchorMarket: string | null  // id of the anchor row, null if this IS the anchor
  isAnchor: boolean
  alertField: string | null    // which field has an active alert
}

export interface AnchorMarketLink {
  anchorId: string
  anchorRegion: string
  anchorLabel: string
  linkedIds: string[]
  linkedRegions: string[]
  linkedLabel: string
  rule: string // e.g., "CIF parity + logistics delta"
}

export interface PriceEngineAlert {
  id: string
  rowId: string
  field: string            // the input field name that is affected
  severity: 'critical' | 'warning' | 'info'
  title: string
  description: string
  recommendation: string
  rationale: string
  recommendedDelta: number // pp change suggestion
  archetypeContext: string
  relatedDrivers: string[] // links to analytics dashboard drivers
}

export function getPriceEngineRows(f: Filters): PriceEngineRow[] {
  return [
    // --- Europe anchor market ---
    { id: 'pe-1', region: 'Europe', customerType: 'A', customer: 'BayWa', product: 'MOP', targetPrice: vary(700, f, 2000), limitPrice: vary(300, f, 2001), targetMargin: vary(20, f, 2002), limitMargin: vary(10, f, 2003), strategy: 'price-driven', currency: '€/t', anchorMarket: null, isAnchor: true, alertField: null },
    { id: 'pe-2', region: 'Europe', customerType: 'A', customer: 'AGRAVIS', product: 'SOP', targetPrice: vary(900, f, 2010), limitPrice: vary(500, f, 2011), targetMargin: vary(25, f, 2012), limitMargin: vary(12, f, 2013), strategy: 'volume-driven', currency: '€/t', anchorMarket: null, isAnchor: true, alertField: 'targetPrice' },
    { id: 'pe-3', region: 'Europe', customerType: 'B', customer: 'Raiffeisen', product: 'Korn-Kali\u00AE', targetPrice: vary(650, f, 2020), limitPrice: vary(280, f, 2021), targetMargin: vary(22, f, 2022), limitMargin: vary(11, f, 2023), strategy: 'price-driven', currency: '€/t', anchorMarket: null, isAnchor: false, alertField: null },
    // --- North America anchor market ---
    { id: 'pe-4', region: 'North America', customerType: 'A', customer: 'Nutrien', product: 'MOP', targetPrice: vary(420, f, 2030), limitPrice: vary(200, f, 2031), targetMargin: vary(18, f, 2032), limitMargin: vary(9, f, 2033), strategy: 'volume-driven', currency: '$/t', anchorMarket: null, isAnchor: true, alertField: 'limitPrice' },
    { id: 'pe-5', region: 'North America', customerType: 'B', customer: 'Mosaic', product: 'MOP', targetPrice: vary(400, f, 2040), limitPrice: vary(190, f, 2041), targetMargin: vary(16, f, 2042), limitMargin: vary(8, f, 2043), strategy: 'price-driven', currency: '$/t', anchorMarket: 'pe-4', isAnchor: false, alertField: null },
    // --- South America (anchored to North America) ---
    { id: 'pe-6', region: 'South America', customerType: 'A', customer: 'Fertipar', product: 'MOP', targetPrice: vary(380, f, 2050), limitPrice: vary(180, f, 2051), targetMargin: vary(15, f, 2052), limitMargin: vary(7, f, 2053), strategy: 'volume-driven', currency: '$/t', anchorMarket: 'pe-4', isAnchor: false, alertField: 'targetMargin' },
    { id: 'pe-7', region: 'South America', customerType: 'B', customer: 'Heringer', product: 'SOP', targetPrice: vary(520, f, 2060), limitPrice: vary(250, f, 2061), targetMargin: vary(17, f, 2062), limitMargin: vary(8, f, 2063), strategy: 'price-driven', currency: '$/t', anchorMarket: null, isAnchor: false, alertField: null },
    // --- Asia Pacific ---
    { id: 'pe-8', region: 'Asia Pacific', customerType: 'A', customer: 'Sinofert', product: 'MOP', targetPrice: vary(360, f, 2070), limitPrice: vary(170, f, 2071), targetMargin: vary(14, f, 2072), limitMargin: vary(6, f, 2073), strategy: 'volume-driven', currency: '$/t', anchorMarket: null, isAnchor: false, alertField: null },
    { id: 'pe-9', region: 'Asia Pacific', customerType: 'B', customer: 'IPL', product: 'CMS', targetPrice: vary(290, f, 2080), limitPrice: vary(140, f, 2081), targetMargin: vary(13, f, 2082), limitMargin: vary(6, f, 2083), strategy: 'price-driven', currency: '$/t', anchorMarket: null, isAnchor: false, alertField: null },
    // --- Overseas (anchored to Europe) ---
    { id: 'pe-10', region: 'Overseas', customerType: 'A', customer: 'OCP Group', product: 'CMS', targetPrice: vary(310, f, 2090), limitPrice: vary(150, f, 2091), targetMargin: vary(16, f, 2092), limitMargin: vary(7, f, 2093), strategy: 'volume-driven', currency: '$/t', anchorMarket: 'pe-1', isAnchor: false, alertField: null },
  ]
}

export function getAnchorMarketLinks(): AnchorMarketLink[] {
  return [
    {
      anchorId: 'pe-4',
      anchorRegion: 'North America',
      anchorLabel: 'North America (Nutrien MOP)',
      linkedIds: ['pe-5', 'pe-6'],
      linkedRegions: ['North America', 'South America'],
      linkedLabel: 'Mosaic MOP, Fertipar MOP',
      rule: 'CIF parity + logistics delta. Price adjustments in the anchor propagate with regional freight differential.',
    },
    {
      anchorId: 'pe-1',
      anchorRegion: 'Europe',
      anchorLabel: 'Europe (BayWa MOP)',
      linkedIds: ['pe-10'],
      linkedRegions: ['Overseas'],
      linkedLabel: 'OCP Group CMS',
      rule: 'FOB Europe + freight surcharge. European base price sets the floor for overseas CMS export pricing.',
    },
  ]
}

export function getPriceEngineAlerts(f: Filters): PriceEngineAlert[] {
  const mopChange = vary(1.5, f, 3000)
  const gasImpact = vary(2.8, f, 3001)
  const freightDelta = vary(0.9, f, 3002)
  return [
    {
      id: 'pea-1',
      rowId: 'pe-4',
      field: 'limitPrice',
      severity: 'critical',
      title: `MOP index North America changed by +${mopChange.toFixed(1)}% pp — please review target price`,
      description: `The Vancouver MOP CFR spot has shifted +${mopChange.toFixed(1)}% pp since last adjustment. Your current limit price may be below market.`,
      recommendation: `Increase limit price by +${(mopChange * 0.8).toFixed(1)}% pp, target price by +${(mopChange * 0.5).toFixed(1)}% pp`,
      rationale: `In comparable situations within the "Volume Partner" archetype, the margin corridor narrowed and shifted upward. Historical data shows that delayed adjustments in North America led to ${(mopChange * 2.1).toFixed(1)}% margin erosion within 60 days.`,
      recommendedDelta: Math.round(mopChange * 0.8 * 10) / 10,
      archetypeContext: 'Volume Partner',
      relatedDrivers: ['MOP Vancouver Index', 'Freight Baltic Index', 'USD/CAD FX'],
    },
    {
      id: 'pea-2',
      rowId: 'pe-2',
      field: 'targetPrice',
      severity: 'warning',
      title: `Energy cost increase of +${gasImpact.toFixed(1)}% impacts SOP production margins`,
      description: `Natural gas TTF has risen +${gasImpact.toFixed(1)}% since last price review. SOP production is energy-intensive — margin corridor needs recalibration.`,
      recommendation: `Increase target price by +${(gasImpact * 0.6).toFixed(1)}% pp to maintain margin corridor`,
      rationale: `In the "Contract Loyal" archetype with energy-sensitive products, comparable gas price increases historically triggered a ${(gasImpact * 0.65).toFixed(1)}% corridor shift within 30 days. Early adjustment preserved customer retention at 94%.`,
      recommendedDelta: Math.round(gasImpact * 0.6 * 10) / 10,
      archetypeContext: 'Contract Loyal',
      relatedDrivers: ['Natural Gas TTF', 'Electricity Price Index', 'Production Cost/MT'],
    },
    {
      id: 'pea-3',
      rowId: 'pe-6',
      field: 'targetMargin',
      severity: 'warning',
      title: `Anchor market shift: North America adjusted +${mopChange.toFixed(1)}% — South America alignment needed`,
      description: `North America (anchor market) has seen a +${mopChange.toFixed(1)}% pp MOP price shift. South American prices for Fertipar MOP should be aligned via CIF parity rule.`,
      recommendation: `Increase target margin by +${(mopChange * 0.7).toFixed(1)}% pp (auto-adjustment available via anchor link)`,
      rationale: `CIF parity pricing with North America requires corresponding adjustment. In comparable situations, Brazil-market delayed adjustments eroded margin by ${(mopChange * 1.5).toFixed(1)}% pp within one pricing cycle.`,
      recommendedDelta: Math.round(mopChange * 0.7 * 10) / 10,
      archetypeContext: 'Volume Partner',
      relatedDrivers: ['MOP Vancouver Index', 'BRL/USD FX', 'Freight Cost Brazil'],
    },
    {
      id: 'pea-4',
      rowId: 'pe-3',
      field: 'limitPrice',
      severity: 'info',
      title: `Logistics cost index shifted +${freightDelta.toFixed(1)}% — review Korn-Kali® freight component`,
      description: `The European freight index rose +${freightDelta.toFixed(1)}% since last review. This primarily affects inland distribution costs for Korn-Kali® to the DACH market.`,
      recommendation: `Consider adjusting limit price by +${(freightDelta * 0.4).toFixed(1)}% pp to offset freight`,
      rationale: `In "Value Maximizer" archetype situations with similar freight shifts, proactive limit adjustments maintained the net margin corridor. Customers in this archetype typically accept logistics-based price adjustments within 0.5-1.0% pp.`,
      recommendedDelta: Math.round(freightDelta * 0.4 * 10) / 10,
      archetypeContext: 'Value Maximizer',
      relatedDrivers: ['Freight Index Europe', 'Logistics & Distribution Cost', 'Diesel Price Index'],
    },
  ]
}

// ---------------------------------------------------------------------------
// Price Engine Waterfall — Shows impact of manual price changes
// ---------------------------------------------------------------------------
export interface PriceWaterfallStep {
  name: string
  value: number
  type: 'start' | 'end' | 'positive' | 'negative'
}

export function getPriceEngineWaterfall(f: Filters): PriceWaterfallStep[] {
  const basePrice = vary(320, f, 4000)
  const listEffect = vary(12.5, f, 4001)
  const indexAdj = vary(4.8, f, 4002)
  const energySurch = vary(3.2, f, 4003)
  const freightAdj = vary(-2.1, f, 4004)
  const fxEffect = vary(1.5, f, 4005)
  const conditionEffect = vary(-5.8, f, 4006)
  const volumeRebate = vary(-3.4, f, 4007)
  const netPrice = Math.round((basePrice + listEffect + indexAdj + energySurch + freightAdj + fxEffect + conditionEffect + volumeRebate) * 10) / 10

  return [
    { name: 'Base Price\n(Last Period)', value: basePrice, type: 'start' },
    { name: 'List Price\nAdjustment', value: listEffect, type: listEffect >= 0 ? 'positive' : 'negative' },
    { name: 'Index\nAdjustment', value: indexAdj, type: indexAdj >= 0 ? 'positive' : 'negative' },
    { name: 'Energy\nSurcharge', value: energySurch, type: energySurch >= 0 ? 'positive' : 'negative' },
    { name: 'Freight\nDelta', value: freightAdj, type: freightAdj >= 0 ? 'positive' : 'negative' },
    { name: 'FX\nEffect', value: fxEffect, type: fxEffect >= 0 ? 'positive' : 'negative' },
    { name: 'Condition\nEffect', value: conditionEffect, type: conditionEffect >= 0 ? 'positive' : 'negative' },
    { name: 'Volume\nRebate', value: volumeRebate, type: volumeRebate >= 0 ? 'positive' : 'negative' },
    { name: 'Net Price\n(Current)', value: netPrice, type: 'end' },
  ]
}
