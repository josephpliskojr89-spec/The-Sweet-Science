/*
  GameContext
  --------------------------------------------------------------------------
  The single source of truth for the shell and, now, the walk-in loop. Time
  advancement rolls new walk-ins and ages the queue; arrivals surface as a
  notice the player answers with View Now / View Later. The card viewer walks a
  sequence of walk-ins, and each decision (locker / no locker / turn away)
  updates the roster and queue.

  Flow: Home -> New Game -> Gym. Walk-in generation/persistence lives here so it
  never leaks into UI components.
*/

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { advance, TIME_STEP_DAYS, type TimeStep } from '../game/time';
import type { Fighter } from '../game/fighters';
import { rollNewWalkIns, ageWalkIns } from '../game/walkins';
import {
  createSaveFromDraft,
  loadSave,
  writeSave,
  clearSave,
  lockersUsed,
  LOCKER_CAP,
  type GameSave,
  type NewGameDraft,
  type RosterEntry,
} from './persistence';

export type Screen = 'home' | 'settings' | 'newgame' | 'game';
export type RoomKey = 'office' | 'calendar' | 'gym' | 'locker';
export type WalkInDecision = 'locker' | 'no_locker' | 'turn_away';

/** Reputation-driven quality of the walk-in pool. New gym = low; rises later. */
function qualityFor(_save: GameSave): number {
  return 0.2;
}

export interface ArrivalNotice {
  arrived: Fighter[];
  expired: Fighter[];
}

interface GameContextValue {
  screen: Screen;
  activeRoom: RoomKey | null;
  save: GameSave | null;
  canContinue: boolean;

  /** Notice shown after a time advance, until answered. */
  arrival: ArrivalNotice | null;
  /** The walk-in id sequence currently open in the card viewer, or null. */
  viewerIds: string[] | null;
  viewerIndex: number;

  goHome: () => void;
  openSettings: () => void;
  openNewGame: () => void;
  startGame: (draft: NewGameDraft) => void;
  continueGame: () => void;

  openRoom: (room: RoomKey) => void;
  closeRoom: () => void;

  advanceTime: (step: TimeStep) => void;

  /** Answer the arrival notice. */
  viewArrivalsNow: () => void;
  dismissArrival: () => void;

  /** Open a specific set of walk-ins (e.g. from the My Office queue). */
  openWalkIns: (ids: string[], startIndex?: number) => void;
  closeWalkInViewer: () => void;
  decideWalkIn: (id: string, decision: WalkInDecision) => void;

  lockerCap: number;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<Screen>('home');
  const [activeRoom, setActiveRoom] = useState<RoomKey | null>(null);
  const [save, setSave] = useState<GameSave | null>(null);
  const [canContinue, setCanContinue] = useState<boolean>(() => loadSave() !== null);

  const [arrival, setArrival] = useState<ArrivalNotice | null>(null);
  const [viewerIds, setViewerIds] = useState<string[] | null>(null);
  const [viewerIndex, setViewerIndex] = useState(0);

  const goHome = useCallback(() => {
    setActiveRoom(null);
    setArrival(null);
    setViewerIds(null);
    setScreen('home');
    setCanContinue(loadSave() !== null);
  }, []);

  const openSettings = useCallback(() => setScreen('settings'), []);
  const openNewGame = useCallback(() => setScreen('newgame'), []);

  const startGame = useCallback((draft: NewGameDraft) => {
    const fresh = createSaveFromDraft(draft);
    writeSave(fresh);
    setSave(fresh);
    setCanContinue(true);
    setActiveRoom(null);
    setScreen('game');
  }, []);

  const continueGame = useCallback(() => {
    const loaded = loadSave();
    if (!loaded) return;
    setSave(loaded);
    setActiveRoom(null);
    setScreen('game');
  }, []);

  const openRoom = useCallback((room: RoomKey) => setActiveRoom(room), []);
  const closeRoom = useCallback(() => setActiveRoom(null), []);

  const advanceTime = useCallback((step: TimeStep) => {
    setSave((prev) => {
      if (!prev) return prev;
      const days = TIME_STEP_DAYS[step];

      // Age the existing queue, then roll fresh arrivals.
      const aged = ageWalkIns(prev.walkIns, days);
      const fresh = rollNewWalkIns(days, prev.cityId, qualityFor(prev));

      const next: GameSave = {
        ...prev,
        dayCount: advance(prev.dayCount, step),
        walkIns: [...aged.surviving, ...fresh],
      };
      writeSave(next);

      if (fresh.length || aged.expired.length) {
        setArrival({
          arrived: fresh.map((w) => w.fighter),
          expired: aged.expired.map((w) => w.fighter),
        });
      }
      return next;
    });
  }, []);

  const openWalkIns = useCallback((ids: string[], startIndex = 0) => {
    if (!ids.length) return;
    setViewerIds(ids);
    setViewerIndex(startIndex);
  }, []);

  const viewArrivalsNow = useCallback(() => {
    setArrival((cur) => {
      if (cur && cur.arrived.length) {
        setViewerIds(cur.arrived.map((f) => f.id));
        setViewerIndex(0);
      }
      return null;
    });
  }, []);

  const dismissArrival = useCallback(() => setArrival(null), []);
  const closeWalkInViewer = useCallback(() => setViewerIds(null), []);

  const decideWalkIn = useCallback((id: string, decision: WalkInDecision) => {
    setSave((prev) => {
      if (!prev) return prev;
      const target = prev.walkIns.find((w) => w.fighter.id === id);
      if (!target) return prev;

      const walkIns = prev.walkIns.filter((w) => w.fighter.id !== id);
      let roster = prev.roster;

      if (decision === 'locker' || decision === 'no_locker') {
        const entry: RosterEntry = {
          fighter: target.fighter,
          hasLocker: decision === 'locker',
          joinedDayCount: prev.dayCount,
        };
        roster = [...prev.roster, entry];
      }

      const next: GameSave = { ...prev, walkIns, roster };
      writeSave(next);
      return next;
    });

    // Advance the viewer past the decided card.
    setViewerIndex((i) => i + 1);
  }, []);

  const value = useMemo<GameContextValue>(
    () => ({
      screen,
      activeRoom,
      save,
      canContinue,
      arrival,
      viewerIds,
      viewerIndex,
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
      lockerCap: LOCKER_CAP,
    }),
    [
      screen,
      activeRoom,
      save,
      canContinue,
      arrival,
      viewerIds,
      viewerIndex,
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

export { clearSave, lockersUsed };
