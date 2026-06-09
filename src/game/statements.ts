/*
  Statements & First Impressions
  --------------------------------------------------------------------------
  "How someone writes about wanting something tells you who they are."

  generateStatement assembles a short, voiced paragraph for the walk-in card's
  "Why I Want To Train Here." The voice is biased by the fighter's traits
  (visible AND hidden — the statement is a window, not a label), so a defiant
  kid reads defiant and a provider reads like a man with mouths to feed. Raw
  voices carry rough spelling on purpose. None of it is the whole truth.

  generateFirstImpression is the manager's gut read — one to four words, often
  hinting at a trait, sometimes a red herring.
*/

import type { TraitKey } from './traits';

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Pick `n` distinct lines from a pool. */
function some(pool: string[], n: number): string[] {
  const copy = [...pool];
  const out: string[] = [];
  for (let i = 0; i < n && copy.length; i++) {
    out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
  }
  return out;
}

type Voice =
  | 'raw'
  | 'polished'
  | 'champion'
  | 'escape'
  | 'provider'
  | 'defiant'
  | 'humble'
  | 'warrior';

const VOICE_LINES: Record<Voice, string[]> = {
  raw: [
    'I aint got no big amature record but I can fight, I know that much.',
    'I been hungry my whole life and Im hungrier now.',
    'I dont care how hard you push me. I wont break.',
    'This is the only thing I ever been any good at.',
    'I learned to fight the hard way, on the street, but I want to do it right.',
    'I dont have money for dues yet but I will work it off, I swear it.',
  ],
  polished: [
    'I believe the right environment is essential to reaching one’s potential.',
    'I’m looking for a serious team to take my career to the next level.',
    'Your gym has an excellent reputation, and I would be proud to represent it.',
    'I take my preparation seriously and expect the same from those around me.',
    'I’ve done some thinking about my future, and I believe this is the right fit.',
  ],
  champion: [
    'I’m going to be a champion. I just need somebody who sees it too.',
    'Give me a couple of years and I’ll put this gym’s name in the paper.',
    'I don’t want to just fight. I want a belt, and I want it here.',
  ],
  escape: [
    'Where I’m from, you either fight or you disappear. I’d rather fight.',
    'My brother went one way. I’m trying to go another.',
    'Boxing is the only thing that ever made any sense to me.',
    'I’ve seen what happens to men who stay where I’m from. I’m getting out.',
    'I don’t have a lot of time left to make something of myself.',
  ],
  provider: [
    'I’ve got a family to feed and I’m done doing it the slow way.',
    'Every round I take, I take for them.',
    'I’m not here to be famous. I’m here to provide.',
    'I work days. I’ll be here every night you’ll have me.',
  ],
  defiant: [
    'Everybody around here already counted me out. That’s fine by me.',
    'I don’t need you to believe in me. I need you to train me.',
    'People keep telling me what I can’t do. I’m tired of hearing it.',
    'I’ve been overlooked my whole life. I’m used to it. It just makes me work.',
  ],
  humble: [
    'I know I’ve got a lot to learn. I’m ready to listen.',
    'I won’t be a problem in your gym. I just want to work.',
    'Whatever you need me to do, I’ll do it without complaining.',
    'I’m not sure I’m good enough yet. But I want to find out.',
  ],
  warrior: [
    'I’d rather get stopped swinging than win a round running.',
    'I’m not afraid of getting hurt. I’m afraid of being ordinary.',
    'When I’m in there, something takes over. I can’t explain it.',
    'I don’t take a backward step. Never have.',
  ],
};

/** Choose a voice biased by the fighter's traits, else a sensible default. */
function chooseVoice(traits: TraitKey[]): Voice {
  const has = (t: TraitKey) => traits.includes(t);
  if (has('family_man')) return Math.random() < 0.8 ? 'provider' : 'humble';
  if (has('chip_on_shoulder') || has('hot_tempered')) return Math.random() < 0.75 ? 'defiant' : 'raw';
  if (has('glory_hunter')) return Math.random() < 0.7 ? 'champion' : 'warrior';
  if (has('reckless_brave') || has('lionheart')) return Math.random() < 0.7 ? 'warrior' : 'escape';
  if (has('insecure')) return Math.random() < 0.8 ? 'humble' : 'escape';
  if (has('comfort_seeker')) return Math.random() < 0.6 ? 'polished' : 'humble';
  // No strong signal — a spread of everyman voices.
  return pick<Voice>(['raw', 'escape', 'humble', 'champion', 'polished']);
}

export function generateStatement(traits: TraitKey[]): string {
  const voice = chooseVoice(traits);
  // Short voices stay short; others get a 2–3 sentence paragraph.
  const n = voice === 'champion' ? 2 : pick([2, 3, 3]);
  return some(VOICE_LINES[voice], n).join(' ');
}

// --- First impressions -----------------------------------------------------

const NEUTRAL_IMPRESSIONS = [
  'Quiet, focused, respectful.',
  'Something behind the eyes.',
  'Hard to read.',
  'Carries himself well.',
  'All business.',
  'Polite. Watchful.',
  'Restless.',
  'Calm. Maybe too calm.',
  'Tired, but here.',
  'Sizes you up.',
  'Doesn’t say much.',
  'Nervous, but trying.',
];

const TRAIT_IMPRESSIONS: Partial<Record<TraitKey, string[]>> = {
  chip_on_shoulder: ['Chip on his shoulder.', 'Something to prove.'],
  hot_tempered: ['Short fuse, maybe.', 'Wound tight.'],
  insecure: ['Looking for approval.', 'Unsure of himself.'],
  glory_hunter: ['Big dreams in his eyes.', 'Wants it badly.'],
  reckless_brave: ['No fear in him.', 'A reckless edge.'],
  comfort_seeker: ['A little too comfortable.', 'Coasting, maybe.'],
  family_man: ['Older eyes. Responsibilities.', 'Something waiting at home.'],
  lionheart: ['Quiet iron in him.'],
  unfocused: ['Mind somewhere else.', 'Drifts in and out.'],
};

/**
 * The gut read. Usually leans on a visible trait when one offers a phrase, but
 * sometimes lands on a neutral or slightly-wrong read — the First Impression
 * is intuition, not information.
 */
export function generateFirstImpression(visibleTraits: TraitKey[]): string {
  const hinted = visibleTraits.flatMap((t) => TRAIT_IMPRESSIONS[t] ?? []);
  if (hinted.length && Math.random() < 0.6) return pick(hinted);
  return pick(NEUTRAL_IMPRESSIONS);
}
