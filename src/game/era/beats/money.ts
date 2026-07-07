/*
  Where the money moved — the boardwalk, the desert, the wire, the home
  box, and the years nobody bought tickets.
  (Bible: boardwalk-city-opens, desert-city-ascendant, premium-cable-arrives,
   ppv-in-the-home, networks-abandon-ship, recession-bite.)
*/

import type { EraArc } from './types';
import { rollDayInWindow } from '../eraState';

export const boardwalk: EraArc = {
  id: 'boardwalk-city-opens',
  roll: (rng) => {
    const referendum = rollDayInWindow(rng, 1976, 1977);
    return [
      { eventId: 'boardwalk-city-opens', beatKey: 'the-referendum', day: referendum },
      { eventId: 'boardwalk-city-opens', beatKey: 'first-casino', day: referendum + 500 + Math.floor(rng() * 200) },
      { eventId: 'boardwalk-city-opens', beatKey: 'first-card', day: referendum + 800 + Math.floor(rng() * 250) },
    ];
  },
  handlers: {
    'the-referendum': () => ({
      clippings: [
        'A faded boardwalk resort back east voted to legalize casino gambling. One column, page nine. Remember where you read it.',
      ],
    }),
    'first-casino': () => ({
      clippings: [
        'The first boardwalk casino opened its doors to a line around the block. Its ballroom seats two thousand, and its entertainment director used to be a fight man.',
      ],
      setFlags: ['boardwalk-open'],
    }),
    'first-card': () => ({
      clippings: [
        'The boardwalk hosted its first fight card, and the site fee the casino paid made every club promoter east of the river ill. The casino does not need the gate. It needs the crowd at the tables after.',
      ],
      logLines: ['A promoter on the phone said "the boardwalk" three times in one call.'],
      setFlags: ['boardwalk-fights'],
      venueAdd: ['Boardwalk Casino Ballroom'],
    }),
  },
};

export const desert: EraArc = {
  id: 'desert-city-ascendant',
  roll: (rng) => {
    const crossover = rollDayInWindow(rng, 1981, 1983);
    return [
      { eventId: 'desert-city-ascendant', beatKey: 'the-outbidding', day: crossover - 400 - Math.floor(rng() * 200) },
      { eventId: 'desert-city-ascendant', beatKey: 'the-crossover', day: crossover },
    ];
  },
  handlers: {
    'the-outbidding': () => ({
      clippings: [
        'The desert gambling city has started outbidding everyone for the big fights. Purses out there have detached from ticket sales entirely — a fight can lose money at the gate and everyone gets rich.',
      ],
      venueAdd: ['Desert Garden Arena'],
      setFlags: ['desert-money'],
    }),
    'the-crossover': () => ({
      clippings: [
        'For the first time, the desert hosted more title fights this year than the rest of the country combined. The magazine is datelining half its coverage from one city and has stopped apologizing for it.',
      ],
      setFlags: ['desert-capital'],
    }),
  },
};

export const cable: EraArc = {
  id: 'premium-cable-arrives',
  roll: (rng) => [
    { eventId: 'premium-cable-arrives', beatKey: 'the-first-buy', day: rollDayInWindow(rng, 1980, 1982) },
    { eventId: 'premium-cable-arrives', beatKey: 'the-prestige-tier', day: rollDayInWindow(rng, 1985, 1986) },
  ],
  handlers: {
    'the-first-buy': () => ({
      clippings: [
        'A subscription cable service nobody’s uncle has heard of bought the rights to a heavyweight title fight and paid more than the closed-circuit projection. The theatre men laughed. The accountants did not.',
      ],
      setFlags: ['cable-era'],
    }),
    'the-prestige-tier': () => ({
      clippings: [
        'A cable date is now worth more than a network date and carries more prestige than any building. The wire pays. The magazine has started printing purse figures beside the ratings, which tells you what the ratings are for.',
      ],
      setFlags: ['cable-prestige'],
    }),
  },
};

export const ppv: EraArc = {
  id: 'ppv-in-the-home',
  roll: (rng) => {
    const first = rollDayInWindow(rng, 1988, 1990);
    return [
      { eventId: 'ppv-in-the-home', beatKey: 'the-first-buy-figures', day: first },
      { eventId: 'ppv-in-the-home', beatKey: 'the-theatre-elegy', day: first + 600 + Math.floor(rng() * 300) },
    ];
  },
  handlers: {
    'the-first-buy-figures': () => ({
      clippings: [
        'A heavyweight superfight was offered straight into living rooms for a fee, through the cable box, and the buy figures made the business section. The business section. Front page.',
      ],
      setFlags: ['ppv-era'],
    }),
    'the-theatre-elegy': () => ({
      clippings: [
        'The last closed-circuit house in town showed its last fight. It showed every big one since the poet-king was young — the paper counted them, all forty-one, and let the number be the eulogy.',
      ],
      logLines: ['The old heads talked about the theatre for a week. Nobody under thirty knew what they meant.'],
    }),
  },
};

export const networksLeave: EraArc = {
  id: 'networks-abandon-ship',
  roll: (rng) => [
    { eventId: 'networks-abandon-ship', beatKey: 'the-quiet-exit', day: rollDayInWindow(rng, 1987, 1990) },
  ],
  handlers: {
    'the-quiet-exit': () => ({
      clippings: [
        'No fights on the networks this fall, for the first autumn since anyone can remember. Nobody announced anything. The listings item just stopped appearing.',
      ],
      setFlags: ['networks-gone'],
    }),
  },
};

export const recession: EraArc = {
  id: 'recession-bite',
  roll: (rng) => {
    const start = rollDayInWindow(rng, 1980, 1981);
    return [
      { eventId: 'recession-bite', beatKey: 'the-bite', day: start },
      { eventId: 'recession-bite', beatKey: 'the-recovery', day: start + 650 + Math.floor(rng() * 150) },
    ];
  },
  handlers: {
    'the-bite': () => ({
      clippings: [
        'Layoffs at the plant made the front page and the fight pages felt it by Friday. A promoter, quoted: "The ten-dollar seat is dead here." The numbers on offer look like last year’s, which means they’re smaller.',
      ],
      logLines: ['Dues came in slow this month. Crumpled singles and a couple of IOUs.'],
      setFlags: ['recession'],
    }),
    'the-recovery': () => ({
      clippings: [
        'No headline says so, but the offers are just better this spring. The recession loosened its grip the way it took it — quietly, while nobody watched.',
      ],
      setFlags: ['recession-over'],
    }),
  },
};
