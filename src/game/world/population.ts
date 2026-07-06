/*
  The Fighter Population (Phase 6C — the competitive world)
  --------------------------------------------------------------------------
  The living population of fighters who are not yours: rival gym rosters and a
  thin layer of independents. This is the single source of truth for opponents,
  the Rival Gyms tab, rankings, and poaching — everything the competition feeds.

  Fidelity scales with relevance, to keep the world bounded:
    - local     — your city's gyms, full rosters. You'll scout and face these.
    - regional  — a couple of notables per gym elsewhere in your region.
    - national  — a thin ranked elite across the country.
  Every world fighter is a light record (a rating, a record, age, style). A full
  Fighter object is generated only when one becomes relevant — promoteToFull —
  and cached from then on. That's how "local = real fighters" stays affordable:
  you can't tell a light record from a full one until you engage him.

  The world is seeded once (generateWorld) and moved on its own each advance
  (game/world/worldSim.ts). Generation uses Math.random and so must run in event
  handlers, never in a render path — same purity rule as the rest of the game.
*/

import { getCity, type CityId } from '../cities';
import { WEIGHT_CLASSES, type WeightClassKey } from '../weightClasses';
import { generateName } from '../names';
import { generateFighter, type Fighter } from '../fighters';
import {
  RIVAL_GYMS,
  gymsInCity,
  gymsInRegion,
  getRivalGym,
  rosterPlateau,
  cityCompetitiveness,
  type RivalGym,
  type ReputationTier,
} from './rivalGyms';

// --- types -----------------------------------------------------------------

export type Fidelity = 'local' | 'regional' | 'national';
export type IndependentSort = 'veteran' | 'rural' | 'promoter_star';

export type Affiliation =
  | { kind: 'rival'; gymId: string }
  | { kind: 'independent'; sort: IndependentSort };

export interface WorldRecord {
  wins: number;
  losses: number;
  draws: number;
  kos: number;
}

export interface WorldFighter {
  id: string;
  firstName: string;
  lastName: string;
  nickname: string | null;
  cityId: CityId;
  weightClass: WeightClassKey;
  /** Float so the world can age men a little each advance; display floors it. */
  age: number;
  /** Hidden overall strength 0..100 — drives matchmaking and rankings, never shown raw. */
  rating: number;
  record: WorldRecord;
  styleTendency: string;
  affiliation: Affiliation;
  fidelity: Fidelity;
  /** Public standing 0..100 — for the tab, press, and rankings. */
  publicReputation: number;
  /** Set only on the thin ranked elite; full rankings compute in Phase 8. */
  nationalRank: number | null;
  /** Generated and cached the first time he becomes relevant (promoteToFull). */
  full: Fighter | null;
}

export interface WorldState {
  fighters: WorldFighter[];
  /** Day-count the world has been simulated through (game/world/worldSim.ts). */
  simThrough: number;
}

// --- small local rng (these modules don't share fighters.ts' private helpers) ---

const rand = (lo: number, hi: number) => lo + Math.random() * (hi - lo);
const randInt = (lo: number, hi: number) => Math.floor(rand(lo, hi + 1));
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
function gauss(): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
function makeId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return `wf_${crypto.randomUUID()}`;
  return `wf_${Math.random().toString(36).slice(2, 10)}`;
}

const WEIGHT_CLASS_KEYS: WeightClassKey[] = [
  'lightweight',
  'welterweight',
  'middleweight',
  'light_heavyweight',
  'heavyweight',
];
const CLASS_WEIGHTS = [0.22, 0.26, 0.24, 0.16, 0.12];

function pickWeightClass(): WeightClassKey {
  let roll = Math.random();
  for (let i = 0; i < WEIGHT_CLASS_KEYS.length; i++) {
    roll -= CLASS_WEIGHTS[i];
    if (roll <= 0) return WEIGHT_CLASS_KEYS[i];
  }
  return 'welterweight';
}

// --- generation ------------------------------------------------------------

