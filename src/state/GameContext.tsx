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
import { advance, formatDate, seasonOf, TIME_STEP_DAYS, type TimeStep } from '../game/time';
import { emitGameEvent } from '../game/events';
import { type Fighter, fighterFullName } from '../game/fighters';
import { getCity } from '../game/cities';
import { observeGym, type LogLine } from '../game/gymLog';
import { runLifeEvents } from '../game/lifeEvents';
import { runPressCycle } from '../game/press';
import {
  trainFighter,
  snapshotAttrs,
  FOCUS_SLOTS_BASE,
  type TrainingFocus,
} from '../game/training';

/** Keep ~10 years of monthly progression snapshots per fighter. */
const MAX_HISTORY = 120;
/** A small gym can only carry so much staff. */
const MAX_COACHES = 4;
import { rollNewWalkIns, ageWalkIns } from '../game/walkins';
import { DEFAULT_TIER, type HierarchyTier, type RosterEntry } from '../game/roster';
import {
  initialRelationship,
  applyLockerTaken,
  applyLockerGranted,
  applyCutStayed,
  recover,
} from '../game/relationship';
import {
  evaluateDepartures,
  resolveCut,
  type Departure,
  type DepartureReason,
} from '../game/departures';
import {
  createSaveFromDraft,
  loadSave,
  writeSave,
  clearSave,
  lockersUsed,
  noLockerUsed,
  lockerCapacity,
  noLockerCapacity,
  type GameSave,
  type NewGameDraft,
} from './persistence';
import { monthlySummary, formatMoney, upgradeCost } from '../game/economy';
import { generateCoach } from '../game/coaches';
import {
  equipmentFactorFor,
  trackName,
  effectGain,
  type UpgradeKey,
} from '../game/upgrades';

export type Screen = 'home' | 'settings' | 'newgame' | 'game';
export type RoomKey = 'office' | 'calendar' | 'gym' | 'locker';
export type WalkInDecision = 'locker' | 'no_locker' | 'turn_away';

/** Reputation-driven quality of the walk-in pool. New gym = low; rises later. */
function qualityFor(_save: GameSave): number {
  return 0.2;
}

/** Gym reputation 0..1. Wired into walk-in frequency; real value lands Phase 6. */
function reputationFor(_save: GameSave): number {
  return 0;
}

export interface AdvanceNotice {
  arrived: Fighter[];
  expired: Fighter[];
  departed: Departure[];
}

interface GameContextValue {
  screen: Screen;
  activeRoom: RoomKey | null;
  save: GameSave | null;
  canContinue: boolean;

  arrival: AdvanceNotice | null;
  viewerIds: string[] | null;
  viewerIndex: number;
  profileId: string | null;
  flash: string | null;

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
  cutFighter: (id: string) => void;
  purchaseUpgrade: (key: UpgradeKey) => void;
  hireCoach: (id: string) => void;
  fireCoach: (id: string) => void;
  clearFlash: () => void;

  lockerCap: number;
  noLockerCap: number;
  /** Focused-training slots available — the manager plus coaches. */
  focusCapacity: number;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<Screen>('home');
  const [activeRoom, setActiveRoom] = useState<RoomKey | null>(null);
  const [save, setSave] = useState<GameSave | null>(null);
  const [canContinue, setCanContinue] = useState<boolean>(() => loadSave() !== null);

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
    setCanContinue(loadSave() !== null);
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
    if (!loaded) return;
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
      const days = TIME_STEP_DAYS[step];
      const fromDay = prev.dayCount;
      const toDay = advance(fromDay, step);
      const crossesMonth = formatDate(fromDay).month !== formatDate(toDay).month;

      // Pure computation, once, in the handler — not in an updater.
      const aged = ageWalkIns(prev.walkIns, days);
      const fresh = rollNewWalkIns(days, {
        cityId: prev.cityId,
        dayCount: fromDay,
        reputation: reputationFor(prev),
        quality: qualityFor(prev),
      });

