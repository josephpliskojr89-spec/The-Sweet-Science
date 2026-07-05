/*
  Seeded imperfection
  --------------------------------------------------------------------------
  Every crooked thing in the building is crooked the same way forever.
  Wear and tilt are deterministic per entity id — a re-render must reproduce
  the identical scene; random-per-mount jitter is banned (DESIGN-BIBLE,
  Imperfection Rules). Never applied to numeric columns or compared data.
*/

import type { CSSProperties } from 'react';

/** FNV-1a — cheap, stable string hash. */
export function hashSeed(id: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Deterministic float in [0, 1) — `slot` picks independent channels. */
export function seedFloat(id: string, slot = 0): number {
  const h = hashSeed(`${id}#${slot}`);
  return h / 0x100000000;
}

/** Deterministic float in [min, max). */
export function seedRange(id: string, min: number, max: number, slot = 0): number {
  return min + seedFloat(id, slot) * (max - min);
}

/** True for roughly `chance` of ids (e.g. the 1-in-4 coffee-ring sheets). */
export function seedChance(id: string, chance: number, slot = 0): boolean {
  return seedFloat(id, slot) < chance;
}

/**
 * CSS custom props for the .p-tilt utility (typed as CSSProperties so it
 * drops straight into a style prop).
 * Document plane: rotation capped at ±2°, drift at 6px.
 * Set dressing may pass maxRot up to 3.
 */
export function paperTilt(id: string, maxRot = 2, maxDrift = 6): CSSProperties {
  return {
    '--seed-rot': `${seedRange(id, -maxRot, maxRot, 1).toFixed(2)}deg`,
    '--seed-dx': `${seedRange(id, -maxDrift, maxDrift, 2).toFixed(1)}px`,
    '--seed-dy': `${seedRange(id, -maxDrift, maxDrift, 3).toFixed(1)}px`,
  } as CSSProperties;
}
