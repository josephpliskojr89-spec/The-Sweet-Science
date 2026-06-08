/*
  Step 1 — Name Your Gym
  --------------------------------------------------------------------------
  A single, weighty decision presented plainly. The "Surprise me" composer
  offers a period-plausible name; the player can always type their own.
*/

import { generateGymName } from '../../game/gymNames';

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
}

export function StepGymName({ value, onChange, onSubmit }: Props) {
  return (
    <div className="step step--gym">
      <p className="step__lead">
        Every gym has a name on the door before it has a single fighter. This is
        the one you’ll build a reputation on — or won’t.
      </p>

      <div className="namefield">
        <input
          className="namefield__input"
          type="text"
          value={value}
          maxLength={42}
          placeholder="e.g. Front Street Boxing Club"
          autoFocus
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && value.trim()) onSubmit();
          }}
          aria-label="Gym name"
        />
        <button
          className="namefield__surprise"
          type="button"
          onClick={() => onChange(generateGymName())}
          title="Suggest a name"
        >
          ⟳ Surprise me
        </button>
      </div>

      <p className="step__hint">
        Press Enter when it feels right.
      </p>
    </div>
  );
}
