import type { Dimension, Kpi, KpiId } from '../data/mockData';
import { kpisFor } from '../data/mockData';
import KpiTile from './KpiTile';
import KpiExpanded from './KpiExpanded';
import DimensionBanner from './DimensionBanner';

type Props = {
  id: Dimension;
  name: string;
  question: string;
  index: number;
  total: number;
  expanded: KpiId | null;
  onToggle: (id: KpiId) => void;
};

export default function DimensionSection({ id, name, question, index, total, expanded, onToggle }: Props) {
  const kpis = kpisFor(id);
  const expandedKpi: Kpi | undefined = kpis.find((k) => k.id === expanded);

  return (
    <section className="mt-12 first:mt-8">
      <DimensionBanner dimension={id} index={index} total={total} name={name} question={question} />

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
