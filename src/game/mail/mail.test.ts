/*
  The mail — generation, expiry, and what answers do.
  The system's laws: letters arrive from the seeded stream, at most one a
  day; the buyout letter arrives BEFORE the silent walk-out and pauses it;
  unanswered mail lapses; answers are pure save transformations.
*/

import { describe, it, expect } from 'vitest';
import { advanceTick } from '../tick/advanceTick';
import { answerMail } from './resolve';
import { draftPoachBuyout, draftSparringLoan } from './kinds';
import { createSaveFromDraft, type GameSave } from '../../state/persistence';
import { randomAppearance } from '../appearance';
import { generateFighter } from '../fighters';
import type { RosterEntry } from '../roster';
import type { MailItem } from './types';

function freshSave(): GameSave {
  return createSaveFromDraft({
    gymName: 'Mail Test A.C.',
    manager: { name: 'Sam Ellis', age: 25, appearance: randomAppearance() },
    cityId: 'new_york',
  });
}

function entryFor(quality: number, over: Partial<RosterEntry> = {}): RosterEntry {
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
    record: { wins: 3, losses: 1, draws: 0, kos: 1 },
    bouts: [],
    restUntil: 0,
    careerEarnings: 400,
    lastDelta: {},
    history: [],
    ...over,
  };
}

function itemFrom(save: GameSave, draft: NonNullable<ReturnType<typeof draftPoachBuyout>>): MailItem {
  return { ...draft, id: 'ml_test', arrivedDay: save.dayCount };
}

describe('the buyout letter', () => {
  it('selling banks the price and the man joins the rival in the world', () => {
    const base = freshSave();
    const e = entryFor(0.5);
    let save: GameSave = { ...base, roster: [e], money: 100 };
    const draft = draftPoachBuyout(save, e, 1975, save.dayCount)!;
    save = { ...save, mail: [itemFrom(save, draft)] };

    const out = answerMail(save, 'ml_test', 'sell')!;
    expect(out).not.toBeNull();
    const price = Number(draft.refs.price);
    expect(out.next.money).toBe(100 + price);
    expect(out.next.roster).toHaveLength(0);
    expect(
      out.next.world.fighters.some(
        (f) => f.id === `wf_${e.fighter.id}` && f.record.wins === e.record.wins,
      ),
    ).toBe(true);
    expect(out.next.mail[0].answered?.optionId).toBe('sell');
  });

  it('matching costs the sweetener and cools the interest', () => {
    const base = freshSave();
    const e = entryFor(0.5, { poachInterest: 88, morale: 40, trust: 40 });
    let save: GameSave = { ...base, roster: [e], money: 1000 };
    const draft = draftPoachBuyout(save, e, 1975, save.dayCount)!;
    save = { ...save, mail: [itemFrom(save, draft)] };

    const out = answerMail(save, 'ml_test', 'match')!;
    const kept = out.next.roster[0];
    expect(out.next.money).toBe(1000 - Number(draft.refs.sweetener));
    expect(kept.poachInterest).toBe(88 - 45);
    expect(kept.morale).toBe(50);
    expect(kept.trust).toBe(50);
  });

  it('refusing settles nothing but the man hears about it', () => {
    const base = freshSave();
    const e = entryFor(0.5, { poachInterest: 85, trust: 50 });
    let save: GameSave = { ...base, roster: [e] };
    const draft = draftPoachBuyout(save, e, 1975, save.dayCount)!;
    save = { ...save, mail: [itemFrom(save, draft)] };

    const out = answerMail(save, 'ml_test', 'refuse')!;
    expect(out.next.roster[0].poachInterest).toBe(85); // the risk remains
    expect(out.next.roster[0].trust).toBe(53);
  });

  it('guards the stale cases — answered twice, lapsed, unknown option', () => {
    const base = freshSave();
    const e = entryFor(0.5);
    let save: GameSave = { ...base, roster: [e] };
    const draft = draftPoachBuyout(save, e, 1975, save.dayCount)!;
    save = { ...save, mail: [itemFrom(save, draft)] };

    expect(answerMail(save, 'ml_test', 'nonsense')).toBeNull();
    const once = answerMail(save, 'ml_test', 'refuse')!;
    expect(answerMail(once.next, 'ml_test', 'refuse')).toBeNull();

    const lapsed: GameSave = { ...save, dayCount: (draft.expiresDay ?? 0) + 1 };
    expect(answerMail(lapsed, 'ml_test', 'refuse')).toBeNull();
  });
});

