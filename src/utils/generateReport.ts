import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Filters } from '../data/mockData'
import {
  getTopKpis,
  getScoWaterfallData,
  getPricingDeepDiveData,
  getConditionBreakdown,
  getNetRevenueWaterfall,
  getCostDeepDiveData,
  getProductionSites,
  getProductScoContribution,
  getBenchmarkData,
  getInputCostData,
  getFxData,
  getPriceAlerts,
  getPriceEngineRows,
} from '../data/mockData'

// ---------------------------------------------------------------------------
// K+S brand colors
// ---------------------------------------------------------------------------
type RGB = [number, number, number]
const PRIMARY: RGB = [23, 59, 122]    // #173B7A
const DARK: RGB = [15, 38, 84]        // #0f2654
const POSITIVE: RGB = [26, 135, 84]   // #1a8754
const NEGATIVE: RGB = [196, 62, 62]   // #c43e3e
const WARNING: RGB = [212, 154, 26]   // #d49a1a
const GREY: RGB = [100, 116, 139]     // #64748b
const LIGHT_BG: RGB = [244, 246, 248] // #f4f6f8
const WHITE: RGB = [255, 255, 255]

function setFC(doc: jsPDF, c: RGB) { doc.setFillColor(c[0], c[1], c[2]) }
function setTC(doc: jsPDF, c: RGB) { doc.setTextColor(c[0], c[1], c[2]) }
function setDC(doc: jsPDF, c: RGB) { doc.setDrawColor(c[0], c[1], c[2]) }

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatNum(n: number, decimals = 1): string {
  return n.toFixed(decimals)
}

