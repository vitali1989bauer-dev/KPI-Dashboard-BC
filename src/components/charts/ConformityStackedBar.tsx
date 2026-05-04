import {
  Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from 'recharts';
import { conformityData } from '../../data/mockData';
import {
  POSITIVE, AMBER, NEGATIVE, CHART_AXIS, CHART_GRID,
  chartTooltipStyle, chartTooltipItemStyle, chartTooltipLabelStyle,
} from './chartTheme';

export default function ConformityStackedBar() {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart layout="vertical" data={conformityData} margin={{ top: 10, right: 20, bottom: 10, left: 30 }}>
        <CartesianGrid stroke={CHART_GRID} horizontal={false} />
        <XAxis
          type="number"
          domain={[0, 100]}
          tickFormatter={(v) => `${v}%`}
          tick={CHART_AXIS}
          tickLine={false}
          axisLine={{ stroke: CHART_GRID }}
        />
        <YAxis
          type="category"
          dataKey="unit"
          tick={CHART_AXIS}
          tickLine={false}
          axisLine={{ stroke: CHART_GRID }}
          width={150}
        />
        <Tooltip
          cursor={{ fill: 'rgba(255,50,70,0.05)' }}
          formatter={(v) => `${v}%`}
          contentStyle={chartTooltipStyle}
          itemStyle={chartTooltipItemStyle}
          labelStyle={chartTooltipLabelStyle}
        />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="within" name="Within corridor" stackId="c" fill={POSITIVE} barSize={22} />
        <Bar dataKey="above" name="Above corridor" stackId="c" fill={AMBER} barSize={22} />
        <Bar dataKey="below" name="Below corridor" stackId="c" fill={NEGATIVE} barSize={22} />
      </BarChart>
    </ResponsiveContainer>
  );
}
