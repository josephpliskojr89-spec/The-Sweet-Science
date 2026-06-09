/*
  Personality Traits
  --------------------------------------------------------------------------
  The nine traits from the bible. They are not stat modifiers — they're who
  shows up. Some announce themselves (Hot Tempered, Chip on His Shoulder);
  others hide until pressure reveals them (Lionheart doesn't announce itself;
  an Unfocused fighter looks like a world-beater in camp). `hiddenBias` is how
  likely a trait is to be concealed at signing, so generation can keep the
  right ones in the dark.

  Phase 3 generates and reveals (visible) traits and seeds hidden ones; the
  fight engine (Phase 8) is where hidden traits actually surface under
  pressure. Here we just assign them.
*/

export type TraitKey =
  | 'lionheart'
  | 'unfocused'
  | 'hot_tempered'
  | 'comfort_seeker'
  | 'glory_hunter'
  | 'family_man'
  | 'reckless_brave'
  | 'insecure'
  | 'chip_on_shoulder';

export interface Trait {
  key: TraitKey;
  name: string;
  blurb: string;
  /** 0..1 — likelihood this trait is hidden at signing. */
  hiddenBias: number;
}

export const TRAITS: Record<TraitKey, Trait> = {
  lionheart: {
    key: 'lionheart',
    name: 'Lionheart',
    blurb: 'Refuses to quit. Most dangerous when hurt, behind, or written off.',
    hiddenBias: 0.85,
  },
  unfocused: {
    key: 'unfocused',
    name: 'Unfocused',
    blurb: 'Gifted but inconsistent. Can be a world-beater or simply absent.',
    hiddenBias: 0.7,
  },
  hot_tempered: {
    key: 'hot_tempered',
    name: 'Hot Tempered',
    blurb: 'Volatile. Gets drawn into wars he should box his way out of.',
    hiddenBias: 0.3,
  },
  comfort_seeker: {
    key: 'comfort_seeker',
    name: 'Comfort Seeker',
    blurb: 'Performs to the level of the night. Success quietly dulls his edge.',
    hiddenBias: 0.75,
  },
  glory_hunter: {
    key: 'glory_hunter',
    name: 'Glory Hunter',
    blurb: 'Chases legacy over money. Stays hungry — sometimes recklessly so.',
    hiddenBias: 0.45,
  },
  family_man: {
    key: 'family_man',
    name: 'Family Man',
    blurb: 'Stability at home shifts what he is willing to spend in the ring.',
    hiddenBias: 0.4,
  },
  reckless_brave: {
    key: 'reckless_brave',
    name: 'Reckless Brave',
    blurb: 'Never takes the safe option. His face tells every fight he has had.',
    hiddenBias: 0.45,
  },
  insecure: {
    key: 'insecure',
    name: 'Insecure',
    blurb: 'Needs the right corner. Thrives on belief, collapses without it.',
    hiddenBias: 0.45,
  },
  chip_on_shoulder: {
    key: 'chip_on_shoulder',
    name: 'Chip on His Shoulder',
    blurb: 'Fueled by disrespect, real or imagined. Always proving something.',
    hiddenBias: 0.25,
  },
};

export const TRAIT_ORDER: TraitKey[] = [
  'lionheart',
  'unfocused',
  'hot_tempered',
  'comfort_seeker',
  'glory_hunter',
  'family_man',
  'reckless_brave',
  'insecure',
  'chip_on_shoulder',
];

export function getTrait(key: TraitKey): Trait {
  return TRAITS[key];
}
