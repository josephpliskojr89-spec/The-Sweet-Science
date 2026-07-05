/*
  LockerRoom — the wall of doors IS the room
  --------------------------------------------------------------------------
  ROOM SHOT (default): a narrow concrete-block back room under two cool
  fluorescent tubes. One bank of eight steel lockers, a scarred bench with
  the trial cards, a brass key rack by the door, the FOCUS TRAINING hook
  board, a clipboard on a nail (the roster sheet), and the bound Progress
  Book on the bench. A sliver of the floor's warm light shows through the
  doorway at the left edge — the way back (click it, or Esc).

  OBJECT SHOTS: lift the clipboard (list view: tier sections, checklists,
  training orders, keys, the grease pencil) or the Progress Book (the
  development table). Esc puts them down.

  Counts render as objects — keys on hooks, tags on the board, cards on the
  bench — with exact tallies typed on cards and in aria-labels. Meters and
  the segmented view switcher are deleted. (DESIGN-BIBLE, Part II; A7/A13/A14.)
*/

import { useEffect, useState, type ReactNode } from 'react';
import { useGame, lockersUsed, noLockerUsed } from '../state/GameContext';
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
import { LockerDoorArt } from '../assets/lockers';
import { Stamp } from '../kit/Stamp';
import { paperTilt, seedRange } from '../kit/seed';
import './LockerRoom.css';

type HeldObject = 'roster' | 'progress' | null;

const ATTR_SHORT: Record<AttrKey, string> = {
  power: 'PWR',
  speed: 'SPD',
  chin: 'CHN',
  stamina: 'STA',
  defense: 'DEF',
  ringIq: 'IQ',
  footwork: 'FTW',
};

const TIER_STAMP: Record<HierarchyTier, { word: string; category: 'mood' | 'pencil' | 'trajectory' }> = {
  must_keep: { word: 'MUST KEEP', category: 'mood' },
  watch: { word: 'WATCH', category: 'pencil' },
  chopping: { word: 'CHOPPING BLOCK', category: 'trajectory' },
};

