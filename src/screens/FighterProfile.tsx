/*
  FIGHTER — the file, as the flagship management surface.
  --------------------------------------------------------------------------
  Left column: the man — photograph, vitals, status. Right column: the
  active section — ASSESSMENT (attributes, observations, standing, the
  training assignment, the locker, the cut), RECORD, BIOGRAPHY, CAREER,
  PROGRESS (locker only).

  Fog unchanged: a lockered man's attributes are exact with recent-form
  words; a trialist gets your coach's-eye bands only. Growth feel appears
  once discovered. His locker request, when he makes it, sits at the top
  in signal red until you answer it.
*/

import { useEffect, useState } from 'react';
import { useGame, lockersUsed, noLockerUsed } from '../state/GameContext';
import { Surface } from '../components/Surface';
import { TIER_META, TIER_ORDER, type HierarchyTier } from '../game/roster';
import { fighterAge } from '../game/fighters';
import { WEIGHT_CLASSES, formatHeight } from '../game/weightClasses';
import { getCity } from '../game/cities';
import { TRAITS } from '../game/traits';
import {
  developmentState,
  devFeel,
  attributeTrend,
  attributeSeries,
  ATTR_KEYS,
  ATTR_LABELS,
  FOCUS_SLOTS_BASE,
  type AttrKey,
  type TrainingFocus,
} from '../game/training';
import { moodLabel } from '../game/relationship';
import { coachChemistry, chemistryRead, specialtyName } from '../game/coaches';
import { scoutingBand, patienceFlavor } from '../game/scouting';
import { flightRiskRead } from '../game/reputation';
import { formatDate } from '../game/time';
import { fighterBiography, careerTimeline, yearsWithGymLabel } from '../game/biography';
import type { RosterEntry } from '../game/roster';
import type { GameSave } from '../state/persistence';
import { Portrait } from '../assets/portraits';
import './FighterProfile.css';

const signed = (n: number) => `${n >= 0 ? '+' : '−'}${Math.abs(n).toFixed(1)}`;

type ProfileTab = 'overview' | 'record' | 'biography' | 'career' | 'development';

