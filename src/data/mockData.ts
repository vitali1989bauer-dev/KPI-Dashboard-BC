// Mock data for the Pricing Quality Dashboard.
// Static, deterministic, and inline — no backend.

export const QUARTERS = [
  'Q4 2023',
  'Q1 2024',
  'Q2 2024',
  'Q3 2024',
  'Q4 2024',
  'Q1 2025',
  'Q2 2025',
  'Q3 2025',
];

export type Status = 'green' | 'amber' | 'red';
export type Dimension = 'market' | 'performance' | 'operations';

export type KpiId =
  | 'value-fit'
  | 'competitiveness'
  | 'dispersion'
  | 'realization'
  | 'alignment'
  | 'coverage'
  | 'increase-capture'
  | 'conformity'
  | 'override'
  | 'adoption'
  | 'cycle-time';

export type Kpi = {
  id: KpiId;
  dimension: Dimension;
  name: string;
  definition: string;
  formula: string;
  benchmark: string;
  catches: string;
  // Hero rendering
  unit: 'percent' | 'index' | 'days' | 'r2' | 'score';
  hero: string;            // pre-formatted display value, current quarter
  trendDelta: string;      // e.g. "+2.3 pts", "-3.2 pts", "+0.6 d"
  trendDirection: 'up' | 'down';
  trendIsGood: boolean;    // whether the trend direction is favorable
  status: Status;
  // 8-quarter trend (numeric, used for sparkline)
  history: number[];
};

