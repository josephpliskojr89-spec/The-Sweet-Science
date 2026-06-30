/*
  GameContext
  --------------------------------------------------------------------------
  The single source of truth for the shell, the walk-in loop, and (Phase 4)
  roster management. Time advancement rolls walk-ins, ages the queue, and
  evaluates departures; the post-advance notice reports all three. Locker and
  hierarchy changes and cuts run through pure handlers.

  Purity note: all mutations are computed in event handlers (not inside
  setState updaters) using `saveRef` for the latest state, then committed once.
  Random rolls and side effects must never live in an updater — StrictMode
  double-invokes updaters, which would desync rolls from committed state.
*/

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { advance, formatDate, seasonOf, TIME_STEP_DAYS, type TimeStep } from '../game/time';
import { emitGameEvent } from '../game/events';
import { type Fighter, fighterFullName } from '../game/fighters';
import { getCity } from '../game/cities';
import { observeGym, type LogLine } from '../game/gymLog';
import { runLifeEvents } from '../game/lifeEvents';
import { runPressCycle, pressItem } from '../game/press';
import {
  trainFighter,
  snapshotAttrs,
  FOCUS_SLOTS_BASE,
  type TrainingFocus,
} from '../game/training';

/** Keep ~10 years of monthly progression snapshots per fighter. */
const MAX_HISTORY = 120;
/** A small gym can only carry so much staff. */
const MAX_COACHES = 4;
/** Pending coach applicants we'll hold at once. */
const MAX_APPLICANTS = 4;
/** Days a lockerless trialist must stick around before he'll force the locker
    question himself. Months in, not weeks — the request should feel earned. */
const LOCKER_REQUEST_DAYS = 84;
/** Rival-interest accrual per week at full flight risk, and how fast it cools
    when a man is settled again (6C-4). Tuned so sustained unhappiness in a
    competitive city telegraphs for weeks before anyone walks. */
const POACH_GAIN = 20;
const POACH_DECAY = 8;
/** How fast a cut-ruthlessness reputation penalty heals (per month), and its floor. */
const REP_RECOVER = 0.02;
const MAX_REP_PENALTY = -0.3;

const randInt = (lo: number, hi: number) => lo + Math.floor(Math.random() * (hi - lo + 1));
/** A fresh trialist's starting patience (days). Generous — a valued man can
    wait a few months before he stops waiting for a gym that wants him. */
const freshPatience = () => randInt(80, 150);

/** Focused fighters a given trainer is currently running. */
const usedByManager = (roster: { focus: unknown; coachId: string | null }[]) =>
  roster.filter((e) => e.focus !== null && e.coachId === null).length;
const usedByCoach = (
  roster: { focus: unknown; coachId: string | null }[],
  coachId: string,
) => roster.filter((e) => e.focus !== null && e.coachId === coachId).length;
import { rollNewWalkIns, ageWalkIns, type WalkIn } from '../game/walkins';
import { DEFAULT_TIER, type HierarchyTier, type RosterEntry } from '../game/roster';
import {
  initialRelationship,
  applyLockerTaken,
  applyLockerGranted,
  applyCutStayed,
  cutMoraleRipple,
  recover,
} from '../game/relationship';
import {
  evaluateDepartures,
  resolveCut,
  type Departure,
  type DepartureReason,
} from '../game/departures';
import {
  createSaveFromDraft,
  loadSave,
  writeSave,
  clearSave,
  savedGameExists,
  lockersUsed,
  noLockerUsed,
  lockerCapacity,
  noLockerCapacity,
  type GameSave,
  type NewGameDraft,
} from './persistence';
import {
  gymReputation,
  flightRiskScore,
  interestBand,
} from '../game/reputation';
import { advanceWorld } from '../game/world/worldSim';
import {
  walkInPoachChance,
  worldFighterFromFighter,
  pickWalkInPoacher,
  pickPoachDestination,
  cityCompetitiveness,
  type WorldFighter,
} from '../game/world/population';
import { WEIGHT_CLASSES } from '../game/weightClasses';
import { monthlySummary, formatMoney, upgradeCost } from '../game/economy';
import {
  rollCoachApplicants,
  ageApplicants,
  specialtyName,
  type CoachPosting,
} from '../game/coaches';
import {
  equipmentFactorFor,
  trackName,
  effectGain,
  type UpgradeKey,
} from '../game/upgrades';

export type Screen = 'home' | 'settings' | 'newgame' | 'game';
export type RoomKey = 'office' | 'calendar' | 'gym' | 'locker';
export type WalkInDecision = 'locker' | 'no_locker' | 'turn_away';

/** Gym reputation 0..1 — how known/regarded your gym is (game/reputation.ts),
    less any penalty from ruthless cuts. Drives the walk-in draw; ≈0 for a new
    gym, earned as your men make names. */
function reputationFor(save: GameSave): number {
  return Math.max(0, Math.min(1, gymReputation(save.roster) + save.reputationMod));
}

