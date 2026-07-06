/*
  Mail kinds — what the world writes, and what your answers do.
  --------------------------------------------------------------------------
  Each kind knows how to GENERATE its letter (called by the tick's mail
  stage from seeded randomness) and how to RESOLVE an answer (a pure
  function over the save). Content grows by adding kinds; the machinery
  never changes.

  Voice rules: letters speak in period voices; option details state costs
  and facts in dollars and dates — never hidden numbers.
*/

import type { GameSave } from '../../state/persistence';
import type { RosterEntry } from '../roster';
import type { MailDraft, MailItem } from './types';
import { fighterFullName } from '../fighters';
import { formatMoney, inflationFactor } from '../economy';
import { pickPoachDestination, worldFighterFromFighter } from '../world/population';
import { interestBand } from '../reputation';
import type { Rng } from '../engine/fightEngine';

const round25 = (n: number) => Math.max(25, Math.round(n / 25) * 25);
const round5 = (n: number) => Math.max(5, Math.round(n / 5) * 5);
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/** What answering a letter does — merged into the save by resolveMail. */
export interface MailResolution {
  next: GameSave;
  /** corkboard line */
  log?: string;
  /** gym ledger line */
  history?: string;
  /** a toast for the moment of decision */
  flash?: string;
}

export interface MailKind {
  kind: string;
  /** cooldown key builder — generation is suppressed while a live or
      recently-answered item shares this key (null = no scoping) */
  scopeKey: (item: MailItem) => string;
  resolve: (save: GameSave, item: MailItem, optionId: string) => MailResolution;
}

/* ------------------------------------------------------------------ */
/* THE BUYOUT LETTER — a rival wants your unhappy man                  */
/* ------------------------------------------------------------------ */

export function draftPoachBuyout(
  save: GameSave,
  entry: RosterEntry,
  year: number,
  today: number,
): MailDraft | null {
  const gym = pickPoachDestination(save.cityId);
  if (!gym) return null;
  const f = entry.fighter;
  const price = round25(
    (150 + f.publicReputation * 15 + (entry.careerEarnings ?? 0) * 0.25) * inflationFactor(year),
  );
  const sweetener = round25(price * 0.4);
  return {
    kind: 'poach-buyout',
    form: 'letter',
    expiresDay: today + 12,
    from: gym.name,
    subject: `They want to buy out ${f.lastName}`,
    body:
      `We won't waste your afternoon. ${fighterFullName(f)} has been seen, and what's been seen is that he isn't happy where he is. ` +
      `We are prepared to pay ${formatMoney(price)} for his contract, cash, no hard feelings either direction. ` +
      `A man trains best where he wants to be. Think it over — the offer keeps until the ${formatMoney(price)} finds another use.`,
    refs: { fighterId: f.id, gymId: gym.id, gymName: gym.name, price, sweetener },
    options: [
      {
        id: 'sell',
        label: 'SELL HIS CONTRACT',
        detail: `${formatMoney(price)} to the bank — he goes to ${gym.name}`,
      },
      {
        id: 'match',
        label: 'RAISE HIS STAKE',
        detail: `${formatMoney(sweetener)} from the bank — he stays, and knows why`,
      },
      {
        id: 'refuse',
        label: 'TELL THEM NO',
        detail: 'costs nothing — settles nothing',
      },
    ],
  };
}

const poachBuyout: MailKind = {
  kind: 'poach-buyout',
  scopeKey: (item) => `poach-buyout:${item.refs.fighterId}`,
  resolve(save, item, optionId) {
    const entry = save.roster.find((e) => e.fighter.id === item.refs.fighterId);
    if (!entry) {
      return { next: save, log: 'The buyout letter refers to a man no longer on the roster.' };
    }
    const f = entry.fighter;
    const name = fighterFullName(f);
    const gymName = String(item.refs.gymName);

    if (optionId === 'sell') {
      const price = Number(item.refs.price);
      return {
        next: {
          ...save,
          money: save.money + price,
          roster: save.roster.filter((e) => e.fighter.id !== f.id),
          world: {
            ...save.world,
            fighters: [
              ...save.world.fighters,
              worldFighterFromFighter(f, String(item.refs.gymId), entry.record),
            ],
          },
        },
        log: `${f.lastName}'s gear was gone by evening. The ${formatMoney(price)} is in the drawer.`,
        history: `You sold ${name}'s contract to ${gymName} for ${formatMoney(price)}.`,
        flash: `${formatMoney(price)} banked. ${f.lastName} fights for ${gymName} now.`,
      };
    }

    if (optionId === 'match') {
      const sweetener = Number(item.refs.sweetener);
      return {
        next: {
          ...save,
          money: save.money - sweetener,
          roster: save.roster.map((e) =>
            e.fighter.id === f.id
              ? {
                  ...e,
                  morale: clamp(e.morale + 10, 0, 100),
                  trust: clamp(e.trust + 10, 0, 100),
                  poachInterest: Math.max(0, e.poachInterest - 45),
                }
              : e,
          ),
        },
        log: `${f.lastName} counted the raise twice and hung his coat back up.`,
        history: `${gymName} came for ${name}. You raised his stake ${formatMoney(sweetener)} and he stayed.`,
        flash: `${f.lastName} stays. It cost ${formatMoney(sweetener)}.`,
      };
    }

    // refuse
    return {
      next: {
        ...save,
        roster: save.roster.map((e) =>
          e.fighter.id === f.id ? { ...e, trust: clamp(e.trust + 3, 0, 100) } : e,
        ),
      },
      log: `Word got back that you told ${gymName} no without blinking. ${f.lastName} heard it too.`,
      flash: `You told ${gymName} no.`,
    };
  },
};

