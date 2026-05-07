import {
  CartesianGrid, Line, ResponsiveContainer, Scatter, ComposedChart,
  Tooltip, XAxis, YAxis,
} from 'recharts';
import { alignmentData } from '../../data/mockData';
import {
  ACCENT, CHART_AXIS, CHART_GRID,
  chartTooltipStyle, chartTooltipItemStyle, chartTooltipLabelStyle,
} from './chartTheme';

// Compute regression line + R²
function regression(pts: { perf: number; netPrice: number }[]) {
  const n = pts.length;
  const meanX = pts.reduce((s, p) => s + p.perf, 0) / n;
  const meanY = pts.reduce((s, p) => s + p.netPrice, 0) / n;
  let num = 0, denX = 0, denY = 0;
  for (const p of pts) {
    num += (p.perf - meanX) * (p.netPrice - meanY);
    denX += (p.perf - meanX) ** 2;
    denY += (p.netPrice - meanY) ** 2;
  }
  const slope = num / denX;
  const intercept = meanY - slope * meanX;
  const r = num / Math.sqrt(denX * denY);
  return { slope, intercept, r2: r * r };
}

const reg = regression(alignmentData);
const lineData = [
  { perf: 30, netPrice: reg.slope * 30 + reg.intercept },
  { perf: 100, netPrice: reg.slope * 100 + reg.intercept },
];

export default function AlignmentScatter() {
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart margin={{ top: 10, right: 30, bottom: 30, left: 10 }}>
          <CartesianGrid stroke={CHART_GRID} />
          <XAxis
            type="number"
            dataKey="perf"
            domain={[20, 105]}
            tick={CHART_AXIS}
            tickLine={false}
            axisLine={{ stroke: CHART_GRID }}
          />
          <YAxis
            type="number"
            dataKey="netPrice"
            domain={[40, 110]}
            tick={CHART_AXIS}
            tickLine={false}
            axisLine={{ stroke: CHART_GRID }}
          />
          <Tooltip
            cursor={{ stroke: ACCENT, strokeWidth: 1, strokeDasharray: '3 3' }}
            contentStyle={chartTooltipStyle}
            itemStyle={chartTooltipItemStyle}
            labelStyle={chartTooltipLabelStyle}
          />
          <Scatter data={alignmentData} fill={ACCENT} fillOpacity={0.7} />
          <Line
            data={lineData}
            type="linear"
            dataKey="netPrice"
            stroke="#475569"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            dot={false}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="absolute right-4 top-2 rounded-md bg-neutral-900 px-2 py-1 text-[11px] font-medium text-white">
        R² = {reg.r2.toFixed(2)}
      </div>
    </div>
  );
}
