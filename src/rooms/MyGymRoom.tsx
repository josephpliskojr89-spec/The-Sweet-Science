/*
  STAFF — coaching, hiring, and the facilities, as a management surface.
  --------------------------------------------------------------------------
  Three tabs:

    STAFF      — the people on payroll: you, your coaches (slots in use,
                 salary, release), and who's getting personal attention
    HIRING     — the posting (what kind of help) and the replies
    FACILITIES — the upgrade tracks: current standard, next quote, upkeep
*/

import { useState } from 'react';
import { useGame } from '../state/GameContext';
import { Surface } from '../components/Surface';
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
import './MyGymRoom.css';

type StaffTab = 'staff' | 'hiring' | 'facilities';

const TABS = [
  { key: 'staff', label: 'STAFF' },
  { key: 'hiring', label: 'HIRING' },
  { key: 'facilities', label: 'FACILITIES' },
];

export function MyGymRoom({ initialTab }: { initialTab?: StaffTab }) {
  const { save, closeRoom } = useGame();
  // smart default: replies waiting on you open straight to HIRING
  const [tab, setTab] = useState<StaffTab>(() => {
    if (initialTab) return initialTab;
    return (save?.coachApplicants.length ?? 0) > 0 ? 'hiring' : 'staff';
  });
  if (!save) return null;

  return (
    <Surface
      title="STAFF"
      tabs={TABS}
      activeTab={tab}
      onTab={(k) => setTab(k as StaffTab)}
      onClose={closeRoom}
    >
      {tab === 'staff' && <StaffTabView />}
      {tab === 'hiring' && <HiringTab />}
      {tab === 'facilities' && <FacilitiesTab />}
    </Surface>
  );
}

/* ------------------------------------------------------------------ */
/* STAFF                                                               */
/* ------------------------------------------------------------------ */