/** Hidden strength by tier — established gyms field stronger men. */
function ratingForTier(tier: ReputationTier): number {
  const mean = tier === 'established' ? 54 : tier === 'regional' ? 45 : 37;
  return clamp(mean + gauss() * 12, 14, 90);
}

/** A fight record that fits a man's strength and how long he's been a pro. */
function genRecord(rating: number, age: number): WorldRecord {
  const debut = 18 + randInt(0, 2);
  const proYears = Math.max(0, Math.floor(age) - debut);
  if (proYears <= 0) return { wins: 0, losses: 0, draws: 0, kos: 0 };
  const fights = Math.min(72, Math.round(proYears * rand(2.5, 4.5)));
  const winRate = clamp(0.4 + (rating / 100) * 0.5, 0.3, 0.92);
  // Draws come out of the fight count first so wins+losses+draws = fights holds.
  const draws = Math.min(fights, Math.random() < 0.5 ? 0 : randInt(0, 2));
  const wins = Math.round((fights - draws) * winRate);
  const losses = Math.max(0, fights - wins - draws);
  const koRate = clamp(0.3 + (rating / 100) * 0.35, 0.2, 0.8);
  const kos = Math.round(wins * koRate);
  return { wins, losses, draws, kos };
}

function genPublicRep(rating: number, record: WorldRecord, nationalRank: number | null): number {
  let r = rating * 0.45 + record.wins * 1.2;
  if (nationalRank) r += (16 - nationalRank) * 3;
  return clamp(Math.round(r), 0, 100);
}

interface MakeOpts {
  cityId: CityId;
  affiliation: Affiliation;
  fidelity: Fidelity;
  rating: number;
  age: number;
  styleTendency: string;
  weightClass?: WeightClassKey;
  nationalRank?: number | null;
}

function makeWorldFighter(o: MakeOpts): WorldFighter {
  const name = generateName(o.cityId);
  const weightClass = o.weightClass ?? pickWeightClass();
  const record = genRecord(o.rating, o.age);
  const nationalRank = o.nationalRank ?? null;
  return {
    id: makeId(),
    firstName: name.first,
    lastName: name.last,
    nickname: null,
    cityId: o.cityId,
    weightClass,
    age: o.age,
    rating: o.rating,
    record,
    styleTendency: o.styleTendency,
    affiliation: o.affiliation,
    fidelity: o.fidelity,
    publicReputation: genPublicRep(o.rating, record, nationalRank),
    nationalRank,
    full: null,
  };
}

/** A plausible age for a working pro — most in their prime, a few green, a few old. */
function proAge(): number {
  const r = Math.random();
  if (r < 0.18) return rand(18, 21); // green prospects
  if (r < 0.82) return rand(22, 30); // prime
  return rand(31, 37); // veterans
}

function makeRivalFighter(gym: RivalGym, fidelity: Fidelity, noteworthy = false): WorldFighter {
  // A "notable" is the best of a couple of rolls — a gym's man worth naming.
  let rating = ratingForTier(gym.tier);
  if (noteworthy) rating = Math.max(rating, ratingForTier(gym.tier), ratingForTier(gym.tier));
  return makeWorldFighter({
    cityId: gym.cityId,
    affiliation: { kind: 'rival', gymId: gym.id },
    fidelity,
    rating,
    age: proAge(),
    styleTendency: gym.styleTendency,
  });
}

const ESTABLISHED_GYMS = RIVAL_GYMS.filter((g) => g.tier === 'established');

/** One ranked elite for a division — mostly attached to an established house,
    occasionally a promoter-managed independent star. Also used by the world
    sim to fill a rank vacated by retirement, so the ratings never go dark. */
