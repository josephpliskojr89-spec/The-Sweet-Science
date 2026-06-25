/*
  LockerRoom — your full roster, and now its day-to-day management (Phase 5+)
  --------------------------------------------------------------------------
  The single place to manage a fighter. Twenty lockers and the decisions they
  force; the hierarchy (Must Keep / Watch / Chopping); and — folded in here so
  you never have to leave to set training — focused-training assignment, the
  development read, and his discovered feel. The gym-wide picture and coaching
  staff live in My Gym; everything you do to an individual man happens here.
*/

import { useEffect, useState } from 'react';
import { useGame, lockersUsed, noLockerUsed } from '../state/GameContext';
import { TIER_META, TIER_ORDER, type HierarchyTier, type RosterEntry } from '../game/roster';
import { fighterFullName } from '../game/fighters';
import { WEIGHT_CLASSES } from '../game/weightClasses';
import {
  developmentState,
  devFeel,
  ATTR_KEYS,
  ATTR_LABELS,
  type TrainingFocus,
} from '../game/training';
import { Portrait } from '../assets/portraits';
import { TraitChip } from '../components/TraitChip';
import { MoodChip } from '../components/MoodChip';
import { LockerWall } from '../components/Locker/LockerWall';
import './LockerRoom.css';

type LockerView = 'wall' | 'list';

