/*
  ROSTER — the locker room, as a management surface.
  --------------------------------------------------------------------------
  Two tabs:

    ROSTER   — the men by tier, with everything you decide about a man on
               his line: hierarchy, training orders, the locker, the cut.
    PROGRESS — the development table: attributes with recent-form arrows,
               trajectory and feel reads where they're earned.

  Fog unchanged: moods and trajectories are labels, growth feel appears
  only once discovered, lockerless men chart in limited mode.
*/

import { useState } from 'react';
import { useGame, lockersUsed, noLockerUsed } from '../state/GameContext';
import { Surface } from '../components/Surface';
import { TIER_META, TIER_ORDER, type HierarchyTier, type RosterEntry } from '../game/roster';
import { fighterFullName, fighterAge } from '../game/fighters';
import { WEIGHT_CLASSES } from '../game/weightClasses';
import { moodLabel } from '../game/relationship';
import {
  developmentState,
  devFeel,
  attributeTrend,
  ATTR_KEYS,
  ATTR_LABELS,
  type AttrKey,
  type TrainingFocus,
} from '../game/training';
import { TRAITS } from '../game/traits';
import { Portrait } from '../assets/portraits';
import './LockerRoom.css';

const ATTR_SHORT: Record<AttrKey, string> = {
  power: 'PWR',
  speed: 'SPD',
  chin: 'CHN',
  stamina: 'STA',
  defense: 'DEF',
  ringIq: 'IQ',
  footwork: 'FTW',
};

const TABS = [
  { key: 'roster', label: 'ROSTER' },
  { key: 'progress', label: 'PROGRESS' },
];

export function LockerRoom() {
  const { save, closeRoom, lockerCap, noLockerCap, focusCapacity } = useGame();
  const [tab, setTab] = useState<'roster' | 'progress'>('roster');
  if (!save) return null;

  const used = lockersUsed(save);
  const benched = noLockerUsed(save);
  const focused = save.roster.filter((e) => e.focus !== null).length;

  return (
    <Surface
      title="ROSTER"
      tabs={TABS}
      activeTab={tab}
      onTab={(k) => setTab(k as 'roster' | 'progress')}
      onClose={closeRoom}
    >
      <div className="cap">
        <span className="cap__item">
          <span className="ledger__label">LOCKERS</span>
          <span className="cap__value">
            {used} <span className="cap__of">OF</span> {lockerCap}
          </span>
        </span>
        <span className="cap__item">
          <span className="ledger__label">BENCH</span>
          <span className="cap__value">
            {benched} <span className="cap__of">OF</span> {noLockerCap}
          </span>
        </span>
        <span className="cap__item">
          <span className="ledger__label">FOCUS SLOTS</span>
          <span className="cap__value">
            {focused} <span className="cap__of">OF</span> {focusCapacity}
          </span>
        </span>
      </div>

      {tab === 'roster' && <RosterTab />}
      {tab === 'progress' && <ProgressTab />}
    </Surface>
  );
}

/* ------------------------------------------------------------------ */
/* ROSTER                                                              */
/* ------------------------------------------------------------------ */

