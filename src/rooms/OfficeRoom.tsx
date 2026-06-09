/*
  OfficeRoom — My Office (Phase 3 slice)
  --------------------------------------------------------------------------
  The business side. Phase 3 brings the walk-in review desk online: cards the
  player chose to look at later queue here, each showing the man, his read, and
  how long he'll keep waiting. Clicking one reopens the card and its decision.

  The rest of the office (finances, upgrades, coaches, fight booking, rival
  gyms) is Phase 6 and shown as a roadmap so the room reads complete.
*/

import { useEffect } from 'react';
import { useGame } from '../state/GameContext';
import { fighterFullName } from '../game/fighters';
import { WEIGHT_CLASSES } from '../game/weightClasses';
import { Portrait } from '../assets/portraits';
import './OfficeRoom.css';

const FUTURE_DESK = [
  'View and manage finances',
  'Purchase gym upgrades',
  'Hire and manage coaches',
  'Book fights for your fighters',
  'Rival Gyms — intelligence on competing operations',
];

export function OfficeRoom() {
  const { save, closeRoom, openWalkIns } = useGame();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeRoom();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeRoom]);

  if (!save) return null;
  const queue = save.walkIns;
  const ids = queue.map((w) => w.fighter.id);

  return (
    <div className="room-screen worn" role="dialog" aria-label="My Office">
      <div className="room-screen__backdrop" aria-hidden="true" />

      <header className="room-screen__chrome">
        <button className="room-screen__back" onClick={closeRoom} title="Back to the floor (Esc)">
          ← Back to the floor
        </button>
        <span className="room-screen__breadcrumb">Your Gym · My Office</span>
      </header>

      <div className="room-screen__body office__body">
        <div className="office">
          <header className="office__head">
            <h2 className="office__title">Walk-Ins</h2>
            <span className="office__count">
              {queue.length === 0
                ? 'No one waiting'
                : `${queue.length} waiting for an answer`}
            </span>
          </header>

          {queue.length === 0 ? (
            <p className="office__empty">
              The bench by the door is empty. Advance time and keep the lights
              on — word spreads, and someone always walks in eventually.
            </p>
          ) : (
            <ul className="office__queue">
              {queue.map((w, i) => {
                const f = w.fighter;
                return (
                  <li key={f.id}>
                    <button className="qrow" onClick={() => openWalkIns(ids, i)}>
                      <span className="qrow__portrait">
                        <Portrait appearance={f.appearance} size={48} />
                      </span>
                      <span className="qrow__main">
                        <span className="qrow__name">{fighterFullName(f)}</span>
                        <span className="qrow__meta">
                          {f.age} yrs · {WEIGHT_CLASSES[f.weightClass].name}
                        </span>
                        <span className="qrow__impression">“{f.firstImpression}”</span>
                      </span>
                      <span className="qrow__right">
                        <span
                          className={
                            'qrow__patience' +
                            (w.patience <= 3 ? ' qrow__patience--low' : '')
                          }
                        >
                          {w.patience <= 3 ? 'impatient' : `~${w.patience}d`}
                        </span>
                        <span className="qrow__review">Review →</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="office__divider">
            <span className="office__divider-seg" />
            <span className="office__divider-label">The rest of the desk</span>
            <span className="office__divider-seg" />
          </div>
          <ul className="office__future">
            {FUTURE_DESK.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <p className="office__future-note">Comes online in Phase 6</p>
        </div>
      </div>
    </div>
  );
}
