/*
  OfficeRoom — My Office
  --------------------------------------------------------------------------
  Three things on the desk now:
    Desk    — the walk-in review queue (Phase 3) + the Phase 6 roadmap
    Paper   — the local sporting page: ambient press clippings with persistent
              bylines. The world talking whether or not you listen.
    Ledger  — the gym's remembered history: who walked in, who you cut, what
              you learned about your fighters, anniversaries.

  Finances, upgrades, coaches, fight booking, and the Rival Gyms tab land in
  Phase 6.
*/

import { useEffect, useState } from 'react';
import { useGame } from '../state/GameContext';
import { fighterFullName, fighterAge } from '../game/fighters';
import { WEIGHT_CLASSES } from '../game/weightClasses';
import { formatDate } from '../game/time';
import { monthlySummary, formatMoney } from '../game/economy';
import { getCity } from '../game/cities';
import { REGIONS } from '../game/regions';
import {
  gymsInCity,
  gymsInRegion,
  cityCompetitiveness,
  type RivalGym,
} from '../game/world/rivalGyms';
import {
  fightersOfNote,
  independentsNear,
  fighterStanding,
  worldFighterName,
  type WorldFighter,
} from '../game/world/population';
import { gymReputation, reputationLabel, competitivenessLabel } from '../game/reputation';
import { Portrait } from '../assets/portraits';
import './OfficeRoom.css';

type OfficeTab = 'desk' | 'finances' | 'rivals' | 'ledger';
type RivalScope = 'local' | 'regional';

const FUTURE_DESK = ['Book fights for your fighters'];

