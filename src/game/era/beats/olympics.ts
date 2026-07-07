/*
  The Olympic cycles — 1976's flag-draped class, 1980's stolen class,
  1984's home-soil harvest, 1992's kid with the television smile.
  (Bible: bicentennial-olympic-class, olympic-class-84,
   olympic-class-92-golden-boy.)
*/

import type { EraArc } from './types';
import { dayForDate } from '../eraState';

const n = (era: { npcs: Record<string, { name: string }> }, key: string) =>
  era.npcs[key]?.name ?? 'the kid';

export const olympics76: EraArc = {
  id: 'olympic-class',
  npcs: [{ key: 'golden-welterweight', epithet: 'the golden boy', weightClass: 'welterweight' }],
  roll: (rng) => [
    { eventId: 'olympic-class', beatKey: 'the-games', day: dayForDate(1976, 6, 20 + Math.floor(rng() * 10)) },
    { eventId: 'olympic-class', beatKey: 'pro-debuts', day: dayForDate(1977, Math.floor(rng() * 5), 10) },
  ],
  handlers: {
    'the-games': () => ({
      clippings: [
        'The flag-draped class swept the podium at the summer Games. Network men were seen writing numbers on napkins before the anthem finished.',
      ],
    }),
    'pro-debuts': (era) => ({
      clippings: [
        `The Olympic class turned professional on network television. ${n(era, 'golden-welterweight')} was paid more for four rounds than most main events gross. The paper prints the figure with a raised eyebrow.`,
      ],
      logLines: ['Your broke fighters read the debut purse figures aloud. Twice.'],
      setFlags: ['olympic-class-pro'],
      injectFighters: [
        { weightClass: 'welterweight', count: 1, rep: [65, 75], age: [20, 22], tier: 'elite' },
        { weightClass: 'lightweight', count: 1, rep: [60, 70], age: [19, 21], tier: 'elite' },
        { weightClass: 'middleweight', count: 1, rep: [60, 70], age: [20, 22], tier: 'elite' },
        { weightClass: 'heavyweight', count: 1, rep: [60, 70], age: [20, 23], tier: 'elite' },
      ],
    }),
  },
};

export const olympics80: EraArc = {
  id: 'olympic-boycott-80',
  roll: (rng) => [
    { eventId: 'olympic-boycott-80', beatKey: 'the-boycott', day: dayForDate(1980, 6, 15 + Math.floor(rng() * 10)) },
    { eventId: 'olympic-boycott-80', beatKey: 'the-stolen-class', day: dayForDate(1981, Math.floor(rng() * 4), 12) },
  ],
  handlers: {
    'the-boycott': () => ({
      clippings: [
        'There will be no American team at the summer Games. A class of amateurs who trained four years for one fortnight will stay home, and the paper does not know what to tell them.',
      ],
    }),
    'the-stolen-class': () => ({
      clippings: [
        'The stolen class is turning professional without the medals or the money. The magazine is keeping a list of their names, and warns the matchmakers of the world: these men did not come up smiling.',
      ],
      setFlags: ['stolen-class-pro'],
      injectFighters: [
        { weightClass: 'lightweight', count: 1, rep: [15, 25], age: [21, 23], tier: 'dangerous-unknown' },
        { weightClass: 'welterweight', count: 1, rep: [15, 25], age: [21, 23], tier: 'dangerous-unknown' },
        { weightClass: 'middleweight', count: 1, rep: [15, 25], age: [22, 24], tier: 'dangerous-unknown' },
      ],
    }),
  },
};

export const olympics84: EraArc = {
  id: 'olympic-class-84',
  roll: (rng) => [
    { eventId: 'olympic-class-84', beatKey: 'home-games', day: dayForDate(1984, 7, 5 + Math.floor(rng() * 7)) },
    { eventId: 'olympic-class-84', beatKey: 'the-signings', day: dayForDate(1984, 10, 10 + Math.floor(rng() * 30)) },
  ],
  handlers: {
    'home-games': () => ({
      clippings: [
        'The home-soil Games produced the deepest medal class anyone can remember. Nine finals, nine flags, and a signing frenzy that started before the closing ceremony.',
      ],
    }),
    'the-signings': () => ({
      clippings: [
        'The medal class signed with the networks and the casinos for bonuses the paper prints in disbelief. Title shots inside fifteen fights, the contracts say. The old trainers say the contracts have never taken a punch.',
      ],
      setFlags: ['class-of-84-pro'],
      injectFighters: [
        { weightClass: 'lightweight', count: 2, rep: [65, 80], age: [19, 22], tier: 'elite' },
        { weightClass: 'welterweight', count: 1, rep: [65, 80], age: [20, 22], tier: 'elite' },
        { weightClass: 'middleweight', count: 1, rep: [60, 75], age: [20, 23], tier: 'elite' },
      ],
    }),
  },
};

export const olympics92: EraArc = {
  id: 'olympic-class-92-golden-boy',
  npcs: [{ key: 'tv-smile', epithet: 'the kid with the television smile', weightClass: 'lightweight' }],
  roll: (rng) => [
    { eventId: 'olympic-class-92-golden-boy', beatKey: 'the-gold', day: dayForDate(1992, 7, 1 + Math.floor(rng() * 8)) },
    { eventId: 'olympic-class-92-golden-boy', beatKey: 'the-arrival', day: dayForDate(1995, Math.floor(rng() * 6), 15) },
  ],
  handlers: {
    'the-gold': (era) => ({
      clippings: [
        `${n(era, 'tv-smile')} won the lightweight gold with a movie face and a promise to somebody he lost. The cameras have already decided what he is going to be.`,
      ],
      injectFighters: [{ weightClass: 'lightweight', count: 1, rep: [70, 80], age: [19, 20], tier: 'elite' }],
    }),
    'the-arrival': (era) => ({
      clippings: [
        `${n(era, 'tv-smile')} sold out the arena again, and the paper notes, with anthropological fascination, the number of women at the fights. The sport's box office is moving down in weight and nobody at heavyweight has noticed yet.`,
      ],
      setFlags: ['tv-smile-era'],
      purseMultipliers: { lightweight: 1.4, welterweight: 1.5 },
    }),
  },
};