/** Reputation-driven quality of the walk-in pool. A respected gym draws better
    men; a new gym draws raw ones (floor near the old constant 0.2). */
function qualityFor(save: GameSave): number {
  return Math.max(0.18, Math.min(0.8, 0.18 + reputationFor(save) * 0.5));
}

/** A walk-in you didn't sign, taken by a named rival gym. */
export interface PoachEvent {
  fighter: Fighter;
  gymName: string;
}

export interface AdvanceNotice {
  arrived: Fighter[];
  expired: Fighter[];
  departed: Departure[];
  /** Prospects a rival signed out from under you while you deliberated (6C-3). */
  poached: PoachEvent[];
}

interface GameContextValue {
  screen: Screen;
  activeRoom: RoomKey | null;
  save: GameSave | null;
  canContinue: boolean;

  arrival: AdvanceNotice | null;
  viewerIds: string[] | null;
  viewerIndex: number;
  profileId: string | null;
  flash: string | null;

  goHome: () => void;
  openSettings: () => void;
  openNewGame: () => void;
  startGame: (draft: NewGameDraft) => void;
  continueGame: () => void;

  openRoom: (room: RoomKey) => void;
  closeRoom: () => void;

  advanceTime: (step: TimeStep) => void;

  viewArrivalsNow: () => void;
  dismissArrival: () => void;

  openWalkIns: (ids: string[], startIndex?: number) => void;
  closeWalkInViewer: () => void;
  decideWalkIn: (id: string, decision: WalkInDecision) => void;

  openProfile: (id: string) => void;
  closeProfile: () => void;
  setLocker: (id: string, hasLocker: boolean) => void;
  setTier: (id: string, tier: HierarchyTier) => void;
  setFocus: (id: string, focus: TrainingFocus | null) => void;
  setTrainer: (id: string, coachId: string | null) => void;
  cutFighter: (id: string) => void;
  /** Signal a lockerless trialist you won't be offering a spot — collapses his
      patience so he moves on, without ejecting him outright. */
  stopConsidering: (id: string) => void;
  /** Answer a lockerless man who's asked you for a locker. */
  respondLockerRequest: (id: string, choice: 'grant' | 'wait' | 'honest') => void;
  purchaseUpgrade: (key: UpgradeKey) => void;
  postCoachJob: (posting: CoachPosting) => void;
  cancelCoachJob: () => void;
  hireApplicant: (id: string) => void;
  passApplicant: (id: string) => void;
  fireCoach: (id: string) => void;
  clearFlash: () => void;

  lockerCap: number;
  noLockerCap: number;
  /** Focused-training slots available — the manager plus coaches. */
  focusCapacity: number;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<Screen>('home');
  const [activeRoom, setActiveRoom] = useState<RoomKey | null>(null);
  const [save, setSave] = useState<GameSave | null>(null);
  const [canContinue, setCanContinue] = useState<boolean>(() => savedGameExists());

  const [arrival, setArrival] = useState<AdvanceNotice | null>(null);
  const [viewerIds, setViewerIds] = useState<string[] | null>(null);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  // Latest save, readable synchronously in handlers so mutations stay pure.
  const saveRef = useRef<GameSave | null>(null);

  const commit = useCallback((next: GameSave) => {
    saveRef.current = next;
    setSave(next);
    writeSave(next);
    setCanContinue(true);
  }, []);

  const goHome = useCallback(() => {
    setActiveRoom(null);
    setArrival(null);
    setViewerIds(null);
    setProfileId(null);
    setFlash(null);
    setScreen('home');
    setCanContinue(savedGameExists());
  }, []);

  const openSettings = useCallback(() => setScreen('settings'), []);
  const openNewGame = useCallback(() => setScreen('newgame'), []);

  const startGame = useCallback(
    (draft: NewGameDraft) => {
      commit(createSaveFromDraft(draft));
      setActiveRoom(null);
      setScreen('game');
    },
    [commit],
  );

  const continueGame = useCallback(() => {
    const loaded = loadSave();
    if (!loaded) return;
    // Persist any migration done on load (e.g. a v17 world generated for an
    // older save) so it's stable from here on.
    writeSave(loaded);
    saveRef.current = loaded;
    setSave(loaded);
    setActiveRoom(null);
    setScreen('game');
  }, []);

  const openRoom = useCallback((room: RoomKey) => setActiveRoom(room), []);
  const closeRoom = useCallback(() => setActiveRoom(null), []);

