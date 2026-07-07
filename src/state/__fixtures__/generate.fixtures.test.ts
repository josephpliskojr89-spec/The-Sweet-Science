/*
  Migration fixture generator — run manually, never in CI:

    MAKE_FIXTURES=1 npx vitest run src/state/__fixtures__/generate.fixtures.test.ts

  Builds one rich current-version save and down-converts it to the historical
  shapes we guarantee we can load. REGENERATE ONLY when adding a NEW epoch
  (capture the old shape at the moment you bump SAVE_VERSION) — never rewrite
  existing fixtures, they are the contract with players' saves.
*/

import { it } from 'vitest';
import { writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createSaveFromDraft, SAVE_VERSION, type GameSave } from '../persistence';
import { randomAppearance } from '../../game/appearance';
import { generateFighter } from '../../game/fighters';
import { generateCoach } from '../../game/coaches';
import { matchmake } from '../../game/world/population';
import { ringRating } from '../../game/fights';
import { rollNewWalkIns } from '../../game/walkins';

const DIR = new URL('.', import.meta.url).pathname;

function richSave(): GameSave {
  const save = createSaveFromDraft({
    gymName: 'The Kitchen',
    manager: { name: 'Sam Ellis', age: 25, appearance: randomAppearance() },
    cityId: 'new_york',
  });
  const coach = generateCoach('new_york', 0.3);
  const fighter = generateFighter({ cityId: 'new_york', quality: 0.55 });
  const entry = {
    fighter,
    hasLocker: true,
    tier: 'watch' as const,
    joinedDayCount: 0,
    morale: 68,
    trust: 61,
    lockerLossCount: 0,
    focus: null,
    coachId: coach.id,
    trialPatience: 100,
    lockerRequested: false,
    poachInterest: 0,
    record: { wins: 4, losses: 1, draws: 0, kos: 2 },
    bouts: [],
    restUntil: 0,
    careerEarnings: 900,
    lastDelta: {},
    history: [],
  };
  const opp = matchmake(save.world, {
    weightClass: fighter.weightClass,
    minRating: ringRating(fighter) * 0.7,
    maxRating: ringRating(fighter) * 1.1,
    n: 4,
  })[0];
  const walkIns = rollNewWalkIns(30, {
    cityId: 'new_york',
    dayCount: 200,
    reputation: 0.3,
    quality: 0.4,
  }).slice(0, 2);
  return {
    ...save,
    dayCount: 200,
    money: 1234,
    roster: [entry],
    coaches: [coach],
    walkIns,
    bookedFights: [
      {
        id: 'bf_fix1',
        fighterId: fighter.id,
        opponentId: opp.id,
        weightClass: fighter.weightClass,
        rounds: 6,
        venue: 'the Armory',
        purse: 350,
        onDay: 214,
        corner: { mode: 'staff', chiefSecondId: coach.id, cutmanId: null },
      },
    ],
    fightOffers: [
      {
        id: 'fo_fix1',
        fighterId: fighter.id,
        opponentId: opp.id,
        weightClass: fighter.weightClass,
        rounds: 6,
        venue: 'the Garden Annex',
        purse: 300,
        onDay: 220,
        expiresDay: 207,
        risk: 'fair',
        pitch: 'A fair fight on paper. The kind careers are made of.',
      },
    ],
    // stable timestamps so fixtures don't churn on regeneration date
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  };
}

it.skipIf(!process.env.MAKE_FIXTURES)('captures NEW fixture epochs (never rewrites frozen ones)', () => {
  const now = richSave();
  if (now.version !== SAVE_VERSION) throw new Error('generator out of date');
  const freeze = (name: string, data: unknown) => {
    const path = join(DIR, name);
    if (existsSync(path)) return; // frozen — the contract with players' saves
    writeFileSync(path, JSON.stringify(data));
  };

  // v25 — the mail exists; era predates the full arc registry
  freeze('save-v25.json', { ...now, version: 25 });

  // v24 — the seed exists; no mail yet
  const { mail: _mail, ...v24rest } = now;
  freeze('save-v24.json', { ...v24rest, version: 24 });

  // v23 — corner plans on booked fights, no seed
  const { seed: _seed, ...v23rest } = v24rest;
  freeze('save-v23.json', { ...v23rest, version: 23 });

  // v22 — era exists; booked fights have no corner plan yet
  const v22 = {
    ...now,
    version: 22,
    bookedFights: now.bookedFights.map(({ corner: _corner, ...b }) => b),
  };
  freeze('save-v22.json', v22);

  // v21 — the fight layer exists (records/bouts/offers) but no era yet
  const { era: _era, ...v21rest } = v22;
  freeze('save-v21.json', { ...v21rest, version: 21 });
});
