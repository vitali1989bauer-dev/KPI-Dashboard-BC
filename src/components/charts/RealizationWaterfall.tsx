import {
  Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from 'recharts';
import { realizationWaterfall } from '../../data/mockData';
import { NEUTRAL, NEGATIVE, POSITIVE, CHART_AXIS, CHART_GRID } from './chartTheme';

type Row = {
  name: string;
  base: number;
  value: number;
  type: 'start' | 'down' | 'end';
  label: string;
};

function buildRows(): Row[] {
  const rows: Row[] = [];
  let running = 0;
  for (const step of realizationWaterfall) {
    if (step.type === 'start') {
      rows.push({
        name: step.name, base: 0, value: step.value,
        type: 'start', label: step.value.toFixed(1),
      });
      running = step.value;
    } else if (step.type === 'down') {
      const prev = running;
      running = step.value;
      rows.push({
        name: step.name, base: running, value: prev - running,
        type: 'down', label: `−${(prev - running).toFixed(1)}`,
      });
    } else {
      rows.push({
        name: step.name, base: 0, value: step.value,
        type: 'end', label: step.value.toFixed(1),
      });
    }
  }
  return rows;
}

const rows = buildRows();
const colorFor = (t: Row['type']) =>
  t === 'start' ? NEUTRAL : t === 'end' ? POSITIVE : NEGATIVE;

export default function RealizationWaterfall() {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={rows} margin={{ top: 24, right: 20, bottom: 10, left: 10 }}>
        <CartesianGrid stroke={CHART_GRID} vertical={false} />
        <XAxis dataKey="name" tick={CHART_AXIS} tickLine={false} axisLine={{ stroke: CHART_GRID }} />
        <YAxis
          domain={[0, 105]}
          tick={CHART_AXIS}
          tickLine={false}
          axisLine={{ stroke: CHART_GRID }}
          label={{ value: 'Index (intended gross = 100)', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#6b7280' }}
        />
        <Tooltip
          cursor={{ fill: 'rgba(255,50,70,0.06)' }}
          formatter={(_v, _n, ctx) => {
            const r = ctx.payload as Row;
            return [r.label, r.name];
          }}
          contentStyle={{ background: '#0f172a', border: 'none', borderRadius: 6, fontSize: 12, color: '#fff' }}
          itemStyle={{ color: '#fff' }}
          labelStyle={{ color: '#cbd5e1', fontSize: 11 }}
        />
        <Bar dataKey="base" stackId="w" fill="transparent" />
        <Bar dataKey="value" stackId="w" radius={[3, 3, 0, 0]}>
          {rows.map((r, i) => (
            <Cell key={i} fill={colorFor(r.type)} />
          ))}
          <LabelList dataKey="label" position="top" fontSize={11} fill="#1f2937" />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
