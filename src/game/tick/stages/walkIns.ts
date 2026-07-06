/*
  Stage: the door.
  Walk-ins age and arrive; the ones you left waiting face the market.
  Walk-in competition (6C-3): the men at your door aren't only yours to
  sign. Waffle on a real prospect and a named local rival takes him; a man
  whose patience finally runs out either gets snapped up (if he's good) or
  simply gives up. Either way the winner has a name, and he joins their
  stable — to surface later as their contender, your opponent, your regret.
*/

import type { TickCtx } from '../types';
import { rollNewWalkIns, ageWalkIns, type WalkIn } from '../../walkins';
import {
  walkInPoachChance,
  worldFighterFromFighter,
  pickWalkInPoacher,
  cityCompetitiveness,
} from '../../world/population';
import { reputationFor, qualityFor } from '../derive';

export function walkInsStage(ctx: TickCtx): void {
  const { prev, fromDay, days } = ctx;
  const aged = ageWalkIns(prev.walkIns, days);
  ctx.freshWalkIns = rollNewWalkIns(days, {
    cityId: prev.cityId,
    dayCount: fromDay,
    reputation: reputationFor(prev),
    quality: qualityFor(prev),
  });

  const comp = cityCompetitiveness(prev.cityId);
  const takeProspect = (w: WalkIn) => {
    const gym = pickWalkInPoacher(prev.cityId, qualityFor(prev));
    if (!gym) return false;
    ctx.poached.push({ fighter: w.fighter, gymName: gym.name });
    ctx.worldJoiners.push(worldFighterFromFighter(w.fighter, gym.id));
    return true;
  };
  for (const w of aged.surviving) {
    if (Math.random() < walkInPoachChance(w.fighter.potential, comp, days) && takeProspect(w)) {
      continue;
    }
    ctx.stillWaiting.push(w);
  }
  for (const w of aged.expired) {
    // A genuine prospect left waiting gets signed by name; the rest move on.
    if (!(w.fighter.potential >= 60 && takeProspect(w))) ctx.gaveUp.push(w);
  }
}
