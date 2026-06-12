/*
  Roster & Hierarchy
  --------------------------------------------------------------------------
  A roster entry is a fighter plus his standing in your gym: whether he holds
  one of the twenty lockers, and which tier of your hierarchy he sits in. The
  three tiers are the bible's language for the decisions you face once space
  gets tight — who's your real stable, who's holding a spot, who's on the way
  out.

  This lives in game/ (not state/) so both persistence and the departure logic
  can share the types without an awkward dependency direction.
*/

import type { Fighter } from './fighters';

export type HierarchyTier = 'must_keep' | 'watch' | 'chopping';

export interface RosterEntry {
  fighter: Fighter;
  /** Locker holders develop fully; others train in limited mode (Phase 5). */
  hasLocker: boolean;
  /** Where he sits in your hierarchy. */
  tier: HierarchyTier;
  /** Day-count when he joined the gym. */
  joinedDayCount: number;
  /** Short-term mood (0–100). See game/relationship.ts. */
  morale: number;
  /** Relationship with you (0–100) — breaks easily, heals slowly. */
  trust: number;
  /** Times you've pulled his locker — durable memory that compounds. */
  lockerLossCount: number;
}

export interface TierMeta {
  key: HierarchyTier;
  name: string;
  short: string;
  blurb: string;
}

export const TIER_META: Record<HierarchyTier, TierMeta> = {
  must_keep: {
    key: 'must_keep',
    name: 'Must Keep',
    short: 'Keep',
    blurb: 'Your real stable — the fighters you’re genuinely invested in.',
  },
  watch: {
    key: 'watch',
    name: 'Watch List',
    short: 'Watch',
    blurb: 'Showing enough to hold a spot, but not guaranteed.',
  },
  chopping: {
    key: 'chopping',
    name: 'Chopping Block',
    short: 'Chop',
    blurb: 'Plateaued, a misfit for your direction, or outgrown.',
  },
};

export const TIER_ORDER: HierarchyTier[] = ['must_keep', 'watch', 'chopping'];

/** The tier a freshly accepted walk-in starts in. */
export const DEFAULT_TIER: HierarchyTier = 'watch';
