/*
  Persistence
  --------------------------------------------------------------------------
  The save slot. With the Phase 2 New Game flow in place, a save now carries
  the gym's name, the manager, and the chosen city; the region is derived from
  the city rather than stored. One reader/writer here keeps save logic out of
  the UI. The shape is versioned and migrated forward as later phases add
  fighters, lockers, coaches, and finances.
*/

import type { CityId } from '../game/cities';
import { getCity } from '../game/cities';
import type { RegionKey } from '../game/regions';
import type { Appearance } from '../game/appearance';

const STORAGE_KEY = 'sweet-science:save:v1';
export const SAVE_VERSION = 2;

export const MANAGER_START_AGE = 25;

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
    createdAt: now,
    updatedAt: now,
  };
}

/** Region is always derived from the city — never stored. */
export function regionOf(save: GameSave): RegionKey {
  return getCity(save.cityId).region;
}

/** Bring an older save forward. Pre-v2 shell saves lack a manager/city, so
    they can't be resumed meaningfully — drop them rather than fake a manager. */
function migrate(raw: unknown): GameSave | null {
  if (!raw || typeof raw !== 'object') return null;
  const data = raw as Partial<GameSave> & { region?: string };

  if (typeof data.version === 'number' && data.version >= 2) {
    if (
      typeof data.gymName === 'string' &&
      data.manager &&
      typeof data.cityId === 'string' &&
      typeof data.dayCount === 'number'
    ) {
      return data as GameSave;
    }
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
