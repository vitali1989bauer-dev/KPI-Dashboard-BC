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
      <BarChart
        layout="vertical"
        data={sorted}
        margin={{ top: 10, right: 24, bottom: 10, left: 20 }}
      >
        <CartesianGrid stroke={CHART_GRID} horizontal={false} />
        <XAxis
          type="number"
          tick={CHART_AXIS}
          tickLine={false}
          axisLine={{ stroke: CHART_GRID }}
        />
        <YAxis
          type="category"
          dataKey="reason"
          tick={CHART_AXIS}
          tickLine={false}
          axisLine={{ stroke: CHART_GRID }}
          width={140}
        />
        <Tooltip
          cursor={{ fill: 'rgba(255,50,70,0.06)' }}
          contentStyle={chartTooltipStyle}
          itemStyle={chartTooltipItemStyle}
          labelStyle={chartTooltipLabelStyle}
        />
        <Bar dataKey="count" fill={ACCENT} radius={[0, 3, 3, 0]} barSize={20} />
      </BarChart>
    </ResponsiveContainer>
  );
}
