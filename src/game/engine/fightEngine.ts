/*
  The Fight Engine (Phase 8 core — now live and cornerable)
  --------------------------------------------------------------------------
  Simulates a professional bout round by round from the same seven attributes
  the gym trains, plus traits, condition, and the corner. The engine is a
  LIVE object now: createLiveFight → playRound → the stool (reads, corner
  work, a tactic, the towel) → playRound… simulateFight remains the one-call
  autoplay wrapper for fights nobody from the gym works.

  PURE AND DETERMINISTIC: all randomness flows through a seeded generator, so
  the same seed AND the same corner decisions replay the same fight. Callers
  seed from save state (never from the clock).

  Design notes:
  - Attributes express as ATTACK (power/speed/footwork/ringIq) and GUARD
    (defense/footwork/ringIq/speed), both eroded by fatigue. Stamina sets the
    drain rate; condition (training/rest/morale) scales the whole night.
  - Hurt accumulates from clean exchanges and knockdowns, and recovers a
    little between rounds. The referee/corner stops it when a man is done
    (TKO); a knockdown he can't beat the count on is the KO.
  - CUTS AND SWELLING: blood is public, legs are private. Cuts open on
    knockdowns and hard rounds, worsen under pressure, and bring the doctor
    over at 0.85. Swelling closes the eye slowly — it eats guard. The stool
    can work one problem a round; a good cutman's hands buy real minutes.
  - TACTICS: the chief second sends the man out with one instruction. Small
    multipliers, honest trade-offs — press buys offense and bleeds energy,
    survive buys a round and gives one away.
  - Ten-point must: 10-9 rounds, 10-8 for a knockdown or total domination.
    Three judges re-score close rounds through their own noise, so decisions
    come back UD/SD/MD honestly.
  - Traits matter the way trainers say they do: a Lionheart gets up; a
    hot-tempered man brawls; glory hunters swing for the fences late.
*/

import type { Attributes } from '../fighters';
import type { TraitKey } from '../traits';

// --- seeded rng -------------------------------------------------------------

export type Rng = () => number;

