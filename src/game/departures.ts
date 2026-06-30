/*
  Departures
  --------------------------------------------------------------------------
  Fighters leave, and how they leave tells a story (bible: Fighter Departures).

  Two clocks, because a man you committed to and a man on trial don't leave the
  same way:

  - Locker holders run on a quit roll — structure plus the pull of a damaged
    relationship. A betrayed locker holder walks anyway ('quit').
  - Lockerless men are trialists, and run on a hidden patience clock. It drains
    a little every day — faster when he's unhappy, ambitious, or being passed
    over — and when it's spent he stops waiting for a gym that wants him
    ('moved_on'). A genuinely promising trialist a rival noticed leaves for a
    bigger operation instead ('left_for_opportunity') — bittersweet, and a
    reputation signal.

  Cut is a separate, player-driven action (resolveCut): some men vanish, some
  ask to stay and earn the locker back. "Stop considering" a trialist isn't here
  — it just collapses his patience (GameContext) so this clock moves him out.

  This module is pure: it reads roster state and reports who's leaving. The
  context applies the result and surfaces the notice.
*/

import type { RosterEntry } from './roster';
import { relationshipQuitBonus } from './relationship';

export type DepartureReason = 'quit' | 'left_for_opportunity' | 'moved_on';

export interface Departure {
  entry: RosterEntry;
  reason: DepartureReason;
  /** The rival gym that signed him, when he was poached by name (6C-4). */
  toGym?: string;
}

/** Structural daily quit chance from his place in the gym. Locker holders only;
    lockerless men run on the patience clock instead. */
function structuralQuitChance(e: RosterEntry): number {
  // His needs are largely met. Locker holders rarely quit, and the men you've
  // committed to almost never walk on their own (~5%/yr).
  if (e.tier === 'must_keep') return 0.00015;
  if (e.tier === 'watch') return 0.001;
  return 0.005; // chopping block but still has a locker — he can feel the cold
}

/** Daily probability a locker holder walks away on his own — structure plus the
    pull of a damaged relationship (a betrayed locker holder leaves anyway). */
function dailyQuitChance(e: RosterEntry): number {
  return Math.min(structuralQuitChance(e) + relationshipQuitBonus(e), 0.06);
}

/** How fast a trialist's patience drains per day. Base ~1/day, pushed by mood
    and ambition. A content, settled man can wait months; an unhappy glory
    hunter who's been passed over runs out fast. */
function patienceDrainPerDay(e: RosterEntry): number {
  let rate = 1;
  if (e.morale < 40) rate *= 1.5;
  else if (e.morale > 65) rate *= 0.7;
  const traits = [...e.fighter.visibleTraits, ...e.fighter.hiddenTraits];
  if (traits.includes('glory_hunter') || traits.includes('chip_on_shoulder')) rate *= 1.2;
  // On the block, he reads the writing on the wall a little faster.
  if (e.tier === 'chopping') rate *= 1.2;
  return rate;
}

/** When a trialist finally stops waiting — a rival may have turned his head. */
function trialistReason(e: RosterEntry): DepartureReason {
  const promising = e.fighter.potential >= 65;
  if (promising && Math.random() < 0.4) return 'left_for_opportunity';
  return 'moved_on';
}

export interface DepartureResult {
  staying: RosterEntry[];
  departed: Departure[];
}

/** Advance the roster by `days`, returning who stayed and who left. Locker
    holders are rolled; lockerless trialists drain patience and leave when it's
    spent (the staying ones come back with patience decremented). */
export function evaluateDepartures(roster: RosterEntry[], days: number): DepartureResult {
  const staying: RosterEntry[] = [];
  const departed: Departure[] = [];

  for (const e of roster) {
    if (e.hasLocker) {
      const p = dailyQuitChance(e);
      let left = false;
      for (let d = 0; d < days; d++) {
        if (Math.random() < p) {
          left = true;
          break;
        }
      }
      if (left) departed.push({ entry: e, reason: 'quit' });
      else staying.push(e);
      continue;
    }

    // Lockerless — drain the patience clock.
    const next = e.trialPatience - patienceDrainPerDay(e) * days;
    if (next <= 0) departed.push({ entry: e, reason: trialistReason(e) });
    else staying.push({ ...e, trialPatience: next });
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