export const KPIS: Kpi[] = [
  // ── Market Signals ────────────────────────────────────────────────
  {
    id: 'value-fit',
    dimension: 'market',
    name: 'Price–value fit',
    definition: 'Whether customers perceive prices as justified by the value delivered.',
    formula: 'Composite of win rate, churn rate, and willingness-to-pay studies, segmented.',
    benchmark: '> 75 composite, dots clustering on the fair-value line',
    catches: 'Revenue can grow even when customers feel overcharged — until they leave.',
    unit: 'score',
    hero: '72',
    trendDelta: '−1.5 pts',
    trendDirection: 'down',
    trendIsGood: false,
    status: 'amber',
    history: [76.1, 75.4, 75.0, 74.6, 74.2, 73.8, 73.5, 72.0],
  },
  {
    id: 'competitiveness',
    dimension: 'market',
    name: 'Price Competitiveness Index',
    definition: 'Net price relative to a competitor benchmark, by segment.',
    formula: '(Net price ÷ Benchmark net price) × 100',
    benchmark: '95–105 across segments (within ±5% band)',
    catches: 'Margin can hold while you quietly drift above or below the market.',
    unit: 'index',
    hero: '102',
    trendDelta: '+0.8 pts',
    trendDirection: 'up',
    trendIsGood: true,
    status: 'green',
    history: [99.5, 100.2, 100.6, 101.0, 101.1, 101.3, 101.4, 102.2],
  },
  {
    id: 'dispersion',
    dimension: 'market',
    name: 'Cross-country dispersion',
    definition: 'Spread of net prices for the same product across markets.',
    formula: '(Max − min net price) ÷ mean, normalized',
    benchmark: '< 15% for like-for-like SKUs',
    catches: 'Arbitrage and grey-market flows that revenue numbers never surface.',
    unit: 'percent',
    hero: '18%',
    trendDelta: '−2.1 pts',
    trendDirection: 'down',
    trendIsGood: true,
    status: 'amber',
    history: [22.8, 22.1, 21.4, 21.0, 20.4, 19.6, 18.9, 18.0],
  },

  // ── Price Performance ────────────────────────────────────────────
  {
    id: 'realization',
    dimension: 'performance',
    name: 'Realization rate',
    definition: 'Share of intended gross price that lands as invoice net.',
    formula: 'Invoice net ÷ Intended gross',
    benchmark: '> 88%, trending up',
    catches: 'Revenue and gross margin both look fine while leakage hides in rebates and freight.',
    unit: 'percent',
    hero: '87.3%',
    trendDelta: '−3.2 pts',
    trendDirection: 'down',
    trendIsGood: false,
    status: 'amber',
    history: [90.1, 90.4, 90.0, 89.6, 89.2, 88.7, 88.0, 87.3],
  },
  {
    id: 'alignment',
    dimension: 'performance',
    name: 'Price–performance alignment',
    definition: 'Whether pricing terms reflect customer performance, not negotiation power.',
    formula: 'Correlation: customer performance tier ↔ net price (R²)',
    benchmark: 'R² > 0.6',
    catches: 'Top customers quietly subsidize loud ones.',
    unit: 'r2',
    hero: 'R² 0.41',
    trendDelta: '−0.04',
    trendDirection: 'down',
    trendIsGood: false,
    status: 'amber',
    history: [0.52, 0.50, 0.49, 0.47, 0.46, 0.44, 0.43, 0.41],
  },
  {
    id: 'coverage',
    dimension: 'performance',
    name: 'Pricing coverage',
    definition: 'Share of revenue / SKUs / customers governed by pricing logic.',
    formula: 'Revenue under governance ÷ Total revenue',
    benchmark: '> 80% revenue under governance',
    catches: 'The 18% you don\'t govern is where the next surprise comes from.',
    unit: 'percent',
    hero: '82%',
    trendDelta: '+4.0 pts',
    trendDirection: 'up',
    trendIsGood: true,
    status: 'green',
    history: [70.0, 72.5, 74.0, 75.5, 77.0, 78.5, 80.5, 82.0],
  },
  {
    id: 'increase-capture',
    dimension: 'performance',
    name: 'Price increase capture',
    definition: '% of announced list increase that lands in net.',
    formula: 'Δ Net price ÷ Δ List price',
    benchmark: '> 75% capture in 2 quarters',
    catches: 'List goes up, net doesn\'t — and nobody notices for two quarters.',
    unit: 'percent',
    hero: '68%',
    trendDelta: '−5.0 pts',
    trendDirection: 'down',
    trendIsGood: false,
    status: 'amber',
    history: [78, 76, 75, 74, 73, 71, 70, 68],
  },

  // ── Price Operations ─────────────────────────────────────────────
  {
    id: 'conformity',
    dimension: 'operations',
    name: 'Conformity to price logic',
    definition: 'Share of transactions priced within the defined corridor.',
    formula: 'Transactions within corridor ÷ Total transactions',
    benchmark: '> 85%',
    catches: 'A pricing model is only as good as the quotes that obey it.',
    unit: 'percent',
    hero: '78%',
    trendDelta: '+1.2 pts',
    trendDirection: 'up',
    trendIsGood: true,
    status: 'amber',
    history: [73, 74, 74, 75, 76, 76, 77, 78],
  },
  {
    id: 'override',
    dimension: 'operations',
    name: 'Override / exception rate',
    definition: 'Frequency of off-policy pricing decisions.',
    formula: 'Override transactions ÷ Total transactions',
    benchmark: '< 8%',
    catches: 'Exceptions are how the price logic dies one quote at a time.',
    unit: 'percent',
    hero: '12.4%',
    trendDelta: '+2.3 pts',
    trendDirection: 'up',
    trendIsGood: false,
    status: 'red',
    history: [8.0, 8.4, 9.0, 9.5, 10.1, 10.8, 11.5, 12.4],
  },
  {
    id: 'adoption',
    dimension: 'operations',
    name: 'Adoption / trust index',
    definition: 'Whether the front line uses and trusts the pricing tools.',
    formula: 'Composite: tool usage % + pulse-survey trust score',
    benchmark: '> 80 composite, with usage above 75%',
    catches: 'A great tool nobody opens has zero value, no matter the dashboard.',
    unit: 'score',
    hero: '71',
    trendDelta: '+3.0 pts',
    trendDirection: 'up',
    trendIsGood: true,
    status: 'amber',
    history: [62, 63, 64, 66, 67, 68, 69, 71],
  },
  {
    id: 'cycle-time',
    dimension: 'operations',
    name: 'Decision cycle time',
    definition: 'Friction in the pricing decision process.',
    formula: 'Median time from quote request → approved price (days)',
    benchmark: '< 2 days median, < 5 days p90',
    catches: 'Slow quotes lose deals before any margin shows up.',
    unit: 'days',
    hero: '4.8 d',
    trendDelta: '+0.6 d',
    trendDirection: 'up',
    trendIsGood: false,
    status: 'red',
    history: [3.6, 3.7, 3.9, 4.0, 4.2, 4.4, 4.5, 4.8],
  },
];

