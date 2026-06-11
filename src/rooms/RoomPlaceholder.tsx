/*
  RoomPlaceholder
  --------------------------------------------------------------------------
  The full-screen interior a not-yet-built room opens into. It states the
  room's purpose and lists what will live here, with the phase that brings it
  online — so the navigation stays meaningful and every later system has a
  labeled home. An optional `summary` lets a room show real, current data
  (e.g. the Locker Room's roster count) above the roadmap.
*/

import { useEffect, type ReactNode } from 'react';
import { useGame, type RoomKey } from '../state/GameContext';
import { ROOMS } from '../game/rooms';
import { RoomGlyph } from '../components/RoomGlyph';
import { GlovesEmblem } from '../components/GlovesEmblem';
import './RoomPlaceholder.css';

interface Props {
  roomKey: RoomKey;
  summary?: ReactNode;
}

export function RoomPlaceholder({ roomKey, summary }: Props) {
  const { closeRoom, profileId, viewerIds } = useGame();
  const room = ROOMS[roomKey];

  // Esc steps back to the floor — but only when this room is the top layer.
  const overlayOpen = profileId !== null || viewerIds !== null;
  useEffect(() => {
    if (overlayOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeRoom();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeRoom, overlayOpen]);

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
              <RoomGlyph room={roomKey} size={56} />
            </span>
            <div>
              <p className="room-panel__eyebrow">You step into</p>
              <h2 className="room-panel__title">{room.name}</h2>
            </div>
          </header>

          <p className="room-panel__tagline">{room.tagline}</p>

          {summary && <div className="room-panel__summary">{summary}</div>}

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
