/*
  Game Clock
  --------------------------------------------------------------------------
  Time is a first-class system in The Sweet Science — the bible's reference
  point is Football Manager's day/week/month flow. Phase 1 only needs the
  clock itself and the controls that move it; nothing happens on advance yet.
  Walk-ins, camps, and fights hook into `advance()` in later phases.

  The clock is a plain day-count since a fixed 1975 epoch. Keeping it as an
  integer (not a JS Date in state) makes saves stable and math trivial. We
  only touch Date for human-readable formatting.
*/

/** The game opens here. A Monday in early spring, 1975. */
export const START_EPOCH = { year: 1975, month: 2, day: 3 } as const; // month is 0-based (March)

const startDate = new Date(START_EPOCH.year, START_EPOCH.month, START_EPOCH.day);

export type TimeStep = 'day' | 'week';

export const TIME_STEP_DAYS: Record<TimeStep, number> = {
  day: 1,
  week: 7,
};

/** Advance a day-count by a step. Pure — returns the new count. */
export function advance(dayCount: number, step: TimeStep): number {
  return dayCount + TIME_STEP_DAYS[step];
}

function toDate(dayCount: number): Date {
  const d = new Date(startDate);
  d.setDate(d.getDate() + dayCount);
  return d;
}

const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export interface FormattedDate {
  weekday: string;
  month: string;
  day: number;
  year: number;
  /** "Monday, March 3, 1975" */
  full: string;
  /** "Mar 3 ’75" — compact, for tight chrome. */
  compact: string;
}

export function formatDate(dayCount: number): FormattedDate {
  const d = toDate(dayCount);
  const weekday = WEEKDAYS[d.getDay()];
  const month = MONTHS[d.getMonth()];
  const day = d.getDate();
  const year = d.getFullYear();
  return {
    weekday,
    month,
    day,
    year,
    full: `${weekday}, ${month} ${day}, ${year}`,
    compact: `${month.slice(0, 3)} ${day} ’${String(year).slice(2)}`,
  };
}

/** A loose season label for atmosphere in the chrome. */
export function seasonOf(dayCount: number): string {
  const m = toDate(dayCount).getMonth();
  if (m <= 1 || m === 11) return 'Winter';
  if (m <= 4) return 'Spring';
  if (m <= 7) return 'Summer';
  return 'Autumn';
}
