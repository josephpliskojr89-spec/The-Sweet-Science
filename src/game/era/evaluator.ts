/*
  The era evaluator — runs the living world's script each advance.
  --------------------------------------------------------------------------
  Two passes, both paced so the world never performs:

  1. SCRIPTED: fire every scheduled sub-beat whose day has come. These are
     history; they do not queue politely — if you advance a year, the year
     happened.
  2. TRIGGERED: evaluate the event registry against every roster man, with a
     hard pacing budget (at most one triggered event per advance, with a
     minimum quiet gap) so decades stay understated. Once-per caps and
     cooldowns live in era.fired.

  Pure over its inputs; GameContext merges the outputs. Determinism: the
  scripted schedule was rolled once at generation; triggered firing order is
  deterministic given the same save state (registry order, roster order),
  with rng used only inside event bodies (nickname choice), seeded per
  (event, fighter, day).
*/

import type { EraState } from './eraState';
import { BEAT_HANDLERS, type InjectSpec } from './beats';
import { TRIGGERS, COINED_NICKNAMES, type TriggerOutput } from './triggers';
import type { RosterEntry } from '../roster';
import { makeRng, seedFrom } from '../engine/fightEngine';
import { makeNationalElite } from '../world/population';
import type { WorldFighter } from '../world/population';
import type { MailDraft } from '../mail/types';

/** at most one triggered event per this many days, gym-wide */
export const TRIGGER_QUIET_DAYS = 5;

export interface RosterPatch {
  fighterId: string;
  morale?: number;
  trust?: number;
  reputation?: number;
  nickname?: string;
}

export interface EraAdvanceResult {
  era: EraState;
  clippings: string[];
  logLines: string[];
  historyLines: string[];
  rosterPatches: RosterPatch[];
  /** fresh world fighters the era injects (Olympic classes etc.) */
  worldInjections: WorldFighter[];
  /** letters the era wrote this advance (assigned identity by the tick) */
  mailDrafts: MailDraft[];
  /** venues joining the offer pool (casino ballrooms, the desert) */
  venueAdds: string[];
  /** how many of the oldest venues go dark this advance */
  venueRemovals: number;
}

export interface EraAdvanceArgs {
  era: EraState;
  roster: RosterEntry[];
  dayCount: number; // the day we advanced TO
  cityName: string;
}

/** Fresh faces for the world from a beat's spec: Olympic classes arrive
    famous with empty records; stolen classes arrive dangerous and unknown. */
function castInjection(spec: InjectSpec): WorldFighter[] {
  const out: WorldFighter[] = [];
  for (let i = 0; i < spec.count; i++) {
    const star = makeNationalElite(spec.weightClass, 3);
    star.nationalRank = null; // nobody is ranked on day one
    star.record = { wins: 0, losses: 0, draws: 0, kos: 0 };
    const t = spec.count === 1 ? 0.5 : i / (spec.count - 1);
    star.age = Math.round(spec.age[0] + t * (spec.age[1] - spec.age[0]));
    star.publicReputation = Math.round(spec.rep[0] + t * (spec.rep[1] - spec.rep[0]));
    out.push(star);
  }
  return out;
}

export function advanceEra(args: EraAdvanceArgs): EraAdvanceResult {
  const { era, roster, dayCount, cityName } = args;
  const out: EraAdvanceResult = {
    era,
    clippings: [],
    logLines: [],
    historyLines: [],
    rosterPatches: [],
    worldInjections: [],
    mailDrafts: [],
    venueAdds: [],
    venueRemovals: 0,
  };

  let flags = era.flags;
  let purseMultipliers = era.purseMultipliers;
  let fired = era.fired;
  let lastTriggeredDay = era.lastTriggeredDay;

  // --- 1. the script -----------------------------------------------------
  const schedule = era.schedule.map((b) => {
    if (b.done || b.day > dayCount) return b;
    const handler = BEAT_HANDLERS[b.eventId]?.[b.beatKey];
    if (handler) {
      const o = handler(era);
      if (o.clippings) out.clippings.push(...o.clippings);
      if (o.logLines) out.logLines.push(...o.logLines);
      if (o.setFlags) {
        flags = { ...flags };
        for (const f of o.setFlags) flags[f] = dayCount;
      }
      if (o.purseMultipliers) {
        purseMultipliers = { ...purseMultipliers, ...o.purseMultipliers };
      }
      if (o.mail) out.mailDrafts.push(o.mail);
      if (o.venueAdd) out.venueAdds.push(...o.venueAdd);
      if (o.venueRemoveOldest) out.venueRemovals += 1;
      if (o.injectFighters) {
        for (const spec of o.injectFighters) out.worldInjections.push(...castInjection(spec));
      }
    }
    return { ...b, done: true };
  });

  // --- 2. the registry, paced ---------------------------------------------
  if (dayCount - lastTriggeredDay >= TRIGGER_QUIET_DAYS) {
    outer: for (const def of TRIGGERS) {
      for (const entry of roster) {
        const scopeKey =
          def.oncePer === 'save' ? def.id : `${def.id}:${entry.fighter.id}`;
        const last = fired[scopeKey];
        if (def.oncePer === 'fighter' || def.oncePer === 'save') {
          if (last !== undefined) continue;
        } else if (last !== undefined && dayCount - last < def.oncePer) {
          continue;
        }

        const rng = makeRng(seedFrom(`${def.id}:${entry.fighter.id}:${dayCount}`));
        const ctx = { entry, dayCount, cityName, rng };
        if (!def.condition(ctx)) continue;

        const o: TriggerOutput = def.fire(ctx);
        if (o.mail) out.mailDrafts.push(o.mail);
        if (o.clipping) out.clippings.push(o.clipping);
        if (o.logLine) out.logLines.push(o.logLine);
        if (o.historyLine) out.historyLines.push(o.historyLine);

        const patch: RosterPatch = { fighterId: entry.fighter.id };
        if (o.morale) patch.morale = o.morale;
        if (o.trust) patch.trust = o.trust;
        if (o.reputation) patch.reputation = o.reputation;
        if (o.coinNickname && entry.fighter.nickname === null) {
          patch.nickname = COINED_NICKNAMES[Math.floor(rng() * COINED_NICKNAMES.length)];
        }
        if (patch.morale || patch.trust || patch.reputation || patch.nickname) {
          out.rosterPatches.push(patch);
        }

        fired = { ...fired, [scopeKey]: dayCount };
        lastTriggeredDay = dayCount;
        break outer; // one triggered event per advance — the world doesn't perform
      }
    }
  }

  out.era = {
    ...era,
    schedule,
    flags,
    purseMultipliers,
    fired,
    lastTriggeredDay,
  };
  return out;
}
