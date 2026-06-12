/*
  GymLogBoard — the corkboard on the gym floor
  --------------------------------------------------------------------------
  The latest quiet observations from the gym's daily life, pinned where you
  can see them as time passes. Reading it is never required; it rewards
  attention. Full memory lives in the Ledger in My Office.
*/

import { useState } from 'react';
import { useGame } from '../state/GameContext';
import { formatDate } from '../game/time';
import './GymLogBoard.css';

const VISIBLE_LINES = 5;

export function GymLogBoard() {
  const { save } = useGame();
  const [open, setOpen] = useState(true);
  if (!save || save.recentLog.length === 0) return null;

  return (
    <aside className={'logboard' + (open ? '' : ' logboard--closed')}>
      <button
        className="logboard__head"
        onClick={() => setOpen((o) => !o)}
        title={open ? 'Tuck the board away' : 'Check the board'}
      >
        <span className="logboard__title">Gym Log</span>
        <span className="logboard__toggle">{open ? '—' : `+${save.recentLog.length}`}</span>
      </button>

      {open && (
        <ul className="logboard__list">
          {save.recentLog.slice(0, VISIBLE_LINES).map((line, i) => (
            <li className="logboard__item" key={`${line.dayCount}-${i}`}>
              <span className="logboard__date">{formatDate(line.dayCount).compact}</span>
              <span className="logboard__text">{line.text}</span>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
