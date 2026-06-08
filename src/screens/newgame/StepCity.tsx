/*
  Step 3 — Choose Your City
  --------------------------------------------------------------------------
  All fifteen cities. Selecting one shows its full description and style line —
  the same text that becomes the opening-scene narration. Las Vegas is present
  but not selectable: its entry explains its role as a destination, exactly as
  the bible specifies.
*/

import { useState } from 'react';
import {
  CITY_ORDER,
  CITIES,
  getCity,
  type CityId,
} from '../../game/cities';
import { getRegion } from '../../game/regions';

interface Props {
  cityId: CityId | null;
  onSelect: (id: CityId) => void;
}

export function StepCity({ cityId, onSelect }: Props) {
  // What the detail panel shows: the selection, or whatever's being browsed.
  const [focus, setFocus] = useState<CityId>(cityId ?? 'new_york');
  const city = getCity(focus);
  const region = getRegion(city.region);
  const paragraphs = city.description.split('\n\n');

  return (
    <div className="step step--city">
      <ul className="citylist" role="listbox" aria-label="Starting cities">
        {CITY_ORDER.map((id) => {
          const c = CITIES[id];
          const selected = id === cityId;
          const focused = id === focus;
          const cls = [
            'citylist__item',
            !c.selectable && 'citylist__item--locked',
            focused && 'citylist__item--focus',
            selected && 'citylist__item--selected',
          ]
            .filter(Boolean)
            .join(' ');
          return (
            <li key={id}>
              <button
                className={cls}
                role="option"
                aria-selected={selected}
                onMouseEnter={() => setFocus(id)}
                onFocus={() => setFocus(id)}
                onClick={() => {
                  setFocus(id);
                  if (c.selectable) onSelect(id);
                }}
              >
                <span className="citylist__name">{c.name}</span>
                <span className="citylist__meta">
                  {c.selectable ? getRegion(c.region).name : 'Destination'}
                </span>
                {selected && <span className="citylist__check">✓</span>}
                {!c.selectable && <span className="citylist__lock">★</span>}
              </button>
            </li>
          );
        })}
      </ul>

      <article className={'citydetail' + (city.selectable ? '' : ' citydetail--locked')}>
        <header className="citydetail__head">
          <div>
            <h2 className="citydetail__name">{city.name}</h2>
            <p className="citydetail__where">
              {city.state} · {region.name}
            </p>
          </div>
          {city.selectable ? (
            cityId === focus ? (
              <span className="citydetail__badge citydetail__badge--on">Selected</span>
            ) : (
              <span className="citydetail__badge">Click to choose</span>
            )
          ) : (
            <span className="citydetail__badge citydetail__badge--locked">
              Not a starting city
            </span>
          )}
        </header>

        <div className="citydetail__body">
          {paragraphs.map((p, i) => (
            <p key={i} className={i === 0 ? 'citydetail__lede' : 'citydetail__para'}>
              {p}
            </p>
          ))}
        </div>

        <footer className="citydetail__foot">
          <span className="citydetail__style-label">Style</span>
          <span className="citydetail__style">{city.styleLine}</span>
        </footer>
      </article>
    </div>
  );
}
