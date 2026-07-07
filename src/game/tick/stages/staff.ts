/*
  Stage: the help wanted ad.
  If you've got a posting out, coaches answer it over time (and the ones
  who waited too long take other work).
*/

import type { TickCtx } from '../types';
import { rollCoachApplicants, ageApplicants, specialtyName } from '../../coaches';
import { reputationFor } from '../derive';

/** Pending coach applicants we'll hold at once. */
const MAX_APPLICANTS = 4;

export function staffStage(ctx: TickCtx): void {
  const { prev, days } = ctx;
  if (!prev.coachPosting) return;
  const aged = ageApplicants(prev.coachApplicants, days);
  const fresh = rollCoachApplicants(days, prev.cityId, reputationFor(prev), prev.coachPosting);
  ctx.coachApplicants = [...aged.staying, ...fresh].slice(0, MAX_APPLICANTS);
  // Only announce arrivals that actually made the (capped) list — a note
  // for a man the slice dropped would name a coach who exists nowhere.
  for (const a of fresh.filter((a) => ctx.coachApplicants.includes(a))) {
    ctx.newApplicants.push(a.coach);
    ctx.coachNotes.push(
      `A coach answered your ad — ${a.coach.name}, ${specialtyName(a.coach.specialty)}.`,
    );
  }
  for (const a of aged.left) {
    ctx.coachNotes.push(`${a.coach.name} got tired of waiting and took another job.`);
  }
}
