/*
  GymScreen — the main game screen
  --------------------------------------------------------------------------
  The regional gym background fills the viewport. Over it sit four spatial
  room panels (the physical navigation metaphor — you cross the floor to a
  room, you don't click a dashboard tab). A thin top bar carries gym identity
  and the exit; the time controls sit on the floor along the bottom edge.

  Phase 1 boundaries:
  - Rooms open to labeled placeholders (RoomPlaceholder).
  - The "[dev] region" switcher is review-only scaffolding and is removed in
    Phase 2 once city selection fixes the region at game start.
*/

import { useGame } from '../state/GameContext';
import { getRegion, REGION_ORDER } from '../game/regions';
import { ROOM_ORDER, ROOMS } from '../game/rooms';
import { GymBackground } from '../assets/backgrounds';
import { TimeControls } from '../components/TimeControls';
import { RoomPlaceholder } from '../rooms/RoomPlaceholder';
import { RoomGlyph } from '../components/RoomGlyph';
import './GymScreen.css';

export function GymScreen() {
  const { save, openRoom, goHome, setRegion } = useGame();
  if (!save) return null;

  const region = getRegion(save.region);

  return (
    <div className="gym worn">
      <div className="gym__bg layer">
        <GymBackground region={save.region} />
      </div>

      {/* Top chrome — gym identity + exit */}
      <header className="gym__chrome">
        <div className="gym__identity">
          <span className="gym__name">Your Gym</span>
          <span className="gym__region">{region.name} · Local</span>
        </div>

        {/* Review-only region switcher (removed in Phase 2). */}
        <div className="gym__dev">
          <span className="gym__dev-tag">[dev] region</span>
          <div className="gym__dev-switch">
            {REGION_ORDER.map((key) => (
              <button
                key={key}
                className={
                  'gym__dev-btn' + (key === save.region ? ' gym__dev-btn--on' : '')
                }
                onClick={() => setRegion(key)}
                title={getRegion(key).name}
              >
                {getRegion(key).name.slice(0, 2).toUpperCase()}
              </button>
            ))}
          </div>
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
