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
import { LOCKER_CAP, NO_LOCKER_CAP } from '../state/persistence';
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
  type AttrKey,
} from '../game/training';
import { Portrait } from '../assets/portraits';
import { AttributeBar } from '../components/AttributeBar';
import { Sparkline } from '../components/Sparkline';
import { MoodChip } from '../components/MoodChip';
import './FighterProfile.css';

const signed = (n: number) => `${n >= 0 ? '+' : '−'}${Math.abs(n).toFixed(1)}`;

type ProfileTab = 'overview' | 'development';

export function FighterProfile() {
  const { save, profileId, viewerIds, closeProfile, setLocker, setTier, cutFighter } =
    useGame();
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
  const feel = f.growthKnown ? devFeel(f.growth) : null;
  const lockersFull = lockersUsed(save) >= LOCKER_CAP;
  const noLockerFull = noLockerUsed(save) >= NO_LOCKER_CAP;
  const days = save.dayCount - entry.joinedDayCount;
  const weeks = Math.max(0, Math.floor(days / 7));
  const tenure = days <= 0 ? 'Joined today' : days === 1 ? 'With you 1 day' : `With you ${days} days`;

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
            </div>
          </div>

          {/* Right column — tabbed: Overview / Development */}
          <div className="fp__right">
            <nav className="fp__tabs" aria-label="Profile sections">
              <button
                className={'fp__tab' + (tab === 'overview' ? ' fp__tab--on' : '')}
                onClick={() => setTab('overview')}
              >
                Overview
              </button>
              <button
                className={'fp__tab' + (tab === 'development' ? ' fp__tab--on' : '')}
                onClick={() => setTab('development')}
              >
                Development
              </button>
            </nav>

            {tab === 'development' ? (
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
            ) : (
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
                {ATTR_KEYS.map((key: AttrKey) => {
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
                })}
              </div>
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
              <h3 className="fp__section-title">Standing</h3>
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
                      title={lockersFull ? 'All 20 lockers are full' : undefined}
                    >
                      Give him a locker
                    </button>
                  )}

                  {confirmingCut ? (
                    <span className="fp__confirm">
                      <span className="fp__confirm-q">Cut him loose?</span>
                      <button
                        className="fp__cut-yes"
                        onClick={() => {
                          cutFighter(f.id);
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
                      Cut from the gym
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
