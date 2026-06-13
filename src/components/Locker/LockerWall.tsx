/*
  LockerWall — the standard Locker Room view
  --------------------------------------------------------------------------
  A wall of the gym's twenty lockers, plus the bench for men without one. The
  cap is physical: empty doors are free lockers you can see, the bench only
  seats six. Each occupied door shows just enough at a glance — name tape,
  portrait, a mood dot, a focus mark, a development arrow. Click a door to open
  the man's profile, where you actually manage him.

  Doors come from the locker asset registry (assets/lockers.tsx), so real art
  drops in beneath these overlays untouched.
*/

import { useGame } from '../../state/GameContext';
import { LOCKER_CAP, NO_LOCKER_CAP } from '../../state/persistence';
import { TIER_ORDER, type RosterEntry, type HierarchyTier } from '../../game/roster';
import { moodLabel, type MoodTone } from '../../game/relationship';
import { developmentState } from '../../game/training';
import { Portrait } from '../../assets/portraits';
import { LockerDoorArt } from '../../assets/lockers';
import './LockerWall.css';

const TIER_ACCENT: Record<HierarchyTier, string> = {
  must_keep: '#e8b566',
  watch: '#c4b088',
  chopping: '#a6432a',
};

const TONE_COLOR: Record<MoodTone, string> = {
  good: '#e8b566',
  ok: '#c4b088',
  warn: '#c98a4a',
  crit: '#a6432a',
};

export function LockerWall() {
  const { save, openProfile } = useGame();
  if (!save) return null;

  const tierRank = (t: HierarchyTier) => TIER_ORDER.indexOf(t);
  const holders = save.roster
    .filter((e) => e.hasLocker)
    .sort((a, b) => tierRank(a.tier) - tierRank(b.tier) || a.fighter.lastName.localeCompare(b.fighter.lastName));
  const bench = save.roster.filter((e) => !e.hasLocker);
  const emptyCount = Math.max(0, LOCKER_CAP - holders.length);

  return (
    <div className="wall">
      <div className="wall__doors">
        {holders.map((entry) => (
          <LockerCell key={entry.fighter.id} entry={entry} onOpen={() => openProfile(entry.fighter.id)} />
        ))}
        {Array.from({ length: emptyCount }).map((_, i) => (
          <div className="locker-cell locker-cell--empty" key={`empty-${i}`} aria-hidden="true">
            <LockerDoorArt variant="empty" />
            <span className="locker-cell__empty-tag">EMPTY</span>
          </div>
        ))}
      </div>

      <div className="bench">
        <div className="bench__label">
          <span className="bench__title">The Bench</span>
          <span className="bench__sub">
            without a locker · {bench.length} / {NO_LOCKER_CAP} · limited training
          </span>
        </div>
        {bench.length === 0 ? (
          <p className="bench__empty">Nobody waiting on the bench.</p>
        ) : (
          <ul className="bench__men">
            {bench.map((entry) => (
              <li key={entry.fighter.id}>
                <button className="bench__man" onClick={() => openProfile(entry.fighter.id)} title={`${entry.fighter.firstName} ${entry.fighter.lastName}`}>
                  <span className="bench__portrait">
                    <Portrait appearance={entry.fighter.appearance} size={44} />
                  </span>
                  <span className="bench__name">{entry.fighter.lastName}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function LockerCell({ entry, onOpen }: { entry: RosterEntry; onOpen: () => void }) {
  const f = entry.fighter;
  const mood = moodLabel(entry);
  const dev = developmentState(entry);
  const devArrow = dev.tone === 'good' ? 'up' : dev.tone === 'crit' ? 'down' : null;

  return (
    <button className="locker-cell" onClick={onOpen} title={`${f.firstName} ${f.lastName}`}>
      <LockerDoorArt variant="occupied" accent={TIER_ACCENT[entry.tier]} />

      <span className="locker-cell__portrait">
        <Portrait appearance={f.appearance} size={52} />
      </span>

      <span className="locker-cell__glyphs">
        <span className="locker-cell__mood" style={{ background: TONE_COLOR[mood.tone] }} title={mood.label} />
        {entry.focus !== null && <span className="locker-cell__focus" title="In focused training">✦</span>}
        {devArrow && (
          <span className={`locker-cell__dev locker-cell__dev--${devArrow}`}>
            {devArrow === 'up' ? '▲' : '▼'}
          </span>
        )}
      </span>

      <span className="locker-cell__tape">{f.lastName}</span>
    </button>
  );
}
