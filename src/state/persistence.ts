/*
  Persistence
  --------------------------------------------------------------------------
  A deliberately small save slot for Phase 1, so the Home screen's "Continue"
  is real rather than decorative. It stores only what the shell currently
  knows: which region's gym you're in and the game date.

  The shape is versioned. As later phases add fighters, lockers, coaches,
  finances, and the rival ecosystem, `GameSave` grows and `migrate()` handles
  older saves. Keeping one writer/reader here means save logic never leaks
  into UI components.
*/

import type { RegionKey } from '../game/regions';
import type { CityId } from '../game/cities';

const STORAGE_KEY = 'sweet-science:save:v1';
export const SAVE_VERSION = 1;

export interface GameSave {
  version: number;
  /** Which regional gym background is showing. */
  region: RegionKey;
  /** Set once city selection (Phase 2) exists; null in the Phase 1 shell. */
  cityId: CityId | null;
  /** Day-count since the 1975 epoch (see game/time.ts). */
  dayCount: number;
  /** Epoch ms when the save was first created. */
  createdAt: number;
  /** Epoch ms of the last write. */
  updatedAt: number;
}

export function createNewSave(region: RegionKey): GameSave {
  const now = Date.now();
  return {
    version: SAVE_VERSION,
    region,
    cityId: null,
    dayCount: 0,
    createdAt: now,
    updatedAt: now,
  };
}

/** Bring an older save forward. No-op today; the hook exists for later phases. */
function migrate(raw: unknown): GameSave | null {
  if (!raw || typeof raw !== 'object') return null;
  const data = raw as Partial<GameSave>;
  if (typeof data.region !== 'string' || typeof data.dayCount !== 'number') {
    return null;
  }
  return {
    version: SAVE_VERSION,
    region: data.region as RegionKey,
    cityId: (data.cityId as CityId | null) ?? null,
    dayCount: data.dayCount,
    createdAt: data.createdAt ?? Date.now(),
    updatedAt: data.updatedAt ?? Date.now(),
  };
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
    /* storage unavailable (private mode, quota) — fail quiet for Phase 1 */
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
