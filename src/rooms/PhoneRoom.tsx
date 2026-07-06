/*
  The Phone — fight booking, one click from anywhere.
  --------------------------------------------------------------------------
  Message slips and the book. Offers read like WHILE YOU WERE OUT memos:
  book it or pass. Booked bouts carry a corner plan — the staff works it
  off-screen, or you mark it WORK IT MYSELF and the night stops for you.

  PhoneSheets is the paper itself; PhoneRoom is the standalone overlay the
  dashboard opens (the office desk shows the same sheets as a held object).
*/

import { useEffect } from 'react';
import { useGame } from '../state/GameContext';
import { fighterFullName } from '../game/fighters';
import { formatDate } from '../game/time';
import { formatMoney } from '../game/economy';
import { worldFighterName } from '../game/world/population';
import { specialtyName } from '../game/coaches';
import type { BookedFight, CornerPlan } from '../game/fights';
import { paperTilt } from '../kit/seed';
import './PhoneRoom.css';

export function PhoneSheets() {
  const { save, bookFight, declineFightOffer, setCornerPlan } = useGame();
  if (!save) return null;

  const offers = save.fightOffers;
  const booked = [...save.bookedFights].sort((a, b) => a.onDay - b.onDay);

  return (
    <div className="phonedesk">
      <div className="phonedesk__col">
        <h3 className="book__heading">WHILE YOU WERE OUT</h3>
        {offers.length === 0 ? (
          <p className="book__marginalia">no calls. keep winning — the phone learns your number</p>
        ) : (
          <ul className="phonedesk__slips">
            {offers.map((o) => {
              const entry = save.roster.find((e) => e.fighter.id === o.fighterId);
              if (!entry) return null;
              const on = formatDate(o.onDay);
              const expires = formatDate(o.expiresDay);
              return (
                <li className="callslip" style={paperTilt(o.id, 1.5, 3)} key={o.id}>
                  <p className="callslip__for">
                    FOR: <b>{fighterFullName(entry.fighter).toUpperCase()}</b> · {o.rounds} RDS ·{' '}
                    {on.month.slice(0, 3).toUpperCase()}. {on.day}
                  </p>
                  <p className="callslip__pitch">“{o.pitch}”</p>
                  <p className="callslip__terms">
                    {formatMoney(o.purse)} at the {o.venue}. Answer by {expires.month.slice(0, 3)}.{' '}
                    {expires.day} or he books elsewhere.
                  </p>
                  <div className="callslip__row">
                    <button className="callslip__btn" onClick={() => bookFight(o.id)}>
                      BOOK IT
                    </button>
                    <button
                      className="callslip__btn callslip__btn--pass"
                      onClick={() => declineFightOffer(o.id)}
                    >
                      PASS
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="phonedesk__col">
        <h3 className="book__heading">ON THE BOOK</h3>
        {booked.length === 0 ? (
          <p className="book__marginalia">nothing signed. a gym eats on purses</p>
        ) : (
          <ul className="phonedesk__slips">
            {booked.map((b) => {
              const entry = save.roster.find((e) => e.fighter.id === b.fighterId);
              const opp = save.world.fighters.find((f) => f.id === b.opponentId);
              if (!entry) return null;
              const on = formatDate(b.onDay);
              return (
                <li className="bookedcard" style={paperTilt(b.id, 1, 2)} key={b.id}>
                  <p className="bookedcard__head">
                    <b>{entry.fighter.lastName.toUpperCase()}</b> v.{' '}
                    {opp ? worldFighterName(opp).toUpperCase() : 'T.B.A.'} —{' '}
                    {on.month.slice(0, 3).toUpperCase()}. {on.day}, {b.rounds} RDS,{' '}
                    {formatMoney(b.purse)}
                  </p>
                  <CornerPlanEditor bout={b} onChange={(plan) => setCornerPlan(b.id, plan)} />
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

/** Who works the night: yourself (the fight plays live) or the staff. */
function CornerPlanEditor({
  bout,
  onChange,
}: {
  bout: BookedFight;
  onChange: (plan: CornerPlan) => void;
}) {
  const { save } = useGame();
  if (!save) return null;
  const plan = bout.corner;
  const cutmen = save.coaches;

  return (
    <div className="cornerplan">
      <div className="cornerplan__mode" role="radiogroup" aria-label="Who works the corner">
        <button
          role="radio"
          aria-checked={plan.mode === 'self'}
          className={'cornerplan__chip' + (plan.mode === 'self' ? ' cornerplan__chip--on' : '')}
          onClick={() => onChange({ ...plan, mode: 'self' })}
        >
          WORK IT MYSELF
        </button>
        <button
          role="radio"
          aria-checked={plan.mode === 'staff'}
          className={'cornerplan__chip' + (plan.mode === 'staff' ? ' cornerplan__chip--on' : '')}
          onClick={() => onChange({ ...plan, mode: 'staff' })}
        >
          SEND THE STAFF
        </button>
      </div>
      <label className="cornerplan__pick">
        {plan.mode === 'self' ? 'ON THE STOOL WITH YOU' : 'CHIEF SECOND'}
        <select
          value={plan.chiefSecondId ?? ''}
          onChange={(e) => onChange({ ...plan, chiefSecondId: e.target.value || null })}
        >
          <option value="">{plan.mode === 'self' ? 'nobody — your own eyes' : 'nobody senior'}</option>
          {save.coaches.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({specialtyName(c.specialty)})
            </option>
          ))}
        </select>
      </label>
      <label className="cornerplan__pick">
        CUTMAN
        <select
          value={plan.cutmanId ?? ''}
          onChange={(e) => onChange({ ...plan, cutmanId: e.target.value || null })}
        >
          <option value="">nobody — a sponge and hope</option>
          {cutmen.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({specialtyName(c.specialty)})
            </option>
          ))}
        </select>
      </label>
      {plan.mode === 'self' && (
        <p className="cornerplan__note">the clock stops on fight day — you'll be there</p>
      )}
    </div>
  );
}

/** Standalone phone overlay — the dashboard's one-click booking surface. */
export function PhoneRoom() {
  const { closeRoom } = useGame();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeRoom();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeRoom]);

  return (
    <div className="phone-room" role="dialog" aria-label="The phone — fight booking">
      <div className="phone-room__sheet">
        <header className="phone-room__head">
          <h2 className="phone-room__title">THE PHONE</h2>
          <button className="phone-room__close" onClick={closeRoom}>
            HANG UP <span className="phone-room__esc">ESC</span>
          </button>
        </header>
        <PhoneSheets />
      </div>
    </div>
  );
}
