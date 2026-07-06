/*
  e2e fixture builder — invoked by e2e/run.mjs (E2E_FIXTURES=1), skipped in
  the unit suite. Builds playable saves the browser smokes inject into
  localStorage:

    fight-tonight.json — a self-cornered bout due TODAY (fight-night smoke)
    open-offer.json    — one promoter offer, nothing booked (booking smoke)
*/

import { it } from 'vitest';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createSaveFromDraft, type GameSave } from '../src/state/persistence';
import { randomAppearance } from '../src/game/appearance';
import { generateFighter } from '../src/game/fighters';
import { matchmake } from '../src/game/world/population';
import { ringRating } from '../src/game/fights';
import type { RosterEntry } from '../src/game/roster';

const OUT = join(new URL('.', import.meta.url).pathname, '.tmp');

function saveWithMan(first: string, last: string): { save: GameSave; entry: RosterEntry } {
  const save = createSaveFromDraft({
    gymName: 'The Kitchen',
    manager: { name: 'Sam Ellis', age: 25, appearance: randomAppearance() },
    cityId: 'new_york',
  });
  const fighter = generateFighter({ cityId: 'new_york', quality: 0.55 });
  fighter.firstName = first;
  fighter.lastName = last;
  const entry: RosterEntry = {
    fighter,
    hasLocker: true,
    tier: 'watch',
    joinedDayCount: -30,
    morale: 70,
    trust: 60,
    lockerLossCount: 0,
    focus: null,
    coachId: null,
    trialPatience: 100,
    lockerRequested: false,
    poachInterest: 0,
    record: { wins: 4, losses: 0, draws: 0, kos: 2 },
    bouts: [],
    restUntil: 0,
    careerEarnings: 600,
    lastDelta: {},
    history: [],
  };
  return { save: { ...save, roster: [entry], money: 500 }, entry };
}

function opponentFor(save: GameSave, entry: RosterEntry) {
  const mine = ringRating(entry.fighter);
  return matchmake(save.world, {
    weightClass: entry.fighter.weightClass,
    minRating: mine * 0.7,
    maxRating: mine * 1.05,
    n: 4,
  })[0];
}

it.skipIf(!process.env.E2E_FIXTURES)('builds e2e fixture saves', () => {
  mkdirSync(OUT, { recursive: true });

  {
    const { save, entry } = saveWithMan('Eddie', 'Turner');
    const opp = opponentFor(save, entry);
    writeFileSync(
      join(OUT, 'fight-tonight.json'),
      JSON.stringify({
        ...save,
        bookedFights: [
          {
            id: 'bf_smoke1',
            fighterId: entry.fighter.id,
            opponentId: opp.id,
            weightClass: entry.fighter.weightClass,
            rounds: 6,
            venue: 'the Armory',
            purse: 350,
            onDay: save.dayCount, // due today
            corner: { mode: 'self', chiefSecondId: null, cutmanId: null },
          },
        ],
      }),
    );
  }

  {
    const { save, entry } = saveWithMan('Ray', 'Alvarez');
    const opp = opponentFor(save, entry);
    writeFileSync(
      join(OUT, 'open-offer.json'),
      JSON.stringify({
        ...save,
        fightOffers: [
          {
            id: 'fo_smoke2',
            fighterId: entry.fighter.id,
            opponentId: opp.id,
            weightClass: entry.fighter.weightClass,
            rounds: 6,
            venue: 'the Armory',
            purse: 300,
            onDay: save.dayCount + 12,
            expiresDay: save.dayCount + 8,
            risk: 'fair',
            pitch: 'A fair fight on paper. The kind careers are made of.',
          },
        ],
      }),
    );
  }
});