export const DIMENSIONS: { id: Dimension; name: string; question: string }[] = [
  {
    id: 'market',
    name: 'Market Signals',
    question: 'Are our prices aligned with value and the market?',
  },
  {
    id: 'performance',
    name: 'Price Performance',
    question: 'Does our pricing deliver what we intended?',
  },
  {
    id: 'operations',
    name: 'Price Operations',
    question: 'Do daily decisions follow the price logic?',
  },
];

export function kpisFor(dim: Dimension): Kpi[] {
  return KPIS.filter((k) => k.dimension === dim);
}

// ────────────────────────────────────────────────────────────────────
// Per-KPI detail data sets for the expanded views
// ────────────────────────────────────────────────────────────────────

export const SEGMENTS = ['Enterprise', 'Mid-market', 'Channel', 'Long tail'] as const;
export const COUNTRIES = ['Germany', 'France', 'Italy', 'Spain', 'Poland', 'UK'] as const;
export const BUSINESS_UNITS = ['Industrial Components', 'Process Chemicals', 'Specialty Coatings', 'Aftermarket'] as const;
export const PRODUCT_FAMILIES = ['Bearings', 'Seals', 'Lubricants', 'Coatings', 'Aftermarket Kits'] as const;

// 1. Price–value fit — scatter of perceived value vs net price by segment
export const valueFitData: { segment: string; perceivedValue: number; netPrice: number; revenue: number }[] = [
  // Enterprise — mostly fair, slight overpricing on a few
  { segment: 'Enterprise', perceivedValue: 88, netPrice: 92, revenue: 28 },
  { segment: 'Enterprise', perceivedValue: 82, netPrice: 80, revenue: 22 },
  { segment: 'Enterprise', perceivedValue: 75, netPrice: 84, revenue: 19 },
  { segment: 'Enterprise', perceivedValue: 90, netPrice: 88, revenue: 31 },
  { segment: 'Enterprise', perceivedValue: 70, netPrice: 78, revenue: 14 },
  // Mid-market — generally fair
  { segment: 'Mid-market', perceivedValue: 64, netPrice: 60, revenue: 12 },
  { segment: 'Mid-market', perceivedValue: 58, netPrice: 62, revenue: 10 },
  { segment: 'Mid-market', perceivedValue: 71, netPrice: 68, revenue: 15 },
  { segment: 'Mid-market', perceivedValue: 55, netPrice: 58, revenue: 8 },
  { segment: 'Mid-market', perceivedValue: 67, netPrice: 65, revenue: 11 },
  // Channel — under-priced cluster
  { segment: 'Channel', perceivedValue: 62, netPrice: 48, revenue: 18 },
  { segment: 'Channel', perceivedValue: 55, netPrice: 42, revenue: 13 },
  { segment: 'Channel', perceivedValue: 70, netPrice: 56, revenue: 21 },
  { segment: 'Channel', perceivedValue: 50, netPrice: 40, revenue: 9 },
  // Long tail — over-priced cluster
  { segment: 'Long tail', perceivedValue: 35, netPrice: 52, revenue: 5 },
  { segment: 'Long tail', perceivedValue: 40, netPrice: 58, revenue: 6 },
  { segment: 'Long tail', perceivedValue: 30, netPrice: 48, revenue: 4 },
  { segment: 'Long tail', perceivedValue: 45, netPrice: 60, revenue: 7 },
];

