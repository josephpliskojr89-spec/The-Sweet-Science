/*
  Fight engine sanity — determinism, balance, and boxing plausibility.
  These are statistical tests over many seeded simulations; thresholds are
  deliberately loose so they catch broken dynamics, not tuning drift.
*/

import { describe, it, expect } from 'vitest';
import { simulateFight, makeRng, seedFrom, type Combatant } from './fightEngine';
import type { Attributes } from '../fighters';

const attrs = (v: number, over: Partial<Attributes> = {}): Attributes => ({
  power: v,
  speed: v,
  chin: v,
  stamina: v,
  defense: v,
  ringIq: v,
  footwork: v,
  ...over,
});

const man = (name: string, a: Attributes, condition = 0.9): Combatant => ({
  name,
  attributes: a,
  traits: [],
  condition,
  corner: 0.03,
});

function runMany(a: Combatant, b: Combatant, rounds: number, n: number) {
  const out = { a: 0, b: 0, draw: 0, ko: 0, dec: 0, endRounds: [] as number[] };
  for (let i = 0; i < n; i++) {
    const r = simulateFight({ a, b, scheduledRounds: rounds, seed: i * 7919 + 13 });
    if (r.winner === 'a') out.a++;
    else if (r.winner === 'b') out.b++;
    else out.draw++;
    if (r.method === 'KO' || r.method === 'TKO') out.ko++;
    else out.dec++;
    out.endRounds.push(r.endRound);
  }
  return out;
}

describe('rng', () => {
  it('is deterministic per seed', () => {
    const r1 = makeRng(42);
    const r2 = makeRng(42);
    for (let i = 0; i < 50; i++) expect(r1()).toBe(r2());
  });
  it('seeds stably from ids', () => {
    expect(seedFrom('bf_abc:100')).toBe(seedFrom('bf_abc:100'));
    expect(seedFrom('bf_abc:100')).not.toBe(seedFrom('bf_abc:101'));
  });
});

describe('simulateFight', () => {
  it('replays identically from the same seed', () => {
    const a = man('Turner', attrs(55));
    const b = man('Morgan', attrs(50));
    const r1 = simulateFight({ a, b, scheduledRounds: 8, seed: 12345 });
    const r2 = simulateFight({ a, b, scheduledRounds: 8, seed: 12345 });
    expect(r1).toEqual(r2);
  });

  it('scores every completed round on the card', () => {
    const a = man('Turner', attrs(55));
    const b = man('Morgan', attrs(52));
    for (let seed = 0; seed < 40; seed++) {
      const r = simulateFight({ a, b, scheduledRounds: 6, seed });
      expect(r.card.length).toBe(r.endRound);
      for (const round of r.card) {
        expect(round.a).toBeGreaterThanOrEqual(8);
        expect(round.a).toBeLessThanOrEqual(10);
        expect(round.b).toBeGreaterThanOrEqual(8);
        expect(round.b).toBeLessThanOrEqual(10);
        expect(Math.max(round.a, round.b)).toBe(10);
      }
      if (r.method === 'KO' || r.method === 'TKO') {
        expect(r.winner).not.toBeNull();
        expect(r.endRound).toBeLessThanOrEqual(6);
        expect(r.judgeTotals).toBeNull();
      } else {
        expect(r.endRound).toBe(6);
        expect(r.judgeTotals).toHaveLength(3);
      }
      expect(r.narrative.length).toBeGreaterThan(0);
    }
  });

  it('lets the clearly better man win most nights', () => {
    const strong = man('Strong', attrs(62));
    const weak = man('Weak', attrs(38));
    const out = runMany(strong, weak, 8, 300);
    expect(out.a / 300).toBeGreaterThan(0.8);
  });

  it('keeps even fights genuinely competitive', () => {
    const a = man('A', attrs(50));
    const b = man('B', attrs(50));
    const out = runMany(a, b, 8, 400);
    expect(out.a / 400).toBeGreaterThan(0.3);
    expect(out.b / 400).toBeGreaterThan(0.3);
  });

  it('makes punchers dangerous against a bad chin', () => {
    const puncher = man('Puncher', attrs(50, { power: 80 }));
    const glass = man('Glass', attrs(50, { chin: 22 }));
    const out = runMany(puncher, glass, 8, 300);
    expect(out.ko / 300).toBeGreaterThan(0.45);
  });

  it('lets defensive technicians reach the cards', () => {
    const a = man('Boxer1', attrs(50, { defense: 72, ringIq: 68, power: 34 }));
    const b = man('Boxer2', attrs(50, { defense: 72, ringIq: 68, power: 34 }));
    const out = runMany(a, b, 8, 300);
    expect(out.dec / 300).toBeGreaterThan(0.7);
  });

  it('punishes an empty gas tank late', () => {
    const engine = man('Engine', attrs(50, { stamina: 82 }));
    const fader = man('Fader', attrs(54, { stamina: 18 }));
    const out = runMany(engine, fader, 10, 300);
    // the better man on paper fades; the conditioned man takes the majority
    expect(out.a / 300).toBeGreaterThan(0.5);
  });

  it('respects condition — a flat fighter underperforms', () => {
    const sharp = man('Sharp', attrs(52), 1);
    const flat = man('Flat', attrs(52), 0.45);
    const out = runMany(sharp, flat, 8, 300);
    expect(out.a / 300).toBeGreaterThan(0.6);
  });

  it('produces plausible damage numbers for rest math', () => {
    const a = man('A', attrs(52));
    const b = man('B', attrs(48));
    for (let seed = 0; seed < 30; seed++) {
      const r = simulateFight({ a, b, scheduledRounds: 8, seed });
      expect(r.damageA).toBeGreaterThanOrEqual(0);
      expect(r.damageA).toBeLessThanOrEqual(1.6);
      expect(r.damageB).toBeGreaterThanOrEqual(0);
      expect(r.damageB).toBeLessThanOrEqual(1.6);
    }
  });
});
