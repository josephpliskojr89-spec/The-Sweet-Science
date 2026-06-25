/*
  Coaches (Phase 6B)
  --------------------------------------------------------------------------
  Coaches are people, not stat sticks — a specialty, a personality, a tier, a
  salary, and limited capacity (bible: Coach System). Procedurally generated;
  no two saves share a cast. A small gym gets small-gym people: early on the
  market is mostly local ex-fighters and part-timers, affordable and flawed.

  6B-1 (this pass): generation, the hiring market, salaries (into the monthly
  books), and the two benefits a coach brings — more focused-training slots and
  a lift to how well focused fighters develop. Deliberate per-coach assignment
  and specialty/chemistry matching come in 6B-2.
*/

import { generateName } from './names';
import type { CityId } from './cities';
import type { TraitKey } from './traits';
import type { AttrKey } from './training';

export type CoachSpecialty =
  | 'trainer'
  | 'cutman'
  | 'corner_strategist'
  | 'conditioner'
  | 'defense'
  | 'power'
  | 'mental';

export type CoachPersonality =
  | 'hardass'
  | 'teacher'
  | 'motivator'
  | 'technician'
  | 'loyalist'
  | 'mercenary'
  | 'old_lion';

export type CoachTier = 'local' | 'regional' | 'established' | 'elite';

export interface Coach {
  id: string;
  name: string;
  specialty: CoachSpecialty;
  personality: CoachPersonality;
  tier: CoachTier;
  age: number;
  /** Weekly salary in 1975 base dollars (inflated at payment, economy.ts). */
  weeklySalaryBase: number;
  /** Focused-training slots he adds to the gym. */
  slots: number;
  /** Hidden effectiveness 0..1 — how much he lifts development. */
  skill: number;
}

// --- catalog ----------------------------------------------------------------

const SPECIALTY_META: Record<CoachSpecialty, { name: string; blurb: string }> = {
  trainer: { name: 'Trainer', blurb: 'General development and fundamentals — safe and flexible.' },
  cutman: { name: 'Cutman', blurb: 'Keeps fighters functional and extends careers. Shines on fight night.' },
  corner_strategist: { name: 'Corner Strategist', blurb: 'A fight-night tactician — game plans and adjustments.' },
  conditioner: { name: 'Conditioner', blurb: 'Physical preparation — stamina and late-round pace.' },
  defense: { name: 'Defense Coach', blurb: 'Footwork, head movement, ring awareness.' },
  power: { name: 'Power Development', blurb: 'Punching and finishing power.' },
  mental: { name: 'Mental Coach', blurb: 'Psychological preparation — composure and focus.' },
};

const PERSONALITY_META: Record<CoachPersonality, { name: string; blurb: string }> = {
  hardass: { name: 'Old School Hardass', blurb: 'Results through pressure and discipline. Hard on fragile men.' },
  teacher: { name: 'Teacher', blurb: 'Patient and developmental. Excellent with raw young prospects.' },
  motivator: { name: 'Motivator', blurb: 'Emotional fuel and belief. Useful after losses.' },
  technician: { name: 'Technician', blurb: 'Detail-obsessed and precise. Sharp fighters get sharper.' },
  loyalist: { name: 'Loyalist', blurb: 'Committed to the gym and its men. Builds trust, resists cuts.' },
  mercenary: { name: 'Mercenary', blurb: 'Professional and money-driven. Competent — but watch the door.' },
  old_lion: { name: 'Old Lion', blurb: 'A fading great. Deep wisdom, declining energy.' },
};

const TIER_META: Record<CoachTier, { name: string }> = {
  local: { name: 'Local' },
  regional: { name: 'Regional' },
  established: { name: 'Established' },
  elite: { name: 'Elite' },
};

export const specialtyName = (s: CoachSpecialty) => SPECIALTY_META[s].name;
export const specialtyBlurb = (s: CoachSpecialty) => SPECIALTY_META[s].blurb;
export const personalityName = (p: CoachPersonality) => PERSONALITY_META[p].name;
export const personalityBlurb = (p: CoachPersonality) => PERSONALITY_META[p].blurb;
export const tierName = (t: CoachTier) => TIER_META[t].name;

/** Weekly salary as a monthly figure (1975 base) for the books. */
export function coachMonthlySalaryBase(c: Coach): number {
  return c.weeklySalaryBase * (52 / 12);
}

