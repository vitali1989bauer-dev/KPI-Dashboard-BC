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
  height = 56,
}: Props) {
  const padX = 8;
  const innerW = width - padX * 2;
  const trackY = height / 2 + 4;
  const trackH = 8;
  const toX = (v: number) => padX + ((v - min) / (max - min)) * innerW;

  const valX = toX(value);
  const tgtX = toX(target);

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden className="block">
      {/* axis ticks: min, target, max labels */}
      <text x={padX} y={trackY - 8} fontSize={9} fill="#9aa3af" fontFamily="ui-monospace, monospace">
        {min}
      </text>
      <text
        x={padX + innerW}
        y={trackY - 8}
        fontSize={9}
        fill="#9aa3af"
        textAnchor="end"
        fontFamily="ui-monospace, monospace"
      >
        {max}
      </text>

      {/* target band */}
      {bandLow !== undefined && bandHigh !== undefined && (
        <rect
          x={toX(bandLow)}
          y={trackY - 2}
          width={toX(bandHigh) - toX(bandLow)}
          height={trackH + 4}
          fill="#FF3246"
          fillOpacity={0.07}
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

      {/* target tick */}
      <line
        x1={tgtX}
        x2={tgtX}
        y1={trackY - 4}
        y2={trackY + trackH + 4}
        stroke="#374151"
        strokeWidth={1.5}
      />
      <text x={tgtX} y={trackY + trackH + 14} fontSize={9} fill="#6b7280" textAnchor="middle">
        target {target}
      </text>

      {/* value marker */}
      <circle cx={valX} cy={trackY + trackH / 2} r={4.5} fill="#ffffff" stroke={statusColor} strokeWidth={2} />
    </svg>
  );
}
