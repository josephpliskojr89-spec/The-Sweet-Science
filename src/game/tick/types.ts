/*
  The tick — shared types.
  --------------------------------------------------------------------------
  TickCtx is the day-advance's working state: the save fields being rewritten,
  plus the note buckets each stage fills. Stages mutate the ctx in order;
  advanceTick assembles the next save, the post-advance notice, and any
  events for the caller to emit. Pure over its inputs — no React, no storage,
  no side effects.
*/

import type { GameSave, LedgerEntry } from '../../state/persistence';
import type { RosterEntry } from '../roster';
import type { WalkIn } from '../walkins';
import type { Fighter } from '../fighters';
import type { Departure } from '../departures';
import type { WorldState, WorldFighter } from '../world/population';
import type { PressState, Clipping } from '../press';
import type { EraState } from '../era/eraState';
import type { FightOffer, BookedFight, FightReport } from '../fights';
import type { FinanceEntry } from '../economy';
import type { CoachApplicant } from '../coaches';
import type { MailItem } from '../mail/types';
import type { Rng } from '../engine/fightEngine';

/** A walk-in you didn't sign, taken by a named rival gym. */
export interface PoachEvent {
  fighter: Fighter;
  gymName: string;
}

export interface AdvanceNotice {
  arrived: Fighter[];
  expired: Fighter[];
  departed: Departure[];
  /** Prospects a rival signed out from under you while you deliberated (6C-3). */
  poached: PoachEvent[];
  /** Fresh clippings this advance — the week's front page (the Monday landing). */
  headlines: Clipping[];
  paperName: string;
  dateLabel: string;
  /** A new issue came out this advance (a week boundary was crossed). */
  newIssue: boolean;
}

/** Game events the caller should emit after committing. */
export interface TickEvent {
  type: 'fighter_left_for_opportunity' | 'fighter_quit';
  fighterId: string;
}

export interface TickCtx {
  /** the save being advanced — read-only reference state */
  prev: GameSave;
  fromDay: number;
  toDay: number;
  /** always 1 — the tick runs one day at a time; kept for stage formulas */
  days: number;
  crossesMonth: boolean;
  /** the day's seeded stream, derived from (save.seed, day) — new systems
      draw from THIS, never Math.random, so a day can be replayed */
  rng: Rng;

  // --- save fields being rewritten, threaded stage to stage ---------------
  roster: RosterEntry[];
  world: WorldState;
  press: PressState;
  history: LedgerEntry[];
  money: number;
  finances: FinanceEntry[];
  reputationMod: number;
  coachApplicants: CoachApplicant[];
  fightOffers: FightOffer[];
  bookedFights: BookedFight[];
  recentFights: FightReport[];
  era: EraState;
  /** the mail tray being rewritten (game/mail) */
  mail: MailItem[];
  /** walk-ins still waiting after competition (fresh arrivals appended at assembly) */
  stillWaiting: WalkIn[];
  freshWalkIns: WalkIn[];

  /** fighters leaving your orbit for the world — appended AFTER the world
      sims this advance, so nobody fights the same tick he was signed */
  worldJoiners: WorldFighter[];

  // --- what happened, for the notice and the corkboard --------------------
  poached: PoachEvent[];
  gaveUp: WalkIn[];
  departed: Departure[];
  /** press cycles that ran this advance (newIssue when ≥1) */
  pressCycles: number;

  // note buckets, assembled into recentLog in a fixed order
  coachNotes: string[];
  trainingNotes: string[];
  obsLines: string[];
  lifeLines: string[];
  requestNotes: string[];
  interestNotes: string[];
  fightNotes: string[];
  eraLogLines: string[];
  mailNotes: string[];
}

export interface TickResult {
  next: GameSave;
  notice: AdvanceNotice | null;
  events: TickEvent[];
}