      // The gym lives: moods recover, fighters develop on the floor (and age),
      // the floor gets observed (hidden traits can surface), and the fighters'
      // lives outside intrude — all before we see who's had enough and walked.
      const gymArchetype = getCity(prev.cityId).archetype;
      const equipment = equipmentFactorFor(prev.upgrades);
      // Your best coach lifts how well focused fighters develop.
      const bestSkill = prev.coaches.reduce((m, c) => Math.max(m, c.skill), 0);
      const coachBonus = 1 + bestSkill * 0.4;
      const trainingNotes: string[] = [];
      let roster = prev.roster.map((e) => {
        const settled = recover(e, days);
        const t = trainFighter(settled, gymArchetype, days, equipment, coachBonus);
        if (t.note) trainingNotes.push(t.note);
        return {
          ...settled,
          fighter: { ...settled.fighter, attributes: t.attributes },
          lastDelta: t.lastDelta,
        };
      });
      const obs = observeGym(roster, {
        days,
        fromDay,
        region: getCity(prev.cityId).region,
        season: seasonOf(toDay),
        crossesMonth,
      });
      roster = obs.roster;
      const life = runLifeEvents(roster, days);
      roster = life.roster;
      const dep = evaluateDepartures(roster, days);

      // The coach market turns over slowly — a man takes a job elsewhere, a
      // new face comes available.
      let coachMarket = prev.coachMarket;
      if (coachMarket.length && Math.random() < 0.12 * (days / 7)) {
        coachMarket = [...coachMarket.slice(1), generateCoach(prev.cityId, reputationFor(prev))];
      }

      // The paper runs on its own week, whether or not you read it.
      let press = prev.press;
      const cycles = Math.floor(toDay / 7) - Math.floor(fromDay / 7);
      for (let i = 0; i < cycles; i++) {
        press = runPressCycle(press, prev.cityId, toDay).state;
      }

      const newLines: LogLine[] = [
        ...trainingNotes.slice(0, 1),
        ...obs.lines,
        ...life.lines,
      ].map((text) => ({
        dayCount: toDay,
        text,
      }));
      const departureMemories = dep.departed.map((d) => ({
        dayCount: toDay,
        text:
          d.reason === 'left_for_opportunity'
            ? `${fighterFullName(d.entry.fighter)} left for a bigger operation. Someone noticed what you built in him.`
            : `${fighterFullName(d.entry.fighter)} quit. He felt forgotten — and maybe he was.`,
      }));
      const history = [
        ...prev.history,
        ...[...obs.milestones, ...life.milestones].map((text) => ({ dayCount: toDay, text })),
        ...departureMemories,
      ].slice(-250);

      // Take a monthly progression snapshot of each fighter's attributes.
      const staying = crossesMonth
        ? dep.staying.map((e) => ({
            ...e,
            history: [...e.history, snapshotAttrs(e.fighter.attributes, toDay)].slice(-MAX_HISTORY),
          }))
        : dep.staying;

      // Settle the books on the first of the month.
      let money = prev.money;
      let finances = prev.finances;
      if (crossesMonth) {
        const fd = formatDate(toDay);
        const sum = monthlySummary(staying, prev.upgrades, prev.coaches, fd.year);
        money = prev.money + sum.net;
        finances = [
          {
            dayCount: toDay,
            label: `${fd.month} ${fd.year}`,
            duesIncome: sum.duesIncome,
            overhead: sum.overhead,
            coachSalaries: sum.coachSalaries,
            net: sum.net,
            balance: money,
          },
          ...prev.finances,
        ].slice(0, 36);
      }

      commit({
        ...prev,
        dayCount: toDay,
        money,
        finances,
        coachMarket,
        walkIns: [...aged.surviving, ...fresh],
        roster: staying,
        press,
        history,
        recentLog: [...newLines, ...prev.recentLog].slice(0, 12),
      });

      for (const d of dep.departed) {
        emitGameEvent({
          type: d.reason === 'left_for_opportunity' ? 'fighter_left_for_opportunity' : 'fighter_quit',
          fighterId: d.entry.fighter.id,
        });
      }

