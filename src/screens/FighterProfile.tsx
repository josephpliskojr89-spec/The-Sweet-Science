/*
  FighterProfile
  --------------------------------------------------------------------------
  The full read on a fighter you've taken in: portrait, vitals, attributes, and
  the traits you've learned so far. Hidden traits stay hidden — if a man has
  more beneath the surface, the profile only hints that there's more to learn.
  The same management actions as the Locker Room live here too.
*/

import { useEffect, useState } from 'react';
import { useGame, lockersUsed, noLockerUsed } from '../state/GameContext';
import { TIER_META, TIER_ORDER, type HierarchyTier } from '../game/roster';
import { fighterFullName } from '../game/fighters';
import { WEIGHT_CLASSES, formatHeight } from '../game/weightClasses';
import { getCity } from '../game/cities';
import { TRAITS } from '../game/traits';
import {
  developmentState,
  focusLabel,
  devFeel,
  attributeTrend,
  attributeSeries,
  ATTR_KEYS,
  ATTR_LABELS,
  FOCUS_SLOTS_BASE,
  type AttrKey,
  type TrainingFocus,
} from '../game/training';
import { coachChemistry, chemistryRead, specialtyName } from '../game/coaches';
import { scoutingBand, patienceFlavor } from '../game/scouting';
import { flightRiskRead } from '../game/reputation';
import { fighterBiography, careerTimeline, yearsWithGymLabel } from '../game/biography';
import type { RosterEntry } from '../game/roster';
import type { GameSave } from '../state/persistence';
import { Portrait } from '../assets/portraits';
import { AttributeBar } from '../components/AttributeBar';
import { Sparkline } from '../components/Sparkline';
import { MoodChip } from '../components/MoodChip';
import './FighterProfile.css';

const signed = (n: number) => `${n >= 0 ? '+' : '−'}${Math.abs(n).toFixed(1)}`;

type ProfileTab = 'overview' | 'record' | 'biography' | 'career' | 'development';

const TABS: { key: ProfileTab; label: string; lockerOnly?: boolean }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'record', label: 'Record' },
  { key: 'biography', label: 'Biography' },
  { key: 'career', label: 'Career' },
  { key: 'development', label: 'Development', lockerOnly: true },
];

