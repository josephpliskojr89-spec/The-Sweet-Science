/*
  Appearance
  --------------------------------------------------------------------------
  The parameter set that drives procedural portraits. Phase 2 uses it for the
  manager portrait (layered: base / skin tone / hair, per the bible). The same
  parameters drive fighter portraits in Phase 3 — variety comes from the
  combinatorics here, so fifty generated people look like fifty people.

  Each option carries the colors a portrait needs (base + shadow + light), so
  the portrait component stays dumb: it reads values, it doesn't decide them.
*/

export type SkinToneKey =
  | 'porcelain'
  | 'fair'
  | 'olive'
  | 'tan'
  | 'brown'
  | 'deep';

export interface SkinTone {
  key: SkinToneKey;
  name: string;
  base: string;
  shadow: string;
  light: string;
}

export const SKIN_TONES: Record<SkinToneKey, SkinTone> = {
  porcelain: { key: 'porcelain', name: 'Porcelain', base: '#f0d2b8', shadow: '#d6b291', light: '#f9e6d3' },
  fair: { key: 'fair', name: 'Fair', base: '#e6bf97', shadow: '#caa074', light: '#f1d5b4' },
  olive: { key: 'olive', name: 'Olive', base: '#cda472', shadow: '#b1885a', light: '#dcb78d' },
  tan: { key: 'tan', name: 'Tan', base: '#bd8b5a', shadow: '#9c6f43', light: '#cfa06d' },
  brown: { key: 'brown', name: 'Brown', base: '#925f3a', shadow: '#744b2c', light: '#a5714a' },
  deep: { key: 'deep', name: 'Deep', base: '#6a4128', shadow: '#52311d', light: '#7d5135' },
};

export const SKIN_TONE_ORDER: SkinToneKey[] = [
  'porcelain',
  'fair',
  'olive',
  'tan',
  'brown',
  'deep',
];

export type HairColorKey =
  | 'black'
  | 'dark_brown'
  | 'brown'
  | 'auburn'
  | 'blond'
  | 'gray';

export interface HairColor {
  key: HairColorKey;
  name: string;
  base: string;
  shadow: string;
}

export const HAIR_COLORS: Record<HairColorKey, HairColor> = {
  black: { key: 'black', name: 'Black', base: '#1c1714', shadow: '#0d0a08' },
  dark_brown: { key: 'dark_brown', name: 'Dark Brown', base: '#3a2a1c', shadow: '#271c12' },
  brown: { key: 'brown', name: 'Brown', base: '#5a3d24', shadow: '#432d1a' },
  auburn: { key: 'auburn', name: 'Auburn', base: '#6e3a22', shadow: '#532a18' },
  blond: { key: 'blond', name: 'Blond', base: '#b3884a', shadow: '#8c6730' },
  gray: { key: 'gray', name: 'Gray', base: '#9a9088', shadow: '#6f675f' },
};

export const HAIR_COLOR_ORDER: HairColorKey[] = [
  'black',
  'dark_brown',
  'brown',
  'auburn',
  'blond',
  'gray',
];

export type HairStyleKey =
  | 'crew'
  | 'side_part'
  | 'slick_back'
  | 'curly'
  | 'afro'
  | 'bald';

export interface HairStyle {
  key: HairStyleKey;
  name: string;
}

export const HAIR_STYLES: Record<HairStyleKey, HairStyle> = {
  crew: { key: 'crew', name: 'Crew Cut' },
  side_part: { key: 'side_part', name: 'Side Part' },
  slick_back: { key: 'slick_back', name: 'Slicked Back' },
  curly: { key: 'curly', name: 'Curly' },
  afro: { key: 'afro', name: 'Afro' },
  bald: { key: 'bald', name: 'Bald' },
};

export const HAIR_STYLE_ORDER: HairStyleKey[] = [
  'crew',
  'side_part',
  'slick_back',
  'curly',
  'afro',
  'bald',
];

export interface Appearance {
  skinTone: SkinToneKey;
  hairColor: HairColorKey;
  hairStyle: HairStyleKey;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function randomAppearance(): Appearance {
  return {
    skinTone: pick(SKIN_TONE_ORDER),
    hairColor: pick(HAIR_COLOR_ORDER),
    hairStyle: pick(HAIR_STYLE_ORDER),
  };
}

export const DEFAULT_APPEARANCE: Appearance = {
  skinTone: 'fair',
  hairColor: 'dark_brown',
  hairStyle: 'side_part',
};
