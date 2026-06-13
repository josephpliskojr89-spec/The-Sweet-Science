/*
  Economy
  --------------------------------------------------------------------------
  Money is a bottleneck and a tool, not the point of the game. The model is
  deliberately lean: dues come in, overhead goes out, settled monthly. All
  figures are 1975 dollars at the base and inflated by year, so a 1985 gym
  deals in meaningfully larger numbers than a 1975 one (bible: Finances).

  Early on dues don't quite cover the rent — that's historically true of small
  gyms, and it's why fight purses (Phase 8) matter. The player's starting cash
  is the runway to get there. Coach salaries and fight expenses join the ledger
  as those systems land.

  Pure: reads roster + year, returns figures. The context settles and persists.
*/

import type { RosterEntry } from './roster';

/** A man opening a gym in 1975 with some savings behind him. Tight, not poor. */
export const STARTING_MONEY = 3000;

const BASE_RENT = 120; // monthly, 1975 dollars
const BASE_UTILITIES = 40;
const INFLATION_RATE = 1.06; // ~6%/yr compounding — era-appropriate

/** Dollar multiplier for a given year (1975 = 1.0). */
export function inflationFactor(year: number): number {
  return Math.pow(INFLATION_RATE, Math.max(0, year - 1975));
}

export interface MonthlySummary {
  duesIncome: number;
  overhead: number;
  coachSalaries: number;
  net: number;
  payingCount: number;
  brokeCount: number;
}

/** The month's books for the current roster, in that year's dollars. */
export function monthlySummary(roster: RosterEntry[], year: number): MonthlySummary {
  const inf = inflationFactor(year);

  let dues = 0;
  let paying = 0;
  let broke = 0;
  for (const e of roster) {
    const base = e.fighter.baseDues;
    if (base > 0) {
      // Locker holders pay full; provisional men pay a reduced share.
      dues += base * (e.hasLocker ? 1 : 0.5);
      paying += 1;
    } else {
      broke += 1;
    }
  }

  const duesIncome = Math.round(dues * inf);
  const overhead = Math.round((BASE_RENT + BASE_UTILITIES) * inf);
  const coachSalaries = 0; // joins the books when coaches are hired

  return {
    duesIncome,
    overhead,
    coachSalaries,
    net: duesIncome - overhead - coachSalaries,
    payingCount: paying,
    brokeCount: broke,
  };
}

/** One settled month, recorded in the books. */
export interface FinanceEntry {
  dayCount: number;
  label: string; // "March 1975"
  duesIncome: number;
  overhead: number;
  coachSalaries: number;
  net: number;
  balance: number;
}

/** "$3,000" / "−$40" — period-plain money formatting. */
export function formatMoney(n: number): string {
  const sign = n < 0 ? '−' : '';
  return `${sign}$${Math.abs(Math.round(n)).toLocaleString('en-US')}`;
}
