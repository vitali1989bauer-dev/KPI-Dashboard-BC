type Props = {
  points: { x: number; y: number }[];
  regression: { slope: number; intercept: number; xMin: number; xMax: number };
  statusColor: string;
  width?: number;
  height?: number;
};

export default function ScatterMiniViz({
  points,
  regression,
  statusColor,
  width = 130,
  height = 56,
}: Props) {
  const padX = 4;
  const padY = 4;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;
  const ys = points.map((p) => p.y);
  const yMin = Math.min(...ys) - 2;
  const yMax = Math.max(...ys) + 2;
  const { xMin, xMax } = regression;

  const toX = (x: number) => padX + ((x - xMin) / (xMax - xMin || 1)) * innerW;
  const toY = (y: number) => padY + innerH - ((y - yMin) / (yMax - yMin || 1)) * innerH;

  const x1 = xMin;
  const x2 = xMax;
  const y1 = regression.slope * x1 + regression.intercept;
  const y2 = regression.slope * x2 + regression.intercept;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden className="block">
      {/* axis baseline */}
      <line
        x1={padX}
        x2={padX + innerW}
        y1={padY + innerH + 0.5}
        y2={padY + innerH + 0.5}
        stroke="#e4e7ec"
        strokeWidth={1}
      />
      {/* regression line */}
      <line
        x1={toX(x1)}
        y1={toY(y1)}
        x2={toX(x2)}
        y2={toY(y2)}
        stroke={statusColor}
        strokeOpacity={0.7}
        strokeWidth={1.4}
        strokeDasharray="3 3"
      />
      {/* points */}
      {points.map((p, i) => (
        <circle key={i} cx={toX(p.x)} cy={toY(p.y)} r={2.2} fill="#374151" fillOpacity={0.7} />
      ))}
    </svg>
  );
}
