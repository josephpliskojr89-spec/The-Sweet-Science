/*
  Derived gym qualities the tick reads each advance.
*/

import type { GameSave } from '../../state/persistence';
import { gymReputation } from '../reputation';

/** Gym reputation 0..1 — how known/regarded your gym is (game/reputation.ts),
    less any penalty from ruthless cuts. Drives the walk-in draw; ≈0 for a new
    gym, earned as your men make names. */
export function reputationFor(save: GameSave): number {
  return Math.max(0, Math.min(1, gymReputation(save.roster) + save.reputationMod));
}

/** Reputation-driven quality of the walk-in pool. A respected gym draws better
    men; a new gym draws raw ones (floor near the old constant 0.2). */
export function qualityFor(save: GameSave): number {
  return Math.max(0.18, Math.min(0.8, 0.18 + reputationFor(save) * 0.5));
}