/** mulberry32 — small, fast, good enough for a prizefight. */
export function makeRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** FNV-1a of a string — seed fights from their ids. */
export function seedFrom(id: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

function gaussFrom(rng: Rng): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

// --- inputs -----------------------------------------------------------------

export interface Combatant {
  /** Display name for the narrative ("Turner", "Morgan"). */
  name: string;
  attributes: Attributes;
  /** Visible AND hidden — the ring conceals nothing. */
  traits: TraitKey[];
  /** 0..1 — how he arrives: training, rest, morale. 1 is razor sharp. */
  condition: number;
  /** 0..0.1 — corner quality (a good cutman/strategist buys a little). */
  corner: number;
}

export interface FightInput {
  a: Combatant;
  b: Combatant;
  scheduledRounds: number;
  seed: number;
}

// --- outputs ----------------------------------------------------------------

export type Side = 'a' | 'b';
export type Method = 'KO' | 'TKO' | 'UD' | 'SD' | 'MD' | 'DRAW';

export interface RoundScore {
  a: number;
  b: number;
}

export interface Knockdown {
  round: number;
  down: Side;
}

export interface FightResult {
  winner: Side | null;
  method: Method;
  /** The round it ended in (equals scheduledRounds for decisions). */
  endRound: number;
  scheduledRounds: number;
  /** The composite card, one entry per completed or partial round. */
  card: RoundScore[];
  /** Three judges' totals, e.g. [[96,94],[95,95],[97,93]] — only for decisions. */
  judgeTotals: Array<[number, number]> | null;
  knockdowns: Knockdown[];
  /** Round-by-round typed lines for the fight-night report. */
  narrative: string[];
  /** Wear each man leaves with, 0..1+ — drives rest time after. */
  damageA: number;
  damageB: number;
}

// --- trait expression -------------------------------------------------------

interface TraitMods {
  /** multiplies chance of dropping the other man */
  kdFor: number;
  /** multiplies chance of being dropped */
  kdAgainst: number;
  /** added to get-up ability when down (positive = gets up) */
  heart: number;
  /** round-to-round variance multiplier */
  chaos: number;
  /** effectiveness multiplier in the championship rounds (last third) */
  late: number;
}

const BASE_MODS: TraitMods = { kdFor: 1, kdAgainst: 1, heart: 0, chaos: 1, late: 1 };

const TRAIT_EFFECTS: Partial<Record<TraitKey, Partial<TraitMods>>> = {
  lionheart: { heart: 0.28, late: 1.06 },
  reckless_brave: { kdFor: 1.2, kdAgainst: 1.25, chaos: 1.15 },
  hot_tempered: { kdFor: 1.12, kdAgainst: 1.15, chaos: 1.2 },
  unfocused: { chaos: 1.35, late: 0.94 },
  comfort_seeker: { late: 0.9 },
  glory_hunter: { kdFor: 1.15, late: 1.05 },
  insecure: { kdAgainst: 1.08, chaos: 1.1 },
  chip_on_shoulder: { late: 1.08, heart: 0.1 },
  family_man: { heart: 0.08 },
};

function modsFor(traits: TraitKey[]): TraitMods {
  const m = { ...BASE_MODS };
  for (const t of traits) {
    const e = TRAIT_EFFECTS[t];
    if (!e) continue;
    if (e.kdFor) m.kdFor *= e.kdFor;
    if (e.kdAgainst) m.kdAgainst *= e.kdAgainst;
    if (e.heart) m.heart += e.heart;
    if (e.chaos) m.chaos *= e.chaos;
    if (e.late) m.late *= e.late;
  }
  return m;
}

// --- tactics ------------------------------------------------------------------

/** The one instruction a man carries off the stool. 'steady' is the default. */
export type Tactic = 'steady' | 'press' | 'box' | 'sit_down' | 'survive';

interface TacticMod {
  atk: number;
  grd: number;
  drain: number;
  /** multiplies own knockdown chance against him */
  kd: number;
  /** multiplies the chance of cutting the other man */
  cutThem: number;
  /** multiplies the chance of being dropped (openness) */
  exposure: number;
}

const TACTIC_MODS: Record<Tactic, TacticMod> = {
  steady: { atk: 1, grd: 1, drain: 1, kd: 1, cutThem: 1, exposure: 1 },
  press: { atk: 1.16, grd: 0.94, drain: 1.18, kd: 1.08, cutThem: 1.35, exposure: 1.1 },
  box: { atk: 1.0, grd: 1.1, drain: 0.9, kd: 0.92, cutThem: 0.9, exposure: 0.9 },
  sit_down: { atk: 1.06, grd: 0.88, drain: 1.05, kd: 1.3, cutThem: 1.1, exposure: 1.14 },
  survive: { atk: 0.66, grd: 1.24, drain: 0.72, kd: 0.55, cutThem: 0.6, exposure: 0.78 },
};

export const TACTIC_META: Array<{ key: Tactic; name: string; blurb: string }> = [
  { key: 'steady', name: 'Stick to the plan', blurb: 'Nothing fancy. Fight your fight.' },
  { key: 'press', name: 'Press him', blurb: 'Walk him down. Costs gas, opens cuts — his and yours.' },
  { key: 'box', name: 'Box smart', blurb: 'Jab, move, don’t trade. Wins rounds quietly.' },
  { key: 'sit_down', name: 'Sit down on your punches', blurb: 'Look for the one shot. You give some back.' },
  { key: 'survive', name: 'Survive the round', blurb: 'Grab, hold, breathe. Gives the round away.' },
];

// --- narrative --------------------------------------------------------------

const EDGE_LINES = [
  '{W} took it clean — jab working, {L} a step behind all round.',
  '{W} walked {L} to the ropes and kept him there.',
  'Good round for {W}; {L} spent it covering up.',
  '{W} landed the sharper punches in an ugly round.',
  '{W} boxed, {L} followed — the judges like the man moving forward less than the man landing.',
];
const CLOSE_LINES = [
  'Nothing between them — a round the judges could give either way.',
  'They traded even through the middle minute; somebody had to get it.',
  'Close round, more clinch than clean work.',
  '{W} maybe nicked it with the cleaner counters at the bell.',
];
const HURT_LINES = [
  '{L} got caught flush and his legs weren’t honest the rest of the round.',
  'A right hand buzzed {L} late — he heard the bell gladly.',
];
const KD_LINES = [
  '{W} put {L} DOWN — a flash knockdown, up at four.',
  '{W} dropped {L} with the right. He beat the count, barely.',
];
const KO_LINES = [
  '{L} went down hard and the count was a formality. KO.',
  'One punch ended it — {L} counted out in round {R}.',
];
const TKO_LINES = [
  'The referee had seen enough — {L} taking too many, it’s stopped. TKO.',
  '{L}’s corner threw the towel in round {R}. Right call.',
];
const CUT_LINES = [
  'A cut opened over {L}’s eye — the blood came fast.',
  '{W}’s punches split the skin over {L}’s brow.',
];
const CUT_WORSE_LINES = [
  'The cut over {L}’s eye is weeping again.',
  '{W} went to the cut like a man reading a map.',
];
const DOCTOR_LINES = [
  'The doctor climbed the steps, took one long look at {L}’s eye, and waved it over. TKO.',
  'Between rounds the doctor spread the cut with his thumbs and shook his head. They stopped it. TKO.',
];

function line(rng: Rng, pool: string[], w: string, l: string, r: number): string {
  const t = pool[Math.floor(rng() * pool.length)];
  return t.replace(/\{W\}/g, w).replace(/\{L\}/g, l).replace(/\{R\}/g, String(r));
}

// --- live state ----------------------------------------------------------------

interface Fury {
  energy: number;
  hurt: number;
  kdsTaken: number;
  mods: TraitMods;
  /** 0..1 — worst cut. Blood is public. The doctor takes it at 0.85. */
  cut: number;
  /** 0..1 — the closing eye. Eats guard slowly. */
  swell: number;
  /** the instruction he carried off the stool */
  tactic: Tactic;
  /** one-shot flag so the paper only warns about the cut once */
  cutWarned: boolean;
}

export interface LiveFight {
  a: Combatant;
  b: Combatant;
  scheduledRounds: number;
  seed: number;
  /** rounds completed */
  round: number;
  card: RoundScore[];
  knockdowns: Knockdown[];
  narrative: string[];
  /** set once the fight is over — by punch, doctor, towel, or the cards */
  result: FightResult | null;
  /** internal — do not read for UI truth; use the stool reads */
  st: { a: Fury; b: Fury };
  rng: Rng;
  roundEdges: number[];
}

function freshFury(c: Combatant): Fury {
  return {
    energy: 1,
    hurt: 0,
    kdsTaken: 0,
    mods: modsFor(c.traits),
    cut: 0,
    swell: 0,
    tactic: 'steady',
    cutWarned: false,
  };
}

export function createLiveFight(input: FightInput): LiveFight {
  return {
    a: input.a,
    b: input.b,
    scheduledRounds: input.scheduledRounds,
    seed: input.seed,
    round: 0,
    card: [],
    knockdowns: [],
    narrative: [],
    result: null,
    st: { a: freshFury(input.a), b: freshFury(input.b) },
    rng: makeRng(input.seed),
  roundEdges: [],
  };
}

/** Set the instruction a side carries into the NEXT round. */
export function setTactic(lf: LiveFight, side: Side, tactic: Tactic): void {
  lf.st[side].tactic = tactic;
}

// --- the stool -------------------------------------------------------------------

export type CornerCare = 'cut' | 'swelling' | 'breathe';

/**
 * One job between rounds — the cut, the eye, or the man's lungs.
 * skill 0..1: the hands doing the work (your cutman's, or whoever's there).
 * Returns a line for the log, or null if there was nothing to do.
 */
export function cornerWork(lf: LiveFight, side: Side, care: CornerCare, skill: number): string | null {
  const f = lf.st[side];
  const name = (side === 'a' ? lf.a : lf.b).name;
  const s = clamp(skill, 0, 1);
  if (care === 'cut') {
    if (f.cut <= 0) return null;
    f.cut = Math.max(0, f.cut - (0.1 + s * 0.28));
    return s > 0.55
      ? `The cutman worked ${name}'s cut like a jeweler. It held.`
      : `They did what they could with ${name}'s cut.`;
  }
  if (care === 'swelling') {
    if (f.swell <= 0.1) return null;
    f.swell = Math.max(0, f.swell - (0.12 + s * 0.3));
    return `The iron went on ${name}'s eye.`;
  }
  f.hurt = Math.max(0, f.hurt - (0.03 + s * 0.08));
  f.energy = clamp(f.energy + 0.015 + s * 0.045, 0.05, 1);
  return `${name} got his minute — water, air, and somebody talking sense.`;
}

/** Public damage: everyone in the building can see blood and a closing eye. */
export function visibleDamage(lf: LiveFight, side: Side): { cut: number; swell: number } {
  return { cut: lf.st[side].cut, swell: lf.st[side].swell };
}

/**
 * What your man's corner tells you between rounds. No numbers — a read, in a
 * trainer's voice, as honest as the eyes doing the reading. acuity 0..1:
 * a great trainer sees true; a poor one guesses.
 */
export function stoolRead(lf: LiveFight, side: Side, acuity: number): string[] {
  const f = lf.st[side];
  const other = lf.st[side === 'a' ? 'b' : 'a'];
  const otherName = (side === 'a' ? lf.b : lf.a).name;
  // a separate stream: reading the man doesn't change the fight
  const rng = makeRng(seedFrom(`${lf.seed}:read:${side}:${lf.round}`));
  const fog = (v: number) => clamp(v + gaussFrom(rng) * (1 - clamp(acuity, 0, 1)) * 0.24, 0, 1);

  const lines: string[] = [];

  const hurt = fog(f.hurt);
  if (hurt > 0.55) lines.push('His legs aren’t honest. Keep him off the ropes or it’s over.');
  else if (hurt > 0.28) lines.push('He’s buzzed but he’s hearing me. He’s in it.');
  else lines.push('He’s clear-eyed. Good.');

  const gas = fog(f.energy);
  if (gas < 0.32) lines.push('The tank is empty — he’s on heart from here.');
  else if (gas < 0.58) lines.push('He’s breathing hard. Whatever you want done, do it soon.');
  else lines.push('His wind is fine.');

  if (f.cut > 0.55) lines.push('That cut is bad. One more round of it and the doctor takes this away from us.');
  else if (f.cut > 0.2) lines.push('The cut will hold if we keep his head off the jab.');
  else if (f.swell > 0.5) lines.push('The eye is closing. He’s seeing half the right hands.');

  const otherGas = fog(other.energy);
  const otherHurt = fog(other.hurt);
  if (otherHurt > 0.45) lines.push(`${otherName} is hurt worse than he’s showing. He’s there to be taken.`);
  else if (otherGas < 0.4) lines.push(`${otherName} is slowing. The late rounds belong to us if we’re still in them.`);

  // the corner keeps its own card
  const myPts = lf.card.reduce((s, r) => s + r[side], 0);
  const hisPts = lf.card.reduce((s, r) => s + r[side === 'a' ? 'b' : 'a'], 0);
  const edge = myPts - hisPts;
  const sure = clamp(acuity, 0, 1) > 0.4 || rng() < 0.7;
  if (edge < 0 && sure) lines.push('We’re behind on my card. We need these rounds.');
  else if (edge > 0 && sure && lf.round >= Math.ceil(lf.scheduledRounds / 2))
    lines.push('We’re up on my card. Don’t give them a reason.');

  return lines;
}

/** The towel. Ends it now, as a TKO loss for that side. */
export function throwTowel(lf: LiveFight, side: Side): void {
  if (lf.result) return;
  const round = Math.max(1, lf.round);
  const winner: Side = side === 'a' ? 'b' : 'a';
  const loserName = (side === 'a' ? lf.a : lf.b).name;
  lf.narrative.push(`${loserName}’s corner threw the towel after round ${round}. He argued, which is how they knew it was right.`);
  lf.result = settle(lf, winner, 'TKO', round, null);
}

// --- playing a round ------------------------------------------------------------

function settle(
  lf: LiveFight,
  winner: Side | null,
  method: Method,
  endRound: number,
  judgeTotals: Array<[number, number]> | null,
): FightResult {
  const { a: stA, b: stB } = lf.st;
  return {
    winner,
    method,
    endRound,
    scheduledRounds: lf.scheduledRounds,
    card: lf.card,
    judgeTotals,
    knockdowns: lf.knockdowns,
    narrative: lf.narrative,
    damageA: clamp(
      stA.hurt + stA.kdsTaken * 0.2 + stA.cut * 0.25 + (winner === 'b' && method !== 'DRAW' ? 0.15 : 0),
      0,
      1.6,
    ),
    damageB: clamp(
      stB.hurt + stB.kdsTaken * 0.2 + stB.cut * 0.25 + (winner === 'a' && method !== 'DRAW' ? 0.15 : 0),
      0,
      1.6,
    ),
  };
}

function goToTheCards(lf: LiveFight): FightResult {
  const rng = lf.rng;
  const judgeTotals: Array<[number, number]> = [0, 1, 2].map(() => {
    let ta = 0;
    let tb = 0;
    lf.card.forEach((r, i) => {
      const edge = lf.roundEdges[i] ?? 0;
      // judges see close rounds differently; clear rounds hold
      if (r.a !== r.b && Math.abs(edge) < 6 && rng() < 0.3) {
        ta += r.b;
        tb += r.a;
      } else {
        ta += r.a;
        tb += r.b;
      }
    });
    return [ta, tb] as [number, number];
  });
  const votes = judgeTotals.map(([ta, tb]) => (ta > tb ? 'a' : tb > ta ? 'b' : 'e'));
  const aWins = votes.filter((v) => v === 'a').length;
  const bWins = votes.filter((v) => v === 'b').length;
  const evens = votes.filter((v) => v === 'e').length;
  let winner: Side | null;
  let method: Method;
  if (aWins === 3 || bWins === 3) {
    winner = aWins === 3 ? 'a' : 'b';
    method = 'UD';
  } else if (aWins === 2 || bWins === 2) {
    winner = aWins > bWins ? 'a' : 'b';
    method = evens > 0 ? 'MD' : 'SD';
  } else {
    winner = null;
    method = 'DRAW';
  }
  const verdict =
    method === 'DRAW'
      ? 'The judges couldn’t split them. A draw.'
      : `${(winner === 'a' ? lf.a : lf.b).name} takes it on the cards — ${
          method === 'UD' ? 'all three judges' : method === 'MD' ? 'two judges, one even' : 'split verdict'
        }.`;
  lf.narrative.push(verdict);
  return settle(lf, winner, method, lf.scheduledRounds, judgeTotals);
}

/**
 * Play the next round. Returns the narrative lines it produced; when the
 * fight ends (any way), lf.result is set.
 */
export function playRound(lf: LiveFight): string[] {
  if (lf.result) return [];
  const rng = lf.rng;
  const { a, b, scheduledRounds } = lf;
  const st = lf.st;
  const round = lf.round + 1;
  const linesBefore = lf.narrative.length;

  const tacA = TACTIC_MODS[st.a.tactic];
  const tacB = TACTIC_MODS[st.b.tactic];

  // between rounds: breathe, take the stool's advice
  if (round > 1) {
    st.a.hurt = Math.max(0, st.a.hurt - (0.07 + a.corner * 0.5));
    st.b.hurt = Math.max(0, st.b.hurt - (0.07 + b.corner * 0.5));
    st.a.cut = Math.max(0, st.a.cut - (0.02 + a.corner * 0.2));
    st.b.cut = Math.max(0, st.b.cut - (0.02 + b.corner * 0.2));
  }

  const drainPerRound = (c: Combatant) =>
    clamp(0.105 - (c.attributes.stamina / 100) * 0.08, 0.02, 0.105);

  const effMul = (f: Fury, c: Combatant) => {
    const fatigue = 0.4 + 0.6 * f.energy;
    const cond = 0.82 + 0.18 * clamp(c.condition, 0, 1);
    const lateBoost = round > Math.ceil((scheduledRounds * 2) / 3) ? f.mods.late : 1;
    return fatigue * cond * lateBoost * (1 - clamp(f.hurt, 0, 0.9) * 0.35);
  };

  const attack = (c: Combatant, f: Fury, tac: TacticMod) => {
    const at = c.attributes;
    return (
      (at.power * 0.32 + at.speed * 0.3 + at.footwork * 0.18 + at.ringIq * 0.2) *
      effMul(f, c) *
      tac.atk
    );
  };
  const guard = (c: Combatant, f: Fury, tac: TacticMod) => {
    const at = c.attributes;
    return (
      (at.defense * 0.4 + at.footwork * 0.22 + at.ringIq * 0.24 + at.speed * 0.14) *
      effMul(f, c) *
      (1 + c.corner) *
      tac.grd *
      (1 - clamp(f.swell, 0, 1) * 0.1)
    );
  };

  const atkA = attack(a, st.a, tacA);
  const atkB = attack(b, st.b, tacB);
  const grdA = guard(a, st.a, tacA);
  const grdB = guard(b, st.b, tacB);

  const chaos = (st.a.mods.chaos + st.b.mods.chaos) / 2;
  const marginRaw = atkA - grdB - (atkB - grdA);
  const margin = marginRaw + gaussFrom(rng) * 7.5 * chaos;
  lf.roundEdges.push(margin);

  // clean-work damage accrues to the man losing the exchanges — worse
  // when his legs are gone
  const dmgBase = Math.abs(margin) * 0.006 + 0.015;
  if (margin >= 0) st.b.hurt += dmgBase * (1.7 - st.b.energy * 0.7);
  else st.a.hurt += dmgBase * (1.7 - st.a.energy * 0.7);

  // the eye takes the round's traffic
  if (margin >= 0) st.b.swell = clamp(st.b.swell + 0.012 + Math.abs(margin) * 0.0018, 0, 1);
  else st.a.swell = clamp(st.a.swell + 0.012 + Math.abs(margin) * 0.0018, 0, 1);

  let ptsA = margin >= 0 ? 10 : 9;
  let ptsB = margin >= 0 ? 9 : 10;
  let kdThisRound: Side | null = null;

  // knockdowns — power against chin, through the round's flow
  const tryKd = (side: Side): boolean => {
    const me = side === 'a' ? a : b;
    const him = side === 'a' ? b : a;
    const meF = side === 'a' ? st.a : st.b;
    const himF = side === 'a' ? st.b : st.a;
    const meTac = side === 'a' ? tacA : tacB;
    const himTac = side === 'a' ? tacB : tacA;
    const pressure = clamp((side === 'a' ? atkA - grdB : atkB - grdA) / 40, -0.5, 1);
    const p =
      (0.02 + Math.max(0, pressure) * 0.05) *
      (me.attributes.power / 55) *
      Math.pow(55 / Math.max(22, him.attributes.chin), 1.35) *
      meF.mods.kdFor *
      himF.mods.kdAgainst *
      meTac.kd *
      himTac.exposure *
      (1 + himF.hurt * 0.9);
    return rng() < clamp(p, 0, 0.42);
  };

  for (const side of ['a', 'b'] as Side[]) {
    if (kdThisRound) break;
    if (!tryKd(side)) continue;
    const downSide: Side = side === 'a' ? 'b' : 'a';
    const downC = downSide === 'a' ? a : b;
    const downF = downSide === 'a' ? st.a : st.b;
    const upC = side === 'a' ? a : b;
    kdThisRound = downSide;
    downF.kdsTaken += 1;
    downF.hurt += 0.34;
    lf.knockdowns.push({ round, down: downSide });

    // can he beat the count?
    const getUp =
      0.82 -
      downF.hurt * 0.45 -
      (1 - downF.energy) * 0.3 +
      (downC.attributes.chin - 50) / 220 +
      downF.mods.heart;
    if (rng() > clamp(getUp, 0.05, 0.97)) {
      lf.narrative.push(line(rng, KO_LINES, upC.name, downC.name, round));
      // score the partial round
      lf.card.push(downSide === 'b' ? { a: 10, b: 8 } : { a: 8, b: 10 });
      lf.round = round;
      lf.result = settle(lf, side, 'KO', round, null);
      return lf.narrative.slice(linesBefore);
    }
    lf.narrative.push(line(rng, KD_LINES, upC.name, downC.name, round));
    if (downSide === 'a') {
      ptsA = 8;
      ptsB = 10;
    } else {
      ptsA = 10;
      ptsB = 8;
    }
  }

  // domination without a knockdown can still be 10-8
  if (!kdThisRound && Math.abs(margin) > 26) {
    if (margin > 0) ptsB = 8;
    else ptsA = 8;
  }

  lf.card.push({ a: ptsA, b: ptsB });

  // cuts open on hard traffic and knockdowns; pressure fighters find them
  const tryCut = (downSide: Side) => {
    const f = downSide === 'a' ? st.a : st.b;
    const himTac = downSide === 'a' ? tacB : tacA;
    const loserName = (downSide === 'a' ? a : b).name;
    const winnerName = (downSide === 'a' ? b : a).name;
    const lostRound = downSide === 'a' ? margin < 0 : margin >= 0;
    const p =
      (0.022 + (lostRound ? Math.abs(margin) * 0.0022 : 0) + (kdThisRound === downSide ? 0.1 : 0)) *
      himTac.cutThem *
      (1 + f.hurt * 0.5);
    if (rng() < clamp(p, 0, 0.4)) {
      const wasCut = f.cut > 0.05;
      f.cut = clamp(f.cut + 0.14 + rng() * 0.18, 0, 1);
      lf.narrative.push(line(rng, wasCut ? CUT_WORSE_LINES : CUT_LINES, winnerName, loserName, round));
    }
  };
  tryCut('a');
  tryCut('b');

  // the doctor's look
  for (const side of ['a', 'b'] as Side[]) {
    const f = st[side];
    const loser = side === 'a' ? a : b;
    const other: Side = side === 'a' ? 'b' : 'a';
    if (f.cut >= 0.85) {
      lf.narrative.push(line(rng, DOCTOR_LINES, (other === 'a' ? a : b).name, loser.name, round));
      lf.round = round;
      lf.result = settle(lf, other, 'TKO', round, null);
      // prefix the round's lines
      prefixRound(lf, linesBefore, round);
      return lf.narrative.slice(linesBefore);
    }
    if (f.cut >= 0.55 && !f.cutWarned) {
      f.cutWarned = true;
      lf.narrative.push(`The referee walked ${loser.name} to the doctor between rounds. He let it go on — for now.`);
    }
  }

  // the stoppage: a man who's out of gas and shipping punishment gets pulled
  const done = (f: Fury) => f.hurt >= 1 || (f.hurt >= 0.72 && f.energy < 0.3) || f.kdsTaken >= 3;
  if (done(st.a) || done(st.b)) {
    const loser: Side = done(st.a) ? 'a' : 'b';
    const winner: Side = loser === 'a' ? 'b' : 'a';
    lf.narrative.push(
      line(rng, TKO_LINES, (winner === 'a' ? a : b).name, (loser === 'a' ? a : b).name, round),
    );
    lf.round = round;
    lf.result = settle(lf, winner, 'TKO', round, null);
    prefixRound(lf, linesBefore, round);
    return lf.narrative.slice(linesBefore);
  }

  // narrative for a round that went the distance
  if (!kdThisRound) {
    const w = margin >= 0 ? a.name : b.name;
    const l = margin >= 0 ? b.name : a.name;
    if (Math.abs(margin) < 5) lf.narrative.push(line(rng, CLOSE_LINES, w, l, round));
    else if ((margin >= 0 ? st.b.hurt : st.a.hurt) > 0.5 && rng() < 0.5)
      lf.narrative.push(line(rng, HURT_LINES, w, l, round));
    else lf.narrative.push(line(rng, EDGE_LINES, w, l, round));
  }
  prefixRound(lf, linesBefore, round);

  // the round takes its toll
  st.a.energy = clamp(st.a.energy - drainPerRound(a) * tacA.drain - st.a.hurt * 0.02, 0.05, 1);
  st.b.energy = clamp(st.b.energy - drainPerRound(b) * tacB.drain - st.b.hurt * 0.02, 0.05, 1);

  lf.round = round;
  if (round >= scheduledRounds) {
    lf.result = goToTheCards(lf);
  }
  return lf.narrative.slice(linesBefore);
}

/** Prefix the first line this round produced with "R{n}: " (report style). */
function prefixRound(lf: LiveFight, from: number, round: number): void {
  if (lf.narrative.length > from && !lf.narrative[from].startsWith('R')) {
    lf.narrative[from] = `R${round}: ` + lf.narrative[from];
  }
}

// --- autoplay ---------------------------------------------------------------------

/** The corner nobody watches: fix the worst problem, keep the instruction. */
export function autoCorner(lf: LiveFight, side: Side): void {
  autoStool(lf, side);
}

function autoStool(lf: LiveFight, side: Side): void {
  const c = side === 'a' ? lf.a : lf.b;
  const f = lf.st[side];
  const skill = clamp(c.corner * 8, 0, 0.8);
  const care: CornerCare = f.cut >= 0.3 ? 'cut' : f.swell >= 0.5 ? 'swelling' : 'breathe';
  cornerWork(lf, side, care, skill);
}

/** One call, whole fight — both corners on autopilot. */
export function simulateFight(input: FightInput): FightResult {
  const lf = createLiveFight(input);
  while (!lf.result) {
    playRound(lf);
    if (!lf.result) {
      autoStool(lf, 'a');
      autoStool(lf, 'b');
    }
  }
  return lf.result;
}
