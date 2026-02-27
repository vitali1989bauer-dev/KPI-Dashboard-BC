import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { pricingDeepDiveData } from '../data/mockData'

export default function PricingDeepDive() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-text-primary">Pricing Deep-dives</h2>
        <p className="text-sm text-text-secondary mt-1">
          Pricing analysis by customer segment
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-xl border border-border p-5">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1">
            Avg. Price / MT
          </p>
          <p className="text-2xl font-bold text-text-primary">€ 201.5</p>
          <div className="flex items-center gap-1 mt-1">
            <ArrowUpRight className="w-3.5 h-3.5 text-positive" />
            <span className="text-xs font-medium text-positive">+3.5% vs LY</span>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1">
            Avg. Margin
          </p>
          <p className="text-2xl font-bold text-text-primary">23.2%</p>
          <div className="flex items-center gap-1 mt-1">
            <ArrowUpRight className="w-3.5 h-3.5 text-positive" />
            <span className="text-xs font-medium text-positive">+0.6pp vs LY</span>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1">
            Total Volume
          </p>
          <p className="text-2xl font-bold text-text-primary">133.3k MT</p>
          <div className="flex items-center gap-1 mt-1">
            <ArrowDownRight className="w-3.5 h-3.5 text-negative" />
            <span className="text-xs font-medium text-negative">-1.2% vs LY</span>
          </div>
        </div>
      </div>

      {/* Pricing Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
            Segment Pricing Analysis
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-bg">
                <th className="text-left px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Segment
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Avg Price (€/MT)
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Price vs LY
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Margin %
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Margin vs LY
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Volume (MT)
                </th>
              </tr>
            </thead>
            <tbody>
              {pricingDeepDiveData.map((row, idx) => (
                <tr
                  key={row.segment}
                  className={`border-t border-border hover:bg-primary/3 transition-colors ${
                    idx % 2 === 0 ? '' : 'bg-bg/50'
                  }`}
                >
                  <td className="px-6 py-3.5 text-sm font-medium text-text-primary">
                    {row.segment}
                  </td>
                  <td className="px-6 py-3.5 text-sm text-right font-mono text-text-primary">
                    {row.avgPrice.toFixed(1)}
                  </td>
                  <td className="px-6 py-3.5 text-sm text-right">
                    <span
                      className={`inline-flex items-center gap-0.5 font-semibold ${
                        row.priceVsLY >= 0 ? 'text-positive' : 'text-negative'
                      }`}
                    >
                      {row.priceVsLY >= 0 ? (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowDownRight className="w-3.5 h-3.5" />
                      )}
                      {row.priceVsLY >= 0 ? '+' : ''}
                      {row.priceVsLY.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-sm text-right font-mono text-text-primary">
                    {row.margin.toFixed(1)}%
                  </td>
                  <td className="px-6 py-3.5 text-sm text-right">
                    <span
                      className={`inline-flex items-center gap-0.5 font-semibold ${
                        row.marginVsLY >= 0 ? 'text-positive' : 'text-negative'
                      }`}
                    >
                      {row.marginVsLY >= 0 ? '+' : ''}
                      {row.marginVsLY.toFixed(1)}pp
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-sm text-right font-mono text-text-primary">
                    {row.volume.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
