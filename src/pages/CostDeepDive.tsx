import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { costDeepDiveData } from '../data/mockData'

export default function CostDeepDive() {
  const totalActual = costDeepDiveData.reduce((sum, d) => sum + d.actual, 0)
  const totalBudget = costDeepDiveData.reduce((sum, d) => sum + d.budget, 0)
  const totalVariance = totalActual - totalBudget
  const totalVariancePct = ((totalVariance / totalBudget) * 100).toFixed(1)

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-text-primary">Cost Related Deep-dive</h2>
        <p className="text-sm text-text-secondary mt-1">
          Cost analysis — Actual vs Budget by category
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-xl border border-border p-5">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1">
            Total Actual Cost
          </p>
          <p className="text-2xl font-bold text-text-primary">{totalActual.toFixed(1)} M€</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1">
            Total Budget
          </p>
          <p className="text-2xl font-bold text-text-primary">{totalBudget.toFixed(1)} M€</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1">
            Variance vs Budget
          </p>
          <div className="flex items-center gap-2">
            <p
              className={`text-2xl font-bold ${
                totalVariance > 0 ? 'text-negative' : 'text-positive'
              }`}
            >
              {totalVariance > 0 ? '+' : ''}
              {totalVariancePct}%
            </p>
            {totalVariance > 0 ? (
              <ArrowUpRight className="w-5 h-5 text-negative" />
            ) : (
              <ArrowDownRight className="w-5 h-5 text-positive" />
            )}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-card rounded-xl border border-border p-6 mb-6">
        <h3 className="text-sm font-semibold text-text-secondary mb-4 uppercase tracking-wide">
          Cost by Category (M€)
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={costDeepDiveData} layout="vertical" barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 12, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `${v}M€`}
            />
            <YAxis
              type="category"
              dataKey="category"
              tick={{ fontSize: 12, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
              width={100}
            />
            <Tooltip
              formatter={(value) => [`${Number(value).toFixed(1)} M€`]}
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                fontSize: '13px',
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '13px', paddingTop: '12px' }}
              iconType="square"
              iconSize={10}
            />
            <Bar dataKey="actual" name="Actual" fill="#2563eb" radius={[0, 4, 4, 0]} maxBarSize={24} />
            <Bar dataKey="budget" name="Budget" fill="#94a3b8" radius={[0, 4, 4, 0]} maxBarSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Variance Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
            Variance Detail
          </h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-bg">
              <th className="text-left px-6 py-3 text-xs font-semibold text-text-muted uppercase">
                Category
              </th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-text-muted uppercase">
                Actual (M€)
              </th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-text-muted uppercase">
                Budget (M€)
              </th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-text-muted uppercase">
                Variance (M€)
              </th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-text-muted uppercase">
                Variance %
              </th>
            </tr>
          </thead>
          <tbody>
            {costDeepDiveData.map((row, idx) => (
              <tr
                key={row.category}
                className={`border-t border-border ${idx % 2 === 0 ? '' : 'bg-bg/50'}`}
              >
                <td className="px-6 py-3 text-sm font-medium">{row.category}</td>
                <td className="px-6 py-3 text-sm text-right font-mono">{row.actual.toFixed(1)}</td>
                <td className="px-6 py-3 text-sm text-right font-mono">{row.budget.toFixed(1)}</td>
                <td className="px-6 py-3 text-sm text-right">
                  <span className={row.variance > 0 ? 'text-negative font-semibold' : 'text-positive font-semibold'}>
                    {row.variance > 0 ? '+' : ''}
                    {row.variance.toFixed(1)}
                  </span>
                </td>
                <td className="px-6 py-3 text-sm text-right">
                  <span className={row.variancePct > 0 ? 'text-negative font-semibold' : 'text-positive font-semibold'}>
                    {row.variancePct > 0 ? '+' : ''}
                    {row.variancePct.toFixed(1)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
