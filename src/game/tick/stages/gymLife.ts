/*
  Stage: the floor.
  The gym lives: moods recover, fighters develop on the floor (and age),
  the floor gets observed (hidden traits can surface), and the fighters'
  lives outside intrude — all before we see who's had enough and walked.
*/

import type { TickCtx } from '../types';
import { getCity } from '../../cities';
import { seasonOf } from '../../time';
import { recover } from '../../relationship';
import { trainFighter } from '../../training';
import { observeGym } from '../../gymLog';
import { runLifeEvents } from '../../lifeEvents';
import { equipmentFactorFor } from '../../upgrades';

/** Milestones observe/life produce, folded into history at assembly. */
export interface GymLifeOut {
  milestones: string[];
}

export function gymLifeStage(ctx: TickCtx): GymLifeOut {
  const { prev, days, fromDay, toDay, crossesMonth } = ctx;
  const gymArchetype = getCity(prev.cityId).archetype;
  const equipment = equipmentFactorFor(prev.upgrades);
  // Each focused fighter develops under his assigned trainer (a coach or
  // the manager) — skill, specialty, and chemistry all in play.
  const coachById = new Map(prev.coaches.map((c) => [c.id, c]));
  ctx.roster = ctx.roster.map((e) => {
    const settled = recover(e, days);
    const coach = e.focus !== null && e.coachId ? coachById.get(e.coachId) ?? null : null;
    const t = trainFighter(settled, gymArchetype, days, equipment, coach);
    if (t.note) ctx.trainingNotes.push(t.note);
    return {
      ...settled,
      fighter: {
        ...settled.fighter,
        attributes: t.attributes,
        // Time passes for your men too — age advances fractionally (like the
        // rival world's) so the development/decline curves actually engage.
        age: settled.fighter.age + days / 365,
      },
      lastDelta: t.lastDelta,
    };
  });

  const obs = observeGym(ctx.roster, {
    days,
    fromDay,
    region: getCity(prev.cityId).region,
    season: seasonOf(toDay),
    crossesMonth,
  });
  ctx.roster = obs.roster;
  ctx.obsLines.push(...obs.lines);

  const life = runLifeEvents(ctx.roster, days);
  ctx.roster = life.roster;
  ctx.lifeLines.push(...life.lines);

  return { milestones: [...obs.milestones, ...life.milestones] };
}
