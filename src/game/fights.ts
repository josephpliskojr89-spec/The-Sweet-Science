/*
  Fight Booking (Phase 6D/8 systems, built ahead of the phone's UI)
  --------------------------------------------------------------------------
  The other half of the fight engine: how bouts come to exist. Promoters call
  with offers for your lockered men — an opponent from the living world, a
  venue, a round count, a purse, a date. You book it or you don't; booked
  fights resolve on their day inside advanceTime, and the consequences flow
  everywhere a fight should reach: his record, your money, both reputations,
  his mood, the paper, the ledger, the corkboard.

  Everything here is a pure function over save data (rng via Math.random in
  handlers, same rule as the rest of the simulation). The engine itself
  (game/engine/fightEngine.ts) is seeded and deterministic.
*/

import type { RosterEntry } from './roster';
import type { Coach, CoachTier } from './coaches';
import { fighterFullName, type Fighter } from './fighters';
import { type WeightClassKey } from './weightClasses';
import { inflationFactor } from './economy';
import { pressItem, type PressState } from './press';
import {
  matchmake,
  promoteToFull,
  worldFighterName,
  fighterStanding,
  campOf,
  type WorldState,
  type WorldFighter,
  type WorldRecord,
} from './world/population';
import {
  simulateFight,
  seedFrom,
  type Combatant,
  type FightInput,
  type FightResult,
  type Method,
} from './engine/fightEngine';

// --- types ------------------------------------------------------------------

export type OfferRisk = 'soft' | 'fair' | 'reach';

export interface FightOffer {
  id: string;
  /** your man */
  fighterId: string;
  /** the opponent's WorldFighter id */
  opponentId: string;
  weightClass: WeightClassKey;
  rounds: 4 | 6 | 8 | 10;
  venue: string;
  /** your side's purse, in current-year dollars */
  purse: number;
  /** the day the bout happens if you take it */
  onDay: number;
  /** the offer is off the table after this day */
  expiresDay: number;
  /** the matchmaker's frame, from public information only */
  risk: OfferRisk;
  /** one typed line of the promoter's pitch */
  pitch: string;
}

/**
 * Who works the corner on fight night. 'self' — you're the chief second and
 * the fight plays live, round by round; 'staff' — your people handle it and
 * the bout resolves off-screen. Either way the cutman's hands are whoever's
 * hands you assigned.
 */
export interface CornerPlan {
  mode: 'self' | 'staff';
  /** the coach running the stool (staff mode) or beside you reading the man (self) */
  chiefSecondId: string | null;
  cutmanId: string | null;
}

export interface BookedFight {
  id: string;
  fighterId: string;
  opponentId: string;
  weightClass: WeightClassKey;
  rounds: number;
  venue: string;
  purse: number;
  onDay: number;
  corner: CornerPlan;
}

/** The default plan: the man's own trainer runs the stool; best cutman available. */
export function defaultCornerPlan(entry: RosterEntry | null, coaches: Coach[]): CornerPlan {
  const cutman = coaches.find((c) => c.specialty === 'cutman') ?? null;
  return {
    mode: 'staff',
    chiefSecondId: entry?.coachId ?? null,
    cutmanId: cutman?.id ?? null,
  };
}

const TIER_EDGE: Record<CoachTier, number> = {
  local: 0.01,
  regional: 0.02,
  established: 0.03,
  elite: 0.04,
};

/** Corner quality 0..0.1 for the engine — what a good corner buys all night. */
export function cornerQualityFor(plan: CornerPlan, coaches: Coach[]): number {
  const chief = coaches.find((c) => c.id === plan.chiefSecondId) ?? null;
  const cutman = coaches.find((c) => c.id === plan.cutmanId) ?? null;
  let q = 0.02;
  if (plan.mode === 'self') q += 0.008; // the owner showed up; the rest is his calls
  if (chief) q += TIER_EDGE[chief.tier] + (chief.specialty === 'corner_strategist' ? 0.012 : 0);
  if (cutman) q += TIER_EDGE[cutman.tier] * 0.6 + (cutman.specialty === 'cutman' ? 0.01 : 0);
  return clamp(q, 0.01, 0.1);
}

/** The hands on the cut between rounds, 0..1. No cutman = a wet sponge and hope. */
export function cutmanSkillFor(plan: CornerPlan, coaches: Coach[]): number {
  const cm = coaches.find((c) => c.id === plan.cutmanId) ?? null;
  if (!cm) return 0.15;
  const base = { local: 0.35, regional: 0.5, established: 0.65, elite: 0.8 }[cm.tier];
  return clamp(base + (cm.specialty === 'cutman' ? 0.18 : -0.1), 0.1, 0.95);
}

