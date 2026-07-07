/*
  Persistence
  --------------------------------------------------------------------------
  The save slot. v3 adds the roster (fighters who've joined the gym) and the
  walk-in queue (cards waiting at the door / in My Office). Region is still
  derived from the city, never stored. One reader/writer here keeps save logic
  out of the UI; the shape is versioned and migrated forward.
*/

import type { CityId } from '../game/cities';
import { getCity } from '../game/cities';
import type { RegionKey } from '../game/regions';
import type { Appearance } from '../game/appearance';
import type { WalkIn } from '../game/walkins';
import { DEFAULT_TIER, type RosterEntry } from '../game/roster';
import { initialRelationship } from '../game/relationship';
import { rollGrowth, rollBaseDues } from '../game/fighters';
import { generateCeilingRead } from '../game/potential';
import { snapshotAttrs } from '../game/training';
import { initPressState, type PressState } from '../game/press';
import { generateWorld, type WorldState } from '../game/world/population';
import type { FightOffer, BookedFight, FightReport } from '../game/fights';
import { generateEra, topUpEra, type EraState } from '../game/era/eraState';
import { seedFrom } from '../game/engine/fightEngine';
import { STARTING_MONEY, type FinanceEntry } from '../game/economy';
import type { Coach, CoachApplicant, CoachPosting } from '../game/coaches';
import {
  DEFAULT_UPGRADES,
  lockerCapacityFor,
  noLockerCapacityFor,
  type Upgrades,
} from '../game/upgrades';
import type { LogLine } from '../game/gymLog';
import type { MailItem } from '../game/mail/types';

export type { RosterEntry } from '../game/roster';

const STORAGE_KEY = 'sweet-science:save:v1';
export const SAVE_VERSION = 26;

/** One remembered moment in the gym's history. */
export interface LedgerEntry {
  dayCount: number;
  text: string;
}

export const MANAGER_START_AGE = 25;

export interface Manager {
  name: string;
  /** Fixed at 25 in every run, per the bible. */
  age: number;
  appearance: Appearance;
}

export interface GameSave {
  version: number;
  gymName: string;
  manager: Manager;
  cityId: CityId;
  /** Day-count since the 1975 epoch (see game/time.ts). */
  dayCount: number;
  /** The save's identity seed (v24) — the tick derives a per-day stream from
      it, so new systems are reproducible by construction. */
  seed: number;
  /** Cash on hand, in current (inflated) dollars. */
  money: number;
  /** Reputation penalty (≤0) from ruthless cuts; decays toward 0 (6C-4). */
  reputationMod: number;
  /** Settled monthly books, newest first (game/economy.ts). */
  finances: FinanceEntry[];
  /** Purchased gym upgrades (game/upgrades.ts). */
  upgrades: Upgrades;
  /** Coaches on staff (game/coaches.ts). */
  coaches: Coach[];
  /** The open coaching job, or null when you're not hiring. */
  coachPosting: CoachPosting | null;
  /** Coaches who've answered the posting, awaiting your decision. */
  coachApplicants: CoachApplicant[];
  /** The competitive world — rival rosters and independents (game/world). */
  world: WorldState;
  /** The era — the scripted history's seeded schedule, flags, purse weather,
      cast, and triggered-event memory (game/era, Living World Bible). */
  era: EraState;
  /** Open promoter offers awaiting an answer (game/fights.ts). */
  fightOffers: FightOffer[];
  /** Bouts on the calendar, resolved on their day by advanceTime. */
  bookedFights: BookedFight[];
  /** Full reports for recent bouts (for the fight-night screen), newest first. */
  recentFights: FightReport[];
  /** The mail — open questions first, then a short answered trail (v25). */
  mail: MailItem[];
  roster: RosterEntry[];
  walkIns: WalkIn[];
  /** The local paper — writers, venues, clippings (game/press.ts). */
  press: PressState;
  /** The gym ledger — remembered milestones, oldest first. */
  history: LedgerEntry[];
  /** The corkboard — latest gym-log lines, newest first. */
  recentLog: LogLine[];
  createdAt: number;
  updatedAt: number;
}

