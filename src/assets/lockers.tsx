/*
  Locker Door Asset Registry
  --------------------------------------------------------------------------
  The seam where real locker art replaces the placeholder. The Locker Room wall
  asks here for a door (occupied / empty) and overlays its own content — name
  tape, portrait, status glyphs — ON TOP. So when a locker-art package is
  delivered, point LOCKER_ART at the images and return them here; the overlays
  and everything else stay identical. Same contract as backgrounds/portraits.

  Until then, a procedural weathered-metal door, stretched to fill its cell.
*/

import { useId } from 'react';

export type LockerVariant = 'occupied' | 'empty';

/** Optional real-art paths, by variant. Empty until a package is delivered. */
const LOCKER_ART: Partial<Record<LockerVariant, string>> = {
  // occupied: '/lockers/closed.png',
  // empty: '/lockers/open.png',
};

interface Props {
  variant: LockerVariant;
  /** Tier accent for the top stripe (hierarchy at a glance). */
  accent?: string;
}

export function LockerDoorArt({ variant, accent }: Props) {
  const real = LOCKER_ART[variant];
  if (real) {
    return (
      <img className="layer" src={real} alt="" aria-hidden="true"
        style={{ objectFit: 'fill', width: '100%', height: '100%' }} />
    );
  }
  return <ProceduralDoor variant={variant} accent={accent} />;
}

function ProceduralDoor({ variant, accent }: Props) {
  const uid = useId().replace(/:/g, '');
  const metal = `lk-metal-${uid}`;
  const grain = `lk-grain-${uid}`;
  const empty = variant === 'empty';

  return (
    <svg className="layer" viewBox="0 0 100 162" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={metal} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={empty ? '#171a16' : '#3b4239'} />
          <stop offset="45%" stopColor={empty ? '#101310' : '#2c322a'} />
          <stop offset="100%" stopColor={empty ? '#0a0c0a' : '#1c201a'} />
        </linearGradient>
        <filter id={grain}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer><feFuncA type="linear" slope="0.07" /></feComponentTransfer>
        </filter>
      </defs>

      {/* Door body */}
      <rect x="3" y="2" width="94" height="158" rx="3" fill={`url(#${metal})`} stroke="#0a0c0a" strokeWidth="2" />
      {/* Inner bevel */}
      <rect x="7" y="6" width="86" height="150" rx="2" fill="none" stroke="#000" strokeOpacity="0.4" strokeWidth="1" />
      <rect x="7" y="6" width="86" height="150" rx="2" fill="none" stroke={empty ? '#2a2f28' : '#525a4c'} strokeOpacity="0.35" strokeWidth="1" transform="translate(-1 -1)" />

      {/* Tier accent stripe (top) */}
      {accent && !empty && <rect x="7" y="6" width="86" height="5" rx="1" fill={accent} opacity="0.85" />}

      {/* Vent slats near the top */}
      {[20, 27, 34].map((y) => (
        <rect key={y} x="24" y={y} width="52" height="3" rx="1.5" fill="#000" fillOpacity="0.55" />
      ))}

      {/* Latch / handle on the right */}
      <rect x="83" y="70" width="6" height="34" rx="3" fill={empty ? '#23271f' : '#4a5044'} stroke="#0a0c0a" strokeWidth="1" />
      <circle cx="86" cy="104" r="2.4" fill="#0a0c0a" />

      {/* Empty: door ajar — a dark gap down the hinge edge + interior shadow */}
      {empty && (
        <>
          <rect x="3" y="2" width="13" height="158" rx="3" fill="#000" fillOpacity="0.55" />
          <line x1="16" y1="4" x2="16" y2="158" stroke="#000" strokeOpacity="0.7" strokeWidth="2" />
        </>
      )}

      {/* Rust / wear */}
      <ellipse cx="20" cy="140" rx="14" ry="20" fill="#5a3a22" opacity="0.16" />
      <ellipse cx="88" cy="120" rx="8" ry="22" fill="#5a3a22" opacity="0.12" />

      {/* Grain wash */}
      <rect x="3" y="2" width="94" height="158" rx="3" filter={`url(#${grain})`} opacity="0.5" />
    </svg>
  );
}
