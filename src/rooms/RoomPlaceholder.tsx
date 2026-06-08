/*
  RoomPlaceholder
  --------------------------------------------------------------------------
  The interior each room opens into for Phase 1. It isn't empty — it states the
  room's purpose and lists what will live here, with the phase that brings it
  online. That keeps the navigation meaningful to review and gives every later
  system a labeled home to build into.

  Presented as a sliding ledger panel over the gym floor — you've stepped into
  the room, not navigated to a tab.
*/

import { useEffect } from 'react';
import { useGame } from '../state/GameContext';
import { ROOMS } from '../game/rooms';
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
    <div className="room-overlay" role="dialog" aria-label={room.name}>
      <button
        className="room-overlay__scrim"
        aria-label="Back to the gym floor"
        onClick={closeRoom}
      />

      <section className="room-panel">
        <header className="room-panel__head">
          <div>
            <p className="room-panel__eyebrow">You step into</p>
            <h2 className="room-panel__title">{room.name}</h2>
          </div>
          <button className="room-panel__close" onClick={closeRoom} title="Back to floor (Esc)">
            ✕
          </button>
        </header>

        <p className="room-panel__tagline">{room.tagline}</p>

        <div className="room-panel__body">
          <p className="room-panel__list-label">What lives here</p>
          <ul className="room-panel__list">
            {room.contents.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>

        <footer className="room-panel__foot">
          <GlovesEmblem size={26} className="room-panel__gloves" />
          <span className="room-panel__phase">Comes online in {room.arrivesIn}</span>
          <button className="room-panel__back" onClick={closeRoom}>
            ← Back to the floor
          </button>
        </footer>
      </section>
    </div>
  );
}