function StaffTabView() {
  const { save, focusCapacity, openRoom, openProfile, fireCoach } = useGame();
  const [releasing, setReleasing] = useState<string | null>(null);
  if (!save) return null;

  const philosophy = gymPhilosophyLabel(getCity(save.cityId).archetype);
  const focused = save.roster.filter((e) => e.focus !== null);
  const managerUsed = save.roster.filter((e) => e.focus !== null && e.coachId === null).length;
  const coachUsed = (id: string) =>
    save.roster.filter((e) => e.focus !== null && e.coachId === id).length;
  const year = formatDate(save.dayCount).year;
  const cornerSlots = 2 + save.coaches.reduce((n, c) => n + c.slots, 0);

  return (
    <>
      <p className="surface__note">
        {save.gymName.toUpperCase()} — brought up {philosophy}-style. Staff: you + {save.coaches.length} ·{' '}
        {cornerSlots} corner slots.
      </p>

      <section aria-label="Payroll">
        <h3 className="surface__section">ON THE PAYROLL</h3>
        <ul className="rows">
          <li className="staffline">
            <span className="staffline__who">
              <span className="row__main">{(save.manager.name || 'YOU').toUpperCase()}</span>
              <span className="row__detail">HEAD TRAINER · SLOTS {managerUsed} OF 2 · NO PAY — YOURS</span>
            </span>
          </li>
          {save.coaches.map((c) => (
            <li className="staffline" key={c.id}>
              <span className="staffline__who">
                <span className="row__main">{c.name.toUpperCase()}</span>
                <span className="row__detail">
                  {tierName(c.tier).toUpperCase()} · {specialtyName(c.specialty).toUpperCase()} · SLOTS{' '}
                  {coachUsed(c.id)} OF {c.slots} · {formatMoney(coachMonthlySalary(c, year))}/MO
                </span>
                <span className="row__note">
                  {personalityName(c.personality).toUpperCase()} — {specialtyBlurb(c.specialty)}
                </span>
              </span>
              {releasing === c.id ? (
                <span className="staffline__verdict">
                  <span className="ledger__label">SURE?</span>
                  <button
                    className="unit__action unit__action--danger staffline__act"
                    onClick={() => {
                      fireCoach(c.id);
                      setReleasing(null);
                    }}
                  >
                    RELEASE HIM
                  </button>
                  <button className="unit__action staffline__act" onClick={() => setReleasing(null)}>
                    KEEP HIM
                  </button>
                </span>
              ) : (
                <button
                  className="unit__action unit__action--danger staffline__act"
                  onClick={() => setReleasing(c.id)}
                >
                  RELEASE
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section aria-label="Personal attention">
        <h3 className="surface__section">
          PERSONAL ATTENTION — {focused.length} OF {focusCapacity} SLOTS IN HAND
        </h3>
        {focused.length === 0 ? (
          <p className="surface__note">
            Nobody down for extra work.{' '}
            <button className="facts__act mg-inline" onClick={() => openRoom('locker')}>
              Assign it on the roster →
            </button>
          </p>
        ) : (
          <ul className="rows">
            {focused.map((e) => (
              <li key={e.fighter.id}>
                <button className="row" onClick={() => openProfile(e.fighter.id)}>
                  <span className="row__main">{fighterFullName(e.fighter).toUpperCase()}</span>
                  <span className="row__detail">{focusLabel(e.focus!).toUpperCase()}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* HIRING                                                              */
/* ------------------------------------------------------------------ */

function HiringTab() {
  const { save, postCoachJob, cancelCoachJob, hireApplicant, passApplicant } = useGame();
  const [postingChoice, setPostingChoice] = useState<CoachPosting>('any');
  if (!save) return null;

  const year = formatDate(save.dayCount).year;
  const staffFull = save.coaches.length >= 4;

  return (
    <>
      <section aria-label="The posting">
        <h3 className="surface__section">THE POSTING</h3>
        {!save.coachPosting ? (
          <>
            <p className="surface__note">What kind of help do you want word out for?</p>
            <div className="mg-posting" role="radiogroup" aria-label="What kind of help">
              {(
                [['any', 'ANY QUALIFIED MAN'] as [CoachPosting, string]].concat(
                  SPECIALTY_ORDER.map(
                    (s) => [s, specialtyName(s).toUpperCase()] as [CoachPosting, string],
                  ),
                )
              ).map(([key, label]) => (
                <button
                  key={key}
                  role="radio"
                  aria-checked={postingChoice === key}
                  className={'cplan__chip' + (postingChoice === key ? ' cplan__chip--on' : '')}
                  onClick={() => setPostingChoice(key)}
                >
                  {label}
                </button>
              ))}
            </div>
            <button className="unit__action" onClick={() => postCoachJob(postingChoice)}>
              PUT THE WORD OUT
            </button>
          </>
        ) : (
          <>
            <p className="surface__note">
              POSTED:{' '}
              <b className="rivals__mark">
                {save.coachPosting === 'any'
                  ? 'ANY QUALIFIED MAN'
                  : specialtyName(save.coachPosting).toUpperCase()}
              </b>{' '}
              — word is out.
              {save.coachApplicants.length === 0 && ' No takers yet — give it a week.'}
            </p>
            <button className="unit__action unit__action--danger" onClick={cancelCoachJob}>
              TAKE IT DOWN
            </button>
          </>
        )}
      </section>

      <section aria-label="Replies">
        <h3 className="surface__section">
          REPLIES{save.coachApplicants.length > 0 ? ` — ${save.coachApplicants.length}` : ''}
        </h3>
        {save.coachApplicants.length === 0 ? (
          <p className="surface__note">Nobody has answered.</p>
        ) : (
          <ul className="rows">
            {save.coachApplicants.map(({ coach: c }) => {
              const salary = coachMonthlySalary(c, year);
              const affordNote = save.money < salary ? ' — MORE THAN THE BANK HOLDS' : '';
              return (
                <li className="offer" key={c.id}>
                  <div className="offer__terms">
                    <span className="row__main">{c.name.toUpperCase()}</span>
                    <span className="row__detail">
                      {tierName(c.tier).toUpperCase()} · {specialtyName(c.specialty).toUpperCase()} ·{' '}
                      {c.slots} {c.slots === 1 ? 'SLOT' : 'SLOTS'} · ASKS{' '}
                      {formatMoney(Math.round(salary))}/MO{affordNote}
                    </span>
                    <span className="row__note">{personalityName(c.personality).toUpperCase()}</span>
                  </div>
                  <div className="offer__answer">
                    <button
                      className="unit__action offer__btn"
                      disabled={staffFull}
                      title={staffFull ? 'Staff is full' : undefined}
                      onClick={() => hireApplicant(c.id)}
                    >
                      HIRE
                    </button>
                    <button
                      className="unit__action unit__action--danger offer__btn"
                      onClick={() => passApplicant(c.id)}
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
    </>
  );
}

/* ------------------------------------------------------------------ */
/* FACILITIES                                                          */
/* ------------------------------------------------------------------ */

function FacilitiesTab() {
  const { save, purchaseUpgrade } = useGame();
  if (!save) return null;
  const year = formatDate(save.dayCount).year;

  return (
    <section aria-label="Facilities and upgrades">
      <div className="ledger__line">
        <span className="ledger__label">BANK</span>
        <span className={'ledger__figure' + (save.money < 0 ? ' ledger__figure--red' : '')}>
          {formatMoney(save.money)}
        </span>
      </div>
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
          <div className="track" key={key}>
            <div className="track__head">
              <span className="row__main">{trackName(key).toUpperCase()}</span>
              <span className="track__level">
                LEVEL {level} OF {max}
              </span>
            </div>
            <p className="surface__note">{trackBlurb(key)}</p>
            <p className="track__now">NOW: {effectAtLevel(key, level).toUpperCase()}</p>
            {maxed ? (
              <span className="tag tag--good">TOP OF THE LINE</span>
            ) : (
              <div className="track__quote">
                {gain && <span className="track__gain">{gain.toUpperCase()}</span>}
                <span className="row__detail">+{formatMoney(upkeep)}/MO UPKEEP</span>
                <button
                  className="unit__action track__buy"
                  disabled={!afford}
                  title={!afford ? `Short ${formatMoney(short)}` : undefined}
                  onClick={() => purchaseUpgrade(key)}
                >
                  APPROVE — {formatMoney(cost!)}
                </button>
                {!afford && <span className="tag tag--bad">SHORT {formatMoney(short)}</span>}
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}
