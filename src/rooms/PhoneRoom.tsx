/*
  BOOKING — the phone, as a management surface.
  --------------------------------------------------------------------------
  Two ledgers: calls waiting on an answer (book it or pass), and the bouts
  already signed, each with its corner plan — the staff works it off-screen,
  or you mark it WORK IT MYSELF and the night stops for you.
*/

import { useGame } from '../state/GameContext';
import { Surface } from '../components/Surface';
import { fighterFullName } from '../game/fighters';
import { formatDate } from '../game/time';
import { formatMoney } from '../game/economy';
import { worldFighterName } from '../game/world/population';
import { specialtyName } from '../game/coaches';
import type { BookedFight, CornerPlan } from '../game/fights';
import './PhoneRoom.css';

export function PhoneRoom() {
  const { save, closeRoom, bookFight, declineFightOffer, setCornerPlan } = useGame();
  if (!save) return null;

  const offers = save.fightOffers;
  const booked = [...save.bookedFights].sort((a, b) => a.onDay - b.onDay);

  return (
    <Surface title="BOOKING" onClose={closeRoom}>
      <section aria-label="Calls waiting on an answer">
        <h3 className="surface__section">
          CALLS WAITING{offers.length > 0 ? ` — ${offers.length}` : ''}
        </h3>
        {offers.length === 0 ? (
          <p className="surface__note">No calls. Keep winning — the phone learns your number.</p>
        ) : (
          <ul className="rows">
            {offers.map((o) => {
              const entry = save.roster.find((e) => e.fighter.id === o.fighterId);
              if (!entry) return null;
              const on = formatDate(o.onDay);
              const expires = formatDate(o.expiresDay);
              return (
                <li className="offer" key={o.id}>
                  <div className="offer__terms">
                    <span className="row__main">
                      {fighterFullName(entry.fighter).toUpperCase()} · {o.rounds} RDS ·{' '}
                      {on.month.slice(0, 3).toUpperCase()} {on.day} · {formatMoney(o.purse)} ·{' '}
                      {o.venue.toUpperCase()}
                    </span>
                    <span className="offer__pitch">“{o.pitch}”</span>
                    <span className="row__note">
                      ANSWER BY {expires.month.slice(0, 3).toUpperCase()} {expires.day} OR HE BOOKS
                      ELSEWHERE
                    </span>
                  </div>
                  <div className="offer__answer">
                    <button className="unit__action offer__btn" onClick={() => bookFight(o.id)}>
                      BOOK IT
                    </button>
                    <button
                      className="unit__action unit__action--danger offer__btn"
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
      </section>

      <section aria-label="On the book">
        <h3 className="surface__section">
          ON THE BOOK{booked.length > 0 ? ` — ${booked.length}` : ''}
        </h3>
        {booked.length === 0 ? (
          <p className="surface__note">Nothing signed. A gym eats on purses.</p>
        ) : (
          <ul className="rows">
            {booked.map((b) => {
              const entry = save.roster.find((e) => e.fighter.id === b.fighterId);
              const opp = save.world.fighters.find((f) => f.id === b.opponentId);
              if (!entry) return null;
              const on = formatDate(b.onDay);
              return (
                <li className="bout" key={b.id}>
                  <span className="row__main">
                    {entry.fighter.lastName.toUpperCase()} v.{' '}
                    {opp ? worldFighterName(opp).toUpperCase() : 'T.B.A.'}
                  </span>
                  <span className="row__detail">
                    {on.month.slice(0, 3).toUpperCase()} {on.day} · {b.rounds} RDS ·{' '}
                    {formatMoney(b.purse)} · {b.venue.toUpperCase()}
                  </span>
                  <CornerPlanEditor bout={b} onChange={(plan) => setCornerPlan(b.id, plan)} />
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </Surface>
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

  return (
    <div className="cplan">
      <div className="cplan__mode" role="radiogroup" aria-label="Who works the corner">
        <button
          role="radio"
          aria-checked={plan.mode === 'self'}
          className={'cplan__chip' + (plan.mode === 'self' ? ' cplan__chip--on' : '')}
          onClick={() => onChange({ ...plan, mode: 'self' })}
        >
          WORK IT MYSELF
        </button>
        <button
          role="radio"
          aria-checked={plan.mode === 'staff'}
          className={'cplan__chip' + (plan.mode === 'staff' ? ' cplan__chip--on' : '')}
          onClick={() => onChange({ ...plan, mode: 'staff' })}
        >
          SEND THE STAFF
        </button>
        {plan.mode === 'self' && (
          <span className="cplan__note">THE CLOCK STOPS ON FIGHT DAY — YOU’LL BE THERE</span>
        )}
      </div>
      <div className="cplan__picks">
        <label className="cplan__pick">
          <span className="cplan__label">
            {plan.mode === 'self' ? 'ON THE STOOL WITH YOU' : 'CHIEF SECOND'}
          </span>
          <select
            className="mselect"
            value={plan.chiefSecondId ?? ''}
            onChange={(e) => onChange({ ...plan, chiefSecondId: e.target.value || null })}
          >
            <option value="">
              {plan.mode === 'self' ? 'nobody — your own eyes' : 'nobody senior'}
            </option>
            {save.coaches.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({specialtyName(c.specialty)})
              </option>
            ))}
          </select>
        </label>
        <label className="cplan__pick">
          <span className="cplan__label">CUTMAN</span>
          <select
            className="mselect"
            value={plan.cutmanId ?? ''}
            onChange={(e) => onChange({ ...plan, cutmanId: e.target.value || null })}
          >
            <option value="">nobody — a sponge and hope</option>
            {save.coaches.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({specialtyName(c.specialty)})
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
