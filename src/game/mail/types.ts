/*
  The Mail — choice-bearing events, as data.
  --------------------------------------------------------------------------
  A MailItem is a question the world asks you: a letter or telegram with a
  sender, a body in its own voice, and a small set of answers. Everything an
  answer DOES lives in the kind registry (game/mail/kinds.ts); the item
  itself is pure save data. Unanswered mail can lapse — the world doesn't
  wait forever.
*/

export type MailForm = 'letter' | 'telegram' | 'notice';

export interface MailOption {
  id: string;
  /** the answer, as you'd say it */
  label: string;
  /** what it costs / what it means, stated plainly (dollars and facts only) */
  detail?: string;
}

export interface MailItem {
  id: string;
  /** registry kind — picks the resolve handler */
  kind: string;
  form: MailForm;
  arrivedDay: number;
  /** unanswered mail lapses after this day; null = keeps */
  expiresDay: number | null;
  from: string;
  subject: string;
  /** the letter itself, in the sender's voice */
  body: string;
  /** context the resolver needs (fighterId, gymId, price, ...) */
  refs: Record<string, string | number>;
  options: MailOption[];
  /** set once answered — kept briefly as the paper trail */
  answered?: { optionId: string; day: number };
}

/** A kind-authored item before the tick assigns identity. */
export type MailDraft = Omit<MailItem, 'id' | 'arrivedDay' | 'answered'>;
