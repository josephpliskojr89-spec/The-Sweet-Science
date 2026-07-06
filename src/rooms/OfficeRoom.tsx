/*
  OFFICE — the business, as a management surface.
  --------------------------------------------------------------------------
  The desk diorama is gone; the business remains, in three tabs:

    ACCOUNTS — this month's run rate, the balance, the closed months
    RIVALS   — the competition, local and regional, and their names of note
    HISTORY  — the gym ledger: everything worth remembering, dated

  Same fog as ever: your own books are exact; rivals are known only by
  reputation and public record.
*/

import { useState } from 'react';
import { useGame } from '../state/GameContext';
import { Surface } from '../components/Surface';
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
import { WEIGHT_CLASSES } from '../game/weightClasses';
import { gymReputation, reputationLabel, competitivenessLabel } from '../game/reputation';
import './OfficeRoom.css';

type OfficeTab = 'accounts' | 'rivals' | 'history';

const TABS = [
  { key: 'accounts', label: 'ACCOUNTS' },
  { key: 'rivals', label: 'RIVALS' },
  { key: 'history', label: 'HISTORY' },
];

export function OfficeRoom() {
  const { save, closeRoom } = useGame();
  const [tab, setTab] = useState<OfficeTab>('accounts');
  if (!save) return null;

  return (
    <Surface
      title="OFFICE"
      tabs={TABS}
      activeTab={tab}
      onTab={(k) => setTab(k as OfficeTab)}
      onClose={closeRoom}
    >
      {tab === 'accounts' && <AccountsTab />}
      {tab === 'rivals' && <RivalsTab />}
      {tab === 'history' && <HistoryTab />}
    </Surface>
  );
}

/* ------------------------------------------------------------------ */
/* ACCOUNTS                                                            */
/* ------------------------------------------------------------------ */

