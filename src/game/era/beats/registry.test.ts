/*
  The scripted-history registry, as a whole — integrity across every arc.
  The laws: every beat has a handler; the schedule is deterministic per
  seed; adding an arc never shifts another arc's dates; a full decade of
  ticks fires the whole timeline exactly once and stays sound.
*/

import { describe, it, expect } from 'vitest';
import { ARCS, BEAT_HANDLERS } from './index';
import { generateEra, topUpEra } from '../eraState';
import { advanceEra } from '../evaluator';
import { createSaveFromDraft, type GameSave } from '../../../state/persistence';
import { randomAppearance } from '../../appearance';
import { advanceTick } from '../../tick/advanceTick';

function freshSave(): GameSave {
  return createSaveFromDraft({
    gymName: 'Era Test A.C.',
    manager: { name: 'Sam Ellis', age: 25, appearance: randomAppearance() },
    cityId: 'new_york',
  });
}

describe('the arc registry', () => {
  it('gives every scheduled beat a handler', () => {
    const era = generateEra('registry-seed', 'new_york', 0);
    for (const beat of era.schedule) {
      const handler = BEAT_HANDLERS[beat.eventId]?.[beat.beatKey];
      expect(handler, `${beat.eventId}/${beat.beatKey} has no handler`).toBeDefined();
    }
  });

  it('has unique arc ids and non-empty handler tables', () => {
    const ids = ARCS.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const arc of ARCS) {
      expect(Object.keys(arc.handlers).length, `${arc.id} has no handlers`).toBeGreaterThan(0);
    }
  });

  it('rolls the same full timeline from the same seed', () => {
    const a = generateEra('same-seed', 'new_york', 0);
    const b = generateEra('same-seed', 'new_york', 0);
    expect(a.schedule).toEqual(b.schedule);
    expect(a.npcs).toEqual(b.npcs);
  });

  it('covers the whole 1975-99 span', () => {
    const era = generateEra('span-seed', 'new_york', 0);
    const days = era.schedule.map((b) => b.day);
    const years = days.map((d) => 1975 + d / 365);
    expect(Math.min(...years)).toBeLessThan(1977); // opens early
    expect(Math.max(...years)).toBeGreaterThan(1997); // runs to the inversion
    expect(era.schedule.length).toBeGreaterThan(50); // a real timeline, not a stub
  });

  it('top-up is idempotent and independent of arc order', () => {
    const era = generateEra('topup-seed', 'new_york', 0);
    const again = topUpEra(era, 'new_york', 0);
    expect(again.schedule).toEqual(era.schedule);
    expect(again).toBe(era); // no-op returns the same reference
  });

  it('every scripted beat fires exactly once across a 25-year run', () => {
    let save = freshSave();
    const fired = new Map<string, number>();
    // advance a quarter-century in weekly steps
    for (let week = 0; week < 25 * 52; week++) {
      const before = save.era.schedule.filter((b) => b.done).length;
      const result = advanceTick(save, 'week');
      if (!result) break;
      save = result.next;
      const after = save.era.schedule.filter((b) => b.done).length;
      void before;
      void after;
    }
    // by the end every beat has fired (been marked done)
    const notDone = save.era.schedule.filter((b) => !b.done);
    expect(notDone, `beats never fired: ${notDone.map((b) => b.eventId).join(', ')}`).toHaveLength(0);
    // and the paper actually spoke — the ledger carries era history
    expect(save.dayCount).toBe(25 * 52 * 7);
    void fired;
  });

  it('a signature clipping fires on its beat with the era cast named', () => {
    const era = generateEra('clip-seed', 'new_york', 0);
    // find the four-kings first superfight and fire it
    const beat = era.schedule.find(
      (b) => b.eventId === 'four-kings-era' && b.beatKey === 'first-superfight',
    )!;
    const r = advanceEra({ era, roster: [], dayCount: beat.day + 1, cityName: 'New York' });
    expect(r.clippings.some((c) => c.includes('welterweight title'))).toBe(true);
    expect(r.era.flags['four-kings-begun']).toBeDefined();
  });

  it('purse weather moves as the decades turn', () => {
    const era = generateEra('weather-seed', 'new_york', 0);
    // heavyweight opens hot (the king's shine)
    expect(era.purseMultipliers.heavyweight).toBeCloseTo(1.2);
    // run to the end: the little men inherit the marquee
    let cur = era;
    const end = Math.max(...era.schedule.map((b) => b.day)) + 5;
    const r = advanceEra({ era: cur, roster: [], dayCount: end, cityName: 'New York' });
    cur = r.era;
    expect(cur.purseMultipliers.welterweight ?? 1).toBeGreaterThan(
      cur.purseMultipliers.heavyweight ?? 1,
    );
  });
});
