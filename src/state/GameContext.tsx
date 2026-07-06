/*
  GameContext
  --------------------------------------------------------------------------
  The single source of truth for the shell, the walk-in loop, and (Phase 4)
  roster management. Time advancement rolls walk-ins, ages the queue, and
  evaluates departures; the post-advance notice reports all three. Locker and
  hierarchy changes and cuts run through pure handlers.

  Purity note: all mutations are computed in event handlers (not inside
  setState updaters) using `saveRef` for the latest state, then committed once.
  Random rolls and side effects must never live in an updater — StrictMode
  double-invokes updaters, which would desync rolls from committed state.
*/

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { formatDate, type TimeStep } from '../game/time';
import { emitGameEvent } from '../game/events';
import { type Fighter, fighterFullName } from '../game/fighters';
import {
  snapshotAttrs,
  FOCUS_SLOTS_BASE,
  type TrainingFocus,
} from '../game/training';

/** A small gym can only carry so much staff. */
const MAX_COACHES = 4;
const MAX_REP_PENALTY = -0.3;

const randInt = (lo: number, hi: number) => lo + Math.floor(Math.random() * (hi - lo + 1));
/** A fresh trialist's starting patience (days). Generous — a valued man can
    wait a few months before he stops waiting for a gym that wants him. */
const freshPatience = () => randInt(80, 150);

/** Focused fighters a given trainer is currently running. */
const usedByManager = (roster: { focus: unknown; coachId: string | null }[]) =>
  roster.filter((e) => e.focus !== null && e.coachId === null).length;
const usedByCoach = (
  roster: { focus: unknown; coachId: string | null }[],
  coachId: string,
) => roster.filter((e) => e.focus !== null && e.coachId === coachId).length;
import { DEFAULT_TIER, type HierarchyTier, type RosterEntry } from '../game/roster';
import {
  initialRelationship,
  applyLockerTaken,
  applyLockerGranted,
  applyCutStayed,
  cutMoraleRipple,
  } from '../game/relationship';
import {
  resolveCut,
  type DepartureReason,
} from '../game/departures';
import {
  createSaveFromDraft,
  loadSave,
  writeSave,
  clearSave,
  savedGameExists,
  lockersUsed,
  noLockerUsed,
  lockerCapacity,
  noLockerCapacity,
  type GameSave,
  type NewGameDraft,
} from './persistence';
import {
  applyFightResult,
  applyResolvedFight,
  bookFromOffer,
  defaultCornerPlan,
  cornerQualityFor,
  fightEligible,
  type CornerPlan,
  type BookedFight,
} from '../game/fights';
import type { FightResult } from '../game/engine/fightEngine';
import { advanceTick, fightNightBlocks } from '../game/tick/advanceTick';
import type { AdvanceNotice } from '../game/tick/types';
import { formatMoney, upgradeCost } from '../game/economy';
import {
  specialtyName,
  type CoachPosting,
} from '../game/coaches';
import {
  trackName,
  effectGain,
  type UpgradeKey,
} from '../game/upgrades';

export type Screen = 'home' | 'settings' | 'newgame' | 'game';
export type RoomKey = 'office' | 'calendar' | 'gym' | 'locker' | 'press' | 'phone';
export type WalkInDecision = 'locker' | 'no_locker' | 'turn_away';


export type { AdvanceNotice, PoachEvent } from '../game/tick/types';

/** Everything that CHANGES as the game runs — consumers re-render on commits. */
interface GameStateValue {
  screen: Screen;
  activeRoom: RoomKey | null;
  save: GameSave | null;
  canContinue: boolean;

  arrival: AdvanceNotice | null;
  viewerIds: string[] | null;
  viewerIndex: number;
  profileId: string | null;
  flash: string | null;
  /** Signal a lockerless trialist you won't be offering a spot — collapses his
      patience so he moves on, without ejecting him outright. */
  /** The bout waiting on you tonight — set when a self-cornered fight is due. */
  liveBout: BookedFight | null;

  lockerCap: number;
  noLockerCap: number;
  /** Focused-training slots available — the manager plus coaches. */
  focusCapacity: number;
}

