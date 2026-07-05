/*
  BankBalLine — the one number the player checks before every yes
  --------------------------------------------------------------------------
  DESIGN-BIBLE A9: the CD's cash ruling requires the balance typed on every
  money-bearing document, and this component is its single rendition:
  Courier Prime tabular, exactly 0°, 7:1, "BANK BAL. $2,200 — 5/2/75".
  Negative renders accountancy-style "($110)" with the red OVERDRAWN stamp
  in the margin — word + shape, never hue alone.
*/

import { formatDate } from '../game/time';
import { Stamp } from './Stamp';
import './kit.css';

export function BankBalLine({
  money,
  dayCount,
  seedId,
}: {
  money: number;
  dayCount: number;
  seedId: string;
}) {
  const d = formatDate(dayCount);
  const mon = d.month.slice(0, 3);
  const figure =
    money < 0
      ? `($${Math.abs(Math.round(money)).toLocaleString('en-US')})`
      : `$${Math.round(money).toLocaleString('en-US')}`;
  return (
    <span className="bankbal" aria-label={`Bank balance ${figure}`}>
      <span className="bankbal__line">
        BANK BAL. <strong className="bankbal__figure">{figure}</strong> — {mon}. {d.day}
      </span>
      {money < 0 && <Stamp word="OVERDRAWN" category="money" seedId={seedId} size="sm" />}
    </span>
  );
}
