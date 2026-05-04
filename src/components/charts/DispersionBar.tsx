import {
  Bar, BarChart, CartesianGrid, Cell, ReferenceArea, ReferenceLine,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { dispersionData } from '../../data/mockData';
import {
  ACCENT, ACCENT_SOFT, CHART_AXIS, CHART_GRID,
  chartTooltipStyle, chartTooltipItemStyle, chartTooltipLabelStyle,
} from './chartTheme';

export default function DispersionBar() {
  const sorted = [...dispersionData].sort((a, b) => b.netPrice - a.netPrice);
  const mean = sorted.reduce((s, d) => s + d.netPrice, 0) / sorted.length;

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart layout="vertical" data={sorted} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
        <CartesianGrid stroke={CHART_GRID} horizontal={false} />
        <XAxis
          type="number"
          domain={[80, 115]}
          tick={CHART_AXIS}
          tickLine={false}
          axisLine={{ stroke: CHART_GRID }}
          label={{ value: 'Net price index (mean = 100)', position: 'insideBottom', offset: -2, fontSize: 11, fill: '#6b7280' }}
        />
        <YAxis type="category" dataKey="country" tick={CHART_AXIS} tickLine={false} axisLine={{ stroke: CHART_GRID }} width={70} />
        <ReferenceArea x1={mean - 10} x2={mean + 10} fill="#94a3b8" fillOpacity={0.10}
          label={{ value: '±10% band', position: 'insideTopRight', fill: '#64748b', fontSize: 10 }} />
        <ReferenceLine x={mean} stroke="#94a3b8" strokeDasharray="3 3"
          label={{ value: 'mean', position: 'top', fill: '#64748b', fontSize: 10 }} />
        <Tooltip cursor={{ fill: 'rgba(255,50,70,0.06)' }}
          contentStyle={chartTooltipStyle} itemStyle={chartTooltipItemStyle} labelStyle={chartTooltipLabelStyle} />
        <Bar dataKey="netPrice" name="Net price index" radius={[0, 3, 3, 0]} barSize={20}>
          {sorted.map((d, i) => (
            <Cell key={i} fill={Math.abs(d.netPrice - mean) > 10 ? ACCENT : ACCENT_SOFT} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
