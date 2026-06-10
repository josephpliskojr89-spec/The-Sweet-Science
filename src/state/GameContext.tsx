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
import { advance, TIME_STEP_DAYS, type TimeStep } from '../game/time';
import { type Fighter, fighterFullName } from '../game/fighters';
import { rollNewWalkIns, ageWalkIns } from '../game/walkins';
import { DEFAULT_TIER, type HierarchyTier, type RosterEntry } from '../game/roster';
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
  LOCKER_CAP,
  NO_LOCKER_CAP,
  type GameSave,
  type NewGameDraft,
} from './persistence';

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
  cutFighter: (id: string) => void;
  clearFlash: () => void;

  lockerCap: number;
  noLockerCap: number;
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

      // Pure computation, once, in the handler — not in an updater.
      const aged = ageWalkIns(prev.walkIns, days);
      const fresh = rollNewWalkIns(days, {
        cityId: prev.cityId,
        dayCount: prev.dayCount,
        reputation: reputationFor(prev),
        quality: qualityFor(prev),
      });
      const dep = evaluateDepartures(prev.roster, days);

      commit({
        ...prev,
        dayCount: advance(prev.dayCount, step),
        walkIns: [...aged.surviving, ...fresh],
        roster: dep.staying,
      });

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
      if (decision === 'locker' && lockersUsed(prev) >= LOCKER_CAP) {
        setFlash('All twenty lockers are full. Free one before you give another.');
        return;
      }
      if (decision === 'no_locker' && noLockerUsed(prev) >= NO_LOCKER_CAP) {
        setFlash('No room to carry another fighter without a locker.');
        return;
      }

      const walkIns = prev.walkIns.filter((w) => w.fighter.id !== id);
      let roster = prev.roster;
      if (decision === 'locker' || decision === 'no_locker') {
        const entry: RosterEntry = {
          fighter: target.fighter,
          hasLocker: decision === 'locker',
          tier: DEFAULT_TIER,
          joinedDayCount: prev.dayCount,
        };
        roster = [...prev.roster, entry];
      }

      commit({ ...prev, walkIns, roster });
      setViewerIndex((i) => i + 1);
    },
    [commit],
  );

  // --- roster management ---------------------------------------------------

  const openProfile = useCallback((id: string) => setProfileId(id), []);
  const closeProfile = useCallback(() => setProfileId(null), []);
  const clearFlash = useCallback(() => setFlash(null), []);

  const setLocker = useCallback(
    (id: string, hasLocker: boolean) => {
      const prev = saveRef.current;
      if (!prev) return;
      const entry = prev.roster.find((e) => e.fighter.id === id);
      if (!entry || entry.hasLocker === hasLocker) return;

      if (hasLocker && lockersUsed(prev) >= LOCKER_CAP) {
        setFlash('All twenty lockers are full. Free one before you give another.');
        return;
      }
      if (!hasLocker && noLockerUsed(prev) >= NO_LOCKER_CAP) {
        setFlash('No room to carry another fighter without a locker. Cut someone first.');
        return;
      }
      const roster = prev.roster.map((e) =>
        e.fighter.id === id ? { ...e, hasLocker } : e,
      );
      commit({ ...prev, roster });
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

  const cutFighter = useCallback(
    (id: string) => {
      const prev = saveRef.current;
      if (!prev) return;
      const entry = prev.roster.find((e) => e.fighter.id === id);
      if (!entry) return;

      const name = fighterFullName(entry.fighter);
      const outcome = resolveCut(entry);

      if (outcome === 'vanish') {
        commit({ ...prev, roster: prev.roster.filter((e) => e.fighter.id !== id) });
        setFlash(`${name} cleared out his locker and was gone by morning.`);
      } else {
        const roster = prev.roster.map((e) =>
          e.fighter.id === id ? { ...e, hasLocker: false, tier: 'chopping' as HierarchyTier } : e,
        );
        commit({ ...prev, roster });
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
      cutFighter,
      clearFlash,
      lockerCap: LOCKER_CAP,
      noLockerCap: NO_LOCKER_CAP,
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
      cutFighter,
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
