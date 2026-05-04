import {
  Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from 'recharts';
import { increaseCaptureData } from '../../data/mockData';
import {
  ACCENT, NEUTRAL, CHART_AXIS, CHART_GRID,
  chartTooltipStyle, chartTooltipItemStyle, chartTooltipLabelStyle,
} from './chartTheme';

export default function IncreaseCaptureBar() {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={increaseCaptureData} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
        <CartesianGrid stroke={CHART_GRID} vertical={false} />
        <XAxis dataKey="family" tick={CHART_AXIS} tickLine={false} axisLine={{ stroke: CHART_GRID }} />
        <YAxis
          tick={CHART_AXIS}
          tickLine={false}
          axisLine={{ stroke: CHART_GRID }}
        />
        <Tooltip
          cursor={{ fill: 'rgba(255,50,70,0.06)' }}
          formatter={(v) => `${Number(v).toFixed(1)}%`}
          contentStyle={chartTooltipStyle}
          itemStyle={chartTooltipItemStyle}
          labelStyle={chartTooltipLabelStyle}
        />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="announced" name="Announced increase" fill={NEUTRAL} radius={[3, 3, 0, 0]} barSize={26} />
        <Bar dataKey="realized" name="Realized in net" fill={ACCENT} radius={[3, 3, 0, 0]} barSize={26} />
      </BarChart>
    </ResponsiveContainer>
  );
}
