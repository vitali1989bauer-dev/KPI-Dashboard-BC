type Props = {
  value: number;
  target: number;
  min: number;
  max: number;
  bandLow?: number;
  bandHigh?: number;
  statusColor: string;
  width?: number;
  height?: number;
};

export default function BarToTargetViz({
  value,
  target,
  min,
  max,
  bandLow,
  bandHigh,
  statusColor,
  width = 220,
  height = 40,
}: Props) {
  const padX = 4;
  const innerW = width - padX * 2;
  const trackY = height - 16;
  const trackH = 6;
  const toX = (v: number) => padX + ((v - min) / (max - min)) * innerW;

  const valX = toX(value);
  const tgtX = toX(target);

  return (
    <svg
      width="100%"
      height="auto"
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden
      className="block"
      style={{ maxWidth: width }}
    >
      {/* target band — subtle, no labels */}
      {bandLow !== undefined && bandHigh !== undefined && (
        <rect
          x={toX(bandLow)}
          y={trackY - 2}
          width={toX(bandHigh) - toX(bandLow)}
          height={trackH + 4}
          rx={2}
          fill="#9aa3af"
          fillOpacity={0.12}
        />
      )}

      {/* track */}
      <rect x={padX} y={trackY} width={innerW} height={trackH} rx={trackH / 2} fill="#eef0f3" />

      {/* fill bar — from min to value */}
      <rect
        x={padX}
        y={trackY}
        width={Math.max(0, valX - padX)}
        height={trackH}
        rx={trackH / 2}
        fill={statusColor}
      />

      {/* target tick — short, no label text */}
      <line
        x1={tgtX}
        x2={tgtX}
        y1={trackY - 5}
        y2={trackY + trackH + 5}
        stroke="#374151"
        strokeWidth={1.5}
      />

      {/* value marker */}
      <circle
        cx={valX}
        cy={trackY + trackH / 2}
        r={4.5}
        fill="#ffffff"
        stroke={statusColor}
        strokeWidth={2}
      />
    </svg>
  );
}
