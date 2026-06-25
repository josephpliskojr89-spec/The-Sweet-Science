/*
  Scouting
  --------------------------------------------------------------------------
  How a lockerless man reads when you haven't committed to him. A fighter
  without a locker is a trialist, not yet "yours" — you don't get precise
  numbers on him, only a coach's hedged eye: vague bands, and a confidence
  that's low while he's new. Precise ratings unlock when you give him a locker.

  This is the anti-exploit layer (bible: Lockerless Fighters). It doesn't stop
  you scouting; it stops you reading exact stats off a man you've risked nothing
  on, then keeping the good and dumping the rest.

  Also here: the trialist's patience flavor — the only window you get onto the
  hidden clock that decides when he stops waiting for a gym that wants him.
*/

/** Days a trialist must be around before you can read him at all. Below this,
    attributes show "Too early to tell." */
export const SCOUT_CONFIDENCE_DAYS = 14;

export interface ScoutBand {
  /** Coarse qualitative read, or null when it's too early to tell. */
  label: string | null;
  /** 0..1 hedged gauge fill — a band's middle, never an exact width. */
  fill: number;
}

const BANDS: { max: number; label: string }[] = [
  { max: 28, label: 'Raw' },
  { max: 42, label: 'Below average' },
  { max: 57, label: 'Average' },
  { max: 70, label: 'Promising' },
  { max: 83, label: 'Impressive' },
  { max: Infinity, label: 'Exceptional' },
];

/**
 * A lockerless attribute read. `tenureDays` is how long he's been around — too
 * new and you genuinely can't tell. The fill is the band's centre, so a 62 and
 * a 70 draw identical: you can't min-max a man you haven't committed to.
 */
export function scoutingBand(value: number, tenureDays: number): ScoutBand {
  if (tenureDays < SCOUT_CONFIDENCE_DAYS) return { label: null, fill: 0 };
  const idx = BANDS.findIndex((b) => value <= b.max);
  const i = idx === -1 ? BANDS.length - 1 : idx;
  // Centre of the band on a 0..6 scale → hedged fill.
  return { label: BANDS[i].label, fill: (i + 0.5) / BANDS.length };
}

/**
 * Flavor for the trialist's hidden patience — never a number, never a meter.
 * The only signal you get that he's getting restless. Tuned against the patience
 * clock in game/departures.ts (starts ~80–150 days, drains ~1/day).
 */
export function patienceFlavor(trialPatience: number): string {
  if (trialPatience > 110) return 'He seems content to keep working for now.';
  if (trialPatience > 65) return 'He’s settled into the gym, but he’s watching how things go.';
  if (trialPatience > 32) return 'He watches the lockered men with something in his eyes.';
  if (trialPatience > 14) return 'He’s started asking around about a locker.';
  return 'He may not wait much longer for a gym that wants him.';
}
