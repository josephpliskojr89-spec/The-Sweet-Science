/*
  Biography
  --------------------------------------------------------------------------
  A fighter's profile should read like a file in the gym office, not a stat
  block. This turns what you know about a man — where he's from, when he walked
  in, the traits you've uncovered, his own words at the door — into readable
  prose that grows as you learn more about him.

  Everything here is assembled from data already on the fighter and his roster
  entry; nothing is invented or stored. As traits surface and his career fills
  in, the biography lengthens on its own. The voice is the manager's: plain,
  observed, a little weathered.
*/

import type { RosterEntry } from './roster';
import type { TraitKey } from './traits';
import { fighterAge } from './fighters';
import { getCity } from './cities';
import { WEIGHT_CLASSES } from './weightClasses';
import { formatDate } from './time';

/** How long he's been with you, in human terms. */
function relativeTenure(days: number): string {
  if (days <= 0) return 'today';
  if (days < 14) return days === 1 ? 'yesterday' : `${days} days ago`;
  if (days < 60) return `${Math.round(days / 7)} weeks ago`;
  if (days < 365) return `${Math.round(days / 30)} months ago`;
  const years = Math.floor(days / 365);
  return years === 1 ? 'about a year ago' : `${years} years ago`;
}

/** Years with the gym, phrased for the record sheet. */
export function yearsWithGymLabel(entry: RosterEntry, dayCount: number): string {
  const days = Math.max(0, dayCount - entry.joinedDayCount);
  if (days < 30) return 'Less than a month';
  if (days < 365) return `${Math.round(days / 30)} months`;
  const years = Math.floor(days / 365);
  const months = Math.round((days % 365) / 30);
  if (years >= 1 && months === 0) return years === 1 ? '1 year' : `${years} years`;
  return `${years}y ${months}m`;
}

/** A biographical sentence for each trait — the human read, distinct from the
    clipped gameplay blurb in traits.ts. */
const TRAIT_BIO: Record<TraitKey, string> = {
  lionheart:
    'There’s a quiet iron in him. The kind of fighter who turns most dangerous once he’s hurt, behind, or written off.',
  unfocused:
    'His attention wanders. The gift is real, but it comes and goes, and you never quite know which version turns up.',
  hot_tempered:
    'He runs hot. The wrong word in the wrong moment pulls him into a war he should have boxed his way out of.',
  comfort_seeker:
    'He’s comfortable — maybe too comfortable. He fights to the level of the night and rarely an inch above it.',
  glory_hunter:
    'He’s chasing something bigger than a paycheck. A name, a belt, a place in the story they tell later.',
  family_man:
    'He’s got people at home. Whatever he spends in that ring, he spends for them, and it shows in how he carries it.',
  reckless_brave:
    'He never takes the safe road. It will make him worth the price of a ticket, and one day it will cost him.',
  insecure:
    'He needs to be believed in. Give him that and he stands taller than his frame; take it away and he folds.',
  chip_on_shoulder:
    'He fights like a man with something to prove, fueled by every slight he’s collected, real or imagined.',
};

/** A closing line about what he's reaching for, shaded by who he is. */
function aspiration(traits: TraitKey[]): string {
  if (traits.includes('family_man'))
    return 'He doesn’t talk about glory so much as a better life for the people counting on him.';
  if (traits.includes('glory_hunter'))
    return 'He talks about titles like they already belong to him and he’s just waiting to collect.';
  if (traits.includes('chip_on_shoulder') || traits.includes('insecure'))
    return 'More than a belt, he wants to make the people who doubted him watch him win.';
  return 'Like every kid who comes through that door, he dreams of the night they raise his hand for a title.';
}

/**
 * Build the fighter's biography as a list of paragraphs. Grows as traits are
 * discovered; never shows hidden information.
 */
export function fighterBiography(entry: RosterEntry, dayCount: number): string[] {
  const f = entry.fighter;
  const paras: string[] = [];
  const name = `${f.firstName} ${f.lastName}`;
  const cls = WEIGHT_CLASSES[f.weightClass].name.toLowerCase();
  const city = getCity(f.homeCityId).name;

  // Origins.
  const days = Math.max(0, dayCount - entry.joinedDayCount);
  const ageNow = fighterAge(f);
  const ageThen = Math.max(15, ageNow - Math.floor(days / 365));
  const when = relativeTenure(days);
  let origin = `${name} is a ${ageNow}-year-old ${cls} out of ${city}. `;
  origin +=
    days < 7
      ? `He walked into the gym ${when === 'today' ? 'today' : when}, ${ageThen}, looking for someone to take him seriously. `
      : `He walked in ${when}, ${ageThen} years old, looking for someone to take him seriously. `;
  origin += entry.hasLocker
    ? 'You gave him a locker — a place on the floor and a quiet promise that you’re paying attention.'
    : 'For now he trains on provisional terms, no locker of his own, still proving he belongs.';
  paras.push(origin);

  // His own words at the door, and your first read of him.
  if (f.statement) paras.push(`In his own words, the day he came in: “${f.statement}”`);
  if (f.firstImpression) paras.push(`Your first read on him: ${f.firstImpression}`);

  // The man, as far as you've learned him.
  if (f.visibleTraits.length > 0) {
    for (const t of f.visibleTraits) paras.push(TRAIT_BIO[t]);
  } else {
    paras.push(
      'Beyond that he’s still a stranger. Who he really is — what he’s made of when it’s hard — will come out with time on the floor.',
    );
  }

  // In the ring, only what a locker's worth of attention has taught you.
  if (entry.hasLocker && f.growthKnown) {
    paras.push(
      f.growth >= 1.15
        ? 'Watching him work, the craft sticks fast. Show him a thing once and it’s his — a natural.'
        : f.growth <= 0.85
          ? 'Watching him work, the lessons go in slow and come back slower. Honest, willing, and stuck in second gear.'
          : 'Watching him work, he comes along at an ordinary pace — no shortcuts, no surprises.',
    );
  }

  // The coach's eye on his upside — a hedged first read, set the day he signed.
  if (f.ceilingRead) paras.push(f.ceilingRead);

  // What he's after — and the hint that there's more under the surface.
  let close = aspiration(f.visibleTraits);
  if (f.hiddenTraits.length > 0)
    close += ' And there’s more to this man than he’s shown you yet.';
  paras.push(close);

  return paras;
}

/** One remembered moment in a fighter's own history (Career tab). */
export interface CareerMoment {
  year: number;
  text: string;
}

/**
 * The fighter's personal timeline. Today this is only what the gym already
 * knows for certain — when he arrived and how he came in. Fights, titles,
 * injuries, and trait reveals join it as those systems land (Phase 6D+).
 */
export function careerTimeline(entry: RosterEntry, _dayCount: number): CareerMoment[] {
  const moments: CareerMoment[] = [];
  const joinYear = formatDate(entry.joinedDayCount).year;
  moments.push({ year: joinYear, text: 'Walked into the gym off the street.' });
  moments.push({
    year: joinYear,
    text: entry.hasLocker
      ? 'Given a locker — taken on as part of the stable.'
      : 'Started training on provisional terms.',
  });
  return moments;
}
