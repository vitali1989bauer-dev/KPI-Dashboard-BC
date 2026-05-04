// Price Operations motif: a 4-node flow with arrows; one node accented red.
// Suggests quote → decision flow / process discipline.

export default function FlowMotif({
  width = 220,
  height = 96,
}: {
  width?: number;
  height?: number;
}) {
  const padX = 12;
  const cy = height / 2;
  const innerW = width - padX * 2;
  const nodeR = 10;
  const innerSpan = innerW - nodeR * 2;
  const nodes = [0, 1, 2, 3];
  const nodeX = (i: number) => padX + nodeR + (i * innerSpan) / 3;
  const accentIdx = 2;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden
      className="block"
    >
      {/* arrow marker */}
      <defs>
        <marker
          id="flow-arrow"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#9aa3af" />
        </marker>
      </defs>

      {/* connectors */}
      {nodes.slice(0, -1).map((_, i) => {
        const x1 = nodeX(i) + nodeR + 2;
        const x2 = nodeX(i + 1) - nodeR - 2;
        return (
          <line
            key={`c-${i}`}
            x1={x1}
            y1={cy}
            x2={x2}
            y2={cy}
            stroke="#cbd0d8"
            strokeWidth={1.2}
            markerEnd="url(#flow-arrow)"
          />
        );
      })}

      {/* nodes */}
      {nodes.map((_, i) => {
        const isAccent = i === accentIdx;
        return (
          <g key={`n-${i}`}>
            <circle
              cx={nodeX(i)}
              cy={cy}
              r={nodeR}
              fill={isAccent ? '#FF3246' : '#ffffff'}
              stroke={isAccent ? '#FF3246' : '#9aa3af'}
              strokeWidth={1.4}
            />
            {isAccent ? (
              // small dot inside accented node
              <circle cx={nodeX(i)} cy={cy} r={3} fill="#ffffff" />
            ) : (
              <circle cx={nodeX(i)} cy={cy} r={2.4} fill="#9aa3af" />
            )}
          </g>
        );
      })}

      {/* small "branch" off the accented node — exception path */}
      <line
        x1={nodeX(accentIdx)}
        y1={cy + nodeR}
        x2={nodeX(accentIdx) + 14}
        y2={cy + nodeR + 18}
        stroke="#cbd0d8"
        strokeWidth={1}
        strokeDasharray="2 3"
      />
      <circle cx={nodeX(accentIdx) + 14} cy={cy + nodeR + 18} r={2.5} fill="#9aa3af" />
    </svg>
  );
}
