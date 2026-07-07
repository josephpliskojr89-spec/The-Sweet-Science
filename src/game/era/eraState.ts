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
import { ARCS } from './beats';
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

function npc(
  rng: Rng,
  cityId: CityId,
  key: string,
  epithet: string,
  weightClass: WeightClassKey,
): EraNpc {
  const name = generateName(cityId, rng); // era stream: same seed, same cast
  return { key, name: `${name.first} ${name.last}`, epithet, weightClass };
}

export interface BeatRoll {
  eventId: string;
  beatKey: string;
  day: number;
}

/**
 * Seed the era once. Deterministic per (seedText): same gym founded the same
 * moment rolls the same history. Every arc in the registry rolls its cast
 * and its dated beats from per-arc streams derived from the era seed, so
 * adding a NEW arc to the registry never disturbs an existing arc's dates.
 */
export function generateEra(seedText: string, cityId: CityId, startDay: number): EraState {
  const seed = seedFrom(seedText);
  const base: EraState = {
    seed,
    schedule: [],
    flags: {},
    purseMultipliers: { heavyweight: 1.2 }, // the king's shine, from day one
    npcs: {},
    fired: {},
    lastTriggeredDay: -999,
  };
  return topUpEra(base, cityId, startDay);
}

/**
 * Bring an era up to the full arc registry: any arc with no beats in the
 * schedule is rolled now (from a stream derived from the era seed and the
 * arc id — deterministic, and independent of every other arc), its cast is
 * added, and beats already past are marked done so an old save never gets
 * a retroactive decade of clippings. Idempotent.
 */
export function topUpEra(era: EraState, cityId: CityId, startDay: number): EraState {
  const present = new Set(era.schedule.map((b) => b.eventId));
  let schedule = era.schedule;
  let npcs = era.npcs;

  for (const arc of ARCS) {
    // cast first — cross-arc copy may reference another arc's names
    for (const spec of arc.npcs ?? []) {
      if (npcs[spec.key]) continue;
      const rng = makeRng(seedFrom(`${era.seed}:npc:${spec.key}`));
      npcs = { ...npcs, [spec.key]: npc(rng, cityId, spec.key, spec.epithet, spec.weightClass) };
    }
    if (present.has(arc.id)) continue;
    const rng = makeRng(seedFrom(`${era.seed}:arc:${arc.id}`));
    const rolls = arc.roll(rng).map((r) => ({
      ...r,
      day: Math.max(1, r.day),
      done: r.day <= startDay,
    }));
    schedule = [...schedule, ...rolls];
  }

  if (schedule === era.schedule && npcs === era.npcs) return era;
  return { ...era, schedule: [...schedule].sort((a, b) => a.day - b.day), npcs };
}

// --- reads ---------------------------------------------------------------------

/** Era purse weather for a division (1.0 when unremarked). */
export function eraPurseMultiplier(era: EraState | undefined, wc: WeightClassKey): number {
  return era?.purseMultipliers[wc] ?? 1;
}
