import { useState } from 'react';
import { QUARTERS } from '../data/mockData';

type Props = {
  period: string;
  setPeriod: (p: string) => void;
};

// Non-functional filter options — present for the demo, do not affect data.
const ALL = 'All';
const DIVISIONS = [ALL, 'Industrial Components', 'Process Chemicals', 'Specialty Coatings', 'Aftermarket'];
const SEGMENTS = [ALL, 'Enterprise', 'Mid-market', 'Channel', 'Long tail'];
const PRODUCT_GROUPS = [ALL, 'Bearings', 'Seals', 'Lubricants', 'Coatings', 'Aftermarket Kits'];
const APPLICATIONS = [ALL, 'Automotive', 'Industrial', 'Marine', 'Agriculture', 'Construction'];
const BRANDS = [ALL, 'Premium Line', 'Core Line', 'Value Line'];
const SALES_CHANNELS = [ALL, 'Direct', 'Distributor', 'OEM', 'E-commerce'];

export default function Header({ period, setPeriod }: Props) {
  const [division, setDivision] = useState(ALL);
  const [segment, setSegment] = useState(ALL);
  const [group, setGroup] = useState(ALL);
  const [application, setApplication] = useState(ALL);
  const [brand, setBrand] = useState(ALL);
  const [channel, setChannel] = useState(ALL);

  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto max-w-[1400px] px-8 py-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="shrink-0">
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

        <div className="flex flex-wrap items-end gap-x-3 gap-y-3">
          <Selector label="Division" value={division} options={DIVISIONS} onChange={setDivision} />
          <Selector label="Customer Segment" value={segment} options={SEGMENTS} onChange={setSegment} />
          <Selector label="Product Group" value={group} options={PRODUCT_GROUPS} onChange={setGroup} />
          <Selector label="Application" value={application} options={APPLICATIONS} onChange={setApplication} />
          <Selector label="Brand" value={brand} options={BRANDS} onChange={setBrand} />
          <Selector label="Sales Channel" value={channel} options={SALES_CHANNELS} onChange={setChannel} />
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
    <label className="flex flex-col text-[10px] uppercase tracking-wider text-neutral-400 font-medium">
      {label}
      <select
        className="mt-1 rounded-md border border-neutral-200 bg-white px-2.5 py-1.5 text-[13px] text-neutral-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#FF3246]/30 focus:border-[#FF3246]"
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