  const advanceTime = useCallback(
    (step: TimeStep) => {
      const prev = saveRef.current;
      if (!prev) return;
      const days = TIME_STEP_DAYS[step];
      const fromDay = prev.dayCount;
      const toDay = advance(fromDay, step);
      const crossesMonth = formatDate(fromDay).month !== formatDate(toDay).month;

      // Pure computation, once, in the handler — not in an updater.
      const aged = ageWalkIns(prev.walkIns, days);
      const fresh = rollNewWalkIns(days, {
        cityId: prev.cityId,
        dayCount: fromDay,
        reputation: reputationFor(prev),
        quality: qualityFor(prev),
      });

      // Walk-in competition (6C-3): the men at your door aren't only yours to
      // sign. Waffle on a real prospect and a named local rival takes him; a man
      // whose patience finally runs out either gets snapped up (if he's good) or
      // simply gives up. Either way the winner has a name, and he joins their
      // stable — to surface later as their contender, your opponent, your regret.
      const comp = cityCompetitiveness(prev.cityId);
      const poached: PoachEvent[] = [];
      const poachedToWorld: WorldFighter[] = [];
      const stillWaiting: WalkIn[] = [];
      const gaveUp: WalkIn[] = [];
      const takeProspect = (w: WalkIn) => {
        const gym = pickWalkInPoacher(prev.cityId, qualityFor(prev));
        if (!gym) return false;
        poached.push({ fighter: w.fighter, gymName: gym.name });
        poachedToWorld.push(worldFighterFromFighter(w.fighter, gym.id));
        return true;
      };
      for (const w of aged.surviving) {
        if (Math.random() < walkInPoachChance(w.fighter.potential, comp, days) && takeProspect(w)) {
          continue;
        }
        stillWaiting.push(w);
      }
      for (const w of aged.expired) {
        // A genuine prospect left waiting gets signed by name; the rest move on.
        if (!(w.fighter.potential >= 60 && takeProspect(w))) gaveUp.push(w);
      }

      // The gym lives: moods recover, fighters develop on the floor (and age),
      // the floor gets observed (hidden traits can surface), and the fighters'
      // lives outside intrude — all before we see who's had enough and walked.
      const gymArchetype = getCity(prev.cityId).archetype;
      const equipment = equipmentFactorFor(prev.upgrades);
      // Each focused fighter develops under his assigned trainer (a coach or
      // the manager) — skill, specialty, and chemistry all in play.
      const coachById = new Map(prev.coaches.map((c) => [c.id, c]));
      const trainingNotes: string[] = [];
      let roster = prev.roster.map((e) => {
        const settled = recover(e, days);
        const coach = e.focus !== null && e.coachId ? coachById.get(e.coachId) ?? null : null;
        const t = trainFighter(settled, gymArchetype, days, equipment, coach);
        if (t.note) trainingNotes.push(t.note);
        return {
          ...settled,
          fighter: { ...settled.fighter, attributes: t.attributes },
          lastDelta: t.lastDelta,
        };
      });
      const obs = observeGym(roster, {
        days,
        fromDay,
        region: getCity(prev.cityId).region,
        season: seasonOf(toDay),
        crossesMonth,
      });
      roster = obs.roster;
      const life = runLifeEvents(roster, days);
      roster = life.roster;

      // Rival interest (6C-4): talented, unhappy locker holders get courted by
      // other gyms. Interest builds — with escalating warnings — before anyone
      // leaves, so losing a man here is a consequence you could see coming and
      // head off. Repair his morale/trust and the interest cools.
      const interestNotes: string[] = [];
      const interestHeadlines: string[] = [];
      const poachDepartures: Departure[] = [];
      const talentToWorld: WorldFighter[] = [];
      const afterInterest: RosterEntry[] = [];
      for (const e of roster) {
        if (!e.hasLocker) {
          afterInterest.push(e);
          continue;
        }
        const risk = flightRiskScore(e, comp, prev.reputationMod);
        const before = e.poachInterest;
        const next =
          risk > 0.12
            ? Math.min(100, before + risk * POACH_GAIN * (days / 7))
            : Math.max(0, before - POACH_DECAY * (days / 7));
        const name = fighterFullName(e.fighter);
        const bandUp = interestBand(next);
        if (bandUp > interestBand(before)) {
          if (bandUp === 1) {
            interestNotes.push(`A man nobody recognized stood ringside, watching ${name} work.`);
          } else if (bandUp === 2) {
            const suitor = pickPoachDestination(prev.cityId);
            const line = `Word around the gym: ${suitor?.name ?? 'another gym'} has been asking about ${name}.`;
            interestNotes.push(line);
            interestHeadlines.push(line);
          } else if (bandUp === 3) {
            interestNotes.push(`${name} took a call after practice and wouldn’t say from who.`);
          }
        }
        const leaveChance = next >= 80 ? Math.min(1, (next - 80) / 20) * 0.4 * (days / 7) : 0;
        const gym = leaveChance > 0 && Math.random() < leaveChance ? pickPoachDestination(prev.cityId) : null;
        if (gym) {
          poachDepartures.push({ entry: e, reason: 'left_for_opportunity', toGym: gym.name });
          talentToWorld.push(worldFighterFromFighter(e.fighter, gym.id));
          continue; // he's gone
        }
        afterInterest.push(next === before ? e : { ...e, poachInterest: next });
      }
      roster = afterInterest;

      const dep = evaluateDepartures(roster, days);
      const departedAll: Departure[] = [...poachDepartures, ...dep.departed];

      // A lockerless trialist who's stuck it out for months forces the question
      // himself — fires rarely, once per man, and surfaces as a request on his
      // profile (answered via respondLockerRequest).
      const requestChance = 1 - Math.pow(1 - 0.02, days);
      const requestNotes: string[] = [];
      const afterRequests = dep.staying.map((e) => {
        if (e.hasLocker || e.lockerRequested) return e;
        if (toDay - e.joinedDayCount < LOCKER_REQUEST_DAYS) return e;
        if (Math.random() >= requestChance) return e;
        requestNotes.push(
          `${fighterFullName(e.fighter)} stopped you on the floor — he wants to know if he has a future here.`,
        );
        return { ...e, lockerRequested: true };
      });

      // If you've got a posting out, coaches answer it over time (and the ones
      // who waited too long take other work).
      let coachApplicants = prev.coachApplicants;
      const coachNotes: string[] = [];
      if (prev.coachPosting) {
        const aged = ageApplicants(prev.coachApplicants, days);
        const fresh = rollCoachApplicants(days, prev.cityId, reputationFor(prev), prev.coachPosting);
        coachApplicants = [...aged.staying, ...fresh].slice(0, MAX_APPLICANTS);
        for (const a of fresh) {
          coachNotes.push(
            `A coach answered your ad — ${a.coach.name}, ${specialtyName(a.coach.specialty)}.`,
          );
        }
        for (const a of aged.left) {
          coachNotes.push(`${a.coach.name} got tired of waiting and took another job.`);
        }
      }

      // The paper runs on its own week, whether or not you read it.
      let press = prev.press;
      const cycles = Math.floor(toDay / 7) - Math.floor(fromDay / 7);
      for (let i = 0; i < cycles; i++) {
        press = runPressCycle(press, prev.cityId, toDay).state;
      }
      // Real events make the headlines: a rival signing the prospect you sat on
      // (6C-3), the courtship of one of your men, and his eventual departure (6C-4).
      for (const p of poached) {
        const cls = WEIGHT_CLASSES[p.fighter.weightClass].name.toLowerCase();
        press = pressItem(
          press,
          toDay,
          `${p.gymName} has signed ${fighterFullName(p.fighter)}, a ${p.fighter.age}-year-old ${cls}, after weeks of local interest.`,
        );
      }
      for (const line of interestHeadlines) press = pressItem(press, toDay, line);
      for (const d of poachDepartures) {
        const cls = WEIGHT_CLASSES[d.entry.fighter.weightClass].name.toLowerCase();
        press = pressItem(
          press,
          toDay,
          `${d.toGym} has lured ${fighterFullName(d.entry.fighter)} away — a ${cls} who'd grown unhappy where he was.`,
        );
      }

      // The competitive world moves on its own — ages, fights, signs, retires —
      // and absorbs the men you let slip: prospects (6C-3) and your own unhappy
      // talent (6C-4).
      let world = advanceWorld(prev.world, { days, toDay }).world;
      const joiners = [...poachedToWorld, ...talentToWorld];
      if (joiners.length) {
        world = { ...world, fighters: [...world.fighters, ...joiners] };
      }

      const newLines: LogLine[] = [
        ...coachNotes.slice(0, 2),
        ...trainingNotes.slice(0, 1),
        ...obs.lines,
        ...life.lines,
        ...requestNotes,
        ...interestNotes,
      ].map((text) => ({
        dayCount: toDay,
        text,
      }));
      const departureMemories = departedAll.map((d) => {
        const name = fighterFullName(d.entry.fighter);
        let text: string;
        if (d.reason === 'left_for_opportunity' && d.toGym)
          text = `${name} left for ${d.toGym}. He'd stopped believing you'd give him what he was worth.`;
        else if (d.reason === 'left_for_opportunity')
          text = `${name} left for a bigger operation. Someone noticed what you built in him.`;
        else if (d.reason === 'moved_on')
          text = `${name} stopped waiting for a gym that wanted him and moved on.`;
        else text = `${name} quit. He felt forgotten — and maybe he was.`;
        return { dayCount: toDay, text };
      });
      const poachMemories = poached.map((p) => ({
        dayCount: toDay,
        text: `${p.gymName} signed ${fighterFullName(p.fighter)} — the ${WEIGHT_CLASSES[
          p.fighter.weightClass
        ].name.toLowerCase()} you’d been weighing. You waited a beat too long.`,
      }));
      const history = [
        ...prev.history,
        ...[...obs.milestones, ...life.milestones].map((text) => ({ dayCount: toDay, text })),
        ...departureMemories,
        ...poachMemories,
      ].slice(-250);

      // Take a monthly progression snapshot of each fighter's attributes.
      const staying = crossesMonth
        ? afterRequests.map((e) => ({
            ...e,
            history: [...e.history, snapshotAttrs(e.fighter.attributes, toDay)].slice(-MAX_HISTORY),
          }))
        : afterRequests;

      // A ruthless-cut reputation penalty heals slowly as the gym lives it down.
      const reputationMod = Math.min(0, prev.reputationMod + REP_RECOVER * (days / 30));

      // Settle the books on the first of the month.
      let money = prev.money;
      let finances = prev.finances;
      if (crossesMonth) {
        const fd = formatDate(toDay);
        const sum = monthlySummary(staying, prev.upgrades, prev.coaches, fd.year);
        money = prev.money + sum.net;
        finances = [
          {
            dayCount: toDay,
            label: `${fd.month} ${fd.year}`,
            duesIncome: sum.duesIncome,
            overhead: sum.overhead,
            coachSalaries: sum.coachSalaries,
            net: sum.net,
            balance: money,
          },
          ...prev.finances,
        ].slice(0, 36);
      }

      commit({
        ...prev,
        dayCount: toDay,
        money,
        finances,
        reputationMod,
        coachApplicants,
        world,
        walkIns: [...stillWaiting, ...fresh],
        roster: staying,
        press,
        history,
        recentLog: [...newLines, ...prev.recentLog].slice(0, 12),
      });

      for (const d of departedAll) {
        emitGameEvent({
          type: d.reason === 'left_for_opportunity' ? 'fighter_left_for_opportunity' : 'fighter_quit',
          fighterId: d.entry.fighter.id,
        });
      }

      if (fresh.length || gaveUp.length || departedAll.length || poached.length) {
        setArrival({
          arrived: fresh.map((w) => w.fighter),
          expired: gaveUp.map((w) => w.fighter),
          departed: departedAll,
          poached,
        });
      }
    },
    [commit],
  );

