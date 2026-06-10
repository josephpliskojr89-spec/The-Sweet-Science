/*
  TraitChip
  --------------------------------------------------------------------------
  A known personality trait, shown as a small worn tag with its blurb on hover.
  Only ever used for traits the player has actually learned — hidden traits
  never reach the UI until pressure reveals them.
*/

import { TRAITS, type TraitKey } from '../game/traits';
import './TraitChip.css';

export function TraitChip({ trait }: { trait: TraitKey }) {
  const t = TRAITS[trait];
  return (
    <span className="trait-chip" title={t.blurb}>
      {t.name}
    </span>
  );
}