/** How true the stool's read is, 0..1 — the eyes next to you on fight night. */
export function stoolAcuityFor(plan: CornerPlan, coaches: Coach[]): number {
  const chief = coaches.find((c) => c.id === plan.chiefSecondId) ?? null;
  if (!chief) return 0.4; // your own eyes, and you're busy
  const base = { local: 0.5, regional: 0.62, established: 0.75, elite: 0.88 }[chief.tier];
  const spec = chief.specialty === 'trainer' || chief.specialty === 'corner_strategist' ? 0.06 : 0;
  return clamp(base + spec, 0.3, 0.95);
}

export type BoutOutcome = 'W' | 'L' | 'D';

/** One line in a fighter's bout ledger — his permanent record. */
export interface BoutRecord {
  dayCount: number;
  opponentId: string;
  opponentName: string;
  outcome: BoutOutcome;
  method: Method;
  endRound: number;
  scheduledRounds: number;
  venue: string;
  purse: number;
}

/** The full report for the fight-night screen (kept for recent bouts). */
export interface FightReport {
  id: string;
  dayCount: number;
  fighterId: string;
  fighterName: string;
  opponentName: string;
  opponentCamp: string;
  venue: string;
  outcome: BoutOutcome;
  method: Method;
  endRound: number;
  scheduledRounds: number;
  purse: number;
  narrative: string[];
  judgeTotals: Array<[number, number]> | null;
  headline: string;
}

// --- eligibility ------------------------------------------------------------

export const MIN_TENURE_FOR_OFFERS = 14; // days in the gym before promoters call

export function fightEligible(
  e: RosterEntry,
  dayCount: number,
  booked: BookedFight[],
): boolean {
  if (!e.hasLocker) return false; // provisional men aren't licensed under your banner
  if ((e.restUntil ?? 0) > dayCount) return false; // still healing
  if (dayCount - e.joinedDayCount < MIN_TENURE_FOR_OFFERS) return false;
  return !booked.some((b) => b.fighterId === e.fighter.id);
}

// --- offers -----------------------------------------------------------------

const rand = (lo: number, hi: number) => lo + Math.random() * (hi - lo);
const randInt = (lo: number, hi: number) => Math.floor(rand(lo, hi + 1));
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const pick = <T,>(xs: T[]): T => xs[Math.floor(Math.random() * xs.length)];

function makeOfferId(): string {
  return `fo_${Math.random().toString(36).slice(2, 10)}`;
}

/** A fighter's ring strength as the matchmaking scale sees it. */
export function ringRating(f: Fighter): number {
  const a = f.attributes;
  return (a.power + a.speed + a.chin + a.stamina + a.defense + a.ringIq + a.footwork) / 7;
}

/** Rounds scale with how proven the man is — nobody gives a novice ten. */
function roundsFor(e: RosterEntry): 4 | 6 | 8 | 10 {
  const fights = e.record.wins + e.record.losses + e.record.draws;
  if (fights < 3) return 4;
  if (fights < 8) return 6;
  if (fights < 15 || e.fighter.publicReputation < 40) return 8;
  return 10;
}

/**
 * The purse, in current dollars: small-club money that grows with the round
 * count, the opponent's name, and the years. 1975 four-rounders paid in the
 * low hundreds; that's the base reality of this gym.
 */
export function pursefor(
  rounds: number,
  opponentRep: number,
  risk: OfferRisk,
  year: number,
): number {
  const base = rounds === 4 ? 120 : rounds === 6 ? 260 : rounds === 8 ? 520 : 1000;
  const name = 1 + opponentRep / 70;
  const riskPay = risk === 'reach' ? 1.35 : risk === 'soft' ? 0.85 : 1;
  const raw = base * name * riskPay * inflationFactor(year) * rand(0.9, 1.15);
  return Math.max(50, Math.round(raw / 25) * 25);
}

function pitchFor(opp: WorldFighter, risk: OfferRisk): string {
  const standing = fighterStanding(opp).label.toLowerCase();
  const rec = `${opp.record.wins}-${opp.record.losses}-${opp.record.draws}`;
  const frame =
    risk === 'soft'
      ? 'A safe night’s work — he’s made for what your man does.'
      : risk === 'reach'
        ? 'A real step up. Win this and people start saying the name right.'
        : 'A fair fight on paper. The kind careers are made of.';
  return `${worldFighterName(opp)} (${rec}), ${standing} out of ${campOf(opp)}. ${frame}`;
}

