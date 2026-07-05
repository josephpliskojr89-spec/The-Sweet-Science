/*
  OrdersCard — TRAINING ORDERS, CARD 7-A REV. 6/73
  --------------------------------------------------------------------------
  The >7-option checklist card (CD select ruling: longer lists get the
  clipboard-sheet popover). A printed radiogroup with one pencil check;
  focus lines go dusty — never grayed — when every slot is filled, with the
  reason printed where the option was. Shared by the Locker Room roster
  sheet and the Fighter Profile training slip.
*/

import type { RosterEntry } from '../game/roster';
import { ATTR_KEYS, ATTR_LABELS, type TrainingFocus } from '../game/training';
import { PencilCheck } from './PencilCheck';
import './kit.css';

export function OrdersCard({
  entry,
  slotsFull,
  onPick,
  onClose,
}: {
  entry: RosterEntry;
  slotsFull: boolean;
  onPick: (v: TrainingFocus | null) => void;
  onClose: () => void;
}) {
  const focusDisabled = slotsFull && entry.focus === null;
  const options: Array<{ v: TrainingFocus | null; label: string; isFocus: boolean }> = [
    { v: null, label: 'GENERAL TRAINING', isFocus: false },
    { v: 'rounded' as TrainingFocus, label: 'FOCUS — WELL-ROUNDED', isFocus: true },
    ...ATTR_KEYS.map((k) => ({
      v: k as TrainingFocus,
      label: `FOCUS — ${ATTR_LABELS[k].toUpperCase()}`,
      isFocus: true,
    })),
  ];
  return (
    <span className="orders on-paper" role="radiogroup" aria-label="Training orders">
      <span className="orders__formno" aria-hidden="true">
        TRAINING ORDERS — CARD 7-A REV. 6/73
      </span>
      {options.map((o) => {
        const active = (entry.focus ?? null) === o.v;
        const dusty = o.isFocus && focusDisabled && !active;
        return (
          <button
            key={String(o.v)}
            role="radio"
            aria-checked={active}
            className={'orders__line' + (dusty ? ' orders__line--dusty' : '')}
            disabled={dusty}
            onClick={() => onPick(o.v)}
          >
            <span className="orders__box" aria-hidden="true">
              {active && <PencilCheck seedId={entry.fighter.id + String(o.v)} />}
            </span>
            {dusty ? 'ALL SLOTS FILLED — SEE HOOK BOARD' : o.label}
          </button>
        );
      })}
      <button className="orders__file" onClick={onClose}>
        FILE IT AWAY
      </button>
    </span>
  );
}
