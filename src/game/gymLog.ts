/*
  Gym Log — the gym breathing between fights
  --------------------------------------------------------------------------
  Every time advance, the gym produces a few quiet observations: who stayed
  late, who skipped roadwork, who went at it in sparring, how the man whose
  locker you took is carrying it. Lines are generated from data the game
  already tracks — traits, morale, trust, weight classes, the season — so the
  texture is extrapolated from who these people are, never random noise.

  This module is also where HIDDEN TRAITS REVEAL IN THE GYM (bible: "some
  reveal themselves in the gym over weeks"). Weeks of observation can surface
  a man's nature long before a fight does — locker holders are around more,
  so they're read sooner.

  Pure: takes the roster and context, returns updated roster + lines + ledger
  milestones. The context composes and commits.
*/

import type { RosterEntry } from './roster';
import type { TraitKey } from './traits';
import { TRAITS } from './traits';
import { moodLabel } from './relationship';
import type { RegionKey } from './regions';

export interface LogLine {
  dayCount: number;
  text: string;
}

export interface GymObservationResult {
  roster: RosterEntry[];
  lines: string[];
  /** Lines weighty enough to be remembered in the ledger. */
  milestones: string[];
}

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const chance = (p: number) => Math.random() < p;

function firstName(e: RosterEntry): string {
  return e.fighter.firstName;
}
function shortName(e: RosterEntry): string {
  return `${e.fighter.firstName} ${e.fighter.lastName}`;
}

// --- trait reveals -----------------------------------------------------------

/** Weekly reveal chance. Time around the gym is how you learn a man — but
    slowly. At these rates a locker holder gives up roughly one secret a year;
    deeper men stay unknown for years, as the bible wants. */
const REVEAL_WEEKLY_LOCKER = 0.015;
const REVEAL_WEEKLY_NO_LOCKER = 0.006;

const REVEAL_LINES: Record<TraitKey, string[]> = {
  lionheart: [
    '{name} got dropped hard in sparring today. He was up before anyone moved, and he walked the other man down for two more rounds. The gym went quiet. There is iron in him you had not seen.',
  ],
  unfocused: [
    '{name} looked like a world-beater all week — then spent Friday staring out the window between rounds. The talent is enormous. The switch has a mind of its own.',
  ],
  hot_tempered: [
    'A clinch in sparring turned into something else, and it took three men to pull {name} off. He apologized after. You have seen that fuse now.',
  ],
  comfort_seeker: [
    '{name} has started cutting his roadwork short now that things are going his way. You finally see the pattern: he works exactly as hard as his situation demands.',
  ],
  glory_hunter: [
    '{name} stayed after hours studying an old title fight on the projector, mouthing the rounds to himself. It is not money he is chasing. You see that now.',
  ],
  family_man: [
    'A little boy in a winter coat watched {name} train from the doorway today, and the man fought the bag like it owed his family money. There is a household behind everything he does.',
  ],
  reckless_brave: [
    '{name} sparred with a cracked rib he told nobody about. You only found out because he winced racking the weights. He does not know how to protect himself, and he does not want to learn.',
  ],
  insecure: [
    '{name} fell apart today after one rough round — not his body, his eyes. Then he asked you three different ways whether he belonged here. Now you know what he needs.',
  ],
  chip_on_shoulder: [
    'Someone laughed during {name}’s bag work. He trained two extra hours and left without a word. Everything is fuel to this one.',
  ],
};

// --- behavioral flavor (works for hidden traits too — foreshadowing) ---------

