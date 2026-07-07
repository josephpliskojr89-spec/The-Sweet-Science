/*
  Four men, one crown's worth of glory — and the night one of them
  turned away. (Bible: four-kings-era, the-surrender.
   Analog: Leonard, Durán, Hagler, Hearns; No Más.)
*/

import type { EraArc } from './types';
import { rollDayInWindow } from '../eraState';

const n = (era: { npcs: Record<string, { name: string }> }, key: string) =>
  era.npcs[key]?.name ?? 'the man';

export const fourKings: EraArc = {
  id: 'four-kings-era',
  npcs: [
    { key: 'brawler-king', epithet: 'the brawler from the slums of somewhere', weightClass: 'welterweight' },
    { key: 'skull-king', epithet: 'the shaven-skulled champion nobody would fight', weightClass: 'middleweight' },
    { key: 'assassin-king', epithet: 'the lanky one-punch assassin', weightClass: 'welterweight' },
  ],
  roll: (rng) => {
    const first = rollDayInWindow(rng, 1980, 1981);
    const war = rollDayInWindow(rng, 1984, 1985);
    const verdict = rollDayInWindow(rng, 1987, 1988);
    return [
      { eventId: 'four-kings-era', beatKey: 'first-superfight', day: first },
      { eventId: 'four-kings-era', beatKey: 'the-surrender', day: first + 140 + Math.floor(rng() * 60) },
      { eventId: 'four-kings-era', beatKey: 'the-war', day: war },
      { eventId: 'four-kings-era', beatKey: 'final-verdict', day: verdict },
    ];
  },
  handlers: {
    'first-superfight': (era) => ({
      clippings: [
        `${n(era, 'brawler-king')} took the welterweight title from ${n(era, 'golden-welterweight')} in fifteen ugly, magnificent rounds — walked him down all night and dared him to like it. The gate figures read like a typographical error. There are four men in two divisions now, and the paper has begun keeping a ledger of who owes whom.`,
      ],
      logLines: ['Everyone in the gym scored it different. Nobody scored it boring.'],
      setFlags: ['four-kings-begun'],
      purseMultipliers: { welterweight: 1.3, middleweight: 1.2 },
    }),
    'the-surrender': (era) => ({
      clippings: [
        `In the rematch, humiliated by a showboating ${n(era, 'golden-welterweight')}, ${n(era, 'brawler-king')} turned his back in the eighth round and waved it off. No injury. No knockdown. The two words he muttered will run in every paper in the country for a month, and his own country's press has already disowned him.`,
      ],
      logLines: ['Nobody in this gym has said the two words out loud. Nobody has to.'],
      setFlags: ['the-surrender'],
    }),
    'the-war': (era) => ({
      clippings: [
        `${n(era, 'assassin-king')} and ${n(era, 'skull-king')} fought three rounds the magazine is already calling the greatest short fight ever printed. The first round alone will get its own name. ${n(era, 'skull-king')} won it the only way it could be won — by refusing, twice, to fall.`,
      ],
      logLines: ['The gym ran the war round-by-round off the radio call for a week.'],
      setFlags: ['the-war-of-the-kings'],
      purseMultipliers: { welterweight: 1.5, middleweight: 1.5 },
    }),
    'final-verdict': (era) => ({
      clippings: [
        `${n(era, 'golden-welterweight')}, back from a long absence, took a split decision from ${n(era, 'skull-king')} that half the press section calls larceny. The loser left the arena without a word, and the country, some say, soon after. Among the four of them they held the middleweight title, in some form, for nearly a decade.`,
      ],
      setFlags: ['four-kings-settled'],
      purseMultipliers: { middleweight: 1.3 },
    }),
  },
};
