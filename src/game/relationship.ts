/*
  Relationship
  --------------------------------------------------------------------------
  How a fighter feels about being in your gym — the layer that gives locker
  decisions weight and memory. Two values, and the asymmetry between them is
  the whole point:

    morale — short-term mood. Moves fast, drifts back toward a baseline.
    trust  — his relationship with you. Breaks easily, heals slowly, and only
             while he's settled. This is what makes yo-yoing a locker a real
             cost instead of a free action.

  Taking a locker hurts; giving it back helps less; doing it repeatedly
  compounds (he learns you're fickle) and craters trust, which waiting does not
  refill. Personality and where he thought he stood scale the blow. The values
  feed quit risk now (departures.ts) and, later, camp quality (Phase 5) and
  corner influence (Phase 8) through the same roster data.

  Surfaced only qualitatively (moodLabel) — felt, never min-maxed.
*/

import type { RosterEntry, HierarchyTier } from './roster';
import type { TraitKey } from './traits';

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export interface Relationship {
  morale: number;
  trust: number;
  /** How many times you've pulled his locker — durable memory that compounds. */
  lockerLossCount: number;
}

/** Starting feelings. A man given a locker arrives more settled than a man
    left on provisional terms. */
export function initialRelationship(hasLocker: boolean): Relationship {
  return hasLocker
    ? { morale: 66, trust: 54, lockerLossCount: 0 }
    : { morale: 54, trust: 48, lockerLossCount: 0 };
}

// --- trait sensitivity to losing a locker -----------------------------------

function traitLockerMod(traits: TraitKey[]): { morale: number; trust: number } {
  let morale = 1;
  let trust = 1;
  for (const t of traits) {
    switch (t) {
      case 'insecure': // hears confirmation that he's failing
        morale *= 1.6;
        trust *= 1.3;
        break;
      case 'hot_tempered': // takes it personally
        morale *= 1.15;
        trust *= 1.1;
        break;
      case 'comfort_seeker': // not much fazes him
        morale *= 0.6;
        trust *= 0.8;
        break;
      case 'chip_on_shoulder': // resents it, but channels it — trust still erodes
        morale *= 0.6;
        break;
      case 'lionheart':
        morale *= 0.75;
        break;
      case 'glory_hunter':
      case 'reckless_brave':
        morale *= 0.85;
        break;
      default:
        break;
    }
  }
  return { morale, trust };
}

function tierExpectationMod(tier: HierarchyTier): number {
  // Losing a locker off the chopping block is half-expected; losing one as a
  // Must Keep is a betrayal.
  if (tier === 'must_keep') return 1.5;
  if (tier === 'chopping') return 0.5;
  return 1;
}

function allTraits(entry: RosterEntry): TraitKey[] {
  return [...entry.fighter.visibleTraits, ...entry.fighter.hiddenTraits];
}

const TAKE_MORALE_BASE = 16;
const TAKE_TRUST_BASE = 9;
const GIVE_MORALE_BASE = 10;
const GIVE_TRUST_BASE = 3;

/** Pull his locker. Returns the new relationship values. */
export function applyLockerTaken(entry: RosterEntry): Relationship {
  const tm = traitLockerMod(allTraits(entry));
  const tierMod = tierExpectationMod(entry.tier);
  const compound = 1 + 0.4 * entry.lockerLossCount;
  return {
    morale: clamp(entry.morale - TAKE_MORALE_BASE * tm.morale * tierMod * compound, 0, 100),
    trust: clamp(entry.trust - TAKE_TRUST_BASE * tm.trust * tierMod * compound, 0, 100),
    lockerLossCount: entry.lockerLossCount + 1,
  };
}

