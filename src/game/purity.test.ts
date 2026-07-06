/*
  The layering law, enforced: src/game is the simulation — it must never
  import React or reach into the UI layers, and it may take only TYPES from
  src/state (the save shape), never values. This keeps every system
  headless-testable and the tick pure by construction.
*/

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const GAME = new URL('.', import.meta.url).pathname;

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (/\.tsx?$/.test(name) && !/\.test\.tsx?$/.test(name)) out.push(p);
  }
  return out;
}

describe('game/ purity', () => {
  const files = walk(GAME);

  it('finds the simulation modules', () => {
    expect(files.length).toBeGreaterThan(20);
  });

  it('never imports React or the UI layers', () => {
    const offenders: string[] = [];
    for (const f of files) {
      const src = readFileSync(f, 'utf8');
      if (
        /from\s+['"]react/.test(src) ||
        /from\s+['"][^'"]*\/(screens|rooms|components|kit|assets)\//.test(src)
      ) {
        offenders.push(f.replace(GAME, 'game/'));
      }
    }
    expect(offenders, `UI imports inside the simulation: ${offenders.join(', ')}`).toEqual([]);
  });

  it('takes only types from src/state, never values', () => {
    const offenders: string[] = [];
    for (const f of files) {
      const src = readFileSync(f, 'utf8');
      for (const m of src.matchAll(/^import\s+(type\s+)?\{[^}]*\}\s+from\s+['"][^'"]*\/state\/[^'"]*['"]/gms)) {
        const isTypeOnly =
          m[1] !== undefined ||
          // `import { type A, type B } from ...` — every specifier type-marked
          m[0]
            .slice(m[0].indexOf('{') + 1, m[0].indexOf('}'))
            .split(',')
            .every((spec) => spec.trim() === '' || spec.trim().startsWith('type '));
        if (!isTypeOnly) offenders.push(f.replace(GAME, 'game/'));
      }
    }
    expect(offenders, `value imports from state: ${offenders.join(', ')}`).toEqual([]);
  });
});
