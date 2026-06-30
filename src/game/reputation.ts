/*
  Gym Reputation (Phase 6C)
  --------------------------------------------------------------------------
  How known and regarded your gym is, 0..1. A brand-new gym is a nobody (≈0);
  reputation is earned by developing fighters the sport recognizes — it rises
  with the public standing of the men on your roster, not with raw count.

  This is the value the walk-in pool reads: a respected gym draws more and
  better men to its door (state/GameContext walk-in hooks), and later it gates
  how hard rivals come for your talent (6C-4). It lives in game/ and takes the
  roster directly, keeping the dependency pointing the right way.
*/

import type { RosterEntry } from './roster';

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/**
 * Gym reputation 0..1. Driven by the public standing of your fighters (a stable
 * of recognized men is a real draw), with a faint floor for simply running an
 * active gym. Stays near 0 until your men make names for themselves — which,
 * pre-fight-engine, keeps a new gym honestly unknown.
 */
export function gymReputation(roster: RosterEntry[]): number {
  if (roster.length === 0) return 0;
  const repMass = roster.reduce((s, e) => s + Math.max(0, e.fighter.publicReputation), 0);
  const sizeBonus = Math.min(roster.length, 12) * 1.5;
  return clamp((repMass + sizeBonus) / 650, 0, 1);
}

/** How the scene regards your gym, in words — for the Rival Gyms view. */
export function reputationLabel(rep: number): string {
  if (rep < 0.05) return 'an unknown';
  if (rep < 0.2) return 'a name starting to travel';
  if (rep < 0.45) return 'a respected local gym';
  if (rep < 0.7) return 'an established operation';
  return 'one of the best in the country';
}

/** How crowded the local scene feels, in words — from cityCompetitiveness. */
export function competitivenessLabel(c: number): string {
  if (c >= 0.8) return 'a crowded fight town — gyms on every block';
  if (c >= 0.5) return 'a real fight scene with serious competition';
  if (c >= 0.3) return 'a modest scene with a few established gyms';
  return 'a quiet scene — few gyms, and room to make a name';
}

// --- talent poaching (6C-4) -------------------------------------------------

/** Hidden rival-interest thresholds. Warnings fire as a man crosses each one;
    he can only be poached once interest is high — so it's always telegraphed. */
export const POACH_BAND_1 = 35; // a first sniff
export const POACH_BAND_2 = 60; // open interest, named
export const POACH_BAND_3 = 80; // imminent

export function interestBand(v: number): 0 | 1 | 2 | 3 {
  if (v >= POACH_BAND_3) return 3;
  if (v >= POACH_BAND_2) return 2;
  if (v >= POACH_BAND_1) return 1;
  return 0;
}

/**
 * 0..1 — how exposed a locker holder is to being poached. Only talented men
 * (they want the good ones) who are unhappy (low trust, low morale) are at
 * risk, scaled by how competitive the city is and how ruthless your gym looks
 * (a man who's watched you discard others is quicker to listen). Repair the
 * relationship and this falls to zero — the threat is preventable.
 */
export function flightRiskScore(
  entry: RosterEntry,
  competitiveness: number,
  reputationMod: number,
): number {
  if (!entry.hasLocker) return 0;
  const talent = clamp((entry.fighter.potential - 55) / 45, 0, 1);
  if (talent <= 0) return 0;
  const distrust = clamp((52 - entry.trust) / 52, 0, 1);
  const lowMorale = clamp((45 - entry.morale) / 45, 0, 1);
  const unhappy = clamp(distrust * 0.7 + lowMorale * 0.3, 0, 1);
  const ruthless = clamp(-reputationMod, 0, 0.3) / 0.3; // 0..1
  const climate = clamp(competitiveness, 0.1, 1) * (1 + 0.4 * ruthless);
  return clamp(talent * unhappy * climate, 0, 1);
}

export interface FlightRead {
  label: string;
  tone: 'warn' | 'crit';
}

/** A legible read of rival interest for the profile — null when too faint to show. */
export function flightRiskRead(poachInterest: number): FlightRead | null {
  const b = interestBand(poachInterest);
  if (b >= 3) return { label: 'Flight risk', tone: 'crit' };
  if (b >= 2) return { label: 'Drawing interest', tone: 'warn' };
  return null;
}