export interface NewGameDraft {
  gymName: string;
  manager: Manager;
  cityId: CityId;
}

export function createSaveFromDraft(draft: NewGameDraft): GameSave {
  const now = Date.now();
  return {
    version: SAVE_VERSION,
    gymName: draft.gymName,
    manager: draft.manager,
    cityId: draft.cityId,
    dayCount: 0,
    seed: seedFrom(`${draft.gymName}:${draft.cityId}:${now}`),
    money: STARTING_MONEY,
    reputationMod: 0,
    finances: [],
    upgrades: DEFAULT_UPGRADES,
    coaches: [],
    coachPosting: null,
    coachApplicants: [],
    world: generateWorld(draft.cityId, 0),
    era: generateEra(`${draft.gymName}:${draft.cityId}:${now}`, draft.cityId, 0),
    fightOffers: [],
    bookedFights: [],
    recentFights: [],
    mail: [],
    roster: [],
    walkIns: [],
    press: initPressState(draft.cityId),
    history: [
      {
        dayCount: 0,
        text: `You signed the lease and put the name on the door: ${draft.gymName}.`,
      },
    ],
    recentLog: [
      {
        dayCount: 0,
        text: 'The door is open. The bags are hung. Now you wait and see who walks in.',
      },
    ],
    createdAt: now,
    updatedAt: now,
  };
}

/** Region is always derived from the city — never stored. */
export function regionOf(save: GameSave): RegionKey {
  return getCity(save.cityId).region;
}

/** Locker holders currently in the gym. */
export function lockersUsed(save: GameSave): number {
  return save.roster.reduce((n, e) => n + (e.hasLocker ? 1 : 0), 0);
}

/** Fighters currently carried without a locker. */
export function noLockerUsed(save: GameSave): number {
  return save.roster.reduce((n, e) => n + (e.hasLocker ? 0 : 1), 0);
}

/** Total lockers, including upgrades (base 8, max 20 fully upgraded). */
export function lockerCapacity(save: GameSave): number {
  return lockerCapacityFor(save.upgrades);
}

/** Total bench places for men without a locker, including upgrades (base 4, max 8). */
export function noLockerCapacity(save: GameSave): number {
  return noLockerCapacityFor(save.upgrades);
}

/** Backfill fighter fields added across versions: publicReputation (v5) and
    the development-feel pair growth/growthKnown (v10). Existing fighters get a
    feel assigned now, undiscovered. */
function migrateFighter<
  T extends {
    publicReputation?: number;
    growth?: number;
    growthKnown?: boolean;
    baseDues?: number;
    ceilingRead?: string;
    potential?: number;
  },
>(f: T): T {
  return {
    ...f,
    publicReputation: f.publicReputation ?? 2,
    growth: f.growth ?? rollGrowth(0.2),
    growthKnown: f.growthKnown ?? false,
    baseDues: f.baseDues ?? rollBaseDues(),
    ceilingRead: f.ceilingRead ?? generateCeilingRead(f.potential ?? 50),
  };
}

/** Bring an older save forward. v2 lacked roster/walk-ins; v3 lacked hierarchy
    tiers; v4 lacked fighter publicReputation; v5 lacked the relationship layer;
    v6 lacked the living-world layer (press, ledger, gym log); v7 lacked the
    training fields; v8/v9 the progression history; v10 the dev feel; v11 the
    finances layer; v12 gym upgrades; v13 coaches; v14 coach assignment; v15
    coach job postings; v16 the lockerless trialist patience pair; v17 the
    competitive world; v18 talent-poaching (poachInterest + reputationMod);
    v19 the fighter ceiling read; v20 world-fighter normalization (cached full
    fighters backfilled, local-indie ranks cleared). Pre-v2 shell saves can't be
    resumed — drop them. */
/** Bring any historical save shape forward to the current version.
    Exported for the migration fixture tests — the UI goes through
    loadSaveOutcome(). */
