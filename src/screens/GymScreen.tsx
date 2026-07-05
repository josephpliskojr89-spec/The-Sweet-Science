/*
  GymScreen — the gym floor, as one piece of art
  --------------------------------------------------------------------------
  The room is a single image (public/floor/gym-floor.jpg) scaled like
  background-size: cover. The game hangs its interactive objects on it at
  percentage coordinates from src/assets/floorScene.ts:

    OFFICE door        → the office (which also holds the press and staff)
    LOCKER ROOM door   → the roster
    corkboard          → the gym log (slips pinned over the painted cork)
    calendar           → filled in live: month, X's through spent days,
                         rent circled on the 1st; click opens the schedule
    office threshold   → pink slips collect when walk-ins wait

  Time and money live in a quiet strip along the bottom: typed date, bank
  balance, and plain Advance Day / Advance Week buttons.
*/

import type { CSSProperties } from 'react';
import { useGame } from '../state/GameContext';
import { formatDate } from '../game/time';
import { formatMoney } from '../game/economy';
import { FLOOR_SCENE, type SceneRect } from '../assets/floorScene';
import { RoomRouter } from '../rooms/RoomRouter';
import { ArrivalNotice } from '../components/ArrivalNotice';
import { GymLogBoard } from '../components/GymLogBoard';
import { Toast } from '../components/Toast';
import { WalkInViewer } from './WalkInViewer';
import { FighterProfile } from './FighterProfile';
import { seedRange } from '../kit/seed';
import './GymScreen.css';

const rectStyle = (r: SceneRect): CSSProperties => ({
  left: `${r.x}%`,
  top: `${r.y}%`,
  width: `${r.w}%`,
  height: `${r.h}%`,
});

/** month grid for the wall calendar */
function monthGrid(dayCount: number) {
  const d = formatDate(dayCount);
  const first = new Date(d.year, new Date(`${d.month} 1, ${d.year}`).getMonth(), 1);
  const daysInMonth = new Date(d.year, first.getMonth() + 1, 0).getDate();
  const lead = first.getDay();
  return { d, daysInMonth, lead };
}

export function GymScreen() {
  const { save, openRoom, goHome, advanceTime } = useGame();
  if (!save) return null;

  const walkIns = save.walkIns.length;
  const roster = save.roster.length;
  const date = formatDate(save.dayCount);
  const { d, daysInMonth, lead } = monthGrid(save.dayCount);
  const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? '' : 's'}`;

  return (
    <div className="floor">
      <div className="scene">
        <img className="scene__art" src={FLOOR_SCENE.src} alt="" draggable={false} />

        {/* the two doors */}
        <button
          className="hotspot"
          style={rectStyle(FLOOR_SCENE.officeDoor)}
          onClick={() => openRoom('office')}
          aria-label={`Office — walk-ins, finances, rivals, staff, the paper. ${plural(walkIns, 'walk-in')} waiting.`}
        >
          {walkIns > 0 && (
            <span className="hotspot__tag" aria-hidden="true">
              {walkIns} WAITING
            </span>
          )}
        </button>
        <button
          className="hotspot"
          style={rectStyle(FLOOR_SCENE.lockerDoor)}
          onClick={() => openRoom('locker')}
          aria-label={`Locker room — the roster. ${plural(roster, 'fighter')} in camp.`}
        />

        {/* pink slips under the office door, one per man waiting */}
        {walkIns > 0 && (
          <div className="scene__slips" style={rectStyle(FLOOR_SCENE.officeThreshold)} aria-hidden="true">
            {Array.from({ length: Math.min(walkIns, 5) }, (_, i) => (
              <span
                key={i}
                className="scene__slip"
                style={{
                  left: `${10 + i * 18}%`,
                  transform: `rotate(${seedRange(`slip${i}`, -9, 9, 1).toFixed(1)}deg)`,
                }}
              />
            ))}
          </div>
        )}

        {/* the gym log, pinned over the painted corkboard */}
        <div className="scene__cork" style={rectStyle(FLOOR_SCENE.corkboard)}>
          <GymLogBoard />
        </div>

        {/* the calendar, filled in */}
        <button
          className="scene__cal"
          style={rectStyle(FLOOR_SCENE.calendar)}
          onClick={() => openRoom('calendar')}
          aria-label={`Calendar — ${d.month} ${d.year}, day ${d.day}. Rent due the 1st. Opens the schedule.`}
        >
          <span className="cal__month" aria-hidden="true">
            {d.month.toUpperCase()} {d.year}
          </span>
          <span className="cal__grid" aria-hidden="true">
            {Array.from({ length: lead }, (_, i) => (
              <span key={`l${i}`} className="cal__cell" />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              return (
                <span
                  key={day}
                  className={
                    'cal__cell cal__cell--day' +
                    (day < d.day ? ' cal__cell--spent' : '') +
                    (day === d.day ? ' cal__cell--today' : '') +
                    (day === 1 ? ' cal__cell--rent' : '')
                  }
                >
                  {day}
                </span>
              );
            })}
          </span>
        </button>
      </div>

      {/* the quiet strip: date, money, time controls */}
      <div className="stripbar">
        <span className="stripbar__date">{date.full}</span>
        <span className="stripbar__cash" title="Bank balance">
          {formatMoney(save.money)}
        </span>
        <span className="stripbar__gap" />
        <button className="stripbar__btn" onClick={() => advanceTime('day')}>
          Advance Day
        </button>
        <button className="stripbar__btn stripbar__btn--week" onClick={() => advanceTime('week')}>
          Advance Week
        </button>
        <button className="stripbar__btn stripbar__btn--home" onClick={goHome} title="Leave for the home screen">
          Home
        </button>
      </div>

      {/* overlays */}
      <ArrivalNotice />
      <RoomRouter />
      <FighterProfile />
      <WalkInViewer />
      <Toast />
    </div>
  );
}
