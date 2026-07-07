/*
  The Poet-King — his last reign, the night he got old, and the sad ending.
  (Bible: poet-kings-last-reign, poet-king-upset-and-redemption,
   poet-king-sad-ending. Analog: late Ali.)
*/

import type { EraArc } from './types';
import { rollDayInWindow } from '../eraState';

const n = (era: { npcs: Record<string, { name: string }> }, key: string) =>
  era.npcs[key]?.name ?? 'the champion';

export const poetKingReign: EraArc = {
  id: 'poet-kings-last-reign',
  npcs: [
    { key: 'poet-king', epithet: 'the poet-king', weightClass: 'heavyweight' },
    { key: 'generational-rival', epithet: 'his old rival', weightClass: 'heavyweight' },
  ],
  roll: (rng) => {
    const defenses = 2 + Math.floor(rng() * 2);
    const beats = [];
    for (let i = 0; i < defenses; i++) {
      beats.push({
        eventId: 'poet-kings-last-reign',
        beatKey: `defense-${i + 1}`,
        day: rollDayInWindow(rng, 1975, 1976),
      });
    }
    return beats;
  },
  handlers: {
    'defense-1': (era) => ({
      clippings: [
        `${n(era, 'poet-king')} retained the heavyweight title last night before a closed-circuit audience the promoters called historic. He predicted the round and missed by one, which he called the other man's fault.`,
      ],
      logLines: ['Half the gym skipped roadwork to argue about the fight.'],
    }),
    'defense-2': (era) => ({
      clippings: [
        `${n(era, 'poet-king')} and ${n(era, 'generational-rival')} went fifteen brutal rounds. The champion kept his title. Neither man kept what he brought into the ring.`,
      ],
      logLines: ['The old heads watched the war on closed circuit and came in quiet.'],
    }),
    'defense-3': (era) => ({
      clippings: [
        `Another defense, another sold-out theatre. ${n(era, 'poet-king')} talks faster than he moves these days, and only the second part is new.`,
      ],
    }),
  },
};

export const poetKingUpset: EraArc = {
  id: 'poet-king-upset',
  npcs: [{ key: 'gap-tooth-novice', epithet: 'the gap-toothed kid', weightClass: 'heavyweight' }],
  roll: (rng) => {
    const upsetDay = rollDayInWindow(rng, 1977, 1979);
    return [
      { eventId: 'poet-king-upset', beatKey: 'the-upset', day: upsetDay },
      { eventId: 'poet-king-upset', beatKey: 'the-circus', day: upsetDay + 45 + Math.floor(rng() * 45) },
      { eventId: 'poet-king-upset', beatKey: 'the-rematch', day: upsetDay + 180 + Math.floor(rng() * 90) },
    ];
  },
  handlers: {
    'the-upset': (era) => ({
      clippings: [
        `STOP PRESS — ${n(era, 'gap-tooth-novice')}, a seven-fight novice, took the heavyweight title from ${n(era, 'poet-king')} on a split decision nobody scored the same way. The new champion is 24 and grinning through the gap in his teeth.`,
      ],
      logLines: ['Your older fighters took the upset personally. The young ones took it as proof.'],
      setFlags: ['poet-king-dethroned'],
    }),
    'the-circus': (era) => ({
      clippings: [
        `${n(era, 'gap-tooth-novice')} missed his third press date in a month. The commission is asking when he intends to defend. His manager answered from a nightclub.`,
      ],
    }),
    'the-rematch': (era) => ({
      clippings: [
        `${n(era, 'poet-king')} won the rematch on legs that were not entirely there and became the first man to hold the heavyweight title three times. The paper is proud of him and wishes he would stop.`,
      ],
      setFlags: ['poet-king-third-reign'],
    }),
  },
};

export const poetKingEnding: EraArc = {
  id: 'poet-king-sad-ending',
  npcs: [{ key: 'heir', epithet: 'the heir', weightClass: 'heavyweight' }],
  roll: (rng) => {
    const sadDay = rollDayInWindow(rng, 1980, 1981);
    return [
      { eventId: 'poet-king-sad-ending', beatKey: 'the-comeback-announced', day: sadDay - 60 },
      { eventId: 'poet-king-sad-ending', beatKey: 'one-fight-too-many', day: sadDay },
      {
        eventId: 'poet-king-sad-ending',
        beatKey: 'folding-chairs',
        day: sadDay + 380 + Math.floor(rng() * 60),
      },
    ];
  },
  handlers: {
    'the-comeback-announced': (era) => ({
      clippings: [
        `${n(era, 'poet-king')}, retired, will fight ${n(era, 'heir')} — his own former sparring partner, now the champion. The money is enormous. Nobody who loves him is glad.`,
      ],
    }),
    'one-fight-too-many': (era) => ({
      clippings: [
        `The corner stopped it after ten. ${n(era, 'heir')} did what the night required and no more, and apologized after, which no champion has ever had to do before. The round-by-round reads like an autopsy.`,
      ],
      logLines: ['He read the account twice and put the paper down without a word.'],
      setFlags: ['poet-king-finished'],
      purseMultipliers: { heavyweight: 0.9 },
    }),
    'folding-chairs': (era) => ({
      clippings: [
        `${n(era, 'poet-king')} lost a dreary decision in a foreign ring with folding chairs last night. It is, finally, over.`,
      ],
    }),
  },
};

/** The champion nobody cheers — the heir's long, unloved reign. */
export const heirReign: EraArc = {
  id: 'heir-in-the-shadow',
  roll: (rng) => {
    const start = rollDayInWindow(rng, 1979, 1980);
    return [
      { eventId: 'heir-in-the-shadow', beatKey: 'the-metronome', day: start + 300 + Math.floor(rng() * 120) },
      { eventId: 'heir-in-the-shadow', beatKey: 'the-robbery', day: rollDayInWindow(rng, 1984, 1985) },
    ];
  },
  handlers: {
    'the-metronome': (era) => ({
      clippings: [
        `${n(era, 'heir')} defended the heavyweight title again last night, beautifully, to a half-empty house. Fine fighter, wrong era — the paper has written that sentence so often it keeps it set in type.`,
      ],
    }),
    'the-robbery': (era) => ({
      clippings: [
        `Chasing the old unbeaten record, ${n(era, 'heir')} came up one fight short on a decision the press section scored the other way. He called it what it was. Nobody printed a correction.`,
      ],
      logLines: ['Even the men in this gym who never cheered him said he won that fight.'],
    }),
  },
};
