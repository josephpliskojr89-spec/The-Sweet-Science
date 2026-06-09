/*
  Fighter Generation
  --------------------------------------------------------------------------
  The procedural heart. Every fighter is assembled — never authored — from the
  name database, a city archetype, a reputation-driven quality roll, and a
  spread of attributes, traits, physique, and voice. Fifty walk-ins should look
  and read like fifty different people.

  Nothing here is guaranteed: a new gym mostly draws raw, unproven prospects,
  but the curve always leaves room for a surprise in either direction.
*/

import { getCity, type CityId, type StyleArchetype } from './cities';
import { generateName, nicknameFrom } from './names';
import {
  type Appearance,
  type SkinToneKey,
  type HairColorKey,
  type HairStyleKey,
} from './appearance';
import {
  WEIGHT_CLASSES,
  deriveWeightClass,
  type WeightClassKey,
} from './weightClasses';
import { TRAIT_ORDER, TRAITS, type TraitKey } from './traits';
import { generateStatement, generateFirstImpression } from './statements';

export interface Attributes {
  power: number;
  speed: number;
  chin: number;
  stamina: number;
  defense: number;
  ringIq: number;
  footwork: number;
}

export interface Fighter {
  id: string;
  firstName: string;
  lastName: string;
  nickname: string | null;
  age: number;
  heightInches: number;
  weightLbs: number;
  weightClass: WeightClassKey;
  homeCityId: CityId;
  appearance: Appearance;
  attributes: Attributes;
  /** Hidden ceiling — never shown directly. */
  potential: number;
  /** Hinted at signing. */
  visibleTraits: TraitKey[];
  /** Concealed until pressure reveals them (Phase 8). */
  hiddenTraits: TraitKey[];
  statement: string;
  firstImpression: string;
}

// --- small rng helpers -----------------------------------------------------

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}
function randInt(min: number, max: number): number {
  return Math.floor(rand(min, max + 1));
}
function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}
/** Standard normal via Box–Muller. */
function gauss(): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
function weightedKey<K extends string>(weights: Record<K, number>): K {
  const entries = Object.entries(weights) as [K, number][];
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let roll = Math.random() * total;
  for (const [k, w] of entries) {
    roll -= w;
    if (roll <= 0) return k;
  }
  return entries[0][0];
}

// --- appearance from ethnic proxy (the surname subpool) ---------------------

const SKIN_BY_ETH: Record<string, Partial<Record<SkinToneKey, number>>> = {
  african_american: { brown: 34, deep: 34, tan: 22, olive: 8, fair: 2 },
  latino: { olive: 30, tan: 34, brown: 22, fair: 8, deep: 6 },
  italian: { olive: 38, tan: 24, fair: 26, porcelain: 8, brown: 4 },
  jewish: { fair: 40, olive: 30, porcelain: 20, tan: 10 },
  irish: { porcelain: 34, fair: 44, olive: 16, tan: 6 },
  polish: { porcelain: 34, fair: 42, olive: 18, tan: 6 },
  german: { porcelain: 34, fair: 42, olive: 18, tan: 6 },
  asian: { fair: 30, olive: 30, tan: 30, porcelain: 10 },
  southern: { fair: 30, tan: 24, brown: 22, olive: 12, deep: 8, porcelain: 4 },
  general: { fair: 34, olive: 24, porcelain: 18, tan: 14, brown: 8, deep: 2 },
};

const HAIRCOLOR_BY_ETH: Record<string, Partial<Record<HairColorKey, number>>> = {
  african_american: { black: 70, dark_brown: 24, gray: 6 },
  latino: { black: 54, dark_brown: 34, brown: 8, gray: 4 },
  italian: { black: 40, dark_brown: 40, brown: 14, gray: 6 },
  irish: { brown: 30, auburn: 24, blond: 20, dark_brown: 18, gray: 8 },
  jewish: { dark_brown: 40, black: 30, brown: 20, gray: 10 },
  polish: { brown: 30, dark_brown: 30, blond: 24, black: 8, gray: 8 },
  german: { brown: 30, dark_brown: 30, blond: 24, black: 8, gray: 8 },
  asian: { black: 80, dark_brown: 16, gray: 4 },
  southern: { brown: 34, dark_brown: 30, black: 16, blond: 12, gray: 8 },
  general: { brown: 34, dark_brown: 30, black: 16, blond: 12, gray: 8 },
};

