import { useState } from 'react'
import { ChevronDown, ChevronRight, ArrowRight } from 'lucide-react'
import InfoTooltip from '../components/InfoTooltip'

// ---------------------------------------------------------------------------
// Formula data model
// ---------------------------------------------------------------------------
interface FormulaVariable {
  symbol: string
  name: string
  unit: string
  source: string
}

interface Formula {
  id: string
  name: string
  formula: string          // LaTeX-like display
  description: string
  unit: string
  variables: FormulaVariable[]
  example: { inputs: Record<string, string>; result: string }
  usedOn: string[]         // pages where this KPI appears
}

interface FormulaGroup {
  label: string
  formulas: Formula[]
}

// ---------------------------------------------------------------------------
// Complete KPI formula definitions
// ---------------------------------------------------------------------------
const formulaGroups: FormulaGroup[] = [
  {
    label: 'Profitability — Standard Contribution Order (SCO)',
    formulas: [
      {
        id: 'sco-mt',
        name: 'SCO / MT (Standard Contribution Order per Metric Ton)',
        formula: 'SCO/MT = (Net Revenue − COGS − Logistics − Conditions) / Volume',
        description: 'Primary profitability metric. Measures the contribution margin per metric ton after deducting all variable costs, logistics, and commercial conditions from net revenue.',
        unit: '€/MT',
        variables: [
          { symbol: 'Net Revenue', name: 'Net Revenue', unit: 'M€', source: 'SAP FI (Gross Revenue − all deductions)' },
          { symbol: 'COGS', name: 'Cost of Goods Sold', unit: 'M€', source: 'SAP CO (mining, energy, processing, packaging)' },
          { symbol: 'Logistics', name: 'Logistics & Distribution', unit: 'M€', source: 'SAP MM / TMS' },
          { symbol: 'Conditions', name: 'Commercial Conditions', unit: 'M€', source: 'SAP SD (discounts, rebates, allowances)' },
          { symbol: 'Volume', name: 'Sales Volume', unit: 'MT', source: 'SAP SD' },
        ],
        example: { inputs: { 'Net Revenue': '485.2 M€', 'COGS': '154.5 M€', 'Logistics': '14.3 M€', 'Conditions': '78.8 M€', 'Volume': '1,090,000 MT' }, result: '218.5 €/MT' },
        usedOn: ['Dashboard', 'SCO Bridge'],
      },
      {
        id: 'sco-yoy',
        name: 'SCO/MT Year-over-Year Change',
        formula: 'Δ SCO YoY = SCO/MT(t) − SCO/MT(t−1)',
        description: 'Absolute year-over-year change in SCO/MT. Indicates whether profitability per ton improved or declined versus the prior-year comparable period.',
        unit: '€/MT',
        variables: [
          { symbol: 'SCO/MT(t)', name: 'Current Period SCO/MT', unit: '€/MT', source: 'Calculated' },
          { symbol: 'SCO/MT(t−1)', name: 'Prior Year SCO/MT', unit: '€/MT', source: 'SAP FI/CO (prior year actuals)' },
        ],
        example: { inputs: { 'SCO/MT(t)': '218.5 €/MT', 'SCO/MT(t−1)': '203.8 €/MT' }, result: '+14.7 €/MT (+7.2%)' },
        usedOn: ['Dashboard'],
      },
      {
        id: 'sco-vs-pl',
        name: 'SCO/MT vs. Plan (PL Variance)',
        formula: 'Δ SCO vs PL = SCO/MT(actual) − SCO/MT(plan)',
        description: 'Deviation from the annual operating plan (Planungsrechnung). Negative values indicate underperformance versus budget.',
        unit: '€/MT',
        variables: [
          { symbol: 'SCO/MT(actual)', name: 'Actual SCO/MT', unit: '€/MT', source: 'Calculated' },
          { symbol: 'SCO/MT(plan)', name: 'Planned SCO/MT', unit: '€/MT', source: 'SAP CO-PA (annual budget)' },
        ],
        example: { inputs: { 'SCO/MT(actual)': '218.5 €/MT', 'SCO/MT(plan)': '223.3 €/MT' }, result: '−4.8 €/MT (−2.1%)' },
        usedOn: ['Dashboard'],
      },
    ],
  },
  {
    label: 'SCO Bridge — Waterfall Decomposition',
    formulas: [
      {
        id: 'list-price-effect',
        name: 'List Price Effect',
        formula: 'ΔP = Σᵢ (Pᵢ(t) − Pᵢ(t−1)) × Volᵢ(t) / Vol(t)',
        description: 'Contribution of list price changes to SCO/MT, weighted by current-period sales volume. Isolates the pure pricing impact assuming constant mix and volume.',
        unit: '€/MT',
        variables: [
          { symbol: 'Pᵢ(t)', name: 'Current list price for product i', unit: '€/MT', source: 'SAP SD price master' },
          { symbol: 'Pᵢ(t−1)', name: 'Prior-year list price for product i', unit: '€/MT', source: 'SAP SD price master (prior)' },
          { symbol: 'Volᵢ(t)', name: 'Volume of product i', unit: 'MT', source: 'SAP SD' },
          { symbol: 'Vol(t)', name: 'Total sales volume', unit: 'MT', source: 'SAP SD' },
        ],
        example: { inputs: { 'Price increase Korn-Kali®': '+15 €/MT', 'Volume share': '22.5%', 'Weighted across all products': '' }, result: '+8.4 €/MT' },
        usedOn: ['SCO Bridge'],
      },
      {
        id: 'condition-effect',
        name: 'Condition Effect',
        formula: 'ΔC = (Conditions(t)/Vol(t)) − (Conditions(t−1)/Vol(t−1))',
        description: 'Change in per-ton condition spending. Includes trade discounts, volume rebates, logistics allowances, promotional conditions, and early payment discounts.',
        unit: '€/MT',
        variables: [
          { symbol: 'Conditions(t)', name: 'Total condition spend current period', unit: 'M€', source: 'SAP SD (condition types)' },
          { symbol: 'Vol(t)', name: 'Current sales volume', unit: 'MT', source: 'SAP SD' },
        ],
        example: { inputs: { 'Current conditions/MT': '72.3 €/MT', 'Prior conditions/MT': '69.1 €/MT' }, result: '−3.2 €/MT' },
        usedOn: ['SCO Bridge'],
      },
      {
        id: 'volume-effect',
        name: 'Volume / Capacity Effect',
        formula: 'ΔV = Fixed Costs × (1/Vol(t) − 1/Vol(t−1))',
        description: 'Impact of volume changes on per-ton fixed cost absorption. Lower volumes spread fixed mining and processing costs over fewer tons, increasing per-unit cost.',
        unit: '€/MT',
        variables: [
          { symbol: 'Fixed Costs', name: 'Fixed production costs (mining, depreciation)', unit: 'M€', source: 'SAP CO (cost center fixed portion)' },
          { symbol: 'Vol(t)', name: 'Current production volume', unit: 'MT', source: 'SAP PP / Mine systems' },
        ],
        example: { inputs: { 'Fixed costs': '85.2 M€', 'Volume decline': '−1.8%' }, result: '−2.1 €/MT' },
        usedOn: ['SCO Bridge'],
      },
      {
        id: 'energy-effect',
        name: 'Energy Cost Effect',
        formula: 'ΔE = Σⱼ (Eⱼ(t) − Eⱼ(t−1)) × Consumptionⱼ / Vol(t)',
        description: 'Impact of energy price changes (natural gas, electricity) on SCO. Energy is a major cost driver for potash production (evaporation, crystallization).',
        unit: '€/MT',
        variables: [
          { symbol: 'Eⱼ(t)', name: 'Energy price (gas/elec) current', unit: '€/MWh', source: 'Argus / ICIS price feeds' },
          { symbol: 'Consumptionⱼ', name: 'Energy consumption by type', unit: 'MWh', source: 'Plant energy metering' },
          { symbol: 'Vol(t)', name: 'Production volume', unit: 'MT', source: 'SAP PP' },
        ],
        example: { inputs: { 'Gas price increase': '+18.2%', 'Gas consumption': '6.2 MWh/MT', 'Electricity change': '+5.1%' }, result: '−4.8 €/MT' },
        usedOn: ['SCO Bridge'],
      },
      {
        id: 'raw-material-effect',
        name: 'Raw Material & Mining Effect',
        formula: 'ΔRM = (Mining Cost/MT(t−1) − Mining Cost/MT(t))',
        description: 'Productivity gains or losses in ore extraction and processing. Positive values reflect improved extraction efficiency, ore grade, or mining method optimization.',
        unit: '€/MT',
        variables: [
          { symbol: 'Mining Cost/MT', name: 'Per-ton extraction & processing cost', unit: '€/MT', source: 'SAP CO (mining cost centers)' },
        ],
        example: { inputs: { 'Prior mining cost': '52.8 €/MT', 'Current mining cost': '50.5 €/MT' }, result: '+2.3 €/MT' },
        usedOn: ['SCO Bridge'],
      },
      {
        id: 'logistics-effect',
        name: 'Logistics & Freight Effect',
        formula: 'ΔL = (Freight/MT(t−1) − Freight/MT(t)) + FX adjustment',
        description: 'Change in per-ton logistics cost including rail, truck, ocean freight, and port handling. Incorporates freight index and FX on USD-denominated shipping.',
        unit: '€/MT',
        variables: [
          { symbol: 'Freight/MT', name: 'Average freight cost per ton', unit: '€/MT', source: 'SAP MM / TMS' },
          { symbol: 'Freight Index', name: 'Baltic Dry Index / freight benchmark', unit: 'Index', source: 'Argus / Baltic Exchange' },
        ],
        example: { inputs: { 'Freight index change': '+4.2%', 'Avg haul distance change': '+1.1%' }, result: '−1.5 €/MT' },
        usedOn: ['SCO Bridge'],
      },
      {
        id: 'fx-effect',
        name: 'FX Effect',
        formula: 'ΔFX = Revenue(FX) × (1/FX(t) − 1/FX(t−1)) / Vol(t)',
        description: 'Impact of exchange rate movements on euro-denominated SCO. K+S exports ~40% in USD. A weaker EUR benefits per-ton contribution when converting USD revenue.',
        unit: '€/MT',
        variables: [
          { symbol: 'Revenue(FX)', name: 'Revenue in foreign currencies', unit: 'M USD/BRL', source: 'SAP FI' },
          { symbol: 'FX(t)', name: 'Average EUR/USD rate current period', unit: 'EUR/USD', source: 'ECB / Bloomberg' },
          { symbol: 'Vol(t)', name: 'Total volume', unit: 'MT', source: 'SAP SD' },
        ],
        example: { inputs: { 'USD revenue': '142 M$', 'EUR/USD prior': '1.09', 'EUR/USD current': '1.07' }, result: '+1.8 €/MT' },
        usedOn: ['SCO Bridge'],
      },
      {
        id: 'mix-effect',
        name: 'Product Mix Effect',
        formula: 'ΔMix = Σᵢ (Shareᵢ(t) − Shareᵢ(t−1)) × SCOᵢ',
        description: 'Impact of volume share shifts between products. Higher share of premium products (Patentkali®, Epso Top®) improves mix, while more salt or commodity potash reduces it.',
        unit: '€/MT',
        variables: [
          { symbol: 'Shareᵢ(t)', name: 'Volume share of product i', unit: '%', source: 'SAP SD (volume by material)' },
          { symbol: 'SCOᵢ', name: 'SCO/MT of product i', unit: '€/MT', source: 'SAP CO-PA' },
        ],
        example: { inputs: { 'Specialty share decline': '−1.4pp', 'Salt share increase': '+0.8pp' }, result: '−1.6 €/MT' },
        usedOn: ['SCO Bridge'],
      },
    ],
  },
  {
    label: 'Pricing & Conditions',
    formulas: [
      {
        id: 'net-revenue',
        name: 'Net Revenue (Gross-to-Net)',
        formula: 'Net Revenue = Gross Revenue − Trade Disc. − Logistics Allow. − Vol. Rebates − Promo − Early Pay',
        description: 'Revenue after all commercial deductions. The gross-to-net waterfall decomposes the total leakage from list-price revenue to invoiced net revenue.',
        unit: 'M€',
        variables: [
          { symbol: 'Gross Revenue', name: 'List price × volume', unit: 'M€', source: 'SAP SD (price × qty)' },
          { symbol: 'Trade Disc.', name: 'Trade Discounts', unit: 'M€', source: 'SAP SD condition type ZK01' },
          { symbol: 'Vol. Rebates', name: 'Volume-based Rebates', unit: 'M€', source: 'SAP SD condition type BO01' },
          { symbol: 'Logistics Allow.', name: 'Logistics Allowances', unit: 'M€', source: 'SAP SD condition type ZF01' },
          { symbol: 'Promo', name: 'Promotional Conditions', unit: 'M€', source: 'SAP SD condition type ZP01' },
          { symbol: 'Early Pay', name: 'Early Payment Discounts', unit: 'M€', source: 'SAP SD condition type SKTO' },
        ],
        example: { inputs: { 'Gross Revenue': '485.2 M€', 'Trade': '−28.4', 'Logistics': '−14.7', 'Rebates': '−18.2', 'Promo': '−8.6', 'Early Pay': '−3.8' }, result: '411.5 M€' },
        usedOn: ['Pricing Detail'],
      },
      {
        id: 'condition-ratio',
        name: 'Condition Ratio (% of Revenue)',
        formula: 'Condition Ratio = Total Conditions / Gross Revenue × 100',
        description: 'Share of gross revenue consumed by commercial conditions. Target: <15%. Exceeding threshold signals over-discounting or inefficient incentive structures.',
        unit: '%',
        variables: [
          { symbol: 'Total Conditions', name: 'Sum of all condition types', unit: 'M€', source: 'SAP SD' },
          { symbol: 'Gross Revenue', name: 'List price revenue', unit: 'M€', source: 'SAP SD' },
        ],
        example: { inputs: { 'Total Conditions': '78.8 M€', 'Gross Revenue': '485.2 M€' }, result: '16.2%' },
        usedOn: ['Dashboard', 'Pricing & Conditions'],
      },
      {
        id: 'avg-price-product',
        name: 'Average Realized Price by Product',
        formula: 'Avg Price(i) = Net Revenue(i) / Volume(i)',
        description: 'Realized net price per metric ton for each product group after all conditions. Used for product-level pricing performance tracking.',
        unit: '€/MT',
        variables: [
          { symbol: 'Net Revenue(i)', name: 'Net revenue for product i', unit: 'M€', source: 'SAP CO-PA' },
          { symbol: 'Volume(i)', name: 'Sales volume for product i', unit: 'MT', source: 'SAP SD' },
        ],
        example: { inputs: { 'Korn-Kali® revenue': '76.6 M€', 'Korn-Kali® volume': '245,000 MT' }, result: '312.5 €/MT' },
        usedOn: ['Pricing & Conditions', 'Pricing Detail'],
      },
      {
        id: 'margin-pct',
        name: 'Gross Margin %',
        formula: 'Margin % = (Net Revenue − COGS) / Net Revenue × 100',
        description: 'Gross margin percentage at product or customer level. Measures pricing power after direct production costs.',
        unit: '%',
        variables: [
          { symbol: 'Net Revenue', name: 'Net revenue', unit: '€', source: 'SAP CO-PA' },
          { symbol: 'COGS', name: 'Cost of Goods Sold', unit: '€', source: 'SAP CO (material + production)' },
        ],
        example: { inputs: { 'Net Revenue': '312.5 €/MT', 'COGS': '224.0 €/MT' }, result: '28.3%' },
        usedOn: ['Customer Portfolio', 'Pricing Detail', 'Price Engine'],
      },
    ],
  },
  {
    label: 'Volume & Operations',
    formulas: [
      {
        id: 'vol-fulfillment',
        name: 'Volume Forecast Fulfillment',
        formula: 'Fulfillment % = Actual Volume / Forecast Volume × 100',
        description: 'Degree of volume plan achievement. Tracked monthly and YTD. Values above 95% are considered on-track; below 85% triggers capacity or demand review.',
        unit: '%',
        variables: [
          { symbol: 'Actual Volume', name: 'Realized sales/production volume', unit: 'MT', source: 'SAP SD / PP' },
          { symbol: 'Forecast Volume', name: 'Planned volume (budget or S&OP)', unit: 'MT', source: 'SAP CO-PA / S&OP' },
        ],
        example: { inputs: { 'Actual': '1,009,000 MT', 'Forecast': '1,090,000 MT' }, result: '92.6%' },
        usedOn: ['Dashboard', 'Operations'],
      },
      {
        id: 'vol-achievement',
        name: 'Volume Achievement (Price Engine)',
        formula: 'Vol Achievement = Volume Actual YTD / Volume Target Annual × 100',
        description: 'Per-row and total volume achievement in the Price Engine. Measures how much of the annual volume allocation has been realized YTD per region/customer/product combination.',
        unit: '%',
        variables: [
          { symbol: 'Volume Actual YTD', name: 'Year-to-date realized volume', unit: 'MT', source: 'SAP SD' },
          { symbol: 'Volume Target Annual', name: 'Annual volume allocation target', unit: 'MT', source: 'S&OP / pricing strategy' },
        ],
        example: { inputs: { 'Actual YTD': '98,000 MT', 'Annual Target': '120,000 MT' }, result: '81.7%' },
        usedOn: ['Price Engine'],
      },
      {
        id: 'capacity-util',
        name: 'Capacity Utilization',
        formula: 'Utilization % = Actual Output / Nameplate Capacity × 100',
        description: 'Production site efficiency metric. Nameplate capacity is the theoretical maximum annual output. Utilization below 80% signals operational issues or demand constraints.',
        unit: '%',
        variables: [
          { symbol: 'Actual Output', name: 'Actual production volume', unit: 'MT/year', source: 'Mine systems / SAP PP' },
          { symbol: 'Nameplate Capacity', name: 'Rated annual capacity', unit: 'MT/year', source: 'Engineering design specs' },
        ],
        example: { inputs: { 'Output Werra': '2,006,400 MT', 'Capacity Werra': '2,200,000 MT' }, result: '91.2%' },
        usedOn: ['Operations'],
      },
      {
        id: 'cost-per-mt',
        name: 'Production Cost per MT',
        formula: 'Cost/MT = (Extraction + Energy + Processing + Packaging) / Output Volume',
        description: 'Total production cost per metric ton at site level. Includes ore extraction, energy, processing/granulation, and packaging. Excludes logistics and commercial costs.',
        unit: '€/MT',
        variables: [
          { symbol: 'Extraction', name: 'Mining / ore extraction cost', unit: 'M€', source: 'SAP CO (mining cost centers)' },
          { symbol: 'Energy', name: 'Natural gas + electricity', unit: 'M€', source: 'SAP CO (energy cost centers)' },
          { symbol: 'Processing', name: 'Granulation, crystallization', unit: 'M€', source: 'SAP CO (processing cost centers)' },
          { symbol: 'Packaging', name: 'Packaging & handling', unit: 'M€', source: 'SAP CO (packaging cost centers)' },
          { symbol: 'Output Volume', name: 'Site production output', unit: 'MT', source: 'SAP PP' },
        ],
        example: { inputs: { 'Total production cost Werra': '165.3 M€', 'Output': '2,006,400 MT' }, result: '82.4 €/MT' },
        usedOn: ['Operations', 'Cost Detail'],
      },
      {
        id: 'cost-variance',
        name: 'Cost Variance vs. Budget',
        formula: 'Variance % = (Actual Cost − Budget) / Budget × 100',
        description: 'Percentage deviation from budgeted costs by category. Positive values indicate over-spend. Tracked for 6 cost categories: extraction, energy, salt mining, processing, packaging, logistics.',
        unit: '%',
        variables: [
          { symbol: 'Actual Cost', name: 'Realized cost for category', unit: 'M€', source: 'SAP CO' },
          { symbol: 'Budget', name: 'Planned cost for category', unit: 'M€', source: 'SAP CO (annual budget)' },
        ],
        example: { inputs: { 'Energy actual': '38.6 M€', 'Energy budget': '36.2 M€' }, result: '+6.6%' },
        usedOn: ['Operations', 'Cost Detail'],
      },
    ],
  },
  {
    label: 'Market Intelligence',
    formulas: [
      {
        id: 'market-index',
        name: 'Potash Market Price Index',
        formula: 'Index = (MOP Vancouver FOB(t) / MOP Vancouver FOB(base)) × 100',
        description: 'Rebased index of the Vancouver MOP FOB spot price. Base period = Jan of current fiscal year. Tracks global potash price momentum relative to budget assumptions.',
        unit: 'Index (Base 100)',
        variables: [
          { symbol: 'MOP Vancouver FOB(t)', name: 'Current MOP spot price', unit: '$/MT', source: 'Argus / CRU / Fertecon' },
          { symbol: 'MOP Vancouver FOB(base)', name: 'Base period MOP price', unit: '$/MT', source: 'Argus (Jan reference)' },
        ],
        example: { inputs: { 'Current MOP': '340 $/MT', 'Base MOP': '302 $/MT' }, result: '112.4' },
        usedOn: ['Dashboard', 'Market Intelligence'],
      },
      {
        id: 'ks-premium',
        name: 'K+S Premium vs. Spot',
        formula: 'Premium % = (K+S Realized Price − MOP Spot) / MOP Spot × 100',
        description: 'K+S pricing premium over commodity spot. Reflects value-add from specialty products (Patentkali®, Epso Top®), customer relationships, and logistics advantages in Europe.',
        unit: '%',
        variables: [
          { symbol: 'K+S Realized Price', name: 'Average realized price K+S', unit: '€/MT', source: 'SAP CO-PA' },
          { symbol: 'MOP Spot', name: 'MOP benchmark price', unit: '€/MT', source: 'Argus (converted to EUR)' },
        ],
        example: { inputs: { 'K+S realized': '345 €/MT', 'MOP spot': '328 €/MT' }, result: '+5.2%' },
        usedOn: ['Market Intelligence'],
      },
      {
        id: 'position-val',
        name: 'Position Valuation (Hedging P&L)',
        formula: 'Position Value = Σ (Forward Price − Strike Price) × Notional Volume',
        description: 'Mark-to-market valuation of all open hedging positions (energy forwards, FX hedges, freight derivatives). Positive = hedge gain protecting margins.',
        unit: 'M€',
        variables: [
          { symbol: 'Forward Price', name: 'Current forward/spot price', unit: '€/unit', source: 'Bloomberg / Reuters' },
          { symbol: 'Strike Price', name: 'Hedge contract strike', unit: '€/unit', source: 'Treasury management system' },
          { symbol: 'Notional Volume', name: 'Hedged quantity', unit: 'MWh/MT/$', source: 'Treasury management system' },
        ],
        example: { inputs: { 'Gas hedge gain': '+2.1 M€', 'FX hedge gain': '+3.2 M€', 'Freight hedge': '+0.5 M€' }, result: '+5.8 M€' },
        usedOn: ['Dashboard'],
      },
      {
        id: 'energy-impact',
        name: 'Energy Cost Impact',
        formula: 'ΔEnergy = (Gas Price(t) − Gas Price(t−1)) × Gas Consumption + (Elec(t) − Elec(t−1)) × Elec Consumption',
        description: 'Total energy cost change in absolute terms. Natural gas (TTF) and electricity are the two primary energy inputs for potash production via hot leaching.',
        unit: 'M€',
        variables: [
          { symbol: 'Gas Price', name: 'Natural Gas TTF front-month', unit: '€/MWh', source: 'Argus / ICIS' },
          { symbol: 'Gas Consumption', name: 'Annual gas consumption', unit: 'MWh', source: 'Plant metering' },
          { symbol: 'Elec', name: 'Electricity wholesale price', unit: '€/MWh', source: 'EPEX Spot / EEX' },
          { symbol: 'Elec Consumption', name: 'Annual electricity consumption', unit: 'MWh', source: 'Plant metering' },
        ],
        example: { inputs: { 'Gas TTF increase': '+4.2 €/MWh', 'Gas consumption': '3.8M MWh', 'Electricity change': '+2.1 €/MWh' }, result: '+18.1 M€' },
        usedOn: ['Market Intelligence', 'SCO Bridge'],
      },
    ],
  },
  {
    label: 'Price Engine — Corridors & Targets',
    formulas: [
      {
        id: 'target-price',
        name: 'Target Price',
        formula: 'Target Price = COGS/MT + Target Margin % × COGS/MT / (1 − Target Margin %)',
        description: 'Minimum price to achieve the target margin corridor. Derived from full production cost plus the desired margin. Reviewed quarterly or when cost inputs change materially.',
        unit: '€/MT or $/MT',
        variables: [
          { symbol: 'COGS/MT', name: 'Full cost per metric ton', unit: '€/MT', source: 'SAP CO (standard cost estimate)' },
          { symbol: 'Target Margin %', name: 'Desired gross margin', unit: '%', source: 'Pricing strategy / management target' },
        ],
        example: { inputs: { 'COGS/MT': '224 €/MT', 'Target Margin': '28%' }, result: '311.1 €/MT → rounded to 312 €/MT' },
        usedOn: ['Price Engine', 'Customer Portfolio'],
      },
      {
        id: 'limit-price',
        name: 'Limit Price (Floor Price)',
        formula: 'Limit Price = COGS/MT + Limit Margin % × COGS/MT / (1 − Limit Margin %)',
        description: 'Absolute floor price below which no sale should be authorized. Transactions below limit price require escalation. Set to cover variable costs plus minimum margin.',
        unit: '€/MT or $/MT',
        variables: [
          { symbol: 'COGS/MT', name: 'Variable cost per metric ton', unit: '€/MT', source: 'SAP CO (variable cost estimate)' },
          { symbol: 'Limit Margin %', name: 'Minimum acceptable margin', unit: '%', source: 'CFO / pricing governance' },
        ],
        example: { inputs: { 'Variable COGS/MT': '195 €/MT', 'Limit Margin': '18%' }, result: '237.8 €/MT → rounded to 260 €/MT (incl. safety buffer)' },
        usedOn: ['Price Engine', 'Customer Portfolio'],
      },
      {
        id: 'anchor-propagation',
        name: 'Anchor Market Propagation',
        formula: 'Linked Price = Anchor Price + Freight Delta + FX Adjustment + Regional Premium/Discount',
        description: 'Linked markets derive their target/limit prices from the anchor market price plus adjustable components for logistics differential, currency conversion, and regional market premium.',
        unit: '€/MT or $/MT',
        variables: [
          { symbol: 'Anchor Price', name: 'Price in the anchor region', unit: '€/MT', source: 'Price Engine (anchor row)' },
          { symbol: 'Freight Delta', name: 'Logistics cost differential', unit: '€/MT', source: 'TMS / freight quotes' },
          { symbol: 'FX Adjustment', name: 'Currency conversion impact', unit: '€/MT', source: 'Treasury (spot or hedge rate)' },
          { symbol: 'Regional Premium', name: 'Market-specific adjustment', unit: '€/MT', source: 'Sales / pricing team input' },
        ],
        example: { inputs: { 'Europe Anchor': '312 €/MT', 'Freight to LatAm': '+45 €/MT', 'FX (EUR→USD)': '−8 €/MT', 'Regional discount': '−15 €/MT' }, result: '334 $/MT' },
        usedOn: ['Price Engine'],
      },
      {
        id: 'price-waterfall',
        name: 'Price Waterfall (Base → Net)',
        formula: 'Net Price = Base Price + List Adj. + Index Adj. + Energy Surcharge − Freight − FX − Conditions − Rebates',
        description: 'Decomposes the current net price into its building blocks. Shows how the base reference price is modified by each pricing component to arrive at the effective price.',
        unit: '€/MT',
        variables: [
          { symbol: 'Base Price', name: 'Reference price from prior period', unit: '€/MT', source: 'Price Engine (prior period net)' },
          { symbol: 'List Adj.', name: 'List price increase/decrease', unit: '€/MT', source: 'Annual price letter' },
          { symbol: 'Index Adj.', name: 'Index-linked price adjustment', unit: '€/MT', source: 'MOP benchmark delta' },
          { symbol: 'Energy Surcharge', name: 'Energy cost pass-through', unit: '€/MT', source: 'Contract energy clause' },
          { symbol: 'Conditions', name: 'Net condition deductions', unit: '€/MT', source: 'SAP SD conditions' },
        ],
        example: { inputs: { 'Base': '320.0', 'List': '+12.5', 'Index': '+4.8', 'Energy': '+3.2', 'Freight': '−2.1', 'FX': '+1.5', 'Conditions': '−5.8', 'Rebates': '−3.4' }, result: '330.7 €/MT' },
        usedOn: ['Price Engine'],
      },
    ],
  },
]

