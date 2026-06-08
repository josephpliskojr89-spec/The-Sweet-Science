/*
  ManagerPortrait
  --------------------------------------------------------------------------
  A procedural, parameter-driven portrait built in the layered way the bible
  describes: studio backdrop → torso → skin → features → hair. It reads colors
  and a hair style from the Appearance params and draws confident, minimal,
  slightly-rough vintage-program lines — character suggested, not rendered.

  ASSET REPLACEMENT CONTRACT
  This is a slot. A commissioned manager illustration drops in behind the same
  Appearance params via the portrait registry (see assets/portraits.tsx) and
  nothing else changes. The fighter portrait system (Phase 3) reuses these same
  primitives, so variety scales by combinatorics rather than by hand-authoring.
*/

import { useId } from 'react';
import {
  SKIN_TONES,
  HAIR_COLORS,
  type Appearance,
  type HairStyleKey,
  type HairColor,
} from '../../game/appearance';

interface Props {
  appearance: Appearance;
  size?: number;
  className?: string;
}

const INK = '#241813';

export function ManagerPortrait({ appearance, size = 240, className }: Props) {
  const uid = useId().replace(/:/g, '');
  const skin = SKIN_TONES[appearance.skinTone];
  const hair = HAIR_COLORS[appearance.hairColor];

  const bgId = `mp-bg-${uid}`;
  const roughId = `mp-rough-${uid}`;

  return (
    <svg
      width={size}
      height={size * 1.2}
      viewBox="0 0 200 240"
      className={className}
      role="img"
      aria-label="Manager portrait"
    >
      <defs>
        <radialGradient id={bgId} cx="50%" cy="36%" r="72%">
          <stop offset="0%" stopColor="#3a2c1d" />
          <stop offset="55%" stopColor="#1f1812" />
          <stop offset="100%" stopColor="#0c0907" />
        </radialGradient>

        {/* Gentle hand-drawn wobble across the whole figure. */}
        <filter id={roughId} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.013"
            numOctaves="2"
            seed="7"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="2.2"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>

      {/* Studio backdrop */}
      <rect x="0" y="0" width="200" height="240" fill={`url(#${bgId})`} />

      <g filter={`url(#${roughId})`} strokeLinejoin="round" strokeLinecap="round">
        {/* Back hair (afro halo) sits behind the head */}
        {appearance.hairStyle === 'afro' && (
          <g>
            <ellipse cx="100" cy="64" rx="60" ry="54" fill={hair.base} stroke={hair.shadow} strokeWidth="2" />
            <ellipse cx="110" cy="58" rx="50" ry="44" fill={hair.shadow} opacity="0.28" />
          </g>
        )}

        {/* Torso — dark jacket, light shirt collar, oxblood tie */}
        <path
          d="M16,240 C16,198 48,184 100,184 C152,184 184,198 184,240 Z"
          fill="#241b13"
          stroke="#0c0907"
          strokeWidth="2"
        />
        <path d="M84,186 L100,214 L116,186 Z" fill="#cabfa6" />
        <path d="M95,186 L105,186 L103,220 L97,220 Z" fill="#6e2a1c" />
        {/* collar */}
        <path d="M84,186 L96,196 L92,184 Z" fill="#30251a" />
        <path d="M116,186 L104,196 L108,184 Z" fill="#30251a" />

        {/* Neck */}
        <path d="M86,142 L114,142 L118,186 L82,186 Z" fill={skin.base} stroke={INK} strokeWidth="1.5" />
        {/* neck shadow under the jaw */}
        <path d="M86,142 C92,154 108,154 114,142 L116,160 L84,160 Z" fill={skin.shadow} opacity="0.5" />

        {/* Ears */}
        <ellipse cx="57" cy="95" rx="6" ry="10" fill={skin.base} stroke={INK} strokeWidth="1.5" />
        <ellipse cx="143" cy="95" rx="6" ry="10" fill={skin.base} stroke={INK} strokeWidth="1.5" />

        {/* Head */}
        <path
          d="M58,86 C57,60 72,46 100,46 C128,46 143,60 142,86 C142,106 135,124 119,137 C111,143 89,143 81,137 C65,124 58,106 58,86 Z"
          fill={skin.base}
          stroke={INK}
          strokeWidth="2"
        />
        {/* form shadow down the left side */}
        <path
          d="M58,86 C58,106 65,124 81,137 C74,130 70,110 70,90 C70,76 74,62 84,52 C72,52 59,64 58,86 Z"
          fill={skin.shadow}
          opacity="0.35"
        />

        {/* Features */}
        {/* brows */}
        <path d="M70,83 Q79,79 89,83" fill="none" stroke={hair.base} strokeWidth="3" />
        <path d="M111,83 Q121,79 130,83" fill="none" stroke={hair.base} strokeWidth="3" />
        {/* eyes */}
        <ellipse cx="79" cy="92" rx="5" ry="3.2" fill={INK} />
        <ellipse cx="121" cy="92" rx="5" ry="3.2" fill={INK} />
        {/* nose */}
        <path d="M100,95 L97,112 Q100,116 104,112" fill="none" stroke={skin.shadow} strokeWidth="2.5" />
        {/* mouth */}
        <path d="M89,124 Q100,129 111,124" fill="none" stroke={INK} strokeWidth="2.5" opacity="0.8" />

        {/* Front hair */}
        <FrontHair style={appearance.hairStyle} hair={hair} />
      </g>
    </svg>
  );
}

