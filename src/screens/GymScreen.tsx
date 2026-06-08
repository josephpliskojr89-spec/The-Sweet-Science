/*
  GymScreen — the main game screen
  --------------------------------------------------------------------------
  The regional gym background (derived from the chosen city) fills the
  viewport. Over it sit four spatial room panels — the physical navigation
  metaphor, you cross the floor to a room. A thin top bar carries gym identity
  and the exit; the time controls sit on the floor along the bottom edge.

  Rooms open to labeled placeholders (RoomPlaceholder) until their phases land.
*/

import { useGame } from '../state/GameContext';
import { regionOf } from '../state/persistence';
import { getRegion } from '../game/regions';
import { getCity } from '../game/cities';
import { ROOM_ORDER, ROOMS } from '../game/rooms';
import { GymBackground } from '../assets/backgrounds';
import { TimeControls } from '../components/TimeControls';
import { RoomPlaceholder } from '../rooms/RoomPlaceholder';
import { RoomGlyph } from '../components/RoomGlyph';
import './GymScreen.css';

export function GymScreen() {
  const { save, openRoom, goHome } = useGame();
  if (!save) return null;

  const region = getRegion(regionOf(save));
  const city = getCity(save.cityId);

  return (
    <div className="gym worn">
      <div className="gym__bg layer">
        <GymBackground region={region.key} />
      </div>

      {/* Top chrome — gym identity + exit */}
      <header className="gym__chrome">
        <div className="gym__identity">
          <span className="gym__name">{save.gymName}</span>
          <span className="gym__region">
            {city.name}, {city.state} · Local
          </span>
        </div>

        <button className="gym__exit" onClick={goHome} title="Leave for the home screen">
          ⏻ Home
        </button>
      </header>

      {/* The floor — four spatial room panels */}
      <main className="gym__floor">
        <div className="gym__rooms">
          {ROOM_ORDER.map((key) => {
            const room = ROOMS[key];
            return (
              <button
                key={key}
                className={`room-door room-door--${key}`}
                onClick={() => openRoom(key)}
              >
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

      {/* Time advancement lives on the floor */}
      <footer className="gym__timebar">
        <TimeControls />
      </footer>

      {/* Room interior overlay */}
      <RoomPlaceholder />
    </div>
  );
}
