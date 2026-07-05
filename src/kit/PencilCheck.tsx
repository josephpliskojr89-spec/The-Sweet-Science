/*
  PencilCheck — a graphite check with seeded wobble.
  The mark a 1975 hand leaves on a printed checklist. Deterministic per
  seed id, wobbled through the shared #pencil-wobble filter.
*/

import { seedRange } from './seed';

export function PencilCheck({ seedId }: { seedId: string }) {
  const j = seedRange(seedId, -1.5, 1.5, 5);
  return (
    <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true">
      <path
        d={`M 2.5 ${8.5 + j} L 6.5 ${12.5 + j / 2} L 13.5 ${2.5 - j / 2}`}
        stroke="var(--ink-graphite)"
        strokeWidth="2.4"
        fill="none"
        strokeLinecap="round"
        filter="url(#pencil-wobble)"
      />
    </svg>
  );
}
