/*
  Stage: the paper and the world.
  The paper runs on its own week, whether or not you read it. Real events
  make the headlines: a rival signing the prospect you sat on (6C-3), the
  courtship of one of your men, and his eventual departure (6C-4). The
  competitive world moves on its own — ages, fights, signs, retires — and
  absorbs the men you let slip AFTER it has simmed, so nobody fights the
  same tick he was signed.
*/

import type { TickCtx } from '../types';
import { runPressCycle, pressItem } from '../../press';
import { advanceWorld } from '../../world/worldSim';
import { WEIGHT_CLASSES } from '../../weightClasses';
import { fighterFullName } from '../../fighters';

export function paperStage(ctx: TickCtx, interestHeadlines: string[]): void {
  const { prev, fromDay, toDay } = ctx;

  ctx.pressCycles = Math.floor(toDay / 7) - Math.floor(fromDay / 7);
  for (let i = 0; i < ctx.pressCycles; i++) {
    ctx.press = runPressCycle(ctx.press, prev.cityId, toDay).state;
  }

  for (const p of ctx.poached) {
    const cls = WEIGHT_CLASSES[p.fighter.weightClass].name.toLowerCase();
    ctx.press = pressItem(
      ctx.press,
      toDay,
      `${p.gymName} has signed ${fighterFullName(p.fighter)}, a ${Math.floor(p.fighter.age)}-year-old ${cls}, after weeks of local interest.`,
    );
  }
  for (const line of interestHeadlines) ctx.press = pressItem(ctx.press, toDay, line);
  for (const d of ctx.departed) {
    if (d.reason !== 'left_for_opportunity' || !d.toGym) continue;
    const cls = WEIGHT_CLASSES[d.entry.fighter.weightClass].name.toLowerCase();
    ctx.press = pressItem(
      ctx.press,
      toDay,
      `${d.toGym} has lured ${fighterFullName(d.entry.fighter)} away — a ${cls} who'd grown unhappy where he was.`,
    );
  }

  const worldAdvance = advanceWorld(ctx.world, { days: ctx.days, toDay });
  ctx.world = worldAdvance.world;
  for (const note of worldAdvance.notes) {
    ctx.press = pressItem(ctx.press, toDay, note);
  }
  if (ctx.worldJoiners.length) {
    ctx.world = { ...ctx.world, fighters: [...ctx.world.fighters, ...ctx.worldJoiners] };
  }
}