/** Give him a locker. A lift — but it doesn't undo the memory. */
export function applyLockerGranted(entry: RosterEntry): Relationship {
  const insecure = allTraits(entry).includes('insecure');
  const moraleGain = GIVE_MORALE_BASE * (insecure ? 1.3 : 1);
  // A first locker feels better than getting one back after you took it.
  const trustGain = GIVE_TRUST_BASE + (entry.lockerLossCount > 0 ? 0 : 2);
  return {
    morale: clamp(entry.morale + moraleGain, 0, 100),
    trust: clamp(entry.trust + trustGain, 0, 100),
    lockerLossCount: entry.lockerLossCount,
  };
}

/** Being cut but choosing to stay and earn it back — a real blow, but he kept
    some faith by staying. (The redemption payoff lives in later phases.) */
export function applyCutStayed(entry: RosterEntry): Relationship {
  return {
    morale: clamp(entry.morale - 18, 0, 100),
    trust: clamp(entry.trust - 6, 0, 100),
    lockerLossCount: entry.lockerLossCount + 1,
  };
}

/** A cut sends a ripple through the gym. How a man takes seeing a stablemate
    let go depends on who he is: a Family Man or a man of heart feels it, the
    insecure fear they're next, the ruthless count one fewer rival. Returns the
    morale delta for one witness. (Light version — friendship-specific reactions
    wait for inter-fighter relationships; bible: Lockerless Fighters #7.) */
export function cutMoraleRipple(witness: RosterEntry): number {
  const traits = allTraits(witness);
  let delta = -3;
  if (traits.includes('family_man')) delta -= 3;
  if (traits.includes('lionheart')) delta -= 2;
  if (traits.includes('insecure')) delta -= 2;
  if (traits.includes('glory_hunter') || traits.includes('chip_on_shoulder')) delta += 1;
  return delta;
}

const MORALE_RATE = 0.45; // per day, toward baseline
const TRUST_HEAL_RATE = 0.09; // per day, only while settled
const TRUST_HEAL_CAP = 65; // management alone won't fully rebuild trust

/** Let time pass. Morale drifts toward its baseline; trust mends slowly, and
    only for a man who has a locker and isn't on the block. */
export function recover(entry: RosterEntry, days: number): RosterEntry {
  const baseline = entry.hasLocker ? 62 : 48;
  const diff = baseline - entry.morale;
  const morale = clamp(
    entry.morale + Math.sign(diff) * Math.min(Math.abs(diff), MORALE_RATE * days),
    0,
    100,
  );

  let trust = entry.trust;
  if (entry.hasLocker && entry.tier !== 'chopping' && trust < TRUST_HEAL_CAP) {
    trust = clamp(trust + TRUST_HEAL_RATE * days, 0, TRUST_HEAL_CAP);
  }

  return { ...entry, morale, trust };
}

/** Extra daily quit chance from a damaged relationship. Low trust is the heavy
    driver — this is what makes a betrayed locker holder leave anyway. */
export function relationshipQuitBonus(entry: RosterEntry): number {
  let bonus = 0;
  if (entry.trust < 40) bonus += ((40 - entry.trust) / 40) * 0.02;
  if (entry.morale < 35) bonus += ((35 - entry.morale) / 35) * 0.008;
  return bonus;
}

// --- qualitative surfacing --------------------------------------------------

export type MoodTone = 'good' | 'ok' | 'warn' | 'crit';

export interface Mood {
  label: string;
  tone: MoodTone;
}

/** A one-word read on how he's doing — felt, not measured. */
export function moodLabel(entry: RosterEntry): Mood {
  const { morale: m, trust: t } = entry;
  if (t < 18) return { label: 'On the brink', tone: 'crit' };
  if (m < 30) return { label: 'Bitter', tone: 'crit' };
  if (t < 32) return { label: 'Wary', tone: 'warn' };
  if (m < 45) return { label: 'Restless', tone: 'warn' };
  if (m < 58) return { label: 'Unsettled', tone: 'warn' };
  if (m < 72) return { label: 'Content', tone: 'ok' };
  return { label: 'Settled', tone: 'good' };
}