  const openWalkIns = useCallback((ids: string[], startIndex = 0) => {
    if (!ids.length) return;
    setViewerIds(ids);
    setViewerIndex(startIndex);
  }, []);

  const viewArrivalsNow = useCallback(() => {
    const cur = arrival;
    if (cur && cur.arrived.length) {
      setViewerIds(cur.arrived.map((f) => f.id));
      setViewerIndex(0);
    }
    setArrival(null);
  }, [arrival]);

  const dismissArrival = useCallback(() => setArrival(null), []);
  const closeWalkInViewer = useCallback(() => setViewerIds(null), []);

  const decideWalkIn = useCallback(
    (id: string, decision: WalkInDecision) => {
      const prev = saveRef.current;
      if (!prev) return;
      const target = prev.walkIns.find((w) => w.fighter.id === id);
      if (!target) return;

      // Capacity guards (the UI also disables these, but never trust the UI).
      if (decision === 'locker' && lockersUsed(prev) >= lockerCapacity(prev)) {
        setFlash('Every locker is full. Free one before you give another.');
        return;
      }
      if (decision === 'no_locker' && noLockerUsed(prev) >= noLockerCapacity(prev)) {
        setFlash('No room to carry another fighter without a locker.');
        return;
      }

      const walkIns = prev.walkIns.filter((w) => w.fighter.id !== id);
      let roster = prev.roster;
      let history = prev.history;
      if (decision === 'locker' || decision === 'no_locker') {
        const hasLocker = decision === 'locker';
        const entry: RosterEntry = {
          fighter: target.fighter,
          hasLocker,
          tier: DEFAULT_TIER,
          joinedDayCount: prev.dayCount,
          ...initialRelationship(hasLocker),
          focus: null,
          coachId: null,
          trialPatience: freshPatience(),
          lockerRequested: false,
          poachInterest: 0,
          lastDelta: {},
          history: [snapshotAttrs(target.fighter.attributes, prev.dayCount)],
        };
        roster = [...prev.roster, entry];
        history = [
          ...prev.history,
          {
            dayCount: prev.dayCount,
            text: `${fighterFullName(target.fighter)} walked in off the street and you ${
              hasLocker ? 'gave him a locker' : 'let him train on provisional terms'
            }.`,
          },
        ].slice(-250);
        emitGameEvent({ type: 'walkin_accepted', fighterId: id, withLocker: hasLocker });
      } else {
        emitGameEvent({ type: 'walkin_turned_away', fighterId: id });
      }

      commit({ ...prev, walkIns, roster, history });
      setViewerIndex((i) => i + 1);
    },
    [commit],
  );

