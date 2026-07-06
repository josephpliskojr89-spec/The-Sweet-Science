/*
  WalkInViewer — the man at the door, evaluated like everything else.
  --------------------------------------------------------------------------
  A narrow management sheet, one applicant at a time: photograph, vitals,
  your first read, how long he'll wait — and the decision, with capacity
  facts on the buttons. Esc files him as PENDING (decide later); the rest
  of the queue advances card by card.

  Fog unchanged: no numbers on a man you haven't trained — just your read.
*/

import { useEffect } from 'react';
import { useGame, lockersUsed, noLockerUsed } from '../state/GameContext';
import { fighterAge } from '../game/fighters';
import { WEIGHT_CLASSES, formatHeight } from '../game/weightClasses';
import { getCity } from '../game/cities';
import { Portrait } from '../assets/portraits';
import './WalkInViewer.css';

export function WalkInViewer() {
  const {
    save,
    viewerIds,
    viewerIndex,
    decideWalkIn,
    closeWalkInViewer,
    openWalkIns,
    lockerCap,
    noLockerCap,
  } = useGame();

  const done = !viewerIds || viewerIndex >= viewerIds.length;
  const currentId = done ? null : viewerIds[viewerIndex];
  const walkIn =
    currentId && save ? save.walkIns.find((w) => w.fighter.id === currentId) : undefined;

  useEffect(() => {
    if (!viewerIds) return;
    if (viewerIndex >= viewerIds.length) {
      closeWalkInViewer();
    } else if (currentId && !walkIn) {
      openWalkIns(viewerIds, viewerIndex + 1);
    }
  }, [viewerIds, viewerIndex, currentId, walkIn, closeWalkInViewer, openWalkIns]);

  // the viewer owns Escape — Esc files him as pending
  useEffect(() => {
    if (done) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeWalkInViewer();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [done, closeWalkInViewer]);

  if (!save || done || !currentId || !walkIn) return null;

  const total = viewerIds.length;
  const remaining = total - viewerIndex - 1;
  const lockersLeft = lockerCap - lockersUsed(save);
  const lockersFull = lockersLeft <= 0;
  const noLockerLeft = noLockerCap - noLockerUsed(save);
  const noLockerFull = noLockerLeft <= 0;
  const f = walkIn.fighter;
  const cls = WEIGHT_CLASSES[f.weightClass];
  const home = getCity(f.homeCityId);

  return (
    <div className="wiv surface" role="dialog" aria-label={`Walk-in: ${f.firstName} ${f.lastName}`}>
      <div className="surface__sheet surface__sheet--narrow">
        <header className="surface__mast">
          <h2 className="surface__title">
            AT THE DOOR{total > 1 ? ` — ${viewerIndex + 1} OF ${total}` : ''}
          </h2>
          <div className="surface__tabs">
            <button className="surface__close" onClick={closeWalkInViewer}>
              DECIDE LATER <span className="surface__esc">ESC</span>
            </button>
          </div>
        </header>

        <div className="surface__body">
          <div className="wiv__man">
            <div className="fp__photo">
              <Portrait appearance={f.appearance} size={130} />
            </div>
            <div className="wiv__facts">
              <h3 className="fp__name">
                {f.lastName.toUpperCase()}, {f.firstName.toUpperCase()}
              </h3>
              <dl className="fp__vitals">
                <div>
                  <dt>AGE</dt>
                  <dd>{fighterAge(f)}</dd>
                </div>
                <div>
                  <dt>CLASS</dt>
                  <dd>{cls.name.toUpperCase()}</dd>
                </div>
                <div>
                  <dt>HEIGHT</dt>
                  <dd>{formatHeight(f.heightInches)}</dd>
                </div>
                <div>
                  <dt>HOME</dt>
                  <dd>{home.name.toUpperCase()}</dd>
                </div>
              </dl>
              {walkIn.patience <= 3 ? (
                <span className="tag tag--bad">IN A HURRY — WON’T WAIT LONG</span>
              ) : (
                <span className="tag">
                  WILL WAIT — {walkIn.patience} {walkIn.patience === 1 ? 'DAY' : 'DAYS'}
                </span>
              )}
            </div>
          </div>

          <section aria-label="Your read">
            <h4 className="surface__section">YOUR READ</h4>
            <p className="wiv__impression">“{f.firstImpression}”</p>
          </section>

          <section aria-label="The decision">
            <h4 className="surface__section">THE DECISION</h4>
            <div className="wiv__decide">
              <button
                className="unit__action wiv__btn"
                disabled={lockersFull}
                onClick={() => decideWalkIn(currentId, 'locker')}
              >
                SIGN — GIVE HIM A LOCKER
                <span className="wiv__cap">
                  {lockersFull ? 'EVERY LOCKER FULL' : `${lockersLeft} OF ${lockerCap} OPEN`}
                </span>
              </button>
              <button
                className="unit__action wiv__btn"
                disabled={noLockerFull}
                onClick={() => decideWalkIn(currentId, 'no_locker')}
              >
                SIGN — FLOOR ONLY
                <span className="wiv__cap">
                  {noLockerFull ? 'NO ROOM ON THE BENCH' : `${noLockerLeft} OF ${noLockerCap} SPOTS`}
                </span>
              </button>
              <button
                className="unit__action unit__action--danger wiv__btn"
                onClick={() => decideWalkIn(currentId, 'turn_away')}
              >
                NOT FOR US
                <span className="wiv__cap">TURN HIM AWAY</span>
              </button>
            </div>
            {remaining > 0 && (
              <p className="surface__note wiv__more">
                {remaining} MORE {remaining === 1 ? 'MAN' : 'MEN'} WAITING BEHIND HIM
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
