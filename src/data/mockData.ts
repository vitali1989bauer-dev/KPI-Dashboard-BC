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

export const topKpis: KpiCard[] = [
  {
    id: 'actual-sco',
    title: 'Actual SCO/MT',
    value: 142.8,
    unit: '€/MT',
    status: 'neutral',
    subtitle: 'Current Period',
  },
  {
    id: 'vs-ly',
    title: 'Δ vs Last Year',
    value: 12.4,
    unit: '€/MT',
    change: 9.5,
    changeLabel: 'vs LY',
    status: 'positive',
    subtitle: '+9.5% YoY improvement',
  },
  {
    id: 'vs-pl',
    title: 'Δ vs PL',
    value: -3.2,
    unit: '€/MT',
    change: -2.2,
    changeLabel: 'vs Plan',
    status: 'negative',
    subtitle: '-2.2% below plan',
  },
  {
    id: 'vs-target',
    title: 'Δ vs Target',
    value: 5.1,
    unit: '€/MT',
    change: 3.7,
    changeLabel: 'vs Target',
    status: 'positive',
    subtitle: '+3.7% above target',
  },
  {
    id: 'volume-forecast',
    title: 'Volume Forecast Fulfillment Rate',
    value: 94.2,
    unit: '%',
    change: 1.8,
    changeLabel: 'vs LY',
    status: 'positive',
    subtitle: 'On track',
  },
  {
    id: 'market-price-index',
    title: 'Market Price Index Raw Materials',
    value: 108.5,
    unit: 'Index',
    change: -3.1,
    changeLabel: 'vs LY',
    status: 'warning',
    subtitle: 'Slight decrease vs LY',
  },
  {
    id: 'position-valuation',
    title: 'Position Valuation Raw Materials',
    value: 2.4,
    unit: 'M€',
    change: -12.3,
    changeLabel: 'vs LY',
    status: 'negative',
    subtitle: 'Below last year',
  },
  {
    id: 'revenue-leakage',
    title: 'Revenue Leakage / Condition Spending',
    value: 18.7,
    unit: 'M€',
    change: 4.2,
    changeLabel: 'vs LY',
    status: 'negative',
    subtitle: 'Increased spending',
  },
]

export interface WaterfallItem {
  name: string
  value: number
  type: 'start' | 'end' | 'positive' | 'negative'
}

export const scoWaterfallData: WaterfallItem[] = [
  { name: 'Actual SCO/MT\nLast Year', value: 130.4, type: 'start' },
  { name: 'Price\nEffect', value: 8.6, type: 'positive' },
  { name: 'Volume\nEffect', value: -2.1, type: 'negative' },
  { name: 'Cost\nEffect', value: 3.8, type: 'positive' },
  { name: 'New Business\nEffect', value: 4.5, type: 'positive' },
  { name: 'Portfolio Mix\nEffect', value: -2.4, type: 'negative' },
  { name: 'Actual SCO/MT\nCurrent', value: 142.8, type: 'end' },
]

export interface ConditionSpendingItem {
  month: string
  actual: number
  lastYear: number
}

export const conditionSpendingData: ConditionSpendingItem[] = [
  { month: 'Jan', actual: 1.8, lastYear: 1.5 },
  { month: 'Feb', actual: 1.6, lastYear: 1.4 },
  { month: 'Mar', actual: 2.1, lastYear: 1.7 },
  { month: 'Apr', actual: 1.9, lastYear: 1.6 },
  { month: 'May', actual: 2.3, lastYear: 1.8 },
  { month: 'Jun', actual: 1.7, lastYear: 1.5 },
  { month: 'Jul', actual: 1.5, lastYear: 1.3 },
  { month: 'Aug', actual: 1.4, lastYear: 1.2 },
  { month: 'Sep', actual: 1.6, lastYear: 1.4 },
  { month: 'Oct', actual: 1.2, lastYear: 1.1 },
  { month: 'Nov', actual: 0.9, lastYear: 0.8 },
  { month: 'Dec', actual: 0.7, lastYear: 0.6 },
]

export interface PricingData {
  segment: string
  avgPrice: number
  priceVsLY: number
  margin: number
  marginVsLY: number
  volume: number
}

export const pricingDeepDiveData: PricingData[] = [
  { segment: 'Premium', avgPrice: 285.4, priceVsLY: 5.2, margin: 32.1, marginVsLY: 1.8, volume: 12400 },
  { segment: 'Standard', avgPrice: 178.2, priceVsLY: 3.1, margin: 22.5, marginVsLY: -0.4, volume: 34500 },
  { segment: 'Economy', avgPrice: 112.6, priceVsLY: -1.2, margin: 14.8, marginVsLY: -2.1, volume: 28700 },
  { segment: 'Bulk', avgPrice: 89.3, priceVsLY: 2.8, margin: 8.2, marginVsLY: 0.6, volume: 52100 },
  { segment: 'Specialty', avgPrice: 342.1, priceVsLY: 7.5, margin: 38.4, marginVsLY: 3.2, volume: 5600 },
]

export interface VolumeData {
  month: string
  actual: number
  forecast: number
  lastYear: number
}

export const volumeDeepDiveData: VolumeData[] = [
  { month: 'Jan', actual: 11200, forecast: 11500, lastYear: 10800 },
  { month: 'Feb', actual: 10800, forecast: 11000, lastYear: 10200 },
  { month: 'Mar', actual: 12500, forecast: 12000, lastYear: 11700 },
  { month: 'Apr', actual: 11900, forecast: 12200, lastYear: 11400 },
  { month: 'May', actual: 13200, forecast: 12800, lastYear: 12100 },
  { month: 'Jun', actual: 12100, forecast: 12500, lastYear: 11800 },
  { month: 'Jul', actual: 10500, forecast: 11000, lastYear: 10100 },
  { month: 'Aug', actual: 9800, forecast: 10200, lastYear: 9500 },
  { month: 'Sep', actual: 11600, forecast: 11800, lastYear: 11000 },
  { month: 'Oct', actual: 12800, forecast: 12500, lastYear: 12200 },
  { month: 'Nov', actual: 11400, forecast: 11800, lastYear: 10900 },
  { month: 'Dec', actual: 10200, forecast: 10800, lastYear: 9800 },
]

export interface CostItem {
  category: string
  actual: number
  budget: number
  variance: number
  variancePct: number
}

export const costDeepDiveData: CostItem[] = [
  { category: 'Raw Materials', actual: 45.2, budget: 42.8, variance: 2.4, variancePct: 5.6 },
  { category: 'Energy', actual: 12.8, budget: 11.5, variance: 1.3, variancePct: 11.3 },
  { category: 'Logistics', actual: 8.4, budget: 8.9, variance: -0.5, variancePct: -5.6 },
  { category: 'Packaging', actual: 6.2, budget: 6.0, variance: 0.2, variancePct: 3.3 },
  { category: 'Labor', actual: 15.1, budget: 15.4, variance: -0.3, variancePct: -1.9 },
  { category: 'Overhead', actual: 9.8, budget: 10.2, variance: -0.4, variancePct: -3.9 },
]

export const regions = ['All Regions', 'Europe', 'North America', 'Asia Pacific', 'Latin America']
export const countryClusters = ['All Clusters', 'DACH', 'Nordics', 'Benelux', 'Southern Europe', 'UK & Ireland']
export const customerSegments = ['All Segments', 'Food & Beverage', 'Pharma', 'Chemicals', 'Agriculture', 'Retail']
export const timePeriods = ['Month-to-month', 'PL period', 'YTD', 'Full year / Fiscal year']