/* ------------------------------------------------------------------ */
/* THE SPARRING LOAN — a contender's camp needs work                   */
/* ------------------------------------------------------------------ */

export function draftSparringLoan(
  save: GameSave,
  entry: RosterEntry,
  year: number,
  today: number,
): MailDraft | null {
  const gym = pickPoachDestination(save.cityId);
  if (!gym) return null;
  const f = entry.fighter;
  const fee = round5((60 + f.publicReputation * 4) * inflationFactor(year));
  return {
    kind: 'sparring-loan',
    form: 'letter',
    expiresDay: today + 7,
    from: gym.name,
    subject: `${gym.name} wants ${f.lastName} for sparring`,
    body:
      `Our man has a date coming and needs rounds against somebody who moves like ${fighterFullName(f)}. ` +
      `One week, good work, no liberties taken. ${formatMoney(fee)} for the gym, and your man sees how a contender's camp is run. ` +
      `Gloves are sixteen ounces and the headgear is ours.`,
    refs: { fighterId: f.id, gymName: gym.name, fee },
    options: [
      {
        id: 'accept',
        label: 'SEND HIM',
        detail: `${formatMoney(fee)} to the bank — a week in a contender's camp`,
      },
      { id: 'decline', label: 'KEEP HIM HOME', detail: 'his week stays yours' },
    ],
  };
}

const sparringLoan: MailKind = {
  kind: 'sparring-loan',
  scopeKey: (item) => `sparring-loan:${item.refs.fighterId}`,
  resolve(save, item, optionId) {
    const entry = save.roster.find((e) => e.fighter.id === item.refs.fighterId);
    if (!entry) {
      return { next: save, log: 'The sparring request refers to a man no longer on the roster.' };
    }
    const f = entry.fighter;
    const gymName = String(item.refs.gymName);

    if (optionId === 'accept') {
      const fee = Number(item.refs.fee);
      // deterministic wear: a seeded coin from save identity, not Math.random
      const roughWeek = (save.seed + item.arrivedDay + f.id.length) % 5 === 0;
      return {
        next: {
          ...save,
          money: save.money + fee,
          roster: save.roster.map((e) =>
            e.fighter.id === f.id
              ? {
                  ...e,
                  fighter: {
                    ...f,
                    attributes: {
                      ...f.attributes,
                      defense: clamp(f.attributes.defense + 0.3, 1, 99),
                      ringIq: clamp(f.attributes.ringIq + 0.3, 1, 99),
                    },
                  },
                  restUntil: roughWeek ? save.dayCount + 4 : e.restUntil,
                  morale: clamp(e.morale + 2, 0, 100),
                }
              : e,
          ),
        },
        log: roughWeek
          ? `${f.lastName} came back from ${gymName} smarter and with a mouse under his eye. A few days' rest.`
          : `${f.lastName} came back from ${gymName} with better habits and the fee in an envelope.`,
        history: `You loaned ${fighterFullName(f)} to ${gymName} for sparring.`,
        flash: `${formatMoney(fee)} banked. ${f.lastName} learned something.`,
      };
    }

    return {
      next: save,
      log: `You kept ${f.lastName} home. ${gymName} found their rounds elsewhere.`,
      flash: `${f.lastName} stays home.`,
    };
  },
};

/* ------------------------------------------------------------------ */
/* THE EQUIPMENT LETTER — the neighborhood asks (era channel proof)    */
/* ------------------------------------------------------------------ */

const equipmentLetter: MailKind = {
  kind: 'equipment-letter',
  scopeKey: () => 'equipment-letter',
  resolve(save, item, optionId) {
    const cost = Number(item.refs.cost ?? 40);
    if (optionId === 'donate') {
      return {
        next: {
          ...save,
          money: save.money - cost,
          roster: save.roster.map((e) => ({ ...e, morale: clamp(e.morale + 2, 0, 100) })),
        },
        log: 'The old bags and wraps went to the boys’ league. The floor approved.',
        history: `You gave the neighborhood league your old equipment and ${formatMoney(cost)} for new laces.`,
        flash: 'The old equipment went to the kids.',
      };
    }
    return {
      next: save,
      log: 'The boys’ league letter went in the drawer. Maybe next season.',
    };
  },
};

/* ------------------------------------------------------------------ */

export const MAIL_KINDS: Record<string, MailKind> = {
  'poach-buyout': poachBuyout,
  'sparring-loan': sparringLoan,
  'equipment-letter': equipmentLetter,
};

/** Interest band 3 is the buyout threshold — the letter arrives before the
    silent walk-out would. */
export function buyoutEligible(entry: RosterEntry): boolean {
  return entry.hasLocker && interestBand(entry.poachInterest) >= 3;
}

export function sparringEligible(entry: RosterEntry, dayCount: number): boolean {
  return (
    entry.hasLocker &&
    entry.fighter.publicReputation >= 8 &&
    (entry.restUntil ?? 0) <= dayCount &&
    entry.record.wins + entry.record.losses + entry.record.draws >= 2
  );
}

/** ids drawn from the day's seeded stream */
export function mailId(rng: Rng, day: number): string {
  return `ml_${Math.floor(rng() * 1e9).toString(36)}_${day}`;
}
