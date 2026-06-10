/*
  Departures
  --------------------------------------------------------------------------
  Fighters leave, and how they leave tells a story (bible: Fighter Departures).

  - Quit — feels ignored, isn't improving, loses faith. Most likely from men
    with no locker, especially those on the chopping block. This one's on you.
  - Leaves for better opportunity — you developed real talent and didn't give
    him a home; a bigger operation noticed. Bittersweet, and a reputation
    signal. Only happens to genuinely promising fighters you've left lockerless.

  Cut is a separate, player-driven action (resolveCut): some men vanish, some
  ask to stay and earn the locker back. Ages-out is a later-phase concern.

  This module is pure: it reads roster state and reports who's leaving. The
  context applies the result and surfaces the notice.
*/

import type { RosterEntry } from './roster';

export type DepartureReason = 'quit' | 'left_for_opportunity';

export interface Departure {
  entry: RosterEntry;
  reason: DepartureReason;
}

/** Daily probability this fighter walks away on his own. */
function dailyQuitChance(e: RosterEntry): number {
  if (e.hasLocker) {
    // His needs are largely met. Locker holders rarely quit, and the men you've
    // committed to almost never walk on their own (~5%/yr).
    if (e.tier === 'must_keep') return 0.00015;
    if (e.tier === 'watch') return 0.001;
    return 0.005; // chopping block but still has a locker — he can feel the cold
  }
  // No locker — loyalty is fragile.
  if (e.tier === 'must_keep') return 0.006; // valued yet unsettled; a contradiction he feels
  if (e.tier === 'watch') return 0.012;
  return 0.03; // neglected and on the block
}

/** Genuine talent left lockerless is the one a rival might lure away. */
function reasonFor(e: RosterEntry): DepartureReason {
  const promising = e.fighter.potential >= 65;
  if (!e.hasLocker && promising && Math.random() < 0.4) return 'left_for_opportunity';
  return 'quit';
}

export interface DepartureResult {
  staying: RosterEntry[];
  departed: Departure[];
}

/** Advance the roster by `days`, returning who stayed and who left. */
export function evaluateDepartures(roster: RosterEntry[], days: number): DepartureResult {
  const staying: RosterEntry[] = [];
  const departed: Departure[] = [];

  for (const e of roster) {
    const p = dailyQuitChance(e);
    let left = false;
    for (let d = 0; d < days; d++) {
      if (Math.random() < p) {
        left = true;
        break;
      }
    }
    if (left) departed.push({ entry: e, reason: reasonFor(e) });
    else staying.push(e);
  }

  return { staying, departed };
}

export type CutOutcome = 'vanish' | 'stay';

/**
 * When you cut a man, he chooses how to take it. Some clear out their locker
 * and are gone by morning; some ask to stay and train without one, trying to
 * earn it back — and that choice reveals something about him.
 */
export function resolveCut(_entry: RosterEntry): CutOutcome {
  return Math.random() < 0.5 ? 'vanish' : 'stay';
}