export function makeNationalElite(weightClass: WeightClassKey, rank: number): WorldFighter {
  const rating = clamp(90 - (rank - 1) * 3 + gauss() * 2, 78, 97);
  const age = rand(26, 33);
  if (Math.random() < 0.2 || ESTABLISHED_GYMS.length === 0) {
    // A promoter-managed star, answering to no gym.
    const cityId = RIVAL_GYMS[randInt(0, RIVAL_GYMS.length - 1)].cityId;
    return makeWorldFighter({
      cityId,
      affiliation: { kind: 'independent', sort: 'promoter_star' },
      fidelity: 'national',
      rating,
      age,
      styleTendency: 'showman',
      weightClass,
      nationalRank: rank,
    });
  }
  const gym = ESTABLISHED_GYMS[randInt(0, ESTABLISHED_GYMS.length - 1)];
  return makeWorldFighter({
    cityId: gym.cityId,
    affiliation: { kind: 'rival', gymId: gym.id },
    fidelity: 'national',
    rating,
    age,
    styleTendency: gym.styleTendency,
    weightClass,
    nationalRank: rank,
  });
}

const INDIE_STYLES = ['workhorse', 'brawler', 'counterpuncher', 'pressure_fighter', 'slick_boxer'];

/** A thin independent — a grizzled veteran, an isolated rural man, the rare star. */
function makeIndependent(cityId: CityId): WorldFighter {
  const r = Math.random();
  const sort: IndependentSort = r < 0.5 ? 'veteran' : r < 0.9 ? 'rural' : 'promoter_star';
  let rating: number;
  let age: number;
  if (sort === 'veteran') {
    rating = clamp(48 + gauss() * 14, 25, 82); // were good once, fading
    age = rand(33, 39);
  } else if (sort === 'rural') {
    rating = clamp(40 + gauss() * 18, 18, 88); // wildly variable — a few real
    age = rand(19, 30);
  } else {
    rating = clamp(82 + gauss() * 6, 70, 95);
    age = rand(27, 34);
  }
  return makeWorldFighter({
    cityId,
    affiliation: { kind: 'independent', sort },
    fidelity: 'local',
    rating,
    age,
    styleTendency: INDIE_STYLES[randInt(0, INDIE_STYLES.length - 1)],
    // Local promoter stars are big names, not ranked men — handing them a blind
    // rank collided with the seeded elite (two "Ranked #2"s in one division).
    // The ranked layer is owned by makeNationalElite and the worldSim churn.
    nationalRank: null,
  });
}

/**
 * Seed the whole competitive world around the player's city. Called once at
 * new-game (and on migration for older saves).
 */
export function generateWorld(playerCityId: CityId, dayCount: number): WorldState {
  const fighters: WorldFighter[] = [];
  const region = getCity(playerCityId).region;

  // Local — full rosters for every gym in your city, seeded near plateau.
  for (const gym of gymsInCity(playerCityId)) {
    const n = Math.max(3, rosterPlateau(gym.tier) + randInt(-1, 1));
    for (let i = 0; i < n; i++) fighters.push(makeRivalFighter(gym, 'local'));
  }

  // Regional — a couple of notables per gym elsewhere in your region.
  for (const gym of gymsInRegion(region, playerCityId)) {
    const n = gym.tier === 'local' ? 1 : 2;
    for (let i = 0; i < n; i++) fighters.push(makeRivalFighter(gym, 'regional', true));
  }

  // National — a thin ranked elite, three deep per division.
  for (const wc of WEIGHT_CLASS_KEYS) {
    for (let rank = 1; rank <= 3; rank++) fighters.push(makeNationalElite(wc, rank));
  }

  // Independents — a thin layer near you.
  const indieCount = 3 + randInt(0, 3);
  for (let i = 0; i < indieCount; i++) fighters.push(makeIndependent(playerCityId));

  return { fighters, simThrough: dayCount };
}

// --- promotion -------------------------------------------------------------

/**
 * Generate the full Fighter for a world fighter who's become relevant (you book
 * him, scout him, he poaches your man). Returns the full object; callers cache
 * it on `wf.full`. Identity (name, age, class, city, public rep) is carried over
 * so the promoted man is recognizably the same; his hidden attributes are drawn
 * to match his rating.
 */
