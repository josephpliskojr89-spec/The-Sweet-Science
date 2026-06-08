/*
  SettingsScreen (stub)
  --------------------------------------------------------------------------
  Per the bible, Settings holds difficulty modifiers and volume controls and
  is "not priority for initial build." This is the styled stub: it establishes
  the screen, its chrome, and the back-to-home path. Real controls land later.
*/

import { useGame } from '../state/GameContext';
import { Button } from '../components/Button';
import './SettingsScreen.css';

const PLANNED = [
  { label: 'Master Volume', note: 'audio system — later phase' },
  { label: 'Music', note: 'audio system — later phase' },
  { label: 'Difficulty Modifiers', note: 'tuning pass — later phase' },
  { label: 'Walk-In Frequency', note: 'generation tuning — Phase 3' },
];

export function SettingsScreen() {
  const { goHome } = useGame();

  return (
    <div className="settings worn">
      <div className="settings__panel">
        <header className="settings__head">
          <h2 className="settings__title">Settings</h2>
          <span className="settings__stub-tag">stub</span>
        </header>

        <ul className="settings__list">
          {PLANNED.map((item) => (
            <li className="settings__row" key={item.label}>
              <span className="settings__row-label">{item.label}</span>
              <span className="settings__row-note">{item.note}</span>
            </li>
          ))}
        </ul>

        <p className="settings__copy">
          Difficulty modifiers and volume controls live here. They are not part
          of the initial build — this screen exists so the navigation is whole.
        </p>

        <div className="settings__actions">
          <Button variant="plate" onClick={goHome}>
            ← Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
