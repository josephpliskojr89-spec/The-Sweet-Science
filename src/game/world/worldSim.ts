/*
  World Simulation (Phase 6C — the competitive world)
  --------------------------------------------------------------------------
  The world moves whether or not you're watching. Each advance, the population
  ages, develops or declines, fights and builds records, and turns over: old men
  retire and their gyms sign green prospects to replace them. It's a deliberately
  LIGHT model — the real result → ranking → reputation dynamism arrives with the
  Phase 8 fight engine. The point here is that the scene is alive and bounded:
  retirements are matched by signings, so the population holds a steady size
  while the faces change across the decades.

  Pure but rng-driven (Math.random), so it runs in the advance handler like the
  rest of the simulation, never in a render path. Returns the next world plus a
  few human notes; GameContext prints them in the paper (pressItem).
*/

import { getCity } from '../cities';
import {
  signYoungProspect,
  spawnIndependentNear,
  makeNationalElite,
  getRivalGym,
  type WorldState,
  type WorldFighter,
} from './population';

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const RETIRE_FLOOR = 35; // retirement chance starts climbing here

export interface AdvanceWorldResult {
  world: WorldState;
  notes: string[];
}

/** Probability a man retires over `days`, rising with age past the floor. */
function retireChance(age: number, days: number): number {
  if (age < RETIRE_FLOOR) return 0;
  const perMonth = clamp((age - RETIRE_FLOOR) / 6, 0, 1) * 0.5;
  return clamp(perMonth * (days / 30), 0, 0.95);
}

/** Slow career drift — green men rise a touch, veterans fade. */
function developmentDrift(age: number, days: number): number {
  const perMonth = age < 26 ? 0.4 : age > 32 ? -0.5 : 0.05;
  return perMonth * (days / 30);
}

/** Resolve a single fight against a peer, mutating record and rating in place. */
function resolveOneFight(f: WorldFighter): void {
  const winProb = clamp((f.rating / 100) * 0.6 + 0.2, 0.2, 0.85);
  if (Math.random() < winProb) {
    f.record.wins += 1;
    if (Math.random() < clamp(0.3 + f.rating / 250, 0.2, 0.75)) f.record.kos += 1;
    f.rating = clamp(f.rating + 0.6, 14, 97);
  } else if (Math.random() < 0.15) {
    f.record.draws += 1;
  } else {
    f.record.losses += 1;
    f.rating = clamp(f.rating - 0.8, 14, 97);
  }
}

/**
 * Advance the world by `days`. Ages everyone, drifts ratings, ticks the rare
 * fight, and turns the population over (retire → replace) keeping it bounded.
 */
export function advanceWorld(
  world: WorldState,
  opts: { days: number; toDay: number },
): AdvanceWorldResult {
  const { days, toDay } = opts;
  const next: WorldFighter[] = [];
  const notes: string[] = [];

  for (const f0 of world.fighters) {
    const f: WorldFighter = { ...f0, record: { ...f0.record } };
    f.age += days / 365;
    f.rating = clamp(f.rating + developmentDrift(f.age, days), 14, 97);

    // The occasional fight — roughly one every six or seven weeks.
    if (Math.random() < days / 45) resolveOneFight(f);

    // Retirement, and the signing that replaces him.
    if (Math.random() < retireChance(f.age, days)) {
      if (f.affiliation.kind === 'rival') {
        const gym = getRivalGym(f.affiliation.gymId);
        const fresh = signYoungProspect(f.affiliation.gymId, f.fidelity);
        if (fresh) {
          next.push(fresh);
          if (gym && f.fidelity === 'local') {
            notes.push(`${gym.name} signed a young ${fresh.weightClass.replace('_', ' ')}.`);
          }
        }
      }
      // A vacated national rank doesn't stay empty — a new contender steps into
      // it, so the magazine's ratings page never goes dark over the decades.
      if (f.nationalRank !== null) {
        const heir = makeNationalElite(f.weightClass, f.nationalRank);
        next.push(heir);
        notes.push(
          `New blood in the ${f.weightClass.replace('_', ' ')} ratings: ${heir.firstName} ${heir.lastName}.`,
        );
      }
      // Unranked independents simply move on; rivals are replaced above.
      continue;
    }

    next.push(f);
  }

  // Keep the thin independent layer alive — a rare new face drifts in.
  // (Anchored to whatever city the existing population centers on.)
  if (world.fighters.length > 0 && Math.random() < days / 365) {
    const anchor = world.fighters[0].cityId;
    next.push(spawnIndependentNear(getCity(anchor).id));
  }

  return { world: { fighters: next, simThrough: toDay }, notes: notes.slice(0, 2) };
}
