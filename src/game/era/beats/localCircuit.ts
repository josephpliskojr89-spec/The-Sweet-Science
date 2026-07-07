/*
  The neighborhood dies slowly — the armory closures and the afternoon
  paper's last edition. (Bible: club-circuit-withers,
   death-of-the-afternoon-paper, alphabet fracture arcs.)
*/

import type { EraArc } from './types';
import { rollDayInWindow } from '../eraState';

export const armoryDark: EraArc = {
  id: 'club-circuit-withers',
  roll: (rng) => {
    // one venue goes dark every few years, rolling through the 80s
    const beats = [];
    let day = rollDayInWindow(rng, 1977, 1979);
    for (let i = 1; i <= 3; i++) {
      beats.push({ eventId: 'club-circuit-withers', beatKey: `closure-${i}`, day });
      day += 800 + Math.floor(rng() * 700);
    }
    return beats;
  },
  handlers: {
    'closure-1': () => ({
      clippings: [
        'The oldest fight venue in town announced its last card — forty-one years of Tuesday fights, and the paper gave it a proper obituary. The ballroom becomes a discount furniture showroom in the spring.',
      ],
      logLines: ['"There’s no money in the neighborhoods anymore, kid," the promoter said. "The money moved."'],
      venueRemoveOldest: true,
      setFlags: ['club-circuit-fading'],
    }),
    'closure-2': () => ({
      clippings: [
        'Another hall went dark this month. The athletic club that held fights since before the war will be a church by Easter. The promoters who survive keep consolidating, and keep cutting purses, because where else will you go.',
      ],
      venueRemoveOldest: true,
    }),
    'closure-3': () => ({
      clippings: [
        'A city that held four fight venues holds one now, and it is dark most months. The paper ran the numbers next to the casino site fees out west and let the arithmetic do the editorializing.',
      ],
      venueRemoveOldest: true,
      setFlags: ['club-circuit-dead'],
    }),
  },
};

export const paperThinner: EraArc = {
  id: 'death-of-the-afternoon-paper',
  roll: (rng) => [
    { eventId: 'death-of-the-afternoon-paper', beatKey: 'the-merger', day: rollDayInWindow(rng, 1981, 1986) },
  ],
  handlers: {
    'the-merger': () => ({
      clippings: [
        'The paper is merging editions. The veteran boxing writer took the buyout, and his farewell column named the ten best fighters he ever covered. His replacement is faster, hungrier, and less patient — you will feel the difference before you can name it. The boxing column goes weekly.',
      ],
      logLines: ['The old writer’s farewell column is pinned by the door. Nobody pinned it. It’s just there.'],
      setFlags: ['paper-thinner'],
    }),
  },
};

export const alphabetFracture: EraArc = {
  id: 'alphabet-fracture-one',
  roll: (rng) => {
    const schism = rollDayInWindow(rng, 1978, 1982);
    return [
      { eventId: 'alphabet-fracture-one', beatKey: 'two-champions', day: schism },
      { eventId: 'alphabet-fracture-one', beatKey: 'the-surrender-of-the-magazine', day: schism + 500 + Math.floor(rng() * 200) },
    ];
  },
  handlers: {
    'two-champions': () => ({
      clippings: [
        'A dispute over a mandatory defense ended with the council stripping a champion, and a rival federation — run out of a hotel suite by a ratings chairman passed over for the top job — immediately recognized him. There are now two heavyweight champions, and the paper needs a style guide.',
      ],
      setFlags: ['alphabet-schism'],
    }),
    'the-surrender-of-the-magazine': () => ({
      clippings: [
        'The magazine, after two years of refusing to recognize the rival belts, has surrendered to reality and prints both ratings columns. "Undisputed" has entered the vocabulary as a rare and marketable condition.',
      ],
    }),
  },
};

export const alphabetSoup: EraArc = {
  id: 'alphabet-soup-complete',
  roll: (rng) => [
    { eventId: 'alphabet-soup-complete', beatKey: 'the-third-body', day: rollDayInWindow(rng, 1983, 1986) },
    { eventId: 'alphabet-soup-complete', beatKey: 'the-fourth-body', day: rollDayInWindow(rng, 1988, 1991) },
  ],
  handlers: {
    'the-third-body': () => ({
      clippings: [
        'A third sanctioning body launched from a state athletic office and crowned a full slate of champions inside eighteen months. The magazine’s editor has begun counting world champions annually, the way other men count national debts.',
      ],
      setFlags: ['three-bodies'],
    }),
    'the-fourth-body': () => ({
      clippings: [
        'A fourth federation, this one from overseas, has begun sanctioning world title fights. The game’s five divisions now hold a dozen simultaneous champions, including two "in recess," a phrase the paper prints with visible pleasure.',
      ],
      setFlags: ['four-bodies'],
    }),
  },
};
