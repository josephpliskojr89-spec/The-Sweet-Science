/*
  Stage: who's had enough.
  Rival interest (6C-4): talented, unhappy locker holders get courted by
  other gyms. Interest builds — with escalating warnings — before anyone
  leaves, so losing a man here is a consequence you could see coming and
  head off. Repair his morale/trust and the interest cools. Then ordinary
  departures, and the lockerless trialists who force the locker question.
*/

import type { TickCtx } from '../types';
import type { RosterEntry } from '../../roster';
import { fighterFullName } from '../../fighters';
import { flightRiskScore, interestBand } from '../../reputation';
import {
  cityCompetitiveness,
  pickPoachDestination,
  worldFighterFromFighter,
} from '../../world/population';
import { evaluateDepartures, type Departure } from '../../departures';

/** Rival-interest accrual per week at full flight risk, and how fast it cools
    when a man is settled again (6C-4). Tuned so sustained unhappiness in a
    competitive city telegraphs for weeks before anyone walks. */
const POACH_GAIN = 20;
const POACH_DECAY = 8;
/** Days a lockerless trialist must stick around before he'll force the locker
    question himself. Months in, not weeks — the request should feel earned. */
const LOCKER_REQUEST_DAYS = 84;

export interface DeparturesOut {
  /** headlines the courtship generated (fed to the paper stage) */
  interestHeadlines: string[];
}

export function departuresStage(ctx: TickCtx): DeparturesOut {
  const { prev, days, toDay } = ctx;
  const comp = cityCompetitiveness(prev.cityId);
  const interestHeadlines: string[] = [];
  const poachDepartures: Departure[] = [];
  const afterInterest: RosterEntry[] = [];

  for (const e of ctx.roster) {
    if (!e.hasLocker) {
      afterInterest.push(e);
      continue;
    }
    const risk = flightRiskScore(e, comp, prev.reputationMod);
    const before = e.poachInterest;
    const next =
      risk > 0.12
        ? Math.min(100, before + risk * POACH_GAIN * (days / 7))
        : Math.max(0, before - POACH_DECAY * (days / 7));
    const name = fighterFullName(e.fighter);
    const bandUp = interestBand(next);
    if (bandUp > interestBand(before)) {
      if (bandUp === 1) {
        ctx.interestNotes.push(`A man nobody recognized stood ringside, watching ${name} work.`);
      } else if (bandUp === 2) {
        const suitor = pickPoachDestination(prev.cityId);
        const line = `Word around the gym: ${suitor?.name ?? 'another gym'} has been asking about ${name}.`;
        ctx.interestNotes.push(line);
        interestHeadlines.push(line);
      } else if (bandUp === 3) {
        ctx.interestNotes.push(`${name} took a call after practice and wouldn’t say from who.`);
      }
    }
    // An open buyout letter pauses the walk-out: he's waiting on YOUR answer.
    // Lapse it or refuse it and the risk resumes.
    const letterOpen = ctx.mail.some(
      (m) => !m.answered && m.kind === 'poach-buyout' && m.refs.fighterId === e.fighter.id,
    );
    // Compound the per-day hazard so daily and weekly advancing carry the
    // same poach risk (0.4/week at full interest, expressed per day).
    const leavePerDay =
      next >= 80 && !letterOpen ? (Math.min(1, (next - 80) / 20) * 0.4) / 7 : 0;
    const leaveChance = leavePerDay > 0 ? 1 - Math.pow(1 - leavePerDay, days) : 0;
    const gym =
      leaveChance > 0 && Math.random() < leaveChance ? pickPoachDestination(prev.cityId) : null;
    if (gym) {
      poachDepartures.push({ entry: e, reason: 'left_for_opportunity', toGym: gym.name });
      ctx.worldJoiners.push(worldFighterFromFighter(e.fighter, gym.id, e.record));
      continue; // he's gone
    }
    afterInterest.push(next === before ? e : { ...e, poachInterest: next });
  }
  ctx.roster = afterInterest;

  const dep = evaluateDepartures(ctx.roster, days);
  ctx.departed = [...poachDepartures, ...dep.departed];

  // A lockerless trialist who's stuck it out for months forces the question
  // himself — fires rarely, once per man, and surfaces as a request on his
  // profile (answered via respondLockerRequest).
  const requestChance = 1 - Math.pow(1 - 0.02, days);
  ctx.roster = dep.staying.map((e) => {
    if (e.hasLocker || e.lockerRequested) return e;
    if (toDay - e.joinedDayCount < LOCKER_REQUEST_DAYS) return e;
    if (Math.random() >= requestChance) return e;
    ctx.requestNotes.push(
      `${fighterFullName(e.fighter)} stopped you on the floor — he wants to know if he has a future here.`,
    );
    return { ...e, lockerRequested: true };
  });

  return { interestHeadlines };
}
