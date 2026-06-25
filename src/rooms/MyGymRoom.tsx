/*
  MyGymRoom — My Gym: Coaching & Staff (Phase 5+, expands in Phase 6)
  --------------------------------------------------------------------------
  The gym-wide, above-the-individual view. Your training identity (the city's
  style philosophy), your focused-training capacity and who's currently using
  it, and your coaching staff. Per-fighter training assignment lives in the
  Locker Room now — this room is the gym, not the man.

  Coach hiring and assigning fighters to coaches arrive in Phase 6; the staff
  section is the placeholder for it.
*/

import { useEffect, useState } from 'react';
import { useGame } from '../state/GameContext';
import { getCity } from '../game/cities';
import { fighterFullName } from '../game/fighters';
import { focusLabel, gymPhilosophyLabel } from '../game/training';
import { formatDate } from '../game/time';
import { formatMoney, upgradeCost, upgradeNextUpkeep, coachMonthlySalary } from '../game/economy';
import {
  specialtyName,
  specialtyBlurb,
  personalityName,
  tierName,
  SPECIALTY_ORDER,
  type Coach,
  type CoachPosting,
} from '../game/coaches';
import {
  UPGRADE_ORDER,
  trackName,
  trackBlurb,
  maxLevel,
  effectAtLevel,
  effectGain,
} from '../game/upgrades';
import { Portrait } from '../assets/portraits';
import './MyGymRoom.css';