export interface RollOffersArgs {
  roster: RosterEntry[];
  world: WorldState;
  booked: BookedFight[];
  existing: FightOffer[];
  venues: string[];
  dayCount: number;
  days: number;
  year: number;
  /** 0..1 gym reputation quality — better gyms get more calls. */
  quality: number;
  /** era purse weather by division (1.0 baseline) — game/era. */
  purseWeather?: Partial<Record<WeightClassKey, number>>;
}

export const MAX_OPEN_OFFERS = 4;

/**
 * The promoter grapevine. Each advance, eligible men may draw an offer —
 * roughly one call a week gym-wide at a small reputation, scaling up.
 */
export function rollFightOffers(args: RollOffersArgs): FightOffer[] {
  const { roster, world, booked, existing, venues, dayCount, days, year, quality } = args;
  const out: FightOffer[] = [];
  const openFor = new Set(existing.map((o) => o.fighterId));
  const eligible = roster.filter(
    (e) => fightEligible(e, dayCount, booked) && !openFor.has(e.fighter.id),
  );
  if (eligible.length === 0) return out;

  const gymCallsPerDay = (0.1 + quality * 0.18) * Math.min(1, eligible.length / 2);
  const chance = 1 - Math.pow(1 - clamp(gymCallsPerDay, 0, 0.5), days);
  if (existing.length >= MAX_OPEN_OFFERS || Math.random() >= chance) return out;

  // one call this advance — for the man a promoter would actually call about
  const e = eligible[randInt(0, eligible.length - 1)];
  const mine = ringRating(e.fighter);

  const riskRoll = Math.random();
  const risk: OfferRisk = riskRoll < 0.35 ? 'soft' : riskRoll < 0.8 ? 'fair' : 'reach';
  const window: [number, number] =
    risk === 'soft' ? [mine * 0.65, mine * 0.9] : risk === 'fair' ? [mine * 0.88, mine * 1.1] : [mine * 1.08, mine * 1.4];

  const candidates = matchmake(world, {
    weightClass: e.fighter.weightClass,
    minRating: window[0],
    maxRating: window[1],
    n: 8,
  }).filter((wf) => wf.id !== e.fighter.id);
  if (candidates.length === 0) return out;
  const opp = pick(candidates);

  const rounds = roundsFor(e);
  const weather = args.purseWeather?.[e.fighter.weightClass] ?? 1;
  out.push({
    id: makeOfferId(),
    fighterId: e.fighter.id,
    opponentId: opp.id,
    weightClass: e.fighter.weightClass,
    rounds,
    venue: venues.length ? pick(venues) : 'Armory',
    purse: Math.round((pursefor(rounds, opp.publicReputation, risk, year) * weather) / 25) * 25,
    onDay: dayCount + randInt(10, 24),
    expiresDay: dayCount + randInt(5, 9),
    risk,
    pitch: pitchFor(opp, risk),
  });
  return out;
}

/** Drop expired offers (and any whose men are gone or already booked). */
export function ageOffers(
  offers: FightOffer[],
  roster: RosterEntry[],
  booked: BookedFight[],
  dayCount: number,
): { keep: FightOffer[]; expired: FightOffer[] } {
  const ids = new Set(roster.map((e) => e.fighter.id));
  const bookedIds = new Set(booked.map((b) => b.fighterId));
  const keep: FightOffer[] = [];
  const expired: FightOffer[] = [];
  for (const o of offers) {
    if (dayCount > o.expiresDay || !ids.has(o.fighterId) || bookedIds.has(o.fighterId)) {
      expired.push(o);
    } else {
      keep.push(o);
    }
  }
  return { keep, expired };
}

export function bookFromOffer(offer: FightOffer, corner: CornerPlan): BookedFight {
  return {
    id: `bf_${offer.id.slice(3)}`,
    fighterId: offer.fighterId,
    opponentId: offer.opponentId,
    weightClass: offer.weightClass,
    rounds: offer.rounds,
    venue: offer.venue,
    purse: offer.purse,
    onDay: offer.onDay,
    corner,
  };
}

// --- resolving a booked fight ------------------------------------------------

/** How a man arrives at the ring: rested, believed-in, trained. */
export function conditionOf(e: RosterEntry): number {
  const morale = clamp(e.morale / 100, 0, 1);
  const focusEdge = e.focus !== null ? 0.06 : 0;
  return clamp(0.62 + morale * 0.32 + focusEdge, 0.4, 1);
}

export interface ResolveArgs {
  booked: BookedFight;
  entry: RosterEntry;
  opponent: WorldFighter;
  /** 0..0.1, from cornerQualityFor(plan, coaches) */
  cornerQuality: number;
  dayCount: number;
}

