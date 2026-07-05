/*
  TimeControls — the time station on the near right wall
  --------------------------------------------------------------------------
  Two physical objects, largest interactive things in the room because they
  are used every minute (frequency dictates proximity):

  TEAR-OFF DAY PAD — the pad IS the date readout; advancing a day and reading
  the date are one object. Click tears the leaf free (it tumbles off with
  rotation while the next date is already printed beneath). Never disabled,
  never blocks input.

  PUNCH CLOCK — mounted below. Advancing a week is a heavier, steel act: the
  lever slams in 100ms, the card stamps. Day is paper, week is steel — the
  material weight teaches the difference in commitment without a '+7'.
*/

import { useCallback, useState } from 'react';
import { useGame } from '../state/GameContext';
import { formatDate, seasonOf } from '../game/time';
import './TimeControls.css';

export function TimeControls() {
  const { save, advanceTime } = useGame();
  const [tornLeaf, setTornLeaf] = useState<{ weekday: string; day: number; key: number } | null>(
    null,
  );
  const [punching, setPunching] = useState(false);

  const dayCount = save?.dayCount ?? 0;

  const tearDay = useCallback(() => {
    const d = formatDate(dayCount);
    // advance immediately — the tumbling leaf is decoration, never a gate
    advanceTime('day');
    setTornLeaf({ weekday: d.weekday, day: d.day, key: Date.now() });
  }, [advanceTime, dayCount]);

  const punchWeek = useCallback(() => {
    advanceTime('week');
    setPunching(true);
  }, [advanceTime]);

  if (!save) return null;

  const date = formatDate(save.dayCount);
  const season = seasonOf(save.dayCount);

  return (
    <div className="timestation">
      {/* ---- tear-off day pad ---- */}
      <button
        className="daypad"
        onClick={tearDay}
        aria-label={`${date.full}, ${season}. Advance one day — tear off the leaf.`}
      >
        <span className="daypad__backplate" aria-hidden="true" />
        <span className="daypad__staple" aria-hidden="true" />
        <span className="daypad__stubs" aria-hidden="true" />
        <span className="daypad__leaf">
          <span className="daypad__weekday">{date.weekday}</span>
          <span className="daypad__day">{date.day}</span>
          <span className="daypad__month">
            {date.month.toUpperCase()} · {date.year}
          </span>
        </span>
        {tornLeaf && (
          <span
            key={tornLeaf.key}
            className="daypad__leaf daypad__leaf--torn"
            aria-hidden="true"
            onAnimationEnd={() => setTornLeaf(null)}
          >
            <span className="daypad__weekday">{tornLeaf.weekday}</span>
            <span className="daypad__day">{tornLeaf.day}</span>
          </span>
        )}
      </button>

      {/* ---- punch clock ---- */}
      <button className="punchclock" onClick={punchWeek} aria-label="Advance one week — punch the clock.">
        <span className="punchclock__case" aria-hidden="true">
          <span className="punchclock__face">
            <span className="punchclock__hand punchclock__hand--h" />
            <span className="punchclock__hand punchclock__hand--m" />
          </span>
          <span className={'punchclock__lever' + (punching ? ' punchclock__lever--slam' : '')}
            onAnimationEnd={() => setPunching(false)}
          />
          <span className="punchclock__slot">
            <span className="punchclock__card">
              WEEK OF {date.month.slice(0, 3).toUpperCase()}. {date.day}
            </span>
          </span>
        </span>
        <span className="punchclock__plate" aria-hidden="true">
          PUNCH OUT
        </span>
      </button>
    </div>
  );
}
