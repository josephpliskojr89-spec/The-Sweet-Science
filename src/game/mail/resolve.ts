/*
  answerMail — a decision, applied.
  --------------------------------------------------------------------------
  Pure over the save: finds the letter, dispatches to its kind's resolver,
  marks it answered (kept briefly as the paper trail), and returns the next
  save plus the words for the corkboard/ledger. Guards the stale cases —
  a letter already answered, lapsed, or referring to a man who's gone.
*/

import type { GameSave } from '../../state/persistence';
import { MAIL_KINDS, type MailResolution } from './kinds';

/** answered letters kept as the paper trail */
export const MAIL_TRAIL = 8;

export interface AnswerOutcome {
  next: GameSave;
  log?: string;
  history?: string;
  flash?: string;
}

export function answerMail(save: GameSave, mailId: string, optionId: string): AnswerOutcome | null {
  const item = save.mail.find((m) => m.id === mailId);
  if (!item || item.answered) return null;
  if (item.expiresDay !== null && save.dayCount > item.expiresDay) return null;
  if (!item.options.some((o) => o.id === optionId)) return null;
  const kind = MAIL_KINDS[item.kind];
  if (!kind) return null;

  const res: MailResolution = kind.resolve(save, item, optionId);

  const answered = { ...item, answered: { optionId, day: save.dayCount } };
  const open = res.next.mail.filter((m) => m.id !== mailId && !m.answered);
  const trail = [answered, ...res.next.mail.filter((m) => m.answered)].slice(0, MAIL_TRAIL);

  return {
    next: { ...res.next, mail: [...open, ...trail] },
    log: res.log,
    history: res.history,
    flash: res.flash,
  };
}
