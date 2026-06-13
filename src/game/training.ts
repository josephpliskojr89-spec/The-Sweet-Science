/*
  Training & Development
  --------------------------------------------------------------------------
  How fighters grow and fade. Per the bible:
  - General training runs automatically for locker holders, under the gym's
    general philosophy (the player's city archetype), at a baseline rate. Men
    without a locker train in "limited mode" — a fraction of that.
  - Focused training is the player's personal attention, capped by coaching
    capacity (just the manager at first — one or two slots). It develops a
    fighter faster and, with a chosen focus, more specifically.
  - Attributes develop through training and decline with age (and, later,
    damage). Reflexes go first.

  Morale feeds the rate — a settled fighter improves, a bitter one barely does
  — which is the first real payoff of the relationship layer in development,
  and the seed of camp quality (Phase 8).

  Pure: trainFighter takes a roster entry and the gym's archetype, returns new
  attributes, the per-attribute change (for trend display), and an optional
  log note when something notable happens.
*/

import type { Attributes } from './fighters';
import type { StyleArchetype } from './cities';
import type { RosterEntry } from './roster';

export type AttrKey = keyof Attributes;
export type TrainingFocus = AttrKey | 'rounded';

export const ATTR_KEYS: AttrKey[] = [
  'power',
  'speed',
  'chin',
  'stamina',
  'defense',
  'ringIq',
  'footwork',
];

export const ATTR_LABELS: Record<AttrKey, string> = {
  power: 'Power',
  speed: 'Speed',
  chin: 'Chin',
  stamina: 'Stamina',
  defense: 'Defense',
  ringIq: 'Ring IQ',
  footwork: 'Footwork',
};

/** Focused slots from the manager alone. Coaches add to this in Phase 6. */
export const FOCUS_SLOTS_BASE = 2;

/** Which attributes the gym develops, by its general philosophy. */
const ARCH_EMPHASIS: Record<StyleArchetype, AttrKey[]> = {
  slick_boxer: ['defense', 'ringIq', 'footwork'],
  pressure_fighter: ['stamina', 'power'],
  iron_chin: ['chin', 'stamina'],
  unorthodox: ['footwork', 'ringIq'],
  power_puncher: ['power'],
  workhorse: ['stamina', 'chin'],
  counterpuncher: ['ringIq', 'defense', 'speed'],
  hybrid: ['stamina', 'ringIq'],
  athletic: ['speed', 'footwork'],
  hungry: ['stamina', 'power'],
  physical: ['power', 'chin'],
  showman: ['speed', 'footwork'],
  technical: ['ringIq', 'defense'],
  blue_collar: ['stamina', 'chin'],
};

const GYM_PHILOSOPHY: Record<StyleArchetype, string> = {
  slick_boxer: 'slick boxing',
  pressure_fighter: 'pressure fighting',
  iron_chin: 'iron-chinned attrition',
  unorthodox: 'unorthodox, self-taught',
  power_puncher: 'power punching',
  workhorse: 'high-tempo workrate',
  counterpuncher: 'patient counterpunching',
  hybrid: 'adaptable, all-round',
  athletic: 'athletic, explosive',
  hungry: 'hungry, hard-nosed',
  physical: 'big, physical',
  showman: 'showmanship and speed',
  technical: 'technical fundamentals',
  blue_collar: 'blue-collar toughness',
};

