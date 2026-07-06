/*
  Booking-layer sanity — purse math, offer lifecycle, and a full resolve
  round-trip against a real generated fighter and world opponent.
*/

import { describe, it, expect } from 'vitest';
import {
  pursefor,
  ageOffers,
  bookFromOffer,
  resolveFight,
  ringRating,
  applyResolvedFight,
  type FightOffer,
} from './fights';
import { generateFighter } from './fighters';
import { generateWorld, matchmake, promoteToFull } from './world/population';
import { initPressState } from './press';
import type { RosterEntry } from './roster';

function entryFor(quality: number): RosterEntry {
  const fighter = generateFighter({ cityId: 'new_york', quality });
  return {
    fighter,
    hasLocker: true,
    tier: 'watch',
    joinedDayCount: 0,
    morale: 70,
    trust: 60,
    lockerLossCount: 0,
    focus: null,
    coachId: null,
    trialPatience: 100,
    lockerRequested: false,
    poachInterest: 0,
    record: { wins: 0, losses: 0, draws: 0, kos: 0 },
    bouts: [],
    restUntil: 0,
    careerEarnings: 0,
    lastDelta: {},
    history: [],
  };
}

describe('pursefor', () => {
  it('pays more for more rounds and bigger names', () => {
    // averaged: the roll inside pursefor is random
    const avg = (rounds: number, rep: number) => {
      let s = 0;
      for (let i = 0; i < 60; i++) s += pursefor(rounds, rep, 'fair', 1975);
      return s / 60;
    };
    expect(avg(6, 10)).toBeGreaterThan(avg(4, 10));
    expect(avg(10, 10)).toBeGreaterThan(avg(8, 10));
    expect(avg(6, 70)).toBeGreaterThan(avg(6, 5));
  });
  it('inflates with the years', () => {
    let a = 0;
    let b = 0;
    for (let i = 0; i < 60; i++) {
      a += pursefor(6, 20, 'fair', 1975);
      b += pursefor(6, 20, 'fair', 1985);
    }
    expect(b).toBeGreaterThan(a * 1.3);
  });
});

describe('ageOffers', () => {
  const base: FightOffer = {
    id: 'fo_1',
    fighterId: 'f1',
    opponentId: 'wf_1',
    weightClass: 'welterweight',
    rounds: 6,
    venue: 'the Armory',
    purse: 300,
    onDay: 30,
    expiresDay: 20,
    risk: 'fair',
    pitch: '',
  };
  const roster = [{ ...entryFor(0.4), fighter: { ...entryFor(0.4).fighter, id: 'f1' } }];

  it('keeps live offers and drops expired ones', () => {
    const live = ageOffers([base], roster, [], 15);
    expect(live.keep).toHaveLength(1);
    const dead = ageOffers([base], roster, [], 25);
    expect(dead.keep).toHaveLength(0);
    expect(dead.expired).toHaveLength(1);
  });

  it('drops offers for men who are gone or already booked', () => {
    const gone = ageOffers([base], [], [], 10);
    expect(gone.keep).toHaveLength(0);
    const booked = ageOffers([base], roster, [bookFromOffer(base, { mode: 'staff', chiefSecondId: null, cutmanId: null })], 10);
    expect(booked.keep).toHaveLength(0);
  });
});

