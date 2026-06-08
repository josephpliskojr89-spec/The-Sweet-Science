/*
  Step 2 — Create Your Manager
  --------------------------------------------------------------------------
  Name + visual descriptors (skin tone, hair color, hair style) with a live
  procedural portrait. Age is fixed at 25 in every run, per the bible. The
  portrait updates in real time as descriptors change.
*/

import {
  SKIN_TONES,
  SKIN_TONE_ORDER,
  HAIR_COLORS,
  HAIR_COLOR_ORDER,
  HAIR_STYLES,
  HAIR_STYLE_ORDER,
  randomAppearance,
  type Appearance,
} from '../../game/appearance';
import { generateAnyName } from '../../game/names';
import { MANAGER_START_AGE } from '../../state/persistence';
import { Portrait } from '../../assets/portraits';

interface Props {
  name: string;
  onName: (v: string) => void;
  appearance: Appearance;
  onAppearance: (a: Appearance) => void;
}

export function StepManager({ name, onName, appearance, onAppearance }: Props) {
  const set = (patch: Partial<Appearance>) => onAppearance({ ...appearance, ...patch });

  return (
    <div className="step step--manager">
      <div className="manager__portrait">
        <div className="manager__frame">
          <Portrait appearance={appearance} size={230} />
        </div>
        <div className="manager__nameplate">
          <span className="manager__nameplate-name">{name.trim() || 'Your Manager'}</span>
          <span className="manager__nameplate-age">Age {MANAGER_START_AGE} · 1975</span>
        </div>
        <button
          className="manager__randomize"
          type="button"
          onClick={() => onAppearance(randomAppearance())}
        >
          ⟳ Randomize look
        </button>
      </div>

      <div className="manager__controls">
        <label className="ctl">
          <span className="ctl__label">Name</span>
          <div className="namefield">
            <input
              className="namefield__input"
              type="text"
              value={name}
              maxLength={32}
              placeholder="e.g. Eddie Malone"
              autoFocus
              onChange={(e) => onName(e.target.value)}
              aria-label="Manager name"
            />
            <button
              className="namefield__surprise"
              type="button"
              onClick={() => onName(generateAnyName().full)}
              title="Suggest a name"
            >
              ⟳ Surprise me
            </button>
          </div>
        </label>

        <div className="ctl">
          <span className="ctl__label">Skin Tone</span>
          <div className="swatches">
            {SKIN_TONE_ORDER.map((key) => {
              const t = SKIN_TONES[key];
              const on = appearance.skinTone === key;
              return (
                <button
                  key={key}
                  type="button"
                  className={'swatch' + (on ? ' swatch--on' : '')}
                  style={{ background: t.base }}
                  title={t.name}
                  aria-label={t.name}
                  aria-pressed={on}
                  onClick={() => set({ skinTone: key })}
                />
              );
            })}
          </div>
        </div>

        <div className="ctl">
          <span className="ctl__label">Hair Color</span>
          <div className="swatches">
            {HAIR_COLOR_ORDER.map((key) => {
              const c = HAIR_COLORS[key];
              const on = appearance.hairColor === key;
              return (
                <button
                  key={key}
                  type="button"
                  className={'swatch' + (on ? ' swatch--on' : '')}
                  style={{ background: c.base }}
                  title={c.name}
                  aria-label={c.name}
                  aria-pressed={on}
                  onClick={() => set({ hairColor: key })}
                />
              );
            })}
          </div>
        </div>

        <div className="ctl">
          <span className="ctl__label">Hair Style</span>
          <div className="options">
            {HAIR_STYLE_ORDER.map((key) => {
              const s = HAIR_STYLES[key];
              const on = appearance.hairStyle === key;
              return (
                <button
                  key={key}
                  type="button"
                  className={'option' + (on ? ' option--on' : '')}
                  aria-pressed={on}
                  onClick={() => set({ hairStyle: key })}
                >
                  {s.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
