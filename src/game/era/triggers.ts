/*
  Triggered events — the lives of your fighters, as data.
  --------------------------------------------------------------------------
  Each entry is a condition read from live save data plus what happens when
  it fires. The evaluator enforces pacing (the world doesn't perform) and
  memory (once-per-fighter caps live in era.fired, keyed id:scope).

  Starter set: autonomous events only (no player choice required) drawn from
  the Bible's kept database — press ink, trait weather, the quiet joys.
  Choice-bearing events (the response slips, the envelopes) arrive with
  their letter/phone UI.
*/

import type { RosterEntry } from '../roster';
import { fighterFullName } from '../fighters';
import type { Rng } from '../engine/fightEngine';

export interface TriggerCtx {
  entry: RosterEntry;
  dayCount: number;
  /** gym city name, for datelines */
  cityName: string;
  rng: Rng;
}

export interface TriggerOutput {
  clipping?: string;
  logLine?: string;
  historyLine?: string;
  /** morale delta for this fighter */
  morale?: number;
  /** trust delta */
  trust?: number;
  /** publicReputation delta */
  reputation?: number;
  /** assign a press-coined nickname if he has none */
  coinNickname?: boolean;
}

export interface TriggerDef {
  id: string;
  category: 'press' | 'fighter-life' | 'gym';
  /** 'fighter' = once per fighter; 'save' = once per save; number = cooldown days per fighter */
  oncePer: 'fighter' | 'save' | number;
  condition: (ctx: TriggerCtx) => boolean;
  fire: (ctx: TriggerCtx) => TriggerOutput;
}


const lastBout = (e: RosterEntry) => (e.bouts.length ? e.bouts[e.bouts.length - 1] : null);

export const TRIGGERS: TriggerDef[] = [
  {
    // journalist: 'First Ink'
    id: 'first-ink',
    category: 'press',
    oncePer: 'fighter',
    condition: ({ entry }) =>
      entry.record.wins >= 3 && entry.fighter.publicReputation < 12,
    fire: ({ entry }) => ({
      clipping: `Also on the card: ${fighterFullName(entry.fighter)} (${entry.record.wins}-${entry.record.losses}-${entry.record.draws}) continues to earn his walking-around money the honest way.`,
      logLine: `${entry.fighter.lastName} bought six copies of the paper and gave five away.`,
      reputation: 2,
      morale: 4,
    }),
  },
  {
    // journalist: 'The Christening' — the press coins his name
    id: 'the-christening',
    category: 'press',
    oncePer: 'fighter',
    condition: ({ entry }) =>
      entry.fighter.nickname === null &&
      entry.record.wins >= 5 &&
      entry.record.kos >= 3 &&
      entry.fighter.publicReputation >= 15 &&
      lastBout(entry)?.outcome === 'W' &&
      (lastBout(entry)?.method === 'KO' || lastBout(entry)?.method === 'TKO'),
    fire: ({ entry }) => ({
      clipping: `The writer needed a name for the headline and made one up on deadline. By Friday the men at the lunch counter were using it for ${fighterFullName(entry.fighter)}, and by the next card the ring announcer was too. Nobody asked the kid.`,
      coinNickname: true,
      reputation: 3,
    }),
  },
  {
    // journalist: 'Local Boy'
    id: 'local-boy',
    category: 'press',
    oncePer: 'fighter',
    condition: ({ entry }) =>
      entry.fighter.publicReputation >= 25 &&
      entry.record.wins >= 6 &&
      entry.record.losses <= 1,
    fire: ({ entry, cityName }) => ({
      clipping: `Sunday feature, above the fold: the block ${fighterFullName(entry.fighter)} grew up on, the church his mother cleans, the ${cityName} gym with the owner's name on the glass. The photographer shot him holding his wraps like they were somebody's baby.`,
      logLine: `The Sunday feature is pinned where everyone can see it. ${entry.fighter.lastName} pretends he hasn't read it.`,
      reputation: 5,
      morale: 6,
      trust: 2,
    }),
  },
  {
    // journalist: 'The Morning After' — the hit piece
    id: 'the-morning-after',
    category: 'press',
    oncePer: 120,
    condition: ({ entry }) => {
      const b = lastBout(entry);
      return (
        !!b &&
        b.outcome === 'L' &&
        (b.method === 'KO' || b.method === 'TKO') &&
        entry.fighter.publicReputation >= 35
      );
    },
    fire: ({ entry }) => ({
      clipping: `The column ran under the word EXPOSED and never used ${entry.fighter.lastName}'s first name once. It quoted two unnamed trainers and a matchmaker who owed the writer a favor, and it was 40 percent fair, which is the cruelest kind.`,
      morale: -6,
      reputation: -2,
    }),
  },
  {
    // fighter seat: the quiet joys — witnessed, not played (no choices, tiny numbers)
    id: 'the-washing-machine',
    category: 'fighter-life',
    oncePer: 'fighter',
    condition: ({ entry }) =>
      (entry.careerEarnings ?? 0) > 400 && entry.fighter.visibleTraits.includes('family_man'),
    fire: ({ entry }) => ({
      logLine: `${entry.fighter.lastName} bought his mother a washing machine with the purse money. He told nobody. His brother told everybody.`,
      morale: 3,
    }),
  },
  {
    // fighter seat: chip on the shoulder, found at 2am
    id: 'the-2am-gym',
    category: 'fighter-life',
    oncePer: 90,
    condition: ({ entry }) => {
      const b = lastBout(entry);
      return (
        !!b && b.outcome === 'L' && entry.fighter.visibleTraits.concat(entry.fighter.hiddenTraits).includes('chip_on_shoulder')
      );
    },
    fire: ({ entry }) => ({
      logLine: `The night man found ${entry.fighter.lastName} working the heavy bag at two in the morning. He let him be, which was correct.`,
      morale: 2,
      trust: 1,
    }),
  },
];

/** Press-coined nicknames, seeded by the era stream. */
export const COINED_NICKNAMES = [
  'The Hammer',
  'Sugar',
  'The Professor',
  'Kid Lightning',
  'The Undertaker',
  'Smoke',
  'The Machine',
  'Bad News',
];
