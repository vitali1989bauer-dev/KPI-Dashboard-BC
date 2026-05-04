import {
  Bar, BarChart, CartesianGrid, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from 'recharts';
import { overrideData } from '../../data/mockData';
import {
  ACCENT, CHART_AXIS, CHART_GRID,
  chartTooltipStyle, chartTooltipItemStyle, chartTooltipLabelStyle,
} from './chartTheme';

export default function OverrideBar() {
  const sorted = [...overrideData].sort((a, b) => b.count - a.count);
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={sorted} margin={{ top: 10, right: 20, bottom: 30, left: 10 }}>
        <CartesianGrid stroke={CHART_GRID} vertical={false} />
        <XAxis
          dataKey="reason"
          tick={{ ...CHART_AXIS, fontSize: 10 }}
          tickLine={false}
          axisLine={{ stroke: CHART_GRID }}
          interval={0}
          angle={-20}
          textAnchor="end"
          height={60}
        />
        <YAxis
          tick={CHART_AXIS}
          tickLine={false}
          axisLine={{ stroke: CHART_GRID }}
          label={{ value: 'Override count (this quarter)', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#6b7280' }}
        />
        <Tooltip
          cursor={{ fill: 'rgba(255,50,70,0.06)' }}
          contentStyle={chartTooltipStyle}
          itemStyle={chartTooltipItemStyle}
          labelStyle={chartTooltipLabelStyle}
        />
        <Bar dataKey="count" fill={ACCENT} radius={[3, 3, 0, 0]} barSize={32} />
      </BarChart>
    </ResponsiveContainer>
  );
}
