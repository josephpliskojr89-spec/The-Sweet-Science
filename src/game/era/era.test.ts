/*
  Era engine sanity — schedule determinism, scripted firing, trigger pacing,
  and once-per memory. The Bible's law under test: the schedule never
  re-rolls, history fires exactly once, and the world doesn't perform.
*/

import { describe, it, expect } from 'vitest';
import { generateEra, eraPurseMultiplier, dayForDate } from './eraState';
import { advanceEra, TRIGGER_QUIET_DAYS } from './evaluator';
import { generateFighter } from '../fighters';
import type { RosterEntry } from '../roster';
import type { TraitKey } from '../traits';

function entryWith(over: Partial<RosterEntry> = {}, traits: TraitKey[] = []): RosterEntry {
  const fighter = generateFighter({ cityId: 'new_york', quality: 0.4 });
  fighter.visibleTraits = traits;
  fighter.hiddenTraits = [];
  return {
    fighter,
    hasLocker: true,
    tier: 'watch',
    joinedDayCount: 0,
    morale: 60,
    trust: 55,
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
    ...over,
  };
}

describe('generateEra', () => {
  it('rolls the same history from the same seed', () => {
    const a = generateEra('Kitchen:new_york:1', 'new_york', 0);
    const b = generateEra('Kitchen:new_york:1', 'new_york', 0);
    expect(a.schedule).toEqual(b.schedule);
    expect(a.npcs).toEqual(b.npcs);
  });

  it('rolls different histories from different seeds', () => {
    const a = generateEra('Kitchen:new_york:1', 'new_york', 0);
    const b = generateEra('Kitchen:new_york:2', 'new_york', 0);
    expect(a.schedule.map((s) => s.day)).not.toEqual(b.schedule.map((s) => s.day));
  });

  it('keeps every beat inside its window', () => {
    for (let i = 0; i < 20; i++) {
      const era = generateEra(`seed-${i}`, 'new_york', 0);
      for (const b of era.schedule) {
        if (b.eventId === 'poet-king-upset' && b.beatKey === 'the-upset') {
          expect(b.day).toBeGreaterThanOrEqual(dayForDate(1977, 0, 1));
          expect(b.day).toBeLessThanOrEqual(dayForDate(1980, 0, 1));
        }
        if (b.eventId === 'olympic-class' && b.beatKey === 'the-games') {
          expect(b.day).toBeGreaterThanOrEqual(dayForDate(1976, 6, 1));
          expect(b.day).toBeLessThanOrEqual(dayForDate(1976, 7, 5));
        }
      }
    }
  });

  it('marks pre-start beats done for migrated saves (no retroactive year of clippings)', () => {
    const era = generateEra('old-save', 'new_york', dayForDate(1979, 5));
    const past = era.schedule.filter((b) => b.day <= dayForDate(1979, 5));
    expect(past.length).toBeGreaterThan(0);
    expect(past.every((b) => b.done)).toBe(true);
  });
});

describe('advanceEra — the script', () => {
  it('fires a due beat exactly once, with copy and consequences', () => {
    const era = generateEra('script-test', 'new_york', 0);
    const upset = era.schedule.find(
      (b) => b.eventId === 'poet-king-upset' && b.beatKey === 'the-upset',
    )!;
    const r1 = advanceEra({ era, roster: [], dayCount: upset.day + 1, cityName: 'New York' });
    expect(r1.clippings.some((c) => c.includes('STOP PRESS'))).toBe(true);
    expect(r1.era.flags['poet-king-dethroned']).toBeDefined();
    // advancing again fires nothing new for that beat
    const r2 = advanceEra({ era: r1.era, roster: [], dayCount: upset.day + 2, cityName: 'New York' });
    expect(r2.clippings.some((c) => c.includes('STOP PRESS'))).toBe(false);
  });

  it('turns down the heavyweight purse weather when the king is finished', () => {
    const era = generateEra('weather-test', 'new_york', 0);
    expect(eraPurseMultiplier(era, 'heavyweight')).toBeCloseTo(1.2);
    const end = era.schedule.find(
      (b) => b.eventId === 'poet-king-sad-ending' && b.beatKey === 'one-fight-too-many',
    )!;
    const r = advanceEra({ era, roster: [], dayCount: end.day + 1, cityName: 'New York' });
    expect(eraPurseMultiplier(r.era, 'heavyweight')).toBeCloseTo(0.9);
  });

  it('injects the Olympic class into the world, famous before their records', () => {
    const era = generateEra('olympic-test', 'new_york', 0);
    const debut = era.schedule.find(
      (b) => b.eventId === 'olympic-class' && b.beatKey === 'pro-debuts',
    )!;
    const r = advanceEra({ era, roster: [], dayCount: debut.day + 1, cityName: 'New York' });
    expect(r.worldInjections.length).toBe(4);
    for (const wf of r.worldInjections) {
      expect(wf.publicReputation).toBeGreaterThanOrEqual(60);
      expect(wf.record.wins + wf.record.losses + wf.record.draws).toBe(0);
    }
  });
});

