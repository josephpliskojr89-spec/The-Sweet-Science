/*
  Stage: the first of the month.
  Progression snapshots, the slow healing of a ruthless-cut reputation,
  and the monthly settle — dues in, rent and salaries out.
*/

import type { TickCtx } from '../types';
import { formatDate } from '../../time';
import { snapshotAttrs } from '../../training';
import { monthlySummary } from '../../economy';

/** Keep ~10 years of monthly progression snapshots per fighter. */
const MAX_HISTORY = 120;
/** How fast a cut-ruthlessness reputation penalty heals (per month). */
const REP_RECOVER = 0.02;

export function booksStage(ctx: TickCtx): void {
  const { prev, days, toDay, crossesMonth } = ctx;

  // Take a monthly progression snapshot of each fighter's attributes.
  if (crossesMonth) {
    ctx.roster = ctx.roster.map((e) => ({
      ...e,
      history: [...e.history, snapshotAttrs(e.fighter.attributes, toDay)].slice(-MAX_HISTORY),
    }));
  }

  // A ruthless-cut reputation penalty heals slowly as the gym lives it down.
  ctx.reputationMod = Math.min(0, prev.reputationMod + REP_RECOVER * (days / 30));

  // Settle the books on the first of the month.
  if (crossesMonth) {
    const fd = formatDate(toDay);
    const sum = monthlySummary(ctx.roster, prev.upgrades, prev.coaches, fd.year);
    ctx.money = ctx.money + sum.net;
    ctx.finances = [
      {
        dayCount: toDay,
        label: `${fd.month} ${fd.year}`,
        duesIncome: sum.duesIncome,
        overhead: sum.overhead,
        coachSalaries: sum.coachSalaries,
        net: sum.net,
        balance: ctx.money,
      },
      ...prev.finances,
    ].slice(0, 36);
  }
}
