/*
  ArrivalNotice
  --------------------------------------------------------------------------
  Surfaces after a time advance. New walk-ins are answered with View Now (open
  the cards) or View Later (they wait in My Office). It also quietly reports any
  walk-ins who gave up and left while you were busy — the cost of delay is real.
*/

import { useGame } from '../state/GameContext';
import './ArrivalNotice.css';

export function ArrivalNotice() {
  const { arrival, viewArrivalsNow, dismissArrival } = useGame();
  if (!arrival) return null;

  const { arrived, expired } = arrival;
  const hasArrivals = arrived.length > 0;

  return (
    <div className="arrival" role="alert">
      <div className="arrival__glow" aria-hidden="true" />

      {hasArrivals ? (
        <>
          <p className="arrival__eyebrow">A knock at the door</p>
          <p className="arrival__line">
            {arrived.length === 1
              ? 'Someone walked in looking for a gym.'
              : `${arrived.length} fighters walked in looking for a gym.`}
          </p>
          {expired.length > 0 && (
            <p className="arrival__sub">
              {expired.length === 1
                ? 'One who’d been waiting gave up and found another gym.'
                : `${expired.length} who’d been waiting gave up and found other gyms.`}
            </p>
          )}
          <div className="arrival__actions">
            <button className="arrival__btn arrival__btn--now" onClick={viewArrivalsNow}>
              View Now
            </button>
            <button className="arrival__btn" onClick={dismissArrival}>
              View Later
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="arrival__eyebrow">While you were busy</p>
          <p className="arrival__line">
            {expired.length === 1
              ? 'A waiting fighter gave up and found another gym.'
              : `${expired.length} waiting fighters gave up and found other gyms.`}
          </p>
          <div className="arrival__actions">
            <button className="arrival__btn" onClick={dismissArrival}>
              Noted
            </button>
          </div>
        </>
      )}
    </div>
  );
}