// 2. Price Competitiveness Index — your price vs benchmark, by segment
export const competitivenessData = [
  { segment: 'Enterprise', yours: 104, benchmark: 100 },
  { segment: 'Mid-market', yours: 102, benchmark: 100 },
  { segment: 'Channel', yours: 96, benchmark: 100 },
  { segment: 'Long tail', yours: 108, benchmark: 100 },
];

// 3. Cross-country dispersion — net price index by country, mean = 100
export const dispersionData = [
  { country: 'Germany', netPrice: 108 },
  { country: 'France', netPrice: 104 },
  { country: 'UK', netPrice: 102 },
  { country: 'Italy', netPrice: 98 },
  { country: 'Spain', netPrice: 94 },
  { country: 'Poland', netPrice: 88 },
];

// 4. Realization rate — waterfall from intended gross to invoice net
// Each step's "value" is the running total after that deduction (€M).
export const realizationWaterfall = [
  { name: 'Intended gross', value: 100, delta: 100, type: 'start' as const },
  { name: 'Discount', value: 94.2, delta: -5.8, type: 'down' as const },
  { name: 'Rebate', value: 91.0, delta: -3.2, type: 'down' as const },
  { name: 'Freight', value: 89.1, delta: -1.9, type: 'down' as const },
  { name: 'Terms', value: 87.3, delta: -1.8, type: 'down' as const },
  { name: 'Invoice net', value: 87.3, delta: 87.3, type: 'end' as const },
];

// 5. Price–performance alignment — customer perf score vs net price, with regression
export const alignmentData = (() => {
  const pts: { perf: number; netPrice: number }[] = [];
  // Loose linear relationship with noise — gives R² ~ 0.41
  const seedNoise = [
    -8, 6, -3, 10, -12, 4, -6, 9, -1, 7, -10, 5, -4, 8, -7, 2, -9, 6, -5, 3,
    1, -2, 11, -8, 4, -6, 9, -3, 7, -10, 2, -5,
  ];
  for (let i = 0; i < 32; i++) {
    const perf = 30 + (i * 70) / 31; // 30..100
    const base = 40 + perf * 0.55;
    pts.push({ perf: Math.round(perf), netPrice: Math.round(base + seedNoise[i]) });
  }
  return pts;
})();

// 6. Pricing coverage — donut
export const coverageData = [
  { name: 'Under governance', value: 82 },
  { name: 'Off-system', value: 18 },
];

// 7. Price increase capture — by product family
export const increaseCaptureData = [
  { family: 'Bearings',        announced: 6.0, realized: 4.8 },
  { family: 'Seals',           announced: 5.0, realized: 3.4 },
  { family: 'Lubricants',      announced: 4.5, realized: 3.6 },
  { family: 'Coatings',        announced: 6.5, realized: 3.0 },
  { family: 'Aftermarket Kits',announced: 5.5, realized: 4.7 },
];

// 8. Conformity to price logic — per business unit (% within / above / below corridor)
export const conformityData = [
  { unit: 'Industrial Components', within: 84, above: 8,  below: 8  },
  { unit: 'Process Chemicals',     within: 76, above: 14, below: 10 },
  { unit: 'Specialty Coatings',    within: 68, above: 11, below: 21 },
  { unit: 'Aftermarket',           within: 82, above: 6,  below: 12 },
];

// 9. Override / exception rate — by reason code
export const overrideData = [
  { reason: 'Strategic deal',      count: 28 },
  { reason: 'Competitive match',   count: 24 },
  { reason: 'Volume commitment',   count: 18 },
  { reason: 'Channel conflict',    count: 12 },
  { reason: 'Legacy contract',     count: 9  },
  { reason: 'Manager discretion',  count: 6  },
  { reason: 'Other',               count: 3  },
];

// 10. Adoption / trust — usage line + pulse survey histogram
export const adoptionUsage = QUARTERS.map((q, i) => ({
  quarter: q,
  usage: [55, 58, 60, 63, 65, 67, 70, 73][i],
}));
export const adoptionPulse = [
  { score: '1', count: 4 },
  { score: '2', count: 8 },
  { score: '3', count: 22 },
  { score: '4', count: 38 },
  { score: '5', count: 28 },
];

