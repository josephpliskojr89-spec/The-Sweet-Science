/*
  GameContext
  --------------------------------------------------------------------------
  The single source of truth for the shell: which screen is showing, which
  room (if any) is open, and the live game save. UI reads and acts through this
  context rather than touching persistence or time directly.

  Flow: Home -> New Game (Phase 2 multi-step + opening scene) -> Gym, with
  Settings and Continue reachable from Home. The New Game screen owns its own
  step state and hands back a finished draft via startGame().
*/

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { advance, type TimeStep } from '../game/time';
import {
  createSaveFromDraft,
  loadSave,
  writeSave,
  clearSave,
  type GameSave,
  type NewGameDraft,
} from './persistence';

export type Screen = 'home' | 'settings' | 'newgame' | 'game';

export type RoomKey = 'office' | 'calendar' | 'gym' | 'locker';

interface GameContextValue {
  screen: Screen;
  /** The room currently open over the gym floor, or null when on the floor. */
  activeRoom: RoomKey | null;
  /** Live save while in-game; null on home/settings/newgame screens. */
  save: GameSave | null;
  /** Whether a resumable save exists on disk (drives Continue). */
  canContinue: boolean;

  goHome: () => void;
  openSettings: () => void;
  /** Enter the New Game flow (gym name -> manager -> city -> opening scene). */
  openNewGame: () => void;
  /** Commit a finished draft and drop into the gym. Called by the opening scene. */
  startGame: (draft: NewGameDraft) => void;
  continueGame: () => void;

  openRoom: (room: RoomKey) => void;
  closeRoom: () => void;

  advanceTime: (step: TimeStep) => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<Screen>('home');
  const [activeRoom, setActiveRoom] = useState<RoomKey | null>(null);
  const [save, setSave] = useState<GameSave | null>(null);
  const [canContinue, setCanContinue] = useState<boolean>(() => loadSave() !== null);

  const goHome = useCallback(() => {
    setActiveRoom(null);
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
      const next: GameSave = { ...prev, dayCount: advance(prev.dayCount, step) };
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
      openNewGame,
      startGame,
      continueGame,
      openRoom,
      closeRoom,
      advanceTime,
    }),
    [
      screen,
      activeRoom,
      save,
      canContinue,
      goHome,
      openSettings,
      openNewGame,
      startGame,
      continueGame,
      openRoom,
      closeRoom,
      advanceTime,
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
