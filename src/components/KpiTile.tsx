import type { Kpi, Status } from '../data/mockData';
import { tileVizFor } from '../data/mockData';
import RingViz from './tiles/RingViz';
import BarToTargetViz from './tiles/BarToTargetViz';
import DistributionViz from './tiles/DistributionViz';
import ScatterMiniViz from './tiles/ScatterMiniViz';

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
  const viz = tileVizFor[kpi.id];
  const sColor = statusColor[kpi.status];

  return (
    <button
      onClick={onClick}
      title={kpi.definition}
      aria-expanded={expanded}
      className={[
        'group relative text-left w-full rounded-lg border bg-white px-5 py-4 transition-all flex flex-col',
        'min-h-[180px]',
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
          style={{ backgroundColor: sColor }}
          title={statusLabel[kpi.status]}
        />
      </div>

      {viz.kind === 'ring' && (
        <>
          <div className="relative flex-1 flex items-center justify-center mt-2">
            <RingViz
              value={viz.value}
              max={viz.max}
              target={viz.target}
              hero={kpi.hero}
              centerLabel={viz.centerLabel}
              statusColor={sColor}
            />
          </div>
          <TrendRow arrow={arrow} delta={kpi.trendDelta} color={trendColor} />
        </>
      )}

      {viz.kind === 'barToTarget' && (
        <>
          <div className="mt-2 flex items-baseline gap-2">
            <div className="text-[28px] font-semibold tracking-tight text-neutral-900 leading-none tabular-nums">
              {kpi.hero}
            </div>
          </div>
          <div className="mt-3 flex-1">
            <BarToTargetViz
              value={viz.value}
              target={viz.target}
              min={viz.min}
              max={viz.max}
              bandLow={viz.bandLow}
              bandHigh={viz.bandHigh}
              statusColor={sColor}
            />
          </div>
          <TrendRow arrow={arrow} delta={kpi.trendDelta} color={trendColor} />
        </>
      )}

      {viz.kind === 'distribution' && (
        <>
          <div className="mt-2 flex items-end justify-between gap-3 flex-1">
            <div className="text-[28px] font-semibold tracking-tight text-neutral-900 leading-none tabular-nums">
              {kpi.hero}
            </div>
            <DistributionViz
              bars={viz.bars}
              highlightIndex={viz.highlightIndex}
              baseline={viz.baseline}
              statusColor={sColor}
            />
          </div>
          <TrendRow arrow={arrow} delta={kpi.trendDelta} color={trendColor} />
        </>
      )}

      {viz.kind === 'scatterMini' && (
        <>
          <div className="mt-2 flex items-end justify-between gap-3 flex-1">
            <div className="text-[28px] font-semibold tracking-tight text-neutral-900 leading-none tabular-nums">
              {kpi.hero}
            </div>
            <ScatterMiniViz
              points={viz.points}
              regression={viz.regression}
              statusColor={sColor}
            />
          </div>
          <TrendRow arrow={arrow} delta={kpi.trendDelta} color={trendColor} />
        </>
      )}
    </button>
  );
}

function TrendRow({ arrow, delta, color }: { arrow: string; delta: string; color: string }) {
  return (
    <div className="mt-3 text-[11px] font-medium tabular-nums" style={{ color }}>
      {arrow} {delta}{' '}
      <span className="text-neutral-400 font-normal">vs. last quarter</span>
    </div>
  );
}
