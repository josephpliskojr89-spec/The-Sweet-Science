/*
  Portrait Registry
  --------------------------------------------------------------------------
  The seam where a commissioned manager illustration replaces the procedural
  one. Consumers ask here for a portrait given Appearance params; they never
  reference ManagerPortrait directly. When real art arrives — as layered files
  or a parameter-indexed sheet — resolve it here and return that instead. The
  Appearance contract stays identical.
*/

import type { Appearance } from '../game/appearance';
import { ManagerPortrait } from '../components/Portrait/ManagerPortrait';

interface Props {
  appearance: Appearance;
  size?: number;
  className?: string;
}

export function Portrait({ appearance, size, className }: Props) {
  // TODAY: always procedural. LATER: branch to real art keyed by appearance.
  return <ManagerPortrait appearance={appearance} size={size} className={className} />;
}
