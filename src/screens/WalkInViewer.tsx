/*
  WalkInViewer
  --------------------------------------------------------------------------
  Opens over everything to present a walk-in and the decision the bible calls
  the heartbeat: give him a locker, let him train without one, or turn him
  away — made on incomplete information. Walks a sequence (a batch of arrivals,
  or one card from the My Office queue) and closes when it's worked through.

  The locker decision respects the 20-locker cap. Hierarchy management (must
  keep / watch / chopping block) is Phase 4 — here we just open the door or not.
*/

import { useEffect } from 'react';
import { useGame, lockersUsed } from '../state/GameContext';
import { WalkInCard } from '../components/WalkInCard/WalkInCard';
import './WalkInViewer.css';

export function WalkInViewer() {
  const {
    save,
    viewerIds,
    viewerIndex,
    decideWalkIn,
    closeWalkInViewer,
    lockerCap,
  } = useGame();

  const done = !viewerIds || viewerIndex >= viewerIds.length;

  // Close once the sequence is worked through.
  useEffect(() => {
    if (viewerIds && viewerIndex >= viewerIds.length) closeWalkInViewer();
  }, [viewerIds, viewerIndex, closeWalkInViewer]);

  if (!save || done) return null;

  const currentId = viewerIds[viewerIndex];
  const walkIn = save.walkIns.find((w) => w.fighter.id === currentId);
  if (!walkIn) return null; // decided/expired between renders

  const total = viewerIds.length;
  const lockersFull = lockersUsed(save) >= lockerCap;
  const lockersLeft = lockerCap - lockersUsed(save);

  return (
    <div className="wiv" role="dialog" aria-label="Walk-in">
      <div className="wiv__scrim" />

      <div className="wiv__stage">
        {total > 1 && (
          <p className="wiv__progress">
            At the door · {viewerIndex + 1} of {total}
          </p>
        )}

        <WalkInCard fighter={walkIn.fighter} />

        <div className="wiv__decision">
          <p className="wiv__patience">
            {walkIn.patience <= 3
              ? 'He looks impatient. He won’t wait long.'
              : `He’ll wait around ${walkIn.patience} more days for an answer.`}
          </p>

          <div className="wiv__actions">
            <button
              className="wiv__btn wiv__btn--locker"
              disabled={lockersFull}
              onClick={() => decideWalkIn(currentId, 'locker')}
              title={lockersFull ? 'All 20 lockers are full' : undefined}
            >
              <span className="wiv__btn-main">Give him a locker</span>
              <span className="wiv__btn-sub">
                {lockersFull ? 'lockers full' : `${lockersLeft} of ${lockerCap} left`}
              </span>
            </button>

            <button
              className="wiv__btn"
              onClick={() => decideWalkIn(currentId, 'no_locker')}
            >
              <span className="wiv__btn-main">Train without a locker</span>
              <span className="wiv__btn-sub">provisional · limited development</span>
            </button>

            <button
              className="wiv__btn wiv__btn--turn"
              onClick={() => decideWalkIn(currentId, 'turn_away')}
            >
              <span className="wiv__btn-main">Turn him away</span>
              <span className="wiv__btn-sub">not right for this gym</span>
            </button>
          </div>

          <button className="wiv__later" onClick={closeWalkInViewer}>
            Decide later — keep his card in My Office
          </button>
        </div>
      </div>
    </div>
  );
}
