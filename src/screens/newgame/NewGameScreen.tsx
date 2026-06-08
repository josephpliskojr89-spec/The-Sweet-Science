/*
  NewGameScreen — the Phase 2 flow controller
  --------------------------------------------------------------------------
  Owns the new-career draft and walks the player through it:
    1. Name your gym
    2. Create your manager (name + appearance, age fixed at 25)
    3. Choose your city (all 15; Las Vegas is a non-selectable destination)
    -> Opening scene (cinematic), then the game begins.

  Steps 1–3 share chrome (a stepper + back/continue). The opening scene is
  full-bleed and renders without the chrome. Only when the opening completes
  does the draft become a save (via startGame).
*/

import { useState } from 'react';
import { useGame } from '../../state/GameContext';
import { MANAGER_START_AGE, type NewGameDraft } from '../../state/persistence';
import { DEFAULT_APPEARANCE, type Appearance } from '../../game/appearance';
import type { CityId } from '../../game/cities';
import { Button } from '../../components/Button';
import { StepGymName } from './StepGymName';
import { StepManager } from './StepManager';
import { StepCity } from './StepCity';
import { OpeningScene } from './OpeningScene';
import './newgame.css';

type Step = 'gym' | 'manager' | 'city' | 'opening';

const STEP_META: Record<Exclude<Step, 'opening'>, { idx: number; title: string }> = {
  gym: { idx: 1, title: 'Name Your Gym' },
  manager: { idx: 2, title: 'Create Your Manager' },
  city: { idx: 3, title: 'Choose Your City' },
};

const STEPPER: Array<{ key: Exclude<Step, 'opening'>; label: string }> = [
  { key: 'gym', label: 'Gym' },
  { key: 'manager', label: 'Manager' },
  { key: 'city', label: 'City' },
];

export function NewGameScreen() {
  const { goHome, startGame } = useGame();

  const [step, setStep] = useState<Step>('gym');
  const [gymName, setGymName] = useState('');
  const [managerName, setManagerName] = useState('');
  const [appearance, setAppearance] = useState<Appearance>(DEFAULT_APPEARANCE);
  const [cityId, setCityId] = useState<CityId | null>(null);

  // --- Opening scene takes the whole screen ---
  if (step === 'opening' && cityId) {
    const draft: NewGameDraft = {
      gymName: gymName.trim(),
      manager: { name: managerName.trim(), age: MANAGER_START_AGE, appearance },
      cityId,
    };
    return (
      <OpeningScene
        cityId={cityId}
        gymName={draft.gymName}
        onBegin={() => startGame(draft)}
      />
    );
  }

  const meta = STEP_META[step as Exclude<Step, 'opening'>];

  const valid =
    step === 'gym'
      ? gymName.trim().length > 0
      : step === 'manager'
        ? managerName.trim().length > 0
        : cityId !== null;

  const onBack = () => {
    if (step === 'gym') goHome();
    else if (step === 'manager') setStep('gym');
    else if (step === 'city') setStep('manager');
  };

  const onContinue = () => {
    if (!valid) return;
    if (step === 'gym') setStep('manager');
    else if (step === 'manager') setStep('city');
    else if (step === 'city') setStep('opening');
  };

  const continueLabel = step === 'city' ? 'Begin →' : 'Continue →';

  return (
    <div className="ng worn">
      <div className="ng__backdrop" aria-hidden="true" />

      <header className="ng__head">
        <div className="ng__head-left">
          <p className="ng__eyebrow">New Career · 1975</p>
          <h1 className="ng__title">{meta.title}</h1>
        </div>

        <ol className="ng__stepper" aria-label="Progress">
          {STEPPER.map((s) => {
            const idx = STEP_META[s.key].idx;
            const state = idx === meta.idx ? 'on' : idx < meta.idx ? 'done' : 'todo';
            return (
              <li key={s.key} className={`ng__step ng__step--${state}`}>
                <span className="ng__step-num">{idx}</span>
                <span className="ng__step-label">{s.label}</span>
              </li>
            );
          })}
        </ol>
      </header>

      <main className="ng__body">
        {step === 'gym' && (
          <StepGymName value={gymName} onChange={setGymName} onSubmit={onContinue} />
        )}
        {step === 'manager' && (
          <StepManager
            name={managerName}
            onName={setManagerName}
            appearance={appearance}
            onAppearance={setAppearance}
          />
        )}
        {step === 'city' && <StepCity cityId={cityId} onSelect={setCityId} />}
      </main>

      <footer className="ng__foot">
        <Button variant="ghost" onClick={onBack}>
          {step === 'gym' ? '← Home' : '← Back'}
        </Button>
        <Button variant="primary" disabled={!valid} onClick={onContinue}>
          {continueLabel}
        </Button>
      </footer>
    </div>
  );
}