const TRAIT_FLAVOR: Partial<Record<TraitKey, string[]>> = {
  lionheart: [
    '{name} finished every round of sparring this week, including the ones he lost.',
  ],
  unfocused: [
    '{name} skipped roadwork twice this week. Says his legs were tired. They weren’t.',
    '{name} was brilliant Tuesday and a ghost Thursday.',
  ],
  hot_tempered: [
    '{name} cracked the speed bag mount arguing with it. The bag won on points.',
    '{name} has been wound tight all week. The older guys give him room.',
  ],
  comfort_seeker: [
    '{name} looked sharp exactly as long as someone was watching.',
  ],
  glory_hunter: [
    '{name} asked you today how old the youngest champion was. He already knew the answer.',
  ],
  family_man: [
    '{name} left early again — his kid had something at school. He made the time up at dawn.',
  ],
  reckless_brave: [
    '{name} sparred three weight classes up because nobody else would. Came out grinning through a fat lip.',
    '{name} treats headgear like an insult.',
  ],
  insecure: [
    '{name} looked over at you between every round today, checking your face.',
  ],
  chip_on_shoulder: [
    '{name} stayed an hour after everyone left, working the double-end bag in the dark.',
    '{name} taped a newspaper clipping inside his locker. He won’t say what it says.',
  ],
};

// --- mood observations --------------------------------------------------------

const MOOD_WARN_LINES = [
  '{name} hasn’t said a word to you all week. He still shows up first.',
  '{name} trains like a man doing his job and nothing more. The spark is low.',
  'The other fighters have noticed {name} keeping to himself.',
];
const MOOD_CRIT_LINES = [
  '{name} packed his bag slowly tonight, looking around the gym like he was measuring it. You’ve seen that look before.',
  '{name} barely worked today. Whatever is between you two is in the room now.',
];

// --- sparring -----------------------------------------------------------------

const SPAR_LINES = [
  '{a} and {b} went four hard rounds today. Good work, both of them better for it.',
  '{a} got the better of {b} in sparring — clean, sharp, no malice. {b} asked to go again tomorrow.',
  '{a} and {b} went at it harder than sparring calls for. Nobody apologized.',
  'The whole gym stopped to watch {a} and {b} work. Days like this are why you open the doors.',
];

// --- season & city texture ------------------------------------------------------

const SEASON_LINES: Record<RegionKey, Record<string, string[]>> = {
  northeast: {
    Winter: ['The radiators clanked all day and the windows stayed fogged. Nobody went home early.'],
    Spring: ['First warm day of the year. The door stayed propped open and the street noise came in with the light.'],
    Summer: ['The gym was a furnace today. The veterans say the champions are made in July.'],
    Autumn: ['Cold air through the windows tonight. The heavy bags sound different in October — harder, somehow.'],
  },
  midwest: {
    Winter: ['Snow piled against the door by noon. Every man who showed up today meant it.'],
    Spring: ['The thaw finally reached the gym. Someone swept the winter out of the corners.'],
    Summer: ['Factory shift change brought the evening crowd in early. The bags never went quiet.'],
    Autumn: ['The light goes early now. The gym glows yellow against the dark street like a lantern.'],
  },
  south: {
    Winter: ['What passes for winter here blew through. The old men still complained about the cold.'],
    Spring: ['The ceiling fans came back on this week and stirred ten years of dust off the rafters.'],
    Summer: ['The heat sat in the gym like a third sparring partner. The smart ones trained at dawn.'],
    Autumn: ['Football season pulls the neighborhood kids away. The serious ones stay.'],
  },
  west: {
    Winter: ['Rain on the roof all afternoon, the speed bags keeping time underneath it.'],
    Spring: ['The low sun came through the high windows and lit the ring like a stage.'],
    Summer: ['The evening haze turned the gym amber. Somebody propped the back door for the breeze.'],
    Autumn: ['The Santa Anas rattled the windows. Everyone was a little meaner on the bags today.'],
  },
};

// --- dues & anniversaries -------------------------------------------------------

const DUES_LINES = [
  'First of the month. The dues envelope filled slowly — crumpled singles, a couple of IOUs, one guy who paid for two months because he could.',
  'Dues day. Most paid up. A couple of them wouldn’t meet your eye, which is its own kind of ledger.',
  'The first of the month came and went. The cigar box is heavier, not heavy.',
];

export interface ObserveContext {
  days: number;
  /** Day-count BEFORE the advance. */
  fromDay: number;
  region: RegionKey;
  season: string;
  /** True when this advance crosses the first of a month. */
  crossesMonth: boolean;
}

