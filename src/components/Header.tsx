import { COMPANY, QUARTERS } from '../data/mockData';

type Props = {
  period: string;
  setPeriod: (p: string) => void;
};

export default function Header({ period, setPeriod }: Props) {
  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto max-w-[1400px] px-8 py-6 flex items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-7 w-1.5 bg-[#FF3246]" aria-hidden />
            <h1 className="text-[22px] font-semibold tracking-tight text-neutral-900">
              Pricing Quality Dashboard
            </h1>
          </div>
          <p className="mt-1.5 ml-4 text-sm text-neutral-500">
            Three dimensions, eleven KPIs
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Selector
            label="Company"
            value={COMPANY.name}
            options={[COMPANY.name, 'Helios Manufacturing AG', 'Northwind Materials Ltd.']}
            onChange={() => {}}
          />
          <Selector
            label="Period"
            value={period}
            options={QUARTERS.slice().reverse()}
            onChange={setPeriod}
          />
        </div>
      </div>
    </header>
  );
}

function Selector({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col text-[11px] uppercase tracking-wider text-neutral-400 font-medium">
      {label}
      <select
        className="mt-1 rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#FF3246]/30 focus:border-[#FF3246]"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}
