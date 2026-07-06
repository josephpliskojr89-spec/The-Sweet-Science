/*
  PRESS — the paper and the magazine, as a management surface.
  --------------------------------------------------------------------------
  Two tabs. The reading matter keeps its print voice — a newspaper column
  and a ratings page ARE period-professional documents — inside the same
  charcoal frame as everything else.

    THE PAPER    — the local sporting page: clippings, newest first
    THE MAGAZINE — the national authority's official ratings by division

  The magazine prints the OFFICIAL order — public rank, reputation as the
  tiebreak, never the hidden rating. A hedged world stays hedged.
*/

import { useState } from 'react';
import { useGame } from '../state/GameContext';
import { Surface } from '../components/Surface';
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

const TABS = [
  { key: 'paper', label: 'THE PAPER' },
  { key: 'magazine', label: 'THE MAGAZINE' },
];

export function PressRoom() {
  const { save, closeRoom } = useGame();
  const [view, setView] = useState<PressView>('paper');
  if (!save) return null;

  return (
    <Surface
      title="PRESS"
      tabs={TABS}
      activeTab={view}
      onTab={(k) => setView(k as PressView)}
      onClose={closeRoom}
    >
      {view === 'paper' ? <PaperView /> : <MagazineView />}
    </Surface>
  );
}

function PaperView() {
  const { save } = useGame();
  if (!save) return null;
  const { paperName, clippings } = save.press;
  return (
    <div className="paper">
      <header className="paper__masthead">
        <h3 className="paper__name">{paperName}</h3>
        <p className="paper__tagline">SPORTING PAGES · {formatDate(save.dayCount).full.toUpperCase()}</p>
      </header>

      {clippings.length === 0 ? (
        <p className="surface__note">
          Nothing on the local fight scene this week. Slow news is still news — check back after
          some time passes.
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
      <header className="paper__masthead">
        <h3 className="paper__name">{MAGAZINE_NAME}</h3>
        <p className="paper__tagline">
          {MAGAZINE_TAGLINE.toUpperCase()} · OFFICIAL RATINGS · {year}
        </p>
      </header>

      <div className="magazine__grid">
        {DIVISIONS.map((wc) => {
          const inDiv = elite
            .filter((f) => f.weightClass === wc)
            .sort(
              (a, b) =>
                (a.nationalRank ?? 99) - (b.nationalRank ?? 99) ||
                b.publicReputation - a.publicReputation,
            );
          if (inDiv.length === 0) return null;
          return (
            <section key={wc} aria-label={WEIGHT_CLASSES[wc].name}>
              <h4 className="surface__section">{WEIGHT_CLASSES[wc].name.toUpperCase()}</h4>
              <table className="mtable">
                <tbody>
                  {inDiv.map((wf, i) => (
                    <tr key={wf.id}>
                      <td className="mtable__gold rank__num">#{i + 1}</td>
                      <td>{worldFighterName(wf)}</td>
                      <td className="mtable__dim">{campOf(wf)}</td>
                      <td className="mtable__dim">{recordStr(wf)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          );
        })}
      </div>
    </div>
  );
}