const HAIRSTYLE_BY_ETH: Record<string, Partial<Record<HairStyleKey, number>>> = {
  african_american: { afro: 46, crew: 24, bald: 16, curly: 10, side_part: 4 },
  latino: { slick_back: 26, side_part: 24, crew: 22, curly: 16, bald: 8, afro: 4 },
  asian: { crew: 34, side_part: 30, slick_back: 22, bald: 14 },
  general: { side_part: 30, crew: 26, slick_back: 22, curly: 10, bald: 12 },
};

function appearanceForEthnicity(subpool: string): Appearance {
  const skin = SKIN_BY_ETH[subpool] ?? SKIN_BY_ETH.general;
  const color = HAIRCOLOR_BY_ETH[subpool] ?? HAIRCOLOR_BY_ETH.general;
  const style = HAIRSTYLE_BY_ETH[subpool] ?? HAIRSTYLE_BY_ETH.general;
  return {
    skinTone: weightedKey(skin as Record<SkinToneKey, number>),
    hairColor: weightedKey(color as Record<HairColorKey, number>),
    hairStyle: weightedKey(style as Record<HairStyleKey, number>),
  };
}

// --- weight class by city archetype ----------------------------------------

type ClassWeights = Record<WeightClassKey, number>;
const DEFAULT_CLASS_WEIGHTS: ClassWeights = {
  lightweight: 18,
  welterweight: 24,
  middleweight: 26,
  light_heavyweight: 18,
  heavyweight: 14,
};
const CLASS_WEIGHTS_BY_ARCHETYPE: Partial<Record<StyleArchetype, ClassWeights>> = {
  physical: { lightweight: 8, welterweight: 14, middleweight: 22, light_heavyweight: 26, heavyweight: 30 },
  blue_collar: { lightweight: 30, welterweight: 30, middleweight: 22, light_heavyweight: 12, heavyweight: 6 },
  power_puncher: { lightweight: 12, welterweight: 20, middleweight: 28, light_heavyweight: 22, heavyweight: 18 },
  athletic: { lightweight: 22, welterweight: 28, middleweight: 26, light_heavyweight: 16, heavyweight: 8 },
};

// --- attribute tilts by archetype ------------------------------------------

const ATTR_TILT: Partial<Record<StyleArchetype, (keyof Attributes)[]>> = {
  slick_boxer: ['defense', 'ringIq', 'footwork'],
  pressure_fighter: ['stamina', 'power'],
  iron_chin: ['chin', 'stamina'],
  unorthodox: ['footwork', 'ringIq'],
  power_puncher: ['power'],
  workhorse: ['stamina', 'chin'],
  counterpuncher: ['ringIq', 'defense', 'speed'],
  athletic: ['speed', 'footwork'],
  physical: ['power', 'chin'],
  showman: ['speed', 'footwork'],
  technical: ['ringIq', 'defense'],
  blue_collar: ['stamina', 'chin'],
};

// --- nickname category ------------------------------------------------------

const NICK_BY_ARCHETYPE: Record<StyleArchetype, string> = {
  slick_boxer: 'slick_boxer',
  pressure_fighter: 'pressure_fighter',
  iron_chin: 'iron_chin',
  unorthodox: 'unorthodox',
  power_puncher: 'power_puncher',
  workhorse: 'workhorse',
  counterpuncher: 'counterpuncher',
  hybrid: 'prospect',
  athletic: 'prospect',
  hungry: 'prospect',
  physical: 'power_puncher',
  showman: 'showman',
  technical: 'counterpuncher',
  blue_collar: 'workhorse',
};

function maybeNickname(
  archetype: StyleArchetype,
  ethnicity: string,
): string | null {
  // Most raw walk-ins arrive without a press name yet.
  if (Math.random() > 0.4) return null;
  if (ethnicity === 'latino' && Math.random() < 0.5) {
    return nicknameFrom('latino');
  }
  // Half the time a generic "prospect" tag, otherwise a style tag.
  const category = Math.random() < 0.5 ? 'prospect' : NICK_BY_ARCHETYPE[archetype];
  return nicknameFrom(category) ?? nicknameFrom('prospect');
}

// --- traits -----------------------------------------------------------------