export function OfficeRoom() {
  const { save, closeRoom, profileId, viewerIds } = useGame();
  const [tab, setTab] = useState<OfficeTab>('desk');

  // Esc steps back to the floor — but only when this room is the top layer.
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
  const queue = save.walkIns;

  return (
    <div className="room-screen worn" role="dialog" aria-label="My Office">
      <div className="room-screen__backdrop" aria-hidden="true" />

      <header className="room-screen__chrome">
        <button className="room-screen__back" onClick={closeRoom} title="Back to the floor (Esc)">
          ← Back to the floor
        </button>
        <span className="room-screen__breadcrumb">Your Gym · My Office</span>

        <nav className="office__tabs" aria-label="Office sections">
          {(
            [
              ['desk', `Desk${queue.length ? ` (${queue.length})` : ''}`],
              ['finances', 'Finances'],
              ['rivals', 'Rivals'],
              ['ledger', 'Ledger'],
            ] as Array<[OfficeTab, string]>
          ).map(([key, label]) => (
            <button
              key={key}
              className={'office__tab' + (tab === key ? ' office__tab--on' : '')}
              onClick={() => setTab(key)}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

      <div className="room-screen__body office__body">
        {tab === 'desk' && <DeskTab />}
        {tab === 'finances' && <FinancesTab />}
        {tab === 'rivals' && <RivalsTab />}
        {tab === 'ledger' && <LedgerTab />}
      </div>
    </div>
  );
}

/* The tab interiors live at module scope so their component identity is stable
   across OfficeRoom re-renders — declared inside the body, React remounted the
   whole tab (replaying entrance animations, dropping focus) on every context
   change. Each reads the store itself via useGame(). */

function DeskTab() {
  const { save, openWalkIns } = useGame();
  if (!save) return null;
  const queue = save.walkIns;
  const ids = queue.map((w) => w.fighter.id);
  return (
    <div className="office">
      <header className="office__head">
        <h2 className="office__title">Walk-Ins</h2>
        <span className="office__count">
          {queue.length === 0 ? 'No one waiting' : `${queue.length} waiting for an answer`}
        </span>
      </header>

      {queue.length === 0 ? (
        <p className="office__empty">
          The bench by the door is empty. Advance time and keep the lights
          on — word spreads, and someone always walks in eventually.
        </p>
      ) : (
        <ul className="office__queue">
          {queue.map((w, i) => {
            const f = w.fighter;
            return (
              <li key={f.id}>
                <button className="qrow" onClick={() => openWalkIns(ids, i)}>
                  <span className="qrow__portrait">
                    <Portrait appearance={f.appearance} size={48} />
                  </span>
                  <span className="qrow__main">
                    <span className="qrow__name">{fighterFullName(f)}</span>
                    <span className="qrow__meta">
                      {fighterAge(f)} yrs · {WEIGHT_CLASSES[f.weightClass].name}
                    </span>
                    <span className="qrow__impression">“{f.firstImpression}”</span>
                  </span>
                  <span className="qrow__right">
                    <span
                      className={
                        'qrow__patience' + (w.patience <= 3 ? ' qrow__patience--low' : '')
                      }
                    >
                      {w.patience <= 3 ? 'impatient' : `~${w.patience}d`}
                    </span>
                    <span className="qrow__review">Review →</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="office__divider">
        <span className="office__divider-seg" />
        <span className="office__divider-label">The rest of the desk</span>
        <span className="office__divider-seg" />
      </div>
      <ul className="office__future">
        {FUTURE_DESK.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      <p className="office__future-note">Comes online in Phase 6</p>
    </div>
  );
}

function FinancesTab() {
  const { save } = useGame();
  if (!save) return null;
  const date = formatDate(save.dayCount);
  const summary = monthlySummary(save.roster, save.upgrades, save.coaches, date.year);
  const low = save.money < 0;

  return (
    <div className="finances">
      <header className="finances__head">
        <div>
          <p className="finances__eyebrow">Cash on hand</p>
          <p className={'finances__balance' + (low ? ' finances__balance--low' : '')}>
            {formatMoney(save.money)}
          </p>
        </div>
        <span className="finances__date">As of {date.full}</span>
      </header>

      {low && (
        <p className="finances__warning">
          You’re running on credit. Dues won’t carry the gym forever — fight
          purses are how a gym stays open.
        </p>
      )}

      <section className="finances__section">
        <h3 className="finances__section-title">This Month, at the Current Roster</h3>
        <ul className="finances__lines">
          <li className="finances__line">
            <span>Gym dues</span>
            <span className="finances__pos">+{formatMoney(summary.duesIncome)}</span>
          </li>
          <li className="finances__line finances__line--sub">
            <span>
              {summary.payingCount} paying
              {summary.brokeCount > 0 && ` · ${summary.brokeCount} you’re carrying`}
            </span>
            <span />
          </li>
          <li className="finances__line">
            <span>Rent &amp; utilities</span>
            <span className="finances__neg">−{formatMoney(summary.overheadBase)}</span>
          </li>
          {summary.facilitiesUpkeep > 0 && (
            <li className="finances__line">
              <span>Facilities upkeep</span>
              <span className="finances__neg">−{formatMoney(summary.facilitiesUpkeep)}</span>
            </li>
          )}
          <li className="finances__line finances__line--muted">
            <span>Coach salaries</span>
            <span>{summary.coachSalaries === 0 ? '—' : `−${formatMoney(summary.coachSalaries)}`}</span>
          </li>
          <li className="finances__line finances__line--net">
            <span>Net per month</span>
            <span className={summary.net >= 0 ? 'finances__pos' : 'finances__neg'}>
              {summary.net >= 0 ? '+' : '−'}
              {formatMoney(Math.abs(summary.net))}
            </span>
          </li>
        </ul>
        <p className="finances__note">
          Settled on the first of each month. Figures are in {date.year} dollars
          — they grow with the years.
        </p>
      </section>

      <section className="finances__section">
        <h3 className="finances__section-title">The Books</h3>
        {save.finances.length === 0 ? (
          <p className="finances__empty">
            Nothing settled yet. Advance to the first of a month and the books
            close.
          </p>
        ) : (
          <ul className="finances__books">
            {save.finances.map((f, i) => (
              <li className="bookrow" key={`${f.dayCount}-${i}`}>
                <span className="bookrow__month">{f.label}</span>
                <span className="bookrow__dues finances__pos">+{formatMoney(f.duesIncome)}</span>
                <span className="bookrow__out finances__neg">
                  −{formatMoney(f.overhead + f.coachSalaries)}
                </span>
                <span className={'bookrow__net ' + (f.net >= 0 ? 'finances__pos' : 'finances__neg')}>
                  {f.net >= 0 ? '+' : '−'}
                  {formatMoney(Math.abs(f.net))}
                </span>
                <span className="bookrow__bal">{formatMoney(f.balance)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function RivalsTab() {
  const { save } = useGame();
  const [rivalScope, setRivalScope] = useState<RivalScope>('local');
  if (!save) return null;
  const city = getCity(save.cityId);
  const region = city.region;
  const comp = cityCompetitiveness(save.cityId);
  const rep = gymReputation(save.roster);
  const world = save.world;

  const scopes: Array<[RivalScope, string]> = [
    ['local', city.name],
    ['regional', `${REGIONS[region].name} Region`],
  ];

  // Local — every gym in your city, strongest houses first, plus independents.
  const localGyms = [...gymsInCity(save.cityId)].sort(
    (a, b) => tierRank(b.tier) - tierRank(a.tier),
  );
  const localIndies = independentsNear(world, save.cityId);

  // Regional — the rest of your region, grouped by city.
  const regionalByCity = new Map<string, RivalGym[]>();
  for (const g of gymsInRegion(region, save.cityId)) {
    const k = getCity(g.cityId).name;
    regionalByCity.set(k, [...(regionalByCity.get(k) ?? []), g]);
  }

  return (
    <div className="rivals">
      <header className="rivals__head">
        <h2 className="office__title">The Competition</h2>
        <p className="rivals__lede">
          {city.name} is {competitivenessLabel(comp)}. Your gym is{' '}
          <strong>{reputationLabel(rep)}</strong>. The national rankings run in
          the magazine over in <em>The Press</em>.
        </p>
        <nav className="rivals__scope" aria-label="Scope">
          {scopes.map(([key, label]) => (
            <button
              key={key}
              className={'rivals__scope-btn' + (rivalScope === key ? ' rivals__scope-btn--on' : '')}
              onClick={() => setRivalScope(key)}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

      {rivalScope === 'local' && (
        <div className="rivals__list">
          {localGyms.map((g) => (
            <GymCard key={g.id} gym={g} fighters={fightersOfNote(world, g.id, 3)} />
          ))}
          {localIndies.length > 0 && (
            <section className="gymcard gymcard--indie">
              <header className="gymcard__head">
                <span className="gymcard__name">No Gym — Independents</span>
                <span className="gymcard__tier gymcard__tier--indie">Unaffiliated</span>
              </header>
              <p className="gymcard__sub">
                Men who answer to no gym — old pros, rural fighters, the odd star.
              </p>
              <ul className="gymcard__fighters">
                {localIndies.map((wf) => (
                  <FighterLine key={wf.id} wf={wf} />
                ))}
              </ul>
            </section>
          )}
        </div>
      )}

      {rivalScope === 'regional' && (
        <div className="rivals__list">
          {[...regionalByCity.keys()].sort().map((cityName) => (
            <div key={cityName} className="rivals__citygroup">
              <h3 className="rivals__cityname">{cityName}</h3>
              {regionalByCity
                .get(cityName)!
                .sort((a, b) => tierRank(b.tier) - tierRank(a.tier))
                .map((g) => (
                  <GymCard key={g.id} gym={g} fighters={fightersOfNote(world, g.id, 2)} compact />
                ))}
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

function LedgerTab() {
  const { save } = useGame();
  if (!save) return null;
  const entries = [...save.history].reverse();
  return (
    <div className="ledgerbook">
      <header className="office__head">
        <h2 className="office__title">The Ledger</h2>
        <span className="office__count">
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
        </span>
      </header>
      <p className="ledgerbook__note">
        What happened here, written down. Gyms forget nothing.
      </p>
      <ul className="ledgerbook__list">
        {entries.map((e, i) => (
          <li className="ledgerbook__row" key={`${e.dayCount}-${i}`}>
            <span className="ledgerbook__date">{formatDate(e.dayCount).compact}</span>
            <span className="ledgerbook__text">{e.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
// --- Rival Gyms presentational pieces (module scope: stable, data-only) ------

const TIER_LABEL: Record<string, string> = {
  established: 'Established',
  regional: 'Regional',
  local: 'Local',
};

function tierRank(tier: string): number {
  return tier === 'established' ? 3 : tier === 'regional' ? 2 : 1;
}

function humanizeStyle(s: string): string {
  return s
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function recordStr(wf: WorldFighter): string {
  const { wins, losses, draws, kos } = wf.record;
  const base = `${wins}-${losses}-${draws}`;
  return kos > 0 ? `${base} · ${kos} KO` : base;
}

function GymCard({
  gym,
  fighters,
  compact,
}: {
  gym: RivalGym;
  fighters: WorldFighter[];
  compact?: boolean;
}) {
  return (
    <section className={'gymcard' + (compact ? ' gymcard--compact' : '')}>
      <header className="gymcard__head">
        <span className="gymcard__name">{gym.name}</span>
        <span className={`gymcard__tier gymcard__tier--${gym.tier}`}>{TIER_LABEL[gym.tier]}</span>
      </header>
      <p className="gymcard__sub">
        {gym.managerName} · {humanizeStyle(gym.styleTendency)} · est. {gym.foundingYear}
      </p>
      {fighters.length === 0 ? (
        <p className="gymcard__none">No fighters of note.</p>
      ) : (
        <ul className="gymcard__fighters">
          {fighters.map((wf) => (
            <FighterLine key={wf.id} wf={wf} />
          ))}
        </ul>
      )}
    </section>
  );
}

function FighterLine({ wf }: { wf: WorldFighter }) {
  const standing = fighterStanding(wf);
  return (
    <li className="fline">
      <span className="fline__name">{worldFighterName(wf)}</span>
      <span className="fline__class">{WEIGHT_CLASSES[wf.weightClass].name}</span>
      <span className="fline__record">{recordStr(wf)}</span>
      <span className={`fline__standing fline__standing--${standing.tone}`}>{standing.label}</span>
    </li>
  );
}
