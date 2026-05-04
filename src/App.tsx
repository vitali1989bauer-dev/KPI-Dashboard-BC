import { useState } from 'react';
import Header from './components/Header';
import DimensionSection from './components/DimensionSection';
import InsightsPanel from './components/InsightsPanel';
import { DIMENSIONS, QUARTERS, type KpiId } from './data/mockData';

export default function App() {
  const [period, setPeriod] = useState<string>(QUARTERS[QUARTERS.length - 1]);
  const [expanded, setExpanded] = useState<KpiId | null>(null);

  const toggle = (id: KpiId) => setExpanded((cur) => (cur === id ? null : id));

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header period={period} setPeriod={setPeriod} />
      <main className="mx-auto max-w-[1400px] px-8 pb-10">
        {DIMENSIONS.map((d, i) => (
          <DimensionSection
            key={d.id}
            id={d.id}
            name={d.name}
            question={d.question}
            index={i}
            total={DIMENSIONS.length}
            expanded={expanded}
            onToggle={toggle}
          />
        ))}
        <InsightsPanel />
        <footer className="border-t border-neutral-200 pt-6 pb-2 text-[11px] text-neutral-400 flex items-center justify-between">
          <div>Pricing Quality Dashboard · demonstration data</div>
          <div className="tabular-nums">Showing {period}</div>
        </footer>
      </main>
    </div>
  );
}