export function promoteToFull(wf: WorldFighter): Fighter {
  if (wf.full) return wf.full;
  const quality = clamp((wf.rating - 18) / 50, 0.05, 0.95);
  const base = generateFighter({ cityId: wf.cityId, quality });
  const cls = WEIGHT_CLASSES[wf.weightClass];
  return {
    ...base,
    id: wf.id,
    firstName: wf.firstName,
    lastName: wf.lastName,
    nickname: wf.nickname,
    age: Math.floor(wf.age),
    weightClass: wf.weightClass,
    weightLbs: randInt(cls.weightRange[0], cls.weightRange[1]),
    heightInches: randInt(cls.heightRange[0], cls.heightRange[1]),
    homeCityId: wf.cityId,
    publicReputation: wf.publicReputation,
  };
}

// --- public reads (what the boxing world can see; never the hidden rating) --

export interface Standing {
  label: string;
  tone: 'gold' | 'amber' | 'dim';
}

/** How the sport regards a man — drawn only from public signals (ranking,
    record, public reputation, age), not his hidden rating. For the Rival Gyms tab. */
export function fighterStanding(wf: WorldFighter): Standing {
  if (wf.nationalRank) return { label: `Ranked #${wf.nationalRank}`, tone: 'gold' };
  const fights = wf.record.wins + wf.record.losses + wf.record.draws;
  if (fights <= 4 && wf.age < 24) return { label: 'Prospect', tone: 'amber' };
  if (wf.publicReputation >= 55) return { label: 'Contender', tone: 'amber' };
  const lossRatio = fights ? wf.record.losses / fights : 0;
  if (lossRatio > 0.45) return { label: 'Journeyman', tone: 'dim' };
  if (wf.age >= 33) return { label: 'Veteran', tone: 'dim' };
  return { label: 'Pro', tone: 'dim' };
}

export function worldFighterName(wf: WorldFighter): string {
  return wf.nickname
    ? `${wf.firstName} “${wf.nickname}” ${wf.lastName}`
    : `${wf.firstName} ${wf.lastName}`;
}

/** The camp a fighter answers to — a gym's name, or "Independent". */
export function campOf(wf: WorldFighter): string {
  if (wf.affiliation.kind === 'independent') return 'Independent';
  return getRivalGym(wf.affiliation.gymId)?.name ?? 'Unknown gym';
}

/** The ranked national elite, grouped by division (for the National view). */
export function rankedElite(world: WorldState): WorldFighter[] {
  return world.fighters
    .filter((f) => f.nationalRank !== null)
    .sort((a, b) => (a.nationalRank ?? 99) - (b.nationalRank ?? 99));
}

// --- reads (consumed by 6C-2/3/4 and 6D) -----------------------------------

export function gymRoster(world: WorldState, gymId: string): WorldFighter[] {
  return world.fighters.filter(
    (f) => f.affiliation.kind === 'rival' && f.affiliation.gymId === gymId,
  );
}

/** A gym's most notable men, strongest first — for the Rival Gyms tab. */
export function fightersOfNote(world: WorldState, gymId: string, n = 3): WorldFighter[] {
  return gymRoster(world, gymId)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, n);
}

export function independentsNear(world: WorldState, cityId: CityId): WorldFighter[] {
  return world.fighters.filter((f) => f.affiliation.kind === 'independent' && f.cityId === cityId);
}

export interface MatchmakeQuery {
  weightClass: WeightClassKey;
  minRating?: number;
  maxRating?: number;
  n?: number;
}

/** Candidate opponents from the population — the seed of 6D booking. */
export function matchmake(world: WorldState, q: MatchmakeQuery): WorldFighter[] {
  const lo = q.minRating ?? 0;
  const hi = q.maxRating ?? 100;
  return world.fighters
    .filter((f) => f.weightClass === q.weightClass && f.rating >= lo && f.rating <= hi)
    .sort((a, b) => a.rating - b.rating)
    .slice(0, q.n ?? 12);
}

