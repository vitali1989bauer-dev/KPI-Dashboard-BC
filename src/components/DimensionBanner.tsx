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
    <aside className="lg:pr-2">
      <div className="flex items-center gap-2">
        <div className="h-4 w-1 bg-[#FF3246]" aria-hidden />
        <span className="text-[10px] uppercase tracking-[0.22em] text-neutral-400 tabular-nums font-medium">
          {indexLabel}
        </span>
      </div>

      <div className="mt-3 -ml-2">
        <Motif width={220} height={120} />
      </div>

      <h2 className="mt-3 text-[13px] uppercase tracking-[0.18em] font-semibold text-[#FF3246]">
        {name}
      </h2>
      <p className="mt-2 italic text-neutral-500 text-[13px] leading-relaxed">
        {question}
      </p>
    </aside>
  );
}
