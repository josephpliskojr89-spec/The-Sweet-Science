/*
  ArrivalNotice — the post-advance beat
  --------------------------------------------------------------------------
  Two shapes. When a new issue of the paper has come out (a week was crossed),
  this becomes the FRONT PAGE — the Monday landing: the masthead, the week's
  headlines, and a boxed "at your gym" strip for the personal beats (a knock at
  the door, a man lost). Otherwise it's the plain notice: just the personal
  events from a mid-week day.

  The front page leads with the world and folds your gym in; "Read the full
  paper" jumps to The Press.
*/

import { useGame } from '../state/GameContext';
import { fighterFullName } from '../game/fighters';
import type { Departure } from '../game/departures';
import './ArrivalNotice.css';

function departureLine(d: Departure): string {
  const name = fighterFullName(d.entry.fighter);
  if (d.reason === 'left_for_opportunity' && d.toGym) return `${name} was lured away by ${d.toGym}.`;
  if (d.reason === 'left_for_opportunity') return `${name} left for a bigger opportunity.`;
  if (d.reason === 'moved_on') return `${name} stopped waiting for a locker and moved on.`;
  return `${name} lost faith and walked away.`;
}

export function ArrivalNotice() {
  const { arrival, viewArrivalsNow, dismissArrival, openRoom } = useGame();
  if (!arrival) return null;

  const { arrived, expired, departed, poached, headlines, paperName, dateLabel, newIssue } = arrival;
  const hasArrivals = arrived.length > 0;

  const expiredLine =
    expired.length === 0
      ? null
      : expired.length === 1
        ? 'One who’d been waiting gave up and found another gym.'
        : `${expired.length} who’d been waiting gave up and found other gyms.`;

  const hasPersonal = hasArrivals || expired.length > 0 || departed.length > 0 || poached.length > 0;

  const arrivedLine = hasArrivals
    ? arrived.length === 1
      ? 'Someone walked in looking for a gym.'
      : `${arrived.length} fighters walked in looking for a gym.`
    : null;

  const yourGym = hasPersonal ? (
    <div className="fp-news__yours">
      <span className="fp-news__yours-label">At your gym</span>
      {arrivedLine && <p className="fp-news__yours-line fp-news__yours-line--knock">{arrivedLine}</p>}
      {expiredLine && <p className="fp-news__yours-line">{expiredLine}</p>}
      {departed.map((d) => (
        <p className="fp-news__yours-line" key={d.entry.fighter.id}>
          {departureLine(d)}
        </p>
      ))}
      {poached.map((p) => (
        <p className="fp-news__yours-line" key={p.fighter.id}>
          {fighterFullName(p.fighter)} signed with {p.gymName} while you weighed it.
        </p>
      ))}
    </div>
  ) : null;

  // --- Front page: a new issue is out ---------------------------------------
  if (newIssue) {
    return (
      <div className="arrival arrival--frontpage" role="alert">
        <div className="fp-news">
          <header className="fp-news__masthead">
            <h2 className="fp-news__name">{paperName}</h2>
            <p className="fp-news__tagline">Sporting Pages · {dateLabel}</p>
          </header>

          {yourGym}

          {headlines.length === 0 ? (
            <p className="fp-news__quiet">A quiet week on the fight beat.</p>
          ) : (
            <div className="fp-news__stories">
              {headlines.slice(0, 5).map((c, i) => (
                <article className="fp-news__story" key={`${c.templateId}-${i}`}>
                  <p className="fp-news__story-text">{c.text}</p>
                  <p className="fp-news__story-byline">— {c.byline}</p>
                </article>
              ))}
            </div>
          )}

          <div className="fp-news__actions">
            {hasArrivals && (
              <button className="fp-news__btn fp-news__btn--primary" onClick={viewArrivalsNow}>
                Review at the door
              </button>
            )}
            <button
              className="fp-news__btn"
              onClick={() => {
                openRoom('press');
                dismissArrival();
              }}
            >
              Read the full paper →
            </button>
            <button className="fp-news__btn" onClick={dismissArrival}>
              Back to work
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Plain notice: a mid-week day with personal events only ---------------
  return (
    <div className="arrival" role="alert">
      <div className="arrival__glow" aria-hidden="true" />

      {hasArrivals ? (
        <>
          <p className="arrival__eyebrow">A knock at the door</p>
          <p className="arrival__line">{arrivedLine}</p>
          {expiredLine && <p className="arrival__sub">{expiredLine}</p>}
          {departed.length > 0 && (
            <ul className="arrival__departures">
              {departed.map((d) => (
                <li key={d.entry.fighter.id}>{departureLine(d)}</li>
              ))}
            </ul>
          )}
          {poached.length > 0 && (
            <ul className="arrival__departures arrival__departures--poach">
              {poached.map((p) => (
                <li key={p.fighter.id}>
                  {fighterFullName(p.fighter)} signed with {p.gymName} while you weighed it.
                </li>
              ))}
            </ul>
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
          {expiredLine && <p className="arrival__line">{expiredLine}</p>}
          {departed.length > 0 && (
            <ul className="arrival__departures">
              {departed.map((d) => (
                <li key={d.entry.fighter.id}>{departureLine(d)}</li>
              ))}
            </ul>
          )}
          {poached.length > 0 && (
            <ul className="arrival__departures arrival__departures--poach">
              {poached.map((p) => (
                <li key={p.fighter.id}>
                  {fighterFullName(p.fighter)} signed with {p.gymName} while you weighed it.
                </li>
              ))}
            </ul>
          )}
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
