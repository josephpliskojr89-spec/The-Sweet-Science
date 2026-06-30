/*
  The Ceiling Read
  --------------------------------------------------------------------------
  A coach's gut feeling about how far a fighter might go — his upside, never his
  number. Like the First Impression, it's intuition, not information: drawn from
  his hidden ceiling but deliberately hedged and sometimes a band off, so a
  sleeper can read ordinary and a dead end can flatter you. You can't farm exact
  potential from it; you can only get a feeling, and feelings lie.

  Generated once at signing and stored (it's a first read, not a live gauge), so
  it stays put as the man develops — the way a scout's first note on a kid does.
*/

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)];

/** Five upside bands, weak to special. */
const BAND_LINES: string[][] = [
  // 0 — filler
  [
    'Bodies in the gym have their place. You don’t see a future in this one.',
    'He came here to train. That doesn’t mean he’s going anywhere.',
    'Heart, maybe. A ceiling, not so much.',
    'You’ve seen a hundred like him. Most don’t last a year.',
  ],
  // 1 — limited
  [
    'He is, more or less, what he is — an honest pro, and about capped.',
    'What you see is mostly what you’ll get with this one.',
    'Willing enough, but there isn’t much room above where he stands.',
    'He’ll help fill out a card. Don’t go looking for the marquee.',
  ],
  // 2 — solid
  [
    'There’s a useful fighter in here — nothing flashy, but useful.',
    'Bring him along and he could earn his keep on an undercard.',
    'Honest tools. No world-beater, but no embarrassment either.',
    'A middling ceiling, but a man can do worse than dependable.',
  ],
  // 3 — real upside
  [
    'There’s a real fighter in there somewhere, if it all comes together.',
    'He’s got more in him than most who come through that door.',
    'Handled right, he could surprise some people down the line.',
    'Something about him says he isn’t close to finished growing.',
  ],
  // 4 — special
  [
    'Every so often one walks in who makes you sit up. This might be one.',
    'There’s a ceiling here you can’t quite see the top of.',
    'If even half of what you think you’re seeing is real, he’s special.',
    'You’ve been at this a long time. You don’t see this often.',
  ],
];

function bandFor(potential: number): number {
  if (potential >= 78) return 4;
  if (potential >= 66) return 3;
  if (potential >= 54) return 2;
  if (potential >= 42) return 1;
  return 0;
}

/**
 * A hedged, fallible read on a fighter's ceiling. ~30% of the time the read
 * lands a band high or low — hope or doubt coloring the eye — so it hints
 * without telling. Call once at signing and store the result.
 */
export function generateCeilingRead(potential: number): string {
  let band = bandFor(potential);
  const r = Math.random();
  if (r < 0.15) band = clamp(band + 1, 0, 4); // over-read — hope
  else if (r < 0.3) band = clamp(band - 1, 0, 4); // under-read — doubt
  return pick(BAND_LINES[band]);
}
