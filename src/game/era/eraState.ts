/*
  Era State — the scripted history's spine (Living World Bible, Integration)
  --------------------------------------------------------------------------
  At new-game, a seeded stream rolls every scripted beat's dates inside its
  window, its generated cast (era.npcs), and the outcomes the beats need.
  The result is a flat, dated schedule of sub-beats that advanceTime walks —
  THE SCHEDULE NEVER RE-ROLLS. Two saves differ; one save always remembers
  itself.

  The world encounters the schedule only through period channels: clippings
  in the paper, lines on the corkboard, and mechanical weather (purse
  multipliers, offer patterns) the player feels before he can name it.
*/

import { makeRng, seedFrom, type Rng } from '../engine/fightEngine';
import { generateName } from '../names';
import type { CityId } from '../cities';
import type { WeightClassKey } from '../weightClasses';

// --- types -------------------------------------------------------------------

/** A named figure the era invented — champions, novices, heirs. */
export interface EraNpc {
  key: string;
  name: string;
  /** short epithet the paper uses ("the poet-king", "the kid") */
  epithet: string;
  weightClass: WeightClassKey;
}

/** One dated line of the script. */
export interface ScheduledBeat {
  /** parent scripted event id from the Bible */
  eventId: string;
  /** which sub-beat of that event */
  beatKey: string;
  /** absolute dayCount it fires */
  day: number;
  /** set once it has fired (or been skipped by migration) */
  done: boolean;
}

export interface EraState {
  /** the stream everything era-ish rolls from */
  seed: number;
  /** flat, dated, immutable-once-rolled */
  schedule: ScheduledBeat[];
  /** era flags: id → dayCount set (world facts the evaluator and offers read) */
  flags: Record<string, number>;
  /** purse weather by division, 1.0 = baseline */
  purseMultipliers: Partial<Record<WeightClassKey, number>>;
  /** the era's generated cast, by role key */
  npcs: Record<string, EraNpc>;
  /** per-save triggered-event memory: eventId (+scope) → last fired dayCount */
  fired: Record<string, number>;
  /** pacing: dayCount the last triggered event fired (budget guard) */
  lastTriggeredDay: number;
}

// --- generation ---------------------------------------------------------------

/** Days since epoch (Mar 3 1975 = day 0) for a given year/month, roughly. */
export function dayForDate(year: number, month: number, day = 15): number {
  // epoch: 1975-03-03 (see game/time.ts START_EPOCH)
  const epoch = Date.UTC(1975, 2, 3);
  const t = Date.UTC(year, month, day);
  return Math.round((t - epoch) / 86400000);
}

/** Roll an absolute dayCount inside [yearA..yearB] via the era stream. */
export function rollDayInWindow(rng: Rng, yearA: number, yearB: number): number {
  const a = dayForDate(yearA, 0, 5);
  const b = dayForDate(yearB, 11, 20);
  return a + Math.floor(rng() * Math.max(1, b - a));
}

function npc(rng: Rng, cityId: CityId, key: string, epithet: string, weightClass: WeightClassKey): EraNpc {
  const name = generateName(cityId, rng); // era stream: same seed, same cast
  return { key, name: `${name.first} ${name.last}`, epithet, weightClass };
}

export interface BeatRoll {
  eventId: string;
  beatKey: string;
  day: number;
}

/**
 * The starter script (the Bible's Part I is ported here incrementally —
 * the machinery is the deliverable; the registry grows by data).
 * Each entry rolls its own dates from the era stream.
 */
export function rollSchedule(rng: Rng, cast: Record<string, EraNpc>): BeatRoll[] {
  const beats: BeatRoll[] = [];
  const push = (eventId: string, beatKey: string, day: number) =>
    beats.push({ eventId, beatKey, day: Math.max(1, day) });

  // --- poet-kings-last-reign: 2-3 defenses across 1975-76 -------------------
  const defenses = 2 + Math.floor(rng() * 2);
  for (let i = 0; i < defenses; i++) {
    push('poet-kings-last-reign', `defense-${i + 1}`, rollDayInWindow(rng, 1975, 1976));
  }

  // --- poet-king-upset-and-redemption: one upset month, rematch 6-9mo later -
  const upsetDay = rollDayInWindow(rng, 1977, 1979);
  push('poet-king-upset', 'the-upset', upsetDay);
  push('poet-king-upset', 'the-circus', upsetDay + 45 + Math.floor(rng() * 45));
  push('poet-king-upset', 'the-rematch', upsetDay + 180 + Math.floor(rng() * 90));

  // --- poet-king-sad-ending: the bad loss, then the folding chairs ----------
  const sadDay = rollDayInWindow(rng, 1980, 1981);
  push('poet-king-sad-ending', 'the-comeback-announced', sadDay - 60);
  push('poet-king-sad-ending', 'one-fight-too-many', sadDay);
  push('poet-king-sad-ending', 'folding-chairs', sadDay + 380 + Math.floor(rng() * 60));

  // --- bicentennial-olympic-class: fixed Games, seeded debuts ---------------
  push('olympic-class', 'the-games', dayForDate(1976, 6, 20 + Math.floor(rng() * 10)));
  push('olympic-class', 'pro-debuts', dayForDate(1977, Math.floor(rng() * 5), 10));

  void cast;
  return beats.sort((x, y) => x.day - y.day);
}

/**
 * Seed the era once. Deterministic per (seedText): same gym founded the same
 * moment rolls the same history.
 */
export function generateEra(seedText: string, cityId: CityId, startDay: number): EraState {
  const seed = seedFrom(seedText);
  const rng = makeRng(seed);

  const npcs: Record<string, EraNpc> = {};
  const add = (n: EraNpc) => (npcs[n.key] = n);
  add(npc(rng, cityId, 'poet-king', 'the poet-king', 'heavyweight'));
  add(npc(rng, cityId, 'generational-rival', 'his old rival', 'heavyweight'));
  add(npc(rng, cityId, 'gap-tooth-novice', 'the gap-toothed kid', 'heavyweight'));
  add(npc(rng, cityId, 'heir', 'the heir', 'heavyweight'));
  add(npc(rng, cityId, 'golden-welterweight', 'the golden boy', 'welterweight'));

  const rolls = rollSchedule(rng, npcs);
  return {
    seed,
    schedule: rolls.map((r) => ({ ...r, done: r.day <= startDay })),
    flags: {},
    purseMultipliers: { heavyweight: 1.2 }, // the king's shine, from day one
    npcs,
    fired: {},
    lastTriggeredDay: -999,
  };
}

// --- reads ---------------------------------------------------------------------

/** Era purse weather for a division (1.0 when unremarked). */
export function eraPurseMultiplier(era: EraState | undefined, wc: WeightClassKey): number {
  return era?.purseMultipliers[wc] ?? 1;
}
