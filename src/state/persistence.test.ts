/*
  Migration contract — every historical save shape we've shipped must load
  into the current version with its career intact. The fixtures under
  __fixtures__/ are frozen at the moment each version was superseded; when
  SAVE_VERSION bumps, capture a new fixture for the outgoing shape and add
  its cases here. Never rewrite an existing fixture.

  Also covers the loader's safety layer: backup-on-upgrade, corrupt-vs-none.
*/

import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  migrate,
  loadSaveOutcome,
  writeSave,
  SAVE_VERSION,
  type GameSave,
} from './persistence';

const FIXTURES = new URL('./__fixtures__/', import.meta.url).pathname;
const fixture = (name: string) =>
  JSON.parse(readFileSync(join(FIXTURES, name), 'utf8')) as Record<string, unknown>;

/** Invariants every migrated save must satisfy, whatever its origin. */
function expectSound(save: GameSave, source: Record<string, unknown>) {
  expect(save.version).toBe(SAVE_VERSION);
  // the career survives untouched
  expect(save.gymName).toBe(source.gymName);
  expect(save.dayCount).toBe(source.dayCount);
  expect(save.money).toBe(source.money);
  expect(save.roster).toHaveLength((source.roster as unknown[]).length);
  const entry = save.roster[0];
  expect(entry.record.wins).toBe(4);
  expect(entry.fighter.publicReputation).toBeGreaterThanOrEqual(0);
  expect(entry.fighter.growth).toBeDefined();
  expect(entry.fighter.baseDues).toBeDefined();
  // the world holds and is normalized
  expect(save.world.fighters.length).toBeGreaterThan(50);
  for (const wf of save.world.fighters) {
    if (wf.affiliation.kind === 'independent' && wf.fidelity === 'local') {
      expect(wf.nationalRank).toBeNull();
    }
  }
  // fight layer: every booked bout carries a corner plan
  for (const b of save.bookedFights) {
    expect(b.corner).toBeDefined();
    expect(['self', 'staff']).toContain(b.corner.mode);
  }
  // v24: the identity seed exists and derives deterministically
  expect(save.seed).toBeDefined();
  expect(migrate(source)!.seed).toBe(save.seed);
  // v25: the mail tray exists
  expect(Array.isArray(save.mail)).toBe(true);
  // era: present, seeded, schedule intact
  expect(save.era).toBeDefined();
  expect(save.era.schedule.length).toBeGreaterThan(5);
}

describe('migrate — historical shapes load intact', () => {
  it('v21 (fight layer, no era): era is rolled, past beats silenced, corner backfilled', () => {
    const src = fixture('save-v21.json');
    const save = migrate(src)!;
    expect(save).not.toBeNull();
    expectSound(save, src);
    // a fresh era for an old save must not dump a year of clippings:
    // every beat scheduled before its dayCount arrives already done
    for (const beat of save.era.schedule) {
      if (beat.day <= save.dayCount) expect(beat.done).toBe(true);
    }
    expect(save.bookedFights[0].corner).toEqual({
      mode: 'staff',
      chiefSecondId: null,
      cutmanId: null,
    });
  });

  it('v22 (era, no corner plans): era preserved verbatim, corner backfilled', () => {
    const src = fixture('save-v22.json');
    const save = migrate(src)!;
    expectSound(save, src);
    // the era must NOT re-roll — one save always remembers itself
    expect(save.era.seed).toBe((src.era as { seed: number }).seed);
    expect(save.era.schedule).toEqual((src.era as { schedule: unknown }).schedule);
    expect(save.bookedFights[0].corner.mode).toBe('staff');
  });

  it('v23 (current epoch): loads as-is, corner plans preserved', () => {
    const src = fixture('save-v23.json');
    const save = migrate(src)!;
    expectSound(save, src);
    expect(save.bookedFights[0].corner).toEqual(
      (src.bookedFights as Array<{ corner: unknown }>)[0].corner,
    );
  });

  it('v24 (seed, no mail): mail backfilled empty, seed preserved', () => {
    const src = fixture('save-v24.json');
    const save = migrate(src)!;
    expectSound(save, src);
    expect(save.seed).toBe(src.seed);
    expect(save.mail).toEqual([]);
  });

  it('is idempotent — migrating a migrated save changes nothing material', () => {
    const once = migrate(fixture('save-v21.json'))!;
    const twice = migrate(JSON.parse(JSON.stringify(once)))!;
    expect(twice.era.schedule).toEqual(once.era.schedule);
    expect(twice.roster[0].fighter).toEqual(once.roster[0].fighter);
    expect(twice.bookedFights).toEqual(once.bookedFights);
  });

  it('rejects garbage without throwing', () => {
    expect(migrate(null)).toBeNull();
    expect(migrate('nonsense')).toBeNull();
    expect(migrate({ version: 1 })).toBeNull();
    expect(migrate({ version: 23 })).toBeNull(); // missing identity fields
  });
});

describe('loadSaveOutcome — the safety layer', () => {
  const KEY = 'sweet-science:save:v1';
  let store: Map<string, string>;

  beforeEach(() => {
    store = new Map();
    globalThis.localStorage = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
      removeItem: (k: string) => void store.delete(k),
      clear: () => store.clear(),
      key: () => null,
      length: 0,
    } as unknown as Storage;
  });

  it('distinguishes an empty slot from a broken one', () => {
    expect(loadSaveOutcome().kind).toBe('none');
    store.set(KEY, '{not json');
    expect(loadSaveOutcome().kind).toBe('corrupt');
    store.set(KEY, JSON.stringify({ version: 1, junk: true }));
    expect(loadSaveOutcome().kind).toBe('corrupt');
  });

  it('backs up the raw save before a version upgrade', () => {
    const raw = readFileSync(join(FIXTURES, 'save-v21.json'), 'utf8');
    store.set(KEY, raw);
    const outcome = loadSaveOutcome();
    expect(outcome.kind).toBe('ok');
    if (outcome.kind === 'ok') expect(outcome.upgradedFrom).toBe(21);
    expect(store.get(`${KEY}:backup`)).toBe(raw);
  });

  it('does not back up a current-version load', () => {
    const current = migrate(fixture('save-v23.json'))!;
    store.set(KEY, JSON.stringify(current));
    const outcome = loadSaveOutcome();
    expect(outcome.kind).toBe('ok');
    if (outcome.kind === 'ok') expect(outcome.upgradedFrom).toBeUndefined();
    expect(store.get(`${KEY}:backup`)).toBeUndefined();
  });

  it('never clears a corrupt save; writeSave preserves it first', () => {
    store.set(KEY, '{broken');
    expect(loadSaveOutcome().kind).toBe('corrupt');
    expect(store.get(KEY)).toBe('{broken');
    const fresh = migrate(fixture('save-v23.json'))!;
    writeSave(fresh);
    expect(store.get(`${KEY}:corrupt`)).toBe('{broken');
    expect(loadSaveOutcome().kind).toBe('ok');
  });
});
