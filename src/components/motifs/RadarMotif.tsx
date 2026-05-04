// Market Signals motif: concentric arcs with off-axis "blips"
// Suggests scanning the market for position vs value.

export default function RadarMotif({
  width = 220,
  height = 96,
}: {
  width?: number;
  height?: number;
}) {
  const cx = width - height * 0.55;
  const cy = height * 0.55;
  const r1 = height * 0.22;
  const r2 = height * 0.36;
  const r3 = height * 0.5;
  const stroke = '#cbd0d8';
  const strokeFaint = '#e4e7ec';

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden
      className="block"
    >
      {/* horizontal & vertical axes (faint) */}
      <line x1={cx - r3 - 6} y1={cy} x2={cx + r3 + 6} y2={cy} stroke={strokeFaint} strokeWidth={1} />
      <line x1={cx} y1={cy - r3 - 6} x2={cx} y2={cy + r3 + 6} stroke={strokeFaint} strokeWidth={1} />

      {/* concentric arcs (open at right side to feel like sweep) */}
      <circle cx={cx} cy={cy} r={r1} fill="none" stroke={stroke} strokeWidth={1} />
      <circle cx={cx} cy={cy} r={r2} fill="none" stroke={stroke} strokeWidth={1} />
      <circle cx={cx} cy={cy} r={r3} fill="none" stroke={stroke} strokeWidth={1} strokeDasharray="2 4" />

      {/* sweep wedge from origin */}
      <path
        d={`M ${cx} ${cy} L ${cx + r3} ${cy} A ${r3} ${r3} 0 0 0 ${cx + r3 * Math.cos(-Math.PI / 4)} ${cy + r3 * Math.sin(-Math.PI / 4)} Z`}
        fill="#FF3246"
        fillOpacity={0.06}
      />

      {/* origin */}
      <circle cx={cx} cy={cy} r={2.5} fill="#FF3246" />

      {/* blips (neutral) */}
      <circle cx={cx + r2 * Math.cos(-Math.PI / 6)} cy={cy + r2 * Math.sin(-Math.PI / 6)} r={2} fill="#9aa3af" />
      <circle cx={cx + r1 * Math.cos((Math.PI * 5) / 6)} cy={cy + r1 * Math.sin((Math.PI * 5) / 6)} r={1.8} fill="#9aa3af" />
      <circle cx={cx + r2 * Math.cos((Math.PI * 3) / 5)} cy={cy + r2 * Math.sin((Math.PI * 3) / 5)} r={1.8} fill="#9aa3af" />

      {/* one accented blip */}
      <circle
        cx={cx + r3 * Math.cos(-Math.PI / 7)}
        cy={cy + r3 * Math.sin(-Math.PI / 7)}
        r={3}
        fill="#FF3246"
      />
      <circle
        cx={cx + r3 * Math.cos(-Math.PI / 7)}
        cy={cy + r3 * Math.sin(-Math.PI / 7)}
        r={6}
        fill="none"
        stroke="#FF3246"
        strokeOpacity={0.35}
        strokeWidth={1}
      />
    </svg>
  );
}
