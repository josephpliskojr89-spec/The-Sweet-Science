/*
  The television years — the network boom, the tournament with the
  doctored book, the Tuesday habit, and the voice that walked away.
  (Bible: network-boxing-boom, network-tournament-scandal,
   fights-on-tuesday, voice-quits-the-sport.)
*/

import type { EraArc } from './types';
import { rollDayInWindow } from '../eraState';

const n = (era: { npcs: Record<string, { name: string }> }, key: string) =>
  era.npcs[key]?.name ?? 'the man';

export const networkBoom: EraArc = {
  id: 'network-boxing-boom',
  roll: (rng) => {
    const peak = rollDayInWindow(rng, 1977, 1979);
    return [
      { eventId: 'network-boxing-boom', beatKey: 'the-boom', day: peak - 300 - Math.floor(rng() * 200) },
      { eventId: 'network-boxing-boom', beatKey: 'famous-between-commercials', day: peak },
    ];
  },
  handlers: {
    'the-boom': () => ({
      clippings: [
        'All three networks now carry weekend-afternoon boxing. The sport is free, national, and everywhere — and the network matchmakers want clean records and faces that photograph well, which is a new kind of gatekeeping.',
      ],
      setFlags: ['network-era'],
    }),
    'famous-between-commercials': () => ({
      clippings: [
        'A whole generation of fighters is getting famous between commercials. The closed-circuit theatres keep only the biggest nights now. A club win buys less ink than it did two years ago, and every manager in town has noticed.',
      ],
    }),
  },
};

export const tournamentScandal: EraArc = {
  id: 'network-tournament-scandal',
  roll: (rng) => {
    const launch = rollDayInWindow(rng, 1977, 1978);
    return [
      { eventId: 'network-tournament-scandal', beatKey: 'the-tournament', day: launch },
      { eventId: 'network-tournament-scandal', beatKey: 'the-doctored-book', day: launch + 100 + Math.floor(rng() * 60) },
      { eventId: 'network-tournament-scandal', beatKey: 'cancelled-on-air', day: launch + 200 + Math.floor(rng() * 60) },
    ];
  },
  handlers: {
    'the-tournament': () => ({
      clippings: [
        'A network announced a United States championship tournament — every division, televised, real money down to the club level. For a few months this will be the biggest thing in the sport.',
      ],
      setFlags: ['tournament-running'],
    }),
    'the-doctored-book': () => ({
      clippings: [
        'A reporter went looking for the tournament’s private ratings book and found fighters with invented records and camps that paid to get in. The network says it is reviewing the matter. The matter is reviewing the network.',
      ],
    }),
    'cancelled-on-air': () => ({
      clippings: [
        'The network cancelled its tournament mid-broadcast. Hearings to follow. Two matchmakers are finished in the sport, quietly, the way men are finished in this business. The magazine, whose honest ratings were bypassed, has never enjoyed an editorial more.',
      ],
      logLines: ['A wire from the commission: keep your record book straight. You do.'],
      setFlags: ['tournament-scandal'],
    }),
  },
};

export const tuesdayHabit: EraArc = {
  id: 'fights-on-tuesday',
  roll: (rng) => [
    { eventId: 'fights-on-tuesday', beatKey: 'the-launch', day: rollDayInWindow(rng, 1982, 1985) },
  ],
  handlers: {
    'the-launch': () => ({
      clippings: [
        'A basic-cable channel launched a weekly Tuesday night fight series from small arenas and casino ballrooms. It’s not the Garden, but it’s four hundred thousand living rooms — and the matchmakers are watching it like the club circuit never died.',
      ],
      setFlags: ['tuesday-fights'],
      venueAdd: ['Tuesday Night Arena'],
    }),
  },
};

export const voiceQuits: EraArc = {
  id: 'voice-quits-the-sport',
  npcs: [{ key: 'the-voice', epithet: 'the voice', weightClass: 'heavyweight' }],
  roll: (rng) => [
    { eventId: 'voice-quits-the-sport', beatKey: 'on-the-air', day: rollDayInWindow(rng, 1983, 1984) },
  ],
  handlers: {
    'on-the-air': (era) => ({
      clippings: [
        `${n(era, 'the-voice')}, the most famous broadcast voice the sport ever had, called one more one-sided beating and said on the air that he was done with professional boxing. The Monthly’s reply — “He Needed Us More Than We Needed Him” — drew four hundred letters, most of them disagreeing.`,
      ],
      setFlags: ['voice-gone'],
    }),
  },
};
