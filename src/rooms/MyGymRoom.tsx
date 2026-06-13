/*
  MyGymRoom — My Gym: Coaching & Staff (Phase 5+, expands in Phase 6)
  --------------------------------------------------------------------------
  The gym-wide, above-the-individual view. Your training identity (the city's
  style philosophy), your focused-training capacity and who's currently using
  it, and your coaching staff. Per-fighter training assignment lives in the
  Locker Room now — this room is the gym, not the man.

  Coach hiring and assigning fighters to coaches arrive in Phase 6; the staff
  section is the placeholder for it.
*/

import { useEffect } from 'react';
import { useGame } from '../state/GameContext';
import { getCity } from '../game/cities';
import { fighterFullName } from '../game/fighters';
import { focusLabel, gymPhilosophyLabel } from '../game/training';
import { Portrait } from '../assets/portraits';
import './MyGymRoom.css';

export function MyGymRoom() {
  const { save, closeRoom, profileId, viewerIds, focusCapacity, openRoom, openProfile } = useGame();

  const overlayOpen = profileId !== null || viewerIds !== null;
  useEffect(() => {
    if (overlayOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeRoom();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeRoom, overlayOpen]);

  if (!save) return null;

  const philosophy = gymPhilosophyLabel(getCity(save.cityId).archetype);
  const focused = save.roster.filter((e) => e.focus !== null);

  return (
    <div className="room-screen worn" role="dialog" aria-label="My Gym">
      <div className="room-screen__backdrop" aria-hidden="true" />

      <header className="room-screen__chrome">
        <button className="room-screen__back" onClick={closeRoom} title="Back to the floor (Esc)">
          ← Back to the floor
        </button>
        <span className="room-screen__breadcrumb">Your Gym · My Gym</span>
      </header>

      <div className="room-screen__body mygym__body">
        <div className="mygym">
          <header className="mygym__head">
            <div>
              <p className="mygym__eyebrow">Coaching &amp; Staff</p>
              <h2 className="mygym__title">My Gym</h2>
            </div>
          </header>

          {/* Training identity */}
          <section className="mygym__section">
            <h3 className="mygym__section-title">Training Identity</h3>
            <p className="mygym__identity">
              This gym brings men up under a <strong>{philosophy}</strong> philosophy.
              Every locker holder develops along it on his own each day; your
              personal attention — focused training — is set per fighter in the
              <button className="mygym__link" onClick={() => openRoom('locker')}>
                Locker Room
              </button>
              .
            </p>
          </section>

          {/* Focused capacity */}
          <section className="mygym__section">
            <div className="mygym__capacity">
              <span className="mygym__cap-count">
                {focused.length} / {focusCapacity}
              </span>
              <span className="mygym__cap-label">focused slots in use</span>
            </div>

            {focused.length === 0 ? (
              <p className="mygym__none">
                No one is in focused training. Pick a fighter or two in the Locker
                Room to give your personal attention.
              </p>
            ) : (
              <ul className="mygym__focused">
                {focused.map((e) => (
                  <li key={e.fighter.id}>
                    <button className="mygym__focused-row" onClick={() => openProfile(e.fighter.id)}>
                      <span className="mygym__focused-portrait">
                        <Portrait appearance={e.fighter.appearance} size={40} />
                      </span>
                      <span className="mygym__focused-name">{fighterFullName(e.fighter)}</span>
                      <span className="mygym__focused-area">{focusLabel(e.focus!)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Staff */}
          <section className="mygym__section">
            <h3 className="mygym__section-title">Your Staff</h3>
            <div className="mygym__staff">
              <div className="mygym__staff-you">
                <span className="mygym__staff-role">Head Trainer</span>
                <span className="mygym__staff-name">{save.manager.name || 'You'}</span>
                <span className="mygym__staff-note">You run every session yourself.</span>
              </div>
            </div>
            <p className="mygym__staff-future">
              You’re a one-man operation. In Phase 6 you’ll hire coaches right
              here to expand your focused-training capacity and put the right man
              with the right fighter.
            </p>
          </section>

          {/* Facilities */}
          <section className="mygym__section">
            <h3 className="mygym__section-title">Facilities &amp; Upgrades</h3>
            <p className="mygym__staff-future">
              More lockers, better equipment, an expanded floor — the gym’s
              physical improvements are bought here, against the money you keep
              in My Office. Comes online in Phase 6.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
