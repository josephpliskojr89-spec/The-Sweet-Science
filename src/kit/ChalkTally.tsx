/*
  ChalkTally — a count as visible evidence
  --------------------------------------------------------------------------
  Chalk tally strokes in five-gates, ALWAYS equal to the count (DESIGN-BIBLE
  A11: evidence that lies is worse than a badge), with the numeral chalked
  beside them as the redundant fast read. Strokes get seeded jitter; the
  numeral sits at 0°. Drawn strokes, not a font.
*/

import type { ReactNode } from 'react';

import { seedRange } from './seed';

export function ChalkTally({ count, seedId }: { count: number; seedId: string }) {
  const gates = Math.floor(count / 5);
  const rest = count % 5;
  const strokes: ReactNode[] = [];
  let x = 4;
  const stroke = (key: string, x1: number, y1: number, x2: number, y2: number, w = 2) => (
    <line
      key={key}
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke="var(--chalk)"
      strokeWidth={w}
      strokeLinecap="round"
    />
  );
  for (let g = 0; g < gates; g++) {
    for (let i = 0; i < 4; i++) {
      const id = `${seedId}g${g}i${i}`;
      const jx = seedRange(id, -1, 1, 0);
      const jy = seedRange(id, -1.5, 1.5, 1);
      strokes.push(stroke(id, x + jx, 4 + jy, x + jx + seedRange(id, -1.5, 1.5, 2), 20 + jy));
      x += 7;
    }
    // the gate — a diagonal through the four
    const gid = `${seedId}gate${g}`;
    strokes.push(stroke(gid, x - 31, 16 + seedRange(gid, -1, 1, 0), x - 2, 7 + seedRange(gid, -1, 1, 1), 2.4));
    x += 8;
  }
  for (let i = 0; i < rest; i++) {
    const id = `${seedId}r${i}`;
    const jx = seedRange(id, -1, 1, 0);
    strokes.push(stroke(id, x + jx, 4, x + jx + seedRange(id, -1.5, 1.5, 2), 20));
    x += 7;
  }
  const width = Math.max(x + 4, 12);
  return (
    <svg
      className="chalk-tally"
      width={width}
      height={24}
      viewBox={`0 0 ${width} 24`}
      aria-hidden="true"
    >
      {strokes}
    </svg>
  );
}
