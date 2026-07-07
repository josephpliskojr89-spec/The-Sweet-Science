/*
  The kid from the reform school — the rise, all the belts on one
  nightstand, the fall that was longer, and the circus that came back.
  (Bible: teen-wrecking-ball-rise, teen-unification, teen-implosion,
   nineties-heavyweight-circus. Analog: Tyson, and Holyfield as the
   pious rival.)
*/

import type { EraArc } from './types';
import { rollDayInWindow } from '../eraState';

const n = (era: { npcs: Record<string, { name: string }> }, key: string) =>
  era.npcs[key]?.name ?? 'the kid';

export const reformKid: EraArc = {
  id: 'teen-wrecking-ball',
  npcs: [
    { key: 'reform-kid', epithet: 'the kid from the reform school', weightClass: 'heavyweight' },
    { key: 'old-trainer', epithet: 'the old trainer', weightClass: 'heavyweight' },
    { key: 'electric-promoter', epithet: 'the promoter', weightClass: 'heavyweight' },
    { key: 'pious-rival', epithet: 'the pious survivor', weightClass: 'heavyweight' },
  ],
  roll: (rng) => {
    const debut = rollDayInWindow(rng, 1984, 1986);
    const title = debut + 700 + Math.floor(rng() * 200);
    const upset = rollDayInWindow(rng, 1989, 1991);
    return [
      { eventId: 'teen-wrecking-ball', beatKey: 'the-prospect-notice', day: debut },
      { eventId: 'teen-wrecking-ball', beatKey: 'the-streak', day: debut + 350 + Math.floor(rng() * 100) },
      { eventId: 'teen-wrecking-ball', beatKey: 'the-old-trainer-dies', day: title - 120 - Math.floor(rng() * 60) },
      { eventId: 'teen-wrecking-ball', beatKey: 'youngest-ever', day: title },
      { eventId: 'teen-wrecking-ball', beatKey: 'ninety-one-seconds', day: title + 400 + Math.floor(rng() * 150) },
      { eventId: 'teen-wrecking-ball', beatKey: 'the-upset-abroad', day: upset },
      { eventId: 'teen-wrecking-ball', beatKey: 'the-conviction', day: upset + 400 + Math.floor(rng() * 200) },
      { eventId: 'teen-wrecking-ball', beatKey: 'the-comeback-tour', day: upset + 1500 + Math.floor(rng() * 300) },
      { eventId: 'teen-wrecking-ball', beatKey: 'the-disgrace', day: upset + 2100 + Math.floor(rng() * 300) },
    ];
  },
  handlers: {
    'the-prospect-notice': (era) => ({
      clippings: [
        `Small item, worth clipping: an 18-year-old heavyweight named ${n(era, 'reform-kid')} — squat, terrifying hand speed, a reform-school biography the press cannot resist — turned professional upstate under ${n(era, 'old-trainer')}, the last of the old peek-a-boo men. First-round knockout. Remember the name.`,
      ],
    }),
    'the-streak': (era) => ({
      clippings: [
        `${n(era, 'reform-kid')} fights monthly — a pace nobody has kept since the forties — and the knockouts get shorter as the opponents get better. The highlight reels run on the evening news now. Not the sports segment. The news.`,
      ],
      logLines: ['Big kids keep walking in throwing the right hand first. You know exactly whose fault that is.'],
      setFlags: ['reform-kid-rising'],
      purseMultipliers: { heavyweight: 1.4 },
    }),
    'the-old-trainer-dies': (era) => ({
      clippings: [
        `${n(era, 'old-trainer')} died this week, months short of the title shot he built. He was the only voice the kid listened to. The paper marks it now as the hinge this story will later prove to be.`,
      ],
    }),
    'youngest-ever': (era) => ({
      clippings: [
        `${n(era, 'reform-kid')}, aged 20, is the youngest heavyweight champion in the record book, and the record book is quoted in every column this morning. The division has a pulse again and everyone can hear it.`,
      ],
      setFlags: ['reform-kid-champion'],
      purseMultipliers: { heavyweight: 2.0 },
    }),
    'ninety-one-seconds': (era) => ({
      clippings: [
        `The unification defense lasted ninety-one seconds. The paper printed the timeline of the evening minute by minute to fill the column — the anthem took longer than the fight. One heavyweight champion, undisputed. The word means something again, and around him the money men circle: ${n(era, 'electric-promoter')} has the whole operation now, and the clippings' tone about the camp has turned quietly ominous.`,
      ],
      setFlags: ['undisputed-again'],
    }),
    'the-upset-abroad': (era) => ({
      clippings: [
        `STOP PRESS — In a foreign ring, against a 40-to-1 opponent fighting the night of his life, ${n(era, 'reform-kid')} was knocked out in the tenth. Bloated, distracted, cornered by yes-men since the old man died — the paper's account reads like the report of a natural disaster. The undisputed crown is already coming apart in the lawyers' hands.`,
      ],
      logLines: ['The gym went silent when the wire came through, then everybody talked at once.'],
      setFlags: ['reform-kid-fallen'],
      purseMultipliers: { heavyweight: 1.1 },
    }),
    'the-conviction': (era) => ({
      clippings: [
        `${n(era, 'reform-kid')} was convicted this week and will serve his sentence mid-career. The slow-motion coverage of the unraveling has run for two years: the entourage lawsuits, the divorce, the empty seats at the arraignment where the fans used to be. The sport can feel the countdown start.`,
      ],
      setFlags: ['reform-kid-prison'],
    }),
    'the-comeback-tour': (era) => ({
      clippings: [
        `Released, ${n(era, 'reform-kid')} has returned to the richest schedule of mismatches ever assembled — record buy figures against opponents the paper refuses to rank. The public pays anyway. ${n(era, 'electric-promoter')} calls it a redemption story, honeyed as ever, and the magazine calls it what it is.`,
      ],
      setFlags: ['heavyweight-circus'],
      purseMultipliers: { heavyweight: 1.3 },
    }),
    'the-disgrace': (era) => ({
      clippings: [
        `${n(era, 'pious-rival')} beat him honestly the first time. Losing the rematch too, ${n(era, 'reform-kid')} fouled so grotesquely the referee stopped the fight and the commission revoked his license by morning. The paper's coverage, in its flattest deadpan, completes the arc it began with a reform-school kid and a first-round knockout: the sport's greatest rise, and its most complete self-destruction, one career.`,
      ],
      logLines: ['The kids asked the old heads if they’d ever seen anything like it. The old heads said no, and meant it.'],
      setFlags: ['the-disgrace'],
      purseMultipliers: { heavyweight: 1.1 },
    }),
  },
};