/** The stable action surface — one object for the whole session. Consumers
    that only dispatch (buttons, controls) should read THIS context and
    never re-render on state commits. */
interface GameActionsValue {

  goHome: () => void;
  openSettings: () => void;
  openNewGame: () => void;
  startGame: (draft: NewGameDraft) => void;
  continueGame: () => void;

  openRoom: (room: RoomKey) => void;
  closeRoom: () => void;

  advanceTime: (step: TimeStep) => void;

  viewArrivalsNow: () => void;
  dismissArrival: () => void;

  openWalkIns: (ids: string[], startIndex?: number) => void;
  closeWalkInViewer: () => void;
  decideWalkIn: (id: string, decision: WalkInDecision) => void;

  openProfile: (id: string) => void;
  closeProfile: () => void;
  setLocker: (id: string, hasLocker: boolean) => void;
  setTier: (id: string, tier: HierarchyTier) => void;
  setFocus: (id: string, focus: TrainingFocus | null) => void;
  setTrainer: (id: string, coachId: string | null) => void;
  cutFighter: (id: string) => void;
  stopConsidering: (id: string) => void;
  /** Answer a lockerless man who's asked you for a locker. */
  respondLockerRequest: (id: string, choice: 'grant' | 'wait' | 'honest') => void;
  purchaseUpgrade: (key: UpgradeKey) => void;
  /** Take a promoter's offer — the bout goes on the calendar (game/fights.ts). */
  bookFight: (offerId: string, corner?: CornerPlan) => void;
  /** Pass on an offer; the promoter looks elsewhere. */
  declineFightOffer: (offerId: string) => void;
  /** Change who works a booked bout's corner (any time before the bell). */
  setCornerPlan: (boutId: string, corner: CornerPlan) => void;
  /** Commit a live-cornered fight's result into the save. */
  settleLiveFight: (boutId: string, result: FightResult, oppFull: Fighter) => void;
  postCoachJob: (posting: CoachPosting) => void;
  cancelCoachJob: () => void;
  hireApplicant: (id: string) => void;
  passApplicant: (id: string) => void;
  fireCoach: (id: string) => void;
  clearFlash: () => void;
}

type GameContextValue = GameStateValue & GameActionsValue;