function fmtK(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(0)}k` : String(n)
}

function statusColor(status: string): [number, number, number] {
  if (status === 'positive') return POSITIVE
  if (status === 'negative') return NEGATIVE
  if (status === 'warning') return WARNING
  return GREY
}

function addPageFooter(doc: jsPDF, pageNum: number, totalPages: number, date: string) {
  const w = doc.internal.pageSize.getWidth()
  const h = doc.internal.pageSize.getHeight()
  setDC(doc, LIGHT_BG)
  doc.line(20, h - 18, w - 20, h - 18)
  doc.setFontSize(7.5)
  setTC(doc, GREY)
  doc.text('K+S AgriMetrics — Confidential', 20, h - 12)
  doc.text(`Generated ${date}`, w / 2, h - 12, { align: 'center' })
  doc.text(`Page ${pageNum} of ${totalPages}`, w - 20, h - 12, { align: 'right' })
}

function sectionTitle(doc: jsPDF, y: number, title: string, subtitle?: string): number {
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  setTC(doc, DARK)
  doc.text(title, 20, y)
  if (subtitle) {
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    setTC(doc, GREY)
    doc.text(subtitle, 20, y + 5)
    return y + 12
  }
  return y + 7
}

function checkPageBreak(doc: jsPDF, y: number, needed: number): number {
  const h = doc.internal.pageSize.getHeight()
  if (y + needed > h - 25) {
    doc.addPage()
    return 25
  }
  return y
}

// ---------------------------------------------------------------------------
// Main PDF generation
// ---------------------------------------------------------------------------
export async function generateManagementReport(filters: Filters): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const w = doc.internal.pageSize.getWidth()
  const now = new Date()
  const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

  // =========================================================================
  // PAGE 1 — Cover
  // =========================================================================
  // Dark header band
  setFC(doc, DARK)
  doc.rect(0, 0, w, 105, 'F')

  // Accent stripe
  setFC(doc, PRIMARY)
  doc.rect(0, 105, w, 3, 'F')

  // Title block
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(255, 255, 255, 0.5)
  doc.text('K+S AGRIMETRICS', 20, 35)

  doc.setFontSize(28)
  doc.setFont('helvetica', 'bold')
  setTC(doc, WHITE)
  doc.text('Management Report', 20, 52)

  doc.setFontSize(14)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(200, 210, 230)
  doc.text('Fertilizer & Salt KPI Dashboard', 20, 63)

  // Date + filter context
  doc.setFontSize(10)
  doc.setTextColor(160, 175, 200)
  doc.text(`${dateStr} · ${timeStr}`, 20, 80)

  // Active filters
  const activeFilters: string[] = []
  if (filters.timePeriod !== 'YTD') activeFilters.push(`Period: ${filters.timePeriod}`)
  if (!filters.region.startsWith('All')) activeFilters.push(`Region: ${filters.region}`)
  if (!filters.cluster.startsWith('All')) activeFilters.push(`Cluster: ${filters.cluster}`)
  if (!filters.segment.startsWith('All')) activeFilters.push(`Segment: ${filters.segment}`)
  if (!filters.customer.startsWith('All')) activeFilters.push(`Customer: ${filters.customer}`)
  if (!filters.archetype.startsWith('All')) activeFilters.push(`Archetype: ${filters.archetype}`)
  if (!filters.product.startsWith('All')) activeFilters.push(`Product: ${filters.product}`)

  doc.setFontSize(9)
  doc.setTextColor(140, 160, 190)
  if (activeFilters.length > 0) {
    doc.text(`Filters: ${activeFilters.join(' | ')}`, 20, 92)
  } else {
    doc.text('Filters: All (no filters applied)', 20, 92)
  }

  // Table of contents
  let y = 125
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  setTC(doc, DARK)
  doc.text('Report Contents', 20, y)
  y += 10

  const tocItems = [
    '1.  Executive Summary — Key Performance Indicators',
    '2.  SCO Bridge — Waterfall Decomposition',
    '3.  Product Portfolio — Pricing & Margins',
    '4.  Revenue Waterfall — Gross-to-Net',
    '5.  Condition Spending — Budget vs. Actual',
    '6.  Production & Operations',
    '7.  Market Intelligence — Benchmarks & FX',
    '8.  Price Alerts & Risk Summary',
    '9.  Price Engine — Regional Pricing Overview',
  ]
  doc.setFontSize(9.5)
  doc.setFont('helvetica', 'normal')
  setTC(doc, GREY)
  for (const item of tocItems) {
    doc.text(item, 24, y)
    y += 6.5
  }

  // Confidentiality notice
  doc.setFontSize(7.5)
  doc.setTextColor(180, 180, 180)
  doc.text('CONFIDENTIAL — For internal K+S management use only. Do not distribute externally.', 20, 260)
  doc.text('Data sourced from SAP, Argus, and internal planning systems.', 20, 265)

  // =========================================================================
  // PAGE 2 — Executive Summary KPIs
  // =========================================================================
  doc.addPage()
  y = 25
  y = sectionTitle(doc, y, '1. Executive Summary', `Key Performance Indicators · ${filters.timePeriod}`)
  y += 4

  const kpis = getTopKpis(filters)

  // KPI cards as a grid (2 cols × 4 rows)
  const cardW = (w - 50) / 2
  const cardH = 22
  const cardGap = 4

  kpis.forEach((kpi, i) => {
    const col = i % 2
    const row = Math.floor(i / 2)
    const cx = 20 + col * (cardW + cardGap * 2)
    const cy = y + row * (cardH + cardGap)

    // Card background
    setFC(doc, LIGHT_BG)
    doc.roundedRect(cx, cy, cardW, cardH, 2, 2, 'F')

    // Left accent bar
    const sc = statusColor(kpi.status)
    setFC(doc, sc)
    doc.rect(cx, cy + 3, 1.5, cardH - 6, 'F')

    // Title
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    setTC(doc, GREY)
    doc.text(kpi.title.toUpperCase(), cx + 5, cy + 6)

    // Value
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    setTC(doc, DARK)
    const valStr = typeof kpi.value === 'number' ? formatNum(kpi.value) : String(kpi.value)
    doc.text(`${valStr} ${kpi.unit}`, cx + 5, cy + 14)

    // Change badge
    if (kpi.change !== undefined) {
      const chColor = kpi.change >= 0 ? POSITIVE : NEGATIVE
      doc.setFontSize(7.5)
      doc.setFont('helvetica', 'bold')
      setTC(doc, chColor)
      doc.text(`${kpi.change >= 0 ? '+' : ''}${kpi.change}%`, cx + cardW - 8, cy + 7, { align: 'right' })
    }

    // Subtitle
    if (kpi.subtitle) {
      doc.setFontSize(6.5)
      doc.setFont('helvetica', 'normal')
      setTC(doc, GREY)
      doc.text(kpi.subtitle, cx + 5, cy + 19)
    }
  })

  y += 4 * (cardH + cardGap) + 8

  // Product SCO contribution table
  y = checkPageBreak(doc, y, 65)
  y = sectionTitle(doc, y, 'Product SCO Contribution', 'Contribution by product to total SCO')
  y += 2

  const products = getProductScoContribution(filters)
  autoTable(doc, {
    startY: y,
    head: [['Product', 'SCO/MT (€)', 'Volume (MT)', 'Total SCO (M€)', 'Share (%)', 'vs LY (%)']],
    body: products.map(p => [
      p.product,
      formatNum(p.scoPerMT),
      p.volumeMT.toLocaleString(),
      formatNum(p.totalScoM),
      formatNum(p.shareOfTotal),
      `${p.vsLY >= 0 ? '+' : ''}${formatNum(p.vsLY)}`,
    ]),
    theme: 'grid',
    styles: { fontSize: 7.5, cellPadding: 2, lineColor: [213, 219, 227], lineWidth: 0.2 },
    headStyles: { fillColor: PRIMARY, textColor: WHITE, fontStyle: 'bold', fontSize: 7 },
    alternateRowStyles: { fillColor: [249, 250, 252] },
    columnStyles: {
      1: { halign: 'right' },
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right' },
      5: { halign: 'right' },
    },
    margin: { left: 20, right: 20 },
  })

  // =========================================================================
  // PAGE 3 — SCO Bridge
  // =========================================================================
  doc.addPage()
  y = 25
  y = sectionTitle(doc, y, '2. SCO Bridge — Waterfall Decomposition', 'Year-over-year SCO/MT change by driver')
  y += 4

  const waterfall = getScoWaterfallData(filters)

  // Draw waterfall as horizontal bar chart
  const barAreaX = 55
  const barAreaW = w - 75
  const barH = 8
  const barGap = 3

  // Find the range for scaling
  const allValues = waterfall.map(w => w.value)
  const maxVal = Math.max(...allValues)
  const minVal = Math.min(...allValues)
  const range = maxVal - minVal
  const scale = barAreaW / (range * 1.2)

  waterfall.forEach((item, i) => {
    const by = y + i * (barH + barGap)

    // Label
    doc.setFontSize(7.5)
    doc.setFont('helvetica', item.type === 'start' || item.type === 'end' ? 'bold' : 'normal')
    setTC(doc, DARK)
    const label = item.name.replace('\n', ' ')
    doc.text(label, barAreaX - 3, by + 5.5, { align: 'right' })

    // Bar
    let color: [number, number, number]
    if (item.type === 'start' || item.type === 'end') color = PRIMARY
    else if (item.type === 'positive') color = POSITIVE
    else color = NEGATIVE

    setFC(doc, color)
    if (item.type === 'start' || item.type === 'end') {
      const bw = Math.abs(item.value) * scale * 0.7
      doc.roundedRect(barAreaX, by, bw, barH, 1, 1, 'F')
      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      setTC(doc, WHITE)
      doc.text(`${formatNum(item.value)} €/MT`, barAreaX + bw / 2, by + 5.5, { align: 'center' })
    } else {
      const bw = Math.abs(item.value) * scale * 2.5
      doc.roundedRect(barAreaX, by, Math.max(bw, 3), barH, 1, 1, 'F')
      doc.setFontSize(7.5)
      doc.setFont('helvetica', 'bold')
      setTC(doc, color)
      doc.text(`${item.value >= 0 ? '+' : ''}${formatNum(item.value)}`, barAreaX + bw + 3, by + 5.5)
    }
  })

  y += waterfall.length * (barH + barGap) + 10

  // Summary text
  const startVal = waterfall.find(w => w.type === 'start')?.value || 0
  const endVal = waterfall.find(w => w.type === 'end')?.value || 0
  const delta = endVal - startVal
  y = checkPageBreak(doc, y, 20)
  setFC(doc, delta >= 0 ? [230, 247, 237] : [253, 232, 232])
  doc.roundedRect(20, y, w - 40, 14, 2, 2, 'F')
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  setTC(doc, delta >= 0 ? POSITIVE : NEGATIVE)
  doc.text(`Net SCO/MT Change: ${delta >= 0 ? '+' : ''}${formatNum(delta)} EUR/MT  (${formatNum(startVal)} to ${formatNum(endVal)} EUR/MT)`, w / 2, y + 9, { align: 'center' })

  // =========================================================================
  // PAGE 4 — Product Pricing + Revenue Waterfall
  // =========================================================================
  doc.addPage()
  y = 25
  y = sectionTitle(doc, y, '3. Product Portfolio — Pricing & Margins', 'Average realized prices and gross margins by product')
  y += 2

  const pricing = getPricingDeepDiveData(filters)
  autoTable(doc, {
    startY: y,
    head: [['Product', 'Avg Price (EUR/MT)', 'vs LY (%)', 'Margin (%)', 'Margin Chg (pp)', 'Volume (MT)']],
    body: pricing.map(p => [
      p.segment,
      formatNum(p.avgPrice),
      `${p.priceVsLY >= 0 ? '+' : ''}${formatNum(p.priceVsLY)}`,
      formatNum(p.margin),
      `${p.marginVsLY >= 0 ? '+' : ''}${formatNum(p.marginVsLY)}`,
      p.volume.toLocaleString(),
    ]),
    theme: 'grid',
    styles: { fontSize: 7.5, cellPadding: 2, lineColor: [213, 219, 227], lineWidth: 0.2 },
    headStyles: { fillColor: PRIMARY, textColor: WHITE, fontStyle: 'bold', fontSize: 7 },
    alternateRowStyles: { fillColor: [249, 250, 252] },
    columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right' }, 5: { halign: 'right' } },
    margin: { left: 20, right: 20 },
  })

  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12

  // Net revenue waterfall
  y = checkPageBreak(doc, y, 50)
  y = sectionTitle(doc, y, '4. Revenue Waterfall — Gross-to-Net', 'Revenue deductions from gross to net')
  y += 2

  const netWf = getNetRevenueWaterfall(filters)
  autoTable(doc, {
    startY: y,
    head: [['Component', 'Amount (M€)', 'Type']],
    body: netWf.map(step => [
      step.name,
      `${step.type === 'negative' ? '−' : ''}${formatNum(Math.abs(step.value))}`,
      step.type === 'start' ? 'Starting' : step.type === 'end' ? 'Result' : step.type === 'positive' ? 'Addition' : 'Deduction',
    ]),
    theme: 'grid',
    styles: { fontSize: 7.5, cellPadding: 2, lineColor: [213, 219, 227], lineWidth: 0.2 },
    headStyles: { fillColor: PRIMARY, textColor: WHITE, fontStyle: 'bold', fontSize: 7 },
    alternateRowStyles: { fillColor: [249, 250, 252] },
    columnStyles: { 1: { halign: 'right' } },
    margin: { left: 20, right: 20 },
    didParseCell: (data) => {
      if (data.section === 'body' && data.row.index === 0) {
        data.cell.styles.fontStyle = 'bold'
      }
      if (data.section === 'body' && data.row.index === netWf.length - 1) {
        data.cell.styles.fontStyle = 'bold'
        data.cell.styles.fillColor = [230, 237, 247]
      }
    },
  })

  // =========================================================================
  // PAGE 5 — Conditions + Costs
  // =========================================================================
  doc.addPage()
  y = 25
  y = sectionTitle(doc, y, '5. Condition Spending — Budget vs. Actual', 'Commercial condition spend by type')
  y += 2

  const conditions = getConditionBreakdown(filters)
  autoTable(doc, {
    startY: y,
    head: [['Condition Type', 'Actual (M€)', 'Budget (M€)', 'Variance (%)', '% of Revenue']],
    body: conditions.map(c => [
      c.type,
      formatNum(c.actual),
      formatNum(c.budget),
      `${c.variancePct >= 0 ? '+' : ''}${formatNum(c.variancePct)}`,
      formatNum(c.shareOfRevenue),
    ]),
    theme: 'grid',
    styles: { fontSize: 7.5, cellPadding: 2, lineColor: [213, 219, 227], lineWidth: 0.2 },
    headStyles: { fillColor: PRIMARY, textColor: WHITE, fontStyle: 'bold', fontSize: 7 },
    alternateRowStyles: { fillColor: [249, 250, 252] },
    columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right' } },
    margin: { left: 20, right: 20 },
  })

  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12

  // Cost deep-dive
  y = checkPageBreak(doc, y, 50)
  y = sectionTitle(doc, y, '6. Production & Operations — Cost Analysis', 'Cost by category vs. budget')
  y += 2

  const costs = getCostDeepDiveData(filters)
  autoTable(doc, {
    startY: y,
    head: [['Cost Category', 'Actual (M€)', 'Budget (M€)', 'Variance (M€)', 'Variance (%)']],
    body: costs.map(c => [
      c.category,
      formatNum(c.actual),
      formatNum(c.budget),
      `${c.variance >= 0 ? '+' : ''}${formatNum(c.variance)}`,
      `${c.variancePct >= 0 ? '+' : ''}${formatNum(c.variancePct)}`,
    ]),
    theme: 'grid',
    styles: { fontSize: 7.5, cellPadding: 2, lineColor: [213, 219, 227], lineWidth: 0.2 },
    headStyles: { fillColor: PRIMARY, textColor: WHITE, fontStyle: 'bold', fontSize: 7 },
    alternateRowStyles: { fillColor: [249, 250, 252] },
    columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right' } },
    margin: { left: 20, right: 20 },
    didParseCell: (data) => {
      // Color variance cells
      if (data.section === 'body' && (data.column.index === 3 || data.column.index === 4)) {
        const raw = costs[data.row.index]
        if (raw && raw.variance > 0) data.cell.styles.textColor = NEGATIVE
        else if (raw && raw.variance < 0) data.cell.styles.textColor = POSITIVE
      }
    },
  })

  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6

  // Totals row
  const totalActual = costs.reduce((s, c) => s + c.actual, 0)
  const totalBudget = costs.reduce((s, c) => s + c.budget, 0)
  const totalVar = totalActual - totalBudget
  y = checkPageBreak(doc, y, 12)
  setFC(doc, LIGHT_BG)
  doc.roundedRect(20, y, w - 40, 10, 1.5, 1.5, 'F')
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  setTC(doc, DARK)
  doc.text(`Total: ${formatNum(totalActual)} M€ actual vs ${formatNum(totalBudget)} M€ budget`, 25, y + 6.5)
  setTC(doc, totalVar > 0 ? NEGATIVE : POSITIVE)
  doc.text(`Variance: ${totalVar > 0 ? '+' : ''}${formatNum(totalVar)} M€ (${((totalVar / totalBudget) * 100).toFixed(1)}%)`, w - 25, y + 6.5, { align: 'right' })

  y += 18

  // Production sites
  y = checkPageBreak(doc, y, 50)
  y = sectionTitle(doc, y, 'Production Site Performance', 'Capacity utilization and cost efficiency by site')
  y += 2

  const sites = getProductionSites(filters)
  autoTable(doc, {
    startY: y,
    head: [['Site', 'Location', 'Product', 'Utilization (%)', 'Output (MT)', 'Cost/MT (€)', 'vs Budget (%)', 'Status']],
    body: sites.map(s => [
      s.site,
      s.location,
      s.product,
      formatNum(s.utilizationPct),
      s.outputMT.toLocaleString(),
      formatNum(s.costPerMT),
      `${s.costVsBudget >= 0 ? '+' : ''}${formatNum(s.costVsBudget)}`,
      s.status,
    ]),
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 1.8, lineColor: [213, 219, 227], lineWidth: 0.2 },
    headStyles: { fillColor: PRIMARY, textColor: WHITE, fontStyle: 'bold', fontSize: 6.5 },
    alternateRowStyles: { fillColor: [249, 250, 252] },
    columnStyles: { 3: { halign: 'right' }, 4: { halign: 'right' }, 5: { halign: 'right' }, 6: { halign: 'right' } },
    margin: { left: 20, right: 20 },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 7) {
        const s = sites[data.row.index]
        if (s?.status === 'critical') data.cell.styles.textColor = NEGATIVE
        else if (s?.status === 'attention') data.cell.styles.textColor = WARNING
        else data.cell.styles.textColor = POSITIVE
        data.cell.styles.fontStyle = 'bold'
      }
    },
  })

  // =========================================================================
  // PAGE 6 — Market Intelligence
  // =========================================================================
  doc.addPage()
  y = 25
  y = sectionTitle(doc, y, '7. Market Intelligence', 'Potash benchmarks, input costs & FX rates')
  y += 4

  // Benchmark data — latest 3 months
  const benchmarks = getBenchmarkData(filters)
  const recentBM = benchmarks.slice(-3)
  autoTable(doc, {
    startY: y,
    head: [['Month', 'MOP Vancouver (€/MT)', 'MOP Baltic (€/MT)', 'MOP Brazil (€/MT)', 'K+S Realized (€/MT)']],
    body: recentBM.map(b => [
      b.month,
      formatNum(b.mopVancouver),
      formatNum(b.mopBaltic),
      formatNum(b.mopBrazil),
      formatNum(b.ksRealized),
    ]),
    theme: 'grid',
    styles: { fontSize: 7.5, cellPadding: 2, lineColor: [213, 219, 227], lineWidth: 0.2 },
    headStyles: { fillColor: PRIMARY, textColor: WHITE, fontStyle: 'bold', fontSize: 7 },
    alternateRowStyles: { fillColor: [249, 250, 252] },
    columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right' } },
    margin: { left: 20, right: 20 },
  })

  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10

  // Input costs
  y = checkPageBreak(doc, y, 30)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  setTC(doc, DARK)
  doc.text('Input Cost Tracker (Latest 3 Months)', 20, y)
  y += 6

  const inputs = getInputCostData(filters).slice(-3)
  autoTable(doc, {
    startY: y,
    head: [['Month', 'Natural Gas (€/MWh)', 'Electricity (€/MWh)', 'Freight Index']],
    body: inputs.map(ic => [
      ic.month,
      formatNum(ic.naturalGas),
      formatNum(ic.electricity),
      formatNum(ic.freight, 0),
    ]),
    theme: 'grid',
    styles: { fontSize: 7.5, cellPadding: 2, lineColor: [213, 219, 227], lineWidth: 0.2 },
    headStyles: { fillColor: PRIMARY, textColor: WHITE, fontStyle: 'bold', fontSize: 7 },
    alternateRowStyles: { fillColor: [249, 250, 252] },
    columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' } },
    margin: { left: 20, right: 20 },
  })

  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10

  // FX rates
  y = checkPageBreak(doc, y, 30)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  setTC(doc, DARK)
  doc.text('FX Rates (Latest 3 Months)', 20, y)
  y += 6

  const fx = getFxData(filters).slice(-3)
  autoTable(doc, {
    startY: y,
    head: [['Month', 'EUR/USD', 'EUR/BRL']],
    body: fx.map(f => [f.month, formatNum(f.eurUsd, 4), formatNum(f.eurBrl, 2)]),
    theme: 'grid',
    styles: { fontSize: 7.5, cellPadding: 2, lineColor: [213, 219, 227], lineWidth: 0.2 },
    headStyles: { fillColor: PRIMARY, textColor: WHITE, fontStyle: 'bold', fontSize: 7 },
    alternateRowStyles: { fillColor: [249, 250, 252] },
    columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' } },
    margin: { left: 20, right: 20 },
  })

  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12

  // =========================================================================
  // Price Alerts
  // =========================================================================
  y = checkPageBreak(doc, y, 50)
  y = sectionTitle(doc, y, '8. Price Alerts & Risk Summary', 'Active price limit violations')
  y += 2

  const alerts = getPriceAlerts(filters)
  autoTable(doc, {
    startY: y,
    head: [['Severity', 'Customer', 'Product', 'Actual (€/MT)', 'Limit (€/MT)', 'Deviation (%)']],
    body: alerts.map(a => [
      a.severity.toUpperCase(),
      a.customer,
      a.product,
      formatNum(a.actualPrice),
      formatNum(a.limitPrice),
      `${formatNum(a.deviation)}%`,
    ]),
    theme: 'grid',
    styles: { fontSize: 7.5, cellPadding: 2, lineColor: [213, 219, 227], lineWidth: 0.2 },
    headStyles: { fillColor: PRIMARY, textColor: WHITE, fontStyle: 'bold', fontSize: 7 },
    alternateRowStyles: { fillColor: [249, 250, 252] },
    columnStyles: { 3: { halign: 'right' }, 4: { halign: 'right' }, 5: { halign: 'right' } },
    margin: { left: 20, right: 20 },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 0) {
        const a = alerts[data.row.index]
        if (a?.severity === 'critical') {
          data.cell.styles.textColor = NEGATIVE
          data.cell.styles.fontStyle = 'bold'
        } else {
          data.cell.styles.textColor = WARNING
          data.cell.styles.fontStyle = 'bold'
        }
      }
    },
  })

  // =========================================================================
  // PAGE 7 — Price Engine overview
  // =========================================================================
  doc.addPage()
  y = 25
  y = sectionTitle(doc, y, '9. Price Engine — Regional Pricing Overview', 'Target & limit prices, margins, volume allocation')
  y += 2

  const peRows = getPriceEngineRows(filters)
  autoTable(doc, {
    startY: y,
    head: [['Region', 'Customer', 'Product', 'Target Price', 'Limit Price', 'Target Margin', 'Limit Margin', 'Strategy', 'Vol. Target', 'Vol. Actual', 'Achievem.']],
    body: peRows.map(r => {
      const ach = r.volumeTargetMT > 0 ? (r.volumeActualMT / r.volumeTargetMT * 100) : 0
      return [
        r.region,
        r.customer,
        r.product,
        `${formatNum(r.targetPrice)} ${r.currency}`,
        `${formatNum(r.limitPrice)} ${r.currency}`,
        `${formatNum(r.targetMargin)}%`,
        `${formatNum(r.limitMargin)}%`,
        r.strategy || '—',
        fmtK(r.volumeTargetMT),
        fmtK(r.volumeActualMT),
        `${ach.toFixed(0)}%`,
      ]
    }),
    theme: 'grid',
    styles: { fontSize: 6.5, cellPadding: 1.5, lineColor: [213, 219, 227], lineWidth: 0.2 },
    headStyles: { fillColor: PRIMARY, textColor: WHITE, fontStyle: 'bold', fontSize: 6 },
    alternateRowStyles: { fillColor: [249, 250, 252] },
    columnStyles: {
      3: { halign: 'right' }, 4: { halign: 'right' }, 5: { halign: 'right' },
      6: { halign: 'right' }, 8: { halign: 'right' }, 9: { halign: 'right' }, 10: { halign: 'right' },
    },
    margin: { left: 15, right: 15 },
    didParseCell: (data) => {
      // Color achievement column
      if (data.section === 'body' && data.column.index === 10) {
        const r = peRows[data.row.index]
        if (r) {
          const ach = r.volumeTargetMT > 0 ? (r.volumeActualMT / r.volumeTargetMT * 100) : 0
          if (ach >= 80) data.cell.styles.textColor = POSITIVE
          else if (ach >= 60) data.cell.styles.textColor = WARNING
          else data.cell.styles.textColor = NEGATIVE
          data.cell.styles.fontStyle = 'bold'
        }
      }
      // Bold anchor rows
      if (data.section === 'body' && data.column.index === 0) {
        const r = peRows[data.row.index]
        if (r?.isAnchor) data.cell.styles.fontStyle = 'bold'
      }
    },
  })

  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8

  // Volume summary
  const totalTarget = peRows.reduce((s, r) => s + r.volumeTargetMT, 0)
  const totalActualVol = peRows.reduce((s, r) => s + r.volumeActualMT, 0)
  const totalAch = totalTarget > 0 ? (totalActualVol / totalTarget * 100) : 0

  y = checkPageBreak(doc, y, 14)
  setFC(doc, totalAch >= 80 ? [230, 247, 237] : totalAch >= 60 ? [255, 247, 220] : [253, 232, 232])
  doc.roundedRect(15, y, w - 30, 12, 2, 2, 'F')
  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'bold')
  setTC(doc, DARK)
  doc.text(`Total Volume: ${(totalActualVol / 1000).toFixed(0)}k / ${(totalTarget / 1000).toFixed(0)}k MT`, 22, y + 7.5)
  setTC(doc, totalAch >= 80 ? POSITIVE : totalAch >= 60 ? WARNING : NEGATIVE)
  doc.text(`Achievement: ${totalAch.toFixed(0)}%`, w - 22, y + 7.5, { align: 'right' })

  // =========================================================================
  // Add page numbers to all pages
  // =========================================================================
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    addPageFooter(doc, i, totalPages, dateStr)
  }

  // =========================================================================
  // Download
  // =========================================================================
  const fileName = `K+S_Management_Report_${now.toISOString().slice(0, 10)}.pdf`
  doc.save(fileName)
}
