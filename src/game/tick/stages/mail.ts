/*
  Stage: the mail.
  Letters age (unanswered mail lapses; letters about departed men go with
  them), and the world writes new ones — at most one arrival a day, drawn
  from the day's seeded stream, suppressed while a matching letter is live
  or was answered recently. The buyout letter arrives BEFORE the silent
  walk-out would: a decision offered where a consequence used to just land.
*/

import type { TickCtx } from '../types';
import type { MailItem } from '../../mail/types';
import {
  MAIL_KINDS,
  draftPoachBuyout,
  draftSparringLoan,
  buyoutEligible,
  sparringEligible,
  mailId,
} from '../../mail/kinds';
import { formatDate } from '../../time';

/** answered letters suppress their scope for this long */
const ANSWER_COOLDOWN_DAYS = 60;
/** odds the buyout letter gets typed on any given eligible day */
const BUYOUT_CHANCE = 0.2;
/** odds anybody wants sparring rounds today */
const SPARRING_CHANCE = 0.02;

export function mailStage(ctx: TickCtx): void {
  const { prev, toDay, rng } = ctx;
  const year = formatDate(toDay).year;

  // --- age the tray ---------------------------------------------------------
  const rosterIds = new Set(ctx.roster.map((e) => e.fighter.id));
  const kept: MailItem[] = [];
  for (const m of ctx.mail) {
    if (m.answered) {
      kept.push(m);
      continue;
    }
    const fid = m.refs.fighterId;
    if (fid !== undefined && !rosterIds.has(String(fid))) continue; // the letter left with the man
    if (m.expiresDay !== null && toDay > m.expiresDay) {
      ctx.mailNotes.push(`The letter from ${m.from} lapsed unanswered.`);
      continue;
    }
    kept.push(m);
  }
  ctx.mail = kept;

  // --- scope suppression ------------------------------------------------------
  const suppressed = new Set<string>();
  for (const m of kept) {
    const kind = MAIL_KINDS[m.kind];
    if (!kind) continue;
    if (!m.answered || toDay - m.answered.day < ANSWER_COOLDOWN_DAYS) {
      suppressed.add(kind.scopeKey(m));
    }
  }

  // --- the day's arrival (at most one) -----------------------------------------
  // the buyout letter: the first man at flight risk without a live/recent one
  for (const e of ctx.roster) {
    if (!buyoutEligible(e)) continue;
    if (suppressed.has(`poach-buyout:${e.fighter.id}`)) continue;
    if (rng() >= BUYOUT_CHANCE) continue;
    const draft = draftPoachBuyout(prev, e, year, toDay);
    if (!draft) continue;
    ctx.mail = [...ctx.mail, { ...draft, id: mailId(rng, toDay), arrivedDay: toDay }];
    ctx.mailNotes.push(`A letter came from ${draft.from}. It’s about ${e.fighter.lastName}.`);
    return;
  }

  // the sparring request: rare, for a proven man
  if (rng() < SPARRING_CHANCE) {
    const eligible = ctx.roster.filter(
      (e) => sparringEligible(e, toDay) && !suppressed.has(`sparring-loan:${e.fighter.id}`),
    );
    if (eligible.length > 0) {
      const e = eligible[Math.floor(rng() * eligible.length)];
      const draft = draftSparringLoan(prev, e, year, toDay);
      if (draft) {
        ctx.mail = [...ctx.mail, { ...draft, id: mailId(rng, toDay), arrivedDay: toDay }];
        ctx.mailNotes.push(`${draft.from} wrote asking for ${e.fighter.lastName}.`);
      }
    }
  }
}
