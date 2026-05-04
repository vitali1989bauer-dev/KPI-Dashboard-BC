import {
  Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from 'recharts';
import { adoptionUsage, adoptionPulse } from '../../data/mockData';
import {
  ACCENT, NEUTRAL, CHART_AXIS, CHART_GRID,
  chartTooltipStyle, chartTooltipItemStyle, chartTooltipLabelStyle,
} from './chartTheme';

export default function AdoptionSplit() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4">
      <div>
        <div className="mb-2 text-[11px] uppercase tracking-wider text-neutral-500">
          Tool usage % over time
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={adoptionUsage} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
            <CartesianGrid stroke={CHART_GRID} vertical={false} />
            <XAxis dataKey="quarter" tick={{ ...CHART_AXIS, fontSize: 10 }} tickLine={false} axisLine={{ stroke: CHART_GRID }} />
            <YAxis
              domain={[40, 80]}
              tickFormatter={(v) => `${v}%`}
              tick={CHART_AXIS}
              tickLine={false}
              axisLine={{ stroke: CHART_GRID }}
            />
            <Tooltip
              formatter={(v) => `${v}%`}
              contentStyle={chartTooltipStyle}
              itemStyle={chartTooltipItemStyle}
              labelStyle={chartTooltipLabelStyle}
            />
            <Line type="monotone" dataKey="usage" stroke={ACCENT} strokeWidth={2}
              dot={{ r: 3, fill: ACCENT }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div>
        <div className="mb-2 text-[11px] uppercase tracking-wider text-neutral-500">
          Pulse trust score (1–5)
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={adoptionPulse} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
            <CartesianGrid stroke={CHART_GRID} vertical={false} />
            <XAxis dataKey="score" tick={CHART_AXIS} tickLine={false} axisLine={{ stroke: CHART_GRID }} />
            <YAxis tick={CHART_AXIS} tickLine={false} axisLine={{ stroke: CHART_GRID }} />
            <Tooltip
              contentStyle={chartTooltipStyle}
              itemStyle={chartTooltipItemStyle}
              labelStyle={chartTooltipLabelStyle}
            />
            <Bar dataKey="count" fill={NEUTRAL} radius={[3, 3, 0, 0]} barSize={26} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
