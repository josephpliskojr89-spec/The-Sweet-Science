/*
  HomeScreen
  --------------------------------------------------------------------------
  Title + Continue / New Game / Settings. The title art is a styled placeholder
  (slab type + gloves motif) the eventual title asset drops onto. New Game now
  enters the Phase 2 flow (gym naming -> manager creation -> city selection ->
  opening scene). Continue is disabled until a real save exists.
*/

import { useGame } from '../state/GameContext';
import { Button } from '../components/Button';
import { GlovesEmblem } from '../components/GlovesEmblem';
import './HomeScreen.css';

export function HomeScreen() {
  const { canContinue, continueGame, openNewGame, openSettings } = useGame();

  return (
    <div className="home worn">
      <div className="home__backdrop" aria-hidden="true" />

      <div className="home__content">
        <header className="title">
          <p className="title__eyebrow">A Boxing Gym Management Simulation · 1975</p>
          <h1 className="title__name">
            <span className="title__line">THE SWEET</span>
            <span className="title__line title__line--accent">SCIENCE</span>
          </h1>
          <div className="title__rule">
            <span className="title__rule-seg" />
            <GlovesEmblem size={42} className="title__gloves" />
            <span className="title__rule-seg" />
          </div>
          <p className="title__placeholder-tag">title art placeholder</p>
        </header>

        <nav className="home__menu" aria-label="Main menu">
          <Button variant="primary" disabled={!canContinue} onClick={continueGame}>
            Continue
          </Button>
          <Button variant="plate" onClick={openNewGame}>
            New Game
          </Button>
          <Button variant="ghost" onClick={openSettings}>
            Settings
          </Button>
        </nav>
      </div>

      <footer className="home__foot">
        <span>v0.2.0 — Phase 2: New Game Flow</span>
      </footer>
    </div>
  );
}