// 11. Decision cycle time — histogram in days
export const cycleTimeBins = [
  { bin: '0–1', count: 6  },
  { bin: '1–2', count: 12 },
  { bin: '2–3', count: 18 },
  { bin: '3–4', count: 22 },
  { bin: '4–5', count: 19 },
  { bin: '5–7', count: 14 },
  { bin: '7–10', count: 7 },
  { bin: '10+', count: 4  },
];
export const cycleTimeStats = { median: 4.8, p90: 8.6 };

// ────────────────────────────────────────────────────────────────────
// Per-tile mini-viz config (used by KpiTile to vary the visual treatment)
// ────────────────────────────────────────────────────────────────────

export type TileViz =
  | { kind: 'ring'; value: number; max: number; target: number; centerLabel: string }
  | { kind: 'barToTarget'; value: number; target: number; min: number; max: number; bandLow?: number; bandHigh?: number }
  | { kind: 'distribution'; bars: { label: string; value: number }[]; highlightIndex?: number; baseline?: number }
  | { kind: 'scatterMini'; points: { x: number; y: number }[]; regression: { slope: number; intercept: number; xMin: number; xMax: number } };

export const tileVizFor: Record<KpiId, TileViz> = {
  // Ring tiles — bounded scores / percent, ring fills to value.
  // centerLabel is only set when the hero string has no unit (so we don't double-print "%").
  'value-fit':       { kind: 'ring', value: 72,   max: 100, target: 75, centerLabel: '/100' },
  'coverage':        { kind: 'ring', value: 82,   max: 100, target: 80, centerLabel: '' },
  'realization':     { kind: 'ring', value: 87.3, max: 100, target: 88, centerLabel: '' },
  'conformity':      { kind: 'ring', value: 78,   max: 100, target: 85, centerLabel: '' },
  'adoption':        { kind: 'ring', value: 71,   max: 100, target: 80, centerLabel: '/100' },

  // Bar-to-target tiles — comparison to benchmark / band
  'competitiveness': { kind: 'barToTarget', value: 102, target: 100, min: 85, max: 115, bandLow: 95, bandHigh: 105 },
  'increase-capture':{ kind: 'barToTarget', value: 68,  target: 75,  min: 0,  max: 100 },

  // Distribution tiles — shape matters
  'cycle-time': {
    kind: 'distribution',
    bars: cycleTimeBins.map((b) => ({ label: b.bin, value: b.count })),
    highlightIndex: 4, // 4–5 bin contains the 4.8 median
  },
  'dispersion': {
    kind: 'distribution',
    bars: dispersionData.map((d) => ({ label: d.country.slice(0, 3), value: d.netPrice })),
    baseline: 100,
  },
  'override': {
    kind: 'distribution',
    bars: overrideData.slice(0, 5).map((o) => ({ label: o.reason.split(' ')[0], value: o.count })),
    highlightIndex: 0,
  },

  // Mini-scatter — R² with trend line
  'alignment': (() => {
    // Subsample to ~14 points for legibility at small size
    const step = Math.max(1, Math.floor(alignmentData.length / 14));
    const pts = alignmentData.filter((_, i) => i % step === 0).map((p) => ({ x: p.perf, y: p.netPrice }));
    // Pre-computed least-squares fit on the full set
    const xs = alignmentData.map((p) => p.perf);
    const ys = alignmentData.map((p) => p.netPrice);
    const n = xs.length;
    const mx = xs.reduce((a, b) => a + b, 0) / n;
    const my = ys.reduce((a, b) => a + b, 0) / n;
    let num = 0, den = 0;
    for (let i = 0; i < n; i++) {
      num += (xs[i] - mx) * (ys[i] - my);
      den += (xs[i] - mx) ** 2;
    }
    const slope = num / den;
    const intercept = my - slope * mx;
    return { kind: 'scatterMini' as const, points: pts, regression: { slope, intercept, xMin: Math.min(...xs), xMax: Math.max(...xs) } };
  })(),
};
