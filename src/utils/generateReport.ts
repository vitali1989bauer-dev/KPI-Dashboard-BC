import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Filters } from '../data/mockData'
import {
  getOverviewKpis,
  getTopActionItems,
  getPeerBenchmark,
  getYoYByCategory,
} from '../data/mockData'

type RGB = [number, number, number]
const PRIMARY: RGB = [26, 35, 50]
const ACCENT: RGB = [200, 150, 12]
const GREY: RGB = [100, 116, 139]
const LIGHT_BG: RGB = [244, 246, 248]
const WHITE: RGB = [255, 255, 255]

function setFC(doc: jsPDF, c: RGB) { doc.setFillColor(c[0], c[1], c[2]) }
function setTC(doc: jsPDF, c: RGB) { doc.setTextColor(c[0], c[1], c[2]) }
function setDC(doc: jsPDF, c: RGB) { doc.setDrawColor(c[0], c[1], c[2]) }

function addPageFooter(doc: jsPDF, pageNum: number, totalPages: number, date: string) {
  const w = doc.internal.pageSize.getWidth()
  const h = doc.internal.pageSize.getHeight()
  setDC(doc, LIGHT_BG)
  doc.line(20, h - 18, w - 20, h - 18)
  doc.setFontSize(7.5)
  setTC(doc, GREY)
  doc.text('Voith Turbo Pricing Intelligence — Confidential', 20, h - 12)
  doc.text(`Generated ${date}`, w / 2, h - 12, { align: 'center' })
  doc.text(`Page ${pageNum} of ${totalPages}`, w - 20, h - 12, { align: 'right' })
}

function sectionTitle(doc: jsPDF, y: number, title: string, subtitle?: string): number {
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  setTC(doc, PRIMARY)
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

export async function generateManagementReport(filters: Filters): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const w = doc.internal.pageSize.getWidth()
  const now = new Date()
  const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

  // Cover
  setFC(doc, PRIMARY)
  doc.rect(0, 0, w, 55, 'F')
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  setTC(doc, WHITE)
  doc.text('VOITH TURBO', 20, 25)
  doc.setFontSize(11)
  setTC(doc, ACCENT)
  doc.text('Pricing Intelligence Report', 20, 33)
  doc.setFontSize(9)
  setTC(doc, [180, 190, 200])
  doc.text(`${filters.region} · ${filters.segment} · ${filters.timePeriod} · ${dateStr} ${timeStr}`, 20, 42)

  let y = 65

  // KPIs
  y = sectionTitle(doc, y, 'Key Performance Indicators', 'Price realization and margin overview')
  const kpis = getOverviewKpis(filters)
  autoTable(doc, {
    startY: y,
    head: [['KPI', 'Value', 'vs. PY']],
    body: kpis.map(k => [k.label, k.value, k.subtitle]),
    theme: 'grid',
    headStyles: { fillColor: PRIMARY, textColor: WHITE, fontSize: 9, fontStyle: 'bold' },
    bodyStyles: { fontSize: 9 },
    margin: { left: 20, right: 20 },
  })
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10

  // Action Items
  y = sectionTitle(doc, y, 'Top Price Action Items')
  const actions = getTopActionItems(filters)
  autoTable(doc, {
    startY: y,
    head: [['Part Family', 'Cat.', 'Real. %', 'Gap', 'Rev. Impact']],
    body: actions.map(a => [a.partFamily, a.category, `${a.realizationPct}%`, `${a.gapPp}pp`, a.revenueImpact]),
    theme: 'grid',
    headStyles: { fillColor: PRIMARY, textColor: WHITE, fontSize: 9, fontStyle: 'bold' },
    bodyStyles: { fontSize: 9 },
    margin: { left: 20, right: 20 },
  })
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10

  // Peer Benchmark
  doc.addPage()
  y = 25
  y = sectionTitle(doc, y, 'Regional Benchmark', 'Peer group comparison')
  const { countries } = getPeerBenchmark(filters)
  autoTable(doc, {
    startY: y,
    head: [['Country', 'Realization %', 'Gross Margin %']],
    body: countries.map(c => [`${c.code} ${c.name}${c.isYou ? ' (You)' : ''}`, `${c.realizationPct.toFixed(1)}%`, `${c.marginPct.toFixed(1)}%`]),
    theme: 'grid',
    headStyles: { fillColor: PRIMARY, textColor: WHITE, fontSize: 9, fontStyle: 'bold' },
    bodyStyles: { fontSize: 9 },
    margin: { left: 20, right: 20 },
  })
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10

  // YoY Trends
  y = sectionTitle(doc, y, 'Year-on-Year Trends', 'Realization by material category')
  const yoy = getYoYByCategory(filters)
  autoTable(doc, {
    startY: y,
    head: [['Category', 'PY', 'CY', 'Delta']],
    body: yoy.map(r => [r.category, `${r.priorYear.toFixed(1)}%`, `${r.currentYear.toFixed(1)}%`, `${r.deltaPp >= 0 ? '+' : ''}${r.deltaPp.toFixed(1)}pp`]),
    theme: 'grid',
    headStyles: { fillColor: PRIMARY, textColor: WHITE, fontSize: 9, fontStyle: 'bold' },
    bodyStyles: { fontSize: 9 },
    margin: { left: 20, right: 20 },
  })

  // Footers
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    addPageFooter(doc, i, totalPages, `${dateStr} ${timeStr}`)
  }

  doc.save(`Voith_Turbo_Pricing_Report_${dateStr.replace(/ /g, '_')}.pdf`)
}
