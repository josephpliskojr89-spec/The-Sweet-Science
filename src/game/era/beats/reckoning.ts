/*
  What the game takes — the ring death and the reforms, the punch-drunk
  reckoning, the tabloid turn, and the little men inheriting the marquee.
  (Bible: ring-death-fifteen-rounds, what-the-game-takes, tabloid-turn,
   lighter-weights-inherit.)
*/

import type { EraArc } from './types';
import { rollDayInWindow } from '../eraState';

const n = (era: { npcs: Record<string, { name: string }> }, key: string) =>
  era.npcs[key]?.name ?? 'the man';

export const fourteenRounds: EraArc = {
  id: 'ring-death-fifteen-rounds',
  npcs: [{ key: 'brave-visitor', epithet: 'the visitor', weightClass: 'lightweight' }],
  roll: (rng) => {
    const night = rollDayInWindow(rng, 1982, 1984);
    return [
      { eventId: 'ring-death-fifteen-rounds', beatKey: 'the-fourteenth-round', day: night },
      { eventId: 'ring-death-fifteen-rounds', beatKey: 'the-bulletin', day: night + 4 },
      { eventId: 'ring-death-fifteen-rounds', beatKey: 'twelve-rounds', day: night + 500 + Math.floor(rng() * 250) },
    ];
  },
  handlers: {
    'the-fourteenth-round': (era) => ({
      clippings: [
        `${n(era, 'brave-visitor')}, a lightweight challenger brave past all sense, collapsed after a fourteenth-round stoppage on national television last night. He is in surgery as this edition goes to press. The paper prints the round-by-round because it is the paper's job, and takes no pleasure in it.`,
      ],
      logLines: ['Nobody trained much today. The radio stayed on.'],
    }),
    'the-bulletin': (era) => ({
      clippings: [
        `${n(era, 'brave-visitor')} died this morning, four days after the fight, without waking. He was twenty-three. The referee and the winner are, in different ways, never going to be the same, and neither is the argument about this sport, which starts now and in earnest.`,
      ],
      logLines: ['The gym was quiet. The heavy bags hung still past noon.'],
      setFlags: ['the-ring-death'],
    }),
    'twelve-rounds': () => ({
      clippings: [
        'The sanctioning bodies have cut championship fights from fifteen rounds to twelve, with standing eight counts and same-day weigh-in reforms to follow. The old-timers grumble that they are softening the sport. The old-timers are wrong.',
      ],
      setFlags: ['twelve-round-era'],
    }),
  },
};

export const whatTheGameTakes: EraArc = {
  id: 'what-the-game-takes',
  roll: (rng) => [
    { eventId: 'what-the-game-takes', beatKey: 'the-tribute', day: rollDayInWindow(rng, 1986, 1990) },
  ],
  handlers: {
    'the-tribute': () => ({
      clippings: [
        'A retired champion everyone loved appeared at a televised tribute this week and could barely say his own name. The newspaper series that followed — old fighters in rooming houses, fortunes counted out in fog — is the hardest thing the sport has had to read about itself. Commissions are adding neurological screening to license renewals. For a while, every mother in America has an opinion about her son coming to a gym like yours.',
      ],
      logLines: ['You noticed which of your old-timers watched the footage, and which one turned the television off.'],
      setFlags: ['the-reckoning'],
    }),
  },
};

export const tabloidTurn: EraArc = {
  id: 'tabloid-turn',
  roll: (rng) => [
    { eventId: 'tabloid-turn', beatKey: 'between-rounds', day: rollDayInWindow(rng, 1986, 1989) },
  ],
  handlers: {
    'between-rounds': () => ({
      clippings: [
        'The Monthly has added a front-of-book gossip page. A ranked fighter’s nightclub incident ran bigger this week than his title defense, and an old byline published the era’s lament: "We used to cover fights. Now we cover fighters, and only the parts that bleed outside the ring."',
      ],
      setFlags: ['tabloid-era'],
    }),
  },
};

export const littleMen: EraArc = {
  id: 'lighter-weights-inherit',
  roll: (rng) => [
    { eventId: 'lighter-weights-inherit', beatKey: 'pound-for-pound', day: rollDayInWindow(rng, 1995, 1997) },
    { eventId: 'lighter-weights-inherit', beatKey: 'the-inversion', day: rollDayInWindow(rng, 1998, 1999) },
  ],
  handlers: {
    'pound-for-pound': () => ({
      clippings: [
        'The magazine’s pound-for-pound list — once a parlor game — has become the sport’s true hierarchy, and its top five are all under a hundred and sixty pounds. A defensive genius the casual fan never loved sits at the top of it, vindicated by the arithmetic even as the promoters struggle to sell him.',
      ],
      setFlags: ['pound-for-pound-era'],
    }),
    'the-inversion': () => ({
      clippings: [
        'The decade closes with the sport’s biggest purse belonging to a welterweight fight — a sentence that would have read as a typographical error in 1975. The little men own the marquee now. The heavyweights own the memories.',
      ],
      setFlags: ['lighter-weights-inherit'],
      purseMultipliers: { lightweight: 1.6, welterweight: 1.8, middleweight: 1.3, heavyweight: 1.1, light_heavyweight: 1.2 },
    }),
  },
};
