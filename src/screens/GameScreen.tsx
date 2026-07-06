/*
  GameScreen — the manager's desk. The game, at a glance.
  --------------------------------------------------------------------------
  A dashboard in the game's own materials: everything a 1975 manager keeps
  in front of him, one click deep, over the painted gym as a backdrop.

    ON THE BOOK        — booked bouts as index cards (click: the phone)
    WHILE YOU WERE OUT — promoter calls waiting (click: the phone)
    THE CORKBOARD      — the gym log, pinned where you can read it
    THE TRAINER'S WORD — knowable facts: who's healing and until when,
                         who's at the door, who answered the ad
    THE BOTTOM LINE    — bank balance and last month's settle

  FOG RULE: the desk shows what a manager would have on paper — dates,
  dollars, bookings, names. Moods, ceilings, and legs stay reads, earned
  in the rooms. No ratings, no bars, no numbers the world wouldn't give.

  The gym-as-place UI is gone: no doors, no hotspots, no rooms-as-rooms.
  The art is a backdrop (placeholder until the bespoke desk image lands),
  the paperwork leans and looks handwritten, and every surface is one
  click from here. Fight night still stops the clock and takes the row.
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
import { FLOOR_SCENE } from '../assets/floorScene';
import { paperTilt } from '../kit/seed';
import { GymLogBoard } from '../components/GymLogBoard';
import { RoomRouter } from '../rooms/RoomRouter';
import { ArrivalNotice } from '../components/ArrivalNotice';
import { Toast } from '../components/Toast';
import { WalkInViewer } from './WalkInViewer';
import { FighterProfile } from './FighterProfile';
import { FightNight } from './FightNight';
import './GameScreen.css';

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

  return (
    <div className="desk-screen">
      {/* the room behind the paperwork */}
      <img className="desk-screen__backdrop" src={FLOOR_SCENE.src} alt="" draggable={false} />
      <div className="desk-screen__shade" aria-hidden="true" />

      {/* masthead */}
      <header className="masthead">
        <div className="masthead__ident">
          <h1 className="masthead__name">{save.gymName.toUpperCase()}</h1>
          <p className="masthead__sub">
            {rep.toUpperCase()} · {city.name.toUpperCase()}, {REGIONS[city.region].name.toUpperCase()}
          </p>
        </div>
        <div className="masthead__facts">
          <span className="masthead__date">{date.full}</span>
          <span className="masthead__cash" title="Bank balance">
            {formatMoney(save.money)}
          </span>
        </div>
      </header>

      {/* the paperwork */}
      <main className="deskgrid">
        {/* ON THE BOOK */}
        <section className="panel panel--book" style={paperTilt('panel-book', 0.5, 0.9)} aria-label="On the book — booked bouts">
          <h2 className="panel__head">ON THE BOOK</h2>
          {booked.length === 0 ? (
            <p className="panel__quiet">nothing signed. a gym eats on purses.</p>
          ) : (
            <ul className="panel__cards">
              {booked.slice(0, 3).map((b) => {
                const man = save.roster.find((e) => e.fighter.id === b.fighterId);
                const opp = save.world.fighters.find((f) => f.id === b.opponentId);
                const on = formatDate(b.onDay);
                if (!man) return null;
                return (
                  <li key={b.id}>
                    <button
                      className="bookcard"
                      style={paperTilt(b.id, 0.6, 1.2)}
                      onClick={() => openRoom('phone')}
                    >
                      <span className="bookcard__who">
                        {man.fighter.lastName.toUpperCase()} v.{' '}
                        {opp ? worldFighterName(opp).toUpperCase() : 'T.B.A.'}
                      </span>
                      <span className="bookcard__when">
                        {on.month.slice(0, 3).toUpperCase()}. {on.day} · {b.rounds} RDS ·{' '}
                        {formatMoney(b.purse)} · {b.venue.toUpperCase()}
                      </span>
                      <span className="bookcard__corner">
                        {b.corner.mode === 'self' ? 'YOU WORK THE CORNER' : 'STAFF WORKS IT'}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* WHILE YOU WERE OUT */}
        <section className="panel panel--calls" style={paperTilt('panel-calls', 0.6, 1.1)} aria-label="While you were out — promoter calls">
          <h2 className="panel__head">WHILE YOU WERE OUT</h2>
          {save.fightOffers.length === 0 ? (
            <p className="panel__quiet">no calls waiting.</p>
          ) : (
            <ul className="panel__cards">
              {save.fightOffers.slice(0, 3).map((o) => {
                const man = save.roster.find((e) => e.fighter.id === o.fighterId);
                const expires = formatDate(o.expiresDay);
                if (!man) return null;
                return (
                  <li key={o.id}>
                    <button
                      className="callcard"
                      style={paperTilt(o.id, 0.8, 1.6)}
                      onClick={() => openRoom('phone')}
                    >
                      <span className="callcard__who">
                        A PROMOTER WANTS {man.fighter.lastName.toUpperCase()}
                      </span>
                      <span className="callcard__terms">
                        {formatMoney(o.purse)} at the {o.venue} — answer by{' '}
                        {expires.month.slice(0, 3)}. {expires.day}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          <button className="panel__go" onClick={() => openRoom('phone')}>
            THE PHONE
            {save.fightOffers.length > 0 && (
              <span className="panel__count">{save.fightOffers.length}</span>
            )}
          </button>
        </section>

        {/* THE CORKBOARD */}
        <section className="panel panel--cork" style={paperTilt('panel-cork', 0.3, 0.6)} aria-label="The corkboard — gym log">
          <GymLogBoard />
        </section>

        {/* THE TRAINER'S WORD — knowable facts only */}
        <section className="panel panel--word" style={paperTilt('panel-word', 0.5, 1)} aria-label="The trainer's word">
          <h2 className="panel__head">THE TRAINER’S WORD</h2>
          <ul className="wordlist">
            {resting.map((e) => {
              const back = formatDate(e.restUntil);
              return (
                <li className="wordlist__line" key={e.fighter.id}>
                  {fighterFullName(e.fighter)} — healing. Back {back.month.slice(0, 3)}. {back.day}.
                </li>
              );
            })}
            {requests.map((e) => (
              <li className="wordlist__line wordlist__line--mark" key={e.fighter.id}>
                {e.fighter.lastName} wants an answer about his future.
              </li>
            ))}
            {save.walkIns.length > 0 && (
              <li className="wordlist__line">
                <button
                  className="wordlist__act"
                  onClick={() => openWalkIns(save.walkIns.map((w) => w.fighter.id), 0)}
                >
                  {save.walkIns.length === 1
                    ? 'A man is waiting at the door.'
                    : `${save.walkIns.length} men are waiting at the door.`}{' '}
                  SEE THEM →
                </button>
              </li>
            )}
            {save.coachApplicants.length > 0 && (
              <li className="wordlist__line">
                <button className="wordlist__act" onClick={() => openRoom('gym')}>
                  {save.coachApplicants.length === 1
                    ? 'A coach answered the ad.'
                    : `${save.coachApplicants.length} coaches answered the ad.`}{' '}
                  →
                </button>
              </li>
            )}
            {resting.length === 0 &&
              requests.length === 0 &&
              save.walkIns.length === 0 &&
              save.coachApplicants.length === 0 && (
                <li className="wordlist__line wordlist__line--quiet">
                  “Everybody’s upright. Nothing needs you today.”
                </li>
              )}
          </ul>
        </section>

        {/* THE BOTTOM LINE */}
        <section className="panel panel--money" style={paperTilt('panel-money', 0.5, 0.9)} aria-label="The bottom line">
          <h2 className="panel__head">THE BOTTOM LINE</h2>
          <p className={'money__balance' + (save.money < 0 ? ' money__balance--red' : '')}>
            {save.money < 0
              ? `($${Math.abs(Math.round(save.money)).toLocaleString('en-US')})`
              : formatMoney(save.money)}
          </p>
          {lastMonth ? (
            <p className="money__note">
              {lastMonth.label}: {lastMonth.net >= 0 ? '+' : '−'}
              {formatMoney(Math.abs(lastMonth.net))} after rent and salaries.
            </p>
          ) : (
            <p className="money__note">first month not closed yet.</p>
          )}
          <button className="panel__go" onClick={() => openRoom('office')}>
            THE ACCOUNTS
          </button>
        </section>
      </main>

      {/* the button row: places + the clock */}
      <nav className="deskbar">
        <button className="deskbar__btn" onClick={() => openRoom('locker')}>
          LOCKER ROOM
        </button>
        <button className="deskbar__btn" onClick={() => openRoom('office')}>
          OFFICE
        </button>
        <button className="deskbar__btn" onClick={() => openRoom('gym')}>
          STAFF &amp; UPGRADES
        </button>
        <button className="deskbar__btn" onClick={() => openRoom('press')}>
          {save.press.paperName.toUpperCase()}
        </button>
        <span className="deskbar__gap" />
        {liveBout ? (
          <button className="deskbar__btn deskbar__btn--fight" onClick={() => setFightOpen(true)}>
            FIGHT NIGHT — {liveMan ? liveMan.fighter.lastName.toUpperCase() : 'THE BOUT'} AT THE{' '}
            {liveBout.venue.toUpperCase()}
          </button>
        ) : (
          <>
            <button className="deskbar__btn deskbar__btn--advance" onClick={() => advanceTime('day')}>
              Advance Day
            </button>
            <button
              className="deskbar__btn deskbar__btn--advance deskbar__btn--week"
              onClick={() => advanceTime('week')}
            >
              Advance Week
            </button>
          </>
        )}
        <button className="deskbar__btn deskbar__btn--home" onClick={goHome} title="Leave for the home screen">
          Home
        </button>
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
