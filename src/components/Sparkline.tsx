/*
  Sparkline
  --------------------------------------------------------------------------
  A tiny line of an attribute's history for the Development page. Auto-scaled
  to the data, with a minimum domain so a near-flat attribute doesn't read as
  dramatic noise. The final point is marked — that's "now".
*/

interface Props {
  values: number[];
  width?: number;
  height?: number;
  /** 'up' | 'down' | null tints the line. */
  trend?: 'up' | 'down' | null;
}

export function Sparkline({ values, width = 140, height = 30, trend }: Props) {
  const color = trend === 'up' ? '#7bbf6a' : trend === 'down' ? '#a6432a' : '#b88a4a';

  if (values.length < 2) {
    const y = height / 2;
    return (
      <svg width={width} height={height} className="spark" aria-hidden="true">
        <line x1="2" y1={y} x2={width - 2} y2={y} stroke={color} strokeWidth="1.5" strokeOpacity="0.5" strokeDasharray="2 3" />
        <circle cx={width - 3} cy={y} r="2.5" fill={color} />
      </svg>
    );
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const mid = (min + max) / 2;
  const span = Math.max(max - min, 6); // don't over-dramatize small movement
  const lo = mid - span / 2;
  const pad = 3;
  const x = (i: number) => pad + (i / (values.length - 1)) * (width - pad * 2);
  const y = (v: number) => height - pad - ((v - lo) / span) * (height - pad * 2);

  const points = values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const lastX = x(values.length - 1);
  const lastY = y(values[values.length - 1]);

  return (
    <svg width={width} height={height} className="spark" aria-hidden="true">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.75" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={lastX} cy={lastY} r="2.5" fill={color} />
    </svg>
  );
}