export function MyGymRoom() {
  const {
    save,
    closeRoom,
    profileId,
    viewerIds,
    focusCapacity,
    openRoom,
    openProfile,
    purchaseUpgrade,
    postCoachJob,
    cancelCoachJob,
    hireApplicant,
    passApplicant,
    fireCoach,
  } = useGame();
  const [postingChoice, setPostingChoice] = useState<CoachPosting>('any');

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

  const philosophy = gymPhilosophyLabel(getCity(save.cityId).archetype);
  const focused = save.roster.filter((e) => e.focus !== null);
  const year = formatDate(save.dayCount).year;
  const managerUsed = save.roster.filter((e) => e.focus !== null && e.coachId === null).length;
  const coachUsed = (id: string) =>
    save.roster.filter((e) => e.focus !== null && e.coachId === id).length;

  return (
    <div className="room-screen worn" role="dialog" aria-label="My Gym">
      <div className="room-screen__backdrop" aria-hidden="true" />

      <header className="room-screen__chrome">
        <button className="room-screen__back" onClick={closeRoom} title="Back to the floor (Esc)">
          ← Back to the floor
        </button>
        <span className="room-screen__breadcrumb">Your Gym · My Gym</span>
      </header>

      <div className="room-screen__body mygym__body">
        <div className="mygym">
          <header className="mygym__head">
            <div>
              <p className="mygym__eyebrow">Coaching &amp; Staff</p>
              <h2 className="mygym__title">My Gym</h2>
            </div>
          </header>

          {/* Training identity */}
          <section className="mygym__section">
            <h3 className="mygym__section-title">Training Identity</h3>
            <p className="mygym__identity">
              This gym brings men up under a <strong>{philosophy}</strong> philosophy.
              Every locker holder develops along it on his own each day; your
              personal attention — focused training — is set per fighter in the
              <button className="mygym__link" onClick={() => openRoom('locker')}>
                Locker Room
              </button>
              .
            </p>
          </section>

          {/* Focused capacity */}
          <section className="mygym__section">
            <div className="mygym__capacity">
              <span className="mygym__cap-count">
                {focused.length} / {focusCapacity}
              </span>
              <span className="mygym__cap-label">focused slots in use</span>
            </div>

            {focused.length === 0 ? (
              <p className="mygym__none">
                No one is in focused training. Pick a fighter or two in the Locker
                Room to give your personal attention.
              </p>
            ) : (
              <ul className="mygym__focused">
                {focused.map((e) => (
                  <li key={e.fighter.id}>
                    <button className="mygym__focused-row" onClick={() => openProfile(e.fighter.id)}>
                      <span className="mygym__focused-portrait">
                        <Portrait appearance={e.fighter.appearance} size={40} />
                      </span>
                      <span className="mygym__focused-name">{fighterFullName(e.fighter)}</span>
                      <span className="mygym__focused-area">{focusLabel(e.focus!)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Staff */}
          <section className="mygym__section">
            <div className="mygym__facilities-head">
              <h3 className="mygym__section-title">Your Staff</h3>
              <span className="mygym__cash">
                You + {save.coaches.length} {save.coaches.length === 1 ? 'coach' : 'coaches'} ·{' '}
                {focusCapacity} focused slots
              </span>
            </div>

            <ul className="coaches">
              <li className="coach coach--you">
                <div className="coach__main">
                  <span className="coach__name">{save.manager.name || 'You'}</span>
                  <span className="coach__line">
                    Head Trainer · {managerUsed}/2 in use · no salary
                  </span>
                </div>
              </li>
              {save.coaches.map((c) => (
                <li className="coach" key={c.id}>
                  <CoachInfo coach={c} used={coachUsed(c.id)} />
                  <button className="coach__fire" onClick={() => fireCoach(c.id)} title="Let him go">
                    Let go
                  </button>
                </li>
              ))}
            </ul>
          </section>

          {/* Hiring — post a job and wait for applicants */}
          <section className="mygym__section">
            <div className="mygym__facilities-head">
              <h3 className="mygym__section-title">Hiring</h3>
              {save.coachPosting && (
                <button className="posting__cancel" onClick={cancelCoachJob}>
                  Cancel search
                </button>
              )}
            </div>

            {!save.coachPosting ? (
              <div className="posting">
                <p className="posting__lead">
                  Coaches don’t walk in off the street. Put out the word for the
                  kind of help you want, then wait to see who answers.
                </p>
                <div className="posting__form">
                  <select
                    className="frow__focus-select"
                    value={postingChoice}
                    onChange={(e) => setPostingChoice(e.target.value as CoachPosting)}
                  >
                    <option value="any">Any qualified coach</option>
                    {SPECIALTY_ORDER.map((s) => (
                      <option key={s} value={s}>
                        {specialtyName(s)}
                      </option>
                    ))}
                  </select>
                  <button className="coach__hire" onClick={() => postCoachJob(postingChoice)}>
                    Put out the word
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="posting__searching">
                  Searching for:{' '}
                  <strong>
                    {save.coachPosting === 'any'
                      ? 'any qualified coach'
                      : specialtyName(save.coachPosting)}
                  </strong>
                </p>
                {save.coachApplicants.length === 0 ? (
                  <p className="mygym__none">
                    No one’s answered yet. Word takes time to travel — advance the
                    calendar and keep an eye out.
                  </p>
                ) : (
                  <ul className="coaches">
                    {save.coachApplicants.map(({ coach: c }) => {
                      const salary = coachMonthlySalary(c, year);
                      const staffFull = save.coaches.length >= 4;
                      return (
                        <li className="coach" key={c.id}>
                          <CoachInfo coach={c} />
                          <div className="coach__decide">
                            <button
                              className="coach__hire"
                              disabled={staffFull}
                              onClick={() => hireApplicant(c.id)}
                              title={staffFull ? 'Your staff is full' : `${formatMoney(salary)}/mo`}
                            >
                              Hire · {formatMoney(salary)}/mo
                            </button>
                            <button className="coach__fire" onClick={() => passApplicant(c.id)}>
                              Pass
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </>
            )}
          </section>

          {/* Facilities */}
          <section className="mygym__section">
            <div className="mygym__facilities-head">
              <h3 className="mygym__section-title">Facilities &amp; Upgrades</h3>
              <span className="mygym__cash">Cash on hand · {formatMoney(save.money)}</span>
            </div>

            <ul className="upgrades">
              {UPGRADE_ORDER.map((key) => {
                const level = save.upgrades[key];
                const max = maxLevel(key);
                const cost = upgradeCost(key, level, year);
                const upkeep = upgradeNextUpkeep(key, year);
                const gain = effectGain(key, level);
                const maxed = cost === null;
                const afford = cost !== null && save.money >= cost;
                return (
                  <li className="upgrade" key={key}>
                    <div className="upgrade__main">
                      <div className="upgrade__head">
                        <span className="upgrade__name">{trackName(key)}</span>
                        <span className="upgrade__level">
                          {Array.from({ length: max }).map((_, i) => (
                            <span
                              key={i}
                              className={'upgrade__pip' + (i < level ? ' upgrade__pip--on' : '')}
                            />
                          ))}
                        </span>
                      </div>
                      <p className="upgrade__blurb">{trackBlurb(key)}</p>
                      <p className="upgrade__current">Now: {effectAtLevel(key, level)}</p>
                    </div>

                    <div className="upgrade__buy">
                      {maxed ? (
                        <span className="upgrade__maxed">Top of the line</span>
                      ) : (
                        <>
                          <span className="upgrade__gain">{gain}</span>
                          <span className="upgrade__upkeep">+{formatMoney(upkeep)}/mo upkeep</span>
                          <button
                            className="upgrade__btn"
                            disabled={!afford}
                            onClick={() => purchaseUpgrade(key)}
                            title={afford ? undefined : 'Not enough cash'}
                          >
                            {formatMoney(cost!)}
                          </button>
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

function CoachInfo({ coach, used }: { coach: Coach; used?: number }) {
  return (
    <div className="coach__main">
      <span className="coach__name">{coach.name}</span>
      <span className="coach__line">
        {tierName(coach.tier)} · {specialtyName(coach.specialty)} ·{' '}
        {used === undefined
          ? `${coach.slots} ${coach.slots === 1 ? 'slot' : 'slots'}`
          : `${used}/${coach.slots} in use`}
      </span>
      <span className="coach__sub">
        {personalityName(coach.personality)} — {specialtyBlurb(coach.specialty)}
      </span>
    </div>
  );
}
