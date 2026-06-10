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

/** Never overwhelm: cap arrivals surfaced from a single advance. */
const MAX_ARRIVALS_PER_ADVANCE = 3;

// --- Walk-in frequency -----------------------------------------------------
// The number of walk-ins is driven by how known the gym is. A brand-new gym
// gets an opening-weeks novelty bump (a curiosity in the neighborhood) that
// fades to a quiet baseline — word simply hasn't spread yet. Reputation
// (Phase 6) feeds the `reputation` term to scale the rate back up as the gym
// earns a name.
const BASELINE_CHANCE = 0.06; // unknown gym: ~1 walk-in every 2–3 weeks
const NOVELTY_PEAK = 0.17; // opening-day curiosity: ~1 every 6 days
const NOVELTY_TAU_DAYS = 26; // how fast novelty decays toward baseline
const REPUTATION_GAIN = 0.34; // full reputation adds this much daily chance

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

/** Daily chance someone walks in, on a given day of the gym's life. */
export function dailyWalkInChance(dayCount: number, reputation: number): number {
  const novelty = (NOVELTY_PEAK - BASELINE_CHANCE) * Math.exp(-dayCount / NOVELTY_TAU_DAYS);
  const repBonus = clamp(reputation, 0, 1) * REPUTATION_GAIN;
  return clamp(BASELINE_CHANCE + novelty + repBonus, 0.02, 0.6);
}

function randInt(min: number, max: number): number {
  return Math.floor(min + Math.random() * (max - min + 1));
}

function createWalkIn(fighter: Fighter): WalkIn {
  // Some men are patient, some aren't — the card's First Impression may hint.
  return { fighter, patience: randInt(3, 10) };
}

export interface WalkInContext {
  cityId: CityId;
  /** Current day-count, so the novelty curve is evaluated per simulated day. */
  dayCount: number;
  /** Gym reputation 0..1 (Phase 6). Scales frequency up. */
  reputation: number;
  /** Pool quality 0..1 — the attribute ceiling of who shows up. */
  quality: number;
}

/**
 * Simulate `days` of daily rolls and return the fighters who showed up. Each
 * day uses the novelty/reputation curve, so a long advance correctly tapers as
 * the opening-weeks bump fades. Capped so a long stretch never dumps a crowd.
 */
export function rollNewWalkIns(days: number, ctx: WalkInContext): WalkIn[] {
  const out: WalkIn[] = [];
  for (let i = 0; i < days; i++) {
    const chance = dailyWalkInChance(ctx.dayCount + i, ctx.reputation);
    if (Math.random() < chance) {
      out.push(createWalkIn(generateFighter({ cityId: ctx.cityId, quality: ctx.quality })));
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