function AccountsTab() {
  const { save } = useGame();
  if (!save) return null;
  const date = formatDate(save.dayCount);
  const summary = monthlySummary(save.roster, save.upgrades, save.coaches, date.year);
  const low = save.money < 0;
  const balFigure = low
    ? `($${Math.abs(Math.round(save.money)).toLocaleString('en-US')})`
    : formatMoney(save.money);

  return (
    <>
      <section aria-label="Balance and this month">
        <div className="acct__top">
          <div className="acct__balance">
            <span className="ledger__label">BALANCE · {date.month.slice(0, 3).toUpperCase()} {date.day}, {date.year}</span>
            <span className={'acct__figure' + (low ? ' acct__figure--red' : '')}>{balFigure}</span>
            {low && <span className="acct__overdrawn">OVERDRAWN — PURSES KEEP A GYM OPEN</span>}
          </div>
          <div className="acct__run">
            <h3 className="surface__section">THIS MONTH — CURRENT ROSTER</h3>
            <div className="ledger__line">
              <span className="ledger__label">GYM DUES ({summary.payingCount} PAYING{summary.brokeCount > 0 ? `, ${summary.brokeCount} CARRIED` : ''})</span>
              <span className="ledger__figure ledger__figure--sm">+{formatMoney(summary.duesIncome)}</span>
            </div>
            <div className="ledger__line">
              <span className="ledger__label">RENT &amp; UTILITIES</span>
              <span className="ledger__figure ledger__figure--sm">−{formatMoney(summary.overheadBase)}</span>
            </div>
            {summary.facilitiesUpkeep > 0 && (
              <div className="ledger__line">
                <span className="ledger__label">FACILITIES UPKEEP</span>
                <span className="ledger__figure ledger__figure--sm">−{formatMoney(summary.facilitiesUpkeep)}</span>
              </div>
            )}
            <div className="ledger__line">
              <span className="ledger__label">COACH SALARIES</span>
              <span className="ledger__figure ledger__figure--sm">
                {summary.coachSalaries === 0 ? '—' : `−${formatMoney(summary.coachSalaries)}`}
              </span>
            </div>
            <div className="ledger__line">
              <span className="ledger__label">NET PER MONTH</span>
              <span className={'ledger__figure' + (summary.net < 0 ? ' ledger__figure--red' : '')}>
                {summary.net >= 0 ? '+' : '−'}
                {formatMoney(Math.abs(summary.net))}
              </span>
            </div>
            <p className="surface__note">Settled the first of each month, {date.year} dollars.</p>
          </div>
        </div>
      </section>

      <section aria-label="Closed months">
        <h3 className="surface__section">CLOSED MONTHS</h3>
        {save.finances.length === 0 ? (
          <p className="surface__note">First month not closed yet.</p>
        ) : (
          <table className="mtable">
            <thead>
              <tr>
                <th>MONTH</th>
                <th>DUES</th>
                <th>OUT</th>
                <th>NET</th>
                <th>BALANCE</th>
              </tr>
            </thead>
            <tbody>
              {save.finances.map((f, i) => (
                <tr key={`${f.dayCount}-${i}`}>
                  <td className="mtable__dim">{f.label.toUpperCase()}</td>
                  <td>+{formatMoney(f.duesIncome)}</td>
                  <td className="mtable__dim">−{formatMoney(f.overhead + f.coachSalaries)}</td>
                  <td className={f.net >= 0 ? 'mtable__gold' : 'mtable__red'}>
                    {f.net >= 0 ? '+' : '−'}
                    {formatMoney(Math.abs(f.net))}
                  </td>
                  <td>{formatMoney(f.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* RIVALS                                                              */
/* ------------------------------------------------------------------ */

type RivalScope = 'local' | 'regional';

function tierRank(tier: string): number {
  return tier === 'established' ? 3 : tier === 'regional' ? 2 : 1;
}

function tierLabel(tier: string): string {
  return tier === 'established' ? 'ESTABLISHED' : tier === 'regional' ? 'REGIONAL' : 'LOCAL';
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

function RivalsTab() {
  const { save } = useGame();
  const [scope, setScope] = useState<RivalScope>('local');
  if (!save) return null;

  const city = getCity(save.cityId);
  const region = city.region;
  const comp = cityCompetitiveness(save.cityId);
  const rep = gymReputation(save.roster);
  const world = save.world;

  const localGyms = [...gymsInCity(save.cityId)].sort((a, b) => tierRank(b.tier) - tierRank(a.tier));
  const localIndies = independentsNear(world, save.cityId);

  const regionalByCity = new Map<string, RivalGym[]>();
  for (const g of gymsInRegion(region, save.cityId)) {
    const k = getCity(g.cityId).name;
    regionalByCity.set(k, [...(regionalByCity.get(k) ?? []), g]);
  }

  return (
    <>
      <div className="rivals__frame">
        <p className="surface__note">
          {city.name.toUpperCase()} IS <b className="rivals__mark">{competitivenessLabel(comp).toUpperCase()}</b>. WE
          ARE <b className="rivals__mark">{reputationLabel(rep).toUpperCase()}</b>.
        </p>
        <div className="rivals__scope" role="radiogroup" aria-label="Scope">
          {(
            [
              ['local', city.name.toUpperCase()],
              ['regional', REGIONS[region].name.toUpperCase()],
            ] as Array<[RivalScope, string]>
          ).map(([key, label]) => (
            <button
              key={key}
              role="radio"
              aria-checked={scope === key}
              className={'cplan__chip' + (scope === key ? ' cplan__chip--on' : '')}
              onClick={() => setScope(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {scope === 'local' && (
        <>
          {localGyms.map((g) => (
            <GymDossier key={g.id} gym={g} fighters={fightersOfNote(world, g.id, 3)} />
          ))}
          {localIndies.length > 0 && (
            <section aria-label="Unaffiliated men">
              <h3 className="surface__section">UNAFFILIATED MEN</h3>
              <ul className="rows">
                {localIndies.map((wf) => (
                  <FighterLine key={wf.id} wf={wf} />
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      {scope === 'regional' &&
        [...regionalByCity.keys()].sort().map((cityName) => (
          <section key={cityName} aria-label={cityName}>
            <h3 className="surface__section">{cityName.toUpperCase()}</h3>
            {regionalByCity
              .get(cityName)!
              .sort((a, b) => tierRank(b.tier) - tierRank(a.tier))
              .map((g) => (
                <GymDossier key={g.id} gym={g} fighters={fightersOfNote(world, g.id, 2)} compact />
              ))}
          </section>
        ))}
    </>
  );
}

function GymDossier({
  gym,
  fighters,
  compact,
}: {
  gym: RivalGym;
  fighters: WorldFighter[];
  compact?: boolean;
}) {
  return (
    <section className="dossier" aria-label={gym.name}>
      <div className="dossier__head">
        <span className="row__main">{gym.name.toUpperCase()}</span>
        <span className="dossier__tier">{tierLabel(gym.tier)}</span>
      </div>
      <p className="dossier__sub">
        {gym.managerName} · {humanizeStyle(gym.styleTendency)} · EST. {gym.foundingYear}
      </p>
      {!compact &&
        (fighters.length === 0 ? (
          <p className="surface__note">No fighters of note.</p>
        ) : (
          <ul className="rows">
            {fighters.map((wf) => (
              <FighterLine key={wf.id} wf={wf} />
            ))}
          </ul>
        ))}
      {compact && fighters.length > 0 && (
        <ul className="rows">
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
      <span className="fline__class">{WEIGHT_CLASSES[wf.weightClass].name.toUpperCase()}</span>
      <span className="fline__record">{recordStr(wf)}</span>
      <span className="fline__standing">{standing.label.toUpperCase()}</span>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* HISTORY                                                             */
/* ------------------------------------------------------------------ */

function HistoryTab() {
  const { save } = useGame();
  if (!save) return null;
  const entries = [...save.history].reverse();
  const begun = formatDate(0);

  return (
    <section aria-label="The gym ledger">
      <h3 className="surface__section">
        {entries.length} {entries.length === 1 ? 'ENTRY' : 'ENTRIES'} — BEGUN{' '}
        {begun.month.slice(0, 3).toUpperCase()} {begun.year}
      </h3>
      {entries.length === 0 ? (
        <p className="surface__note">Nothing written yet.</p>
      ) : (
        <ul className="hist">
          {entries.map((e, i) => {
            const d = formatDate(e.dayCount);
            return (
              <li className="hist__row" key={`${e.dayCount}-${i}`}>
                <span className="hist__date">
                  {d.month.slice(0, 3).toUpperCase()} {d.day}, {d.year}
                </span>
                <span className="hist__text">{e.text}</span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