export function migrate(raw: unknown): GameSave | null {
  if (!raw || typeof raw !== 'object') return null;
  const data = raw as Partial<GameSave>;

  if (
    typeof data.version === 'number' &&
    data.version >= 2 &&
    typeof data.gymName === 'string' &&
    data.manager &&
    typeof data.cityId === 'string' &&
    typeof data.dayCount === 'number'
  ) {
    const roster: RosterEntry[] = Array.isArray(data.roster)
      ? data.roster.map((e) => {
          const rel = initialRelationship(e.hasLocker);
          const fighter = migrateFighter(e.fighter);
          return {
            ...e,
            tier: e.tier ?? DEFAULT_TIER,
            morale: e.morale ?? rel.morale,
            trust: e.trust ?? rel.trust,
            lockerLossCount: e.lockerLossCount ?? 0,
            focus: e.focus ?? null,
            coachId: e.coachId ?? null,
            // v16 — lockerless trialist patience. Existing lockerless men get a
            // generous clock so the migration never evicts anyone unexpectedly.
            trialPatience: e.trialPatience ?? (e.hasLocker ? 100 : 120),
            lockerRequested: e.lockerRequested ?? false,
            poachInterest: e.poachInterest ?? 0,
            // v21 — the fight layer: every man keeps a record and a bout ledger.
            record: e.record ?? { wins: 0, losses: 0, draws: 0, kos: 0 },
            bouts: e.bouts ?? [],
            restUntil: e.restUntil ?? 0,
            careerEarnings: e.careerEarnings ?? 0,
            lastDelta: e.lastDelta ?? {},
            // Begin tracking progression from now for pre-v9 fighters.
            history: e.history ?? [snapshotAttrs(fighter.attributes, data.dayCount!)],
            fighter,
          };
        })
      : [];
    const walkIns: WalkIn[] = Array.isArray(data.walkIns)
      ? data.walkIns.map((w) => ({ ...w, fighter: migrateFighter(w.fighter) }))
      : [];
    return {
      version: SAVE_VERSION,
      gymName: data.gymName,
      manager: data.manager,
      cityId: data.cityId as CityId,
      dayCount: data.dayCount,
      // v24 — the identity seed; older saves derive it from stable identity
      seed:
        data.seed ?? seedFrom(`${data.gymName}:${data.cityId}:${data.createdAt ?? 0}`),
      money: typeof data.money === 'number' ? data.money : STARTING_MONEY,
      reputationMod: typeof data.reputationMod === 'number' ? data.reputationMod : 0,
      finances: Array.isArray(data.finances) ? data.finances : [],
      upgrades: data.upgrades ?? DEFAULT_UPGRADES,
      coaches: Array.isArray(data.coaches) ? data.coaches : [],
      coachPosting: data.coachPosting ?? null,
      coachApplicants: Array.isArray(data.coachApplicants) ? data.coachApplicants : [],
      // v17 — the competitive world. Older saves get one generated around their
      // city now; it persists on the next commit. v20 normalizes its fighters:
      // any cached full Fighter gets the same backfills as roster fighters
      // (JSON drops undefined, so `full` may be absent entirely), and local
      // independents lose the blind national ranks that collided with the
      // seeded elite.
      world: data.world
        ? {
            ...data.world,
            fighters: data.world.fighters.map((wf) => ({
              ...wf,
              full: wf.full ? migrateFighter(wf.full) : null,
              nationalRank:
                wf.affiliation.kind === 'independent' && wf.fidelity === 'local'
                  ? null
                  : wf.nationalRank ?? null,
            })),
          }
        : generateWorld(data.cityId as CityId, data.dayCount),
      // v22 — the era. Older saves roll their history now, seeded from stable
      // identity; beats whose day already passed are marked done silently (no
      // retroactive year of clippings on load).
      // v26 — the full arc registry: an existing era is topped up with any
      // arcs it predates (rolled from its own seed; past beats silenced)
      era: topUpEra(
        data.era ??
          generateEra(
            `${data.gymName}:${data.cityId}:${data.createdAt ?? 0}`,
            data.cityId as CityId,
            data.dayCount,
          ),
        data.cityId as CityId,
        data.dayCount,
      ),
      fightOffers: Array.isArray(data.fightOffers) ? data.fightOffers : [],
      bookedFights: (Array.isArray(data.bookedFights) ? data.bookedFights : []).map(
        (b: BookedFight & { corner?: BookedFight['corner'] }) => ({
          ...b,
          // pre-v23 bouts: the staff worked every corner
          corner: b.corner ?? { mode: 'staff' as const, chiefSecondId: null, cutmanId: null },
        }),
      ),
      recentFights: Array.isArray(data.recentFights) ? data.recentFights : [],
      // v25 — the mail; older saves start with an empty tray
      mail: Array.isArray(data.mail) ? data.mail : [],
      roster,
      walkIns,
      press: data.press ?? initPressState(data.cityId as CityId),
      history:
        data.history ??
        [{ dayCount: 0, text: `You signed the lease and put the name on the door: ${data.gymName}.` }],
      recentLog: data.recentLog ?? [],
      createdAt: data.createdAt ?? Date.now(),
      updatedAt: data.updatedAt ?? Date.now(),
    };
  }
  return null;
}

