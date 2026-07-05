/*
  OfficeRoom — MY OFFICE
  --------------------------------------------------------------------------
  OBJECT SHOT: looking down ~30° at the owner's desk. (DESIGN-BIBLE, Part II.)

  The office is one desk you never leave — no tabs, no chrome. Everything
  sits where it lives:

    wire in-tray on the blotter   — walk-in registration slips (the Desk tab)
    green accounts book           — finances (pick it up)
    THE COMPETITION folder        — rivals (pick it up)
    bound gym ledger, cropped     — history (pick it up)
    dead rotary phone, tape tag   — fight booking, line not hooked up yet
    pebbled-glass door sliver     — the way back to the floor (top-left)

  Picking a thing up slides it from the bottom third and settles it with a
  degree of rotation; Esc puts it down; Esc again leaves the room. The walk-in
  slips follow the unified <WalkInRegCard> language (A2): FORM 3-A, typed
  'WILL WAIT — TO <date>', red 'IN A HURRY' stamp when patience runs short.
*/

import { useEffect, useState, type ReactNode } from 'react';
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
import { Stamp } from '../kit/Stamp';
import { paperTilt } from '../kit/seed';
import './OfficeRoom.css';

type HeldObject = 'accounts' | 'competition' | 'ledger' | null;

export function OfficeRoom() {
  const { save, closeRoom, profileId, viewerIds } = useGame();
  const [held, setHeld] = useState<HeldObject>(null);

  // Esc puts the held object down; Esc at desk level leaves the room —
  // but only when this room is the top layer.
  const overlayOpen = profileId !== null || viewerIds !== null;
  useEffect(() => {
    if (overlayOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setHeld((h) => {
        if (h !== null) return null;
        closeRoom();
        return h;
      });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeRoom, overlayOpen]);

  if (!save) return null;

  return (
    <div className="office-room" role="dialog" aria-label="My Office — the desk">
      {/* the desk itself: oak top, drawer fronts cropped at the frame */}
      <div className="desk layer" aria-hidden="true">
        <div className="desk__drawers" />
        <div className="desk__ring" />
      </div>

      {/* the way back: pebbled-glass door sliver, lettering reversed */}
      <button
        className="desk__door"
        onClick={closeRoom}
        aria-label="Back to the gym floor (Esc)"
      >
        <span className="desk__door-glass" aria-hidden="true">
          <span className="desk__door-name">{save.gymName.toUpperCase()}</span>
        </span>
      </button>

      {/* the blotter with the in-tray — the decisions live in the light */}
      <WalkInTray dimmed={held !== null} />

      {/* the rest of the desk */}
      {held === null && (
        <>
          <button
            className="deskobj deskobj--accounts"
            onClick={() => setHeld('accounts')}
            aria-label="The accounts book — finances"
          >
            <span className="deskobj__accounts-spine" aria-hidden="true" />
            <span className="deskobj__accounts-label" aria-hidden="true">
              ACCOUNTS
            </span>
          </button>

          <button
            className="deskobj deskobj--folder"
            onClick={() => setHeld('competition')}
            aria-label="The Competition folder — rival gyms"
          >
            <span className="deskobj__folder-string" aria-hidden="true" />
            <span className="deskobj__folder-label" aria-hidden="true">
              THE COMPETITION
            </span>
          </button>

          <button
            className="deskobj deskobj--ledger"
            onClick={() => setHeld('ledger')}
            aria-label={`The gym ledger — ${save.history.length} entries`}
          >
            <span className="deskobj__ledger-label" aria-hidden="true">
              LEDGER
            </span>
          </button>

          {/* the dead phone — fight booking, line not hooked up yet */}
          <div
            className="deskobj deskobj--phone"
            aria-label="Rotary phone with a tag: fight booking — line not hooked up yet. Comes online in Phase 6."
          >
            <span className="phone__body" aria-hidden="true">
              <span className="phone__dial" />
              <span className="phone__handset" />
              <span className="phone__cord" />
            </span>
            <span className="phone__tag" aria-hidden="true">
              FIGHT BOOKING — line not hooked up yet
            </span>
          </div>

          <div className="deskobj deskobj--mug" aria-hidden="true" />
        </>
      )}

      {/* the picked-up object */}
      {held === 'accounts' && <AccountsBook onPutDown={() => setHeld(null)} />}
      {held === 'competition' && <CompetitionFolder onPutDown={() => setHeld(null)} />}
      {held === 'ledger' && <GymLedger onPutDown={() => setHeld(null)} />}

      {/* office rig: one tungsten key upper-left, steep falloff */}
      <div className="rig office-rig" aria-hidden="true" />
      <div className="office-dark layer" aria-hidden="true" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* THE IN-TRAY — walk-in registration slips (module scope: stable)     */
/* ------------------------------------------------------------------ */

function WalkInTray({ dimmed }: { dimmed: boolean }) {
  const { save, openWalkIns } = useGame();
  if (!save) return null;
  const queue = save.walkIns;
  const ids = queue.map((w) => w.fighter.id);

  return (
    <section
      className={'tray' + (dimmed ? ' tray--dimmed' : '')}
      aria-label={
        queue.length === 0
          ? 'Wire in-tray: nobody waiting'
          : `Wire in-tray: ${queue.length} walk-in${queue.length === 1 ? '' : 's'} waiting`
      }
    >
      <span className="tray__wire" aria-hidden="true" />
      <span className="tray__card" aria-hidden="true">
        {queue.length === 0 ? 'NOBODY WAITING' : `${queue.length} WAITING`}
      </span>

      {queue.length === 0 ? (
        <p className="tray__note">Nobody today. Keep the lights on — word spreads.</p>
      ) : (
        <ul className="tray__slips">
          {queue.map((w, i) => {
            const f = w.fighter;
            const waitTo = formatDate(save.dayCount + w.patience);
            return (
              <li key={f.id}>
                <button
                  className="regslip on-paper"
                  style={paperTilt(f.id, 2, 3)}
                  onClick={() => openWalkIns(ids, i)}
                  disabled={dimmed}
                >
                  <span className="regslip__form" aria-hidden="true">
                    FORM 3-A REV. 6/73
                  </span>
                  <span className="regslip__photo">
                    <Portrait appearance={f.appearance} size={44} />
                    <span className="regslip__clip" aria-hidden="true" />
                  </span>
                  <span className="regslip__main">
                    <span className="regslip__name">{fighterFullName(f).toUpperCase()}</span>
                    <span className="regslip__meta">
                      AGE {fighterAge(f)} · {WEIGHT_CLASSES[f.weightClass].name.toUpperCase()}
                    </span>
                    <span className="regslip__impression">“{f.firstImpression}”</span>
                  </span>
                  <span className="regslip__right">
                    {w.patience <= 3 ? (
                      <Stamp word="IN A HURRY" category="trajectory" seedId={f.id} size="sm" />
                    ) : (
                      <span className="regslip__wait">
                        WILL WAIT — TO {waitTo.month.slice(0, 3).toUpperCase()}. {waitTo.day}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Picked-up object shell                                              */
/* ------------------------------------------------------------------ */

function Held({
  label,
  className,
  onPutDown,
  children,
}: {
  label: string;
  className: string;
  onPutDown: () => void;
  children: ReactNode;
}) {
  return (
    <div className={`held ${className}`} role="region" aria-label={label}>
      {children}
      <button className="held__putdown" onClick={onPutDown}>
        PUT IT DOWN <span className="held__esc">ESC</span>
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* THE ACCOUNTS BOOK — finances                                        */
/* ------------------------------------------------------------------ */

function AccountsBook({ onPutDown }: { onPutDown: () => void }) {
  const { save } = useGame();
  if (!save) return null;
  const date = formatDate(save.dayCount);
  const summary = monthlySummary(save.roster, save.upgrades, save.coaches, date.year);
  const low = save.money < 0;
  const balFigure = low
    ? `($${Math.abs(Math.round(save.money)).toLocaleString('en-US')})`
    : formatMoney(save.money);

  return (
    <Held label="The accounts book" className="held--book" onPutDown={onPutDown}>
      <div className="book">
        {/* left page: this month, printed grid, typed figures */}
        <div className="book__page book__page--left">
          <h3 className="book__heading">THIS MONTH — CURRENT ROSTER</h3>
          <table className="book__grid">
            <tbody>
              <tr className="book__line">
                <td>GYM DUES</td>
                <td className="book__fig book__fig--in">+{formatMoney(summary.duesIncome)}</td>
              </tr>
              <tr className="book__subline">
                <td colSpan={2}>
                  {summary.payingCount} PAYING
                  {summary.brokeCount > 0 && ` · ${summary.brokeCount} CARRIED`}
                </td>
              </tr>
              <tr className="book__line">
                <td>RENT &amp; UTILITIES</td>
                <td className="book__fig book__fig--out">−{formatMoney(summary.overheadBase)}</td>
              </tr>
              {summary.facilitiesUpkeep > 0 && (
                <tr className="book__line">
                  <td>FACILITIES UPKEEP</td>
                  <td className="book__fig book__fig--out">
                    −{formatMoney(summary.facilitiesUpkeep)}
                  </td>
                </tr>
              )}
              <tr className="book__line">
                <td>COACH SALARIES</td>
                <td className="book__fig">
                  {summary.coachSalaries === 0 ? '—' : `−${formatMoney(summary.coachSalaries)}`}
                </td>
              </tr>
              <tr className="book__line book__line--net">
                <td>NET PER MONTH</td>
                <td className={'book__fig ' + (summary.net >= 0 ? 'book__fig--in' : 'book__fig--out')}>
                  {summary.net >= 0 ? '+' : '−'}
                  {formatMoney(Math.abs(summary.net))}
                </td>
              </tr>
            </tbody>
          </table>
          <p className="book__marginalia">
            settled the first of each month, {date.year} dollars
          </p>
        </div>

        {/* right page: the balance, then the closed months */}
        <div className="book__page book__page--right">
          <div className="book__balance">
            <span className="book__balance-label">BALANCE</span>
            <span className={'book__balance-figure' + (low ? ' book__balance-figure--red' : '')}>
              {balFigure}
            </span>
            <span className="book__balance-date">
              {date.month.slice(0, 3)}. {date.day}, {date.year}
            </span>
            {low && <span className="book__overdrawn">OVERDRAWN</span>}
          </div>

          <h3 className="book__heading">CLOSED MONTHS</h3>
          {save.finances.length === 0 ? (
            <p className="book__marginalia">first month not closed yet</p>
          ) : (
            <div className="book__history">
              <table className="book__grid book__grid--history">
                <tbody>
                  {save.finances.map((f, i) => (
                    <tr className="book__line" key={`${f.dayCount}-${i}`}>
                      <td className="book__month">{f.label}</td>
                      <td className="book__fig book__fig--in">+{formatMoney(f.duesIncome)}</td>
                      <td className="book__fig book__fig--out">
                        −{formatMoney(f.overhead + f.coachSalaries)}
                      </td>
                      <td className={'book__fig ' + (f.net >= 0 ? 'book__fig--in' : 'book__fig--out')}>
                        {f.net >= 0 ? '+' : '−'}
                        {formatMoney(Math.abs(f.net))}
                      </td>
                      <td className="book__fig book__fig--bal">{formatMoney(f.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* the overdraft notice, paperclipped askew */}
        {low && (
          <div className="book__notice" style={paperTilt('overdraft', 2, 3)}>
            <span className="book__notice-clip" aria-hidden="true" />
            <span className="book__notice-head">FIRST MERCANTILE BANK — N.Y.</span>
            <Stamp word="PAST DUE" category="money" seedId="overdraft" size="md" />
            <p className="book__notice-body">
              Account overdrawn. Dues will not carry the gym forever — fight purses are how a
              gym stays open.
            </p>
          </div>
        )}
      </div>
    </Held>
  );
}

/* ------------------------------------------------------------------ */
/* THE COMPETITION FOLDER — rivals                                     */
/* ------------------------------------------------------------------ */

type RivalScope = 'local' | 'regional';

const TIER_STAMP: Record<string, string> = {
  established: 'ESTABLISHED',
  regional: 'REGIONAL',
  local: 'LOCAL',
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

function CompetitionFolder({ onPutDown }: { onPutDown: () => void }) {
  const { save } = useGame();
  const [scope, setScope] = useState<RivalScope>('local');
  const [openSheet, setOpenSheet] = useState<string | null>(null);
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
    <Held label="The Competition folder" className="held--folder" onPutDown={onPutDown}>
      <div className="folder">
        {/* die-cut tabs on the folder's right edge — a real radiogroup */}
        <div className="folder__tabs" role="radiogroup" aria-label="Scope">
          {(
            [
              ['local', city.name.toUpperCase()],
              ['regional', REGIONS[region].name.toUpperCase()],
            ] as Array<[RivalScope, string]>
          ).map(([key, label], i) => (
            <button
              key={key}
              role="radio"
              aria-checked={scope === key}
              className={
                'folder__tab' +
                (scope === key ? ' folder__tab--held' : '') +
                (i === 1 ? ' folder__tab--dogear' : '')
              }
              onClick={() => {
                setScope(key);
                setOpenSheet(null);
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* typed appraisal memo stapled inside the front cover */}
        <div className="folder__memo" style={paperTilt('memo', 1.5, 3)}>
          <span className="folder__staple" aria-hidden="true" />
          <p className="folder__memo-line">
            {city.name.toUpperCase()} IS{' '}
            <u>{competitivenessLabel(comp).toUpperCase()}</u>. WE ARE{' '}
            <u>{reputationLabel(rep).toUpperCase()}</u>.
          </p>
          <p className="folder__memo-pencil">nationals — see the magazine on the bench</p>
        </div>

        {/* the dossier fan */}
        <div className="folder__sheets">
          {scope === 'local' && (
            <>
              {localGyms.map((g) => (
                <DossierSheet
                  key={g.id}
                  gym={g}
                  fighters={fightersOfNote(world, g.id, 3)}
                  open={openSheet === g.id || (openSheet === null && g === localGyms[0])}
                  onOpen={() => setOpenSheet(g.id)}
                />
              ))}
              {localIndies.length > 0 && (
                <section className="dossier dossier--indie" style={paperTilt('indies', 1.5, 2)}>
                  <header className="dossier__head">
                    <span className="dossier__name">UNAFFILIATED MEN</span>
                  </header>
                  <ul className="dossier__fighters">
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
              <div key={cityName} className="folder__citygroup">
                <h3 className="folder__cityname">{cityName.toUpperCase()}</h3>
                {regionalByCity
                  .get(cityName)!
                  .sort((a, b) => tierRank(b.tier) - tierRank(a.tier))
                  .map((g) => (
                    <DossierSheet
                      key={g.id}
                      gym={g}
                      fighters={fightersOfNote(world, g.id, 2)}
                      carbon
                      open={openSheet === g.id}
                      onOpen={() => setOpenSheet(openSheet === g.id ? null : g.id)}
                    />
                  ))}
              </div>
            ))}
        </div>
      </div>
    </Held>
  );
}

function recordStr(wf: WorldFighter): string {
  const { wins, losses, draws, kos } = wf.record;
  const base = `${wins}-${losses}-${draws}`;
  return kos > 0 ? `${base} · ${kos} KO` : base;
}

/** One typed half-sheet per gym, shingled so the name line always shows (A5). */
function DossierSheet({
  gym,
  fighters,
  open,
  onOpen,
  carbon,
}: {
  gym: RivalGym;
  fighters: WorldFighter[];
  open: boolean;
  onOpen: () => void;
  carbon?: boolean;
}) {
  return (
    <section
      className={
        'dossier' + (open ? ' dossier--open' : ' dossier--shingled') + (carbon ? ' dossier--carbon' : '')
      }
      style={paperTilt(gym.id, 1.5, 2)}
    >
      <button className="dossier__head" onClick={onOpen} aria-expanded={open}>
        <span className="dossier__name">{gym.name.toUpperCase()}</span>
        <Stamp word={TIER_STAMP[gym.tier]} category="scouting" seedId={gym.id} size="sm" />
      </button>
      {open && (
        <>
          <p className="dossier__sub">
            {gym.managerName} · {humanizeStyle(gym.styleTendency)} · EST. {gym.foundingYear}
          </p>
          {fighters.length === 0 ? (
            <p className="dossier__none">No fighters of note.</p>
          ) : (
            <ul className="dossier__fighters">
              {fighters.map((wf) => (
                <FighterLine key={wf.id} wf={wf} />
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}

function FighterLine({ wf }: { wf: WorldFighter }) {
  const standing = fighterStanding(wf);
  return (
    <li className={`fline fline--${standing.tone}`}>
      <span className="fline__name">{worldFighterName(wf)}</span>
      <span className="fline__class">{WEIGHT_CLASSES[wf.weightClass].name}</span>
      <span className="fline__record">{recordStr(wf)}</span>
      <span className="fline__standing">{standing.label.toUpperCase()}</span>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* THE GYM LEDGER — history                                            */
/* ------------------------------------------------------------------ */

function GymLedger({ onPutDown }: { onPutDown: () => void }) {
  const { save } = useGame();
  if (!save) return null;
  const entries = [...save.history].reverse();
  const begun = formatDate(0);

  return (
    <Held label={`The gym ledger, ${entries.length} entries`} className="held--ledger" onPutDown={onPutDown}>
      <div className="gledger">
        <div className="gledger__flyleaf" style={paperTilt('flyleaf', 1, 2)}>
          {entries.length} {entries.length === 1 ? 'ENTRY' : 'ENTRIES'} — BEGUN{' '}
          {begun.month.slice(0, 3).toUpperCase()}. {begun.year}
        </div>
        <div className="gledger__page">
          {entries.length === 0 ? (
            <p className="book__marginalia">nothing written yet</p>
          ) : (
            <ul className="gledger__rows">
              {entries.map((e, i) => (
                <li className="gledger__row" key={`${e.dayCount}-${i}`}>
                  <span className="gledger__date">{formatDate(e.dayCount).compact}</span>
                  <span
                    className="gledger__text"
                    style={{ opacity: 0.88 + ((e.dayCount * 7 + i * 13) % 12) / 100 }}
                  >
                    {e.text}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Held>
  );
}
