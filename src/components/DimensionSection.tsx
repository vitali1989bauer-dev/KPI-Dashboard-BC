import type { Dimension, Kpi, KpiId } from '../data/mockData';
import { kpisFor } from '../data/mockData';
import KpiTile from './KpiTile';
import KpiExpanded from './KpiExpanded';

type Props = {
  id: Dimension;
  name: string;
  question: string;
  expanded: KpiId | null;
  onToggle: (id: KpiId) => void;
};

export default function DimensionSection({ id, name, question, expanded, onToggle }: Props) {
  const kpis = kpisFor(id);
  const expandedKpi: Kpi | undefined = kpis.find((k) => k.id === expanded);

  return (
    <section className="mt-12 first:mt-8">
      <div className="mb-5 flex items-baseline gap-4">
        <h2 className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[#FF3246]">
          {name}
        </h2>
        <p className="italic text-neutral-500 text-[13px]">{question}</p>
      </div>

      <div
        className={`grid gap-4 ${
          kpis.length === 4
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        }`}
      >
        {kpis.map((k) => (
          <KpiTile
            key={k.id}
            kpi={k}
            expanded={expanded === k.id}
            onClick={() => onToggle(k.id)}
          />
        ))}
      </div>

      {expandedKpi && (
        <KpiExpanded kpi={expandedKpi} onClose={() => onToggle(expandedKpi.id)} />
      )}
    </section>
  );
}
