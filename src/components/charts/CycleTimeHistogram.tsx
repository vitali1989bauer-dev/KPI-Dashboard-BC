import {
  Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from 'recharts';
import { cycleTimeBins, cycleTimeStats } from '../../data/mockData';
import {
  ACCENT, ACCENT_SOFT, CHART_AXIS, CHART_GRID,
  chartTooltipStyle, chartTooltipItemStyle, chartTooltipLabelStyle,
} from './chartTheme';

// Map bin labels to mid-points (in days) for placing reference lines.
const binMid: Record<string, number> = {
  '0–1': 0.5, '1–2': 1.5, '2–3': 2.5, '3–4': 3.5,
  '4–5': 4.5, '5–7': 6.0, '7–10': 8.5, '10+': 11,
};

export default function CycleTimeHistogram() {
  // Choose which bin contains median / p90 (by closest mid)
  const closestBin = (target: number) => {
    let best = cycleTimeBins[0].bin;
    let bestDiff = Infinity;
    for (const b of cycleTimeBins) {
      const d = Math.abs(binMid[b.bin] - target);
      if (d < bestDiff) { bestDiff = d; best = b.bin; }
    }
    return best;
  };
  const medBin = closestBin(cycleTimeStats.median);
  const p90Bin = closestBin(cycleTimeStats.p90);

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={cycleTimeBins} margin={{ top: 20, right: 20, bottom: 10, left: 10 }}>
        <CartesianGrid stroke={CHART_GRID} vertical={false} />
        <XAxis
          dataKey="bin"
          tick={CHART_AXIS}
          tickLine={false}
          axisLine={{ stroke: CHART_GRID }}
          label={{ value: 'Quote-to-approval time (days)', position: 'insideBottom', offset: -5, fontSize: 11, fill: '#6b7280' }}
        />
        <YAxis
          tick={CHART_AXIS}
          tickLine={false}
          axisLine={{ stroke: CHART_GRID }}
        />
        <Tooltip
          cursor={{ fill: 'rgba(255,50,70,0.06)' }}
          contentStyle={chartTooltipStyle}
          itemStyle={chartTooltipItemStyle}
          labelStyle={chartTooltipLabelStyle}
        />
        <ReferenceLine x={medBin} stroke="#475569" strokeDasharray="4 4"
          label={{ value: `median ${cycleTimeStats.median} d`, fill: '#475569', fontSize: 10, position: 'top' }} />
        <ReferenceLine x={p90Bin} stroke={ACCENT} strokeDasharray="4 4"
          label={{ value: `p90 ${cycleTimeStats.p90} d`, fill: ACCENT, fontSize: 10, position: 'top' }} />
        <Bar dataKey="count" radius={[3, 3, 0, 0]} barSize={36}>
          {cycleTimeBins.map((b, i) => (
            <Cell key={i} fill={binMid[b.bin] > 5 ? ACCENT : ACCENT_SOFT} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
