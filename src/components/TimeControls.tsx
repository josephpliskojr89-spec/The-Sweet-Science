/*
  TimeControls
  --------------------------------------------------------------------------
  Lives on the gym floor, per the bible. Shows the current date/season and
  advances the clock by a day or a week. In Phase 1 advancing only moves the
  clock — walk-ins, camps, and fights will hook into this in later phases, and
  the walk-in NOTIFICATION surfaces here after each advance (Phase 3).
*/

import { useGame } from '../state/GameContext';
import { formatDate, seasonOf } from '../game/time';
import './TimeControls.css';

export function TimeControls() {
  const { save, advanceTime } = useGame();
  if (!save) return null;

  const date = formatDate(save.dayCount);
  const season = seasonOf(save.dayCount);

  return (
    <div className="timebar">
      <div className="timebar__clock">
        <span className="timebar__season">{season} · 1975 Career</span>
        <span className="timebar__date">{date.full}</span>
      </div>

      <div className="timebar__controls">
        <button
          className="timebar__btn"
          onClick={() => advanceTime('day')}
          title="Advance one day"
        >
          <span className="timebar__btn-main">Advance Day</span>
          <span className="timebar__btn-sub">+1</span>
        </button>
        <button
          className="timebar__btn timebar__btn--week"
          onClick={() => advanceTime('week')}
          title="Advance one week"
        >
          <span className="timebar__btn-main">Advance Week</span>
          <span className="timebar__btn-sub">+7</span>
        </button>
      </div>
    </div>
  );
}