  // --- roster management ---------------------------------------------------

  const openProfile = useCallback((id: string) => setProfileId(id), []);
  const closeProfile = useCallback(() => setProfileId(null), []);
  const clearFlash = useCallback(() => setFlash(null), []);

  const purchaseUpgrade = useCallback(
    (key: UpgradeKey) => {
      const prev = saveRef.current;
      if (!prev) return;
      const level = prev.upgrades[key];
      const year = formatDate(prev.dayCount).year;
      const cost = upgradeCost(key, level, year);
      if (cost === null) {
        setFlash(`${trackName(key)} is already at the top of the line.`);
        return;
      }
      if (prev.money < cost) {
        setFlash(`You can’t afford that — it runs ${formatMoney(cost)}.`);
        return;
      }
      const gain = effectGain(key, level) ?? '';
      const upgrades = { ...prev.upgrades, [key]: level + 1 };
      const history = [
        ...prev.history,
        {
          dayCount: prev.dayCount,
          text: `You put ${formatMoney(cost)} into the gym — ${trackName(key).toLowerCase()} (${gain}).`,
        },
      ].slice(-250);
      commit({ ...prev, upgrades, money: prev.money - cost, history });
      setFlash(`Money well spent. ${trackName(key)}: ${gain}.`);
    },
    [commit],
  );

