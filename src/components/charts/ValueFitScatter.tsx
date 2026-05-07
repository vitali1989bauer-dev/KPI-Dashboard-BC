import {
  CartesianGrid, Legend, ReferenceLine, ResponsiveContainer, Scatter,
  ScatterChart, Tooltip, XAxis, YAxis, ZAxis,
} from 'recharts';
import { valueFitData } from '../../data/mockData';
import {
  CHART_AXIS, CHART_GRID, SEGMENT_COLORS,
  chartTooltipStyle, chartTooltipItemStyle, chartTooltipLabelStyle,
} from './chartTheme';

export default function ValueFitScatter() {
  const segments = ['Enterprise', 'Mid-market', 'Channel', 'Long tail'] as const;

  return (
    <ResponsiveContainer width="100%" height={320}>
      <ScatterChart margin={{ top: 10, right: 20, bottom: 30, left: 10 }}>
        <CartesianGrid stroke={CHART_GRID} />
        <XAxis
          type="number"
          dataKey="perceivedValue"
          name="Perceived value"
          domain={[20, 100]}
          tick={CHART_AXIS}
          tickLine={false}
          axisLine={{ stroke: CHART_GRID }}
        />
        <YAxis
          type="number"
          dataKey="netPrice"
          name="Net price"
          domain={[20, 100]}
          tick={CHART_AXIS}
          tickLine={false}
          axisLine={{ stroke: CHART_GRID }}
        />
        <ZAxis type="number" dataKey="revenue" range={[40, 260]} name="Revenue (€M)" />
        <ReferenceLine
          segment={[{ x: 20, y: 20 }, { x: 100, y: 100 }]}
          stroke="#94a3b8"
          strokeDasharray="4 4"
          label={{ value: 'Fair-value line', fill: '#94a3b8', fontSize: 10, position: 'insideTopLeft' }}
        />
        <Tooltip
          cursor={{ stroke: '#FF3246', strokeWidth: 1, strokeDasharray: '3 3' }}
          contentStyle={chartTooltipStyle}
          itemStyle={chartTooltipItemStyle}
          labelStyle={chartTooltipLabelStyle}
        />
        <Legend verticalAlign="top" align="right" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
        {segments.map((s) => (
          <Scatter
            key={s}
            name={s}
            data={valueFitData.filter((d) => d.segment === s)}
            fill={SEGMENT_COLORS[s]}
            fillOpacity={0.85}
          />
        ))}
      </ScatterChart>
    </ResponsiveContainer>
  );
}
