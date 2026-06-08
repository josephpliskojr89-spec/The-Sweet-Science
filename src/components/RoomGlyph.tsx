/*
  RoomGlyph
  --------------------------------------------------------------------------
  A small inked icon for each room door, in the same minimal vintage line
  style as the gloves emblem. currentColor-driven so it picks up amber on
  hover from the door styles.
*/

import type { RoomKey } from '../state/GameContext';

interface Props {
  room: RoomKey;
  size?: number;
}

export function RoomGlyph({ room, size = 40 }: Props) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 48 48',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };

  switch (room) {
    case 'office': // desk lamp over a ledger
      return (
        <svg {...common}>
          <path d="M14 40h20" />
          <path d="M24 40v-8" />
          <path d="M24 32h-7l-3-12" />
          <path d="M11 20a3 3 0 0 1 6 0z" />
          <path d="M17 20l9-9" />
          <circle cx="28" cy="9" r="2.5" />
          <rect x="27" y="33" width="13" height="7" rx="1" />
        </svg>
      );
    case 'calendar': // wall calendar
      return (
        <svg {...common}>
          <rect x="9" y="11" width="30" height="28" rx="2" />
          <path d="M9 19h30" />
          <path d="M16 8v6M32 8v6" />
          <path d="M15 26h4M22 26h4M29 26h4M15 32h4M22 32h4" />
        </svg>
      );
    case 'gym': // heavy bag
      return (
        <svg {...common}>
          <path d="M24 6v6" />
          <path d="M19 12h10" />
          <rect x="18" y="12" width="12" height="26" rx="6" />
          <path d="M18 20h12M18 27h12" />
        </svg>
      );
    case 'locker': // lockers
      return (
        <svg {...common}>
          <rect x="11" y="8" width="11" height="32" rx="1" />
          <rect x="26" y="8" width="11" height="32" rx="1" />
          <path d="M18 14v3M33 14v3" />
          <path d="M14 24h2M29 24h2" />
        </svg>
      );
  }
}