      if (fresh.length || aged.expired.length || dep.departed.length) {
        setArrival({
          arrived: fresh.map((w) => w.fighter),
          expired: aged.expired.map((w) => w.fighter),
          departed: dep.departed,
        });
      }
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

  const hireCoach = useCallback(
    (id: string) => {
      const prev = saveRef.current;
      if (!prev) return;
      if (prev.coaches.length >= MAX_COACHES) {
        setFlash('Your staff is full. Let someone go before you take on another.');
        return;
      }
      const coach = prev.coachMarket.find((c) => c.id === id);
      if (!coach) return;
      const coaches = [...prev.coaches, coach];
      // Backfill the market so it doesn't run dry.
      const coachMarket = [
        ...prev.coachMarket.filter((c) => c.id !== id),
        generateCoach(prev.cityId, reputationFor(prev)),
      ];
      const history = [
        ...prev.history,
        { dayCount: prev.dayCount, text: `You brought ${coach.name} onto the staff.` },
      ].slice(-250);
      commit({ ...prev, coaches, coachMarket, history });
      setFlash(`${coach.name} is on the staff.`);
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
      const history = [
        ...prev.history,
        { dayCount: prev.dayCount, text: `You let ${coach.name} go.` },
      ].slice(-250);
      commit({ ...prev, coaches, history });
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
        return { ...e, hasLocker, focus: hasLocker ? e.focus : null, ...rel };
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

      if (focus !== null) {
        if (!entry.hasLocker) {
          setFlash('Only locker holders get your focused attention.');
          return;
        }
        const focusedCount = prev.roster.filter((e) => e.focus !== null).length;
        if (entry.focus === null && focusedCount >= FOCUS_SLOTS_BASE) {
          setFlash('No focused slots left — you can only give so much personal attention.');
          return;
        }
      }
      const roster = prev.roster.map((e) =>
        e.fighter.id === id ? { ...e, focus } : e,
      );
      commit({ ...prev, roster });
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
      const outcome = resolveCut(entry);
      emitGameEvent({ type: 'fighter_cut', fighterId: id, stayed: outcome === 'stay' });

      const memory = {
        dayCount: prev.dayCount,
        text:
          outcome === 'vanish'
            ? `You cut ${name}. He cleared out his locker and was gone by morning.`
            : `You cut ${name}. He asked to stay and earn it back. That told you something.`,
      };
      const history = [...prev.history, memory].slice(-250);

      if (outcome === 'vanish') {
        commit({ ...prev, roster: prev.roster.filter((e) => e.fighter.id !== id), history });
        setFlash(`${name} cleared out his locker and was gone by morning.`);
      } else {
        const roster = prev.roster.map((e) =>
          e.fighter.id === id
            ? { ...e, hasLocker: false, tier: 'chopping' as HierarchyTier, focus: null, ...applyCutStayed(e) }
            : e,
        );
        commit({ ...prev, roster, history });
        setFlash(`${name} asked to stay and earn his spot back — no locker.`);
      }
      setProfileId((cur) => (cur === id && outcome === 'vanish' ? null : cur));
    },
    [commit],
  );

  const value = useMemo<GameContextValue>(
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
      cutFighter,
      purchaseUpgrade,
      hireCoach,
      fireCoach,
      clearFlash,
      lockerCap: save ? lockerCapacity(save) : 0,
      noLockerCap: save ? noLockerCapacity(save) : 0,
      focusCapacity:
        FOCUS_SLOTS_BASE + (save ? save.coaches.reduce((s, c) => s + c.slots, 0) : 0),
    }),
    [
      screen,
      activeRoom,
      save,
      canContinue,
      arrival,
      viewerIds,
      viewerIndex,
      profileId,
      flash,
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
      cutFighter,
      purchaseUpgrade,
      hireCoach,
      fireCoach,
      clearFlash,
    ],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within a GameProvider');
  return ctx;
}

export { clearSave, lockersUsed, noLockerUsed };
export type { DepartureReason };
