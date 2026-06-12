/*
  The Press — early edition (ambient layer of Phase 9)
  --------------------------------------------------------------------------
  "The press is how the world proves it exists." The full mechanical press is
  Phase 9; this is the ambient slice that needs no fight engine — the rumor
  column, color pieces, and rival-gym items from press_clippings.json. It
  makes the city's other gyms exist in the player's week long before the
  Rival Gyms tab (Phase 6) opens.

  Per the bible's press section:
  - 2–4 persistent writer bylines per city, assigned at world generation
  - a 10-week cooldown per template id
  - mixed item lengths; short rumors appear more often than long pieces
  - the player's gym should NOT dominate the feed — at this stage it never
    appears at all, which is exactly right for an unknown operation

  Names of rival fighters, venues, records, and results are procedurally
  generated against the gym database — fully consistent with no two saves
  reading the same paper.
*/

import pressDb from '../data/press_clippings.json';
import gymsDb from '../data/gyms.json';
import { getCity, type CityId } from './cities';
import { generateName } from './names';
import { WEIGHT_CLASSES, WEIGHT_CLASS_ORDER } from './weightClasses';

export interface Clipping {
  templateId: string;
  dayCount: number;
  byline: string;
  text: string;
}

export interface PressState {
  paperName: string;
  /** Persistent bylines for the player's city, fixed at world generation. */
  writers: string[];
  /** Persistent local venue names, fixed at world generation. */
  venues: string[];
  /** templateId -> dayCount when last used (10-week cooldown). */
  cooldowns: Record<string, number>;
  clippings: Clipping[];
}

interface Template {
  id: string;
  trigger: string;
  tone: string;
  future_hook?: boolean;
  text: string;
}

interface CompetingGym {
  gym_name: string;
  manager_name: string;
  style_tendency: string;
  reputation_tier: string;
  founding_year: number;
  city: string;
}

const DB = pressDb as unknown as {
  categories: Record<string, Template[]>;
};
const GYMS = (gymsDb as { competing_gyms: CompetingGym[] }).competing_gyms;

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min: number, max: number) =>
  Math.floor(min + Math.random() * (max - min + 1));

/** The ambient set: templates whose variables exist before the fight engine.
    Weight skews toward short rumor items, per the database's own notes. */
const AMBIENT_POOL: Array<{ category: string; id: string; weight: number }> = [
  { category: 'rumor_column', id: 'rumor_001', weight: 3 },
  { category: 'rumor_column', id: 'rumor_002', weight: 3 },
  { category: 'rumor_column', id: 'rumor_003', weight: 2 },
  { category: 'rumor_column', id: 'rumor_004', weight: 2 },
  { category: 'color_and_atmosphere', id: 'color_001', weight: 2 },
  { category: 'color_and_atmosphere', id: 'color_002', weight: 2 },
  { category: 'color_and_atmosphere', id: 'color_003', weight: 1 },
  { category: 'color_and_atmosphere', id: 'color_004', weight: 1 },
  { category: 'color_and_atmosphere', id: 'color_005', weight: 1 },
  { category: 'prospect_notices', id: 'prospect_003', weight: 2 },
  { category: 'other_gym_results', id: 'world_result_001', weight: 3 },
  { category: 'other_gym_results', id: 'world_result_002', weight: 2 },
  { category: 'other_gym_results', id: 'world_result_003', weight: 2 },
  { category: 'other_gym_results', id: 'world_result_004', weight: 1 },
  { category: 'other_gym_results', id: 'world_result_005', weight: 1 },
];

/** ~10 in-game weeks, per the database meta. */
const TEMPLATE_COOLDOWN_DAYS = 70;

const PAPER_KINDS = ['Courier', 'Dispatch', 'Examiner', 'Ledger', 'Register', 'Record'];

const VENUE_PLACES = [
  'Riverside', 'Mechanics', 'Union', 'Fairgrounds', 'Eastside', 'Lakeview',
  'St. Adalbert’s', 'Crown', 'Veterans', 'Coliseum Street', 'Old Market',
  'Cathedral', 'Brotherhood', 'Pioneer',
];
const VENUE_KINDS = ['Armory', 'Auditorium', 'Ballroom', 'Athletic Hall', 'Memorial Hall', 'Arena'];

