/*
  FloorView — the painted gym, as a place you VISIT.
  --------------------------------------------------------------------------
  The desk (GameScreen) is where the game is played; this is where it
  breathes. The art keeps its hotspots — the doors still work, the cork
  still reads, the calendar still fills in — for anyone who'd rather walk
  the floor than read the blotter. Esc or the strip button goes back.
*/

import { useEffect, type CSSProperties } from 'react';
import { useGame } from '../state/GameContext';
import { formatDate } from '../game/time';
import { FLOOR_SCENE, type SceneRect } from '../assets/floorScene';
import { GymLogBoard } from '../components/GymLogBoard';
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

export function FloorView({ onClose }: { onClose: () => void }) {
  const { save, openRoom, activeRoom, profileId, viewerIds } = useGame();

  // Esc leaves the floor — unless a room/overlay is open above it
  const overlayOpen = activeRoom !== null || profileId !== null || viewerIds !== null;
  useEffect(() => {
    if (overlayOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, overlayOpen]);

  if (!save) return null;

  const walkIns = save.walkIns.length;
  const roster = save.roster.length;
  const { d, daysInMonth, lead } = monthGrid(save.dayCount);
  const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? '' : 's'}`;

  return (
    <div className="floor floor--view">
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

      <div className="stripbar">
        <span className="stripbar__date">{formatDate(save.dayCount).full}</span>
        <span className="stripbar__gap" />
        <button className="stripbar__btn" onClick={onClose}>
          Back to the Desk
        </button>
      </div>
    </div>
  );
}
