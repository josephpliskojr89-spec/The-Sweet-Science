/*
  The Fight Engine (Phase 8 core, built ahead of its UI)
  --------------------------------------------------------------------------
  Simulates a professional bout round by round from the same seven attributes
  the gym trains, plus traits, condition, and the corner. Everything a fight
  produces — scorecards, knockdowns, the finish, a typed round-by-round
  narrative for the eventual fight-night screen — comes out of one call.

  PURE AND DETERMINISTIC: all randomness flows through a seeded generator, so
  the same seed replays the same fight. Callers seed from save state (never
  from the clock), which keeps results reproducible and testable.

  Design notes:
  - Attributes express as ATTACK (power/speed/footwork/ringIq) and GUARD
    (defense/footwork/ringIq/speed), both eroded by fatigue. Stamina sets the
    drain rate; condition (training/rest/morale) scales the whole night.
  - Hurt accumulates from clean exchanges and knockdowns, and recovers a
    little between rounds. The referee/corner stops it when a man is done
    (TKO); a knockdown he can't beat the count on is the KO.
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

function line(rng: Rng, pool: string[], w: string, l: string, r: number): string {
  const t = pool[Math.floor(rng() * pool.length)];
  return t.replace(/\{W\}/g, w).replace(/\{L\}/g, l).replace(/\{R\}/g, String(r));
}

// --- the engine -------------------------------------------------------------

interface Fury {
  energy: number;
  hurt: number;
  kdsTaken: number;
  mods: TraitMods;
}

export function simulateFight(input: FightInput): FightResult {
  const rng = makeRng(input.seed);
  const { a, b, scheduledRounds } = input;

  const st = {
    a: { energy: 1, hurt: 0, kdsTaken: 0, mods: modsFor(a.traits) } as Fury,
    b: { energy: 1, hurt: 0, kdsTaken: 0, mods: modsFor(b.traits) } as Fury,
  };

  const card: RoundScore[] = [];
  const roundEdges: number[] = []; // signed round margin, for the judges
  const knockdowns: Knockdown[] = [];
  const narrative: string[] = [];

  const drainPerRound = (c: Combatant) =>
    clamp(0.105 - (c.attributes.stamina / 100) * 0.08, 0.02, 0.105);

  const effMul = (f: Fury, c: Combatant, round: number) => {
    const fatigue = 0.4 + 0.6 * f.energy;
    const cond = 0.82 + 0.18 * clamp(c.condition, 0, 1);
    const lateBoost =
      round > Math.ceil((scheduledRounds * 2) / 3) ? f.mods.late : 1;
    return fatigue * cond * lateBoost * (1 - clamp(f.hurt, 0, 0.9) * 0.35);
  };

  const attack = (c: Combatant, f: Fury, round: number) => {
    const at = c.attributes;
    return (
      (at.power * 0.32 + at.speed * 0.3 + at.footwork * 0.18 + at.ringIq * 0.2) *
      effMul(f, c, round)
    );
  };
  const guard = (c: Combatant, f: Fury, round: number) => {
    const at = c.attributes;
    return (
      (at.defense * 0.4 + at.footwork * 0.22 + at.ringIq * 0.24 + at.speed * 0.14) *
      effMul(f, c, round) *
      (1 + c.corner)
    );
  };

  let winner: Side | null = null;
  let method: Method = 'DRAW';
  let endRound = scheduledRounds;

  outer: for (let round = 1; round <= scheduledRounds; round++) {
    // between rounds: breathe, take the stool's advice
    if (round > 1) {
      st.a.hurt = Math.max(0, st.a.hurt - (0.07 + a.corner * 0.5));
      st.b.hurt = Math.max(0, st.b.hurt - (0.07 + b.corner * 0.5));
    }

    const atkA = attack(a, st.a, round);
    const atkB = attack(b, st.b, round);
    const grdA = guard(a, st.a, round);
    const grdB = guard(b, st.b, round);

    const chaos = (st.a.mods.chaos + st.b.mods.chaos) / 2;
    const marginRaw = atkA - grdB - (atkB - grdA);
    const margin = marginRaw + gaussFrom(rng) * 7.5 * chaos;
    roundEdges.push(margin);

    // clean-work damage accrues to the man losing the exchanges — worse
    // when his legs are gone
    const dmgBase = Math.abs(margin) * 0.006 + 0.015;
    if (margin >= 0) st.b.hurt += dmgBase * (1.7 - st.b.energy * 0.7);
    else st.a.hurt += dmgBase * (1.7 - st.a.energy * 0.7);

    let ptsA = margin >= 0 ? 10 : 9;
    let ptsB = margin >= 0 ? 9 : 10;
    let kdThisRound: Side | null = null;

    // knockdowns — power against chin, through the round's flow
    const tryKd = (side: Side): boolean => {
      const me = side === 'a' ? a : b;
      const him = side === 'a' ? b : a;
      const meF = side === 'a' ? st.a : st.b;
      const himF = side === 'a' ? st.b : st.a;
      const pressure = clamp(
        (side === 'a' ? atkA - grdB : atkB - grdA) / 40,
        -0.5,
        1,
      );
      const p =
        (0.02 + Math.max(0, pressure) * 0.05) *
        (me.attributes.power / 55) *
        Math.pow(55 / Math.max(22, him.attributes.chin), 1.35) *
        meF.mods.kdFor *
        himF.mods.kdAgainst *
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
      knockdowns.push({ round, down: downSide });

      // can he beat the count?
      const getUp =
        0.82 -
        downF.hurt * 0.45 -
        (1 - downF.energy) * 0.3 +
        (downC.attributes.chin - 50) / 220 +
        downF.mods.heart;
      if (rng() > clamp(getUp, 0.05, 0.97)) {
        winner = side;
        method = 'KO';
        endRound = round;
        narrative.push(line(rng, KO_LINES, upC.name, downC.name, round));
        // score the partial round
        card.push(downSide === 'b' ? { a: 10, b: 8 } : { a: 8, b: 10 });
        break outer;
      }
      narrative.push(line(rng, KD_LINES, upC.name, downC.name, round));
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

    card.push({ a: ptsA, b: ptsB });

    // the stoppage: a man who's out of gas and shipping punishment gets pulled
    const done = (f: Fury) => f.hurt >= 1 || (f.hurt >= 0.72 && f.energy < 0.3) || f.kdsTaken >= 3;
    if (done(st.a) || done(st.b)) {
      const loser: Side = done(st.a) ? 'a' : 'b';
      winner = loser === 'a' ? 'b' : 'a';
      method = 'TKO';
      endRound = round;
      narrative.push(
        line(rng, TKO_LINES, (winner === 'a' ? a : b).name, (loser === 'a' ? a : b).name, round),
      );
      break;
    }

    // narrative for a round that went the distance
    if (!kdThisRound) {
      const w = margin >= 0 ? a.name : b.name;
      const l = margin >= 0 ? b.name : a.name;
      if (Math.abs(margin) < 5) narrative.push(`R${round}: ` + line(rng, CLOSE_LINES, w, l, round));
      else if ((margin >= 0 ? st.b.hurt : st.a.hurt) > 0.5 && rng() < 0.5)
        narrative.push(`R${round}: ` + line(rng, HURT_LINES, w, l, round));
      else narrative.push(`R${round}: ` + line(rng, EDGE_LINES, w, l, round));
    } else {
      narrative[narrative.length - 1] = `R${round}: ` + narrative[narrative.length - 1];
    }

    // the round takes its toll
    st.a.energy = clamp(st.a.energy - drainPerRound(a) - st.a.hurt * 0.02, 0.05, 1);
    st.b.energy = clamp(st.b.energy - drainPerRound(b) - st.b.hurt * 0.02, 0.05, 1);
  }

  // --- the cards, if it went to them ---------------------------------------
  let judgeTotals: Array<[number, number]> | null = null;
  if (winner === null) {
    judgeTotals = [0, 1, 2].map(() => {
      let ta = 0;
      let tb = 0;
      card.forEach((r, i) => {
        const edge = roundEdges[i] ?? 0;
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
        : `${(winner === 'a' ? a : b).name} takes it on the cards — ${
            method === 'UD' ? 'all three judges' : method === 'MD' ? 'two judges, one even' : 'split verdict'
          }.`;
    narrative.push(verdict);
  }

  return {
    winner,
    method,
    endRound,
    scheduledRounds,
    card,
    judgeTotals,
    knockdowns,
    narrative,
    damageA: clamp(st.a.hurt + st.a.kdsTaken * 0.2 + (winner === 'b' && method !== 'DRAW' ? 0.15 : 0), 0, 1.6),
    damageB: clamp(st.b.hurt + st.b.kdsTaken * 0.2 + (winner === 'a' && method !== 'DRAW' ? 0.15 : 0), 0, 1.6),
  };
}