  const postCoachJob = useCallback(
    (posting: CoachPosting) => {
      const prev = saveRef.current;
      if (!prev) return;
      // A fresh posting starts a fresh search.
      commit({ ...prev, coachPosting: posting, coachApplicants: [] });
      setFlash(
        posting === 'any'
          ? 'Word is out: you’re looking for a coach.'
          : `Word is out: you’re looking for a ${specialtyName(posting).toLowerCase()}.`,
      );
    },
    [commit],
  );

  const cancelCoachJob = useCallback(() => {
    const prev = saveRef.current;
    if (!prev) return;
    commit({ ...prev, coachPosting: null, coachApplicants: [] });
  }, [commit]);

  const passApplicant = useCallback(
    (id: string) => {
      const prev = saveRef.current;
      if (!prev) return;
      commit({ ...prev, coachApplicants: prev.coachApplicants.filter((a) => a.coach.id !== id) });
    },
    [commit],
  );

  const hireApplicant = useCallback(
    (id: string) => {
      const prev = saveRef.current;
      if (!prev) return;
      if (prev.coaches.length >= MAX_COACHES) {
        setFlash('Your staff is full. Let someone go before you take on another.');
        return;
      }
      const applicant = prev.coachApplicants.find((a) => a.coach.id === id);
      if (!applicant) return;
      const history = [
        ...prev.history,
        { dayCount: prev.dayCount, text: `You brought ${applicant.coach.name} onto the staff.` },
      ].slice(-250);
      // Hiring fills the role and closes the search.
      commit({
        ...prev,
        coaches: [...prev.coaches, applicant.coach],
        coachPosting: null,
        coachApplicants: [],
        history,
      });
      setFlash(`${applicant.coach.name} is on the staff.`);
    },
    [commit],
  );

  const fireCoach = useCallback(
    (id: string) => {
      const prev = saveRef.current;
      if (!prev) return;
      const coach = prev.coaches.find((c) => c.id === id);
      if (!coach) return;
      const coaches = prev.coaches.filter((c) => c.id !== id);

      // His fighters fall to the manager if there's room, else back to general.
      let managerUsed = usedByManager(prev.roster);
      const roster = prev.roster.map((e) => {
        if (e.focus === null || e.coachId !== id) return e;
        if (managerUsed < FOCUS_SLOTS_BASE) {
          managerUsed += 1;
          return { ...e, coachId: null };
        }
        return { ...e, focus: null, coachId: null };
      });

      const history = [
        ...prev.history,
        { dayCount: prev.dayCount, text: `You let ${coach.name} go.` },
      ].slice(-250);
      commit({ ...prev, coaches, roster, history });
      setFlash(`You let ${coach.name} go.`);
    },
    [commit],
  );

  const setLocker = useCallback(
    (id: string, hasLocker: boolean) => {
      const prev = saveRef.current;
      if (!prev) return;
      const entry = prev.roster.find((e) => e.fighter.id === id);
      if (!entry || entry.hasLocker === hasLocker) return;

      if (hasLocker && lockersUsed(prev) >= lockerCapacity(prev)) {
        setFlash('Every locker is full. Free one before you give another.');
        return;
      }
      if (!hasLocker && noLockerUsed(prev) >= noLockerCapacity(prev)) {
        setFlash('No room to carry another fighter without a locker. Cut someone first.');
        return;
      }
      const roster = prev.roster.map((e) => {
        if (e.fighter.id !== id) return e;
        // Pulling a locker stings and is remembered; giving one lifts him, but
        // never fully undoes the memory. Repeats compound (see relationship.ts).
        // A man who loses his locker also loses his focused-training slot.
        const rel = hasLocker ? applyLockerGranted(e) : applyLockerTaken(e);
        return {
          ...e,
          hasLocker,
          focus: hasLocker ? e.focus : null,
          coachId: hasLocker ? e.coachId : null,
          // Granting answers any pending request; pulling a locker drops him back
          // to a trialist with a fresh (if shaken) clock.
          lockerRequested: false,
          trialPatience: hasLocker ? e.trialPatience : freshPatience(),
          // A man off the wall is no longer being courted as your fighter.
          poachInterest: hasLocker ? e.poachInterest : 0,
          ...rel,
        };
      });
      commit({ ...prev, roster });
      emitGameEvent({ type: hasLocker ? 'locker_granted' : 'locker_taken', fighterId: id });
    },
    [commit],
  );

  const setTier = useCallback(
    (id: string, tier: HierarchyTier) => {
      const prev = saveRef.current;
      if (!prev) return;
      const roster = prev.roster.map((e) =>
        e.fighter.id === id ? { ...e, tier } : e,
      );
      commit({ ...prev, roster });
    },
    [commit],
  );

