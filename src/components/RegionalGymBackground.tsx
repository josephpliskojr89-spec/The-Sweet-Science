/*
  RegionalGymBackground
  --------------------------------------------------------------------------
  A procedural, parameter-driven placeholder for the four regional gym
  background assets. It paints a dark gym interior — high windows, a hanging
  ring, a heavy bag, a desk lamp throwing amber across the floor — tinted by
  the active region's palette.

  ASSET REPLACEMENT CONTRACT
  This component is the *slot*. When real background art is delivered, the
  background registry (see assets/backgrounds.ts) returns an <img>/painted
  layer for a region instead of this SVG, and nothing else in the app changes.
  Everything that renders the gym floor asks the registry for a background by
  RegionKey — never for this component directly.
*/

import type { Region } from '../game/regions';

interface Props {
  region: Region;
}

export function RegionalGymBackground({ region }: Props) {
  const p = region.palette;
  // Stable per-region ids so multiple instances don't collide.
  const id = (suffix: string) => `bg-${region.key}-${suffix}`;

  return (
    <svg
      className="layer"
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      role="presentation"
    >
      <defs>
        {/* Ambient wall gradient — dark, warm at the floor */}
        <linearGradient id={id('wall')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#000000" />
          <stop offset="42%" stopColor={p.wall} />
          <stop offset="100%" stopColor={p.floor} />
        </linearGradient>

        {/* Window light shafts */}
        <linearGradient id={id('shaft')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={p.daylight} stopOpacity="0.5" />
          <stop offset="100%" stopColor={p.daylight} stopOpacity="0" />
        </linearGradient>

        {/* The desk-lamp pool of warmth */}
        <radialGradient id={id('lamp')} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={p.lamp} stopOpacity="0.85" />
          <stop offset="45%" stopColor={p.lamp} stopOpacity="0.28" />
          <stop offset="100%" stopColor={p.lamp} stopOpacity="0" />
        </radialGradient>

        {/* Floorboard sheen */}
        <linearGradient id={id('floor')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={p.floor} />
          <stop offset="100%" stopColor="#0a0705" />
        </linearGradient>

        {/* Aged paper / film grain */}
        <filter id={id('grain')}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="2"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.06" />
          </feComponentTransfer>
        </filter>
      </defs>

      {/* Back wall */}
      <rect x="0" y="0" width="1600" height="900" fill={`url(#${id('wall')})`} />

      {/* High windows with light shafts spilling down */}
      {[180, 470, 760, 1050, 1340].map((x, i) => (
        <g key={i}>
          <rect
            x={x}
            y={70}
            width={150}
            height={120}
            rx="4"
            fill={p.daylight}
            opacity={0.16}
          />
          <rect x={x} y={70} width={150} height={120} rx="4" fill="none" stroke="#000" strokeOpacity="0.5" strokeWidth="6" />
          <line x1={x + 75} y1={70} x2={x + 75} y2={190} stroke="#000" strokeOpacity="0.4" strokeWidth="4" />
          <polygon
            points={`${x},190 ${x + 150},190 ${x + 260},620 ${x - 110},620`}
            fill={`url(#${id('shaft')})`}
            opacity={0.5}
          />
        </g>
      ))}

      {/* Floor plane */}
      <rect x="0" y="610" width="1600" height="290" fill={`url(#${id('floor')})`} />
      {/* Floorboard seams in perspective */}
      {Array.from({ length: 14 }).map((_, i) => {
        const t = i / 13;
        const y = 615 + t * 280;
        return (
          <line
            key={i}
            x1={0}
            y1={y}
            x2={1600}
            y2={y}
            stroke="#000"
            strokeOpacity={0.18 + t * 0.18}
            strokeWidth={1 + t * 1.5}
          />
        );
      })}

      {/* The ring — a roped silhouette to the left, mostly in shadow */}
      <g opacity="0.9">
        {/* posts */}
        {[120, 560].map((x) => (
          <rect key={x} x={x} y={300} width={26} height={330} rx="4" fill="#0c0907" />
        ))}
        {/* three ropes, slung */}
        {[360, 420, 480].map((y, i) => (
          <path
            key={i}
            d={`M133 ${y} Q340 ${y + 26} 560 ${y}`}
            fill="none"
            stroke={p.accent}
            strokeOpacity={0.55}
            strokeWidth="5"
          />
        ))}
        {/* canvas edge */}
        <rect x="120" y="600" width="466" height="30" fill="#0c0907" />
      </g>

      {/* Heavy bag hanging center-right, catching the lamp */}
      <g>
        <line x1="1180" y1="120" x2="1180" y2="300" stroke="#0c0907" strokeWidth="6" />
        <rect
          x="1140"
          y="300"
          width="80"
          height="250"
          rx="34"
          fill="#1a120b"
          stroke="#000"
          strokeOpacity="0.6"
          strokeWidth="3"
        />
        {/* worn highlight down the bag */}
        <rect x="1150" y="312" width="14" height="226" rx="7" fill={p.lamp} opacity="0.12" />
        {/* taped seams */}
        {[360, 420, 480].map((y) => (
          <line key={y} x1="1140" y1={y} x2="1220" y2={y} stroke="#000" strokeOpacity="0.4" strokeWidth="6" />
        ))}
      </g>

      {/* Desk lamp glow — the heart of the room's warmth, lower right */}
      <rect x="760" y="320" width="900" height="600" fill={`url(#${id('lamp')})`} />

      {/* Grain wash over everything */}
      <rect x="0" y="0" width="1600" height="900" filter={`url(#${id('grain')})`} opacity="0.5" />

      {/* Vignette to seat the room in shadow */}
      <radialGradient id={id('vig')} cx="50%" cy="46%" r="62%">
        <stop offset="55%" stopColor="#000" stopOpacity="0" />
        <stop offset="100%" stopColor="#000" stopOpacity="0.72" />
      </radialGradient>
      <rect x="0" y="0" width="1600" height="900" fill={`url(#${id('vig')})`} />
    </svg>
  );
}
