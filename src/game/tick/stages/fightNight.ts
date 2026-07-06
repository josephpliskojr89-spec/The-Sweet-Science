/*
  Stage: fight night (6D/8).
  Offers age and arrive; booked bouts resolve — except the ones you're
  cornering yourself, which wait for you at the arena (the advance already
  stopped on their day).
*/

import type { TickCtx } from '../types';
import { fighterFullName } from '../../fighters';
import { formatDate } from '../../time';
import {
  ageOffers,
  resolveFight,
  rollFightOffers,
  cornerQualityFor,
  applyResolvedFight,
} from '../../fights';
import { qualityFor } from '../derive';

export function fightNightStage(ctx: TickCtx): void {
  const { prev, days, toDay } = ctx;

  const agedOffers = ageOffers(ctx.fightOffers, ctx.roster, ctx.bookedFights, toDay);
  ctx.fightOffers = agedOffers.keep;
  for (const o of agedOffers.expired) {
    const man = prev.roster.find((e) => e.fighter.id === o.fighterId);
    if (man)
      ctx.fightNotes.push(
        `The offer for ${fighterFullName(man.fighter)} came off the table — the promoter filled his card.`,
      );
  }

  // bouts on the calendar come due — the ones you're cornering wait
  const due = ctx.bookedFights.filter((b) => b.onDay <= toDay && b.corner.mode !== 'self');
  if (due.length) {
    const dueIds = new Set(due.map((b) => b.id));
    ctx.bookedFights = ctx.bookedFights.filter((b) => !dueIds.has(b.id));
    for (const bout of due) {
      const idx = ctx.roster.findIndex((e) => e.fighter.id === bout.fighterId);
      const opp = ctx.world.fighters.find((f) => f.id === bout.opponentId);
      if (idx < 0 || !opp) {
        ctx.fightNotes.push('A booked bout fell through — the other corner came apart.');
        continue;
      }
      const entry = ctx.roster[idx];
      const resolved = resolveFight({
        booked: bout,
        entry,
        opponent: opp,
        cornerQuality: cornerQualityFor(bout.corner, prev.coaches),
        dayCount: toDay,
      });
      const applied = applyResolvedFight(
        {
          roster: ctx.roster,
          world: ctx.world,
          money: ctx.money,
          press: ctx.press,
          history: ctx.history,
          recentFights: ctx.recentFights,
        },
        resolved,
        toDay,
      );
      ctx.roster = applied.roster;
      ctx.world = applied.world;
      ctx.money = applied.money;
      ctx.press = applied.press;
      ctx.history = applied.history;
      ctx.recentFights = applied.recentFights;
      ctx.fightNotes.push(resolved.logLine);
    }
  }

  // and the phone rings with new work
  const freshOffers = rollFightOffers({
    roster: ctx.roster,
    world: ctx.world,
    booked: ctx.bookedFights,
    existing: ctx.fightOffers,
    venues: ctx.press.venues,
    dayCount: toDay,
    days,
    year: formatDate(toDay).year,
    quality: qualityFor(prev),
    purseWeather: prev.era.purseMultipliers,
  });
  for (const o of freshOffers) {
    const man = ctx.roster.find((e) => e.fighter.id === o.fighterId);
    if (man)
      ctx.fightNotes.push(
        `The phone rang — a promoter wants ${fighterFullName(man.fighter)} at the ${o.venue}.`,
      );
  }
  ctx.fightOffers = [...ctx.fightOffers, ...freshOffers];
}
