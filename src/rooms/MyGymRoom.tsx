/*
  MyGymRoom — My Gym (Phase 5)
  --------------------------------------------------------------------------
  The day-to-day craft. Locker holders train automatically under the gym's
  general philosophy (your city's style archetype). Your personal attention —
  focused training — is the scarce thing: a couple of slots at first (just you),
  expanded later by coaches. A focused fighter develops faster, and you steer
  what he works on.

  Development itself runs on time advance (game/training.ts). This room is where
  you assign focus and read where each man is in his arc.
*/

import { useEffect, useState } from 'react';
import { useGame } from '../state/GameContext';
import { getCity } from '../game/cities';
import { fighterFullName } from '../game/fighters';
import { WEIGHT_CLASSES } from '../game/weightClasses';
import type { RosterEntry } from '../game/roster';
import {
  ATTR_KEYS,
  ATTR_LABELS,
  developmentState,
  focusLabel,
  gymPhilosophyLabel,
  type TrainingFocus,
} from '../game/training';
import { Portrait } from '../assets/portraits';
import './MyGymRoom.css';

export function MyGymRoom() {
  const { save, closeRoom, profileId, viewerIds, focusCapacity } = useGame();

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
  const focusedCount = save.roster.filter((e) => e.focus !== null).length;

  const ordered = [...save.roster].sort((a, b) => {
    if (a.hasLocker !== b.hasLocker) return a.hasLocker ? -1 : 1;
    if ((a.focus !== null) !== (b.focus !== null)) return a.focus !== null ? -1 : 1;
    return a.fighter.lastName.localeCompare(b.fighter.lastName);
  });

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
              <h2 className="mygym__title">My Gym</h2>
              <p className="mygym__philosophy">
                Locker holders train daily under the gym’s{' '}
                <strong>{philosophy}</strong> philosophy.
              </p>
            </div>
            <div className="mygym__slots">
              <span className="mygym__slots-count">
                {focusedCount} / {focusCapacity}
              </span>
              <span className="mygym__slots-label">focused slots</span>
              <span className="mygym__slots-note">Just you, for now — coaches add slots (Phase 6)</span>
            </div>
          </header>

          {save.roster.length === 0 ? (
            <p className="mygym__empty">
              No fighters to train yet. Take someone in from the door and the
              work begins.
            </p>
          ) : (
            <ul className="mygym__list">
              {ordered.map((entry) => (
                <TrainingRow
                  key={entry.fighter.id}
                  entry={entry}
                  capacityFull={focusedCount >= focusCapacity}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

const FOCUS_OPTIONS: TrainingFocus[] = ['rounded', ...ATTR_KEYS];

function TrainingRow({ entry, capacityFull }: { entry: RosterEntry; capacityFull: boolean }) {
  const { setFocus, openProfile } = useGame();
  const [picking, setPicking] = useState(false);
  const f = entry.fighter;
  const dev = developmentState(entry);
  const focused = entry.focus !== null;

  return (
    <li className={'trow' + (entry.hasLocker ? '' : ' trow--limited')}>
      <button className="trow__id" onClick={() => openProfile(f.id)} title="Open profile">
        <span className="trow__portrait">
          <Portrait appearance={f.appearance} size={46} />
        </span>
        <span className="trow__identity">
          <span className="trow__name">{fighterFullName(f)}</span>
          <span className="trow__meta">
            {f.age} yrs · {WEIGHT_CLASSES[f.weightClass].name}
          </span>
        </span>
      </button>

      <span className={`trow__dev trow__dev--${dev.tone}`}>{dev.label}</span>

      <div className="trow__focus">
        {!entry.hasLocker ? (
          <span className="trow__limited-tag">Limited — no locker</span>
        ) : picking ? (
          <div className="trow__picker">
            {entry.focus !== null && (
              <button className="trow__pick trow__pick--stop" onClick={() => { setFocus(f.id, null); setPicking(false); }}>
                General only
              </button>
            )}
            {FOCUS_OPTIONS.map((opt) => (
              <button
                key={opt}
                className={'trow__pick' + (entry.focus === opt ? ' trow__pick--on' : '')}
                onClick={() => { setFocus(f.id, opt); setPicking(false); }}
              >
                {opt === 'rounded' ? 'Rounded' : ATTR_LABELS[opt]}
              </button>
            ))}
            <button className="trow__pick trow__pick--cancel" onClick={() => setPicking(false)}>
              ✕
            </button>
          </div>
        ) : focused ? (
          <span className="trow__focused">
            <span className="trow__focused-tag">Focused · {focusLabel(entry.focus!)}</span>
            <button className="trow__focus-btn" onClick={() => setPicking(true)}>change</button>
            <button className="trow__focus-btn" onClick={() => setFocus(f.id, null)} title="Back to general training">✕</button>
          </span>
        ) : (
          <button
            className="trow__focus-btn trow__focus-btn--assign"
            disabled={capacityFull}
            onClick={() => setPicking(true)}
            title={capacityFull ? 'No focused slots left' : 'Give him your focused attention'}
          >
            {capacityFull ? 'Slots full' : 'Assign focus ▸'}
          </button>
        )}
      </div>
    </li>
  );
}