  const setFocus = useCallback(
    (id: string, focus: TrainingFocus | null) => {
      const prev = saveRef.current;
      if (!prev) return;
      const entry = prev.roster.find((e) => e.fighter.id === id);
      if (!entry) return;

      const apply = (patch: Partial<typeof entry>) =>
        commit({
          ...prev,
          roster: prev.roster.map((e) => (e.fighter.id === id ? { ...e, ...patch } : e)),
        });

      // Clear focus.
      if (focus === null) {
        if (entry.focus === null) return;
        apply({ focus: null, coachId: null });
        return;
      }
      if (!entry.hasLocker) {
        setFlash('Only locker holders get your focused attention.');
        return;
      }
      // Already focused — just change the area, keep his trainer.
      if (entry.focus !== null) {
        apply({ focus });
        return;
      }
      // Newly focusing — find a trainer with a free slot, the manager first.
      let coachId: string | null;
      if (usedByManager(prev.roster) < FOCUS_SLOTS_BASE) {
        coachId = null;
      } else {
        const free = prev.coaches.find((c) => usedByCoach(prev.roster, c.id) < c.slots);
        if (!free) {
          setFlash('No training slots free — hire a coach or free one up.');
          return;
        }
        coachId = free.id;
      }
      apply({ focus, coachId });
    },
    [commit],
  );

  const setTrainer = useCallback(
    (id: string, coachId: string | null) => {
      const prev = saveRef.current;
      if (!prev) return;
      const entry = prev.roster.find((e) => e.fighter.id === id);
      if (!entry || entry.focus === null || entry.coachId === coachId) return;

      if (coachId === null) {
        const used = usedByManager(prev.roster) - (entry.coachId === null ? 1 : 0);
        if (used >= FOCUS_SLOTS_BASE) {
          setFlash('You can only run so many fighters yourself.');
          return;
        }
      } else {
        const coach = prev.coaches.find((c) => c.id === coachId);
        if (!coach) return;
        const used = usedByCoach(prev.roster, coachId) - (entry.coachId === coachId ? 1 : 0);
        if (used >= coach.slots) {
          setFlash(`${coach.name} has no free slots.`);
          return;
        }
      }
      commit({
        ...prev,
        roster: prev.roster.map((e) => (e.fighter.id === id ? { ...e, coachId } : e)),
      });
    },
    [commit],
  );

  const cutFighter = useCallback(
    (id: string) => {
      const prev = saveRef.current;
      if (!prev) return;
      const entry = prev.roster.find((e) => e.fighter.id === id);
      if (!entry) return;

      const name = fighterFullName(entry.fighter);
      const outcome = resolveCut(entry);
      emitGameEvent({ type: 'fighter_cut', fighterId: id, stayed: outcome === 'stay' });

      const memory = {
        dayCount: prev.dayCount,
        text:
          outcome === 'vanish'
            ? `You cut ${name}. He cleared out his locker and was gone by morning.`
            : `You cut ${name}. He asked to stay and earn it back. That told you something.`,
      };
      const history = [...prev.history, memory].slice(-250);

      // Cutting a man dents how the gym is regarded — worse for one you'd
      // committed to, a loyal man, or a locker holder you're discarding. It
      // stacks if you churn several before it heals, and lowers your draw and
      // unsettles your remaining talent until it does (6C-4).
      let hit = 0.01;
      if (entry.tier === 'must_keep') hit += 0.03;
      if (entry.trust >= 55) hit += 0.02;
      if (entry.hasLocker) hit += 0.02;
      const reputationMod = Math.max(MAX_REP_PENALTY, prev.reputationMod - hit);

      // The room feels it. A cut sends a small morale ripple through everyone
      // else — worse for the men who care, shrugged off by the ruthless.
      const ripple = (e: RosterEntry): RosterEntry =>
        e.fighter.id === id
          ? e
          : { ...e, morale: Math.max(0, Math.min(100, e.morale + cutMoraleRipple(e))) };

      if (outcome === 'vanish') {
        const roster = prev.roster.filter((e) => e.fighter.id !== id).map(ripple);
        commit({ ...prev, roster, history, reputationMod });
        setFlash(`${name} cleared out his locker and was gone by morning.`);
      } else {
        const roster = prev.roster.map((e) =>
          e.fighter.id === id
            ? {
                ...e,
                hasLocker: false,
                tier: 'chopping' as HierarchyTier,
                focus: null,
                coachId: null,
                trialPatience: freshPatience(),
                lockerRequested: false,
                poachInterest: 0,
                ...applyCutStayed(e),
              }
            : ripple(e),
        );
        commit({ ...prev, roster, history, reputationMod });
        setFlash(`${name} asked to stay and earn his spot back — no locker.`);
      }
      setProfileId((cur) => (cur === id && outcome === 'vanish' ? null : cur));
    },
    [commit],
  );