/** The raw pre-migration save, kept whenever a version bump rewrites it. */
const BACKUP_KEY = `${STORAGE_KEY}:backup`;
/** A save that failed to load, preserved before anything overwrites it. */
const CORRUPT_KEY = `${STORAGE_KEY}:corrupt`;

export type LoadOutcome =
  /** a playable save; upgradedFrom set when migration bumped its version */
  | { kind: 'ok'; save: GameSave; upgradedFrom?: number }
  /** nothing saved */
  | { kind: 'none' }
  /** something is saved but can't be read — it is NOT cleared */
  | { kind: 'corrupt' };

/**
 * Load with the failure modes kept apart: "no save" and "broken save" are
 * different situations and must never look the same to the shell. On a
 * version upgrade the raw pre-migration text is copied to BACKUP_KEY first,
 * so one bad migration can never be the end of a career.
 */
export function loadSaveOutcome(): LoadOutcome {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return { kind: 'none' }; // storage unavailable entirely
  }
  if (!raw) return { kind: 'none' };
  try {
    const data = JSON.parse(raw) as Partial<GameSave>;
    const fromVersion = typeof data?.version === 'number' ? data.version : undefined;
    const save = migrate(data);
    if (!save) return { kind: 'corrupt' };
    if (fromVersion !== undefined && fromVersion < SAVE_VERSION) {
      try {
        localStorage.setItem(BACKUP_KEY, raw);
      } catch {
        /* quota — the backup is best-effort */
      }
      return { kind: 'ok', save, upgradedFrom: fromVersion };
    }
    return { kind: 'ok', save };
  } catch {
    return { kind: 'corrupt' };
  }
}

export function loadSave(): GameSave | null {
  const outcome = loadSaveOutcome();
  return outcome.kind === 'ok' ? outcome.save : null;
}

/** Once per session, before the first write: if whatever is already stored
    can't be read, preserve it under CORRUPT_KEY so a New Game can't destroy
    the evidence (or the career). */
let firstWriteGuardDone = false;
function preserveCorruptOnFirstWrite(): void {
  if (firstWriteGuardDone) return;
  firstWriteGuardDone = true;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    if (loadSaveOutcome().kind === 'corrupt') {
      localStorage.setItem(CORRUPT_KEY, raw);
    }
  } catch {
    /* ignore */
  }
}

export function writeSave(save: GameSave): void {
  try {
    preserveCorruptOnFirstWrite();
    const next: GameSave = { ...save, updatedAt: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable (private mode, quota) — fail quiet */
  }
}

export function hasSave(): boolean {
  return loadSave() !== null;
}

/** Cheap "is there a resumable save?" check — parses the key but skips migration
    (and so skips world generation). Mirrors migrate()'s acceptance guard so the
    Continue button never lights up for a save loadSave() would reject. */
export function savedGameExists(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw) as Partial<GameSave> | null;
    return (
      !!data &&
      typeof data.version === 'number' &&
      data.version >= 2 &&
      typeof data.gymName === 'string' &&
      !!data.manager &&
      typeof data.cityId === 'string' &&
      typeof data.dayCount === 'number'
    );
  } catch {
    return false;
  }
}

export function clearSave(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
