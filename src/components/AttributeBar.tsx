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
}

export function AttributeBar({ label, value }: Props) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="attr">
      <span className="attr__label">{label}</span>
      <span className="attr__track">
        <span className="attr__fill" style={{ width: `${pct}%` }} />
      </span>
      <span className="attr__value">{Math.round(value)}</span>
    </div>
  );
}