const GameStateContext = createContext<GameStateValue | null>(null);
const GameActionsContext = createContext<GameActionsValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<Screen>('home');
  const [activeRoom, setActiveRoom] = useState<RoomKey | null>(null);
  const [save, setSave] = useState<GameSave | null>(null);
  const [canContinue, setCanContinue] = useState<boolean>(() => savedGameExists());

  const [arrival, setArrival] = useState<AdvanceNotice | null>(null);
  const [viewerIds, setViewerIds] = useState<string[] | null>(null);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  // Latest save, readable synchronously in handlers so mutations stay pure.
  const saveRef = useRef<GameSave | null>(null);

  const commit = useCallback((next: GameSave) => {
    saveRef.current = next;
    setSave(next);
    writeSave(next);
    setCanContinue(true);
  }, []);

  const goHome = useCallback(() => {
    setActiveRoom(null);
    setArrival(null);
    setViewerIds(null);
    setProfileId(null);
    setFlash(null);
    setScreen('home');
    setCanContinue(savedGameExists());
  }, []);

  const openSettings = useCallback(() => setScreen('settings'), []);
  const openNewGame = useCallback(() => setScreen('newgame'), []);

  const startGame = useCallback(
    (draft: NewGameDraft) => {
      commit(createSaveFromDraft(draft));
      setActiveRoom(null);
      setScreen('game');
    },
    [commit],
  );

  const continueGame = useCallback(() => {
    const loaded = loadSave();
    if (!loaded) {
      // The key exists but the save can't be resumed (pre-v2 or corrupted) —
      // disable Continue instead of leaving a button that silently does nothing.
      setCanContinue(false);
      return;
    }
    // Persist any migration done on load (e.g. a v17 world generated for an
    // older save) so it's stable from here on.
    writeSave(loaded);
    saveRef.current = loaded;
    setSave(loaded);
    setActiveRoom(null);
    setScreen('game');
  }, []);

  const openRoom = useCallback((room: RoomKey) => setActiveRoom(room), []);
  const closeRoom = useCallback(() => setActiveRoom(null), []);

  const advanceTime = useCallback(
    (step: TimeStep) => {
      const prev = saveRef.current;
      if (!prev) return;
      // fight night stops the clock. A bout you're cornering can't pass by
      // unwatched: you can't advance past it until you've worked it (or
      // handed it to the staff).
      if (fightNightBlocks(prev)) {
        setFlash('Fight night. The corner\u2019s waiting on you.');
        return;
      }
      // The whole day advance is pure (game/tick); this handler only
      // commits the result and surfaces what happened.
      const result = advanceTick(prev, step);
      if (!result) return;
      commit(result.next);
      for (const e of result.events) emitGameEvent(e);
      if (result.notice) setArrival(result.notice);
    },
    [commit],
  );

  const openWalkIns = useCallback((ids: string[], startIndex = 0) => {
    if (!ids.length) return;
    setViewerIds(ids);
    setViewerIndex(startIndex);
  }, []);

  const viewArrivalsNow = useCallback(() => {
    const cur = arrival;
    if (cur && cur.arrived.length) {
      setViewerIds(cur.arrived.map((f) => f.id));
      setViewerIndex(0);
    }
    setArrival(null);
  }, [arrival]);

  const dismissArrival = useCallback(() => setArrival(null), []);
  const closeWalkInViewer = useCallback(() => setViewerIds(null), []);

  const decideWalkIn = useCallback(
    (id: string, decision: WalkInDecision) => {
      const prev = saveRef.current;
      if (!prev) return;
      const target = prev.walkIns.find((w) => w.fighter.id === id);
      if (!target) return;

      // Capacity guards (the UI also disables these, but never trust the UI).
      if (decision === 'locker' && lockersUsed(prev) >= lockerCapacity(prev)) {
        setFlash('Every locker is full. Free one before you give another.');
        return;
      }
      if (decision === 'no_locker' && noLockerUsed(prev) >= noLockerCapacity(prev)) {
        setFlash('No room to carry another fighter without a locker.');
        return;
      }

      const walkIns = prev.walkIns.filter((w) => w.fighter.id !== id);
      let roster = prev.roster;
      let history = prev.history;
      if (decision === 'locker' || decision === 'no_locker') {
        const hasLocker = decision === 'locker';
        const entry: RosterEntry = {
          fighter: target.fighter,
          hasLocker,
          tier: DEFAULT_TIER,
          joinedDayCount: prev.dayCount,
          ...initialRelationship(hasLocker),
          focus: null,
          coachId: null,
          trialPatience: freshPatience(),
          lockerRequested: false,
          poachInterest: 0,
          record: { wins: 0, losses: 0, draws: 0, kos: 0 },
          bouts: [],
          restUntil: 0,
          careerEarnings: 0,
          lastDelta: {},
          history: [snapshotAttrs(target.fighter.attributes, prev.dayCount)],
        };
        roster = [...prev.roster, entry];
        history = [
          ...prev.history,
          {
            dayCount: prev.dayCount,
            text: `${fighterFullName(target.fighter)} walked in off the street and you ${
              hasLocker ? 'gave him a locker' : 'let him train on provisional terms'
            }.`,
          },
        ].slice(-250);
        emitGameEvent({ type: 'walkin_accepted', fighterId: id, withLocker: hasLocker });
      } else {
        emitGameEvent({ type: 'walkin_turned_away', fighterId: id });
      }

      commit({ ...prev, walkIns, roster, history });
      setViewerIndex((i) => i + 1);
    },
    [commit],
  );

  // --- roster management ---------------------------------------------------

  const openProfile = useCallback((id: string) => setProfileId(id), []);
  const closeProfile = useCallback(() => setProfileId(null), []);
  const clearFlash = useCallback(() => setFlash(null), []);

  const bookFight = useCallback(
    (offerId: string, corner?: CornerPlan) => {
      const prev = saveRef.current;
      if (!prev) return;
      const offer = prev.fightOffers.find((o) => o.id === offerId);
      if (!offer) return;
      const entry = prev.roster.find((e) => e.fighter.id === offer.fighterId);
      if (!entry || !fightEligible(entry, prev.dayCount, prev.bookedFights)) {
        setFlash('He can’t take that fight right now.');
        return;
      }
      const booked = bookFromOffer(offer, corner ?? defaultCornerPlan(entry, prev.coaches));
      const fd = formatDate(booked.onDay);
      const history = [
        ...prev.history,
        {
          dayCount: prev.dayCount,
          text: `You booked ${fighterFullName(entry.fighter)} — ${booked.rounds} rounds at the ${booked.venue}, ${fd.month} ${fd.day}. Purse ${formatMoney(booked.purse)}.`,
        },
      ].slice(-250);
      commit({
        ...prev,
        fightOffers: prev.fightOffers.filter((o) => o.id !== offerId),
        bookedFights: [...prev.bookedFights, booked],
        history,
        recentLog: [
          {
            dayCount: prev.dayCount,
            text: `${entry.fighter.lastName} fights ${fd.month} ${fd.day} at the ${booked.venue}. Tell the floor.`,
          },
          ...prev.recentLog,
        ].slice(0, 12),
      });
    },
    [commit],
  );

  const declineFightOffer = useCallback(
    (offerId: string) => {
      const prev = saveRef.current;
      if (!prev) return;
      if (!prev.fightOffers.some((o) => o.id === offerId)) return;
      commit({ ...prev, fightOffers: prev.fightOffers.filter((o) => o.id !== offerId) });
    },
    [commit],
  );

  const setCornerPlan = useCallback(
    (boutId: string, corner: CornerPlan) => {
      const prev = saveRef.current;
      if (!prev) return;
      if (!prev.bookedFights.some((b) => b.id === boutId)) return;
      commit({
        ...prev,
        bookedFights: prev.bookedFights.map((b) => (b.id === boutId ? { ...b, corner } : b)),
      });
    },
    [commit],
  );

  /**
   * A fight you cornered live is over — fan its consequences into the save.
   * oppFull must be the promoted opponent from prepareFight (the man who was
   * actually in the ring), so rematches meet the same fighter.
   */
  const settleLiveFight = useCallback(
    (boutId: string, result: FightResult, oppFull: Fighter) => {
      const prev = saveRef.current;
      if (!prev) return;
      const bout = prev.bookedFights.find((b) => b.id === boutId);
      if (!bout || bout.onDay > prev.dayCount) return;
      const remaining = prev.bookedFights.filter((b) => b.id !== boutId);
      const entry = prev.roster.find((e) => e.fighter.id === bout.fighterId);
      const opp = prev.world.fighters.find((f) => f.id === bout.opponentId);
      if (!entry || !opp) {
        commit({ ...prev, bookedFights: remaining });
        return;
      }
      const resolved = applyFightResult(
        {
          booked: bout,
          entry,
          opponent: opp,
          cornerQuality: cornerQualityFor(bout.corner, prev.coaches),
          dayCount: prev.dayCount,
        },
        oppFull,
        result,
      );
      // same applier as the off-screen sim (game/fights) — consequences
      // can never drift between the two paths
      commit({
        ...applyResolvedFight(prev, resolved, prev.dayCount),
        bookedFights: remaining,
        recentLog: [{ dayCount: prev.dayCount, text: resolved.logLine }, ...prev.recentLog].slice(0, 12),
      });
    },
    [commit],
  );

  const purchaseUpgrade = useCallback(
    (key: UpgradeKey) => {
      const prev = saveRef.current;
      if (!prev) return;
      const level = prev.upgrades[key];
      const year = formatDate(prev.dayCount).year;
      const cost = upgradeCost(key, level, year);
      if (cost === null) {
        setFlash(`${trackName(key)} is already at the top of the line.`);
        return;
      }
      if (prev.money < cost) {
        setFlash(`You can’t afford that — it runs ${formatMoney(cost)}.`);
        return;
      }
      const gain = effectGain(key, level) ?? '';
      const upgrades = { ...prev.upgrades, [key]: level + 1 };
      const history = [
        ...prev.history,
        {
          dayCount: prev.dayCount,
          text: `You put ${formatMoney(cost)} into the gym — ${trackName(key).toLowerCase()} (${gain}).`,
        },
      ].slice(-250);
      commit({ ...prev, upgrades, money: prev.money - cost, history });
      setFlash(`Money well spent. ${trackName(key)}: ${gain}.`);
    },
    [commit],
  );

  const postCoachJob = useCallback(
    (posting: CoachPosting) => {
      const prev = saveRef.current;
      if (!prev) return;
      // A fresh posting starts a fresh search.
      commit({ ...prev, coachPosting: posting, coachApplicants: [] });
      setFlash(
        posting === 'any'
          ? 'Word is out: you’re looking for a coach.'
          : `Word is out: you’re looking for a ${specialtyName(posting).toLowerCase()}.`,
      );
    },
    [commit],
  );

  const cancelCoachJob = useCallback(() => {
    const prev = saveRef.current;
    if (!prev) return;
    commit({ ...prev, coachPosting: null, coachApplicants: [] });
  }, [commit]);

  const passApplicant = useCallback(
    (id: string) => {
      const prev = saveRef.current;
      if (!prev) return;
      commit({ ...prev, coachApplicants: prev.coachApplicants.filter((a) => a.coach.id !== id) });
    },
    [commit],
  );

  const hireApplicant = useCallback(
    (id: string) => {
      const prev = saveRef.current;
      if (!prev) return;
      if (prev.coaches.length >= MAX_COACHES) {
        setFlash('Your staff is full. Let someone go before you take on another.');
        return;
      }
      const applicant = prev.coachApplicants.find((a) => a.coach.id === id);
      if (!applicant) return;
      const history = [
        ...prev.history,
        { dayCount: prev.dayCount, text: `You brought ${applicant.coach.name} onto the staff.` },
      ].slice(-250);
      // Hiring fills the role and closes the search.
      commit({
        ...prev,
        coaches: [...prev.coaches, applicant.coach],
        coachPosting: null,
        coachApplicants: [],
        history,
      });
      setFlash(`${applicant.coach.name} is on the staff.`);
    },
    [commit],
  );

  const fireCoach = useCallback(
    (id: string) => {
      const prev = saveRef.current;
      if (!prev) return;
      const coach = prev.coaches.find((c) => c.id === id);
      if (!coach) return;
      const coaches = prev.coaches.filter((c) => c.id !== id);

      // His fighters fall to the manager if there's room, else back to general.
      let managerUsed = usedByManager(prev.roster);
      const roster = prev.roster.map((e) => {
        if (e.focus === null || e.coachId !== id) return e;
        if (managerUsed < FOCUS_SLOTS_BASE) {
          managerUsed += 1;
          return { ...e, coachId: null };
        }
        return { ...e, focus: null, coachId: null };
      });

      const history = [
        ...prev.history,
        { dayCount: prev.dayCount, text: `You let ${coach.name} go.` },
      ].slice(-250);
      commit({ ...prev, coaches, roster, history });
      setFlash(`You let ${coach.name} go.`);
    },
    [commit],
  );

  const setLocker = useCallback(
    (id: string, hasLocker: boolean) => {
      const prev = saveRef.current;
      if (!prev) return;
      const entry = prev.roster.find((e) => e.fighter.id === id);
      if (!entry || entry.hasLocker === hasLocker) return;

      if (hasLocker && lockersUsed(prev) >= lockerCapacity(prev)) {
        setFlash('Every locker is full. Free one before you give another.');
        return;
      }
      if (!hasLocker && noLockerUsed(prev) >= noLockerCapacity(prev)) {
        setFlash('No room to carry another fighter without a locker. Cut someone first.');
        return;
      }
      const roster = prev.roster.map((e) => {
        if (e.fighter.id !== id) return e;
        // Pulling a locker stings and is remembered; giving one lifts him, but
        // never fully undoes the memory. Repeats compound (see relationship.ts).
        // A man who loses his locker also loses his focused-training slot.
        const rel = hasLocker ? applyLockerGranted(e) : applyLockerTaken(e);
        return {
          ...e,
          hasLocker,
          focus: hasLocker ? e.focus : null,
          coachId: hasLocker ? e.coachId : null,
          // Granting answers any pending request; pulling a locker drops him back
          // to a trialist with a fresh (if shaken) clock.
          lockerRequested: false,
          trialPatience: hasLocker ? e.trialPatience : freshPatience(),
          // A man off the wall is no longer being courted as your fighter.
          poachInterest: hasLocker ? e.poachInterest : 0,
          ...rel,
        };
      });
      commit({ ...prev, roster });
      emitGameEvent({ type: hasLocker ? 'locker_granted' : 'locker_taken', fighterId: id });
    },
    [commit],
  );

  const setTier = useCallback(
    (id: string, tier: HierarchyTier) => {
      const prev = saveRef.current;
      if (!prev) return;
      const roster = prev.roster.map((e) =>
        e.fighter.id === id ? { ...e, tier } : e,
      );
      commit({ ...prev, roster });
    },
    [commit],
  );

  const setFocus = useCallback(
    (id: string, focus: TrainingFocus | null) => {
      const prev = saveRef.current;
      if (!prev) return;
      const entry = prev.roster.find((e) => e.fighter.id === id);
      if (!entry) return;

      const apply = (patch: Partial<typeof entry>) =>
        commit({
          ...prev,
          roster: prev.roster.map((e) => (e.fighter.id === id ? { ...e, ...patch } : e)),
        });

      // Clear focus.
      if (focus === null) {
        if (entry.focus === null) return;
        apply({ focus: null, coachId: null });
        return;
      }
      if (!entry.hasLocker) {
        setFlash('Only locker holders get your focused attention.');
        return;
      }
      // Already focused — just change the area, keep his trainer.
      if (entry.focus !== null) {
        apply({ focus });
        return;
      }
      // Newly focusing — find a trainer with a free slot, the manager first.
      let coachId: string | null;
      if (usedByManager(prev.roster) < FOCUS_SLOTS_BASE) {
        coachId = null;
      } else {
        const free = prev.coaches.find((c) => usedByCoach(prev.roster, c.id) < c.slots);
        if (!free) {
          setFlash('No training slots free — hire a coach or free one up.');
          return;
        }
        coachId = free.id;
      }
      apply({ focus, coachId });
    },
    [commit],
  );

  const setTrainer = useCallback(
    (id: string, coachId: string | null) => {
      const prev = saveRef.current;
      if (!prev) return;
      const entry = prev.roster.find((e) => e.fighter.id === id);
      if (!entry || entry.focus === null || entry.coachId === coachId) return;

      if (coachId === null) {
        const used = usedByManager(prev.roster) - (entry.coachId === null ? 1 : 0);
        if (used >= FOCUS_SLOTS_BASE) {
          setFlash('You can only run so many fighters yourself.');
          return;
        }
      } else {
        const coach = prev.coaches.find((c) => c.id === coachId);
        if (!coach) return;
        const used = usedByCoach(prev.roster, coachId) - (entry.coachId === coachId ? 1 : 0);
        if (used >= coach.slots) {
          setFlash(`${coach.name} has no free slots.`);
          return;
        }
      }
      commit({
        ...prev,
        roster: prev.roster.map((e) => (e.fighter.id === id ? { ...e, coachId } : e)),
      });
    },
    [commit],
  );

  const cutFighter = useCallback(
    (id: string) => {
      const prev = saveRef.current;
      if (!prev) return;
      const entry = prev.roster.find((e) => e.fighter.id === id);
      if (!entry) return;

      const name = fighterFullName(entry.fighter);
      // A cut locker holder can only "stay and earn it back" if the bench has
      // room — with the floor full there's nothing to stay on, so he's gone.
      // (Keeps the no-locker cap honest; every other path guards it too.)
      const benchFull = entry.hasLocker && noLockerUsed(prev) >= noLockerCapacity(prev);
      const outcome = benchFull ? 'vanish' : resolveCut(entry);
      emitGameEvent({ type: 'fighter_cut', fighterId: id, stayed: outcome === 'stay' });

      const memory = {
        dayCount: prev.dayCount,
        text:
          outcome === 'vanish'
            ? `You cut ${name}. He cleared out his locker and was gone by morning.`
            : `You cut ${name}. He asked to stay and earn it back. That told you something.`,
      };
      const history = [...prev.history, memory].slice(-250);

      // Cutting a man dents how the gym is regarded — worse for one you'd
      // committed to, a loyal man, or a locker holder you're discarding. It
      // stacks if you churn several before it heals, and lowers your draw and
      // unsettles your remaining talent until it does (6C-4).
      let hit = 0.01;
      if (entry.tier === 'must_keep') hit += 0.03;
      if (entry.trust >= 55) hit += 0.02;
      if (entry.hasLocker) hit += 0.02;
      const reputationMod = Math.max(MAX_REP_PENALTY, prev.reputationMod - hit);

      // The room feels it. A cut sends a small morale ripple through everyone
      // else — worse for the men who care, shrugged off by the ruthless.
      const ripple = (e: RosterEntry): RosterEntry =>
        e.fighter.id === id
          ? e
          : { ...e, morale: Math.max(0, Math.min(100, e.morale + cutMoraleRipple(e))) };

      if (outcome === 'vanish') {
        const roster = prev.roster.filter((e) => e.fighter.id !== id).map(ripple);
        commit({ ...prev, roster, history, reputationMod });
        setFlash(`${name} cleared out his locker and was gone by morning.`);
      } else {
        const roster = prev.roster.map((e) =>
          e.fighter.id === id
            ? {
                ...e,
                hasLocker: false,
                tier: 'chopping' as HierarchyTier,
                focus: null,
                coachId: null,
                trialPatience: freshPatience(),
                lockerRequested: false,
                poachInterest: 0,
                ...applyCutStayed(e),
              }
            : ripple(e),
        );
        commit({ ...prev, roster, history, reputationMod });
        setFlash(`${name} asked to stay and earn his spot back — no locker.`);
      }
      setProfileId((cur) => (cur === id && outcome === 'vanish' ? null : cur));
    },
    [commit],
  );

  const stopConsidering = useCallback(
    (id: string) => {
      const prev = saveRef.current;
      if (!prev) return;
      const entry = prev.roster.find((e) => e.fighter.id === id);
      if (!entry || entry.hasLocker) return;
      const name = fighterFullName(entry.fighter);
      // You don't eject him — you let him know there's no spot coming. His
      // patience collapses; he'll drift off on his own within a couple of weeks.
      const roster = prev.roster.map((e) =>
        e.fighter.id === id
          ? {
              ...e,
              trialPatience: randInt(7, 16),
              lockerRequested: false,
              morale: Math.max(0, e.morale - 8),
            }
          : e,
      );
      const history = [
        ...prev.history,
        { dayCount: prev.dayCount, text: `You let ${name} know you weren’t planning to offer him a spot.` },
      ].slice(-250);
      commit({ ...prev, roster, history });
      setFlash(`You told ${name} where things stood. He won’t hang around long.`);
    },
    [commit],
  );

  const respondLockerRequest = useCallback(
    (id: string, choice: 'grant' | 'wait' | 'honest') => {
      const prev = saveRef.current;
      if (!prev) return;
      const entry = prev.roster.find((e) => e.fighter.id === id);
      if (!entry || entry.hasLocker || !entry.lockerRequested) return;
      const name = fighterFullName(entry.fighter);

      if (choice === 'grant') {
        if (lockersUsed(prev) >= lockerCapacity(prev)) {
          setFlash('Every locker is full. Free one before you give another.');
          return;
        }
        const roster = prev.roster.map((e) =>
          e.fighter.id === id
            ? { ...e, hasLocker: true, lockerRequested: false, ...applyLockerGranted(e) }
            : e,
        );
        const history = [
          ...prev.history,
          { dayCount: prev.dayCount, text: `${name} asked for a future here, and you gave him a locker.` },
        ].slice(-250);
        commit({ ...prev, roster, history });
        emitGameEvent({ type: 'locker_granted', fighterId: id });
        setFlash(`${name} has a locker. Now you’ll see who he really is.`);
        return;
      }

      // Wait — he keeps working on faith, but it costs him; Honest — you tell him
      // straight there's no room, and he respects it even as he starts to move on.
      const patch =
        choice === 'wait'
          ? { trialPatience: Math.max(8, entry.trialPatience - 25), morale: Math.max(0, entry.morale - 10) }
          : { trialPatience: randInt(10, 20), morale: Math.max(0, entry.morale - 4) };
      const roster = prev.roster.map((e) =>
        e.fighter.id === id ? { ...e, ...patch, lockerRequested: false } : e,
      );
      const text =
        choice === 'wait'
          ? `${name} asked about his future. You asked him to keep waiting.`
          : `${name} asked about his future. You told him straight there was no room.`;
      const history = [...prev.history, { dayCount: prev.dayCount, text }].slice(-250);
      commit({ ...prev, roster, history });
      setFlash(
        choice === 'wait'
          ? `You asked ${name} to be patient. He’ll give it a while longer.`
          : `You were honest with ${name}. He respected it — but he’ll likely move on.`,
      );
    },
    [commit],
  );

  // the bout waiting on you tonight — advance stopped on its day
  const liveBout = useMemo<BookedFight | null>(
    () =>
      save?.bookedFights.find((b) => b.corner.mode === 'self' && b.onDay <= save.dayCount) ??
      null,
    [save],
  );

  const stateValue = useMemo<GameStateValue>(
    () => ({
      screen,
      activeRoom,
      save,
      canContinue,
      arrival,
      viewerIds,
      viewerIndex,
      profileId,
      flash,
      liveBout,
      lockerCap: save ? lockerCapacity(save) : 0,
      noLockerCap: save ? noLockerCapacity(save) : 0,
      focusCapacity:
        FOCUS_SLOTS_BASE + (save ? save.coaches.reduce((s, c) => s + c.slots, 0) : 0),
    }),
    [screen, activeRoom, save, canContinue, arrival, viewerIds, viewerIndex, profileId, flash, liveBout],
  );

  // Every member is a stable useCallback, so this object is created once per
  // session — action-only consumers never re-render on commits.
  const actionsValue = useMemo<GameActionsValue>(
    () => ({
      goHome,
      openSettings,
      openNewGame,
      startGame,
      continueGame,
      openRoom,
      closeRoom,
      advanceTime,
      viewArrivalsNow,
      dismissArrival,
      openWalkIns,
      closeWalkInViewer,
      decideWalkIn,
      openProfile,
      closeProfile,
      setLocker,
      setTier,
      setFocus,
      setTrainer,
      cutFighter,
      stopConsidering,
      respondLockerRequest,
      purchaseUpgrade,
      bookFight,
      declineFightOffer,
      setCornerPlan,
      settleLiveFight,
      postCoachJob,
      cancelCoachJob,
      hireApplicant,
      passApplicant,
      fireCoach,
      clearFlash,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <GameActionsContext.Provider value={actionsValue}>
      <GameStateContext.Provider value={stateValue}>{children}</GameStateContext.Provider>
    </GameActionsContext.Provider>
  );
}


// eslint-disable-next-line react-refresh/only-export-components
export function useGameState(): GameStateValue {
  const ctx = useContext(GameStateContext);
  if (!ctx) throw new Error('useGameState must be used within a GameProvider');
  return ctx;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useGameActions(): GameActionsValue {
  const ctx = useContext(GameActionsContext);
  if (!ctx) throw new Error('useGameActions must be used within a GameProvider');
  return ctx;
}

/** Compatibility hook: state + actions in one object. Prefer useGameState /
    useGameActions in new code — action-only consumers skip commit re-renders. */
// eslint-disable-next-line react-refresh/only-export-components
export function useGame(): GameContextValue {
  const state = useGameState();
  const actions = useGameActions();
  return useMemo(() => ({ ...state, ...actions }), [state, actions]);
}

export { clearSave, lockersUsed, noLockerUsed };
export type { DepartureReason };
