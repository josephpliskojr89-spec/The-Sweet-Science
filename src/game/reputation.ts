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
