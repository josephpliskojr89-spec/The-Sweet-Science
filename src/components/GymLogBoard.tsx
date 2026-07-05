/*
  GymLogBoard — the corkboard by the street door
  --------------------------------------------------------------------------
  The gym's quiet life accretes as paper: typewritten slips pinned
  overlapping, the three newest fully legible at rest (DESIGN-BIBLE A21 —
  the ambient "what happened while I advanced" read survives), older notes
  peeking beneath. Click the board to lean in and read everything recent;
  Esc puts you back. No collapse toggle — a board on a wall occupies no
  "space" to reclaim. New entries pin on with a damped swing.
*/

import { useEffect, useState } from 'react';
import { useGame } from '../state/GameContext';
import { formatDate } from '../game/time';
import { paperTilt, seedChance } from '../kit/seed';
import './GymLogBoard.css';

const LEGIBLE_AT_REST = 3;
const PEEKING = 4;
const LEAN_IN_LINES = 14;

export function GymLogBoard() {
  const { save } = useGame();
  const [leanIn, setLeanIn] = useState(false);
  const [newestKey, setNewestKey] = useState<string | null>(null);

  const log = save?.recentLog ?? [];
  const topKey = log.length ? `${log[0].dayCount}-${log[0].text.slice(0, 24)}` : null;

  // the newest slip swings on its pin when it arrives
  useEffect(() => {
    if (topKey) setNewestKey(topKey);
  }, [topKey]);

  useEffect(() => {
    if (!leanIn) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLeanIn(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [leanIn]);

  if (!save) return null;

  const atRest = log.slice(0, LEGIBLE_AT_REST + PEEKING);

  const slip = (line: { dayCount: number; text: string }, i: number, legible: boolean) => {
    const id = `${line.dayCount}-${line.text.slice(0, 24)}`;
    const d = formatDate(line.dayCount);
    return (
      <li
        key={id}
        className={
          'logslip' +
          (legible ? '' : ' logslip--peek') +
          (id === newestKey && i === 0 ? ' logslip--pinned-now' : '')
        }
        style={paperTilt(id, 2, 3)}
      >
        <span className="logslip__pin" aria-hidden="true" />
        <span className="logslip__date">{`${d.month.slice(0, 3)} ${d.day}`}</span>
        <span className="logslip__text">{line.text}</span>
        {seedChance(id, 0.25, 7) && <span className="logslip__stain" aria-hidden="true" />}
      </li>
    );
  };

  return (
    <>
      <button
        className="corkboard"
        onClick={() => setLeanIn(true)}
        aria-label={`Gym log corkboard, ${log.length} recent notes. Lean in to read.`}
      >
        <span className="corkboard__frame" aria-hidden="true" />
        {log.length === 0 ? (
          <span className="corkboard__bare" aria-hidden="true">
            {/* bare cork: old pin holes and a sun-faded rectangle */}
            <span className="corkboard__ghost" />
          </span>
        ) : (
          <ul className="corkboard__slips">
            {atRest.map((line, i) => slip(line, i, i < LEGIBLE_AT_REST))}
          </ul>
        )}
      </button>

      {leanIn && (
        <div
          className="corkboard-leanin"
          role="dialog"
          aria-label="The corkboard, up close"
          onClick={() => setLeanIn(false)}
        >
          <div className="corkboard-leanin__board" onClick={(e) => e.stopPropagation()}>
            <ul className="corkboard-leanin__slips">
              {log.slice(0, LEAN_IN_LINES).map((line, i) => slip(line, i + 1, true))}
            </ul>
            <button
              className="corkboard-leanin__back"
              onClick={() => setLeanIn(false)}
              aria-label="Step back from the board"
            >
              STEP BACK
            </button>
          </div>
        </div>
      )}
    </>
  );
}
