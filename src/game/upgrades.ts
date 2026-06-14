/*
  Gym Upgrades (Phase 6A)
  --------------------------------------------------------------------------
  The gym's physical improvements, bought against the money in My Office and
  managed in My Gym's Facilities section. Three leveled tracks, each tied to a
  system that already exists:

    Lockers   — raises the locker cap (the wall literally grows).
    Equipment — a small boost to how fast everyone develops (training.ts).
    Floor     — more bench places for fighters without a locker.

  A bigger gym is not just a one-time cost: every level adds monthly UPKEEP
  (more rent, more utilities, more to maintain), so expanding is a lasting
  commitment, not a free splurge. economy.ts owns inflation; this module holds
  raw 1975 figures only.
*/

export interface Upgrades {
  lockers: number;
  equipment: number;
  floor: number;
}

export const DEFAULT_UPGRADES: Upgrades = { lockers: 0, equipment: 0, floor: 0 };

export type UpgradeKey = keyof Upgrades;
export const UPGRADE_ORDER: UpgradeKey[] = ['lockers', 'equipment', 'floor'];

export const LOCKER_BASE = 20;
export const LOCKER_PER_LEVEL = 5;
export const NO_LOCKER_BASE = 6;
export const FLOOR_PER_LEVEL = 2;
const EQUIP_PER_LEVEL = 0.06; // +6% development per level

interface TrackDef {
  name: string;
  blurb: string;
  /** 1975 base cost to buy each next level (length = max level). */
  costs: number[];
  /** 1975 base monthly upkeep each level adds. */
  upkeep: number;
}

const TRACKS: Record<UpgradeKey, TrackDef> = {
  lockers: {
    name: 'Locker Bank',
    blurb: 'Room for more fighters to call your gym home.',
    costs: [340, 520, 760, 1100],
    upkeep: 22,
  },
  equipment: {
    name: 'Equipment',
    blurb: 'Better bags, ropes, and weights — everyone develops a little faster.',
    costs: [300, 460, 680, 950],
    upkeep: 10,
  },
  floor: {
    name: 'Floor Space',
    blurb: 'A bigger floor carries more men without a locker.',
    costs: [420, 620, 900],
    upkeep: 18,
  },
};

// --- effects ---------------------------------------------------------------

export function lockerCapacityFor(u: Upgrades): number {
  return LOCKER_BASE + u.lockers * LOCKER_PER_LEVEL;
}
export function noLockerCapacityFor(u: Upgrades): number {
  return NO_LOCKER_BASE + u.floor * FLOOR_PER_LEVEL;
}
export function equipmentFactorFor(u: Upgrades): number {
  return 1 + EQUIP_PER_LEVEL * u.equipment;
}

// --- catalog (raw 1975 numbers) --------------------------------------------

export function trackName(key: UpgradeKey): string {
  return TRACKS[key].name;
}
export function trackBlurb(key: UpgradeKey): string {
  return TRACKS[key].blurb;
}
export function maxLevel(key: UpgradeKey): number {
  return TRACKS[key].costs.length;
}

/** 1975-base cost to buy the next level. Null when maxed. */
export function nextCostBase(key: UpgradeKey, level: number): number | null {
  const costs = TRACKS[key].costs;
  if (level >= costs.length) return null;
  return costs[level];
}

/** 1975-base monthly upkeep each level of this track adds. */
export function levelUpkeepBase(key: UpgradeKey): number {
  return TRACKS[key].upkeep;
}

/** 1975-base total monthly upkeep from all current upgrades. */
export function totalUpkeepBase(u: Upgrades): number {
  return UPGRADE_ORDER.reduce((sum, key) => sum + u[key] * TRACKS[key].upkeep, 0);
}

/** What the track does at a given level (human text). */
export function effectAtLevel(key: UpgradeKey, level: number): string {
  if (key === 'lockers') return `${LOCKER_BASE + level * LOCKER_PER_LEVEL} lockers`;
  if (key === 'floor') return `${NO_LOCKER_BASE + level * FLOOR_PER_LEVEL} bench places`;
  return level === 0 ? 'Standard gear' : `+${Math.round(level * EQUIP_PER_LEVEL * 100)}% development`;
}

/** What buying the next level adds. Null when maxed. */
export function effectGain(key: UpgradeKey, level: number): string | null {
  if (level >= maxLevel(key)) return null;
  if (key === 'lockers') return `+${LOCKER_PER_LEVEL} lockers`;
  if (key === 'floor') return `+${FLOOR_PER_LEVEL} bench places`;
  return `+${Math.round(EQUIP_PER_LEVEL * 100)}% development`;
}

