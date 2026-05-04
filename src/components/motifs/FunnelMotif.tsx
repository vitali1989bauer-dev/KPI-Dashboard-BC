// Price Performance motif: a descending stack of progressively narrower bars.
// Echoes the realization waterfall: intended price → discounts → rebates → net.

export default function FunnelMotif({
  width = 220,
  height = 96,
}: {
  width?: number;
  height?: number;
}) {
  const padX = 12;
  const padY = 10;
  const innerH = height - padY * 2;
  const innerW = Math.min(width - padX * 2, height * 1.6);
  const x0 = (width - innerW) / 2;
  const rows = [
    { wRatio: 1.0, fill: '#e4e7ec' },
    { wRatio: 0.86, fill: '#d4d8df' },
    { wRatio: 0.7, fill: '#c1c6cf' },
    { wRatio: 0.55, fill: '#FF3246' },
  ];
  const gap = 6;
  const rowH = (innerH - gap * (rows.length - 1)) / rows.length;
  const centerX = x0 + innerW / 2;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden
      className="block"
    >
      {/* connecting side guides */}
      <line
        x1={x0}
        y1={padY + rowH / 2}
        x2={x0 + innerW * (1 - rows[rows.length - 1].wRatio) / 2}
        y2={padY + innerH - rowH / 2}
        stroke="#e4e7ec"
        strokeWidth={1}
      />
      <line
        x1={x0 + innerW}
        y1={padY + rowH / 2}
        x2={x0 + innerW - innerW * (1 - rows[rows.length - 1].wRatio) / 2}
        y2={padY + innerH - rowH / 2}
        stroke="#e4e7ec"
        strokeWidth={1}
      />

      {rows.map((r, i) => {
        const w = innerW * r.wRatio;
        const x = centerX - w / 2;
        const y = padY + i * (rowH + gap);
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={w}
            height={rowH}
            rx={2}
            fill={r.fill}
          />
        );
      })}

      {/* small leakage tick marks on right side of upper rows */}
      {rows.slice(0, -1).map((r, i) => {
        const w = innerW * r.wRatio;
        const x = centerX + w / 2 + 4;
        const y = padY + i * (rowH + gap) + rowH / 2;
        return (
          <line
            key={`tick-${i}`}
            x1={x}
            y1={y}
            x2={x + 6}
            y2={y}
            stroke="#9aa3af"
            strokeWidth={1.2}
          />
        );
      })}
    </svg>
  );
}