// ---------------------------------------------------------------------------
// Expandable formula card
// ---------------------------------------------------------------------------
function FormulaCard({ formula }: { formula: Formula }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border border-border rounded-xl bg-white overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-5 py-4 flex items-start gap-3 hover:bg-bg-warm/50 transition-colors"
      >
        <span className="mt-0.5 shrink-0 text-text-muted">
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text-primary">{formula.name}</p>
          <p className="text-xs text-text-secondary mt-0.5 font-mono bg-bg-warm/70 inline-block px-2 py-0.5 rounded mt-1">
            {formula.formula}
          </p>
        </div>
        <span className="shrink-0 px-2 py-0.5 bg-primary/8 text-primary text-[10px] font-semibold rounded-full border border-primary/15">
          {formula.unit}
        </span>
      </button>

      {expanded && (
        <div className="px-5 pb-5 pt-0 ml-7 space-y-4">
          {/* Description */}
          <p className="text-xs text-text-secondary leading-relaxed">{formula.description}</p>

          {/* Variables table */}
          <div>
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide mb-2">Variables & Data Sources</p>
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-bg-warm">
                    <th className="text-left px-3 py-2 font-semibold text-text-muted">Variable</th>
                    <th className="text-left px-3 py-2 font-semibold text-text-muted">Description</th>
                    <th className="text-center px-3 py-2 font-semibold text-text-muted">Unit</th>
                    <th className="text-left px-3 py-2 font-semibold text-text-muted">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {formula.variables.map((v, i) => (
                    <tr key={v.symbol} className={i % 2 === 1 ? 'bg-bg/30' : ''}>
                      <td className="px-3 py-2 font-mono font-semibold text-primary">{v.symbol}</td>
                      <td className="px-3 py-2 text-text-primary">{v.name}</td>
                      <td className="px-3 py-2 text-center text-text-secondary">{v.unit}</td>
                      <td className="px-3 py-2 text-text-muted">{v.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Calculation example */}
          <div>
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide mb-2">Calculation Example</p>
            <div className="bg-bg-warm/60 rounded-lg border border-border/70 p-3 flex items-center gap-3 flex-wrap">
              {Object.entries(formula.example.inputs).map(([key, val], i) => (
                <span key={key} className="flex items-center gap-1.5">
                  {i > 0 && <span className="text-text-muted text-xs">·</span>}
                  <span className="text-[11px] text-text-secondary">{key}:</span>
                  <span className="text-[11px] font-mono font-semibold text-text-primary">{val}</span>
                </span>
              ))}
              <ArrowRight className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="px-2.5 py-1 bg-primary/10 border border-primary/20 rounded-lg text-xs font-bold text-primary font-mono">
                {formula.example.result}
              </span>
            </div>
          </div>

          {/* Used on pages */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] text-text-muted font-semibold uppercase tracking-wide">Used on:</span>
            {formula.usedOn.map(page => (
              <span key={page} className="px-2 py-0.5 bg-bg-warm border border-border rounded-full text-[10px] text-text-secondary font-medium">
                {page}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function KpiFormulas() {
  const [expandAll, setExpandAll] = useState(false)
  const totalFormulas = formulaGroups.reduce((s, g) => s + g.formulas.length, 0)

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary">
            KPI Formulas
            <InfoTooltip text="Complete reference of all KPI calculations used across the dashboard. Each formula shows its mathematical definition, input variables, data sources, and a worked example." />
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            {totalFormulas} formulas across {formulaGroups.length} categories — definitions, variables &amp; data sources
          </p>
        </div>
        <button
          onClick={() => setExpandAll(!expandAll)}
          className="px-3 py-1.5 text-xs font-semibold text-primary border border-primary/20 rounded-lg hover:bg-primary/5 transition-colors"
        >
          {expandAll ? 'Collapse All' : 'Expand All'}
        </button>
      </div>

      <div className="space-y-8">
        {formulaGroups.map(group => (
          <div key={group.label}>
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">
              {group.label}
            </h3>
            <div className="space-y-2">
              {group.formulas.map(f => (
                expandAll
                  ? <FormulaCardExpanded key={f.id} formula={f} />
                  : <FormulaCard key={f.id} formula={f} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Always-expanded variant for "Expand All" mode
function FormulaCardExpanded({ formula }: { formula: Formula }) {
  return (
    <div className="border border-border rounded-xl bg-white overflow-hidden">
      <div className="px-5 py-4 flex items-start gap-3">
        <span className="mt-0.5 shrink-0 text-text-muted">
          <ChevronDown className="w-4 h-4" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text-primary">{formula.name}</p>
          <p className="text-xs text-text-secondary mt-0.5 font-mono bg-bg-warm/70 inline-block px-2 py-0.5 rounded mt-1">
            {formula.formula}
          </p>
        </div>
        <span className="shrink-0 px-2 py-0.5 bg-primary/8 text-primary text-[10px] font-semibold rounded-full border border-primary/15">
          {formula.unit}
        </span>
      </div>
      <div className="px-5 pb-5 pt-0 ml-7 space-y-4">
        <p className="text-xs text-text-secondary leading-relaxed">{formula.description}</p>
        <div>
          <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide mb-2">Variables & Data Sources</p>
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-bg-warm">
                  <th className="text-left px-3 py-2 font-semibold text-text-muted">Variable</th>
                  <th className="text-left px-3 py-2 font-semibold text-text-muted">Description</th>
                  <th className="text-center px-3 py-2 font-semibold text-text-muted">Unit</th>
                  <th className="text-left px-3 py-2 font-semibold text-text-muted">Source</th>
                </tr>
              </thead>
              <tbody>
                {formula.variables.map((v, i) => (
                  <tr key={v.symbol} className={i % 2 === 1 ? 'bg-bg/30' : ''}>
                    <td className="px-3 py-2 font-mono font-semibold text-primary">{v.symbol}</td>
                    <td className="px-3 py-2 text-text-primary">{v.name}</td>
                    <td className="px-3 py-2 text-center text-text-secondary">{v.unit}</td>
                    <td className="px-3 py-2 text-text-muted">{v.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide mb-2">Calculation Example</p>
          <div className="bg-bg-warm/60 rounded-lg border border-border/70 p-3 flex items-center gap-3 flex-wrap">
            {Object.entries(formula.example.inputs).map(([key, val], i) => (
              <span key={key} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-text-muted text-xs">·</span>}
                <span className="text-[11px] text-text-secondary">{key}:</span>
                <span className="text-[11px] font-mono font-semibold text-text-primary">{val}</span>
              </span>
            ))}
            <ArrowRight className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="px-2.5 py-1 bg-primary/10 border border-primary/20 rounded-lg text-xs font-bold text-primary font-mono">
              {formula.example.result}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] text-text-muted font-semibold uppercase tracking-wide">Used on:</span>
          {formula.usedOn.map(page => (
            <span key={page} className="px-2 py-0.5 bg-bg-warm border border-border rounded-full text-[10px] text-text-secondary font-medium">
              {page}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
