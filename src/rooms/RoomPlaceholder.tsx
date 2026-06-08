/*
  RoomPlaceholder
  --------------------------------------------------------------------------
  The interior each room opens into for Phase 1. It isn't empty — it states the
  room's purpose and lists what will live here, with the phase that brings it
  online. That keeps the navigation meaningful to review and gives every later
  system a labeled home to build into.

  Presented FULL-SCREEN — you've walked into the room and the gym floor is
  behind you, not a panel sliding over it. A persistent "back to the floor"
  affordance (and Esc) returns you.
*/

import { useEffect } from 'react';
import { useGame } from '../state/GameContext';
import { ROOMS } from '../game/rooms';
import { RoomGlyph } from '../components/RoomGlyph';
import { GlovesEmblem } from '../components/GlovesEmblem';
import './RoomPlaceholder.css';

export function RoomPlaceholder() {
  const { activeRoom, closeRoom } = useGame();

  // Escape closes the room — physical "step back onto the floor".
  useEffect(() => {
    if (!activeRoom) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeRoom();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeRoom, closeRoom]);

  if (!activeRoom) return null;
  const room = ROOMS[activeRoom];

  return (
    <div className="room-screen worn" role="dialog" aria-label={room.name}>
      <div className="room-screen__backdrop" aria-hidden="true" />

      <header className="room-screen__chrome">
        <button className="room-screen__back" onClick={closeRoom} title="Back to the floor (Esc)">
          ← Back to the floor
        </button>
        <span className="room-screen__breadcrumb">Your Gym · {room.name}</span>
      </header>

      <div className="room-screen__body">
        <div className="room-panel">
          <header className="room-panel__head">
            <span className="room-panel__glyph">
              <RoomGlyph room={room.key} size={56} />
            </span>
            <div>
              <p className="room-panel__eyebrow">You step into</p>
              <h2 className="room-panel__title">{room.name}</h2>
            </div>
          </header>

          <p className="room-panel__tagline">{room.tagline}</p>

          <div className="room-panel__divider">
            <span className="room-panel__divider-seg" />
            <span className="room-panel__list-label">What lives here</span>
            <span className="room-panel__divider-seg" />
          </div>

          <ul className="room-panel__list">
            {room.contents.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>

          <footer className="room-panel__foot">
            <GlovesEmblem size={26} className="room-panel__gloves" />
            <span className="room-panel__phase">Comes online in {room.arrivesIn}</span>
          </footer>
        </div>
      </div>
    </div>
  );
}
