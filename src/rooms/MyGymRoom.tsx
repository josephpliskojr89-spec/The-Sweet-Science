/*
  MyGymRoom — the other wall of the office
  --------------------------------------------------------------------------
  Not a fourth room (the CD's three-room law holds): turn left from the desk
  and you face the wall where the owner runs the business as a business.
  The hand-painted sign carries the gym's name and house philosophy; below
  it, the week's PERSONAL ATTENTION clipboard (a copy off the locker room's
  hook board, A14), the STAFF BOARD of employment cards, the HELP WANTED
  flyer with its reply letters in a wire basket, and the contractor's
  estimate. Money decisions carry BANK BAL. lines (A9); shortfalls are
  typed, not penciled (A10). The office-door sliver is the way back.
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
import { Stamp } from '../kit/Stamp';
import { PencilCheck } from '../kit/PencilCheck';
import { BankBalLine } from '../kit/BankBalLine';
import { paperTilt } from '../kit/seed';
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
  const staffFull = save.coaches.length >= 4;
  const cornerSlots = 2 + save.coaches.reduce((n, c) => n + c.slots, 0);

  return (
    <div className="gymwall" role="dialog" aria-label="My Gym — coaching and staff">
      <div className="gymwall__plaster layer" aria-hidden="true" />

      {/* the way back: office-door sliver, name reversed */}
      <button className="gymwall__door" onClick={closeRoom} aria-label="Back to the gym floor (Esc)">
        <span className="gymwall__door-glass" aria-hidden="true">
          <span className="gymwall__door-name">{save.gymName.toUpperCase()}</span>
        </span>
      </button>

      {/* the hand-painted sign */}
      <div className="paintsign" aria-hidden="true">
        <span className="paintsign__screw paintsign__screw--l" />
        <span className="paintsign__screw paintsign__screw--r" />
        <span className="paintsign__name">{save.gymName.toUpperCase()}</span>
        <span className="paintsign__line">BROUGHT UP {philosophy.toUpperCase()}-STYLE</span>
      </div>

      <div className="gymwall__grid">
        {/* PERSONAL ATTENTION clipboard */}
        <section
          className="attn on-paper"
          aria-label={`Personal attention: ${focused.length} of ${focusCapacity} slots in hand`}
        >
          <span className="attn__clip" aria-hidden="true" />
          <header className="attn__head">
            <span className="attn__title">PERSONAL ATTENTION — THIS WEEK</span>
            <span className="attn__formno">FORM T-4 REV. 6/74</span>
          </header>
          <p className="attn__inhand">
            IN HAND: {focused.length} OF {focusCapacity}
          </p>
          <ul className="attn__lines">
            {Array.from({ length: focusCapacity }, (_, i) => {
              const e = focused[i];
              if (!e)
                return <li className="attn__line attn__line--blank" key={`b${i}`} aria-hidden="true" />;
              return (
                <li key={e.fighter.id}>
                  <button className="attn__row" onClick={() => openProfile(e.fighter.id)}>
                    <span className="attn__photo">
                      <Portrait appearance={e.fighter.appearance} size={34} />
                    </span>
                    <span className="attn__name">{fighterFullName(e.fighter).toUpperCase()}</span>
                    <span className="attn__area">{focusLabel(e.focus!).toUpperCase()}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          {focused.length === 0 ? (
            <button className="attn__pencil" onClick={() => openRoom('locker')}>
              nobody down for extra work — pick 'em in the locker room →
            </button>
          ) : (
            <p className="attn__pencil attn__pencil--static">copied off the hook board</p>
          )}
        </section>

        {/* THE STAFF BOARD */}
        <section
          className="staffboard"
          aria-label={`Staff: you plus ${save.coaches.length} coaches, ${cornerSlots} corner slots`}
        >
          <span className="staffboard__tally" aria-hidden="true">
            STAFF: YOU + {save.coaches.length} · CORNER SLOTS: {cornerSlots}
          </span>
          <div className="staffboard__cork">
            {/* your own card — the oldest on the board */}
            <div className="empcard empcard--you" style={paperTilt('you-card', 1.5, 2)}>
              <span className="empcard__pin" aria-hidden="true" />
              <span className="empcard__formno">FORM E-2</span>
              <span className="empcard__name">{(save.manager.name || 'YOU').toUpperCase()}</span>
              <span className="empcard__line">HEAD TRAINER</span>
              <span className="empcard__line">SLOTS: {managerUsed} OF 2</span>
              <span className="empcard__pencil">no pay — mine</span>
            </div>

            {save.coaches.map((c) => (
              <div className="empcard" key={c.id} style={paperTilt(c.id, 2, 2)}>
                <span className="empcard__pin" aria-hidden="true" />
                <span className="empcard__formno">FORM E-2</span>
                <span className="empcard__name">{c.name.toUpperCase()}</span>
                <span className="empcard__line">
                  {tierName(c.tier).toUpperCase()} · {specialtyName(c.specialty).toUpperCase()}
                </span>
                <span className="empcard__line">
                  SLOTS: {coachUsed(c.id)} OF {c.slots}
                </span>
                <span className="empcard__pencil">
                  {personalityName(c.personality).toLowerCase()} — {specialtyBlurb(c.specialty).toLowerCase()}
                </span>
                <button
                  className="empcard__release"
                  onClick={() => fireCoach(c.id)}
                  aria-label={`Release ${c.name}`}
                >
                  RELEASE
                </button>
              </div>
            ))}

            {/* bare positions: tack holes and sun-faded ghosts */}
            {Array.from({ length: Math.max(0, 4 - save.coaches.length) }, (_, i) => (
              <div className="staffboard__bare" key={`bare${i}`} aria-hidden="true">
                <span className="staffboard__ghost" />
              </div>
            ))}
          </div>
        </section>

        {/* HELP WANTED */}
        <section className="wanted" aria-label="Hiring">
          {!save.coachPosting ? (
            <div className="wanted__flyer on-paper" style={paperTilt('flyer', 1.5, 2)}>
              <span className="wanted__headline">WANTED — CORNER HELP</span>
              <div className="wanted__list" role="radiogroup" aria-label="What kind of help">
                {(
                  [['any', 'ANY QUALIFIED MAN'] as [CoachPosting, string]].concat(
                    SPECIALTY_ORDER.map((s) => [s, specialtyName(s).toUpperCase()] as [CoachPosting, string]),
                  )
                ).map(([key, label]) => (
                  <button
                    key={key}
                    role="radio"
                    aria-checked={postingChoice === key}
                    className="wanted__line"
                    onClick={() => setPostingChoice(key)}
                  >
                    <span className="orders__box" aria-hidden="true">
                      {postingChoice === key && <PencilCheck seedId={'post' + key} />}
                    </span>
                    {label}
                  </button>
                ))}
              </div>
              <button className="wanted__tack" onClick={() => postCoachJob(postingChoice)}>
                <span className="wanted__tackpin" aria-hidden="true" />
                PIN IT UP
              </button>
            </div>
          ) : (
            <div className="wanted__flyer wanted__flyer--posted on-paper" style={paperTilt('flyer-up', 2, 2)}>
              <span className="wanted__pin" aria-hidden="true" />
              <span className="wanted__headline">WANTED — CORNER HELP</span>
              <p className="wanted__posted-line">
                {save.coachPosting === 'any'
                  ? 'ANY QUALIFIED MAN'
                  : specialtyName(save.coachPosting).toUpperCase()}
              </p>
              <p className="wanted__posted-note">POSTED — WORD IS OUT</p>
              {save.coachApplicants.length === 0 && (
                <p className="wanted__pencil">no takers yet — give it a week</p>
              )}
              <button className="wanted__takedown" onClick={cancelCoachJob}>
                TAKE DOWN
              </button>
            </div>
          )}

          {/* the reply basket */}
          <div
            className="basket"
            aria-label={
              save.coachApplicants.length === 0
                ? 'No applicants yet'
                : `${save.coachApplicants.length} reply letters`
            }
          >
            <span className="basket__wire" aria-hidden="true" />
            {save.coachApplicants.map(({ coach: c }) => {
              const salary = coachMonthlySalary(c, year);
              return (
                <div className="letter on-paper" key={c.id} style={paperTilt(c.id + 'ltr', 2, 3)}>
                  <span className="letter__name">{c.name.toUpperCase()}</span>
                  <span className="letter__line">
                    {tierName(c.tier).toUpperCase()} · {specialtyName(c.specialty).toUpperCase()} ·{' '}
                    {c.slots} {c.slots === 1 ? 'SLOT' : 'SLOTS'}
                  </span>
                  <span className="letter__pencil">{personalityName(c.personality).toLowerCase()}</span>
                  <span className="letter__asks">
                    ASKS ${Math.round(salary).toLocaleString('en-US')}/MO
                  </span>
                  <span className="letter__bal">
                    <BankBalLine money={save.money} dayCount={save.dayCount} seedId={c.id} />
                  </span>
                  <span className="letter__acts">
                    <button
                      className="letter__stamp"
                      disabled={staffFull}
                      onClick={() => hireApplicant(c.id)}
                    >
                      HIRED
                      {staffFull && <span className="letter__reason">STAFF IS FULL</span>}
                    </button>
                    <button className="letter__stamp letter__stamp--pass" onClick={() => passApplicant(c.id)}>
                      PASSED ON
                    </button>
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* THE CONTRACTOR'S ESTIMATE */}
        <section className="estimate on-paper" aria-label="Facilities and upgrades">
          <span className="estimate__clip" aria-hidden="true" />
          <header className="estimate__head">
            <span className="estimate__title">ESTIMATE — GYM IMPROVEMENTS</span>
            <span className="estimate__bal">
              <BankBalLine money={save.money} dayCount={save.dayCount} seedId="estimate" />
            </span>
          </header>
          {UPGRADE_ORDER.map((key) => {
            const level = save.upgrades[key];
            const max = maxLevel(key);
            const cost = upgradeCost(key, level, year);
            const upkeep = upgradeNextUpkeep(key, year);
            const gain = effectGain(key, level);
            const maxed = cost === null;
            const afford = cost !== null && save.money >= cost;
            const short = cost !== null ? cost - save.money : 0;
            return (
              <div className="esttrack" key={key}>
                <div className="esttrack__head">
                  <span className="esttrack__name">{trackName(key).toUpperCase()}</span>
                  <span className="esttrack__paid" aria-label={`level ${level} of ${max}`}>
                    {Array.from({ length: level }, (_, i) => (
                      <Stamp key={i} word="PAID" category="money" seedId={key + i} size="sm" />
                    ))}
                  </span>
                </div>
                <p className="esttrack__blurb">{trackBlurb(key).toLowerCase()}</p>
                <p className="esttrack__now">NOW: {effectAtLevel(key, level).toUpperCase()}</p>
                {maxed ? (
                  <p className="esttrack__maxed">TOP OF THE LINE — NO FURTHER WORK QUOTED</p>
                ) : (
                  <div className="esttrack__quote">
                    {gain && <span className="esttrack__gain">{gain.toUpperCase()}</span>}
                    <span className="esttrack__upkeep">+{formatMoney(upkeep)}/MO UPKEEP</span>
                    <button
                      className="esttrack__approve"
                      disabled={!afford}
                      onClick={() => purchaseUpgrade(key)}
                      aria-label={
                        afford
                          ? `Approve: ${formatMoney(cost!)}`
                          : `Cannot afford: short ${formatMoney(short)}`
                      }
                    >
                      APPROVED — {formatMoney(cost!)}
                      {!afford && <span className="esttrack__short">SHORT {formatMoney(short)}</span>}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </section>
      </div>

      {/* the bare bulb over the staff board */}
      <div className="rig gymwall__rig" aria-hidden="true" />
      <div className="gymwall__dark layer" aria-hidden="true" />
    </div>
  );
}
