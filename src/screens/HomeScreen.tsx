/*
  HomeScreen
  --------------------------------------------------------------------------
  Title + Continue / New Game / Settings, per the bible. The title art is a
  styled placeholder (slab type + gloves motif) that the eventual title asset
  drops straight onto.

  "New Game" in Phase 1 goes directly into the gym with a chosen region so we
  can review the shell. The full Phase 2 New Game flow (gym naming, manager
  creation, city selection, opening scene) will live between this screen and
  the gym. The region buttons below are a temporary, clearly-marked stand-in
  for that flow so all four backgrounds are reviewable now.
*/

import { useState } from 'react';
import { useGame } from '../state/GameContext';
import { REGION_ORDER, REGIONS } from '../game/regions';
import type { RegionKey } from '../game/regions';
import { Button } from '../components/Button';
import { GlovesEmblem } from '../components/GlovesEmblem';
import './HomeScreen.css';

export function HomeScreen() {
  const { canContinue, continueGame, startNewGame, openSettings } = useGame();
  const [choosingRegion, setChoosingRegion] = useState(false);

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

        {!choosingRegion ? (
          <nav className="home__menu" aria-label="Main menu">
            <Button
              variant="primary"
              disabled={!canContinue}
              onClick={continueGame}
            >
              Continue
            </Button>
            <Button variant="plate" onClick={() => setChoosingRegion(true)}>
              New Game
            </Button>
            <Button variant="ghost" onClick={openSettings}>
              Settings
            </Button>
          </nav>
        ) : (
          <div className="home__region">
            <p className="home__region-label">
              Choose a gym to walk into
              <span className="home__region-note">
                temporary — Phase 2 replaces this with city selection
              </span>
            </p>
            <div className="home__region-grid">
              {REGION_ORDER.map((key: RegionKey) => (
                <button
                  key={key}
                  className="region-card"
                  onClick={() => startNewGame(key)}
                >
                  <span className="region-card__name">{REGIONS[key].name}</span>
                  <span className="region-card__mood">{REGIONS[key].mood}</span>
                </button>
              ))}
            </div>
            <Button variant="ghost" onClick={() => setChoosingRegion(false)}>
              ← Back
            </Button>
          </div>
        )}
      </div>

      <footer className="home__foot">
        <span>v0.1.0 — Phase 1: Shell &amp; Navigation</span>
      </footer>
    </div>
  );
}