/** Everything the engine needs, promoted once so both paths meet the same man. */
export interface FightPrep {
  input: FightInput;
  oppFull: Fighter;
}

export function prepareFight(args: ResolveArgs): FightPrep {
  const { booked, entry, opponent, cornerQuality, dayCount } = args;
  const f = entry.fighter;
  const oppFull = promoteToFull(opponent);
  const mine: Combatant = {
    name: f.lastName,
    attributes: f.attributes,
    traits: [...f.visibleTraits, ...f.hiddenTraits],
    condition: conditionOf(entry),
    corner: cornerQuality,
  };
  const theirs: Combatant = {
    name: oppFull.lastName,
    attributes: oppFull.attributes,
    traits: [...oppFull.visibleTraits, ...oppFull.hiddenTraits],
    condition: 0.88,
    corner: opponent.affiliation.kind === 'rival' ? 0.04 : 0.02,
  };
  return {
    input: {
      a: mine,
      b: theirs,
      scheduledRounds: booked.rounds,
      seed: seedFrom(booked.id + ':' + dayCount),
    },
    oppFull,
  };
}

export interface ResolvedFight {
  report: FightReport;
  bout: BoutRecord;
  result: FightResult;
  /** patched roster entry (record, bouts, rest, morale/trust, reputation, earnings) */
  entry: RosterEntry;
  /** patched opponent (record, rating, reputation) */
  opponent: WorldFighter;
  /** what lands in your cashbox */
  purse: number;
  headline: string;
  logLine: string;
  memory: string;
}

/** Run the bout and produce every consequence, ready to merge into the save. */
export function resolveFight(args: ResolveArgs): ResolvedFight {
  const prep = prepareFight(args);
  return applyFightResult(args, prep.oppFull, simulateFight(prep.input));
}

/**
 * Fan a finished fight's consequences out into the save — shared by the
 * off-screen sim and a fight you cornered live. oppFull MUST be the same
 * promoted man the fight was played against (from prepareFight).
 */