export function gymPhilosophyLabel(archetype: StyleArchetype): string {
  return GYM_PHILOSOPHY[archetype];
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/** Development speed by age — peak in the early twenties, gone by the mid-30s. */
function ageFactor(age: number): number {
  if (age <= 23) return 1.2;
  if (age <= 27) return 1.0;
  if (age <= 30) return 0.6;
  if (age <= 33) return 0.25;
  return 0;
}

/** Weekly decline once a fighter ages — reflexes (speed, feet) erode first. */
function declinePerWeek(age: number, attr: AttrKey): number {
  if (age < 31) return 0;
  const ramp = age <= 33 ? 0.02 : age <= 36 ? 0.05 : 0.09;
  const mult =
    attr === 'speed' || attr === 'footwork'
      ? 1.4
      : attr === 'defense'
        ? 1.1
        : attr === 'power' || attr === 'chin' || attr === 'stamina'
          ? 0.6
          : 0.8; // ring IQ is durable
  return ramp * mult;
}

/** A settled fighter develops; a bitter one barely does. */
function moraleFactor(morale: number): number {
  return clamp(morale / 65, 0.3, 1.15);
}

/** A man's ceiling in an attribute — higher in his gym's emphasized areas. */
function ceilingFor(potential: number, emphasized: boolean): number {
  return clamp(potential + (emphasized ? 8 : -4), 30, 99);
}

const GENERAL_BASE = 0.13; // weekly growth per emphasized attr at full factors
const OFF_EMPHASIS = 0.4;
const FOCUS_GLOBAL = 1.6; // a focused fighter develops faster overall
const FOCUS_AREA = 2.4; // and his chosen area especially

const NOTE_LINES: Record<AttrKey, string> = {
  power: '{name}’s power is starting to show — the heavy bag jumps now.',
  speed: '{name}’s hands have come on. You can see it on the double-end bag.',
  chin: '{name} is learning to take it as well as give it.',
  stamina: '{name} isn’t fading in the late rounds of sparring the way he used to.',
  defense: '{name} is harder to hit than he was a month ago.',
  ringIq: '{name} is reading the room in there now — fewer wasted moves.',
  footwork: '{name}’s feet are quicker; he stopped getting cornered.',
};

export interface TrainResult {
  attributes: Attributes;
  lastDelta: Partial<Record<AttrKey, number>>;
  note?: string;
}

export function trainFighter(
  entry: RosterEntry,
  gymArchetype: StyleArchetype,
  days: number,
  /** Equipment multiplier from gym upgrades (1.0 = standard gear). */
  equipment = 1,
): TrainResult {
  const f = entry.fighter;
  const emphasis = new Set(ARCH_EMPHASIS[gymArchetype] ?? []);
  const focused = entry.focus !== null;
  const weeks = days / 7;
  const af = ageFactor(f.age);
  const mf = moraleFactor(entry.morale);
  const lockerMult = entry.hasLocker ? 1 : 0.25;
  const focusGlobal = focused ? FOCUS_GLOBAL : 1;

  const attrs: Attributes = { ...f.attributes };
  const lastDelta: Partial<Record<AttrKey, number>> = {};
  let biggest: AttrKey | null = null;
  let biggestGain = 0;

  for (const k of ATTR_KEYS) {
    const emph = emphasis.has(k);
    const ceil = ceilingFor(f.potential, emph);
    let delta = 0;

    if (af > 0) {
      const headroom = clamp((ceil - attrs[k]) / 35, 0, 1);
      let rate = GENERAL_BASE * (emph ? 1 : OFF_EMPHASIS) * headroom * af * mf * lockerMult * focusGlobal;
      // His feel for the craft — a natural climbs fast, a slow study barely.
      rate *= f.growth;
      // Better equipment lifts everyone a little.
      rate *= equipment;
      if (focused) {
        if (entry.focus === 'rounded') rate *= 1.2;
        else if (entry.focus === k) rate *= FOCUS_AREA;
      }
      delta += rate * weeks;
    }

    // Age decline runs regardless of growth; neglect worsens it a touch.
    delta -= declinePerWeek(f.age, k) * weeks * (entry.hasLocker ? 1 : 1.2);

    const before = attrs[k];
    attrs[k] = clamp(attrs[k] + delta, 1, 99);
    const real = attrs[k] - before;
    if (Math.abs(real) >= 0.05) lastDelta[k] = real;
    if (real > biggestGain) {
      biggestGain = real;
      biggest = k;
    }
  }

  let note: string | undefined;
  if (focused && biggest && biggestGain >= 0.45) {
    note = NOTE_LINES[biggest].replace(/\{name\}/g, `${f.firstName} ${f.lastName}`);
  }

  return { attributes: attrs, lastDelta, note };
}

export type DevTone = 'good' | 'ok' | 'warn' | 'crit';
export interface DevState {
  label: string;
  tone: DevTone;
}

/** A stable read on where a fighter is in his arc — uses structure (age, room
    to grow) so it doesn't flicker with the length of a single advance. */
export function developmentState(entry: RosterEntry): DevState {
  const f = entry.fighter;
  const overall = ATTR_KEYS.reduce((s, k) => s + f.attributes[k], 0) / ATTR_KEYS.length;
  const gap = f.potential - overall;
  const net = Object.values(entry.lastDelta ?? {}).reduce((s, v) => s + v, 0);

  if (!entry.hasLocker) return { label: 'Limited', tone: 'warn' };
  if (f.age >= 32 && (net < -0.05 || gap <= 0)) return { label: 'Declining', tone: 'crit' };
  if (net >= 0.5) return { label: 'Coming on', tone: 'good' };
  if (f.age <= 26 && gap >= 8) return { label: 'Developing', tone: 'good' };
  if (gap <= 3) return { label: 'Plateaued', tone: 'warn' };
  if (f.age >= 32) return { label: 'Veteran', tone: 'ok' };
  return { label: 'Steady', tone: 'ok' };
}

export function focusLabel(focus: TrainingFocus): string {
  return focus === 'rounded' ? 'Well-rounded' : ATTR_LABELS[focus];
}

// --- developmental feel (the discoverable extremes) -------------------------

/** Only the tails are notable enough to read and reveal. Ordinary feel stays
    unstated — you judge the middle by the development curve, not a label. */
export const NATURAL_THRESHOLD = 1.45;
export const SLOW_STUDY_THRESHOLD = 0.62;

export type DevFeelTone = 'good' | 'warn';
export interface DevFeel {
  label: string;
  blurb: string;
  tone: DevFeelTone;
}

/** A read on a fighter's feel — only for the extremes worth naming. */
export function devFeel(growth: number): DevFeel | null {
  if (growth >= NATURAL_THRESHOLD) {
    return {
      label: 'A Natural',
      blurb: 'Picks the craft up fast — show him once and it’s his.',
      tone: 'good',
    };
  }
  if (growth <= SLOW_STUDY_THRESHOLD) {
    return {
      label: 'Slow Study',
      blurb: 'The work goes in and barely comes out. Honest, willing, stuck.',
      tone: 'warn',
    };
  }
  return null;
}

// --- attribute history & trends (FM-style progression) ----------------------

/** A dated record of a fighter's attributes, for the progression view. */
export interface AttrSnapshot {
  day: number;
  attrs: Record<AttrKey, number>;
}

export function snapshotAttrs(attrs: Attributes, day: number): AttrSnapshot {
  const a = {} as Record<AttrKey, number>;
  for (const k of ATTR_KEYS) a[k] = attrs[k];
  return { day, attrs: a };
}

/** The window an arrow reflects — recent form, not one session or a whole career. */
const TREND_WINDOW_DAYS = 49;
/** Change needed to show an arrow at all. */
const TREND_THRESHOLD = 0.6;

export interface AttrTrend {
  dir: 'up' | 'down' | null;
  /** Change over the recent window (drives the arrow). */
  windowChange: number;
  /** Change since he first walked in. */
  totalChange: number;
}

export function attributeTrend(
  entry: RosterEntry,
  k: AttrKey,
  currentDay: number,
): AttrTrend {
  const hist = entry.history ?? [];
  const cur = entry.fighter.attributes[k];
  if (hist.length === 0) return { dir: null, windowChange: 0, totalChange: 0 };

  // Latest snapshot at or before the window cutoff; else the earliest we have.
  const cutoff = currentDay - TREND_WINDOW_DAYS;
  let baseline = hist[0];
  for (const s of hist) {
    if (s.day <= cutoff) baseline = s;
  }

  const windowChange = cur - baseline.attrs[k];
  const totalChange = cur - hist[0].attrs[k];
  const dir =
    windowChange >= TREND_THRESHOLD ? 'up' : windowChange <= -TREND_THRESHOLD ? 'down' : null;
  return { dir, windowChange, totalChange };
}

/** The series for a sparkline — historical snapshots plus the live value. */
export function attributeSeries(entry: RosterEntry, k: AttrKey): number[] {
  const hist = entry.history ?? [];
  return [...hist.map((s) => s.attrs[k]), entry.fighter.attributes[k]];
}
