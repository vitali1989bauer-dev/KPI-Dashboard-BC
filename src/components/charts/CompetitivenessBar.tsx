import {
  Bar, BarChart, CartesianGrid, Legend, ReferenceArea, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from 'recharts';
import { competitivenessData } from '../../data/mockData';
import {
  ACCENT, NEUTRAL, CHART_AXIS, CHART_GRID,
  chartTooltipStyle, chartTooltipItemStyle, chartTooltipLabelStyle,
} from './chartTheme';

export default function CompetitivenessBar() {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={competitivenessData} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
        <CartesianGrid stroke={CHART_GRID} vertical={false} />
        <XAxis dataKey="segment" tick={CHART_AXIS} tickLine={false} axisLine={{ stroke: CHART_GRID }} />
        <YAxis
          domain={[80, 115]}
          tick={CHART_AXIS}
          tickLine={false}
          axisLine={{ stroke: CHART_GRID }}
        />
        <ReferenceArea y1={95} y2={105} fill="#94a3b8" fillOpacity={0.10} ifOverflow="extendDomain"
          label={{ value: '±5% band', position: 'insideTopRight', fill: '#64748b', fontSize: 10 }} />
        <Tooltip cursor={{ fill: 'rgba(255,50,70,0.06)' }}
          contentStyle={chartTooltipStyle} itemStyle={chartTooltipItemStyle} labelStyle={chartTooltipLabelStyle} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="benchmark" name="Benchmark" fill={NEUTRAL} radius={[3, 3, 0, 0]} barSize={28} />
        <Bar dataKey="yours" name="Net price" fill={ACCENT} radius={[3, 3, 0, 0]} barSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}