const METHODS = ['unanimous decision', 'split decision', 'majority decision', 'TKO'];
const ROUND_WORDS = ['two', 'three', 'four', 'five', 'six'];

function template(category: string, id: string): Template | null {
  return DB.categories[category]?.find((t) => t.id === id) ?? null;
}

/** Fixed at world generation so the paper feels authored across a career. */
export function initPressState(cityId: CityId): PressState {
  const city = getCity(cityId);
  const writerCount = randInt(2, 4);
  const writers: string[] = [];
  while (writers.length < writerCount) {
    const w = generateName(cityId).full;
    if (!writers.includes(w)) writers.push(w);
  }
  const venues: string[] = [];
  while (venues.length < 3) {
    const v = `${pick(VENUE_PLACES)} ${pick(VENUE_KINDS)}`;
    if (!venues.includes(v)) venues.push(v);
  }
  return {
    paperName: `The ${city.name} ${pick(PAPER_KINDS)}`,
    writers,
    venues,
    cooldowns: {},
    clippings: [],
  };
}

/** Rival gyms in the player's city (the local pecking order). */
export function localRivalGyms(cityId: CityId): CompetingGym[] {
  const cityName = getCity(cityId).name;
  return GYMS.filter((g) => g.city === cityName);
}

function fillTemplate(t: Template, state: PressState, cityId: CityId): string {
  const city = getCity(cityId);
  const rivals = localRivalGyms(cityId);
  const rival = rivals.length ? pick(rivals) : null;
  const cls = WEIGHT_CLASSES[pick(WEIGHT_CLASS_ORDER)];

  const vars: Record<string, string> = {
    city: city.name,
    venue: pick(state.venues),
    weight_class: cls.name.toLowerCase(),
    rival_gym: rival?.gym_name ?? 'a gym across town',
    rival_manager: rival?.manager_name ?? 'their man',
    opponent_full: generateName(cityId).full,
    fighter_full: generateName(cityId).full, // world_result_004: two unknowns
    opponent_record: `${randInt(5, 14)}-${randInt(0, 3)}`,
    method: pick(METHODS),
    round: pick(ROUND_WORDS),
  };

  return t.text.replace(/\{(\w+)\}/g, (m, key: string) => vars[key] ?? m);
}

export interface PressCycleResult {
  state: PressState;
  fresh: Clipping[];
}

const MAX_STORED_CLIPPINGS = 40;

/**
 * Run one weekly press cycle. Usually one item, sometimes two, occasionally a
 * quiet week — a paper that always has news feels procedural.
 */
export function runPressCycle(
  state: PressState,
  cityId: CityId,
  dayCount: number,
): PressCycleResult {
  const count = Math.random() < 0.15 ? 0 : Math.random() < 0.3 ? 2 : 1;
  if (count === 0) return { state, fresh: [] };

  const available = AMBIENT_POOL.filter(({ id }) => {
    const last = state.cooldowns[id];
    return last === undefined || dayCount - last >= TEMPLATE_COOLDOWN_DAYS;
  });

  const fresh: Clipping[] = [];
  const cooldowns = { ...state.cooldowns };
  const pool = [...available];

  for (let i = 0; i < count && pool.length; i++) {
    const total = pool.reduce((s, p) => s + p.weight, 0);
    let roll = Math.random() * total;
    let chosen = pool[0];
    for (const p of pool) {
      roll -= p.weight;
      if (roll <= 0) {
        chosen = p;
        break;
      }
    }
    pool.splice(pool.indexOf(chosen), 1);

    const t = template(chosen.category, chosen.id);
    if (!t) continue;
    cooldowns[chosen.id] = dayCount;
    fresh.push({
      templateId: chosen.id,
      dayCount,
      byline: pick(state.writers),
      text: fillTemplate(t, state, cityId),
    });
  }

  const clippings = [...fresh, ...state.clippings].slice(0, MAX_STORED_CLIPPINGS);
  return { state: { ...state, cooldowns, clippings }, fresh };
}
