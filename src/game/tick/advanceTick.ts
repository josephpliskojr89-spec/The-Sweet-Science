/*
  advanceTick — the day advance, as one pure function.
  --------------------------------------------------------------------------
  Everything that happens when time passes, in its fixed order:

    walk-ins → the floor (train/observe/life) → rival interest & departures
    → the help-wanted ad → the paper & the world → the books → fight night
    → the era

  Stages mutate a shared TickCtx; this file owns the clamp (fight night
  stops the clock), the ordering, and the final assembly of the next save,
  the post-advance notice, and events for the caller to emit.

  PURE over its inputs — no React, no storage, no emit. The one impurity is
  Math.random inside the stage modules (the historical convention); the
  save-level seed replaces it stage by stage (see the roadmap).
*/

import type { GameSave } from '../../state/persistence';
import type { TimeStep } from '../time';
import { advance, formatDate } from '../time';
import { fighterFullName } from '../fighters';
import { WEIGHT_CLASSES } from '../weightClasses';
import type { LogLine } from '../gymLog';
import type { TickCtx, TickResult, TickEvent } from './types';
import { walkInsStage } from './stages/walkIns';
import { gymLifeStage } from './stages/gymLife';
import { departuresStage } from './stages/departures';
import { staffStage } from './stages/staff';
import { paperStage } from './stages/paper';
import { booksStage } from './stages/books';
import { fightNightStage } from './stages/fightNight';
import { eraStage } from './stages/era';

/** A self-cornered bout already due — the clock may not move (work it or
    reassign it first). The caller surfaces this; advanceTick refuses. */
export function fightNightBlocks(save: GameSave): boolean {
  return save.bookedFights.some((b) => b.corner.mode === 'self' && b.onDay <= save.dayCount);
}

export function advanceTick(prev: GameSave, step: TimeStep): TickResult | null {
  if (fightNightBlocks(prev)) return null;

  const fromDay = prev.dayCount;
  // fight night stops the clock: the advance lands ON a self-cornered
  // bout's day and goes no further
  let toDay = advance(fromDay, step);
  const nextCornered = prev.bookedFights
    .filter((b) => b.corner.mode === 'self' && b.onDay > fromDay && b.onDay <= toDay)
    .sort((x, y) => x.onDay - y.onDay)[0];
  if (nextCornered) toDay = nextCornered.onDay;

  const ctx: TickCtx = {
    prev,
    fromDay,
    toDay,
    days: toDay - fromDay,
    crossesMonth: formatDate(fromDay).month !== formatDate(toDay).month,
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
    press: ctx.press,
    history: ctx.history,
    recentLog: [
      ...ctx.eraLogLines.map((text) => ({ dayCount: toDay, text })),
      ...ctx.fightNotes.map((text) => ({ dayCount: toDay, text })),
      ...newLines,
      ...prev.recentLog,
    ].slice(0, 12),
  };

  const events: TickEvent[] = ctx.departed.map((d) => ({
    type: d.reason === 'left_for_opportunity' ? 'fighter_left_for_opportunity' : 'fighter_quit',
    fighterId: d.entry.fighter.id,
  }));

  const newIssue = ctx.pressCycles >= 1;
  const notice =
    newIssue ||
    ctx.freshWalkIns.length ||
    ctx.gaveUp.length ||
    ctx.departed.length ||
    ctx.poached.length
      ? {
          arrived: ctx.freshWalkIns.map((w) => w.fighter),
          expired: ctx.gaveUp.map((w) => w.fighter),
          departed: ctx.departed,
          poached: ctx.poached,
          headlines: ctx.press.clippings.filter((c) => c.dayCount === toDay),
          paperName: ctx.press.paperName,
          dateLabel: formatDate(toDay).full,
          newIssue,
        }
      : null;

  return { next, notice, events };
}
