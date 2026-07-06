/*
  GameScreen — the management system.
  --------------------------------------------------------------------------
  The gym is rough around the edges. The management isn't.

  One screen: the gym after hours as environmental storytelling, and over
  its negative space a calm, deliberate information layer — painted steel,
  charcoal panels, cream label plates, muted gold. An impeccably organized
  system from an alternate 1975. No paper props, no clutter: the age comes
  from typography, color, and material, not novelty.

  Layout honors the art: panels ride the dark left wall and the dark
  foreground floor; the ring and the lit windows stay visible.

    ON THE BOOK — bouts signed, with who works the corner
    CALLS       — promoters waiting on an answer
    GYM REPORT  — knowable facts: healing (with dates), the door, the ad
    LEDGER      — balance and last month's settle
    GYM LOG     — the floor's recent lines, typed

  FOG RULE unchanged: dates, dollars, bookings, names. Moods, ceilings,
  and legs stay reads, earned elsewhere. No ratings, no bars.
*/

import { useState } from 'react';
import { useGame } from '../state/GameContext';
import { formatDate } from '../game/time';
import { formatMoney } from '../game/economy';
import { fighterFullName } from '../game/fighters';
import { worldFighterName } from '../game/world/population';
import { gymReputation, reputationLabel } from '../game/reputation';
import { getCity } from '../game/cities';
import { REGIONS } from '../game/regions';
import { RoomRouter } from '../rooms/RoomRouter';
import { ArrivalNotice } from '../components/ArrivalNotice';
import { Toast } from '../components/Toast';
import { WalkInViewer } from './WalkInViewer';
import { FighterProfile } from './FighterProfile';
import { FightNight } from './FightNight';
import './GameScreen.css';

const BACKDROP = '/dashboard/gym.jpg';

