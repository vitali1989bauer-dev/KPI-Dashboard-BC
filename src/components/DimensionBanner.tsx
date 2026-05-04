import type { Dimension } from '../data/mockData';
import RadarMotif from './motifs/RadarMotif';
import FunnelMotif from './motifs/FunnelMotif';
import FlowMotif from './motifs/FlowMotif';

type Props = {
  dimension: Dimension;
  index: number;
  total: number;
  name: string;
  question: string;
};

const motifFor: Record<Dimension, typeof RadarMotif> = {
  market: RadarMotif,
  performance: FunnelMotif,
  operations: FlowMotif,
};

export default function DimensionBanner({ dimension, index, total, name, question }: Props) {
  const Motif = motifFor[dimension];
  const indexLabel = `${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;

  return (
    <div className="mb-5 flex items-center justify-between gap-6 border-b border-neutral-200 pb-5">
      <div className="flex items-baseline gap-4 min-w-0">
        <div className="flex items-center gap-3 shrink-0">
          <div className="h-5 w-1 bg-[#FF3246]" aria-hidden />
          <span className="text-[10px] uppercase tracking-[0.22em] text-neutral-400 tabular-nums font-medium">
            {indexLabel}
          </span>
        </div>
        <h2 className="text-[13px] uppercase tracking-[0.18em] font-semibold text-[#FF3246] shrink-0">
          {name}
        </h2>
        <p className="italic text-neutral-500 text-[13px] truncate">{question}</p>
      </div>
      <div className="shrink-0 hidden sm:block">
        <Motif />
      </div>
    </div>
  );
}
