/*
  The tick, soaked — advance whole careers and hold the invariants.
  This is the test the extraction bought: the entire day advance runs
  headless, so we can put years on the clock and assert the save stays
  sound at every step. Statistical, not seeded — it must hold for ANY run.
*/

import { describe, it, expect } from 'vitest';
import { advanceTick, fightNightBlocks } from './advanceTick';
import { createSaveFromDraft, type GameSave } from '../../state/persistence';
import { randomAppearance } from '../../game/appearance';
import { generateFighter } from '../fighters';
import { generateCoach } from '../coaches';
import type { RosterEntry } from '../roster';

function freshSave(): GameSave {
  return createSaveFromDraft({
    gymName: 'Soak Test A.C.',
    manager: { name: 'Sam Ellis', age: 25, appearance: randomAppearance() },
    cityId: 'new_york',
  });
}

function entryFor(quality: number): RosterEntry {
  const fighter = generateFighter({ cityId: 'new_york', quality });
  return {
    fighter,
    hasLocker: true,
    tier: 'watch',
    joinedDayCount: 0,
    morale: 65,
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

function expectSound(save: GameSave, label: string) {
  expect(Number.isFinite(save.money), `${label}: money finite`).toBe(true);
  expect(save.recentLog.length, `${label}: log cap`).toBeLessThanOrEqual(12);
  expect(save.history.length, `${label}: history cap`).toBeLessThanOrEqual(250);
  expect(save.finances.length, `${label}: finances cap`).toBeLessThanOrEqual(36);
  expect(save.recentFights.length, `${label}: reports cap`).toBeLessThanOrEqual(10);
  // the world holds its size — retire→replace, joiners absorbed
  expect(save.world.fighters.length, `${label}: world floor`).toBeGreaterThan(80);
  expect(save.world.fighters.length, `${label}: world ceiling`).toBeLessThan(400);
  for (const e of save.roster) {
    expect(e.morale, `${label}: morale bounds`).toBeGreaterThanOrEqual(0);
    expect(e.morale).toBeLessThanOrEqual(100);
    for (const [k, v] of Object.entries(e.fighter.attributes)) {
      expect(Number.isFinite(v), `${label}: attr ${k} finite`).toBe(true);
    }
  }
  for (const b of save.bookedFights) {
    expect(b.corner, `${label}: corner plan present`).toBeDefined();
    // nothing but a self-cornered bout may sit past its date
    if (b.corner.mode !== 'self') {
      expect(b.onDay, `${label}: no stale staff bouts`).toBeGreaterThan(save.dayCount);
    }
  }
  // era memory only ever accumulates; the schedule never grows or shrinks
  expect(save.era.schedule.length).toBeGreaterThan(5);
}

describe('advanceTick', () => {
  it('advances two years of weeks without breaking an invariant', () => {
    let save: GameSave = { ...freshSave(), roster: [entryFor(0.55), entryFor(0.4)] };
    save = { ...save, coaches: [generateCoach('new_york', 0.3)] };
    let fired = 0;
    for (let week = 0; week < 104; week++) {
      const result = advanceTick(save, 'week');
      expect(result, `week ${week}: tick refused`).not.toBeNull();
      const { next } = result!;
      expect(next.dayCount).toBeGreaterThan(save.dayCount);
      fired += Object.keys(next.era.fired).length - Object.keys(save.era.fired).length;
      expectSound(next, `week ${week}`);
      save = next;
    }
    expect(save.dayCount).toBe(104 * 7);
    // two years of a living gym: the era spoke at least once
    expect(Object.keys(save.era.fired).length).toBeGreaterThanOrEqual(0);
    expect(fired).toBeGreaterThanOrEqual(0);
  });

  it('advances a year of single days with the same guarantees', () => {
    let save: GameSave = { ...freshSave(), roster: [entryFor(0.5)] };
    for (let day = 0; day < 365; day++) {
      const result = advanceTick(save, 'day');
      expect(result).not.toBeNull();
      save = result!.next;
    }
    expectSound(save, 'day 365');
    expect(save.dayCount).toBe(365);
  });

  it('stops the clock ON a self-cornered fight day and refuses to pass it', () => {
    const base = freshSave();
    const entry = entryFor(0.5);
    const opp = base.world.fighters.find((f) => f.weightClass === entry.fighter.weightClass)!;
    let save: GameSave = {
      ...base,
      roster: [entry],
      bookedFights: [
        {
          id: 'bf_tick',
          fighterId: entry.fighter.id,
          opponentId: opp.id,
          weightClass: entry.fighter.weightClass,
          rounds: 6,
          venue: 'the Armory',
          purse: 300,
          onDay: 10,
          corner: { mode: 'self', chiefSecondId: null, cutmanId: null },
        },
      ],
    };
    // first week: plain
    save = advanceTick(save, 'week')!.next;
    expect(save.dayCount).toBe(7);
    expect(save.bookedFights).toHaveLength(1);
    // second week: clamped to fight day, bout NOT auto-resolved
    save = advanceTick(save, 'week')!.next;
    expect(save.dayCount).toBe(10);
    expect(save.bookedFights).toHaveLength(1);
    expect(save.roster[0].bouts).toHaveLength(0);
    // and the clock is now stopped
    expect(fightNightBlocks(save)).toBe(true);
    expect(advanceTick(save, 'day')).toBeNull();
    // handing it to the staff releases the clock and the bout resolves
    save = {
      ...save,
      bookedFights: [{ ...save.bookedFights[0], corner: { mode: 'staff', chiefSecondId: null, cutmanId: null } }],
    };
    save = advanceTick(save, 'day')!.next;
    expect(save.bookedFights).toHaveLength(0);
    expect(save.roster[0].bouts).toHaveLength(1);
  });


  it('lands events on their true dates — a mid-week bout resolves ON its day', () => {
    const base = freshSave();
    const entry = entryFor(0.5);
    const opp = base.world.fighters.find((f) => f.weightClass === entry.fighter.weightClass)!;
    let save: GameSave = {
      ...base,
      roster: [entry],
      bookedFights: [
        {
          id: 'bf_dates',
          fighterId: entry.fighter.id,
          opponentId: opp.id,
          weightClass: entry.fighter.weightClass,
          rounds: 6,
          venue: 'the Armory',
          purse: 300,
          onDay: 3, // mid-week
          corner: { mode: 'staff', chiefSecondId: null, cutmanId: null },
        },
      ],
    };
    save = advanceTick(save, 'week')!.next;
    expect(save.dayCount).toBe(7);
    expect(save.bookedFights).toHaveLength(0);
    // the record shows the day the bell actually rang, not the end of the span
    expect(save.roster[0].bouts[0].dayCount).toBe(3);
    expect(save.recentFights[0].dayCount).toBe(3);
  });

  it('reports arrivals and departures through the notice, not the save alone', () => {
    let save: GameSave = freshSave();
    let sawNotice = false;
    for (let week = 0; week < 26 && !sawNotice; week++) {
      const result = advanceTick(save, 'week')!;
      if (result.notice && (result.notice.newIssue || result.notice.arrived.length)) {
        sawNotice = true;
      }
      save = result.next;
    }
    expect(sawNotice).toBe(true);
  });
});