  const stopConsidering = useCallback(
    (id: string) => {
      const prev = saveRef.current;
      if (!prev) return;
      const entry = prev.roster.find((e) => e.fighter.id === id);
      if (!entry || entry.hasLocker) return;
      const name = fighterFullName(entry.fighter);
      // You don't eject him — you let him know there's no spot coming. His
      // patience collapses; he'll drift off on his own within a couple of weeks.
      const roster = prev.roster.map((e) =>
        e.fighter.id === id
          ? {
              ...e,
              trialPatience: randInt(7, 16),
              lockerRequested: false,
              morale: Math.max(0, e.morale - 8),
            }
          : e,
      );
      const history = [
        ...prev.history,
        { dayCount: prev.dayCount, text: `You let ${name} know you weren’t planning to offer him a spot.` },
      ].slice(-250);
      commit({ ...prev, roster, history });
      setFlash(`You told ${name} where things stood. He won’t hang around long.`);
    },
    [commit],
  );

  const respondLockerRequest = useCallback(
    (id: string, choice: 'grant' | 'wait' | 'honest') => {
      const prev = saveRef.current;
      if (!prev) return;
      const entry = prev.roster.find((e) => e.fighter.id === id);
      if (!entry || entry.hasLocker || !entry.lockerRequested) return;
      const name = fighterFullName(entry.fighter);

      if (choice === 'grant') {
        if (lockersUsed(prev) >= lockerCapacity(prev)) {
          setFlash('Every locker is full. Free one before you give another.');
          return;
        }
        const roster = prev.roster.map((e) =>
          e.fighter.id === id
            ? { ...e, hasLocker: true, lockerRequested: false, ...applyLockerGranted(e) }
            : e,
        );
        const history = [
          ...prev.history,
          { dayCount: prev.dayCount, text: `${name} asked for a future here, and you gave him a locker.` },
        ].slice(-250);
        commit({ ...prev, roster, history });
        emitGameEvent({ type: 'locker_granted', fighterId: id });
        setFlash(`${name} has a locker. Now you’ll see who he really is.`);
        return;
      }

      // Wait — he keeps working on faith, but it costs him; Honest — you tell him
      // straight there's no room, and he respects it even as he starts to move on.
      const patch =
        choice === 'wait'
          ? { trialPatience: Math.max(8, entry.trialPatience - 25), morale: Math.max(0, entry.morale - 10) }
          : { trialPatience: randInt(10, 20), morale: Math.max(0, entry.morale - 4) };
      const roster = prev.roster.map((e) =>
        e.fighter.id === id ? { ...e, ...patch, lockerRequested: false } : e,
      );
      const text =
        choice === 'wait'
          ? `${name} asked about his future. You asked him to keep waiting.`
          : `${name} asked about his future. You told him straight there was no room.`;
      const history = [...prev.history, { dayCount: prev.dayCount, text }].slice(-250);
      commit({ ...prev, roster, history });
      setFlash(
        choice === 'wait'
          ? `You asked ${name} to be patient. He’ll give it a while longer.`
          : `You were honest with ${name}. He respected it — but he’ll likely move on.`,
      );
    },
    [commit],
  );

  const value = useMemo<GameContextValue>(
    () => ({
      screen,
      activeRoom,
      save,
      canContinue,
      arrival,
      viewerIds,
      viewerIndex,
      profileId,
      flash,
      goHome,
      openSettings,
      openNewGame,
      startGame,
      continueGame,
      openRoom,
      closeRoom,
      advanceTime,
      viewArrivalsNow,
      dismissArrival,
      openWalkIns,
      closeWalkInViewer,
      decideWalkIn,
      openProfile,
      closeProfile,
      setLocker,
      setTier,
      setFocus,
      setTrainer,
      cutFighter,
      stopConsidering,
      respondLockerRequest,
      purchaseUpgrade,
      postCoachJob,
      cancelCoachJob,
      hireApplicant,
      passApplicant,
      fireCoach,
      clearFlash,
      lockerCap: save ? lockerCapacity(save) : 0,
      noLockerCap: save ? noLockerCapacity(save) : 0,
      focusCapacity:
        FOCUS_SLOTS_BASE + (save ? save.coaches.reduce((s, c) => s + c.slots, 0) : 0),
    }),
    [
      screen,
      activeRoom,
      save,
      canContinue,
      arrival,
      viewerIds,
      viewerIndex,
      profileId,
      flash,
      goHome,
      openSettings,
      openNewGame,
      startGame,
      continueGame,
      openRoom,
      closeRoom,
      advanceTime,
      viewArrivalsNow,
      dismissArrival,
      openWalkIns,
      closeWalkInViewer,
      decideWalkIn,
      openProfile,
      closeProfile,
      setLocker,
      setTier,
      setFocus,
      setTrainer,
      cutFighter,
      stopConsidering,
      respondLockerRequest,
      purchaseUpgrade,
      postCoachJob,
      cancelCoachJob,
      hireApplicant,
      passApplicant,
      fireCoach,
      clearFlash,
    ],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within a GameProvider');
  return ctx;
}

export { clearSave, lockersUsed, noLockerUsed };
export type { DepartureReason };
