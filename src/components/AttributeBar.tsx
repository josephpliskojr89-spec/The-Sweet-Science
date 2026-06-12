/*
  AttributeBar
  --------------------------------------------------------------------------
  One physical/technical attribute as a worn gauge. The number is the manager's
  read of a fighter he's had in the gym — real, but never the whole story.
*/

import './AttributeBar.css';

interface Props {
  label: string;
  value: number; // 0..100
  /** Recent change, for a small trend arrow. */
  delta?: number;
}

export function AttributeBar({ label, value, delta }: Props) {
  const pct = Math.max(0, Math.min(100, value));
  const trend = delta && Math.abs(delta) >= 0.15 ? (delta > 0 ? 'up' : 'down') : null;
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
    </div>
  );
}