export function applyFightResult(args: ResolveArgs, oppFull: Fighter, result: FightResult): ResolvedFight {
  const { booked, entry, opponent, dayCount } = args;
  const f = entry.fighter;

  const outcome: BoutOutcome = result.winner === 'a' ? 'W' : result.winner === 'b' ? 'L' : 'D';
  const won = outcome === 'W';
  const koWin = won && (result.method === 'KO' || result.method === 'TKO');
  const koLoss = outcome === 'L' && (result.method === 'KO' || result.method === 'TKO');

  // --- his record and his body ---------------------------------------------
  const record: WorldRecord = {
    wins: entry.record.wins + (outcome === 'W' ? 1 : 0),
    losses: entry.record.losses + (outcome === 'L' ? 1 : 0),
    draws: entry.record.draws + (outcome === 'D' ? 1 : 0),
    kos: entry.record.kos + (koWin ? 1 : 0),
  };
  const restDays = Math.round(7 + result.damageA * 20 + (koLoss ? 10 : 0));

  // --- names get made -------------------------------------------------------
  const oppName = worldFighterName(opponent);
  const repSwing = won
    ? 2 + opponent.publicReputation * 0.16 * (koWin ? 1.3 : 1)
    : outcome === 'L'
      ? -(1 + f.publicReputation * 0.08)
      : 1;
  const publicReputation = clamp(Math.round(f.publicReputation + repSwing), 0, 100);

  // --- and the night follows him home ---------------------------------------
  const moraleSwing = won ? 12 : outcome === 'D' ? -2 : koLoss ? -18 : -10;
  const trustSwing = won ? 4 : outcome === 'D' ? 0 : -2;

  const bout: BoutRecord = {
    dayCount,
    opponentId: opponent.id,
    opponentName: oppName,
    outcome,
    method: result.method,
    endRound: result.endRound,
    scheduledRounds: result.scheduledRounds,
    venue: booked.venue,
    purse: booked.purse,
  };

  const nextEntry: RosterEntry = {
    ...entry,
    record,
    bouts: [...entry.bouts, bout],
    restUntil: dayCount + restDays,
    careerEarnings: (entry.careerEarnings ?? 0) + booked.purse,
    morale: clamp(entry.morale + moraleSwing, 0, 100),
    trust: clamp(entry.trust + trustSwing, 0, 100),
    fighter: { ...f, publicReputation },
  };

  // --- the other corner ------------------------------------------------------
  const oppRecord: WorldRecord = {
    wins: opponent.record.wins + (outcome === 'L' ? 1 : 0),
    losses: opponent.record.losses + (outcome === 'W' ? 1 : 0),
    draws: opponent.record.draws + (outcome === 'D' ? 1 : 0),
    kos: opponent.record.kos + (koLoss ? 1 : 0),
  };
  const nextOpponent: WorldFighter = {
    ...opponent,
    record: oppRecord,
    rating: clamp(opponent.rating + (outcome === 'L' ? 0.8 : outcome === 'W' ? -1 : 0), 14, 97),
    publicReputation: clamp(
      Math.round(
        opponent.publicReputation +
          (outcome === 'L' ? 1.5 : outcome === 'W' ? -(1 + opponent.publicReputation * 0.04) : 0.5),
      ),
      0,
      100,
    ),
    // cache the promotion — if you ever meet him again, he's the same man
    full: oppFull,
  };

  // --- the words -------------------------------------------------------------
  const name = fighterFullName(f);
  const methodWord =
    result.method === 'KO'
      ? `by knockout in the ${ordinal(result.endRound)}`
      : result.method === 'TKO'
        ? `by stoppage in the ${ordinal(result.endRound)}`
        : result.method === 'DRAW'
          ? 'in a draw'
          : `on the cards (${result.method})`;
  const headline = won
    ? `${name} beat ${oppName} ${methodWord} at the ${booked.venue}.`
    : outcome === 'D'
      ? `${name} and ${oppName} fought to a draw at the ${booked.venue}.`
      : `${oppName} handed ${name} a loss ${methodWord} at the ${booked.venue}.`;
  const logLine = won
    ? `${f.lastName} won at the ${booked.venue}. The purse is in the drawer.`
    : outcome === 'D'
      ? `${f.lastName} got a draw at the ${booked.venue}. Nobody's happy with those.`
      : `${f.lastName} lost at the ${booked.venue}. Quiet gym tonight.`;
  const memory = won
    ? `${name} won his fight at the ${booked.venue} — ${record.wins}-${record.losses}-${record.draws} now. ${formatPurse(booked.purse)} to the gym.`
    : outcome === 'D'
      ? `${name} drew with ${oppName} at the ${booked.venue}.`
      : `${name} lost to ${oppName} at the ${booked.venue}. ${koLoss ? 'A hard night — he needs time.' : 'He’ll want that one back.'}`;

  const report: FightReport = {
    id: booked.id,
    dayCount,
    fighterId: f.id,
    fighterName: name,
    opponentName: oppName,
    opponentCamp: campOf(opponent),
    venue: booked.venue,
    outcome,
    method: result.method,
    endRound: result.endRound,
    scheduledRounds: result.scheduledRounds,
    purse: booked.purse,
    narrative: result.narrative,
    judgeTotals: result.judgeTotals,
    headline,
  };

  return {
    report,
    bout,
    result,
    entry: nextEntry,
    opponent: nextOpponent,
    purse: booked.purse,
    headline,
    logLine,
    memory,
  };
}

/**
 * Where a finished fight's consequences land — the same six fields whether
 * the merge target is the tick's working context or the save itself. ONE
 * applier for both paths: a consequence added here reaches the off-screen
 * sim and the live-cornered fight alike, and can never drift between them.
 */
export interface FightConsequenceTarget {
  roster: RosterEntry[];
  world: WorldState;
  money: number;
  press: PressState;
  history: Array<{ dayCount: number; text: string }>;
  recentFights: FightReport[];
}

export function applyResolvedFight<T extends FightConsequenceTarget>(
  target: T,
  resolved: ResolvedFight,
  dayCount: number,
): T {
  return {
    ...target,
    roster: target.roster.map((e) =>
      e.fighter.id === resolved.entry.fighter.id ? resolved.entry : e,
    ),
    world: {
      ...target.world,
      fighters: target.world.fighters.map((f) =>
        f.id === resolved.opponent.id ? resolved.opponent : f,
      ),
    },
    money: target.money + resolved.purse,
    press: pressItem(target.press, dayCount, resolved.headline),
    history: [...target.history, { dayCount, text: resolved.memory }].slice(-250),
    recentFights: [resolved.report, ...target.recentFights].slice(0, 10),
  };
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] ?? s[v] ?? s[0]}`;
}

function formatPurse(n: number): string {
  return `$${Math.round(n).toLocaleString('en-US')}`;
}

/** Display helper for a record line: "3-1-0 (2 KO)". */
export function recordLine(r: WorldRecord): string {
  const base = `${r.wins}-${r.losses}-${r.draws}`;
  return r.kos > 0 ? `${base} (${r.kos} KO)` : base;
}