describe('advanceEra — the registry', () => {
  it('fires first-ink for a three-win unknown, once, with its numbers', () => {
    const era = generateEra('trigger-test', 'new_york', 0);
    const e = entryWith({ record: { wins: 3, losses: 0, draws: 0, kos: 1 } });
    e.fighter.publicReputation = 4;
    const r1 = advanceEra({ era, roster: [e], dayCount: 30, cityName: 'New York' });
    expect(r1.clippings.some((c) => c.includes('walking-around money'))).toBe(true);
    const patch = r1.rosterPatches.find((p) => p.fighterId === e.fighter.id);
    expect(patch?.reputation).toBe(2);
    // never again for the same man
    const r2 = advanceEra({ era: r1.era, roster: [e], dayCount: 60, cityName: 'New York' });
    expect(r2.clippings.some((c) => c.includes('walking-around money'))).toBe(false);
  });

  it('paces: one triggered event per advance, quiet gap enforced', () => {
    const era = generateEra('pacing-test', 'new_york', 0);
    // two men who BOTH qualify for first-ink
    const a = entryWith({ record: { wins: 3, losses: 0, draws: 0, kos: 0 } });
    const b = entryWith({ record: { wins: 4, losses: 0, draws: 0, kos: 0 } });
    a.fighter.publicReputation = 2;
    b.fighter.publicReputation = 2;
    const r1 = advanceEra({ era, roster: [a, b], dayCount: 30, cityName: 'New York' });
    expect(r1.rosterPatches).toHaveLength(1);
    // inside the quiet gap: nothing fires even though the second man qualifies
    const r2 = advanceEra({
      era: r1.era,
      roster: [a, b],
      dayCount: 30 + TRIGGER_QUIET_DAYS - 1,
      cityName: 'New York',
    });
    expect(r2.rosterPatches).toHaveLength(0);
    // past the gap: the second man gets his ink
    const r3 = advanceEra({
      era: r2.era,
      roster: [a, b],
      dayCount: 30 + TRIGGER_QUIET_DAYS,
      cityName: 'New York',
    });
    expect(r3.rosterPatches).toHaveLength(1);
    expect(r3.rosterPatches[0].fighterId).not.toBe(r1.rosterPatches[0].fighterId);
  });

  it('coins a nickname deterministically for the christening', () => {
    const era = generateEra('nickname-test', 'new_york', 0);
    const e = entryWith({
      record: { wins: 5, losses: 0, draws: 0, kos: 3 },
      bouts: [
        {
          dayCount: 20,
          opponentId: 'x',
          opponentName: 'X',
          outcome: 'W',
          method: 'KO',
          endRound: 2,
          scheduledRounds: 6,
          venue: 'the Armory',
          purse: 200,
        },
      ],
    });
    e.fighter.nickname = null;
    e.fighter.publicReputation = 20;
    const r1 = advanceEra({ era, roster: [e], dayCount: 25, cityName: 'New York' });
    const r2 = advanceEra({ era, roster: [e], dayCount: 25, cityName: 'New York' });
    expect(r1.rosterPatches[0]?.nickname).toBeDefined();
    expect(r1.rosterPatches[0]?.nickname).toBe(r2.rosterPatches[0]?.nickname);
  });

  it('respects cooldown-style repeats', () => {
    const era = generateEra('cooldown-test', 'new_york', 0);
    const loss = {
      dayCount: 10,
      opponentId: 'x',
      opponentName: 'X',
      outcome: 'L' as const,
      method: 'KO' as const,
      endRound: 3,
      scheduledRounds: 8,
      venue: 'the Armory',
      purse: 300,
    };
    const e = entryWith({ record: { wins: 8, losses: 1, draws: 0, kos: 5 }, bouts: [loss] }, [
      'chip_on_shoulder',
    ]);
    e.fighter.publicReputation = 20; // below morning-after bar; 2am-gym is the eligible one
    const r1 = advanceEra({ era, roster: [e], dayCount: 12, cityName: 'New York' });
    expect(r1.logLines.some((l) => l.includes('two in the morning'))).toBe(true);
    // 30 days later: inside the 90-day cooldown, silent
    const r2 = advanceEra({ era: r1.era, roster: [e], dayCount: 42, cityName: 'New York' });
    expect(r2.logLines.some((l) => l.includes('two in the morning'))).toBe(false);
    // 100 days later: he lost again (same last bout suffices) — it can fire again
    const r3 = advanceEra({ era: r2.era, roster: [e], dayCount: 115, cityName: 'New York' });
    expect(r3.logLines.some((l) => l.includes('two in the morning'))).toBe(true);
  });
});
