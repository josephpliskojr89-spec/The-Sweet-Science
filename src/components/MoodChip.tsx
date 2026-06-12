/*
  MoodChip
  --------------------------------------------------------------------------
  A one-word read on how a fighter feels about being in your gym. Qualitative
  by design — the player feels the fallout of locker decisions without a number
  to min-max against.
*/

import { moodLabel } from '../game/relationship';
import type { RosterEntry } from '../game/roster';
import './MoodChip.css';

export function MoodChip({ entry }: { entry: RosterEntry }) {
  const mood = moodLabel(entry);
  return <span className={`mood mood--${mood.tone}`} title="His mood in the gym">{mood.label}</span>;
}
