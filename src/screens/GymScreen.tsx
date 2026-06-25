/*
  GymScreen — the main game screen
  --------------------------------------------------------------------------
  The regional gym background (derived from the chosen city) fills the
  viewport. Over it sit four spatial room panels — the physical navigation
  metaphor. A thin top bar carries gym identity and the exit; time controls sit
  on the floor's bottom edge.

  Phase 3 adds the walk-in loop: doors carry live counts (walk-ins waiting,
  fighters in the gym), arrivals surface a notice after advancing time, and the
  card viewer overlays everything when reviewing a walk-in.
*/

import { useGame } from '../state/GameContext';
import { regionOf } from '../state/persistence';
import { getRegion } from '../game/regions';
import { getCity } from '../game/cities';
import { formatMoney } from '../game/economy';
import { ROOM_ORDER, ROOMS } from '../game/rooms';
import type { RoomKey } from '../state/GameContext';
import { GymBackground } from '../assets/backgrounds';
import { TimeControls } from '../components/TimeControls';
import { RoomRouter } from '../rooms/RoomRouter';
import { RoomGlyph } from '../components/RoomGlyph';
import { ArrivalNotice } from '../components/ArrivalNotice';
import { GymLogBoard } from '../components/GymLogBoard';
import { Toast } from '../components/Toast';
import { WalkInViewer } from './WalkInViewer';
import { FighterProfile } from './FighterProfile';
import './GymScreen.css';

export function GymScreen() {
  const { save, openRoom, goHome } = useGame();
  if (!save) return null;

  const region = getRegion(regionOf(save));
  const city = getCity(save.cityId);

  // Live counts for the door badges.
  const badge = (key: RoomKey): number => {
    if (key === 'office') return save.walkIns.length;
    if (key === 'gym') return save.coachApplicants.length;
    if (key === 'locker') return save.roster.length;
    return 0;
  };

  return (
    <div className="gym worn">
      <div className="gym__bg layer">
        <GymBackground region={region.key} />
      </div>

      <header className="gym__chrome">
        <div className="gym__identity">
          <span className="gym__name">{save.gymName}</span>
          <span className="gym__region">
            {city.name}, {city.state} · Local
          </span>
        </div>

        <div className="gym__money" title="Cash on hand">
          <span className="gym__money-label">Cash</span>
          <span className={'gym__money-amt' + (save.money < 0 ? ' gym__money-amt--low' : '')}>
            {formatMoney(save.money)}
          </span>
        </div>

        <button className="gym__exit" onClick={goHome} title="Leave for the home screen">
          ⏻ Home
        </button>
      </header>

      <main className="gym__floor">
        <div className="gym__rooms">
          {ROOM_ORDER.map((key) => {
            const room = ROOMS[key];
            const count = badge(key);
            return (
              <button
                key={key}
                className={`room-door room-door--${key}`}
                onClick={() => openRoom(key)}
              >
                {count > 0 && (
                  <span
                    className={
                      'room-door__badge' +
                      (key === 'office' || key === 'gym' ? ' room-door__badge--alert' : '')
                    }
                    title={
                      key === 'office'
                        ? `${count} walk-in${count === 1 ? '' : 's'} waiting`
                        : key === 'gym'
                          ? `${count} coach applicant${count === 1 ? '' : 's'}`
                          : `${count} fighter${count === 1 ? '' : 's'}`
                    }
                  >
                    {count}
                  </span>
                )}
                <span className="room-door__glyph">
                  <RoomGlyph room={key} />
                </span>
                <span className="room-door__name">{room.name}</span>
                <span className="room-door__tag">{room.tagline}</span>
                <span className="room-door__enter">Enter →</span>
              </button>
            );
          })}
        </div>
      </main>

      <footer className="gym__timebar">
        <TimeControls />
      </footer>

      {/* The corkboard — the gym's quiet life */}
      <GymLogBoard />

      {/* Overlays */}
      <ArrivalNotice />
      <RoomRouter />
      <FighterProfile />
      <WalkInViewer />
      <Toast />
    </div>
  );
}
