/*
  App
  --------------------------------------------------------------------------
  Top-level screen router for the Phase 1 shell. Reads the current screen from
  GameContext and renders Home, Settings, or the in-game Gym. The New Game flow
  (Phase 2) will add screens here between Home and Gym.
*/

import { useGame } from './state/GameContext';
import { HomeScreen } from './screens/HomeScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { GymScreen } from './screens/GymScreen';

export function App() {
  const { screen } = useGame();

  switch (screen) {
    case 'settings':
      return <SettingsScreen />;
    case 'game':
      return <GymScreen />;
    case 'home':
    default:
      return <HomeScreen />;
  }
}