/** Run the gym's quiet life for an advance. */
export function observeGym(
  roster: RosterEntry[],
  ctx: ObserveContext,
): GymObservationResult {
  const lines: string[] = [];
  const milestones: string[] = [];
  const weeks = ctx.days / 7;

  // 1. Hidden traits reveal under long observation.
  const next: RosterEntry[] = roster.map((e) => {
    if (e.fighter.hiddenTraits.length === 0) return e;
    const weekly = e.hasLocker ? REVEAL_WEEKLY_LOCKER : REVEAL_WEEKLY_NO_LOCKER;
    if (!chance(weekly * weeks)) return e;

    const trait = pick(e.fighter.hiddenTraits);
    const line = pick(REVEAL_LINES[trait]).replace(/\{name\}/g, shortName(e));
    lines.push(line);
    milestones.push(
      `You learned something about ${shortName(e)} — ${TRAITS[trait].name.toLowerCase()}.`,
    );
    return {
      ...e,
      fighter: {
        ...e.fighter,
        hiddenTraits: e.fighter.hiddenTraits.filter((t) => t !== trait),
        visibleTraits: [...e.fighter.visibleTraits, trait],
      },
    };
  });

  // 2. One behavioral flavor moment, weighted toward men with traits to show.
  if (next.length > 0 && chance(0.25 * weeks + 0.1)) {
    const candidates = next.filter((e) =>
      [...e.fighter.visibleTraits, ...e.fighter.hiddenTraits].some((t) => TRAIT_FLAVOR[t]),
    );
    if (candidates.length) {
      const e = pick(candidates);
      const traits = [...e.fighter.visibleTraits, ...e.fighter.hiddenTraits].filter(
        (t) => TRAIT_FLAVOR[t],
      );
      lines.push(pick(TRAIT_FLAVOR[pick(traits)]!).replace(/\{name\}/g, firstName(e)));
    }
  }

  // 3. A mood observation when somebody is carrying something.
  const troubled = next.filter((e) => {
    const tone = moodLabel(e).tone;
    return tone === 'warn' || tone === 'crit';
  });
  if (troubled.length && chance(0.35 * weeks + 0.1)) {
    const e = pick(troubled);
    const pool = moodLabel(e).tone === 'crit' ? MOOD_CRIT_LINES : MOOD_WARN_LINES;
    lines.push(pick(pool).replace(/\{name\}/g, firstName(e)));
  }

  // 4. Sparring, when two men share a division.
  if (chance(0.3 * weeks)) {
    const byClass = new Map<string, RosterEntry[]>();
    for (const e of next) {
      const k = e.fighter.weightClass;
      byClass.set(k, [...(byClass.get(k) ?? []), e]);
    }
    const pairs = [...byClass.values()].filter((g) => g.length >= 2);
    if (pairs.length) {
      const group = pick(pairs);
      const a = pick(group);
      const b = pick(group.filter((e) => e !== a));
      lines.push(
        pick(SPAR_LINES).replace(/\{a\}/g, firstName(a)).replace(/\{b\}/g, firstName(b)),
      );
    }
  }

  // 5. Dues day, on the month boundary.
  if (ctx.crossesMonth && next.length > 0) {
    lines.push(pick(DUES_LINES));
  }

  // 6. Anniversaries — a year to the day since a man first walked in.
  for (const e of next) {
    const tenure = ctx.fromDay + ctx.days - e.joinedDayCount;
    for (let d = 1; d <= ctx.days; d++) {
      const t = tenure - ctx.days + d;
      if (t > 0 && t % 365 === 0) {
        const years = t / 365;
        const line = `${shortName(e)} has been with you ${years === 1 ? 'a year' : `${years} years`} today. He walked in carrying everything he owned.`;
        lines.push(line);
        milestones.push(line);
      }
    }
  }

  // 7. The room itself, once in a while.
  if (chance(0.18 * weeks + 0.05)) {
    const seasonal = SEASON_LINES[ctx.region][ctx.season];
    if (seasonal) lines.push(pick(seasonal));
  }

  // Never flood: at most 3 lines per advance, reveals first.
  return { roster: next, lines: lines.slice(0, 3), milestones };
}
