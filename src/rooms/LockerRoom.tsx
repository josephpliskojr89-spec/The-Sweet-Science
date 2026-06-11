/*
  LockerRoom — your full roster and its hierarchy (Phase 4)
  --------------------------------------------------------------------------
  Twenty lockers, and the decisions they force. Each fighter sits in a tier —
  Must Keep, Watch List, Chopping Block — and either holds a locker or trains
  without one. Here you assign and pull lockers (the cap bites), move men
  between tiers, open a full profile, or cut a man loose (and learn how he
  takes it). Training itself is Phase 5; this is the human bookkeeping.
*/

import { useEffect, useState } from 'react';
import { useGame, lockersUsed, noLockerUsed } from '../state/GameContext';
import { LOCKER_CAP, NO_LOCKER_CAP } from '../state/persistence';
import { TIER_META, TIER_ORDER, type HierarchyTier, type RosterEntry } from '../game/roster';
import { fighterFullName } from '../game/fighters';
import { WEIGHT_CLASSES } from '../game/weightClasses';
import { Portrait } from '../assets/portraits';
import { TraitChip } from '../components/TraitChip';
import './LockerRoom.css';

export function LockerRoom() {
  const { save, closeRoom, profileId, viewerIds } = useGame();

  // Esc steps back to the floor — but only when this room is the top layer.
  // A profile or walk-in viewer above us owns the key while it's open.
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
  const lockersFull = used >= LOCKER_CAP;
  const noLockerCount = noLockerUsed(save);
  const noLockerFull = noLockerCount >= NO_LOCKER_CAP;

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
            <div className="locker__meter">
              <span className="locker__meter-track">
                <span
                  className="locker__meter-fill"
                  style={{ width: `${(used / LOCKER_CAP) * 100}%` }}
                />
              </span>
              <span className="locker__meter-label">
                {used} / {LOCKER_CAP} lockers · {noLockerCount} / {NO_LOCKER_CAP} without
              </span>
            </div>
          </header>

          {save.roster.length === 0 ? (
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
                    <h3 className={`locker__tier-name locker__tier-name--${tier}`}>
                      {meta.name}
                    </h3>
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
}: {
  entry: RosterEntry;
  dayCount: number;
  lockersFull: boolean;
  noLockerFull: boolean;
}) {
  const { openProfile, setLocker, setTier, cutFighter } = useGame();
  const [confirmingCut, setConfirmingCut] = useState(false);
  const f = entry.fighter;
  const cls = WEIGHT_CLASSES[f.weightClass];
  const days = dayCount - entry.joinedDayCount;
  const tenure = days <= 0 ? 'joined today' : days === 1 ? 'with you 1 day' : `with you ${days} days`;

  return (
    <li className="frow">
      <button
        className="frow__id"
        onClick={() => openProfile(f.id)}
        title="Open profile"
      >
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

      <div className="frow__controls">
        <span className={'frow__locker' + (entry.hasLocker ? ' frow__locker--on' : '')}>
          {entry.hasLocker ? '● Locker' : '○ No locker'}
        </span>

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
          <button
            className="frow__act"
            disabled={noLockerFull}
            onClick={() => setLocker(f.id, false)}
            title={noLockerFull ? 'No room to carry another without a locker' : undefined}
          >
            Take Locker
          </button>
        ) : (
          <button
            className="frow__act frow__act--give"
            disabled={lockersFull}
            onClick={() => setLocker(f.id, true)}
            title={lockersFull ? 'All 20 lockers are full' : undefined}
          >
            Give Locker
          </button>
        )}

        {confirmingCut ? (
          <span className="frow__confirm">
            <button className="frow__cut-yes" onClick={() => cutFighter(f.id)}>
              Confirm
            </button>
            <button className="frow__cut-no" onClick={() => setConfirmingCut(false)}>
              Cancel
            </button>
          </span>
        ) : (
          <button className="frow__act frow__act--cut" onClick={() => setConfirmingCut(true)}>
            Cut
          </button>
        )}
      </div>
    </li>
  );
}