export function GameScreen() {
  const { save, openRoom, openWalkIns, goHome, advanceTime, liveBout } = useGame();
  const [fightOpen, setFightOpen] = useState(false);
  if (!save) return null;

  const date = formatDate(save.dayCount);
  const city = getCity(save.cityId);
  const rep = reputationLabel(gymReputation(save.roster) + save.reputationMod);
  const liveMan = liveBout ? save.roster.find((e) => e.fighter.id === liveBout.fighterId) : null;

  const booked = [...save.bookedFights].sort((a, b) => a.onDay - b.onDay);
  const resting = save.roster
    .filter((e) => (e.restUntil ?? 0) > save.dayCount)
    .sort((a, b) => a.restUntil - b.restUntil);
  const requests = save.roster.filter((e) => e.lockerRequested && !e.hasLocker);
  const lastMonth = save.finances[0] ?? null;
  const quietReport =
    resting.length === 0 &&
    requests.length === 0 &&
    save.walkIns.length === 0 &&
    save.coachApplicants.length === 0;

  return (
    <div className="mgmt">
      <img className="mgmt__backdrop" src={BACKDROP} alt="" draggable={false} />

      {/* masthead — one steel rail */}
      <header className="mgmt__mast">
        <div className="mgmt__ident">
          <h1 className="mgmt__name">{save.gymName.toUpperCase()}</h1>
          <span className="mgmt__standing">
            {rep.toUpperCase()} · {city.name.toUpperCase()},{' '}
            {REGIONS[city.region].name.toUpperCase()}
          </span>
        </div>
        <div className="mgmt__facts">
          <span className="mgmt__fact">
            <span className="mgmt__fact-label">DATE</span>
            <span className="mgmt__fact-value">{date.full}</span>
          </span>
          <span className="mgmt__fact">
            <span className="mgmt__fact-label">BANK</span>
            <span className={'mgmt__fact-value mgmt__fact-value--gold' + (save.money < 0 ? ' mgmt__fact-value--red' : '')}>
              {save.money < 0
                ? `($${Math.abs(Math.round(save.money)).toLocaleString('en-US')})`
                : formatMoney(save.money)}
            </span>
          </span>
        </div>
      </header>

      {/* the information layer, laid over the art's dark flanks */}
      <main className="mgmt__lay">
        {/* left rail — the fight business */}
        <div className="mgmt__rail mgmt__rail--left">
          <section className="unit" aria-label="On the book — bouts signed">
            <header className="unit__plate">
              <h2 className="unit__title">ON THE BOOK</h2>
              {booked.length > 0 && <span className="unit__tally">{booked.length}</span>}
            </header>
            <div className="unit__body">
              {booked.length === 0 ? (
                <p className="unit__empty">Nothing signed. A gym eats on purses.</p>
              ) : (
                <ul className="rows">
                  {booked.slice(0, 4).map((b) => {
                    const man = save.roster.find((e) => e.fighter.id === b.fighterId);
                    const opp = save.world.fighters.find((f) => f.id === b.opponentId);
                    const on = formatDate(b.onDay);
                    if (!man) return null;
                    return (
                      <li key={b.id}>
                        <button className="row" onClick={() => openRoom('phone')}>
                          <span className="row__main">
                            {man.fighter.lastName.toUpperCase()} v.{' '}
                            {opp ? worldFighterName(opp).toUpperCase() : 'T.B.A.'}
                          </span>
                          <span className="row__detail">
                            {on.month.slice(0, 3).toUpperCase()} {on.day} · {b.rounds} RDS ·{' '}
                            {formatMoney(b.purse)} · {b.venue.toUpperCase()}
                          </span>
                          <span className={'row__note' + (b.corner.mode === 'self' ? ' row__note--gold' : '')}>
                            {b.corner.mode === 'self' ? 'YOU WORK THE CORNER' : 'STAFF WORKS IT'}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </section>

          <section className="unit" aria-label="Calls — promoters waiting on an answer">
            <header className="unit__plate">
              <h2 className="unit__title">CALLS</h2>
              {save.fightOffers.length > 0 && (
                <span className="unit__tally unit__tally--due">{save.fightOffers.length}</span>
              )}
            </header>
            <div className="unit__body">
              {save.fightOffers.length === 0 ? (
                <p className="unit__empty">No calls waiting.</p>
              ) : (
                <ul className="rows">
                  {save.fightOffers.slice(0, 3).map((o) => {
                    const man = save.roster.find((e) => e.fighter.id === o.fighterId);
                    const expires = formatDate(o.expiresDay);
                    if (!man) return null;
                    return (
                      <li key={o.id}>
                        <button className="row" onClick={() => openRoom('phone')}>
                          <span className="row__main">
                            A PROMOTER WANTS {man.fighter.lastName.toUpperCase()}
                          </span>
                          <span className="row__detail">
                            {formatMoney(o.purse)} at the {o.venue} · answer by{' '}
                            {expires.month.slice(0, 3).toUpperCase()} {expires.day}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
              <button className="unit__action" onClick={() => openRoom('phone')}>
                THE PHONE →
              </button>
            </div>
          </section>
        </div>

        {/* right rail — the gym's condition */}
        <div className="mgmt__rail mgmt__rail--right">
          <section className="unit" aria-label="Gym report">
            <header className="unit__plate">
              <h2 className="unit__title">GYM REPORT</h2>
            </header>
            <div className="unit__body">
              <ul className="facts">
                {resting.map((e) => {
                  const back = formatDate(e.restUntil);
                  return (
                    <li className="facts__line" key={e.fighter.id}>
                      <span className="facts__what">{fighterFullName(e.fighter)}</span>
                      <span className="facts__when">
                        HEALING · BACK {back.month.slice(0, 3).toUpperCase()} {back.day}
                      </span>
                    </li>
                  );
                })}
                {requests.map((e) => (
                  <li className="facts__line" key={e.fighter.id}>
                    <button className="facts__act" onClick={() => openRoom('locker')}>
                      <span className="facts__what">{e.fighter.lastName}</span>
                      <span className="facts__when facts__when--due">WANTS AN ANSWER →</span>
                    </button>
                  </li>
                ))}
                {save.walkIns.length > 0 && (
                  <li className="facts__line">
                    <button
                      className="facts__act"
                      onClick={() => openWalkIns(save.walkIns.map((w) => w.fighter.id), 0)}
                    >
                      <span className="facts__what">AT THE DOOR</span>
                      <span className="facts__when facts__when--due">
                        {save.walkIns.length} WAITING — SEE THEM →
                      </span>
                    </button>
                  </li>
                )}
                {save.coachApplicants.length > 0 && (
                  <li className="facts__line">
                    <button className="facts__act" onClick={() => openRoom('gym')}>
                      <span className="facts__what">THE AD</span>
                      <span className="facts__when">
                        {save.coachApplicants.length} ANSWERED →
                      </span>
                    </button>
                  </li>
                )}
                {quietReport && (
                  <li className="facts__line facts__line--quiet">
                    Everybody upright. Nothing needs you today.
                  </li>
                )}
              </ul>
            </div>
          </section>

          <section className="unit" aria-label="Ledger">
            <header className="unit__plate">
              <h2 className="unit__title">LEDGER</h2>
            </header>
            <div className="unit__body">
              <div className="ledger__line">
                <span className="ledger__label">BALANCE</span>
                <span className={'ledger__figure' + (save.money < 0 ? ' ledger__figure--red' : '')}>
                  {save.money < 0
                    ? `($${Math.abs(Math.round(save.money)).toLocaleString('en-US')})`
                    : formatMoney(save.money)}
                </span>
              </div>
              {lastMonth && (
                <div className="ledger__line">
                  <span className="ledger__label">{lastMonth.label.toUpperCase()}</span>
                  <span className={'ledger__figure ledger__figure--sm' + (lastMonth.net < 0 ? ' ledger__figure--red' : '')}>
                    {lastMonth.net >= 0 ? '+' : '−'}
                    {formatMoney(Math.abs(lastMonth.net))}
                  </span>
                </div>
              )}
              <button className="unit__action" onClick={() => openRoom('office')}>
                THE ACCOUNTS →
              </button>
            </div>
          </section>
        </div>

        {/* bottom band — the floor speaks, over the empty boards */}
        <section className="unit mgmt__log" aria-label="Gym log">
          <header className="unit__plate">
            <h2 className="unit__title">GYM LOG</h2>
          </header>
          <div className="unit__body">
            {save.recentLog.length === 0 ? (
              <p className="unit__empty">Nothing yet. Give it a few days.</p>
            ) : (
              <ul className="log">
                {save.recentLog.slice(0, 4).map((line, i) => {
                  const d = formatDate(line.dayCount);
                  return (
                    <li className="log__line" key={`${line.dayCount}-${i}`}>
                      <span className="log__date">
                        {d.month.slice(0, 3).toUpperCase()} {d.day}
                      </span>
                      <span className="log__text">{line.text}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      </main>

      {/* the console — every destination, one row */}
      <nav className="console">
        <div className="console__places">
          <button className="console__btn" onClick={() => openRoom('locker')}>
            ROSTER
          </button>
          <button className="console__btn" onClick={() => openRoom('phone')}>
            BOOKING
          </button>
          <button className="console__btn" onClick={() => openRoom('office')}>
            OFFICE
          </button>
          <button className="console__btn" onClick={() => openRoom('gym')}>
            STAFF
          </button>
          <button className="console__btn" onClick={() => openRoom('press')}>
            PRESS
          </button>
        </div>
        <div className="console__clock">
          {liveBout ? (
            <button className="console__btn console__btn--fight" onClick={() => setFightOpen(true)}>
              FIGHT NIGHT — {liveMan ? liveMan.fighter.lastName.toUpperCase() : 'THE BOUT'} AT THE{' '}
              {liveBout.venue.toUpperCase()}
            </button>
          ) : (
            <>
              <button className="console__btn console__btn--advance" onClick={() => advanceTime('day')}>
                Advance Day
              </button>
              <button
                className="console__btn console__btn--advance console__btn--week"
                onClick={() => advanceTime('week')}
              >
                Advance Week
              </button>
            </>
          )}
          <button className="console__btn console__btn--quiet" onClick={goHome} title="Leave for the home screen">
            Home
          </button>
        </div>
      </nav>

      {/* overlays */}
      {fightOpen && liveBout && <FightNight onClose={() => setFightOpen(false)} />}
      <ArrivalNotice />
      <RoomRouter />
      <FighterProfile />
      <WalkInViewer />
      <Toast />
    </div>
  );
}
