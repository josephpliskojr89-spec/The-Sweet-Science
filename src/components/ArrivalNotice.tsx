/*
  ArrivalNotice
  --------------------------------------------------------------------------
  The post-advance notice. New walk-ins are answered with View Now / View Later
  (later cards wait in My Office). It also reports walk-ins who gave up while
  you were busy, and fighters who left the gym — quit, or lured away by a bigger
  opportunity. The cost of neglect is made visible.
*/

import { useGame } from '../state/GameContext';
import { fighterFullName } from '../game/fighters';
import type { Departure } from '../game/departures';
import './ArrivalNotice.css';

function departureLine(d: Departure): string {
  const name = fighterFullName(d.entry.fighter);
  if (d.reason === 'left_for_opportunity') return `${name} left for a bigger opportunity.`;
  if (d.reason === 'moved_on') return `${name} stopped waiting for a locker and moved on.`;
  return `${name} lost faith and walked away.`;
}

export function ArrivalNotice() {
  const { arrival, viewArrivalsNow, dismissArrival } = useGame();
  if (!arrival) return null;

  const { arrived, expired, departed, poached } = arrival;
  const hasArrivals = arrived.length > 0;

  const poachLines =
    poached.length === 0 ? null : (
      <ul className="arrival__departures arrival__departures--poach">
        {poached.map((p) => (
          <li key={p.fighter.id}>
            {fighterFullName(p.fighter)} signed with {p.gymName} while you weighed it.
          </li>
        ))}
      </ul>
    );

  const expiredLine =
    expired.length === 0
      ? null
      : expired.length === 1
        ? 'One who’d been waiting gave up and found another gym.'
        : `${expired.length} who’d been waiting gave up and found other gyms.`;

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
          {expiredLine && <p className="arrival__sub">{expiredLine}</p>}
          {departed.length > 0 && (
            <ul className="arrival__departures">
              {departed.map((d) => (
                <li key={d.entry.fighter.id}>{departureLine(d)}</li>
              ))}
            </ul>
          )}
          {poachLines}
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
          {expiredLine && <p className="arrival__line">{expiredLine}</p>}
          {departed.length > 0 && (
            <ul className="arrival__departures">
              {departed.map((d) => (
                <li key={d.entry.fighter.id}>{departureLine(d)}</li>
              ))}
            </ul>
          )}
          {poachLines}
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
