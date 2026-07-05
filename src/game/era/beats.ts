/*
  Scripted beat handlers — what each dated line of the era script DOES.
  --------------------------------------------------------------------------
  A beat fires once, on its day, and expresses itself only through period
  channels: clippings, corkboard lines, and mechanical weather (flags,
  purse multipliers). Handlers are pure: they read the era and return
  patches + copy; the evaluator merges.

  Starter registry: the poet-king trilogy and the Olympic class. The rest
  of the Bible's Part I ports into this table beat by beat.
*/

import type { EraState } from './eraState';

export interface BeatOutput {
  /** clippings for the paper, in its manners */
  clippings?: string[];
  /** corkboard lines in the gym's voice */
  logLines?: string[];
  /** era flag sets: id → true (evaluator stamps the day) */
  setFlags?: string[];
  /** purse weather changes */
  purseMultipliers?: Partial<Record<'heavyweight' | 'welterweight' | 'middleweight' | 'lightweight' | 'light_heavyweight', number>>;
  /** inject this many fresh national elites (the Olympic class) */
  injectOlympians?: number;
}

type BeatHandler = (era: EraState) => BeatOutput;

const n = (era: EraState, key: string) => era.npcs[key]?.name ?? 'the champion';

export const BEAT_HANDLERS: Record<string, Record<string, BeatHandler>> = {
  'poet-kings-last-reign': {
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

  'poet-king-upset': {
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

  'poet-king-sad-ending': {
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

  'olympic-class': {
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
      injectOlympians: 4,
    }),
  },
};
