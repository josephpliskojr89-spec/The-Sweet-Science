/*
  Walk-Ins
  --------------------------------------------------------------------------
  The pipeline. Every day there's a chance someone new comes through the door —
  no recruiting, no scouting, you open the gym and wait. Rate is organic: a new
  gym sees roughly one a week, never a flood. Walk-ins don't wait forever; each
  carries patience, and ignoring a man too long means he finds another gym.

  This module is pure scheduling/data. Generation lives in fighters.ts; React
  state and persistence wire it together in GameContext.
*/

import { generateFighter, type Fighter } from './fighters';
import type { CityId } from './cities';

export interface WalkIn {
  fighter: Fighter;
  /** Days remaining before he moves on. */
  patience: number;
}

/** ~1 in 5 days for a new, locally-known gym. Tunable as reputation grows. */
const DAILY_WALKIN_CHANCE = 0.2;
/** Never overwhelm: cap arrivals surfaced from a single advance. */
const MAX_ARRIVALS_PER_ADVANCE = 3;

function randInt(min: number, max: number): number {
  return Math.floor(min + Math.random() * (max - min + 1));
}

function createWalkIn(fighter: Fighter): WalkIn {
  // Some men are patient, some aren't — the card's First Impression may hint.
  return { fighter, patience: randInt(3, 10) };
}

/**
 * Simulate `days` of daily rolls and return the fighters who showed up. Capped
 * so advancing a long stretch never dumps a crowd at the door.
 */
export function rollNewWalkIns(
  days: number,
  cityId: CityId,
  quality: number,
): WalkIn[] {
  const out: WalkIn[] = [];
  for (let i = 0; i < days; i++) {
    if (Math.random() < DAILY_WALKIN_CHANCE) {
      out.push(createWalkIn(generateFighter({ cityId, quality })));
    }
  }
  return out.slice(0, MAX_ARRIVALS_PER_ADVANCE);
}

export interface PatienceResult {
  surviving: WalkIn[];
  expired: WalkIn[];
}

/** Age the existing queue by `days`; split those who gave up and left. */
export function ageWalkIns(walkIns: WalkIn[], days: number): PatienceResult {
  const surviving: WalkIn[] = [];
  const expired: WalkIn[] = [];
  for (const w of walkIns) {
    const patience = w.patience - days;
    if (patience <= 0) expired.push(w);
    else surviving.push({ ...w, patience });
  }
  return { surviving, expired };
}
