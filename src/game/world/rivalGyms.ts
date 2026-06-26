/*
  Rival Gyms (Phase 6C — the competitive world)
  --------------------------------------------------------------------------
  The static skeleton of the competition, loaded from data/gyms.json: every
  rival gym in the 1975 world, its manager, house style, reputation tier, and
  city. These never change at runtime, so they're derived from the data file
  rather than stored in the save — only the fighters who answer to them are
  dynamic (game/world/population.ts).

  This module also owns the two facts the rest of 6C reads off the skeleton:
  how big a stable a gym of a given tier carries (rosterPlateau), and how
  competitive a city's scene is (cityCompetitiveness) — dense fight towns like
  New York breathe down your neck; Memphis gives you room.
*/

import gymsData from '../../data/gyms.json';
import { CITIES, type CityId } from '../cities';
import type { RegionKey } from '../regions';
import { getCity } from '../cities';

export type ReputationTier = 'established' | 'regional' | 'local';

export interface RivalGym {
  id: string;
  name: string;
  managerName: string;
  /** House style from the data file (slick_boxer, brawler, …). */
  styleTendency: string;
  tier: ReputationTier;
  foundingYear: number;
  cityId: CityId;
}

interface RawGym {
  gym_name: string;
  manager_name: string;
  style_tendency: string;
  reputation_tier: string;
  founding_year: number;
  city: string;
}

/** Display name → CityId, so the data file's "New York" resolves to new_york. */
const NAME_TO_CITY: Record<string, CityId> = Object.fromEntries(
  (Object.values(CITIES) as { id: CityId; name: string }[]).map((c) => [c.name, c.id]),
);

function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function asTier(raw: string): ReputationTier {
  return raw === 'established' || raw === 'regional' ? raw : 'local';
}

/** The full rival skeleton, built once from the data file. Gyms whose city
    doesn't resolve (none today) are dropped rather than crashing. */
export const RIVAL_GYMS: RivalGym[] = (gymsData as { competing_gyms: RawGym[] }).competing_gyms
  .map((g): RivalGym | null => {
    const cityId = NAME_TO_CITY[g.city];
    if (!cityId) return null;
    return {
      id: slug(g.gym_name),
      name: g.gym_name,
      managerName: g.manager_name,
      styleTendency: g.style_tendency,
      tier: asTier(g.reputation_tier),
      foundingYear: g.founding_year,
      cityId,
    };
  })
  .filter((g): g is RivalGym => g !== null);

const BY_ID = new Map(RIVAL_GYMS.map((g) => [g.id, g]));

export function getRivalGym(id: string): RivalGym | undefined {
  return BY_ID.get(id);
}

export function gymsInCity(cityId: CityId): RivalGym[] {
  return RIVAL_GYMS.filter((g) => g.cityId === cityId);
}

/** Gyms in a region, optionally excluding one city (your own). */
export function gymsInRegion(region: RegionKey, exceptCity?: CityId): RivalGym[] {
  return RIVAL_GYMS.filter(
    (g) => getCity(g.cityId).region === region && g.cityId !== exceptCity,
  );
}

/** How large a stable a gym of this tier carries — its plateau. Established
    houses field a full stable that meets or beats the player's maxed 20; local
    gyms are small. The world seeds near these and holds them by churn. */
export function rosterPlateau(tier: ReputationTier): number {
  if (tier === 'established') return 18;
  if (tier === 'regional') return 12;
  return 6;
}

/** Tier weight for scoring a city's competitive density. */
function tierWeight(tier: ReputationTier): number {
  if (tier === 'established') return 3;
  if (tier === 'regional') return 2;
  return 1;
}

// Precompute the densest city's score so competitiveness normalizes to 0..1.
const CITY_SCORE: Record<string, number> = {};
for (const g of RIVAL_GYMS) {
  CITY_SCORE[g.cityId] = (CITY_SCORE[g.cityId] ?? 0) + tierWeight(g.tier);
}
const MAX_CITY_SCORE = Math.max(1, ...Object.values(CITY_SCORE));

/**
 * 0..1 — how hard the local scene presses on you. Drawn from the per-city gym
 * count and their tiers: New York and Philadelphia run hot, Memphis and
 * Cincinnati are quiet. Drives walk-in competition and poaching pressure (6C-3/4).
 */
export function cityCompetitiveness(cityId: CityId): number {
  return (CITY_SCORE[cityId] ?? 0) / MAX_CITY_SCORE;
}
