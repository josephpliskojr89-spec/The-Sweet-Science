/*
  advanceTick — the day advance, as one pure function.
  --------------------------------------------------------------------------
  Time passes ONE DAY AT A TIME: a week's advance is seven daily ticks, so
  everything lands on its true date — bouts resolve on fight day, the books
  settle on the first, the paper prints on its own Monday, era beats fire
  the day history says they did. Each day runs the fixed pipeline:

    walk-ins → the floor (train/observe/life) → rival interest & departures
    → the help-wanted ad → the paper & the world → the books → fight night
    → the era

  Stages mutate a shared TickCtx; this file owns the loop (fight night
  stops the clock mid-span), the ordering, and the assembly of the next
  save, the aggregated post-advance notice, and events for the caller to
  emit.

  PURE over its inputs — no React, no storage, no emit. Each day's ctx
  carries an rng derived from (save.seed, day): stages migrating off
  Math.random draw from it and become replayable by construction.
*/

import type { GameSave } from '../../state/persistence';
import type { TimeStep } from '../time';
import { advance, formatDate } from '../time';
import { fighterFullName } from '../fighters';
import { WEIGHT_CLASSES } from '../weightClasses';
import { makeRng, seedFrom } from '../engine/fightEngine';
import type { LogLine } from '../gymLog';
import type { TickCtx, TickResult, TickEvent, AdvanceNotice, PoachEvent } from './types';
import type { WalkIn } from '../walkins';
import type { Departure } from '../departures';
import { walkInsStage } from './stages/walkIns';
import { gymLifeStage } from './stages/gymLife';
import { departuresStage } from './stages/departures';
import { staffStage } from './stages/staff';
import { paperStage } from './stages/paper';
import { booksStage } from './stages/books';
import { fightNightStage } from './stages/fightNight';
import { eraStage } from './stages/era';
import { mailStage } from './stages/mail';

/** A self-cornered bout already due — the clock may not move (work it or
    reassign it first). The caller surfaces this; advanceTick refuses. */
export function fightNightBlocks(save: GameSave): boolean {
  return save.bookedFights.some((b) => b.corner.mode === 'self' && b.onDay <= save.dayCount);
}

interface DayOutcome {
  next: GameSave;
  arrived: WalkIn[];
  gaveUp: WalkIn[];
  departed: Departure[];
  poached: PoachEvent[];
  newIssue: boolean;
  events: TickEvent[];
}

