type Props = {
  value: number;
  max: number;
  target: number;
  hero: string;
  centerLabel: string;
  statusColor: string;
  size?: number;
};

export default function RingViz({
  value,
  max,
  target,
  hero,
  centerLabel,
  statusColor,
  size = 96,
}: Props) {
  const stroke = 7;
  const r = size / 2 - stroke / 2 - 2;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  const fillPct = Math.max(0, Math.min(1, value / max));
  const dash = `${circ * fillPct} ${circ}`;

  // Target tick on the ring rim, starting at 12 o'clock going clockwise
  const targetAngle = -Math.PI / 2 + (target / max) * 2 * Math.PI;
  const tickInner = r - stroke / 2 - 1;
  const tickOuter = r + stroke / 2 + 3;
  const tx1 = cx + tickInner * Math.cos(targetAngle);
  const ty1 = cy + tickInner * Math.sin(targetAngle);
  const tx2 = cx + tickOuter * Math.cos(targetAngle);
  const ty2 = cy + tickOuter * Math.sin(targetAngle);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        {/* track */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#eef0f3" strokeWidth={stroke} />
        {/* fill */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={statusColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={dash}
          transform={`rotate(-90 ${cx} ${cy})`}
        />
        {/* target tick */}
        <line x1={tx1} y1={ty1} x2={tx2} y2={ty2} stroke="#9aa3af" strokeWidth={1.5} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <div className="text-[20px] font-semibold tracking-tight text-neutral-900 leading-none tabular-nums">
          {hero}
        </div>
        <div className="mt-0.5 text-[9px] uppercase tracking-wider text-neutral-400 font-medium">
          {centerLabel}
        </div>
      </div>
    </div>
  );
}