describe('resolveFight', () => {
  it('runs a full round-trip: record, purse, rest, reputations, report', () => {
    const world = generateWorld('new_york', 0);
    const entry = entryFor(0.5);
    const mine = ringRating(entry.fighter);
    const opp = matchmake(world, {
      weightClass: entry.fighter.weightClass,
      minRating: mine * 0.6,
      maxRating: mine * 1.2,
      n: 4,
    })[0];
    expect(opp).toBeDefined();

    const booked = {
      id: 'bf_test',
      fighterId: entry.fighter.id,
      opponentId: opp.id,
      weightClass: entry.fighter.weightClass,
      rounds: 6,
      venue: 'the Armory',
      purse: 325,
      onDay: 20,
      corner: { mode: 'staff' as const, chiefSecondId: null, cutmanId: null },
    };
    const r = resolveFight({ booked, entry, opponent: opp, cornerQuality: 0.02, dayCount: 20 });

    const fights = r.entry.record.wins + r.entry.record.losses + r.entry.record.draws;
    expect(fights).toBe(1);
    expect(r.entry.bouts).toHaveLength(1);
    expect(r.entry.bouts[0].opponentId).toBe(opp.id);
    expect(r.entry.restUntil).toBeGreaterThan(20);
    expect(r.entry.careerEarnings).toBe(325);
    expect(r.purse).toBe(325);

    const oppFights =
      r.opponent.record.wins + r.opponent.record.losses + r.opponent.record.draws;
    const beforeFights = opp.record.wins + opp.record.losses + opp.record.draws;
    expect(oppFights).toBe(beforeFights + 1);

    expect(r.report.narrative.length).toBeGreaterThan(0);
    expect(r.headline).toContain('the Armory');
    // outcomes agree everywhere
    if (r.report.outcome === 'W') {
      expect(r.entry.record.wins).toBe(1);
      expect(r.opponent.record.losses).toBe(opp.record.losses + 1);
      expect(r.entry.morale).toBeGreaterThan(entry.morale);
    } else if (r.report.outcome === 'L') {
      expect(r.entry.record.losses).toBe(1);
      expect(r.opponent.record.wins).toBe(opp.record.wins + 1);
      expect(r.entry.morale).toBeLessThan(entry.morale);
    }
  });

  it('is reproducible for the same booked fight and day', () => {
    const world = generateWorld('new_york', 0);
    const entry = entryFor(0.5);
    const opp = world.fighters.find((f) => f.weightClass === entry.fighter.weightClass)!;
    opp.full = promoteToFull(opp); // pin the opponent's hidden attributes
    const booked = {
      id: 'bf_same',
      fighterId: entry.fighter.id,
      opponentId: opp.id,
      weightClass: entry.fighter.weightClass,
      rounds: 6,
      venue: 'the Armory',
      purse: 300,
      onDay: 12,
      corner: { mode: 'staff' as const, chiefSecondId: null, cutmanId: null },
    };
    const r1 = resolveFight({ booked, entry, opponent: opp, cornerQuality: 0.02, dayCount: 12 });
    const r2 = resolveFight({ booked, entry, opponent: opp, cornerQuality: 0.02, dayCount: 12 });
    expect(r1.report.outcome).toBe(r2.report.outcome);
    expect(r1.report.method).toBe(r2.report.method);
    expect(r1.report.narrative).toEqual(r2.report.narrative);
    // and the promotion is cached forward on the patched opponent
    expect(r1.opponent.full).not.toBeNull();
  });
});


describe('applyResolvedFight', () => {
  it('fans every consequence into any target with the six fields', () => {
    const world = generateWorld('new_york', 0);
    const entry = entryFor(0.5);
    const opp = matchmake(world, {
      weightClass: entry.fighter.weightClass,
      minRating: ringRating(entry.fighter) * 0.6,
      maxRating: ringRating(entry.fighter) * 1.2,
      n: 4,
    })[0];
    const booked = {
      id: 'bf_apply',
      fighterId: entry.fighter.id,
      opponentId: opp.id,
      weightClass: entry.fighter.weightClass,
      rounds: 6,
      venue: 'the Armory',
      purse: 275,
      onDay: 30,
      corner: { mode: 'staff' as const, chiefSecondId: null, cutmanId: null },
    };
    const resolved = resolveFight({ booked, entry, opponent: opp, cornerQuality: 0.02, dayCount: 30 });
    const target = {
      roster: [entry],
      world,
      money: 100,
      press: initPressState('new_york'),
      history: [] as Array<{ dayCount: number; text: string }>,
      recentFights: [],
      somethingElse: 'preserved',
    };
    const after = applyResolvedFight(target, resolved, 30);
    expect(after.money).toBe(375);
    expect(after.roster[0].bouts).toHaveLength(1);
    expect(after.world.fighters.find((f) => f.id === opp.id)?.record).toEqual(
      resolved.opponent.record,
    );
    expect(after.history.at(-1)?.text).toBe(resolved.memory);
    expect(after.recentFights[0]).toBe(resolved.report);
    expect(after.press.clippings.some((c) => c.text === resolved.headline)).toBe(true);
    expect(after.somethingElse).toBe('preserved'); // generic over the target
  });
});