/** One day of the world, in pipeline order. */
function tickOneDay(prev: GameSave): DayOutcome {
  const fromDay = prev.dayCount;
  const toDay = fromDay + 1;

  const ctx: TickCtx = {
    prev,
    fromDay,
    toDay,
    days: 1,
    crossesMonth: formatDate(fromDay).month !== formatDate(toDay).month,
    rng: makeRng(seedFrom(`${prev.seed}:${toDay}`)),
    roster: prev.roster,
    world: prev.world,
    press: prev.press,
    history: prev.history,
    money: prev.money,
    finances: prev.finances,
    reputationMod: prev.reputationMod,
    coachApplicants: prev.coachApplicants,
    fightOffers: prev.fightOffers,
    bookedFights: prev.bookedFights,
    recentFights: prev.recentFights,
    era: prev.era,
    mail: prev.mail,
    stillWaiting: [],
    freshWalkIns: [],
    worldJoiners: [],
    poached: [],
    gaveUp: [],
    departed: [],
    pressCycles: 0,
    coachNotes: [],
    trainingNotes: [],
    obsLines: [],
    lifeLines: [],
    requestNotes: [],
    interestNotes: [],
    fightNotes: [],
    eraLogLines: [],
    mailNotes: [],
  };

  // --- the pipeline, in its fixed order ------------------------------------
  walkInsStage(ctx);
  const life = gymLifeStage(ctx);
  const dep = departuresStage(ctx);
  staffStage(ctx);
  paperStage(ctx, dep.interestHeadlines);

  // the gym remembers: milestones and the men who left
  const departureMemories = ctx.departed.map((d) => {
    const name = fighterFullName(d.entry.fighter);
    let text: string;
    if (d.reason === 'left_for_opportunity' && d.toGym)
      text = `${name} left for ${d.toGym}. He'd stopped believing you'd give him what he was worth.`;
    else if (d.reason === 'left_for_opportunity')
      text = `${name} left for a bigger operation. Someone noticed what you built in him.`;
    else if (d.reason === 'moved_on')
      text = `${name} stopped waiting for a gym that wanted him and moved on.`;
    else text = `${name} quit. He felt forgotten — and maybe he was.`;
    return { dayCount: toDay, text };
  });
  const poachMemories = ctx.poached.map((p) => ({
    dayCount: toDay,
    text: `${p.gymName} signed ${fighterFullName(p.fighter)} — the ${WEIGHT_CLASSES[
      p.fighter.weightClass
    ].name.toLowerCase()} you’d been weighing. You waited a beat too long.`,
  }));
  ctx.history = [
    ...ctx.history,
    ...life.milestones.map((text) => ({ dayCount: toDay, text })),
    ...departureMemories,
    ...poachMemories,
  ].slice(-250);

  booksStage(ctx);
  fightNightStage(ctx);
  eraStage(ctx);
  mailStage(ctx);

  // --- assembly -------------------------------------------------------------
  const newLines: LogLine[] = [
    ...ctx.coachNotes.slice(0, 2),
    ...ctx.trainingNotes.slice(0, 1),
    ...ctx.obsLines,
    ...ctx.lifeLines,
    ...ctx.requestNotes,
    ...ctx.interestNotes,
  ].map((text) => ({ dayCount: toDay, text }));

  const next: GameSave = {
    ...prev,
    dayCount: toDay,
    money: ctx.money,
    finances: ctx.finances,
    reputationMod: ctx.reputationMod,
    coachApplicants: ctx.coachApplicants,
    world: ctx.world,
    walkIns: [...ctx.stillWaiting, ...ctx.freshWalkIns],
    roster: ctx.roster,
    era: ctx.era,
    fightOffers: ctx.fightOffers,
    bookedFights: ctx.bookedFights,
    recentFights: ctx.recentFights,
    mail: ctx.mail,
    press: ctx.press,
    history: ctx.history,
    recentLog: [
      ...ctx.mailNotes.map((text) => ({ dayCount: toDay, text })),
      ...ctx.eraLogLines.map((text) => ({ dayCount: toDay, text })),
      ...ctx.fightNotes.map((text) => ({ dayCount: toDay, text })),
      ...newLines,
      ...prev.recentLog,
    ].slice(0, 12),
  };

  return {
    next,
    arrived: ctx.freshWalkIns,
    gaveUp: ctx.gaveUp,
    departed: ctx.departed,
    poached: ctx.poached,
    newIssue: ctx.pressCycles >= 1,
    events: ctx.departed.map((d) => ({
      type:
        d.reason === 'left_for_opportunity'
          ? ('fighter_left_for_opportunity' as const)
          : ('fighter_quit' as const),
      fighterId: d.entry.fighter.id,
    })),
  };
}

export function advanceTick(prev: GameSave, step: TimeStep): TickResult | null {
  if (fightNightBlocks(prev)) return null;

  const startDay = prev.dayCount;
  const targetDay = advance(startDay, step);

  let save = prev;
  const arrived: WalkIn[] = [];
  const gaveUp: WalkIn[] = [];
  const departed: Departure[] = [];
  const poached: PoachEvent[] = [];
  const events: TickEvent[] = [];
  let newIssue = false;

  while (save.dayCount < targetDay) {
    const day = tickOneDay(save);
    save = day.next;
    arrived.push(...day.arrived);
    gaveUp.push(...day.gaveUp);
    departed.push(...day.departed);
    poached.push(...day.poached);
    events.push(...day.events);
    newIssue = newIssue || day.newIssue;
    // fight night stops the clock: the advance lands ON a self-cornered
    // bout's day and goes no further
    if (fightNightBlocks(save)) break;
  }

  const notice: AdvanceNotice | null =
    newIssue || arrived.length || gaveUp.length || departed.length || poached.length
      ? {
          arrived: arrived.map((w) => w.fighter),
          expired: gaveUp.map((w) => w.fighter),
          departed,
          poached,
          headlines: save.press.clippings.filter(
            (c) => c.dayCount > startDay && c.dayCount <= save.dayCount,
          ),
          paperName: save.press.paperName,
          dateLabel: formatDate(save.dayCount).full,
          newIssue,
        }
      : null;

  return { next: save, notice, events };
}
