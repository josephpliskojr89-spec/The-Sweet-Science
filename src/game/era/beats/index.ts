/*
  The era's scripted history — every arc, assembled.
  --------------------------------------------------------------------------
  Add a chapter by adding a file and listing its arcs here. The order is
  cosmetic (schedules are date-sorted at generation); keep it roughly
  chronological for the reader's sake.
*/

import type { EraArc, BeatHandler, BeatOutput } from './types';
import { poetKingReign, poetKingUpset, poetKingEnding, heirReign } from './poetKing';
import { olympics76, olympics80, olympics84, olympics92 } from './olympics';
import { boardwalk, desert, cable, ppv, networksLeave, recession } from './money';
import { networkBoom, tournamentScandal, tuesdayHabit, voiceQuits } from './television';
import { armoryDark, paperThinner, alphabetFracture, alphabetSoup } from './localCircuit';
import { fourKings } from './fourKings';
import { reformKid, oldLion } from './reformKid';
import { fourteenRounds, whatTheGameTakes, tabloidTurn, littleMen } from './reckoning';

export const ARCS: EraArc[] = [
  // the opening state and the king's long goodbye
  poetKingReign,
  poetKingUpset,
  poetKingEnding,
  heirReign,
  // the olympic cycles
  olympics76,
  olympics80,
  olympics84,
  olympics92,
  // television
  networkBoom,
  tournamentScandal,
  tuesdayHabit,
  voiceQuits,
  // the money moves
  boardwalk,
  desert,
  cable,
  ppv,
  networksLeave,
  recession,
  // the neighborhood dies; the alphabet multiplies
  armoryDark,
  paperThinner,
  alphabetFracture,
  alphabetSoup,
  // the golden generation
  fourKings,
  // the wrecking ball, and the miracle
  reformKid,
  oldLion,
  // what the game takes
  fourteenRounds,
  whatTheGameTakes,
  tabloidTurn,
  littleMen,
];

/** eventId → beatKey → handler, assembled from every arc. */
export const BEAT_HANDLERS: Record<string, Record<string, BeatHandler>> = Object.fromEntries(
  ARCS.map((a) => [a.id, a.handlers]),
);

export type { EraArc, BeatHandler, BeatOutput };
export type { InjectSpec } from './types';
