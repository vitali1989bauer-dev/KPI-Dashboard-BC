import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { getPricingDeepDiveData } from '../data/mockData'
import { useFilters } from '../FilterContext'

export default function PricingDeepDive() {
  const { filters } = useFilters()
  const data = getPricingDeepDiveData(filters)

  const totalVol = data.reduce((s, r) => s + r.volume, 0)
  const avgPrice = data.reduce((s, r) => s + r.avgPrice * r.volume, 0) / totalVol
  const avgMargin = data.reduce((s, r) => s + r.margin * r.volume, 0) / totalVol
  const avgPriceVsLY = data.reduce((s, r) => s + r.priceVsLY * r.volume, 0) / totalVol
  const avgMarginVsLY = data.reduce((s, r) => s + r.marginVsLY * r.volume, 0) / totalVol

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-text-primary">Pricing Deep-dives</h2>
        <p className="text-sm text-text-secondary mt-1">
          Pricing analysis by fertilizer &amp; salt product category
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-xl border border-border p-5 card-hover">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">Avg. Price / MT</p>
          <p className="text-2xl font-bold text-text-primary">&euro; {avgPrice.toFixed(1)}</p>
          <div className="flex items-center gap-1 mt-1">
            {avgPriceVsLY >= 0 ? <ArrowUpRight className="w-3.5 h-3.5 text-positive" /> : <ArrowDownRight className="w-3.5 h-3.5 text-negative" />}
            <span className={`text-xs font-semibold ${avgPriceVsLY >= 0 ? 'text-positive' : 'text-negative'}`}>{avgPriceVsLY >= 0 ? '+' : ''}{avgPriceVsLY.toFixed(1)}% vs LY</span>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 card-hover">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">Avg. Margin</p>
          <p className="text-2xl font-bold text-text-primary">{avgMargin.toFixed(1)}%</p>
          <div className="flex items-center gap-1 mt-1">
            {avgMarginVsLY >= 0 ? <ArrowUpRight className="w-3.5 h-3.5 text-positive" /> : <ArrowDownRight className="w-3.5 h-3.5 text-negative" />}
            <span className={`text-xs font-semibold ${avgMarginVsLY >= 0 ? 'text-positive' : 'text-negative'}`}>{avgMarginVsLY >= 0 ? '+' : ''}{avgMarginVsLY.toFixed(1)}pp vs LY</span>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 card-hover">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">Total Volume</p>
          <p className="text-2xl font-bold text-text-primary">{(totalVol / 1000).toFixed(1)}k MT</p>
        </div>
      </div>

      {/* Pricing Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
            Product Category Pricing Analysis
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-bg-warm">
                <th className="text-left px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Product</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Avg Price (&euro;/MT)</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Price vs LY</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Margin %</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Margin vs LY</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Volume (MT)</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr key={row.segment} className={`border-t border-border hover:bg-bg-warm/50 transition-colors ${idx % 2 === 0 ? '' : 'bg-bg/50'}`}>
                  <td className="px-6 py-3.5 text-sm font-semibold text-text-primary">{row.segment}</td>
                  <td className="px-6 py-3.5 text-sm text-right font-mono text-text-primary">{row.avgPrice.toFixed(1)}</td>
                  <td className="px-6 py-3.5 text-sm text-right">
                    <span className={`inline-flex items-center gap-0.5 font-semibold ${row.priceVsLY >= 0 ? 'text-positive' : 'text-negative'}`}>
                      {row.priceVsLY >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                      {row.priceVsLY >= 0 ? '+' : ''}{row.priceVsLY.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-sm text-right font-mono text-text-primary">{row.margin.toFixed(1)}%</td>
                  <td className="px-6 py-3.5 text-sm text-right">
                    <span className={`inline-flex items-center gap-0.5 font-semibold ${row.marginVsLY >= 0 ? 'text-positive' : 'text-negative'}`}>
                      {row.marginVsLY >= 0 ? '+' : ''}{row.marginVsLY.toFixed(1)}pp
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-sm text-right font-mono text-text-primary">{row.volume.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
