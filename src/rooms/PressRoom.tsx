/*
  PressRoom — The Press (Phase 6C)
  --------------------------------------------------------------------------
  A top-level room, not a corner of the office: your window on the sport. Two
  publications share it —

    The Paper    — the local sporting page. Results, rumor, and, more and more,
                   your own gym in print. The world's weekly voice.
    The Magazine — the national authority, home of the official rankings,
                   division by division. The state of the whole sport.

  Both read straight from live data — press clippings and the competitive-world
  population — so no two saves read the same page. The Office keeps "your
  competition" (the Rival Gyms tab); the world's story lives here.
*/

import { useEffect, useState } from 'react';
import { useGame } from '../state/GameContext';
import { formatDate } from '../game/time';
import { WEIGHT_CLASSES, type WeightClassKey } from '../game/weightClasses';
import { rankedElite, worldFighterName, campOf, type WorldFighter } from '../game/world/population';
import { MAGAZINE_NAME, MAGAZINE_TAGLINE } from '../game/press';
import './PressRoom.css';

type PressView = 'paper' | 'magazine';

/** Divisions top-down, heavyweight first, the way a ranking sheet reads. */
const DIVISIONS: WeightClassKey[] = [
  'heavyweight',
  'light_heavyweight',
  'middleweight',
  'welterweight',
  'lightweight',
];

function recordStr(wf: WorldFighter): string {
  const { wins, losses, draws, kos } = wf.record;
  const base = `${wins}-${losses}-${draws}`;
  return kos > 0 ? `${base} · ${kos} KO` : base;
}

export function PressRoom() {
  const { save, closeRoom, profileId, viewerIds } = useGame();
  const [view, setView] = useState<PressView>('paper');

  const overlayOpen = profileId !== null || viewerIds !== null;
  useEffect(() => {
    if (overlayOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeRoom();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeRoom, overlayOpen]);

  if (!save) return null;

  return (
    <div className="room-screen worn" role="dialog" aria-label="The Press">
      <div className="room-screen__backdrop" aria-hidden="true" />

      <header className="room-screen__chrome">
        <button className="room-screen__back" onClick={closeRoom} title="Back to the floor (Esc)">
          ← Back to the floor
        </button>
        <span className="room-screen__breadcrumb">Your Gym · The Press</span>

        <nav className="press__tabs" aria-label="Publications">
          {(
            [
              ['paper', 'The Paper'],
              ['magazine', 'The Magazine'],
            ] as Array<[PressView, string]>
          ).map(([key, label]) => (
            <button
              key={key}
              className={'press__tab' + (view === key ? ' press__tab--on' : '')}
              onClick={() => setView(key)}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

      <div className="room-screen__body press__body">
        {view === 'paper' ? <PaperView /> : <MagazineView />}
      </div>
    </div>
  );
}

/* Publication views at module scope for stable component identity — nested in
   the body, each PressRoom re-render remounted the open publication and
   replayed its entrance animation mid-read. */

function PaperView() {
  const { save } = useGame();
  if (!save) return null;
  const { paperName, clippings } = save.press;
  return (
    <div className="paper">
      <header className="paper__masthead">
        <h2 className="paper__name">{paperName}</h2>
        <p className="paper__tagline">Sporting Pages · {formatDate(save.dayCount).full}</p>
      </header>

      {clippings.length === 0 ? (
        <p className="paper__empty">
          Nothing on the local fight scene this week. Slow news is still news —
          check back after some time passes.
        </p>
      ) : (
        <div className="paper__columns">
          {clippings.map((c, i) => (
            <article className="clipping" key={`${c.templateId}-${c.dayCount}-${i}`}>
              <p className="clipping__date">{formatDate(c.dayCount).compact}</p>
              <p className="clipping__text">{c.text}</p>
              <p className="clipping__byline">— {c.byline}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function MagazineView() {
  const { save } = useGame();
  if (!save) return null;
  const elite = rankedElite(save.world);
  const { year } = formatDate(save.dayCount);
  return (
    <div className="magazine">
      <header className="magazine__masthead">
        <h2 className="magazine__name">{MAGAZINE_NAME}</h2>
        <p className="magazine__tagline">{MAGAZINE_TAGLINE}</p>
        <p className="magazine__issue">Official Ratings · {year}</p>
      </header>

      {DIVISIONS.map((wc) => {
        // The magazine prints the OFFICIAL order — public rank, reputation as
        // the tiebreak. Never the hidden rating: the ratings page must agree
        // with the "Ranked #N" chips elsewhere, and a hedged world stays hedged.
        const inDiv = elite
          .filter((f) => f.weightClass === wc)
          .sort(
            (a, b) =>
              (a.nationalRank ?? 99) - (b.nationalRank ?? 99) ||
              b.publicReputation - a.publicReputation,
          );
        if (inDiv.length === 0) return null;
        return (
          <section className="magazine__division" key={wc}>
            <h3 className="magazine__divname">{WEIGHT_CLASSES[wc].name}</h3>
            <ul className="rankings">
              {inDiv.map((wf, i) => (
                <li className="rankrow" key={wf.id}>
                  <span className="rankrow__rank">#{i + 1}</span>
                  <span className="rankrow__name">{worldFighterName(wf)}</span>
                  <span className="rankrow__camp">{campOf(wf)}</span>
                  <span className="rankrow__record">{recordStr(wf)}</span>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