/** Weight a city's gyms by tier — better houses move faster on a prospect. */
function pickGymWeighted(cityId: CityId): RivalGym | null {
  const gyms = gymsInCity(cityId);
  if (gyms.length === 0) return null;
  const weight = (g: RivalGym) =>
    g.tier === 'established' ? 3 : g.tier === 'regional' ? 2 : 1;
  const total = gyms.reduce((s, g) => s + weight(g), 0);
  let roll = Math.random() * total;
  for (const g of gyms) {
    roll -= weight(g);
    if (roll <= 0) return g;
  }
  return gyms[gyms.length - 1];
}

/** Which local rival signs a walk-in you sat on (6C-3). Better prospects pull
    the better gyms; returns null in a town with no rivals. */
export function pickWalkInPoacher(cityId: CityId, _prospectQuality: number): RivalGym | null {
  return pickGymWeighted(cityId);
}

/** Which local rival door an unhappy, poached fighter walks through (6C-4). */
export function pickPoachDestination(cityId: CityId): RivalGym | null {
  return pickGymWeighted(cityId);
}

// --- walk-in competition (6C-3) --------------------------------------------

/** Probability a prospect at your door gets signed out from under you over
    `days`, scaling with how good he is and how competitive the city. Only real
    prospects (potential past ~50) draw outside interest; nobodies just wander off. */
export function walkInPoachChance(potential: number, competitiveness: number, days: number): number {
  const prospectFactor = clamp((potential - 50) / 50, 0, 1);
  if (prospectFactor <= 0) return 0;
  const perDay = 0.05 * competitiveness * prospectFactor;
  return 1 - Math.pow(1 - perDay, days);
}

/**
 * Turn a walk-in you didn't sign into a rival gym's man. He's a known quantity
 * now (his full Fighter is cached), with a rating read off his current
 * attributes — so if you meet him later, in their corner, he's the same fighter.
 */
export function worldFighterFromFighter(
  f: Fighter,
  gymId: string,
  /** his pro record, when he has one — a man sold off the roster keeps his */
  record?: WorldRecord,
): WorldFighter {
  const a = f.attributes;
  const avg = (a.power + a.speed + a.chin + a.stamina + a.defense + a.ringIq + a.footwork) / 7;
  const rating = clamp(avg, 14, 90);
  return {
    id: `wf_${f.id}`,
    firstName: f.firstName,
    lastName: f.lastName,
    nickname: f.nickname,
    cityId: f.homeCityId,
    weightClass: f.weightClass,
    age: f.age,
    rating,
    record: record ?? { wins: 0, losses: 0, draws: 0, kos: 0 },
    styleTendency: getRivalGym(gymId)?.styleTendency ?? 'workhorse',
    affiliation: { kind: 'rival', gymId },
    fidelity: 'local',
    publicReputation: f.publicReputation,
    nationalRank: null,
    full: f,
  };
}

// --- churn constructors (consumed by worldSim) -----------------------------

/** A gym signs a green prospect to replace a man who's moved on — young, raw,
    room to grow. Keeps a roster near its plateau. Null if the gym is unknown. */
export function signYoungProspect(gymId: string, fidelity: Fidelity): WorldFighter | null {
  const gym = getRivalGym(gymId);
  if (!gym) return null;
  const rating = clamp(ratingForTier(gym.tier) - rand(6, 14), 14, 80);
  return makeWorldFighter({
    cityId: gym.cityId,
    affiliation: { kind: 'rival', gymId },
    fidelity,
    rating,
    age: rand(18, 21),
    styleTendency: gym.styleTendency,
  });
}

/** A new independent drifts into view near the player. */
export function spawnIndependentNear(cityId: CityId): WorldFighter {
  return makeIndependent(cityId);
}

export { getRivalGym, cityCompetitiveness };
