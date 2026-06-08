/*
  Background Registry
  --------------------------------------------------------------------------
  The seam where real art replaces placeholders. The whole app asks this
  registry for a region's gym background; it does not know or care whether the
  result is a procedural SVG or a commissioned painting.

  TODAY:  every region resolves to the procedural <RegionalGymBackground/>.
  LATER:  drop a file into /public (e.g. /backgrounds/northeast.jpg), point the
          region's entry at it, and return an <img>/painted layer instead. No
          consumer changes — the slot and its RegionKey stay identical.
*/

import type { RegionKey } from '../game/regions';
import { getRegion } from '../game/regions';
import { RegionalGymBackground } from '../components/RegionalGymBackground';

/** Optional real-asset paths, keyed by region. Empty until art is delivered. */
const REAL_BACKGROUNDS: Partial<Record<RegionKey, string>> = {
  // northeast: '/backgrounds/northeast.jpg',
};

export function GymBackground({ region }: { region: RegionKey }) {
  const realSrc = REAL_BACKGROUNDS[region];
  if (realSrc) {
    return (
      <img
        className="layer"
        src={realSrc}
        alt=""
        aria-hidden="true"
        style={{ objectFit: 'cover', width: '100%', height: '100%' }}
      />
    );
  }
  return <RegionalGymBackground region={getRegion(region)} />;
}