function assignTraits(quality: number): { visible: TraitKey[]; hidden: TraitKey[] } {
  const pool = [...TRAIT_ORDER];
  const draw = (): TraitKey => pool.splice(Math.floor(Math.random() * pool.length), 1)[0];

  // Better prospects carry more — and more beneath the surface.
  const total = quality > 0.7 ? randInt(2, 3) : quality > 0.4 ? randInt(1, 3) : randInt(1, 2);

  const chosen: TraitKey[] = [];
  for (let i = 0; i < total && pool.length; i++) chosen.push(draw());

  // Each trait conceals itself by its own bias — Lionheart almost never shows
  // at signing, Hot Tempered usually does.
  let visible: TraitKey[] = [];
  let hidden: TraitKey[] = [];
  for (const t of chosen) {
    if (Math.random() < TRAITS[t].hiddenBias) hidden.push(t);
    else visible.push(t);
  }

  // A man with a couple of traits should give at least one read; a man with a
  // single concealable trait (a quiet Lionheart) can stay a mystery for now.
  if (visible.length === 0 && chosen.length >= 2) {
    const easiest = hidden.reduce((a, b) => (TRAITS[a].hiddenBias <= TRAITS[b].hiddenBias ? a : b));
    hidden = hidden.filter((t) => t !== easiest);
    visible = [easiest];
  }
  if (visible.length > 2) {
    visible.sort((a, b) => TRAITS[a].hiddenBias - TRAITS[b].hiddenBias);
    hidden = [...hidden, ...visible.slice(2)];
    visible = visible.slice(0, 2);
  }

  return { visible, hidden };
}

// --- attributes -------------------------------------------------------------

function generateAttributes(quality: number, archetype: StyleArchetype): {
  attributes: Attributes;
  potential: number;
} {
  // A new gym's quality is low; mean sits in the raw-prospect band with spread.
  const mean = 18 + quality * 40; // ~18..58
  const tilt = new Set(ATTR_TILT[archetype] ?? []);

  const make = (k: keyof Attributes) =>
    Math.round(clamp(mean + gauss() * 9 + (tilt.has(k) ? 7 : 0), 5, 92));

  const attributes: Attributes = {
    power: make('power'),
    speed: make('speed'),
    chin: make('chin'),
    stamina: make('stamina'),
    defense: make('defense'),
    ringIq: make('ringIq'),
    footwork: make('footwork'),
  };

  const current =
    Object.values(attributes).reduce((s, v) => s + v, 0) / 7;
  const potential = Math.round(
    clamp(current + 8 + quality * 24 + Math.abs(gauss()) * 6, current, 99),
  );

  return { attributes, potential };
}

// --- the assembler ----------------------------------------------------------

export interface GenerateFighterOptions {
  cityId: CityId;
  /** 0..1 gym reputation quality. A brand-new gym is low. */
  quality?: number;
}

function makeId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `f_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function generateFighter(opts: GenerateFighterOptions): Fighter {
  const city = getCity(opts.cityId);
  const archetype = city.archetype;

  // A small chance of a surprise above the gym's usual draw.
  const base = opts.quality ?? 0.2;
  const quality = clamp(
    Math.random() < 0.08 ? base + rand(0.2, 0.45) : base + gauss() * 0.12,
    0.05,
    0.97,
  );

  const name = generateName(opts.cityId);
  const ethnicity = name.lastSubpool;
  const appearance = appearanceForEthnicity(ethnicity);

  const classKey = weightedKey(
    CLASS_WEIGHTS_BY_ARCHETYPE[archetype] ?? DEFAULT_CLASS_WEIGHTS,
  );
  const cls = WEIGHT_CLASSES[classKey];
  const weightLbs = randInt(cls.weightRange[0], cls.weightRange[1]);
  const heightInches = randInt(cls.heightRange[0], cls.heightRange[1]);

  // Prospects skew young; a few older hopefuls round it out.
  const age = Math.random() < 0.75 ? randInt(18, 24) : randInt(25, 31);

  const { visible, hidden } = assignTraits(quality);
  const { attributes, potential } = generateAttributes(quality, archetype);

  return {
    id: makeId(),
    firstName: name.first,
    lastName: name.last,
    nickname: maybeNickname(archetype, ethnicity),
    age,
    heightInches,
    weightLbs,
    weightClass: deriveWeightClass(weightLbs),
    homeCityId: opts.cityId,
    appearance,
    attributes,
    potential,
    visibleTraits: visible,
    hiddenTraits: hidden,
    statement: generateStatement([...visible, ...hidden]),
    firstImpression: generateFirstImpression(visible),
  };
}

/** Display helper: "Anthony \"Nicky\" Russo" or "Anthony Russo". */
export function fighterFullName(f: Fighter): string {
  return f.nickname
    ? `${f.firstName} “${f.nickname}” ${f.lastName}`
    : `${f.firstName} ${f.lastName}`;
}