export function FighterProfile() {
  const { save, profileId, closeProfile } = useGame();
  const [tab, setTab] = useState<ProfileTab>('overview');

  useEffect(() => {
    setTab('overview');
  }, [profileId]);

  if (!save || !profileId) return null;
  const entry = save.roster.find((e) => e.fighter.id === profileId);
  if (!entry) return null;

  const f = entry.fighter;
  const shownTab: ProfileTab = tab === 'development' && !entry.hasLocker ? 'overview' : tab;
  const tabs = [
    { key: 'overview', label: 'ASSESSMENT' },
    { key: 'record', label: 'RECORD' },
    { key: 'biography', label: 'BIOGRAPHY' },
    { key: 'career', label: 'CAREER' },
    ...(entry.hasLocker ? [{ key: 'development', label: 'PROGRESS' }] : []),
  ];

  return (
    <div className="fprofile">
      <Surface
        title={`${f.lastName.toUpperCase()}, ${f.firstName.charAt(0).toUpperCase()}.`}
        tabs={tabs}
        activeTab={shownTab}
        onTab={(k) => setTab(k as ProfileTab)}
        onClose={closeProfile}
      >
        {!entry.hasLocker && entry.lockerRequested && <LockerRequest entry={entry} />}
        <div className="fp">
          <IdentityCard entry={entry} save={save} />
          <div className="fp__sheet">
            {shownTab === 'overview' && <AssessmentTab entry={entry} save={save} />}
            {shownTab === 'record' && <RecordTab entry={entry} save={save} />}
            {shownTab === 'biography' && <BiographyTab entry={entry} save={save} />}
            {shownTab === 'career' && <CareerTab entry={entry} save={save} />}
            {shownTab === 'development' && <ProgressTab entry={entry} save={save} />}
          </div>
        </div>
      </Surface>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* THE LOCKER REQUEST — answered, not dismissed                        */
/* ------------------------------------------------------------------ */

function LockerRequest({ entry }: { entry: RosterEntry }) {
  const { save, respondLockerRequest, lockerCap } = useGame();
  if (!save) return null;
  const lockersFull = lockersUsed(save) >= lockerCap;
  const f = entry.fighter;
  return (
    <div className="fp-request" role="group" aria-label="He's asking about a locker">
      <p className="fp-request__quote">
        “Coach, I’ve been here every night for months. Do you see a future for me here, or am I
        wasting my time?”
      </p>
      <div className="fp-request__answers">
        <button
          className="unit__action fp-request__btn"
          disabled={lockersFull}
          title={lockersFull ? 'Every locker is full' : undefined}
          onClick={() => respondLockerRequest(f.id, 'grant')}
        >
          GIVE HIM A LOCKER
        </button>
        <button className="unit__action fp-request__btn" onClick={() => respondLockerRequest(f.id, 'wait')}>
          ASK HIM TO WAIT
        </button>
        <button
          className="unit__action unit__action--danger fp-request__btn"
          onClick={() => respondLockerRequest(f.id, 'honest')}
        >
          BE HONEST — NO ROOM
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* THE IDENTITY CARD                                                   */
/* ------------------------------------------------------------------ */

function IdentityCard({ entry, save }: { entry: RosterEntry; save: GameSave }) {
  const f = entry.fighter;
  const cls = WEIGHT_CLASSES[f.weightClass];
  const home = getCity(f.homeCityId);
  const mood = moodLabel(entry);
  const days = save.dayCount - entry.joinedDayCount;
  const flight = entry.hasLocker ? flightRiskRead(entry.poachInterest) : null;

  return (
    <aside className="fp__id">
      <div className="fp__photo">
        <Portrait appearance={f.appearance} size={150} />
      </div>
      <h3 className="fp__name">
        {f.lastName.toUpperCase()}, {f.firstName.toUpperCase()}
      </h3>
      {f.nickname && <p className="fp__nick">“{f.nickname}”</p>}

      <dl className="fp__vitals">
        <div>
          <dt>AGE</dt>
          <dd>{fighterAge(f)}</dd>
        </div>
        <div>
          <dt>HEIGHT</dt>
          <dd>{formatHeight(f.heightInches)}</dd>
        </div>
        <div>
          <dt>WEIGHT</dt>
          <dd>{f.weightLbs} LBS</dd>
        </div>
        <div>
          <dt>CLASS</dt>
          <dd>{cls.name.toUpperCase()}</dd>
        </div>
        <div>
          <dt>HOME</dt>
          <dd>{home.name.toUpperCase()}</dd>
        </div>
        <div>
          <dt>IN GYM</dt>
          <dd>{days <= 0 ? 'JOINED TODAY' : `${days} ${days === 1 ? 'DAY' : 'DAYS'}`}</dd>
        </div>
      </dl>

      <div className="fp__status">
        {entry.hasLocker ? (
          <span className="tag tag--plate">LOCKER</span>
        ) : (
          <span className="tag tag--bad">TRIAL — NO LOCKER</span>
        )}
        <span className={'tag' + (mood.tone === 'warn' || mood.tone === 'crit' ? ' tag--bad' : '')}>
          {mood.label.toUpperCase()}
        </span>
      </div>
      {!entry.hasLocker && <p className="fp__patience">{patienceFlavor(entry.trialPatience)}</p>}

      {flight && (
        <div className="fp__flight">
          <span className="tag tag--bad">FLIGHT RISK — {flight.label.toUpperCase()}</span>
          <p className="fp__flightnote">Other gyms have noticed he’s unhappy. Mend it or lose him.</p>
        </div>
      )}
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/* ASSESSMENT                                                          */
/* ------------------------------------------------------------------ */

function AssessmentTab({ entry, save }: { entry: RosterEntry; save: GameSave }) {
  const { setLocker, setTier, setFocus, setTrainer, cutFighter, stopConsidering, lockerCap, noLockerCap } =
    useGame();
  const [confirmingCut, setConfirmingCut] = useState(false);
  const f = entry.fighter;
  const days = save.dayCount - entry.joinedDayCount;
  const dev = developmentState(entry);
  const feel = entry.hasLocker && f.growthKnown ? devFeel(f.growth) : null;
  const lockersFull = lockersUsed(save) >= lockerCap;
  const noLockerFull = noLockerUsed(save) >= noLockerCap;
  const slotsFull =
    save.roster.filter((e) => e.focus !== null).length >=
    FOCUS_SLOTS_BASE + save.coaches.reduce((n, c) => n + c.slots, 0);
  const focusLocked = slotsFull && entry.focus === null;

  return (
    <>
      <section aria-label="Attributes">
        <h4 className="surface__section">
          {entry.hasLocker ? 'ATTRIBUTES' : 'TRIAL ASSESSMENT — COACH’S EYE ONLY'}
          <span className="fp__reads">
            <span className={'tag' + (dev.tone === 'good' ? ' tag--good' : dev.tone === 'crit' ? ' tag--bad' : '')}>
              {dev.label.toUpperCase()}
            </span>
            {feel && (
              <span className="tag tag--good" title={feel.blurb}>
                {feel.label.toUpperCase()}
              </span>
            )}
          </span>
        </h4>
        <div className="attrs">
          {ATTR_KEYS.map((k: AttrKey) => {
            const val = f.attributes[k];
            if (entry.hasLocker) {
              const tr = attributeTrend(entry, k, save.dayCount);
              const word =
                tr.totalChange >= 0.05 ? 'COMING ON' : tr.totalChange <= -0.05 ? 'SLIPPING' : '';
              return (
                <div
                  className="attr"
                  key={k}
                  title={`${signed(tr.windowChange)} recent · ${signed(tr.totalChange)} since he arrived`}
                >
                  <span className="attr__label">{ATTR_LABELS[k].toUpperCase()}</span>
                  <span className="attr__gauge">
                    <span className="attr__fill" style={{ width: `${Math.max(2, Math.min(100, val))}%` }} />
                  </span>
                  <span className="attr__num">{Math.round(val)}</span>
                  <span className={'attr__word' + (tr.totalChange <= -0.05 ? ' attr__word--bad' : '')}>
                    {word}
                  </span>
                </div>
              );
            }
            const band = scoutingBand(val, days);
            return (
              <div className="attr" key={k}>
                <span className="attr__label">{ATTR_LABELS[k].toUpperCase()}</span>
                <span className="attr__gauge attr__gauge--unknown" />
                <span className="attr__num attr__num--band">
                  {band.label ? band.label.toUpperCase() : '?'}
                </span>
                <span className="attr__word" />
              </div>
            );
          })}
        </div>
        <p className="fp__ceiling">“{f.ceilingRead}”</p>
        {!entry.hasLocker && (
          <p className="surface__note">Not a measurement. Assign a locker for the full assessment.</p>
        )}
      </section>

      <section aria-label="Observations">
        <h4 className="surface__section">OBSERVATIONS</h4>
        {f.visibleTraits.length === 0 ? (
          <p className="surface__note">Nothing obvious yet — time will tell.</p>
        ) : (
          <ul className="facts">
            {f.visibleTraits.map((t) => (
              <li className="facts__line" key={t}>
                <span className="facts__what">{TRAITS[t].name.toUpperCase()}</span>
                <span className="facts__when">{TRAITS[t].blurb}</span>
              </li>
            ))}
          </ul>
        )}
        {f.hiddenTraits.length > 0 && (
          <p className="surface__note">There’s more to this man than he’s shown.</p>
        )}
      </section>

      <section aria-label="Standing and training">
        <h4 className="surface__section">STANDING &amp; TRAINING</h4>
        <div className="fp__controls">
          <label className="fp__control">
            <span className="ledger__label">STANDING</span>
            <span className="fp__chips" role="radiogroup" aria-label="Hierarchy">
              {TIER_ORDER.map((t) => (
                <button
                  key={t}
                  role="radio"
                  aria-checked={entry.tier === t}
                  title={TIER_META[t].blurb}
                  className={'cplan__chip' + (entry.tier === t ? ' cplan__chip--on' : '')}
                  onClick={() => setTier(f.id, t as HierarchyTier)}
                >
                  {TIER_META[t].name.toUpperCase()}
                </button>
              ))}
            </span>
          </label>

          {entry.hasLocker ? (
            <>
              <label className="fp__control">
                <span className="ledger__label">ORDERS</span>
                <select
                  className="mselect"
                  value={entry.focus ?? ''}
                  disabled={focusLocked}
                  title={focusLocked ? 'Every focus slot is in use' : undefined}
                  onChange={(e) => setFocus(f.id, (e.target.value || null) as TrainingFocus | null)}
                >
                  <option value="">General training</option>
                  <option value="rounded">Focus — well-rounded</option>
                  {ATTR_KEYS.map((k) => (
                    <option key={k} value={k}>
                      Focus — {ATTR_LABELS[k]}
                    </option>
                  ))}
                </select>
                {focusLocked && <span className="tag tag--bad">EVERY SLOT IN USE</span>}
              </label>

              {entry.focus !== null && <TrainerPick entry={entry} save={save} onSetTrainer={(id) => setTrainer(f.id, id)} />}
            </>
          ) : (
            <span className="tag tag--bad">NO LOCKER — LIMITED TRAINING</span>
          )}
        </div>

        <div className="fp__actions">
          {entry.hasLocker ? (
            <button
              className="unit__action fp__act"
              disabled={noLockerFull}
              title={noLockerFull ? 'No room on the bench' : undefined}
              onClick={() => setLocker(f.id, false)}
            >
              PULL HIS LOCKER
            </button>
          ) : (
            <button
              className="unit__action fp__act"
              disabled={lockersFull}
              title={lockersFull ? 'Every locker is full' : undefined}
              onClick={() => setLocker(f.id, true)}
            >
              ASSIGN A LOCKER
            </button>
          )}

          {confirmingCut ? (
            <span className="fp__verdict">
              <span className="ledger__label">STRIKE FROM ROSTER?</span>
              <button
                className="unit__action unit__action--danger fp__act"
                onClick={() => (entry.hasLocker ? cutFighter(f.id) : stopConsidering(f.id))}
              >
                {entry.hasLocker ? 'RELEASE HIM' : 'PASS ON HIM'}
              </button>
              <button className="unit__action fp__act" onClick={() => setConfirmingCut(false)}>
                CANCEL
              </button>
            </span>
          ) : (
            <button
              className="unit__action unit__action--danger fp__act"
              onClick={() => setConfirmingCut(true)}
            >
              {entry.hasLocker ? 'CUT HIM' : 'PASS ON HIM'}
            </button>
          )}
        </div>
      </section>
    </>
  );
}

/** who runs his focus work — you or a coach with a free slot */
function TrainerPick({
  entry,
  save,
  onSetTrainer,
}: {
  entry: RosterEntry;
  save: GameSave;
  onSetTrainer: (id: string | null) => void;
}) {
  const f = entry.fighter;
  const usedMgr = save.roster.filter((e) => e.focus !== null && e.coachId === null).length;
  const mgrFree = Math.max(0, FOCUS_SLOTS_BASE - usedMgr + (entry.coachId === null ? 1 : 0));
  const assigned = entry.coachId ? save.coaches.find((c) => c.id === entry.coachId) : null;
  const chem = assigned
    ? chemistryRead(coachChemistry(assigned, [...f.visibleTraits, ...f.hiddenTraits], f.age))
    : null;

  return (
    <label className="fp__control">
      <span className="ledger__label">TRAINER</span>
      <select
        className="mselect"
        value={entry.coachId ?? ''}
        onChange={(e) => onSetTrainer(e.target.value || null)}
      >
        <option value="" disabled={mgrFree === 0 && entry.coachId !== null}>
          You — {mgrFree} free
        </option>
        {save.coaches.map((c) => {
          const used = save.roster.filter((x) => x.focus !== null && x.coachId === c.id).length;
          const free = Math.max(0, c.slots - used + (entry.coachId === c.id ? 1 : 0));
          return (
            <option key={c.id} value={c.id} disabled={free === 0 && entry.coachId !== c.id}>
              {c.name} ({specialtyName(c.specialty)}) — {free === 0 ? 'full' : `${free} free`}
            </option>
          );
        })}
      </select>
      {chem && assigned && (
        <span className={'tag' + (chem.tone === 'good' ? ' tag--good' : chem.tone === 'warn' ? ' tag--bad' : '')}>
          {chem.label.toUpperCase()}
        </span>
      )}
    </label>
  );
}

/* ------------------------------------------------------------------ */
/* RECORD                                                              */
/* ------------------------------------------------------------------ */

function RecordTab({ entry, save }: { entry: RosterEntry; save: GameSave }) {
  const r = entry.record;
  const koLosses = entry.bouts.filter(
    (b) => b.outcome === 'L' && (b.method === 'KO' || b.method === 'TKO'),
  ).length;
  let streak = 0;
  for (let i = entry.bouts.length - 1; i >= 0; i--) {
    const o = entry.bouts[i].outcome;
    if (o === 'D') break;
    if (streak === 0) streak = o === 'W' ? 1 : -1;
    else if ((streak > 0 && o === 'W') || (streak < 0 && o === 'L')) streak += Math.sign(streak);
    else break;
  }
  const cells: { label: string; value: string }[] = [
    { label: 'PROFESSIONAL', value: `${r.wins}–${r.losses}–${r.draws}` },
    { label: 'KO WINS', value: String(r.kos) },
    { label: 'KO LOSSES', value: String(koLosses) },
    {
      label: 'CURRENT STREAK',
      value: streak === 0 ? '—' : streak > 0 ? `W${streak}` : `L${-streak}`,
    },
    { label: 'TITLES HELD', value: 'NONE' },
    { label: 'RANKING', value: 'UNRANKED' },
    { label: 'WITH GYM', value: yearsWithGymLabel(entry, save.dayCount).toUpperCase() },
    {
      label: 'CAREER EARNINGS',
      value: `$${Math.round(entry.careerEarnings ?? 0).toLocaleString('en-US')}`,
    },
  ];
  return (
    <>
      <section aria-label="Record summary">
        <div className="fp__cells">
          {cells.map((c) => (
            <div className="fp__cell" key={c.label}>
              <span className="ledger__label">{c.label}</span>
              <span className="fp__cellvalue">{c.value}</span>
            </div>
          ))}
        </div>
      </section>
      <section aria-label="Bout ledger">
        <h4 className="surface__section">BOUTS</h4>
        {entry.bouts.length === 0 ? (
          <p className="surface__note">No professional bouts under your banner yet.</p>
        ) : (
          <table className="mtable">
            <thead>
              <tr>
                <th>DATE</th>
                <th>OPPONENT</th>
                <th>RESULT</th>
                <th>PURSE</th>
              </tr>
            </thead>
            <tbody>
              {[...entry.bouts].reverse().map((b, i) => {
                const d = formatDate(b.dayCount);
                const won = b.outcome === 'W';
                const how =
                  b.method === 'KO' || b.method === 'TKO'
                    ? `${b.outcome} ${b.method} ${b.endRound}`
                    : b.method === 'DRAW'
                      ? 'DRAW'
                      : `${b.outcome} ${b.method}`;
                return (
                  <tr key={i}>
                    <td className="mtable__dim">
                      {d.month.slice(0, 3).toUpperCase()} {d.day} ’{String(d.year).slice(2)}
                    </td>
                    <td>{b.opponentName.toUpperCase()}</td>
                    <td className={won ? 'mtable__gold' : b.outcome === 'L' ? 'mtable__red' : ''}>
                      {how}
                    </td>
                    <td className="mtable__dim">${Math.round(b.purse).toLocaleString('en-US')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* BIOGRAPHY / CAREER / PROGRESS                                       */
/* ------------------------------------------------------------------ */

function BiographyTab({ entry, save }: { entry: RosterEntry; save: GameSave }) {
  const paras = fighterBiography(entry, save.dayCount);
  return (
    <section aria-label="Biography" className="fp__bio">
      {paras.map((p, i) => {
        const quote = p.startsWith('In his own words');
        const impression = p.startsWith('Your first read');
        return (
          <p className={'fp__para' + (quote ? ' fp__para--quote' : '') + (impression ? ' fp__para--read' : '')} key={i}>
            {p}
          </p>
        );
      })}
    </section>
  );
}

function CareerTab({ entry, save }: { entry: RosterEntry; save: GameSave }) {
  const moments = careerTimeline(entry, save.dayCount);
  const years = [...new Set(moments.map((m) => m.year))].sort((a, b) => a - b);
  return (
    <section aria-label="Career">
      {years.map((y) => (
        <div key={y}>
          <h4 className="surface__section">{y}</h4>
          <ul className="facts">
            {moments
              .filter((m) => m.year === y)
              .map((m, i) => (
                <li className="facts__line" key={i}>
                  <span className="facts__when">{m.text}</span>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

function ProgressTab({ entry, save }: { entry: RosterEntry; save: GameSave }) {
  const f = entry.fighter;
  const days = save.dayCount - entry.joinedDayCount;
  const weeks = Math.max(0, Math.floor(days / 7));
  return (
    <section aria-label="Progress">
      <div className="fp__chart">
        {ATTR_KEYS.map((k: AttrKey) => {
          const series = attributeSeries(entry, k);
          const tr = attributeTrend(entry, k, save.dayCount);
          const word =
            tr.totalChange >= 0.05 ? 'COMING ON' : tr.totalChange <= -0.05 ? 'SLIPPING' : 'HOLDING';
          return (
            <div className="fp__chartrow" key={k}>
              <span className="attr__label">{ATTR_LABELS[k].toUpperCase()}</span>
              <span className="fp__trace">
                <Trace series={series} />
              </span>
              <span className="attr__num">{Math.round(f.attributes[k])}</span>
              <span className={'fp__change' + (tr.totalChange < -0.05 ? ' fp__change--bad' : tr.totalChange > 0.05 ? ' fp__change--good' : '')}>
                {signed(tr.totalChange)}
              </span>
              <span className="attr__word">{word}</span>
            </div>
          );
        })}
      </div>
      <p className="surface__note">
        {weeks < 2
          ? 'Not much to chart yet — give it a few weeks.'
          : `Traces run since he walked in ${weeks} weeks ago. ${
              entry.focus ? `Current focus: ${ATTR_LABELS[entry.focus as AttrKey] ?? 'well-rounded'}.` : ''
            }`}
      </p>
    </section>
  );
}

/** a clean line trace across the section */
function Trace({ series }: { series: number[] }) {
  if (series.length < 2) {
    return (
      <svg viewBox="0 0 100 26" preserveAspectRatio="none" aria-hidden="true">
        <line x1="2" y1="13" x2="12" y2="13" stroke="var(--cream-dim)" strokeWidth="1.5" />
      </svg>
    );
  }
  const min = Math.min(...series);
  const max = Math.max(...series);
  const span = Math.max(1, max - min);
  const pts = series
    .map((v, i) => {
      const x = 2 + (i / (series.length - 1)) * 96;
      const y = 22 - ((v - min) / span) * 18;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  return (
    <svg viewBox="0 0 100 26" preserveAspectRatio="none" aria-hidden="true">
      <polyline
        points={pts}
        fill="none"
        stroke="var(--gold)"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}
