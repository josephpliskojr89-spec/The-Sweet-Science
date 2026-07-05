/*
  FighterProfile — the manila folder
  --------------------------------------------------------------------------
  OBJECT SHOT, office desk: the player has pulled this man's folder from the
  filing cabinet and dropped it open on the blotter. Left flap: photograph
  paper-clipped to the FIGHTER REGISTRATION card, status stamps, pencil
  patience line. Right flap: the sheet stack under die-cut dividers —
  assessment, fight-record form, biography, career continuation sheet, the
  progress chart. Decisions are stamps; the standing list is a printed
  checklist with one pencil check; the training slip lifts CARD 7-A.

  The filing-drawer sliver top-left is the way back (Esc files the folder).
  His locker-request note deals in on top but ONE CLICK slides it to the
  margin where it stays visibly pending (DESIGN-BIBLE A4) — reading is never
  blocked. Trait chips, meters, tab strips, and native selects are gone.
*/

import { useEffect, useState } from 'react';
import { useGame, lockersUsed, noLockerUsed } from '../state/GameContext';
import { TIER_META, TIER_ORDER, type HierarchyTier } from '../game/roster';
import { fighterFullName, fighterAge } from '../game/fighters';
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
import { moodLabel } from '../game/relationship';
import { coachChemistry, chemistryRead, specialtyName } from '../game/coaches';
import { scoutingBand, patienceFlavor } from '../game/scouting';
import { flightRiskRead } from '../game/reputation';
import { formatDate } from '../game/time';
import { fighterBiography, careerTimeline, yearsWithGymLabel } from '../game/biography';
import type { RosterEntry } from '../game/roster';
import type { GameSave } from '../state/persistence';
import { Portrait } from '../assets/portraits';
import { Stamp } from '../kit/Stamp';
import { PencilCheck } from '../kit/PencilCheck';
import { OrdersCard } from '../kit/OrdersCard';
import { paperTilt, seedRange } from '../kit/seed';
import './FighterProfile.css';

const signed = (n: number) => `${n >= 0 ? '+' : '−'}${Math.abs(n).toFixed(1)}`;

type ProfileTab = 'overview' | 'record' | 'biography' | 'career' | 'development';