const spell = (n: number) =>
  ['NO', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN'][n] ?? String(n);

export function LockerRoom() {
  const { save, closeRoom, profileId, viewerIds, focusCapacity, lockerCap, noLockerCap } =
    useGame();
  const [held, setHeld] = useState<HeldObject>(null);

  const overlayOpen = profileId !== null || viewerIds !== null;
  useEffect(() => {
    if (overlayOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setHeld((h) => {
        if (h !== null) return null;
        closeRoom();
        return h;
      });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeRoom, overlayOpen]);

  if (!save) return null;

  const holders = save.roster
    .filter((e) => e.hasLocker)
    .sort(
      (a, b) =>
        TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier) ||
        a.fighter.lastName.localeCompare(b.fighter.lastName),
    );
  const bench = save.roster.filter((e) => !e.hasLocker);
  const used = lockersUsed(save);
  const noLockerCount = noLockerUsed(save);
  const emptyCount = Math.max(0, lockerCap - holders.length);
  const focused = save.roster.filter((e) => e.focus !== null);

  return (
    <div className="locker-room" role="dialog" aria-label="Locker Room">
      {/* the room: block wall, wainscot, floor, stencil */}
      <div className="lr__walls layer" aria-hidden="true" />
      <div className="lr__stencil" aria-hidden="true">
        LOCKERS
      </div>

      {/* the way back: warm light through the doorway */}
      <button
        className="lr__doorway"
        onClick={closeRoom}
        aria-label="Back through the doorway to the gym floor (Esc)"
      >
        <span className="lr__doorway-light" aria-hidden="true" />
      </button>

      {/* the bank of doors */}
      <div className="lr__bank" role="group" aria-label={`Lockers: ${used} of ${lockerCap} used`}>
        {holders.map((entry) => (
          <LockerDoor key={entry.fighter.id} entry={entry} dimmed={held !== null} />
        ))}
        {Array.from({ length: emptyCount }, (_, i) => (
          <div
            className="lr-door lr-door--empty"
            key={`empty-${i}`}
            aria-hidden="true"
            style={{ transform: `rotate(${seedRange(`ajar${i}`, -1.2, 1.2, 0).toFixed(2)}deg)` }}
          >
            <LockerDoorArt variant="empty" />
            <span className="lr-door__hook" />
          </div>
        ))}
      </div>

      {/* the right wall: key rack, focus board, clipboard on its nail */}
      <div className="lr__rightwall">
        <div
          className="keyrack"
          aria-label={`Lockers: ${used} of ${lockerCap} used; carrying ${noLockerCount} of ${noLockerCap} without.`}
        >
          <span className="keyrack__board" aria-hidden="true">
            {Array.from({ length: lockerCap }, (_, i) => (
              <span key={i} className="keyrack__hook">
                {i >= used && <span className="keyrack__key" />}
              </span>
            ))}
          </span>
          <span className="keyrack__card" aria-hidden="true">
            {lockerCap} LOCKERS — {used} ASSIGNED
            <br />
            CARRYING {noLockerCount} OF {noLockerCap} WITHOUT
          </span>
        </div>

        <div
          className="focusboard"
          aria-label={`Focus training: ${focused.length} of ${focusCapacity} slots in use`}
        >
          <span className="focusboard__stencil" aria-hidden="true">
            FOCUS TRAINING
          </span>
          <span className="focusboard__hooks" aria-hidden="true">
            {Array.from({ length: focusCapacity }, (_, i) => (
              <span key={i} className="focusboard__hook">
                {focused[i] && (
                  <span className="focusboard__tag" style={paperTilt(focused[i].fighter.id, 3, 1)}>
                    {focused[i].fighter.lastName.toUpperCase()}
                  </span>
                )}
              </span>
            ))}
          </span>
          <span className="focusboard__card" aria-hidden="true">
            {focused.length} OF {focusCapacity} IN USE
          </span>
        </div>

        <button
          className="clipboard-nail"
          onClick={() => setHeld('roster')}
          aria-label={`Lift the roster clipboard — ${save.roster.length} men, hierarchy and training orders`}
        >
          <span className="clipboard-nail__nail" aria-hidden="true" />
          <span className="clipboard-nail__board" aria-hidden="true">
            <span className="clipboard-nail__clip" />
            <span className="clipboard-nail__tape">ROSTER</span>
          </span>
        </button>
      </div>

      {/* the bench: trial cards + the Progress Book */}
      <div className="lr__bench">
        <span className="lr__bench-wood" aria-hidden="true">
          <span className="lr__bench-stencil">TRIALS</span>
        </span>
        <div
          className="lr__bench-cards"
          role="group"
          aria-label={`The bench: ${bench.length} of ${noLockerCap} men without a locker, limited training`}
        >
          {bench.length === 0 ? (
            <span className="lr__bench-nobody" aria-hidden="true">
              NOBODY WAITING.
            </span>
          ) : (
            bench.map((entry) => <TrialCard key={entry.fighter.id} entry={entry} dimmed={held !== null} />)
          )}
        </div>
        <button
          className="progressbook"
          onClick={() => setHeld('progress')}
          aria-label="Open the Progress Book — development and attributes"
        >
          <span className="progressbook__spine" aria-hidden="true">
            PROGRESS
          </span>
        </button>
        <span className="lr__bench-capcard" aria-hidden="true">
          BENCH SEATS {noLockerCap} — LIMITED TRAINING
        </span>
      </div>

      {/* object shots */}
      {held === 'roster' && <RosterSheet onPutDown={() => setHeld(null)} />}
      {held === 'progress' && <ProgressBook onPutDown={() => setHeld(null)} />}

      {/* the rig: two fluorescent bands, near-shadowless, one lazy flicker */}
      <div className="rig lr__rig" aria-hidden="true">
        <span className="lr__tube lr__tube--1" />
        <span className="lr__tube lr__tube--2" />
      </div>
      <div className="lr__dark layer" aria-hidden="true" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* A LOCKER DOOR — status as physical marks                            */
/* ------------------------------------------------------------------ */

function LockerDoor({ entry, dimmed }: { entry: RosterEntry; dimmed: boolean }) {
  const { openProfile } = useGame();
  const f = entry.fighter;
  const mood = moodLabel(entry);
  const dev = developmentState(entry);
  const tick = dev.tone === 'good' ? 'up' : dev.tone === 'crit' ? 'down' : null;
  const tierLetter = TIER_META[entry.tier].short.charAt(0).toUpperCase();
  const troubled = mood.tone === 'warn' || mood.tone === 'crit';

  return (
    <button
      className="lr-door"
      onClick={() => openProfile(f.id)}
      disabled={dimmed}
      aria-label={`${fighterFullName(f)} — ${TIER_META[entry.tier].name}, morale ${mood.label}${
        entry.focus !== null ? ', in focus training' : ''
      }. Open his file.`}
    >
      <LockerDoorArt variant="occupied" />
      {/* taped snapshot */}
      <span className="lr-door__photo" aria-hidden="true">
        <Portrait appearance={f.appearance} size={52} />
        <span className="lr-door__photo-tape lr-door__photo-tape--l" />
        <span className="lr-door__photo-tape lr-door__photo-tape--r" />
      </span>
      {/* masking-tape name strip + pencil marks */}
      <span className="lr-door__tape" aria-hidden="true" style={paperTilt(f.id, 2, 1)}>
        <span className="lr-door__tape-name">{f.lastName.toUpperCase()}</span>
        {tick && (
          <span className={`lr-door__tick lr-door__tick--${tick}`}>{tick === 'up' ? '↗' : '↘'}</span>
        )}
        <span className="lr-door__tierletter">{tierLetter}</span>
      </span>
      {/* his note to you, wedged in the vent, only when something's wrong */}
      {troubled && (
        <span className="lr-door__slip" aria-hidden="true" title={`morale: ${mood.label}`} />
      )}
      {/* red-string FOCUS tag on the latch */}
      {entry.focus !== null && (
        <span className="lr-door__focustag" aria-hidden="true">
          FOCUS
        </span>
      )}
      <span className="lr-door__latch" aria-hidden="true" />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* A TRIAL CARD on the bench                                           */
/* ------------------------------------------------------------------ */

function TrialCard({ entry, dimmed }: { entry: RosterEntry; dimmed: boolean }) {
  const { openProfile } = useGame();
  const f = entry.fighter;
  return (
    <button
      className="trialcard on-paper"
      style={paperTilt(f.id, 2, 4)}
      onClick={() => openProfile(f.id)}
      disabled={dimmed}
      aria-label={`${fighterFullName(f)} — on trial, no locker. Open his file.`}
    >
      <span className="trialcard__clip" aria-hidden="true" />
      <Portrait appearance={f.appearance} size={40} />
      <span className="trialcard__name" aria-hidden="true">
        {f.lastName.toUpperCase()}
      </span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Object-shot shell                                                   */
/* ------------------------------------------------------------------ */

function Held({
  label,
  className,
  onPutDown,
  children,
}: {
  label: string;
  className: string;
  onPutDown: () => void;
  children: ReactNode;
}) {
  return (
    <div className={`lr-held ${className}`} role="region" aria-label={label}>
      {children}
      <button className="lr-held__putdown" onClick={onPutDown}>
        PUT IT DOWN <span className="lr-held__esc">ESC</span>
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* THE ROSTER SHEET — the clipboard, where management happens          */
/* ------------------------------------------------------------------ */

function RosterSheet({ onPutDown }: { onPutDown: () => void }) {
  const { save, lockerCap, noLockerCap, focusCapacity } = useGame();
  if (!save) return null;
  const used = lockersUsed(save);
  const lockersFull = used >= lockerCap;
  const noLockerFull = noLockerUsed(save) >= noLockerCap;
  const slotsFull = save.roster.filter((e) => e.focus !== null).length >= focusCapacity;

  return (
    <Held label="The roster clipboard" className="lr-held--clipboard" onPutDown={onPutDown}>
      <div className="rsheet on-paper">
        <span className="rsheet__clip" aria-hidden="true" />
        <span className="rsheet__formno" aria-hidden="true">
          GYM ROSTER — SHEET 1
        </span>
        {save.roster.length === 0 ? (
          <p className="rsheet__nobody">
            no fighters yet. accept a walk-in at the office and he takes his place here.
          </p>
        ) : (
          TIER_ORDER.map((tier) => {
            const inTier = save.roster.filter((e) => e.tier === tier);
            const meta = TIER_META[tier];
            const st = TIER_STAMP[tier];
            return (
              <section className="rsheet__tier" key={tier}>
                <header className="rsheet__tier-head">
                  <Stamp word={st.word} category={st.category} seedId={tier} size="md" />
                  <span className="rsheet__tier-count">
                    — {spell(inTier.length)} {inTier.length === 1 ? 'MAN' : 'MEN'} —
                  </span>
                  <span className="rsheet__tier-blurb">{meta.blurb.toLowerCase()}</span>
                </header>
                {inTier.length === 0 ? (
                  <p className="rsheet__tier-empty">— nobody here —</p>
                ) : (
                  <ul className="rsheet__rows">
                    {inTier.map((entry) => (
                      <RosterLine
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
    </Held>
  );
}

function RosterLine({
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
  const [ordersOpen, setOrdersOpen] = useState(false);
  const f = entry.fighter;
  const cls = WEIGHT_CLASSES[f.weightClass];
  const days = dayCount - entry.joinedDayCount;
  const mood = moodLabel(entry);
  const dev = developmentState(entry);
  const feel = entry.hasLocker && f.growthKnown ? devFeel(f.growth) : null;

  const focusLabel =
    entry.focus === null
      ? 'GEN. TRAINING'
      : entry.focus === 'rounded'
        ? 'FOCUS: WELL-ROUNDED'
        : `FOCUS: ${ATTR_LABELS[entry.focus as AttrKey].toUpperCase()}`;

  return (
    <li className={'rline' + (striking ? ' rline--struck' : '')}>
      <div className="rline__top">
        <button className="rline__id" onClick={() => openProfile(f.id)}>
          <span className="rline__photo">
            <Portrait appearance={f.appearance} size={40} />
            <span className="rline__photo-clip" aria-hidden="true" />
          </span>
          <span className="rline__names">
            <span className="rline__name">{fighterFullName(f).toUpperCase()}</span>
            <span className="rline__meta">
              AGE {fighterAge(f)} · {cls.name.toUpperCase()} ·{' '}
              {days <= 0 ? 'JOINED TODAY' : `${days} ${days === 1 ? 'DAY' : 'DAYS'}`}
            </span>
          </span>
        </button>

        <span className="rline__stamps">
          <Stamp word={mood.label.toUpperCase()} category="mood" seedId={f.id + 'm'} size="sm" />
          <Stamp word={dev.label.toUpperCase()} category="trajectory" seedId={f.id + 'd'} size="sm" />
          {feel && (
            <Stamp word={feel.label.toUpperCase()} category="scouting" seedId={f.id + 'f'} size="sm" />
          )}
        </span>

        {/* the tier checklist — one pencil check */}
        <span className="rline__tiers" role="radiogroup" aria-label="Hierarchy">
          {TIER_ORDER.map((t) => (
            <button
              key={t}
              role="radio"
              aria-checked={entry.tier === t}
              aria-label={TIER_META[t].name}
              className={'rline__box' + (entry.tier === t ? ' rline__box--checked' : '')}
              onClick={() => setTier(f.id, t as HierarchyTier)}
            >
              <span className="rline__box-square" aria-hidden="true">
                {entry.tier === t && <PencilCheck seedId={f.id + t} />}
              </span>
              {TIER_META[t].short.charAt(0)}
            </button>
          ))}
        </span>
      </div>

      <div className="rline__bottom">
        {feel && <span className="rline__feelnote">{feel.blurb}</span>}
        {f.visibleTraits.length === 0 ? (
          <span className="rline__notrait">no obvious traits yet</span>
        ) : (
          <span className="rline__traits">
            {f.visibleTraits.map((t) => (
              <Stamp key={t} word={TRAITS[t].name.toUpperCase()} category="scouting" seedId={f.id + t} size="sm" />
            ))}
          </span>
        )}

        <span className="rline__acts">
          {entry.hasLocker ? (
            <>
              <span className="rline__orders">
                <button
                  className="rline__orders-btn"
                  onClick={() => setOrdersOpen((o) => !o)}
                  aria-expanded={ordersOpen}
                  aria-label={`Training orders for ${fighterFullName(f)}: ${focusLabel}`}
                >
                  {focusLabel}
                </button>
                {ordersOpen && (
                  <OrdersCard
                    entry={entry}
                    slotsFull={slotsFull}
                    onPick={(v) => {
                      setFocus(f.id, v);
                      setOrdersOpen(false);
                    }}
                    onClose={() => setOrdersOpen(false)}
                  />
                )}
              </span>
              <button
                className="rline__keytag rline__keytag--take"
                disabled={noLockerFull}
                onClick={() => setLocker(f.id, false)}
              >
                TAKE LOCKER
                {noLockerFull && <span className="rline__reason">NO ROOM ON THE BENCH</span>}
              </button>
            </>
          ) : (
            <>
              <span className="rline__limited">NO LOCKER — LIMITED TRAINING</span>
              <button
                className="rline__keytag"
                disabled={lockersFull}
                onClick={() => setLocker(f.id, true)}
              >
                <span className="rline__key" aria-hidden="true" />
                GIVE LOCKER
                {lockersFull && <span className="rline__reason">EVERY LOCKER IS FULL</span>}
              </button>
            </>
          )}

          {striking ? (
            <span className="rline__verdict">
              <button
                className="rline__stampbtn rline__stampbtn--release"
                onClick={() => {
                  if (entry.hasLocker) cutFighter(f.id);
                  else stopConsidering(f.id);
                }}
              >
                {entry.hasLocker ? 'RELEASED' : 'PASSED ON'}
              </button>
              <button className="rline__stampbtn rline__stampbtn--keep" onClick={() => setStriking(false)}>
                KEEP
              </button>
            </span>
          ) : (
            <button
              className="rline__strike"
              onClick={() => setStriking(true)}
              aria-label={entry.hasLocker ? `Cut ${fighterFullName(f)} from the gym` : `Pass on ${fighterFullName(f)}`}
            >
              ✕
            </button>
          )}
        </span>
      </div>
    </li>
  );
}

/** graphite check, seeded wobble */
function PencilCheck({ seedId }: { seedId: string }) {
  const j = seedRange(seedId, -1.5, 1.5, 5);
  return (
    <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true">
      <path
        d={`M 2.5 ${8.5 + j} L 6.5 ${12.5 + j / 2} L 13.5 ${2.5 - j / 2}`}
        stroke="var(--ink-graphite)"
        strokeWidth="2.4"
        fill="none"
        strokeLinecap="round"
        filter="url(#pencil-wobble)"
      />
    </svg>
  );
}

/* TRAINING ORDERS, CARD 7-A — the >7-option checklist card */
function OrdersCard({
  entry,
  slotsFull,
  onPick,
  onClose,
}: {
  entry: RosterEntry;
  slotsFull: boolean;
  onPick: (v: TrainingFocus | null) => void;
  onClose: () => void;
}) {
  const focusDisabled = slotsFull && entry.focus === null;
  const options: Array<{ v: TrainingFocus | null; label: string; isFocus: boolean }> = [
    { v: null, label: 'GENERAL TRAINING', isFocus: false },
    { v: 'rounded' as TrainingFocus, label: 'FOCUS — WELL-ROUNDED', isFocus: true },
    ...ATTR_KEYS.map((k) => ({
      v: k as TrainingFocus,
      label: `FOCUS — ${ATTR_LABELS[k].toUpperCase()}`,
      isFocus: true,
    })),
  ];
  return (
    <span className="orders on-paper" role="radiogroup" aria-label="Training orders">
      <span className="orders__formno" aria-hidden="true">
        TRAINING ORDERS — CARD 7-A REV. 6/73
      </span>
      {options.map((o) => {
        const active = (entry.focus ?? null) === o.v;
        const dusty = o.isFocus && focusDisabled && !active;
        return (
          <button
            key={String(o.v)}
            role="radio"
            aria-checked={active}
            className={'orders__line' + (dusty ? ' orders__line--dusty' : '')}
            disabled={dusty}
            onClick={() => onPick(o.v)}
          >
            <span className="orders__box" aria-hidden="true">
              {active && <PencilCheck seedId={entry.fighter.id + String(o.v)} />}
            </span>
            {dusty ? 'ALL SLOTS FILLED — SEE HOOK BOARD' : o.label}
          </button>
        );
      })}
      <button className="orders__file" onClick={onClose}>
        FILE IT AWAY
      </button>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* THE PROGRESS BOOK — development                                     */
/* ------------------------------------------------------------------ */

function ProgressBook({ onPutDown }: { onPutDown: () => void }) {
  const { save, openProfile } = useGame();
  if (!save) return null;
  const sorted = [...save.roster].sort(
    (a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier),
  );

  return (
    <Held label="The Progress Book" className="lr-held--book" onPutDown={onPutDown}>
      <div className="pbook on-paper">
        <div className="pbook__scroll">
          <table className="pbook__table">
            <thead>
              <tr className="pbook__headrow">
                <th className="pbook__h pbook__h-name">FIGHTER</th>
                <th className="pbook__h">TRAJECTORY</th>
                <th className="pbook__h">FEEL</th>
                {ATTR_KEYS.map((k) => (
                  <th className="pbook__h pbook__h-attr" key={k} title={ATTR_LABELS[k]}>
                    {ATTR_SHORT[k]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={10} className="pbook__nobody">
                    nothing charted yet
                  </td>
                </tr>
              ) : (
                sorted.map((entry) => {
                  const f = entry.fighter;
                  const dev = developmentState(entry);
                  const feel = entry.hasLocker && f.growthKnown ? devFeel(f.growth) : null;
                  return (
                    <tr className="pbook__row" key={f.id}>
                      <td className="pbook__cell pbook__cell-name">
                        <button className="pbook__open" onClick={() => openProfile(f.id)}>
                          {fighterFullName(f)}
                        </button>
                      </td>
                      <td className="pbook__cell">
                        <Stamp word={dev.label.toUpperCase()} category="trajectory" seedId={f.id + 'd'} size="sm" />
                      </td>
                      <td className="pbook__cell">
                        {feel ? (
                          <Stamp word={feel.label.toUpperCase()} category="scouting" seedId={f.id + 'f'} size="sm" />
                        ) : (
                          <span className="pbook__dash">—</span>
                        )}
                      </td>
                      {entry.hasLocker ? (
                        ATTR_KEYS.map((k) => {
                          const tr = attributeTrend(entry, k, save.dayCount);
                          return (
                            <td className="pbook__cell pbook__cell-num" key={k}>
                              <span className="pbook__num">{Math.round(f.attributes[k])}</span>
                              {tr.dir && (
                                <PencilTick dir={tr.dir} seedId={f.id + k} />
                              )}
                            </td>
                          );
                        })
                      ) : (
                        <td className="pbook__cell pbook__limited" colSpan={7}>
                          NO LOCKER — LIMITED TRAINING
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <p className="pbook__footnote">
          arrows show recent form — lockerless men train in limited mode, give a man a locker to
          chart him properly
        </p>
      </div>
    </Held>
  );
}

/** a short pencil up/down tick — shape carries direction */
function PencilTick({ dir, seedId }: { dir: 'up' | 'down'; seedId: string }) {
  const j = seedRange(seedId, -1, 1, 6);
  return (
    <svg className="pbook__tick" viewBox="0 0 10 12" width="10" height="12" aria-label={dir === 'up' ? 'rising' : 'falling'}>
      <path
        d={dir === 'up' ? `M 2 ${9 + j} L 8 ${3 + j} M 8 ${3 + j} l -3 0 M 8 ${3 + j} l 0 3` : `M 2 ${3 + j} L 8 ${9 + j} M 8 ${9 + j} l -3 0 M 8 ${9 + j} l 0 -3`}
        stroke={dir === 'up' ? 'var(--ink-graphite)' : 'var(--ink-stamp-red)'}
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