export const oldLion: EraArc = {
  id: 'old-lion-miracle',
  npcs: [{ key: 'old-lion', epithet: 'the old lion', weightClass: 'heavyweight' }],
  roll: (rng) => {
    const comeback = rollDayInWindow(rng, 1990, 1992);
    return [
      { eventId: 'old-lion-miracle', beatKey: 'the-joke', day: comeback },
      { eventId: 'old-lion-miracle', beatKey: 'the-miracle', day: rollDayInWindow(rng, 1993, 1995) },
    ];
  },
  handlers: {
    'the-joke': (era) => ({
      clippings: [
        `${n(era, 'old-lion')} — heavyweight champion once, retired fifteen years, now a preacher with a famous appetite — is coming back at forty-plus, fat and cheerful and selling more tickets than men half his age. The press is covering it as a joke. The joke keeps winning.`,
      ],
      setFlags: ['old-lion-back'],
    }),
    'the-miracle': (era) => ({
      clippings: [
        `At forty-five, wearing the same trunks he lost in twenty years ago, ${n(era, 'old-lion')} knocked out the heavyweight champion with one right hand in the tenth. Nobody had noticed the right hand never left. It is the most sentimental front page this paper will ever print, and it regrets nothing.`,
      ],
      logLines: ['Every man in this gym over thirty walked a little straighter this week. "HE did it."'],
      setFlags: ['old-lion-miracle'],
      purseMultipliers: { heavyweight: 1.3 },
    }),
  },
};