const TABS: { key: ProfileTab; label: string; lockerOnly?: boolean }[] = [
  { key: 'overview', label: 'ASSESSMENT' },
  { key: 'record', label: 'RECORD' },
  { key: 'biography', label: 'BIOGRAPHY' },
  { key: 'career', label: 'CAREER' },
  { key: 'development', label: 'PROGRESS', lockerOnly: true },
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
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [noteAside, setNoteAside] = useState(false);

  useEffect(() => {
    setConfirmingCut(false);
    setTab('overview');
    setOrdersOpen(false);
    setNoteAside(false);
  }, [profileId]);

  // Esc: file the orders card, then the folder — unless the walk-in viewer
  // is layered above us.
  useEffect(() => {
    if (!profileId || viewerIds !== null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (ordersOpen) setOrdersOpen(false);
      else closeProfile();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [profileId, viewerIds, closeProfile, ordersOpen]);

  if (!save || !profileId) return null;
  const entry = save.roster.find((e) => e.fighter.id === profileId);
  if (!entry) return null;

  const f = entry.fighter;
  const cls = WEIGHT_CLASSES[f.weightClass];
  const home = getCity(f.homeCityId);
  const dev = developmentState(entry);
  const feel = entry.hasLocker && f.growthKnown ? devFeel(f.growth) : null;
  const lockersFull = lockersUsed(save) >= lockerCap;
  const noLockerFull = noLockerUsed(save) >= noLockerCap;
  const days = save.dayCount - entry.joinedDayCount;
  const weeks = Math.max(0, Math.floor(days / 7));
  const shownTab: ProfileTab = tab === 'development' && !entry.hasLocker ? 'overview' : tab;
  const flight = entry.hasLocker ? flightRiskRead(entry.poachInterest) : null;
  const tabName = `${f.lastName.toUpperCase()}, ${f.firstName.charAt(0).toUpperCase()}.`;

  return (
    <div className="fshot" role="dialog" aria-label={fighterFullName(f)}>
      {/* the way back: the open drawer this folder came from */}
      <button className="fshot__drawer" onClick={closeProfile} aria-label="File the folder — back to the Locker Room (Esc)">
        <span className="fshot__drawer-face" aria-hidden="true">
          <span className="fshot__drawer-label">ROSTER — ACTIVE</span>
          <span className="fshot__drawer-gap" />
        </span>
      </button>

      <article className="ffolder" style={paperTilt(f.id, 0.8, 3)}>
        {/* the folder's edge tab */}
        <span className="ffolder__nametab" aria-hidden="true">
          {tabName}
        </span>

        {/* die-cut dividers along the top edge */}
        <nav className="ffolder__tabs" aria-label="Folder sections">
          {TABS.map((t, i) => {
            const locked = t.lockerOnly && !entry.hasLocker;
            return (
              <button
                key={t.key}
                className={
                  'ffolder__tab' +
                  (shownTab === t.key ? ' ffolder__tab--held' : '') +
                  (locked ? ' ffolder__tab--dusty' : '') +
                  (i === 2 ? ' ffolder__tab--dogear' : '')
                }
                onClick={() => setTab(t.key)}
                disabled={locked}
                title={locked ? 'Give him a locker to chart his development' : undefined}
              >
                {t.label}
              </button>
            );
          })}
        </nav>

        {/* pink flight-risk memo breaking the silhouette */}
        {flight && (
          <div
            className="ffolder__memo"
            style={paperTilt(f.id + 'memo', 2, 2)}
            title="Other gyms have noticed he's unhappy. Mend the relationship or you may lose him."
          >
            <span className="ffolder__memo-head" aria-hidden="true">
              WHILE YOU WERE OUT
            </span>
            <span className="ffolder__memo-line">{flight.label.toUpperCase()}</span>
            <span className="ffolder__memo-line ffolder__memo-line--fine">
              other gyms have noticed — mend it or lose him
            </span>
            <Stamp word="FLIGHT RISK" category="trajectory" seedId={f.id + 'fl'} size="sm" />
          </div>
        )}

        {/* left flap: the registration card */}
        <div className="ffolder__left">
          <div className="regcard on-paper">
            <span className="regcard__formno" aria-hidden="true">
              FIGHTER REGISTRATION — FORM 3-A REV. 6/73
            </span>
            <div className="regcard__photo" style={paperTilt(f.id + 'ph', 2, 1)}>
              <Portrait appearance={f.appearance} size={148} />
              <span className="regcard__clip" aria-hidden="true" />
            </div>
            <h2 className="regcard__name">
              {f.lastName.toUpperCase()}, {f.firstName.toUpperCase()}
              {f.nickname && <span className="regcard__nick"> — “{f.nickname}”</span>}
            </h2>
            <dl className="regcard__fields">
              <div>
                <dt>AGE</dt>
                <dd>{fighterAge(f)}</dd>
              </div>
              <div>
                <dt>HT.</dt>
                <dd>{formatHeight(f.heightInches)}</dd>
              </div>
              <div>
                <dt>WT.</dt>
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
            </dl>

            <div className="regcard__status">
              {entry.hasLocker ? (
                <Stamp word="LOCKER" category="scouting" seedId={f.id + 'lk'} size="md" />
              ) : (
                <Stamp word="TRIAL — NO LOCKER" category="trajectory" seedId={f.id + 'tr'} size="md" />
              )}
              <Stamp
                word={moodLabel(entry).label.toUpperCase()}
                category="mood"
                seedId={f.id + 'md'}
                size="sm"
              />
              <span className="regcard__tenure">
                {days <= 0 ? 'JOINED TODAY' : `IN GYM ${days} ${days === 1 ? 'DAY' : 'DAYS'}`}
              </span>
              {!entry.hasLocker && (
                <span className="regcard__patience">{patienceFlavor(entry.trialPatience)}</span>
              )}
            </div>
          </div>
        </div>

        {/* right flap: the active sheet */}
        <div className="ffolder__right" key={shownTab}>
          {shownTab === 'overview' && (
            <AssessmentSheet
              entry={entry}
              save={save}
              feel={feel}
              dev={dev}
              lockersFull={lockersFull}
              noLockerFull={noLockerFull}
              confirmingCut={confirmingCut}
              setConfirmingCut={setConfirmingCut}
              ordersOpen={ordersOpen}
              setOrdersOpen={setOrdersOpen}
              onSetTier={(t) => setTier(f.id, t)}
              onSetFocus={(v) => setFocus(f.id, v)}
              onSetTrainer={(id) => setTrainer(f.id, id)}
              onLocker={(give) => setLocker(f.id, give)}
              onCut={() => (entry.hasLocker ? cutFighter(f.id) : stopConsidering(f.id))}
            />
          )}
          {shownTab === 'record' && <RecordSheet entry={entry} save={save} />}
          {shownTab === 'biography' && <BiographySheet entry={entry} save={save} />}
          {shownTab === 'career' && <CareerSheet entry={entry} save={save} />}
          {shownTab === 'development' && (
            <ProgressChart entry={entry} save={save} weeks={weeks} />
          )}
        </div>

        {/* his note, lying on the folder — one click sets it aside (A4) */}
        {!entry.hasLocker && entry.lockerRequested && (
          <div
            className={'reqnote' + (noteAside ? ' reqnote--aside' : '')}
            role="group"
            aria-label="He's asking about a locker"
          >
            <p className="reqnote__quote">
              “Coach, I’ve been here every night for months. Do you see a future for me here,
              or am I wasting my time?”
            </p>
            <div className="reqnote__slip on-paper">
              <span className="reqnote__slip-head" aria-hidden="true">
                RESPONSE — STAMP ONE
              </span>
              <button
                className="reqnote__stamp reqnote__stamp--give"
                disabled={lockersFull}
                onClick={() => respondLockerRequest(f.id, 'grant')}
              >
                LOCKER
                {lockersFull && <span className="reqnote__reason">EVERY LOCKER FULL</span>}
              </button>
              <button className="reqnote__stamp" onClick={() => respondLockerRequest(f.id, 'wait')}>
                KEEP WAITING
              </button>
              <button
                className="reqnote__stamp reqnote__stamp--no"
                onClick={() => respondLockerRequest(f.id, 'honest')}
              >
                NO ROOM
              </button>
            </div>
            {!noteAside && (
              <button className="reqnote__aside" onClick={() => setNoteAside(true)}>
                SET IT ASIDE FOR NOW
              </button>
            )}
          </div>
        )}
      </article>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* ASSESSMENT SHEET — attributes, observations, standing, training     */
/* ------------------------------------------------------------------ */

function AssessmentSheet({
  entry,
  save,
  feel,
  dev,
  lockersFull,
  noLockerFull,
  confirmingCut,
  setConfirmingCut,
  ordersOpen,
  setOrdersOpen,
  onSetTier,
  onSetFocus,
  onSetTrainer,
  onLocker,
  onCut,
}: {
  entry: RosterEntry;
  save: GameSave;
  feel: { label: string; tone: string; blurb: string } | null;
  dev: { label: string; tone: string };
  lockersFull: boolean;
  noLockerFull: boolean;
  confirmingCut: boolean;
  setConfirmingCut: (b: boolean) => void;
  ordersOpen: boolean;
  setOrdersOpen: (b: boolean) => void;
  onSetTier: (t: HierarchyTier) => void;
  onSetFocus: (v: TrainingFocus | null) => void;
  onSetTrainer: (id: string | null) => void;
  onLocker: (give: boolean) => void;
  onCut: () => void;
}) {
  const f = entry.fighter;
  const days = save.dayCount - entry.joinedDayCount;
  const slotsFull =
    save.roster.filter((e) => e.focus !== null).length >=
    FOCUS_SLOTS_BASE + save.coaches.reduce((n, c) => n + c.slots, 0);

  return (
    <div className="sheet on-paper">
      <header className="sheet__head">
        <span className="sheet__title">{entry.hasLocker ? 'ASSESSMENT' : 'TRIAL ASSESSMENT'}</span>
        <span className="sheet__stamps">
          {!entry.hasLocker && <Stamp word="LIMITED" category="trajectory" seedId={f.id + 'lim'} size="sm" />}
          {feel && (
            <span title={feel.blurb}>
              <Stamp word={feel.label.toUpperCase()} category="scouting" seedId={f.id + 'fe'} size="sm" />
            </span>
          )}
          <Stamp word={dev.label.toUpperCase()} category="trajectory" seedId={f.id + 'dv'} size="sm" />
        </span>
      </header>

      {/* the printed scales */}
      <div className="scales">
        {ATTR_KEYS.map((k: AttrKey) => {
          const val = f.attributes[k];
          if (entry.hasLocker) {
            const tr = attributeTrend(entry, k, save.dayCount);
            const word =
              tr.totalChange >= 0.05 ? 'coming on' : tr.totalChange <= -0.05 ? 'slipping' : '';
            return (
              <div
                className="scale"
                key={k}
                title={`${signed(tr.windowChange)} recent · ${signed(tr.totalChange)} since he arrived`}
              >
                <span className="scale__label">{ATTR_LABELS[k].toUpperCase()}</span>
                <span className="scale__num">{Math.round(val)}</span>
                <span className="scale__rule">
                  <PencilStroke widthPct={val} seedId={f.id + k} />
                </span>
                <span className="scale__word">{word}</span>
              </div>
            );
          }
          const band = scoutingBand(val, days);
          return (
            <div className="scale" key={k}>
              <span className="scale__label">{ATTR_LABELS[k].toUpperCase()}</span>
              <span className="scale__num scale__num--band">
                {band.label ? band.label.toUpperCase() : '?'}
              </span>
              <span className="scale__rule">
                {band.label && (
                  <span
                    className="scale__hatch"
                    style={{ width: `${Math.round(band.fill * 100)}%` }}
                    aria-hidden="true"
                  />
                )}
              </span>
              <span className="scale__word" />
            </div>
          );
        })}
      </div>
      <p className="sheet__pencil">“{f.ceilingRead}”</p>
      {!entry.hasLocker && (
        <p className="sheet__fineprint">
          COACH'S EYE ONLY — NOT A MEASUREMENT. ASSIGN LOCKER FOR FULL ASSESSMENT.
        </p>
      )}

      {/* OBSERVATIONS */}
      <section className="obs">
        <h3 className="sheet__subhead">OBSERVATIONS</h3>
        {f.visibleTraits.length === 0 ? (
          <p className="obs__pencil">nothing obvious yet — time will tell</p>
        ) : (
          <ul className="obs__list">
            {f.visibleTraits.map((t, i) => (
              <li className="obs__entry" key={t} style={{ opacity: 0.9 + ((i * 7) % 10) / 100 }}>
                <span className="obs__trait">{TRAITS[t].name.toUpperCase()}</span>
                <span className="obs__blurb">{TRAITS[t].blurb}</span>
              </li>
            ))}
          </ul>
        )}
        {f.hiddenTraits.length > 0 && (
          <p className="obs__pencil">more to this man than he's shown</p>
        )}
      </section>

      {/* STANDING checklist */}
      <section className="standing">
        <h3 className="sheet__subhead">STANDING</h3>
        <div className="standing__list" role="radiogroup" aria-label="Hierarchy">
          {TIER_ORDER.map((t) => (
            <button
              key={t}
              role="radio"
              aria-checked={entry.tier === t}
              className="standing__line"
              title={TIER_META[t].blurb}
              onClick={() => onSetTier(t as HierarchyTier)}
            >
              <span className="standing__box" aria-hidden="true">
                {entry.tier === t && <PencilCheck seedId={f.id + t} />}
              </span>
              {TIER_META[t].name.toUpperCase()}
            </button>
          ))}
        </div>
      </section>

      {/* TRAINING ASSIGNMENT slip */}
      <section className="tslip">
        <h3 className="sheet__subhead">TRAINING ASSIGNMENT</h3>
        {entry.hasLocker ? (
          <>
            <span className="tslip__orders">
              <span className="tslip__printed">FOCUS:</span>
              <button
                className="tslip__line"
                onClick={() => setOrdersOpen(!ordersOpen)}
                aria-expanded={ordersOpen}
              >
                {entry.focus === null ? 'GEN. TRAINING' : focusLabel(entry.focus).toUpperCase()}
              </button>
              {ordersOpen && (
                <OrdersCard
                  entry={entry}
                  slotsFull={slotsFull}
                  onPick={(v) => {
                    onSetFocus(v);
                    setOrdersOpen(false);
                  }}
                  onClose={() => setOrdersOpen(false)}
                />
              )}
            </span>

            {entry.focus !== null && (
              <TrainerChecklist entry={entry} save={save} onSetTrainer={onSetTrainer} />
            )}
          </>
        ) : (
          <p className="tslip__struck">NO LOCKER — LIMITED TRAINING</p>
        )}

        {/* the action line: stamps */}
        <div className="tslip__actions">
          {entry.hasLocker ? (
            <button className="tslip__stamp tslip__stamp--violet" disabled={noLockerFull} onClick={() => onLocker(false)}>
              PULL LOCKER
              {noLockerFull && <span className="tslip__reason">NO ROOM OFF THE WALL</span>}
            </button>
          ) : (
            <button className="tslip__stamp tslip__stamp--violet" disabled={lockersFull} onClick={() => onLocker(true)}>
              ASSIGN LOCKER
              {lockersFull && <span className="tslip__reason">EVERY LOCKER FULL</span>}
            </button>
          )}

          {confirmingCut ? (
            <span className="tslip__confirm">
              <span className="tslip__confirm-q">STRIKE FROM ROSTER? —</span>
              <button className="tslip__stamp tslip__stamp--red" onClick={onCut}>
                {entry.hasLocker ? 'RELEASED' : 'PASSED ON'}
              </button>
              <button className="tslip__stamp" onClick={() => setConfirmingCut(false)}>
                CANCEL
              </button>
            </span>
          ) : (
            <button className="tslip__stamp tslip__stamp--red tslip__stamp--faint" onClick={() => setConfirmingCut(true)}>
              {entry.hasLocker ? 'RELEASED' : 'PASSED ON'}
            </button>
          )}
        </div>
      </section>
    </div>
  );
}

/** the inline printed trainer checklist (≤7 options → checklist, A13) */
function TrainerChecklist({
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
    <div className="trainers" role="radiogroup" aria-label="Trainer">
      <span className="tslip__printed">TRAINER:</span>
      <button
        role="radio"
        aria-checked={entry.coachId === null}
        className={'trainers__line' + (mgrFree === 0 && entry.coachId !== null ? ' trainers__line--dusty' : '')}
        disabled={mgrFree === 0 && entry.coachId !== null}
        onClick={() => onSetTrainer(null)}
      >
        <span className="orders__box" aria-hidden="true">
          {entry.coachId === null && <PencilCheck seedId={f.id + 'you'} />}
        </span>
        YOU — {mgrFree} FREE
      </button>
      {save.coaches.map((c) => {
        const used = save.roster.filter((x) => x.focus !== null && x.coachId === c.id).length;
        const free = Math.max(0, c.slots - used + (entry.coachId === c.id ? 1 : 0));
        const dusty = free === 0 && entry.coachId !== c.id;
        return (
          <button
            key={c.id}
            role="radio"
            aria-checked={entry.coachId === c.id}
            className={'trainers__line' + (dusty ? ' trainers__line--dusty' : '')}
            disabled={dusty}
            onClick={() => onSetTrainer(c.id)}
          >
            <span className="orders__box" aria-hidden="true">
              {entry.coachId === c.id && <PencilCheck seedId={f.id + c.id} />}
            </span>
            {c.name.toUpperCase()} ({specialtyName(c.specialty).toUpperCase()}) —{' '}
            {dusty ? 'FULL' : `${free} FREE`}
          </button>
        );
      })}
      {chem && assigned && (
        <p className="trainers__chem">
          <strong>{chem.label.toUpperCase()}</strong>{' '}
          <span className="trainers__chem-pencil">— he and {assigned.name.split(' ')[0]}, we'll see</span>
        </p>
      )}
    </div>
  );
}

/** flat-ended grease-pencil stroke, exactly proportional */
function PencilStroke({ widthPct, seedId }: { widthPct: number; seedId: string }) {
  const j = seedRange(seedId, -0.6, 0.6, 2);
  return (
    <svg viewBox="0 0 100 8" preserveAspectRatio="none" aria-hidden="true">
      <line
        x1="1"
        y1={4 + j}
        x2={Math.max(2, widthPct)}
        y2={4 - j}
        stroke="var(--ink-graphite)"
        strokeWidth="4"
        filter="url(#pencil-wobble)"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* RECORD — FORM 7-B                                                   */
/* ------------------------------------------------------------------ */

function RecordSheet({ entry, save }: { entry: RosterEntry; save: GameSave }) {
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
    { label: 'AMATEUR', value: 'UNRECORDED' },
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
      value: `$${Math.round(entry.careerEarnings ?? 0).toLocaleString('en-US')}.00`,
    },
  ];
  return (
    <div className="sheet on-paper">
      <header className="sheet__head">
        <span className="sheet__title">FIGHT RECORD</span>
        <span className="sheet__formno">FORM 7-B REV. 3/71</span>
      </header>
      <div className="recform">
        {cells.map((c) => (
          <div className="recform__box" key={c.label}>
            <span className="recform__caption">{c.label}</span>
            <span className="recform__value">{c.value}</span>
          </div>
        ))}
      </div>
      <div className="boutledger">
        <div className="boutledger__head">
          <span>DATE</span>
          <span>OPPONENT</span>
          <span>RESULT</span>
          <span>PURSE</span>
        </div>
        {entry.bouts.map((b, i) => {
          const d = formatDate(b.dayCount);
          const how =
            b.method === 'KO' || b.method === 'TKO'
              ? `${b.outcome} ${b.method} ${b.endRound}`
              : b.method === 'DRAW'
                ? 'DRAW'
                : `${b.outcome} ${b.method}`;
          return (
            <div className="boutledger__row" key={i}>
              <span>
                {d.month.slice(0, 3)} {d.day} ’{String(d.year).slice(2)}
              </span>
              <span>{b.opponentName.toUpperCase()}</span>
              <span>{how}</span>
              <span>${Math.round(b.purse).toLocaleString('en-US')}</span>
            </div>
          );
        })}
        {Array.from({ length: Math.max(0, 7 - entry.bouts.length) }, (_, i) => (
          <div className="boutledger__rule" key={`r${i}`} />
        ))}
      </div>
      <p className="sheet__fineprint">
        RECORD ALL BOUTS AS FOUGHT. RANKINGS, TITLES, AND PURSES ENTERED ON SETTLEMENT.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* BIOGRAPHY / CAREER / PROGRESS                                       */
/* ------------------------------------------------------------------ */

function BiographySheet({ entry, save }: { entry: RosterEntry; save: GameSave }) {
  const paras = fighterBiography(entry, save.dayCount);
  return (
    <div className="sheet on-paper">
      <header className="sheet__head">
        <span className="sheet__title">BIOGRAPHY</span>
      </header>
      <div className="bio">
        {paras.map((p, i) => {
          const quote = p.startsWith('In his own words');
          const impression = p.startsWith('Your first read');
          if (impression) {
            return (
              <p className="bio__pencil" key={i}>
                {p}
              </p>
            );
          }
          return (
            <p className={'bio__para' + (quote ? ' bio__quote' : '')} key={i}>
              {p}
            </p>
          );
        })}
      </div>
    </div>
  );
}

function CareerSheet({ entry, save }: { entry: RosterEntry; save: GameSave }) {
  const moments = careerTimeline(entry, save.dayCount);
  const years = [...new Set(moments.map((m) => m.year))].sort((a, b) => a - b);
  return (
    <div className="sheet on-paper">
      <header className="sheet__head">
        <span className="sheet__title">CAREER — CONTINUATION SHEET</span>
      </header>
      <div className="careersheet">
        {years.map((y) => (
          <div className="careersheet__year" key={y}>
            <span className="careersheet__stamp">
              <Stamp word={String(y)} category="scouting" seedId={entry.fighter.id + y} size="sm" />
            </span>
            <ul className="careersheet__entries">
              {moments
                .filter((m) => m.year === y)
                .map((m, i) => (
                  <li className="careersheet__entry" key={i}>
                    {m.text}
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="sheet__fineprint">
        ENTER EACH MOMENT AS IT HAPPENS. CLIPPINGS TO BE TAPED BELOW THE LINE.
      </p>
    </div>
  );
}

function ProgressChart({ entry, save, weeks }: { entry: RosterEntry; save: GameSave; weeks: number }) {
  const f = entry.fighter;
  return (
    <div className="sheet sheet--chart on-paper">
      <header className="sheet__head">
        <span className="sheet__title">PROGRESS CHART</span>
        {entry.focus && (
          <span className="tslip__printed">FOCUS: {focusLabel(entry.focus).toUpperCase()}</span>
        )}
      </header>
      <div className="chart">
        {ATTR_KEYS.map((k: AttrKey) => {
          const series = attributeSeries(entry, k);
          const tr = attributeTrend(entry, k, save.dayCount);
          const word = tr.totalChange >= 0.05 ? 'coming on' : tr.totalChange <= -0.05 ? 'slipping' : 'holding';
          return (
            <div className="chart__row" key={k}>
              <span className="chart__label">{ATTR_LABELS[k].toUpperCase()}</span>
              <span className="chart__grid">
                <PencilTrace series={series} seedId={f.id + k} />
              </span>
              <span className="chart__now">{Math.round(f.attributes[k])}</span>
              <span className="chart__change">{signed(tr.totalChange)}</span>
              <span className="chart__word">{word}</span>
            </div>
          );
        })}
      </div>
      <p className="sheet__pencil">
        {weeks < 2
          ? 'not much to chart yet — give it a few weeks'
          : `traces run since he walked in ${weeks} weeks ago`}
      </p>
    </div>
  );
}

/** a grease-pencil trace across the printed grid */
function PencilTrace({ series, seedId }: { series: number[]; seedId: string }) {
  if (series.length < 2) {
    return (
      <svg viewBox="0 0 100 26" preserveAspectRatio="none" aria-hidden="true">
        <line x1="2" y1="13" x2="10" y2="13" stroke="var(--ink-graphite)" strokeWidth="2" />
      </svg>
    );
  }
  const min = Math.min(...series);
  const max = Math.max(...series);
  const span = Math.max(1, max - min);
  const pts = series
    .map((v, i) => {
      const x = 2 + (i / (series.length - 1)) * 96;
      const y = 22 - ((v - min) / span) * 18 + seedRange(seedId + i, -0.7, 0.7, 3);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  return (
    <svg viewBox="0 0 100 26" preserveAspectRatio="none" aria-hidden="true">
      <polyline
        points={pts}
        fill="none"
        stroke="var(--ink-graphite)"
        strokeWidth="2"
        strokeLinejoin="round"
        filter="url(#pencil-wobble)"
      />
    </svg>
  );
}
