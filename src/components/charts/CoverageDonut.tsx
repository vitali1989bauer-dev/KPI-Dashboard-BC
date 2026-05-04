import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { coverageData } from '../../data/mockData';
import { ACCENT, NEUTRAL_SOFT } from './chartTheme';

export default function CoverageDonut() {
  const center = coverageData.find((d) => d.name === 'Under governance')?.value ?? 0;

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Tooltip
            contentStyle={{ background: '#0f172a', border: 'none', borderRadius: 6, fontSize: 12, color: '#fff' }}
            itemStyle={{ color: '#fff' }}
            labelStyle={{ color: '#cbd5e1', fontSize: 11 }}
            formatter={(v, n) => [`${v}%`, String(n)]}
          />
          <Pie
            data={coverageData}
            dataKey="value"
            innerRadius={80}
            outerRadius={120}
            stroke="none"
            paddingAngle={2}
          >
            <Cell fill={ACCENT} />
            <Cell fill={NEUTRAL_SOFT} />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-[36px] font-semibold tracking-tight text-neutral-900 tabular-nums leading-none">{center}%</div>
        <div className="mt-1 text-[11px] uppercase tracking-wider text-neutral-500">Under governance</div>
      </div>
    </div>
  );
}