export function FighterProfile() {
  const {
    save,
    profileId,
    viewerIds,
    closeProfile,
    setLocker,
    setTier,
    setFocus,
    setTrainer,
    cutFighter,
    stopConsidering,
    respondLockerRequest,
    lockerCap,
    noLockerCap,
  } = useGame();
  const [confirmingCut, setConfirmingCut] = useState(false);
  const [tab, setTab] = useState<ProfileTab>('overview');

  useEffect(() => {
    setConfirmingCut(false);
    setTab('overview');
  }, [profileId]);

  // Esc closes the profile — unless the walk-in viewer is layered above us.
  useEffect(() => {
    if (!profileId || viewerIds !== null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeProfile();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [profileId, viewerIds, closeProfile]);

  if (!save || !profileId) return null;
  const entry = save.roster.find((e) => e.fighter.id === profileId);
  if (!entry) return null;

  const f = entry.fighter;
  const cls = WEIGHT_CLASSES[f.weightClass];
  const home = getCity(f.homeCityId);
  const dev = developmentState(entry);
  // A trialist you haven't committed to is read in fog: no precise dev feel, no
  // progression charting — those come with a locker.
  const feel = entry.hasLocker && f.growthKnown ? devFeel(f.growth) : null;
  const lockersFull = lockersUsed(save) >= lockerCap;
  const noLockerFull = noLockerUsed(save) >= noLockerCap;
  const days = save.dayCount - entry.joinedDayCount;
  const weeks = Math.max(0, Math.floor(days / 7));
  const tenure = days <= 0 ? 'Joined today' : days === 1 ? 'With you 1 day' : `With you ${days} days`;
  // The Development tab is for committed men only; a trialist can't be charted.
  const shownTab: ProfileTab = tab === 'development' && !entry.hasLocker ? 'overview' : tab;
  // Rival interest in a man you haven't kept happy — a threat you can see coming.
  const flight = entry.hasLocker ? flightRiskRead(entry.poachInterest) : null;

  return (
    <div className="fp worn" role="dialog" aria-label={fighterFullName(f)}>
      <div className="fp__backdrop" aria-hidden="true" />

      <header className="fp__chrome">
        <button className="fp__back" onClick={closeProfile} title="Back (Esc)">
          ← Back
        </button>
        <span className="fp__breadcrumb">Locker Room · Fighter</span>
      </header>

      <div className="fp__body">
        <article className="fp__card">
          {/* Left column — portrait + vitals + status */}
          <div className="fp__left">
            <div className="fp__portrait">
              <Portrait appearance={f.appearance} size={200} />
            </div>

            <h2 className="fp__name">
              {f.firstName}{' '}
              {f.nickname && <span className="fp__nick">“{f.nickname}”</span>}{' '}
              {f.lastName}
            </h2>

            <dl className="fp__vitals">
              <div><dt>Age</dt><dd>{f.age}</dd></div>
              <div><dt>Height</dt><dd>{formatHeight(f.heightInches)}</dd></div>
              <div><dt>Weight</dt><dd>{f.weightLbs} lbs</dd></div>
              <div><dt>Class</dt><dd>{cls.name}</dd></div>
              <div><dt>From</dt><dd>{home.name}</dd></div>
            </dl>

            <div className="fp__status">
              <span className={'fp__locker' + (entry.hasLocker ? ' fp__locker--on' : '')}>
                {entry.hasLocker ? '● Has a locker' : '○ No locker — limited training'}
              </span>
              <span className="fp__mood-row">
                <span className="fp__mood-label">Mood</span>
                <MoodChip entry={entry} />
              </span>
              <span className="fp__tenure">{tenure}</span>
              {flight && (
                <span
                  className={`fp__flight fp__flight--${flight.tone}`}
                  title="Other gyms have noticed he's unhappy. Mend the relationship or you may lose him."
                >
                  ⚑ {flight.label}
                </span>
              )}
              {!entry.hasLocker && (
                <span className="fp__patience">{patienceFlavor(entry.trialPatience)}</span>
              )}
            </div>
          </div>

          {/* Right column — tabbed: Overview / Development */}
          <div className="fp__right">
            {!entry.hasLocker && entry.lockerRequested && (
              <div className="fp__request" role="group" aria-label="He's asking about a locker">
                <p className="fp__request-quote">
                  “Coach, I’ve been here every night for months. Do you see a future for me
                  here, or am I wasting my time?”
                </p>
                <div className="fp__request-actions">
                  <button
                    className="fp__request-btn fp__request-btn--give"
                    disabled={lockersFull}
                    onClick={() => respondLockerRequest(f.id, 'grant')}
                    title={lockersFull ? 'Every locker is full' : undefined}
                  >
                    Give him a locker
                  </button>
                  <button
                    className="fp__request-btn"
                    onClick={() => respondLockerRequest(f.id, 'wait')}
                  >
                    Ask him to keep waiting
                  </button>
                  <button
                    className="fp__request-btn"
                    onClick={() => respondLockerRequest(f.id, 'honest')}
                  >
                    Be honest — no room
                  </button>
                </div>
              </div>
            )}
            <nav className="fp__tabs" aria-label="Profile sections">
              {TABS.map((t) => {
                const locked = t.lockerOnly && !entry.hasLocker;
                return (
                  <button
                    key={t.key}
                    className={'fp__tab' + (shownTab === t.key ? ' fp__tab--on' : '')}
                    onClick={() => setTab(t.key)}
                    disabled={locked}
                    title={locked ? 'Give him a locker to chart his development' : undefined}
                  >
                    {t.label}
                  </button>
                );
              })}
            </nav>

            {shownTab === 'record' && <RecordPanel entry={entry} save={save} />}
            {shownTab === 'biography' && <BiographyPanel entry={entry} save={save} />}
            {shownTab === 'career' && <CareerPanel entry={entry} save={save} />}

            {shownTab === 'development' && (
              <section className="fp__section">
                <div className="fp__section-head">
                  <h3 className="fp__section-title">Development</h3>
                  <div className="fp__dev">
                    {entry.focus && (
                      <span className="fp__focus-tag">Focused · {focusLabel(entry.focus)}</span>
                    )}
                    <span className={`fp__dev-tag fp__dev-tag--${dev.tone}`}>{dev.label}</span>
                  </div>
                </div>

                <div className="fp__track">
                  {ATTR_KEYS.map((k: AttrKey) => {
                    const tr = attributeTrend(entry, k, save.dayCount);
                    const cls2 =
                      tr.totalChange >= 0.05 ? 'up' : tr.totalChange <= -0.05 ? 'down' : 'flat';
                    return (
                      <div className="fp__track-row" key={k}>
                        <span className="fp__track-label">{ATTR_LABELS[k]}</span>
                        <Sparkline values={attributeSeries(entry, k)} trend={tr.dir} />
                        <span className="fp__track-now">{Math.round(f.attributes[k])}</span>
                        <span className={`fp__track-change fp__track-change--${cls2}`}>
                          {signed(tr.totalChange)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <p className="fp__track-note">
                  {weeks < 2
                    ? 'Not much to chart yet — give it a few weeks of training.'
                    : `Arrows show recent form; totals are the change since he walked in ${weeks} weeks ago.`}
                </p>
              </section>
            )}

            {shownTab === 'overview' && (
              <>
            <section className="fp__section">
              <div className="fp__section-head">
                <h3 className="fp__section-title">Attributes</h3>
                <div className="fp__dev">
                  {feel && (
                    <span className={`fp__feel-tag fp__feel-tag--${feel.tone}`} title={feel.blurb}>
                      {feel.label}
                    </span>
                  )}
                  {entry.focus && (
                    <span className="fp__focus-tag">Focused · {focusLabel(entry.focus)}</span>
                  )}
                  <span className={`fp__dev-tag fp__dev-tag--${dev.tone}`}>{dev.label}</span>
                </div>
              </div>
              <div className="fp__attrs">
                {entry.hasLocker
                  ? ATTR_KEYS.map((key: AttrKey) => {
                      const tr = attributeTrend(entry, key, save.dayCount);
                      return (
                        <AttributeBar
                          key={key}
                          label={ATTR_LABELS[key]}
                          value={f.attributes[key]}
                          trend={tr.dir}
                          tooltip={`${signed(tr.windowChange)} recent · ${signed(tr.totalChange)} since he arrived`}
                        />
                      );
                    })
                  : ATTR_KEYS.map((key: AttrKey) => (
                      <AttributeBar
                        key={key}
                        label={ATTR_LABELS[key]}
                        value={f.attributes[key]}
                        band={scoutingBand(f.attributes[key], days)}
                      />
                    ))}
              </div>
              <p className="fp__scout-note">
                <span className="fp__scout-label">Your read</span>
                {f.ceilingRead}
              </p>
              {!entry.hasLocker && (
                <p className="fp__fog-note">
                  You haven’t committed to him — this is a coach’s eye, not a measurement.
                  Give him a locker and you’ll see exactly what he is.
                </p>
              )}
            </section>

            <section className="fp__section">
              <h3 className="fp__section-title">What You Know</h3>
              {f.visibleTraits.length === 0 ? (
                <p className="fp__notrait">
                  Nothing obvious yet. Time in the gym will tell you who he is.
                </p>
              ) : (
                <ul className="fp__traits">
                  {f.visibleTraits.map((t) => (
                    <li key={t} className="fp__trait">
                      <span className="fp__trait-name">{TRAITS[t].name}</span>
                      <span className="fp__trait-blurb">{TRAITS[t].blurb}</span>
                    </li>
                  ))}
                </ul>
              )}
              {f.hiddenTraits.length > 0 && (
                <p className="fp__more">There’s more to this man than you’ve seen yet.</p>
              )}
            </section>

            <section className="fp__section">
              <h3 className="fp__section-title">Standing &amp; Training</h3>
              <div className="fp__actions">
                <div className="fp__tiers" role="group" aria-label="Hierarchy">
                  {TIER_ORDER.map((t) => (
                    <button
                      key={t}
                      className={'fp__tier' + (entry.tier === t ? ' fp__tier--on' : '')}
                      onClick={() => setTier(f.id, t as HierarchyTier)}
                      title={TIER_META[t].blurb}
                    >
                      {TIER_META[t].name}
                    </button>
                  ))}
                </div>

                {entry.hasLocker ? (
                  <div className="fp__training-block">
                    <label className="fp__training">
                      <span className="fp__training-label">Training</span>
                      <select
                        className="fp__focus-select"
                        value={entry.focus ?? ''}
                        onChange={(e) =>
                          setFocus(f.id, e.target.value === '' ? null : (e.target.value as TrainingFocus))
                        }
                      >
                        <option value="">General training</option>
                        <option value="rounded">Focus · Well-rounded</option>
                        {ATTR_KEYS.map((k) => (
                          <option key={k} value={k}>
                            Focus · {ATTR_LABELS[k]}
                          </option>
                        ))}
                      </select>
                    </label>

                    {entry.focus !== null && (() => {
                      const usedMgr = save.roster.filter((e) => e.focus !== null && e.coachId === null).length;
                      const mgrFree = FOCUS_SLOTS_BASE - usedMgr + (entry.coachId === null ? 1 : 0);
                      const assigned = entry.coachId
                        ? save.coaches.find((c) => c.id === entry.coachId)
                        : null;
                      const chem = assigned
                        ? chemistryRead(
                            coachChemistry(assigned, [...f.visibleTraits, ...f.hiddenTraits], f.age),
                          )
                        : null;
                      return (
                        <>
                          <label className="fp__training">
                            <span className="fp__training-label">Trainer</span>
                            <select
                              className="fp__focus-select"
                              value={entry.coachId ?? ''}
                              onChange={(e) => setTrainer(f.id, e.target.value === '' ? null : e.target.value)}
                            >
                              <option value="">You · {Math.max(0, mgrFree)} free</option>
                              {save.coaches.map((c) => {
                                const used = save.roster.filter(
                                  (x) => x.focus !== null && x.coachId === c.id,
                                ).length;
                                const free = c.slots - used + (entry.coachId === c.id ? 1 : 0);
                                return (
                                  <option key={c.id} value={c.id}>
                                    {c.name} ({specialtyName(c.specialty)}) · {Math.max(0, free)} free
                                  </option>
                                );
                              })}
                            </select>
                          </label>
                          {chem && (
                            <p className={`fp__chem fp__chem--${chem.tone}`}>
                              {assigned!.name}: <strong>{chem.label}</strong>
                            </p>
                          )}
                        </>
                      );
                    })()}
                  </div>
                ) : (
                  <p className="fp__training-note">
                    No locker — limited training. Give him a locker to assign focus.
                  </p>
                )}

                <div className="fp__action-row">
                  {entry.hasLocker ? (
                    <button
                      className="fp__act"
                      disabled={noLockerFull}
                      onClick={() => setLocker(f.id, false)}
                      title={noLockerFull ? 'No room to carry another without a locker' : undefined}
                    >
                      Take his locker
                    </button>
                  ) : (
                    <button
                      className="fp__act fp__act--give"
                      disabled={lockersFull}
                      onClick={() => setLocker(f.id, true)}
                      title={lockersFull ? 'Every locker is full' : undefined}
                    >
                      Give him a locker
                    </button>
                  )}

                  {confirmingCut ? (
                    <span className="fp__confirm">
                      <span className="fp__confirm-q">
                        {entry.hasLocker ? 'Cut him loose?' : 'Stop considering him?'}
                      </span>
                      <button
                        className="fp__cut-yes"
                        onClick={() => {
                          if (entry.hasLocker) cutFighter(f.id);
                          else stopConsidering(f.id);
                          setConfirmingCut(false);
                        }}
                      >
                        Confirm
                      </button>
                      <button className="fp__cut-no" onClick={() => setConfirmingCut(false)}>
                        Cancel
                      </button>
                    </span>
                  ) : (
                    <button className="fp__act fp__act--cut" onClick={() => setConfirmingCut(true)}>
                      {entry.hasLocker ? 'Cut from the gym' : 'Stop considering'}
                    </button>
                  )}
                </div>
              </div>
            </section>
              </>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}

/* ---------- Record ---------- */

function RecordPanel({ entry, save }: { entry: RosterEntry; save: GameSave }) {
  const cells: { label: string; value: string; sub?: string }[] = [
    { label: 'Professional', value: '0–0–0', sub: 'No pro fights yet' },
    { label: 'Amateur', value: 'Unrecorded' },
    { label: 'KO Wins', value: '0' },
    { label: 'KO Losses', value: '0' },
    { label: 'Current Streak', value: '—' },
    { label: 'Titles Held', value: 'None' },
    { label: 'Ranking', value: 'Unranked' },
    { label: 'Years With Gym', value: yearsWithGymLabel(entry, save.dayCount) },
    { label: 'Career Earnings', value: '$0' },
  ];
  return (
    <section className="fp__section">
      <div className="fp__section-head">
        <h3 className="fp__section-title">Boxing Record</h3>
      </div>
      <div className="fp__rec-grid">
        {cells.map((c) => (
          <div className="fp__rec" key={c.label}>
            <span className="fp__rec-label">{c.label}</span>
            <span className="fp__rec-value">{c.value}</span>
            {c.sub && <span className="fp__rec-sub">{c.sub}</span>}
          </div>
        ))}
      </div>
      <p className="fp__scaffold-note">
        His professional career hasn’t started. Once you’re booking fights, his
        record, rankings, titles, and purse history will all live on this page.
      </p>
    </section>
  );
}

/* ---------- Biography ---------- */

function BiographyPanel({ entry, save }: { entry: RosterEntry; save: GameSave }) {
  const paras = fighterBiography(entry, save.dayCount);
  return (
    <section className="fp__section">
      <div className="fp__section-head">
        <h3 className="fp__section-title">Biography</h3>
      </div>
      <div className="fp__bio">
        {paras.map((p, i) => {
          const quote = p.startsWith('In his own words');
          const impression = p.startsWith('Your first read');
          const cls =
            'fp__bio-para' +
            (quote ? ' fp__bio-quote' : '') +
            (impression ? ' fp__bio-impression' : '');
          return (
            <p className={cls} key={i}>
              {p}
            </p>
          );
        })}
      </div>
      <p className="fp__scaffold-note">
        This page fills in as you learn who he is — every trait you uncover and
        every turn of his career adds to the story.
      </p>
    </section>
  );
}

/* ---------- Career ---------- */

function CareerPanel({ entry, save }: { entry: RosterEntry; save: GameSave }) {
  const moments = careerTimeline(entry, save.dayCount);
  const years = [...new Set(moments.map((m) => m.year))].sort((a, b) => a - b);
  return (
    <section className="fp__section">
      <div className="fp__section-head">
        <h3 className="fp__section-title">Career History</h3>
      </div>
      <div className="fp__career">
        {years.map((y) => (
          <div className="fp__career-year" key={y}>
            <span className="fp__career-year-label">{y}</span>
            <ul className="fp__career-events">
              {moments
                .filter((m) => m.year === y)
                .map((m, i) => (
                  <li className="fp__career-event" key={i}>
                    {m.text}
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="fp__scaffold-note">
        His story is just beginning. Fights, milestones, injuries, title nights,
        and the moments you find out who he really is — all of it gets written
        here as it happens.
      </p>
    </section>
  );
}
