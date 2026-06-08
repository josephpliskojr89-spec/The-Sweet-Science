/*
  GameContext
  --------------------------------------------------------------------------
  The single source of truth for the shell: which screen is showing, which
  room (if any) is open, and the live game save. UI components read and act
  through this context rather than touching persistence or time directly.

  Phase 1 is a small state machine — Home -> (New Game | Continue) -> Gym, with
  Settings reachable from Home. The New Game flow itself (gym naming, manager
  creation, city selection, opening scene) is Phase 2 and will slot in between
  Home and Gym without disturbing this contract.
*/

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { RegionKey } from '../game/regions';
import { advance, type TimeStep } from '../game/time';
import {
  createNewSave,
  loadSave,
  writeSave,
  clearSave,
  type GameSave,
} from './persistence';

export type Screen = 'home' | 'settings' | 'game';

export type RoomKey = 'office' | 'calendar' | 'gym' | 'locker';

interface GameContextValue {
  screen: Screen;
  /** The room currently open over the gym floor, or null when on the floor. */
  activeRoom: RoomKey | null;
  /** Live save while in-game; null on the home/settings screens. */
  save: GameSave | null;
  /** Whether a resumable save exists on disk (drives Continue). */
  canContinue: boolean;

  goHome: () => void;
  openSettings: () => void;
  /** Phase 1: starts directly into the gym with a chosen region.
      Phase 2's New Game flow will call this at the end of the opening scene. */
  startNewGame: (region: RegionKey) => void;
  continueGame: () => void;

  openRoom: (room: RoomKey) => void;
  closeRoom: () => void;

  advanceTime: (step: TimeStep) => void;
  /** Review-only: swap the regional gym background in place. Removed in Phase 2
      once the real city-driven region is locked at game start. */
  setRegion: (region: RegionKey) => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<Screen>('home');
  const [activeRoom, setActiveRoom] = useState<RoomKey | null>(null);
  const [save, setSave] = useState<GameSave | null>(null);
  const [canContinue, setCanContinue] = useState<boolean>(() => loadSave() !== null);

  const persist = useCallback((next: GameSave) => {
    writeSave(next);
    setSave(next);
    setCanContinue(true);
  }, []);

  const goHome = useCallback(() => {
    setActiveRoom(null);
    setScreen('home');
    setCanContinue(loadSave() !== null);
  }, []);

  const openSettings = useCallback(() => setScreen('settings'), []);

  const startNewGame = useCallback(
    (region: RegionKey) => {
      const fresh = createNewSave(region);
      persist(fresh);
      setActiveRoom(null);
      setScreen('game');
    },
    [persist],
  );

  const continueGame = useCallback(() => {
    const loaded = loadSave();
    if (!loaded) return;
    setSave(loaded);
    setActiveRoom(null);
    setScreen('game');
  }, []);

  const openRoom = useCallback((room: RoomKey) => setActiveRoom(room), []);
  const closeRoom = useCallback(() => setActiveRoom(null), []);

  const advanceTime = useCallback(
    (step: TimeStep) => {
      setSave((prev) => {
        if (!prev) return prev;
        const next: GameSave = { ...prev, dayCount: advance(prev.dayCount, step) };
        writeSave(next);
        return next;
      });
    },
    [],
  );

  const setRegion = useCallback((region: RegionKey) => {
    setSave((prev) => {
      if (!prev) return prev;
      const next: GameSave = { ...prev, region };
      writeSave(next);
      return next;
    });
  }, []);

  const value = useMemo<GameContextValue>(
    () => ({
      screen,
      activeRoom,
      save,
      canContinue,
      goHome,
      openSettings,
      startNewGame,
      continueGame,
      openRoom,
      closeRoom,
      advanceTime,
      setRegion,
    }),
    [
      screen,
      activeRoom,
      save,
      canContinue,
      goHome,
      openSettings,
      startNewGame,
      continueGame,
      openRoom,
      closeRoom,
      advanceTime,
      setRegion,
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

/** Exposed for a future "delete save" affordance in Settings. */
export { clearSave };
