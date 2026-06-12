/*
  AttributeBar
  --------------------------------------------------------------------------
  One physical/technical attribute as a worn gauge. The number is the manager's
  read of a fighter he's had in the gym — real, but never the whole story. A
  trend arrow reflects recent form (not one session); hovering shows the
  actual movement.
*/

import './AttributeBar.css';

interface Props {
  label: string;
  value: number; // 0..100
  /** Recent-form direction (game/training.ts attributeTrend). */
  trend?: 'up' | 'down' | null;
  /** Hover detail: the real numbers behind the arrow. */
  tooltip?: string;
}

export function AttributeBar({ label, value, trend, tooltip }: Props) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="attr">
      <span className="attr__label">{label}</span>
      <span className="attr__track">
        <span className="attr__fill" style={{ width: `${pct}%` }} />
      </span>
      <span className="attr__value">
        {Math.round(value)}
        {trend && <span className={`attr__trend attr__trend--${trend}`}>{trend === 'up' ? '▲' : '▼'}</span>}
      </span>
      {tooltip && <span className="attr__tip">{tooltip}</span>}
    </div>
  );
}
