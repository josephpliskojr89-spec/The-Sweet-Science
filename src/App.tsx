/*
  App
  --------------------------------------------------------------------------
  Top-level screen router. Reads the current screen from GameContext and
  renders Home, Settings, the New Game flow, or the in-game Gym.
*/

import { useGame } from './state/GameContext';
import { HomeScreen } from './screens/HomeScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { NewGameScreen } from './screens/newgame/NewGameScreen';
import { GameScreen } from './screens/GameScreen';
import { PropDefs } from './kit/PropDefs';

export function App() {
  const { screen } = useGame();

  const view = (() => {
    switch (screen) {
      case 'settings':
        return <SettingsScreen />;
      case 'newgame':
        return <NewGameScreen />;
      case 'game':
        return <GameScreen />;
      case 'home':
      default:
        return <HomeScreen />;
    }
  })();

  return (
    <>
      <PropDefs />
      {view}
    </>
  );
}
