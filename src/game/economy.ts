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
import { coachMonthlySalaryBase, type Coach } from './coaches';
import {
  nextCostBase,
  levelUpkeepBase,
  totalUpkeepBase,
  type Upgrades,
  type UpgradeKey,
} from './upgrades';

/** A man opening a gym in 1975 with some savings behind him. Tight, not poor. */
export const STARTING_MONEY = 2200;

const BASE_RENT = 80; // monthly, 1975 dollars — a small local gym's storefront
const BASE_UTILITIES = 30;
const INFLATION_RATE = 1.06; // ~6%/yr compounding — era-appropriate

/** Dollar multiplier for a given year (1975 = 1.0). */
export function inflationFactor(year: number): number {
  return Math.pow(INFLATION_RATE, Math.max(0, year - 1975));
}

/** Inflated cost to buy a track's next level in `year`. Null when maxed. */
export function upgradeCost(key: UpgradeKey, level: number, year: number): number | null {
  const base = nextCostBase(key, level);
  return base === null ? null : Math.round(base * inflationFactor(year));
}

/** Inflated monthly upkeep the next level of a track adds, in `year`. */
export function upgradeNextUpkeep(key: UpgradeKey, year: number): number {
  return Math.round(levelUpkeepBase(key) * inflationFactor(year));
}

/** A coach's monthly salary in `year` dollars. */
export function coachMonthlySalary(coach: Coach, year: number): number {
  return Math.round(coachMonthlySalaryBase(coach) * inflationFactor(year));
}

export interface MonthlySummary {
  duesIncome: number;
  /** Base rent + utilities. */
  overheadBase: number;
  /** Added monthly cost of expanded facilities (upgrades). */
  facilitiesUpkeep: number;
  /** Total overhead (base + facilities). */
  overhead: number;
  coachSalaries: number;
  net: number;
  payingCount: number;
  brokeCount: number;
}

/** The month's books for the current roster + gym, in that year's dollars. */
export function monthlySummary(
  roster: RosterEntry[],
  upgrades: Upgrades,
  coaches: Coach[],
  year: number,
): MonthlySummary {
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
  const overheadBase = Math.round((BASE_RENT + BASE_UTILITIES) * inf);
  const facilitiesUpkeep = Math.round(totalUpkeepBase(upgrades) * inf);
  const overhead = overheadBase + facilitiesUpkeep;
  const coachSalaries = Math.round(
    coaches.reduce((s, c) => s + coachMonthlySalaryBase(c), 0) * inf,
  );

  return {
    duesIncome,
    overheadBase,
    facilitiesUpkeep,
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
