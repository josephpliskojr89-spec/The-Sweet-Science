/*
  Names
  --------------------------------------------------------------------------
  Procedural name generation off the provided name database. The algorithm is
  the one documented in the database: pick a city's first-name and surname
  subpools by weight, then draw a name from each. Phase 2 uses it for the
  manager's "Surprise me"; Phase 3's fighter generation reuses the same core
  (plus nicknames). Nothing here is hardcoded — it reads the database.
*/

import db from '../data/names.json';
import { SELECTABLE_CITIES, type CityId } from './cities';

type Weights = Record<string, number>;

interface NameDatabase {
  city_to_region: Record<string, string>;
  city_weights: Record<string, { first_names: Weights; last_names: Weights }>;
  name_pools: Record<
    string,
    {
      first_names: Record<string, string[]>;
      last_names: Record<string, string[]>;
    }
  >;
  nickname_pools: Record<string, string[]>;
}

const NAMES = db as unknown as NameDatabase;

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Pick a key from a {key: weight} map, proportional to weight. */
function weightedPick(weights: Weights): string {
  const entries = Object.entries(weights);
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  let roll = Math.random() * total;
  for (const [key, w] of entries) {
    roll -= w;
    if (roll <= 0) return key;
  }
  return entries[0][0];
}

/** Resolve a subpool to an actual list, falling back to 'general'. */
function poolFor(
  pools: Record<string, string[]>,
  subpool: string,
): string[] {
  return pools[subpool] ?? pools.general ?? Object.values(pools)[0];
}

export interface GeneratedName {
  first: string;
  last: string;
  full: string;
}

/**
 * Generate a believable name for a city. The database has no Las Vegas pool
 * (it's a destination, not a pipeline), so callers should pass a real starting
 * city; if an unknown city is given we fall back to a random selectable one.
 */
export function generateName(city: CityId): GeneratedName {
  let cityKey: string = city;
  if (!NAMES.city_weights[cityKey]) {
    cityKey = randomPick(SELECTABLE_CITIES).id;
  }

  const region = NAMES.city_to_region[cityKey];
  const weights = NAMES.city_weights[cityKey];
  const regionPools = NAMES.name_pools[region];

  const firstSubpool = weightedPick(weights.first_names);
  const lastSubpool = weightedPick(weights.last_names);

  const first = randomPick(poolFor(regionPools.first_names, firstSubpool));
  const last = randomPick(poolFor(regionPools.last_names, lastSubpool));

  return { first, last, full: `${first} ${last}` };
}

/** A name with no city context yet — used by the manager screen. */
export function generateAnyName(): GeneratedName {
  return generateName(randomPick(SELECTABLE_CITIES).id);
}

/** Draw a nickname from a named category (Phase 3 fighter flavor). */
export function nicknameFrom(category: string): string | null {
  const pool = NAMES.nickname_pools[category];
  return pool ? randomPick(pool) : null;
}
