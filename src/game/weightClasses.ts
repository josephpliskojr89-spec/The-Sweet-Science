/*
  Weight Classes
  --------------------------------------------------------------------------
  The five launch divisions (bible: Weight Classes). A fighter's class is
  derived from his weight, never stored independently, so the two can never
  disagree. Generation picks a class by city archetype, samples a believable
  weight and height inside it, and the derivation confirms the label.
*/

export type WeightClassKey =
  | 'lightweight'
  | 'welterweight'
  | 'middleweight'
  | 'light_heavyweight'
  | 'heavyweight';

export interface WeightClass {
  key: WeightClassKey;
  name: string;
  /** Upper limit in lbs (heavyweight has none). */
  limit: number | null;
  /** Generation weight range [min, max] in lbs. */
  weightRange: [number, number];
  /** Generation height range [min, max] in inches. */
  heightRange: [number, number];
}

export const WEIGHT_CLASSES: Record<WeightClassKey, WeightClass> = {
  lightweight: {
    key: 'lightweight',
    name: 'Lightweight',
    limit: 135,
    weightRange: [130, 135],
    heightRange: [64, 68],
  },
  welterweight: {
    key: 'welterweight',
    name: 'Welterweight',
    limit: 147,
    weightRange: [141, 147],
    heightRange: [66, 70],
  },
  middleweight: {
    key: 'middleweight',
    name: 'Middleweight',
    limit: 160,
    weightRange: [155, 160],
    heightRange: [69, 73],
  },
  light_heavyweight: {
    key: 'light_heavyweight',
    name: 'Light Heavyweight',
    limit: 175,
    weightRange: [169, 175],
    heightRange: [71, 75],
  },
  heavyweight: {
    key: 'heavyweight',
    name: 'Heavyweight',
    limit: null,
    weightRange: [185, 232],
    heightRange: [72, 78],
  },
};

export const WEIGHT_CLASS_ORDER: WeightClassKey[] = [
  'lightweight',
  'welterweight',
  'middleweight',
  'light_heavyweight',
  'heavyweight',
];

/** Derive the division from a raw weight, so weight and class always agree. */
export function deriveWeightClass(weightLbs: number): WeightClassKey {
  if (weightLbs <= 135) return 'lightweight';
  if (weightLbs <= 147) return 'welterweight';
  if (weightLbs <= 160) return 'middleweight';
  if (weightLbs <= 175) return 'light_heavyweight';
  return 'heavyweight';
}

/** "5'11\"" */
export function formatHeight(inches: number): string {
  const ft = Math.floor(inches / 12);
  const inch = inches % 12;
  return `${ft}'${inch}"`;
}
