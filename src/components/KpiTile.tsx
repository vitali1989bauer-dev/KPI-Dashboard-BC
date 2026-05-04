import type { Kpi, Status } from '../data/mockData';
import Sparkline from './Sparkline';

const statusColor: Record<Status, string> = {
  green: '#1a8754',
  amber: '#d49a1a',
  red: '#c43e3e',
};

const statusLabel: Record<Status, string> = {
  green: 'On target',
  amber: 'Near target',
  red: 'Below target',
};

type Props = {
  kpi: Kpi;
  expanded: boolean;
  onClick: () => void;
};

export default function KpiTile({ kpi, expanded, onClick }: Props) {
  const trendColor = kpi.trendIsGood ? '#1a8754' : '#c43e3e';
  const arrow = kpi.trendDirection === 'up' ? '▲' : '▼';

  return (
    <button
      onClick={onClick}
      title={kpi.definition}
      aria-expanded={expanded}
      className={[
        'group relative text-left w-full rounded-lg border bg-white px-5 py-4 transition-all',
        'hover:border-neutral-300 hover:shadow-[0_4px_20px_rgba(15,23,42,0.06)]',
        expanded
          ? 'border-[#FF3246] shadow-[0_0_0_3px_rgba(255,50,70,0.08)]'
          : 'border-neutral-200',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="text-[13px] font-semibold text-neutral-900 leading-tight pr-4">
          {kpi.name}
        </div>
        <span
          className="mt-1 inline-block h-2 w-2 rounded-full shrink-0"
          style={{ backgroundColor: statusColor[kpi.status] }}
          title={statusLabel[kpi.status]}
        />
      </div>

      <div className="mt-3 flex items-end justify-between gap-3">
        <div>
          <div className="text-[28px] font-semibold tracking-tight text-neutral-900 leading-none tabular-nums">
            {kpi.hero}
          </div>
          <div
            className="mt-2 text-[11px] font-medium tabular-nums"
            style={{ color: trendColor }}
          >
            {arrow} {kpi.trendDelta}{' '}
            <span className="text-neutral-400 font-normal">vs. last quarter</span>
          </div>
        </div>
        <div className="opacity-90 group-hover:opacity-100">
          <Sparkline data={kpi.history} />
        </div>
      </div>
    </button>
  );
}
