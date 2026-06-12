/*
  Persistence
  --------------------------------------------------------------------------
  The save slot. v3 adds the roster (fighters who've joined the gym) and the
  walk-in queue (cards waiting at the door / in My Office). Region is still
  derived from the city, never stored. One reader/writer here keeps save logic
  out of the UI; the shape is versioned and migrated forward.
*/

import type { CityId } from '../game/cities';
import { getCity } from '../game/cities';
import type { RegionKey } from '../game/regions';
import type { Appearance } from '../game/appearance';
import type { WalkIn } from '../game/walkins';
import { DEFAULT_TIER, type RosterEntry } from '../game/roster';
import { initialRelationship } from '../game/relationship';
import { initPressState, type PressState } from '../game/press';
import type { LogLine } from '../game/gymLog';

export type { RosterEntry } from '../game/roster';

const STORAGE_KEY = 'sweet-science:save:v1';
export const SAVE_VERSION = 7;

/** One remembered moment in the gym's history. */
export interface LedgerEntry {
  dayCount: number;
  text: string;
}

export const MANAGER_START_AGE = 25;
/** The gym starts with twenty lockers — its primary resource and constraint. */
export const LOCKER_CAP = 20;
/** How many hopefuls you can carry without a locker. Keeps the gym from
    becoming a free scouting buffer — you can't hold everyone in limbo. */
export const NO_LOCKER_CAP = 6;

export interface Manager {
  name: string;
  /** Fixed at 25 in every run, per the bible. */
  age: number;
  appearance: Appearance;
}

export interface GameSave {
  version: number;
  gymName: string;
  manager: Manager;
  cityId: CityId;
  /** Day-count since the 1975 epoch (see game/time.ts). */
  dayCount: number;
  roster: RosterEntry[];
  walkIns: WalkIn[];
  /** The local paper — writers, venues, clippings (game/press.ts). */
  press: PressState;
  /** The gym ledger — remembered milestones, oldest first. */
  history: LedgerEntry[];
  /** The corkboard — latest gym-log lines, newest first. */
  recentLog: LogLine[];
  createdAt: number;
  updatedAt: number;
}

export interface NewGameDraft {
  gymName: string;
  manager: Manager;
  cityId: CityId;
}

export function createSaveFromDraft(draft: NewGameDraft): GameSave {
  const now = Date.now();
  return {
    version: SAVE_VERSION,
    gymName: draft.gymName,
    manager: draft.manager,
    cityId: draft.cityId,
    dayCount: 0,
    roster: [],
    walkIns: [],
    press: initPressState(draft.cityId),
    history: [
      {
        dayCount: 0,
        text: `You signed the lease and put the name on the door: ${draft.gymName}.`,
      },
    ],
    recentLog: [
      {
        dayCount: 0,
        text: 'The door is open. The bags are hung. Now you wait and see who walks in.',
      },
    ],
    createdAt: now,
    updatedAt: now,
  };
}

/** Region is always derived from the city — never stored. */
export function regionOf(save: GameSave): RegionKey {
  return getCity(save.cityId).region;
}

/** Locker holders currently in the gym. */
export function lockersUsed(save: GameSave): number {
  return save.roster.reduce((n, e) => n + (e.hasLocker ? 1 : 0), 0);
}

/** Fighters currently carried without a locker. */
export function noLockerUsed(save: GameSave): number {
  return save.roster.reduce((n, e) => n + (e.hasLocker ? 0 : 1), 0);
}

/** Pre-v5 fighters lack publicReputation; backfill the unknown-prospect value. */
function migrateFighter<T extends { publicReputation?: number }>(f: T): T {
  return { ...f, publicReputation: f.publicReputation ?? 2 };
}

/** Bring an older save forward. v2 lacked roster/walk-ins; v3 lacked hierarchy
    tiers; v4 lacked fighter publicReputation; v5 lacked the relationship layer;
    v6 lacked the living-world layer (press, ledger, gym log). Pre-v2 shell
    saves can't be resumed meaningfully — drop them. */
function migrate(raw: unknown): GameSave | null {
  if (!raw || typeof raw !== 'object') return null;
  const data = raw as Partial<GameSave>;

  if (
    typeof data.version === 'number' &&
    data.version >= 2 &&
    typeof data.gymName === 'string' &&
    data.manager &&
    typeof data.cityId === 'string' &&
    typeof data.dayCount === 'number'
  ) {
    const roster: RosterEntry[] = Array.isArray(data.roster)
      ? data.roster.map((e) => {
          const rel = initialRelationship(e.hasLocker);
          return {
            ...e,
            tier: e.tier ?? DEFAULT_TIER,
            morale: e.morale ?? rel.morale,
            trust: e.trust ?? rel.trust,
            lockerLossCount: e.lockerLossCount ?? 0,
            fighter: migrateFighter(e.fighter),
          };
        })
      : [];
    const walkIns: WalkIn[] = Array.isArray(data.walkIns)
      ? data.walkIns.map((w) => ({ ...w, fighter: migrateFighter(w.fighter) }))
      : [];
    return {
      version: SAVE_VERSION,
      gymName: data.gymName,
      manager: data.manager,
      cityId: data.cityId as CityId,
      dayCount: data.dayCount,
      roster,
      walkIns,
      press: data.press ?? initPressState(data.cityId as CityId),
      history:
        data.history ??
        [{ dayCount: 0, text: `You signed the lease and put the name on the door: ${data.gymName}.` }],
      recentLog: data.recentLog ?? [],
      createdAt: data.createdAt ?? Date.now(),
      updatedAt: data.updatedAt ?? Date.now(),
    };
  }
  return null;
}

export function loadSave(): GameSave | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return migrate(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function writeSave(save: GameSave): void {
  try {
    const next: GameSave = { ...save, updatedAt: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable (private mode, quota) — fail quiet */
  }
}

export function hasSave(): boolean {
  return loadSave() !== null;
}

export function clearSave(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
