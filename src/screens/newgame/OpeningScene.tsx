/*
  Opening Scene
  --------------------------------------------------------------------------
  The first impression — and it is meant to be unhurried. Black screen. The
  year, then the city, fade up out of nothing and simply sit there for a long
  beat. Only then does the gym fade in beneath them, the titles drift away, the
  city's own words settle in, and finally a quiet invitation to step inside.

  The pacing is deliberate. Don't tighten these numbers without watching it
  play; the silence is the point. Reduced-motion users skip straight to ready.

  Phases:
    0 black · 1 titles in · 2 gym reveals / titles out · 3 city text · 4 ready
*/

import { useEffect, useState } from 'react';
import { getCity, type CityId } from '../../game/cities';
import { getRegion } from '../../game/regions';
import { GymBackground } from '../../assets/backgrounds';
import './OpeningScene.css';

interface Props {
  cityId: CityId;
  gymName: string;
  onBegin: () => void;
}

// Unhurried by design. See the note above before changing.
const BEATS = {
  titlesIn: 600, // year/city begin to surface
  reveal: 5400, // long hold on black, then the room fades in
  cityText: 8200, // the city's words settle
  ready: 11600, // the invitation appears
} as const;

export function OpeningScene({ cityId, gymName, onBegin }: Props) {
  const city = getCity(cityId);
  const region = getRegion(city.region);
  const paragraphs = city.description.split('\n\n');

  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setPhase(4);
      return;
    }
    const timers = [
      window.setTimeout(() => setPhase(1), BEATS.titlesIn),
      window.setTimeout(() => setPhase(2), BEATS.reveal),
      window.setTimeout(() => setPhase(3), BEATS.cityText),
      window.setTimeout(() => setPhase(4), BEATS.ready),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const titleClass =
    phase >= 2 ? 'opening__titles out' : phase >= 1 ? 'opening__titles in' : 'opening__titles';

  return (
    <div className="opening">
      {/* The room, hidden behind black until the reveal */}
      <div className={'opening__bg' + (phase >= 2 ? ' in' : '')} aria-hidden="true">
        <GymBackground region={region.key} />
        <div className="opening__bg-scrim" />
      </div>

      {/* Year + city, alone on black */}
      <div className={titleClass}>
        <span className="opening__year">1975</span>
        <span className="opening__city">{city.name}</span>
        <span className="opening__state">{city.state}</span>
      </div>

      {/* The city's own words */}
      <div className={'opening__text' + (phase >= 3 ? ' in' : '')}>
        {paragraphs.map((p, i) => (
          <p key={i} className={i === 0 ? 'opening__lede' : 'opening__para'}>
            {p}
          </p>
        ))}
      </div>

      {/* The invitation */}
      <div className={'opening__ready' + (phase >= 4 ? ' in' : '')}>
        <p className="opening__gym">{gymName}</p>
        <button className="opening__begin" onClick={onBegin}>
          Step inside →
        </button>
      </div>

      {/* Quiet skip for replays / impatience — never demands attention */}
      {phase >= 1 && phase < 4 && (
        <button className="opening__skip" onClick={() => setPhase(4)}>
          Skip
        </button>
      )}
    </div>
  );
}
