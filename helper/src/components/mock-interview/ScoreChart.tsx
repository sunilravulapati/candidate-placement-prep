'use client';

// components/mock-interview/ScoreChart.tsx
// Reusable SVG radar chart for displaying 8 dimension scores.
// Also includes bar chart variant for simpler display contexts.

interface ScoreChartProps {
  scores: {
    technicalAccuracy: number;
    communication: number;
    problemSolving: number;
    confidence: number;
    depth: number;
    structure: number;
    examples: number;
    completeness: number;
  };
  size?: number;
}

const DIMENSIONS = [
  { key: 'technicalAccuracy', label: 'Technical', short: 'Tech' },
  { key: 'communication', label: 'Communication', short: 'Comm' },
  { key: 'problemSolving', label: 'Problem Solving', short: 'P.Solv' },
  { key: 'confidence', label: 'Confidence', short: 'Conf' },
  { key: 'depth', label: 'Depth', short: 'Depth' },
  { key: 'structure', label: 'Structure', short: 'Struct' },
  { key: 'examples', label: 'Examples', short: 'Exmp' },
  { key: 'completeness', label: 'Completeness', short: 'Comp' },
] as const;

function polarToCartesian(cx: number, cy: number, r: number, angleRad: number) {
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

export function RadarChart({ scores, size = 260 }: ScoreChartProps) {
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size / 2 - 30;
  const n = DIMENSIONS.length;

  // Angles: start at top (-π/2), go clockwise
  const angles = DIMENSIONS.map((_, i) => (-Math.PI / 2) + (2 * Math.PI * i) / n);

  // Grid circles
  const gridLevels = [20, 40, 60, 80, 100];

  // Data polygon
  const dataPoints = DIMENSIONS.map(({ key }, i) => {
    const val = (scores?.[key] || 0) / 100;
    const r = val * maxR;
    return polarToCartesian(cx, cy, r, angles[i]);
  });

  const dataPath = dataPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(' ') + ' Z';

  // Label positions (slightly beyond grid)
  const labelR = maxR + 16;
  const labelPoints = angles.map(a => polarToCartesian(cx, cy, labelR, a));

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="w-full h-auto max-w-[280px]">
      {/* Grid circles */}
      {gridLevels.map(level => {
        const r = (level / 100) * maxR;
        const pts = angles.map(a => polarToCartesian(cx, cy, r, a));
        const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ') + ' Z';
        return (
          <path key={level} d={pathD} fill="none" stroke="#1e293b" strokeWidth={1} />
        );
      })}

      {/* Axes */}
      {angles.map((a, i) => {
        const end = polarToCartesian(cx, cy, maxR, a);
        return (
          <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="#1e293b" strokeWidth={1} />
        );
      })}

      {/* Data polygon */}
      <path d={dataPath} fill="rgba(139, 92, 246, 0.15)" stroke="#8b5cf6" strokeWidth={2} strokeLinejoin="round" />

      {/* Data points */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3.5} fill="#8b5cf6" stroke="#1e1e2e" strokeWidth={1.5} />
      ))}

      {/* Labels */}
      {labelPoints.map((p, i) => {
        const anchor =
          Math.abs(p.x - cx) < 5
            ? 'middle'
            : p.x < cx
            ? 'end'
            : 'start';
        return (
          <text
            key={i}
            x={p.x}
            y={p.y}
            textAnchor={anchor}
            dominantBaseline="middle"
            fontSize={9}
            fill="#94a3b8"
            fontFamily="system-ui"
          >
            {DIMENSIONS[i].short}
          </text>
        );
      })}

      {/* Center label */}
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize={11} fill="#475569" fontFamily="system-ui">
        Score
      </text>
    </svg>
  );
}

// Bar chart variant for simpler contexts
export function DimensionBars({ scores }: { scores: ScoreChartProps['scores'] }) {
  const getColor = (v: number) => {
    if (v >= 80) return 'from-emerald-500 to-teal-500';
    if (v >= 60) return 'from-violet-500 to-indigo-500';
    if (v >= 40) return 'from-amber-500 to-orange-500';
    return 'from-rose-500 to-red-500';
  };

  return (
    <div className="space-y-3">
      {DIMENSIONS.map(({ key, label }) => {
        const val = scores?.[key] || 0;
        return (
          <div key={key} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">{label}</span>
              <span className="font-bold text-slate-200">{val}</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${getColor(val)} rounded-full transition-all duration-700`}
                style={{ width: `${val}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