function FrontHair({ style, hair }: { style: HairStyleKey; hair: HairColor }) {
  switch (style) {
    case 'crew':
      return (
        <g stroke={hair.shadow} strokeWidth="2">
          <path
            d="M56,88 C54,58 70,42 100,42 C130,42 146,58 144,88 C138,78 126,64 100,64 C74,64 62,78 56,88 Z"
            fill={hair.base}
          />
          <path d="M100,42 C130,42 146,58 144,88 C140,76 130,66 112,63 C120,52 110,44 100,42 Z" fill={hair.shadow} stroke="none" opacity="0.4" />
        </g>
      );
    case 'side_part':
      return (
        <g stroke={hair.shadow} strokeWidth="2">
          <path
            d="M54,90 C52,54 72,40 100,40 C133,40 149,56 147,90 C141,78 128,62 104,60 C98,66 96,70 95,74 C86,62 66,72 54,90 Z"
            fill={hair.base}
          />
          <path d="M104,60 C100,70 98,76 97,86" fill="none" strokeWidth="2.5" opacity="0.7" />
          <path d="M104,60 C128,62 141,78 147,90 C143,74 132,64 116,61 Z" fill={hair.shadow} stroke="none" opacity="0.4" />
        </g>
      );
    case 'slick_back':
      return (
        <g stroke={hair.shadow} strokeWidth="2">
          <path
            d="M56,92 C52,50 74,40 100,40 C128,40 150,52 146,92 C140,70 124,58 100,58 C76,58 62,70 56,92 Z"
            fill={hair.base}
          />
          <path d="M70,70 C84,60 116,60 130,70" fill="none" strokeWidth="1.5" opacity="0.5" />
          <path d="M66,80 C84,68 116,68 134,80" fill="none" strokeWidth="1.5" opacity="0.4" />
        </g>
      );
    case 'curly': {
      const puffs: Array<[number, number, number]> = [
        [62, 60, 8],
        [76, 50, 9],
        [90, 44, 9],
        [100, 42, 9],
        [112, 45, 9],
        [126, 51, 9],
        [138, 61, 8],
        [56, 78, 8],
        [144, 78, 8],
      ];
      return (
        <g stroke={hair.shadow} strokeWidth="1.5">
          <path
            d="M52,94 C48,54 70,36 100,36 C130,36 152,54 148,94 C140,76 128,62 100,62 C72,62 60,76 52,94 Z"
            fill={hair.base}
          />
          {puffs.map(([cx, cy, r], i) => (
            <circle key={i} cx={cx} cy={cy} r={r} fill={hair.base} />
          ))}
          {puffs.map(([cx, cy, r], i) => (
            <circle key={`s${i}`} cx={cx + 2} cy={cy + 2} r={r - 3} fill={hair.shadow} stroke="none" opacity="0.35" />
          ))}
        </g>
      );
    }
    case 'afro':
      // Halo is drawn behind the head; add a front hairline band so it covers
      // the forehead like a real afro rather than receding.
      return (
        <path
          d="M62,66 C72,50 128,50 138,66 C120,58 80,58 62,66 Z"
          fill={hair.base}
          stroke={hair.shadow}
          strokeWidth="2"
        />
      );
    case 'bald':
      return null;
  }
}
