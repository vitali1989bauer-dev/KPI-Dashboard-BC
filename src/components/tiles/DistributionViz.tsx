type Bar = { label: string; value: number };

type Props = {
  bars: Bar[];
  highlightIndex?: number;
  baseline?: number; // if set, bars deviate above/below this value
  statusColor: string;
  width?: number;
  height?: number;
};

export default function DistributionViz({
  bars,
  highlightIndex,
  baseline,
  statusColor,
  width = 130,
  height = 56,
}: Props) {
  const padX = 2;
  const padY = 6;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;
  const gap = 3;
  const barW = (innerW - gap * (bars.length - 1)) / bars.length;

  if (baseline !== undefined) {
    // Centered around baseline — bars extend up or down
    const max = Math.max(...bars.map((b) => Math.abs(b.value - baseline))) || 1;
    const midY = padY + innerH / 2;

    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden className="block">
        <line x1={padX} x2={padX + innerW} y1={midY} y2={midY} stroke="#cbd0d8" strokeWidth={1} />
        {bars.map((b, i) => {
          const delta = b.value - baseline;
          const h = (Math.abs(delta) / max) * (innerH / 2 - 2);
          const x = padX + i * (barW + gap);
          const y = delta >= 0 ? midY - h : midY;
          const isHi = i === highlightIndex;
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={barW}
              height={Math.max(1.5, h)}
              rx={1}
              fill={isHi ? statusColor : '#9aa3af'}
              fillOpacity={isHi ? 1 : 0.55}
            />
          );
        })}
      </svg>
    );
  }

  const max = Math.max(...bars.map((b) => b.value)) || 1;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden className="block">
      {bars.map((b, i) => {
        const h = (b.value / max) * innerH;
        const x = padX + i * (barW + gap);
        const y = padY + (innerH - h);
        const isHi = i === highlightIndex;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={barW}
            height={Math.max(1.5, h)}
            rx={1}
            fill={isHi ? statusColor : '#cbd0d8'}
          />
        );
      })}
      <line
        x1={padX}
        x2={padX + innerW}
        y1={padY + innerH + 0.5}
        y2={padY + innerH + 0.5}
        stroke="#e4e7ec"
        strokeWidth={1}
      />
    </svg>
  );
}
