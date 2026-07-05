/*
  Stamp — the Property Kit's chip/badge replacement
  --------------------------------------------------------------------------
  A rubber stamp: word + border, eroded inking, FIXED ink color and angle per
  CATEGORY (scannable down a roster), seeded ±1° wobble per instance (still
  ink, not an icon). Meaning is carried by the word and border shape, never
  hue alone. Wordings come from the canonical stamp inventory (DESIGN-BIBLE
  A7) — the owner ordered these from a stamp shop once; he doesn't own a
  stamp for every sentence.
*/

import { seedRange } from './seed';
import './kit.css';

/** ink + base angle per category — fixed so columns scan pre-attentively */
const CATEGORIES = {
  /** career trajectory — red, −2° */
  trajectory: { ink: 'var(--ink-stamp-red)', angle: -2 },
  /** mood/state — blue-black, 0° */
  mood: { ink: 'var(--ink-ribbon)', angle: 0 },
  /** scouting/assessment — violet (mimeograph), +1.5° */
  scouting: { ink: 'var(--ink-stamp-violet)', angle: 1.5 },
  /** money — red, −2° (PAID, PAST DUE, OVERDRAWN) */
  money: { ink: 'var(--ink-stamp-red)', angle: -2 },
} as const;

export type StampCategory = keyof typeof CATEGORIES;

export function Stamp({
  word,
  category,
  seedId,
  size = 'md',
}: {
  word: string;
  category: StampCategory;
  /** entity id — wobble is deterministic, the same forever */
  seedId: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const cat = CATEGORIES[category];
  const wobble = seedRange(seedId + word, -1, 1, 4);
  return (
    <span
      className={`stamp stamp--${size}`}
      style={{
        color: cat.ink,
        borderColor: cat.ink,
        transform: `rotate(${(cat.angle + wobble).toFixed(2)}deg)`,
      }}
    >
      {word}
    </span>
  );
}