// --- generation -------------------------------------------------------------

const SPECIALTIES: CoachSpecialty[] = [
  'trainer',
  'cutman',
  'corner_strategist',
  'conditioner',
  'defense',
  'power',
  'mental',
];
const PERSONALITIES: CoachPersonality[] = [
  'hardass',
  'teacher',
  'motivator',
  'technician',
  'loyalist',
  'mercenary',
  'old_lion',
];

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}
function randInt(min: number, max: number) {
  return Math.floor(rand(min, max + 1));
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function makeId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `c_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

const TIER_SKILL: Record<CoachTier, [number, number]> = {
  local: [0.3, 0.5],
  regional: [0.5, 0.66],
  established: [0.66, 0.8],
  elite: [0.8, 0.95],
};
const TIER_SALARY: Record<CoachTier, [number, number]> = {
  local: [15, 30],
  regional: [35, 60],
  established: [70, 110],
  elite: [130, 200],
};

/** Tier drawn by gym reputation 0..1 — a new gym mostly sees local men. */
function rollTier(reputation: number): CoachTier {
  const weights: Record<CoachTier, number> = {
    local: Math.max(0.1, 1 - reputation * 0.7),
    regional: 0.2 + reputation * 0.4,
    established: Math.max(0, reputation * 0.4 - 0.05),
    elite: Math.max(0, reputation - 0.55) * 0.5,
  };
  const entries = Object.entries(weights) as [CoachTier, number][];
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let roll = Math.random() * total;
  for (const [t, w] of entries) {
    roll -= w;
    if (roll <= 0) return t;
  }
  return 'local';
}

export function generateCoach(
  cityId: CityId,
  reputation = 0,
  /** Bias the specialty toward a posted opening (someone off-spec may still answer). */
  preferred?: CoachSpecialty,
): Coach {
  const tier = rollTier(reputation);
  // Local floors skew to general Trainers; specialists are rarer down here.
  let specialty: CoachSpecialty;
  if (preferred) {
    specialty = Math.random() < 0.78 ? preferred : pick(SPECIALTIES);
  } else {
    specialty = tier === 'local' && Math.random() < 0.4 ? 'trainer' : pick(SPECIALTIES);
  }
  const personality = Math.random() < 0.1 ? 'old_lion' : pick(PERSONALITIES);
  const oldLion = personality === 'old_lion';

  let skill = rand(...TIER_SKILL[tier]);
  if (personality === 'technician' || personality === 'teacher') skill += 0.05;
  if (oldLion) skill = Math.max(skill, rand(0.6, 0.85)); // wisdom
  skill = Math.min(0.97, skill);

  let slots = tier === 'local' ? 1 : tier === 'regional' ? randInt(1, 2) : tier === 'established' ? 2 : randInt(2, 3);
  if (oldLion) slots = Math.max(1, slots - 1); // declining energy

  const age = oldLion
    ? randInt(58, 70)
    : tier === 'elite'
      ? randInt(40, 58)
      : randInt(34, 62);

  const [smin, smax] = TIER_SALARY[tier];
  const weeklySalaryBase = Math.round(rand(smin, smax) * (0.85 + skill * 0.3));

  return {
    id: makeId(),
    name: generateName(cityId).full,
    specialty,
    personality,
    tier,
    age,
    weeklySalaryBase,
    slots,
    skill: Math.round(skill * 100) / 100,
  };
}

/** The pool of coaches available to hire. Small and modest for a new gym. */
export function generateCoachMarket(cityId: CityId, reputation = 0, n = 3): Coach[] {
  return Array.from({ length: n }, () => generateCoach(cityId, reputation));
}

// --- the job posting & applicants -------------------------------------------
// Coaches don't walk in off the street like fighters (bible). You put out word
// for the kind of help you want, then wait to see who answers. The better
// known your gym, the more — and better — coaches respond.

export const SPECIALTY_ORDER: CoachSpecialty[] = SPECIALTIES;

/** What you're hiring for: a specialty, or anyone qualified. */
export type CoachPosting = CoachSpecialty | 'any';

export interface CoachApplicant {
  coach: Coach;
  /** Days before he takes other work. */
  patience: number;
}

/** Daily chance a coach answers an open posting — a trickle for a new gym. */
function dailyApplyChance(reputation: number): number {
  return 0.05 + reputation * 0.18;
}

/** Simulate `days` of an open search and return who reached out. */
export function rollCoachApplicants(
  days: number,
  cityId: CityId,
  reputation: number,
  posting: CoachPosting,
): CoachApplicant[] {
  const out: CoachApplicant[] = [];
  const chance = dailyApplyChance(reputation);
  const preferred = posting === 'any' ? undefined : posting;
  for (let i = 0; i < days; i++) {
    if (Math.random() < chance) {
      out.push({
        coach: generateCoach(cityId, reputation, preferred),
        patience: randInt(21, 70),
      });
    }
  }
  return out.slice(0, 2); // never a flood from one advance
}

export interface ApplicantAgeResult {
  staying: CoachApplicant[];
  left: CoachApplicant[];
}

/** Age the pending applicants; the ones out of patience took other work. */
export function ageApplicants(applicants: CoachApplicant[], days: number): ApplicantAgeResult {
  const staying: CoachApplicant[] = [];
  const left: CoachApplicant[] = [];
  for (const a of applicants) {
    const patience = a.patience - days;
    if (patience <= 0) left.push(a);
    else staying.push({ ...a, patience });
  }
  return { staying, left };
}

// --- assignment effects (6B-2) ---------------------------------------------

/** The attributes a specialist accelerates when his fighter focuses on them.
    A Trainer is a generalist — no specific match, value is in effectiveness. */
const SPECIALTY_ATTRS: Partial<Record<CoachSpecialty, AttrKey[]>> = {
  conditioner: ['stamina'],
  defense: ['defense', 'ringIq', 'footwork'],
  power: ['power'],
  mental: ['ringIq'],
  cutman: ['chin'],
  corner_strategist: ['ringIq'],
};

/** Whether this coach's specialty accelerates a given focus attribute. */
export function coachBoostsAttr(coach: Coach, attr: AttrKey): boolean {
  return (SPECIALTY_ATTRS[coach.specialty] ?? []).includes(attr);
}

const clampN = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/**
 * Coach-fighter chemistry — a development multiplier from how a personality
 * meets a man (bible: Coach-Fighter Chemistry). Uses all of his traits, since
 * chemistry is real whether or not the player has read it yet.
 */
export function coachChemistry(coach: Coach, traits: TraitKey[], age: number): number {
  const has = (t: TraitKey) => traits.includes(t);
  let f = 1;
  switch (coach.personality) {
    case 'hardass':
      if (has('chip_on_shoulder')) f *= 1.1;
      if (has('comfort_seeker')) f *= 1.06;
      if (has('glory_hunter')) f *= 1.04;
      if (has('insecure')) f *= 0.82;
      if (has('unfocused')) f *= 0.92;
      break;
    case 'teacher':
      if (age <= 23) f *= 1.08;
      if (has('insecure')) f *= 1.06;
      if (has('hot_tempered')) f *= 0.9;
      if (has('glory_hunter')) f *= 0.94;
      break;
    case 'motivator':
      if (has('insecure')) f *= 1.12;
      if (has('chip_on_shoulder')) f *= 1.06;
      if (has('glory_hunter')) f *= 1.05;
      if (has('comfort_seeker')) f *= 0.9;
      if (has('reckless_brave')) f *= 0.94;
      break;
    case 'technician':
      if (has('hot_tempered')) f *= 0.88;
      break;
    case 'loyalist':
      if (has('family_man')) f *= 1.08;
      if (has('insecure')) f *= 1.05;
      break;
    case 'old_lion':
      if (has('lionheart')) f *= 1.08;
      if (age <= 21) f *= 1.05;
      break;
    case 'mercenary':
    default:
      break;
  }
  return clampN(f, 0.78, 1.18);
}

export type ChemistryTone = 'good' | 'ok' | 'warn';
/** A soft read on chemistry for the UI — the manager's sense, not a number. */
export function chemistryRead(factor: number): { label: string; tone: ChemistryTone } {
  if (factor >= 1.05) return { label: 'Clicking', tone: 'good' };
  if (factor <= 0.93) return { label: 'Friction', tone: 'warn' };
  return { label: 'Settling in', tone: 'ok' };
}