function RosterTab() {
  const { save, lockerCap, noLockerCap, focusCapacity } = useGame();
  if (!save) return null;
  const lockersFull = lockersUsed(save) >= lockerCap;
  const noLockerFull = noLockerUsed(save) >= noLockerCap;
  const slotsFull = save.roster.filter((e) => e.focus !== null).length >= focusCapacity;

  if (save.roster.length === 0) {
    return (
      <p className="surface__note">
        No fighters yet. When a man comes to the door, his answer starts here.
      </p>
    );
  }

  return (
    <>
      {TIER_ORDER.map((tier) => {
        const inTier = save.roster.filter((e) => e.tier === tier);
        const meta = TIER_META[tier];
        return (
          <section key={tier} aria-label={meta.name}>
            <h3 className="surface__section">
              {meta.name.toUpperCase()} — {inTier.length} {inTier.length === 1 ? 'MAN' : 'MEN'}
              <span className="lr-blurb"> · {meta.blurb}</span>
            </h3>
            {inTier.length === 0 ? (
              <p className="surface__note">Nobody here.</p>
            ) : (
              <ul className="rows">
                {inTier.map((entry) => (
                  <ManLine
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
      })}
    </>
  );
}

function ManLine({
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
  const [striking, setStriking] = useState(false);
  const f = entry.fighter;
  const cls = WEIGHT_CLASSES[f.weightClass];
  const days = dayCount - entry.joinedDayCount;
  const mood = moodLabel(entry);
  const dev = developmentState(entry);
  const feel = entry.hasLocker && f.growthKnown ? devFeel(f.growth) : null;
  const focusLocked = slotsFull && entry.focus === null;

  return (
    <li className="man">
      <div className="man__row">
        <button className="man__id" onClick={() => openProfile(f.id)}>
          <span className="man__photo">
            <Portrait appearance={f.appearance} size={40} />
          </span>
          <span className="man__names">
            <span className="row__main">{fighterFullName(f).toUpperCase()}</span>
            <span className="row__detail">
              AGE {fighterAge(f)} · {cls.name.toUpperCase()} ·{' '}
              {days <= 0 ? 'JOINED TODAY' : `${days} ${days === 1 ? 'DAY' : 'DAYS'} IN`}
            </span>
          </span>
        </button>

        <span className="man__reads">
          <span className={'tag' + (mood.tone === 'warn' || mood.tone === 'crit' ? ' tag--bad' : '')}>
            {mood.label.toUpperCase()}
          </span>
          <span
            className={
              'tag' + (dev.tone === 'good' ? ' tag--good' : dev.tone === 'crit' ? ' tag--bad' : '')
            }
          >
            {dev.label.toUpperCase()}
          </span>
          {feel && <span className="tag tag--good">{feel.label.toUpperCase()}</span>}
          {f.visibleTraits.map((t) => (
            <span className="tag" key={t}>
              {TRAITS[t].name.toUpperCase()}
            </span>
          ))}
        </span>

        <span className="man__tiers" role="radiogroup" aria-label="Hierarchy">
          {TIER_ORDER.map((t) => (
            <button
              key={t}
              role="radio"
              aria-checked={entry.tier === t}
              aria-label={TIER_META[t].name}
              title={TIER_META[t].name}
              className={'cplan__chip' + (entry.tier === t ? ' cplan__chip--on' : '')}
              onClick={() => setTier(f.id, t as HierarchyTier)}
            >
              {TIER_META[t].short.charAt(0).toUpperCase()}
            </button>
          ))}
        </span>
      </div>

      <div className="man__row man__row--acts">
        {entry.hasLocker ? (
          <>
            <label className="man__orders">
              <span className="ledger__label">ORDERS</span>
              <select
                className="mselect"
                value={entry.focus ?? ''}
                disabled={focusLocked}
                title={focusLocked ? 'Every focus slot is in use' : undefined}
                onChange={(e) =>
                  setFocus(f.id, (e.target.value || null) as TrainingFocus | null)
                }
              >
                <option value="">General training</option>
                <option value="rounded">Focus — well-rounded</option>
                {ATTR_KEYS.map((k) => (
                  <option key={k} value={k}>
                    Focus — {ATTR_LABELS[k]}
                  </option>
                ))}
              </select>
              {focusLocked && <span className="man__lockednote">EVERY SLOT IN USE</span>}
            </label>
            <button
              className="unit__action man__act"
              disabled={noLockerFull}
              title={noLockerFull ? 'No room on the bench' : undefined}
              onClick={() => setLocker(f.id, false)}
            >
              TAKE LOCKER
            </button>
          </>
        ) : (
          <>
            <span className="tag tag--bad">NO LOCKER — LIMITED TRAINING</span>
            <button
              className="unit__action man__act"
              disabled={lockersFull}
              title={lockersFull ? 'Every locker is full' : undefined}
              onClick={() => setLocker(f.id, true)}
            >
              GIVE LOCKER
            </button>
          </>
        )}

        {striking ? (
          <span className="man__verdict">
            <span className="ledger__label">SURE?</span>
            <button
              className="unit__action unit__action--danger man__act"
              onClick={() => {
                if (entry.hasLocker) cutFighter(f.id);
                else stopConsidering(f.id);
              }}
            >
              {entry.hasLocker ? 'RELEASE HIM' : 'PASS ON HIM'}
            </button>
            <button className="unit__action man__act" onClick={() => setStriking(false)}>
              KEEP HIM
            </button>
          </span>
        ) : (
          <button
            className="unit__action unit__action--danger man__act man__cut"
            onClick={() => setStriking(true)}
          >
            {entry.hasLocker ? 'CUT' : 'PASS'}
          </button>
        )}
      </div>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* PROGRESS                                                            */
/* ------------------------------------------------------------------ */

function ProgressTab() {
  const { save, openProfile } = useGame();
  if (!save) return null;
  const sorted = [...save.roster].sort(
    (a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier),
  );

  if (sorted.length === 0) {
    return <p className="surface__note">Nothing charted yet.</p>;
  }

  return (
    <section aria-label="Development table">
      <table className="mtable">
        <thead>
          <tr>
            <th>FIGHTER</th>
            <th>TRAJECTORY</th>
            <th>FEEL</th>
            {ATTR_KEYS.map((k) => (
              <th key={k} title={ATTR_LABELS[k]}>
                {ATTR_SHORT[k]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((entry) => {
            const f = entry.fighter;
            const dev = developmentState(entry);
            const feel = entry.hasLocker && f.growthKnown ? devFeel(f.growth) : null;
            return (
              <tr className="mtable__rowlink" key={f.id} onClick={() => openProfile(f.id)}>
                <td>{fighterFullName(f)}</td>
                <td className={dev.tone === 'good' ? 'mtable__gold' : dev.tone === 'crit' ? 'mtable__red' : 'mtable__dim'}>
                  {dev.label.toUpperCase()}
                </td>
                <td className={feel ? 'mtable__gold' : 'mtable__dim'}>
                  {feel ? feel.label.toUpperCase() : '—'}
                </td>
                {entry.hasLocker ? (
                  ATTR_KEYS.map((k) => {
                    const tr = attributeTrend(entry, k, save.dayCount);
                    return (
                      <td key={k}>
                        {Math.round(f.attributes[k])}
                        {tr.dir === 'up' && <span className="lr-trend lr-trend--up"> ↑</span>}
                        {tr.dir === 'down' && <span className="lr-trend lr-trend--down"> ↓</span>}
                      </td>
                    );
                  })
                ) : (
                  <td className="mtable__dim" colSpan={7}>
                    NO LOCKER — LIMITED TRAINING
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="surface__note lr-footnote">
        Arrows show recent form. Give a man a locker to chart him properly.
      </p>
    </section>
  );
}
