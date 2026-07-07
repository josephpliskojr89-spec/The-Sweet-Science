/*
  Era arcs — the shape of scripted history.
  --------------------------------------------------------------------------
  An arc is one chapter of the Bible's Part I: the cast it invents, the
  dated beats it rolls (ONCE, at era generation — the schedule never
  re-rolls), and what each beat DOES when its day comes. Arcs live one per
  concern under era/beats/; the index assembles the registry.

  Beats express themselves only through period channels: clippings, the
  corkboard, mechanical weather (flags, purse multipliers), the venue list,
  fresh faces in the world, and — rarely — a letter. Flags are the hooks
  future systems read (offer tiers, title rules); setting one is cheap and
  binding.
*/

import type { EraState, EraNpc, BeatRoll } from '../eraState';
import type { WeightClassKey } from '../../weightClasses';
import type { MailDraft } from '../../mail/types';
import type { Rng } from '../../engine/fightEngine';
import type { CityId } from '../../cities';

export interface InjectSpec {
  weightClass: WeightClassKey;
  count: number;
  /** publicReputation range at arrival */
  rep: [number, number];
  age: [number, number];
  /** quality of the men injected (maps to elite rank seeding) */
  tier: 'elite' | 'dangerous-unknown';
}

export interface BeatOutput {
  /** clippings for the paper, in its manners */
  clippings?: string[];
  /** corkboard lines in the gym's voice */
  logLines?: string[];
  /** era flag sets: id → the evaluator stamps the day */
  setFlags?: string[];
  /** purse weather changes — absolute per-division sets */
  purseMultipliers?: Partial<Record<WeightClassKey, number>>;
  /** fresh faces for the world (Olympic classes, stolen classes) */
  injectFighters?: InjectSpec[];
  /** a venue joins the offer pool (casino ballrooms, the desert) */
  venueAdd?: string[];
  /** the oldest venue on the list goes dark (the armory elegy) */
  venueRemoveOldest?: boolean;
  /** a letter for the tray */
  mail?: MailDraft;
}

export type BeatHandler = (era: EraState) => BeatOutput;

export interface EraArc {
  /** the Bible event id */
  id: string;
  /** cast this arc invents — generated at era creation (or top-up) */
  npcs?: Array<{ key: string; epithet: string; weightClass: WeightClassKey }>;
  /** roll the arc's dated beats from the era stream */
  roll: (rng: Rng) => BeatRoll[];
  handlers: Record<string, BeatHandler>;
}

export type { EraState, EraNpc, BeatRoll, Rng, CityId };
