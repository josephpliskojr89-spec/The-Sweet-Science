/*
  Stage: the era.
  Scripted history fires when its day has come; the triggered-event
  registry breathes under its pacing budget (game/era).
*/

import type { TickCtx } from '../types';
import { advanceEra } from '../../era/evaluator';
import { getCity } from '../../cities';
import { pressItem } from '../../press';

export function eraStage(ctx: TickCtx): void {
  const { prev, toDay } = ctx;
  const eraResult = advanceEra({
    era: ctx.era,
    roster: ctx.roster,
    dayCount: toDay,
    cityName: getCity(prev.cityId).name,
  });
  ctx.era = eraResult.era;
  for (const c of eraResult.clippings) ctx.press = pressItem(ctx.press, toDay, c);
  for (const h of eraResult.historyLines) {
    ctx.history = [...ctx.history, { dayCount: toDay, text: h }].slice(-250);
  }
  if (eraResult.worldInjections.length) {
    ctx.world = { ...ctx.world, fighters: [...ctx.world.fighters, ...eraResult.worldInjections] };
  }
  if (eraResult.rosterPatches.length) {
    const byId = new Map(eraResult.rosterPatches.map((p) => [p.fighterId, p]));
    ctx.roster = ctx.roster.map((e) => {
      const patch = byId.get(e.fighter.id);
      if (!patch) return e;
      return {
        ...e,
        morale: Math.max(0, Math.min(100, e.morale + (patch.morale ?? 0))),
        trust: Math.max(0, Math.min(100, e.trust + (patch.trust ?? 0))),
        fighter: {
          ...e.fighter,
          publicReputation: Math.max(
            0,
            Math.min(100, e.fighter.publicReputation + (patch.reputation ?? 0)),
          ),
          nickname: patch.nickname ?? e.fighter.nickname,
        },
      };
    });
  }
  ctx.eraLogLines.push(...eraResult.logLines);
}