export function LockerRoom() {
  const { save, closeRoom, profileId, viewerIds, focusCapacity, lockerCap, noLockerCap } =
    useGame();
  const [view, setView] = useState<LockerView>('wall');

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
  const used = lockersUsed(save);
  const lockersFull = used >= lockerCap;
  const noLockerCount = noLockerUsed(save);
  const noLockerFull = noLockerCount >= noLockerCap;
  const focusedCount = save.roster.filter((e) => e.focus !== null).length;
  const slotsFull = focusedCount >= focusCapacity;

  return (
    <div className="room-screen worn" role="dialog" aria-label="Locker Room">
      <div className="room-screen__backdrop" aria-hidden="true" />

      <header className="room-screen__chrome">
        <button className="room-screen__back" onClick={closeRoom} title="Back to the floor (Esc)">
          ← Back to the floor
        </button>
        <span className="room-screen__breadcrumb">Your Gym · Locker Room</span>
      </header>

      <div className="room-screen__body locker__body">
        <div className="locker">
          <header className="locker__head">
            <h2 className="locker__title">Locker Room</h2>
            <div className="locker__meters">
              <div className="locker__meter">
                <span className="locker__meter-track">
                  <span
                    className="locker__meter-fill"
                    style={{ width: `${(used / lockerCap) * 100}%` }}
                  />
                </span>
                <span className="locker__meter-label">
                  {used} / {lockerCap} lockers · {noLockerCount} / {noLockerCap} without
                </span>
              </div>
              <div className="locker__focus-meter">
                <span className={'locker__focus-count' + (slotsFull ? ' locker__focus-count--full' : '')}>
                  {focusedCount} / {focusCapacity}
                </span>
                <span className="locker__focus-label">focused slots</span>
              </div>
              <div className="locker__view" role="group" aria-label="View">
                <button
                  className={'locker__view-btn' + (view === 'wall' ? ' locker__view-btn--on' : '')}
                  onClick={() => setView('wall')}
                >
                  Wall
                </button>
                <button
                  className={'locker__view-btn' + (view === 'list' ? ' locker__view-btn--on' : '')}
                  onClick={() => setView('list')}
                >
                  List
                </button>
              </div>
            </div>
          </header>

          {view === 'wall' ? (
            <LockerWall />
          ) : save.roster.length === 0 ? (
            <p className="locker__empty">
              No fighters yet. Accept a walk-in from the door and he’ll take his
              place here.
            </p>
          ) : (
            TIER_ORDER.map((tier) => {
              const inTier = save.roster.filter((e) => e.tier === tier);
              const meta = TIER_META[tier];
              return (
                <section className="locker__tier" key={tier}>
                  <header className="locker__tier-head">
                    <h3 className={`locker__tier-name locker__tier-name--${tier}`}>{meta.name}</h3>
                    <span className="locker__tier-count">{inTier.length}</span>
                    <span className="locker__tier-blurb">{meta.blurb}</span>
                  </header>

                  {inTier.length === 0 ? (
                    <p className="locker__tier-empty">— nobody here —</p>
                  ) : (
                    <ul className="locker__list">
                      {inTier.map((entry) => (
                        <FighterRow
                          key={entry.fighter.id}
                          entry={entry}
                          dayCount={save.dayCount}
                          lockersFull={lockersFull}
                          noLockerFull={noLockerFull}
                          slotsFull={slotsFull}
                        />
                      ))}
                    </ul>
                  )}
                </section>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function FighterRow({
  entry,
  dayCount,
  lockersFull,
  noLockerFull,
  slotsFull,
}: {
  entry: RosterEntry;
  dayCount: number;
  lockersFull: boolean;
  noLockerFull: boolean;
  slotsFull: boolean;
}) {
  const { openProfile, setLocker, setTier, setFocus, cutFighter, stopConsidering } = useGame();
  const [confirmingCut, setConfirmingCut] = useState(false);
  const f = entry.fighter;
  const cls = WEIGHT_CLASSES[f.weightClass];
  const days = dayCount - entry.joinedDayCount;
  const tenure = days <= 0 ? 'joined today' : days === 1 ? 'with you 1 day' : `with you ${days} days`;
  const dev = developmentState(entry);
  const feel = entry.hasLocker && f.growthKnown ? devFeel(f.growth) : null;

  return (
    <li className="frow">
      <button className="frow__id" onClick={() => openProfile(f.id)} title="Open profile">
        <span className="frow__portrait">
          <Portrait appearance={f.appearance} size={52} />
        </span>
        <span className="frow__identity">
          <span className="frow__name">{fighterFullName(f)}</span>
          <span className="frow__meta">
            {f.age} yrs · {cls.name} · {tenure}
          </span>
          <span className="frow__traits">
            {f.visibleTraits.length === 0 ? (
              <span className="frow__notrait">no obvious traits yet</span>
            ) : (
              f.visibleTraits.map((t) => <TraitChip key={t} trait={t} />)
            )}
          </span>
        </span>
      </button>

      <div className="frow__chips">
        <MoodChip entry={entry} />
        <span className={`frow__dev frow__dev--${dev.tone}`}>{dev.label}</span>
        {feel && (
          <span className={`frow__feel frow__feel--${feel.tone}`} title={feel.blurb}>
            {feel.label}
          </span>
        )}
      </div>

      <div className="frow__controls">
        <div className="frow__tiers" role="group" aria-label="Hierarchy">
          {TIER_ORDER.map((t) => (
            <button
              key={t}
              className={'frow__tier' + (entry.tier === t ? ' frow__tier--on' : '')}
              onClick={() => setTier(f.id, t as HierarchyTier)}
              title={TIER_META[t].name}
            >
              {TIER_META[t].short}
            </button>
          ))}
        </div>

        {entry.hasLocker ? (
          <>
            <select
              className="frow__focus-select"
              value={entry.focus ?? ''}
              onChange={(e) =>
                setFocus(f.id, e.target.value === '' ? null : (e.target.value as TrainingFocus))
              }
              title={
                slotsFull && entry.focus === null
                  ? 'No focused slots left'
                  : 'Training assignment'
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

            <button
              className="frow__act"
              disabled={noLockerFull}
              onClick={() => setLocker(f.id, false)}
              title={noLockerFull ? 'No room to carry another without a locker' : undefined}
            >
              Take Locker
            </button>
          </>
        ) : (
          <>
            <span className="frow__limited">Limited · no locker</span>
            <button
              className="frow__act frow__act--give"
              disabled={lockersFull}
              onClick={() => setLocker(f.id, true)}
              title={lockersFull ? 'Every locker is full' : undefined}
            >
              Give Locker
            </button>
          </>
        )}

        {confirmingCut ? (
          <span className="frow__confirm">
            <button
              className="frow__cut-yes"
              onClick={() => {
                if (entry.hasLocker) cutFighter(f.id);
                else stopConsidering(f.id);
                setConfirmingCut(false);
              }}
            >
              Confirm
            </button>
            <button className="frow__cut-no" onClick={() => setConfirmingCut(false)}>
              Cancel
            </button>
          </span>
        ) : (
          <button
            className="frow__act frow__act--cut"
            onClick={() => setConfirmingCut(true)}
            title={entry.hasLocker ? 'Cut from the gym' : 'Stop considering this trialist'}
          >
            {entry.hasLocker ? 'Cut' : 'Stop'}
          </button>
        )}
      </div>
    </li>
  );
}
