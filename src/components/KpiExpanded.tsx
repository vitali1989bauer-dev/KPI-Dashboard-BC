import type { Kpi } from '../data/mockData';
import ValueFitScatter from './charts/ValueFitScatter';
import CompetitivenessBar from './charts/CompetitivenessBar';
import DispersionBar from './charts/DispersionBar';
import RealizationWaterfall from './charts/RealizationWaterfall';
import AlignmentScatter from './charts/AlignmentScatter';
import CoverageDonut from './charts/CoverageDonut';
import IncreaseCaptureBar from './charts/IncreaseCaptureBar';
import ConformityStackedBar from './charts/ConformityStackedBar';
import OverrideBar from './charts/OverrideBar';
import AdoptionSplit from './charts/AdoptionSplit';
import CycleTimeHistogram from './charts/CycleTimeHistogram';

function ChartFor({ kpi }: { kpi: Kpi }) {
  switch (kpi.id) {
    case 'value-fit':         return <ValueFitScatter />;
    case 'competitiveness':   return <CompetitivenessBar />;
    case 'dispersion':        return <DispersionBar />;
    case 'realization':       return <RealizationWaterfall />;
    case 'alignment':         return <AlignmentScatter />;
    case 'coverage':          return <CoverageDonut />;
    case 'increase-capture':  return <IncreaseCaptureBar />;
    case 'conformity':        return <ConformityStackedBar />;
    case 'override':          return <OverrideBar />;
    case 'adoption':          return <AdoptionSplit />;
    case 'cycle-time':        return <CycleTimeHistogram />;
  }
}

export default function KpiExpanded({ kpi, onClose }: { kpi: Kpi; onClose: () => void }) {
  return (
    <div className="mt-3 rounded-xl border border-neutral-200 bg-white p-6 shadow-[0_4px_30px_rgba(15,23,42,0.06)]">
      <div className="flex items-start justify-between gap-6 border-b border-neutral-100 pb-4">
        <div className="max-w-3xl">
          <div className="text-[11px] uppercase tracking-wider text-[#FF3246] font-semibold">
            KPI detail
          </div>
          <h3 className="mt-1 text-lg font-semibold text-neutral-900">{kpi.name}</h3>
          <p className="mt-1 text-sm text-neutral-600">{kpi.definition}</p>
        </div>
        <button
          onClick={onClose}
          className="rounded-md border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:border-neutral-300 hover:text-neutral-900 transition-colors"
        >
          Close
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 pt-5">
        <div className="min-w-0">
          <ChartFor kpi={kpi} />
        </div>
        <aside className="space-y-4 text-[13px] leading-relaxed">
          <Box label="Formula" body={kpi.formula} />
          <Box label="What good looks like" body={kpi.benchmark} />
          <Box label="What it catches that revenue & margin don't" body={kpi.catches} accent />
        </aside>
      </div>
    </div>
  );
}

function Box({ label, body, accent = false }: { label: string; body: string; accent?: boolean }) {
  return (
    <div className={`rounded-md border p-3 ${accent ? 'border-[#FF3246]/20 bg-[#FF3246]/[0.04]' : 'border-neutral-200 bg-neutral-50'}`}>
      <div className={`text-[10px] uppercase tracking-wider font-semibold ${accent ? 'text-[#FF3246]' : 'text-neutral-500'}`}>
        {label}
      </div>
      <div className="mt-1 text-neutral-800">{body}</div>
    </div>
  );
}