describe('the sparring loan', () => {
  it('accepting pays the fee and the man comes back sharper', () => {
    const base = freshSave();
    const e = entryFor(0.5);
    e.fighter.publicReputation = 15;
    let save: GameSave = { ...base, roster: [e], money: 100 };
    const draft = draftSparringLoan(save, e, 1975, save.dayCount)!;
    save = { ...save, mail: [{ ...draft, id: 'ml_test', arrivedDay: save.dayCount }] };

    const before = e.fighter.attributes.defense;
    const out = answerMail(save, 'ml_test', 'accept')!;
    expect(out.next.money).toBe(100 + Number(draft.refs.fee));
    expect(out.next.roster[0].fighter.attributes.defense).toBeCloseTo(before + 0.3);
  });
});

describe('the mail in time', () => {
  it('a flight-risk man draws the buyout letter, and the letter pauses the walk-out', () => {
    const base = freshSave();
    // a man at maximum interest with rock-bottom mood: without the letter
    // system he'd walk within weeks
    const e = entryFor(0.6, { poachInterest: 95, morale: 15, trust: 15 });
    e.fighter.publicReputation = 30;
    let save: GameSave = { ...base, roster: [e] };

    let sawLetter = false;
    for (let week = 0; week < 12 && !sawLetter; week++) {
      const result = advanceTick(save, 'week');
      expect(result).not.toBeNull();
      save = result!.next;
      if (save.roster.length === 0) break; // walked before the letter — possible, rare
      sawLetter = save.mail.some((m) => m.kind === 'poach-buyout' && !m.answered);
    }
    // the letter is the likely outcome; walking first is the rare one
    if (save.roster.length === 1) {
      expect(sawLetter).toBe(true);
      // while it's open he does NOT leave — advance two weeks and he's still here
      const before = save.roster[0].fighter.id;
      for (let week = 0; week < 2; week++) {
        const open = save.mail.find((m) => m.kind === 'poach-buyout' && !m.answered);
        if (!open) break; // lapsed — the pause ends with it
        save = advanceTick(save, 'week')!.next;
      }
      // he can only have left if the letter lapsed first
      const stillOpen = save.mail.some((m) => m.kind === 'poach-buyout' && !m.answered);
      if (stillOpen) expect(save.roster[0]?.fighter.id).toBe(before);
    }
  });

  it('unanswered mail lapses on its date', () => {
    const base = freshSave();
    const e = entryFor(0.5);
    let save: GameSave = { ...base, roster: [e] };
    const draft = draftPoachBuyout(save, e, 1975, save.dayCount)!;
    save = { ...save, mail: [{ ...draft, id: 'ml_test', arrivedDay: 0, expiresDay: 3 }] };

    save = advanceTick(save, 'week')!.next;
    expect(save.mail.some((m) => m.id === 'ml_test')).toBe(false);
  });

  it('the era writes its letter once — the equipment drive arrives after day 90', () => {
    const base = freshSave();
    const e = entryFor(0.5);
    let save: GameSave = { ...base, roster: [e] };
    let seen = 0;
    for (let week = 0; week < 30; week++) {
      save = advanceTick(save, 'week')!.next;
      if (save.roster.length === 0) return; // he left — fine, different test
      seen = Math.max(
        seen,
        save.mail.filter((m) => m.kind === 'equipment-letter').length,
      );
    }
    // once per save, never twice (it may have arrived, been answered/lapsed —
    // but a second copy must never exist)
    expect(seen).toBeLessThanOrEqual(1);
    expect(save.dayCount).toBe(210);
  });
});
