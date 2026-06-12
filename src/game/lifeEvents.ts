/*
  Life Events
  --------------------------------------------------------------------------
  Fighters live lives outside the gym, and what happens out there is
  extrapolated from who they are — never random (bible: Procedural Life
  Events). A hot-tempered man finds trouble on a Saturday night. A family
  man's life fills up. A comfort seeker gets comfortable.

  Events are rare by design — each one should feel like news. Effects ripple
  into the relationship layer (morale, sometimes trust) today; finances and
  camp quality join the chain in later phases.

  Pure: returns updated roster + lines for the gym log + ledger milestones.
*/

import type { RosterEntry } from './roster';
import type { TraitKey } from './traits';

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

interface LifeEvent {
  /** Trait that makes this event make sense. */
  trait: TraitKey;
  /** Relative weight among this trait's events. */
  weight: number;
  moraleDelta: number;
  trustDelta?: number;
  text: string;
  /** Remember it in the ledger? */
  milestone?: boolean;
}

const EVENTS: LifeEvent[] = [
  {
    trait: 'hot_tempered',
    weight: 3,
    moraleDelta: -12,
    text: '{name} showed up Monday with skinned knuckles and a story that doesn’t hold together. Something happened outside a bar on Saturday. It cost him — and word travels.',
    milestone: true,
  },
  {
    trait: 'hot_tempered',
    weight: 2,
    moraleDelta: -6,
    text: '{name} got into it with a stranger over a parking spot. No harm done, but the man cannot let anything go.',
  },
  {
    trait: 'family_man',
    weight: 2,
    moraleDelta: 10,
    text: '{name} came in glowing — his wife is expecting. He trained like a man with a new reason and left before dark.',
    milestone: true,
  },
  {
    trait: 'family_man',
    weight: 2,
    moraleDelta: -8,
    text: '{name} has trouble at home he won’t talk about. He’s here every day, but only his body is.',
  },
  {
    trait: 'comfort_seeker',
    weight: 2,
    moraleDelta: 6,
    text: '{name} pulled up in a car he cannot afford, grinning like the payments don’t exist. Life is good. That worries you more than it should.',
  },
  {
    trait: 'glory_hunter',
    weight: 2,
    moraleDelta: 6,
    text: '{name} hitchhiked across town to watch the fights and came back lit up like a church. He talked about nothing else for days.',
  },
  {
    trait: 'insecure',
    weight: 2,
    moraleDelta: -8,
    text: 'Somebody from {name}’s neighborhood told him he was wasting his time with boxing. He has been quiet since. It got further in than it should have.',
  },
  {
    trait: 'reckless_brave',
    weight: 2,
    moraleDelta: -5,
    text: '{name} turned up with stitches in his eyebrow from something that was not boxing. He thought it was funny.',
  },
  {
    trait: 'chip_on_shoulder',
    weight: 2,
    moraleDelta: 8,
    text: 'Someone from {name}’s old block saw him training and laughed. He has been first through the door every morning since.',
  },
  {
    trait: 'chip_on_shoulder',
    weight: 2,
    moraleDelta: 6,
    text: '{name} heard a trainer from another gym call him "nobody special." He wrote the man’s name on the wall above the heavy bag.',
  },
  {
    trait: 'unfocused',
    weight: 2,
    moraleDelta: -5,
    text: '{name} missed two days. When he came back he would not say where he had been, and you decided not to ask. Yet.',
  },
];

/** Daily chance per fighter that his life produces an event. Rare is the
    point — on a full roster this lands roughly every month or so. */
const DAILY_EVENT_CHANCE = 0.0022;

export interface LifeEventResult {
  roster: RosterEntry[];
  lines: string[];
  milestones: string[];
}

export function runLifeEvents(roster: RosterEntry[], days: number): LifeEventResult {
  const lines: string[] = [];
  const milestones: string[] = [];
  let fired = false; // at most one event per advance — each should feel like news

  const next = roster.map((e) => {
    if (fired) return e;
    const traits = [...e.fighter.visibleTraits, ...e.fighter.hiddenTraits];
    const candidates = EVENTS.filter((ev) => traits.includes(ev.trait));
    if (!candidates.length) return e;
    if (Math.random() >= DAILY_EVENT_CHANCE * days) return e;

    const total = candidates.reduce((s, ev) => s + ev.weight, 0);
    let roll = Math.random() * total;
    let event = candidates[0];
    for (const ev of candidates) {
      roll -= ev.weight;
      if (roll <= 0) {
        event = ev;
        break;
      }
    }

    fired = true;
    const name = `${e.fighter.firstName} ${e.fighter.lastName}`;
    const text = event.text.replace(/\{name\}/g, name);
    lines.push(text);
    if (event.milestone) milestones.push(text);

    return {
      ...e,
      morale: clamp(e.morale + event.moraleDelta, 0, 100),
      trust: clamp(e.trust + (event.trustDelta ?? 0), 0, 100),
    };
  });

  return { roster: next, lines, milestones };
}
