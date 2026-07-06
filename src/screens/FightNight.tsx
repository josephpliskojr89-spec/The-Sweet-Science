/*
  FightNight — the corner, played live
  --------------------------------------------------------------------------
  The screen for a bout you chose to work yourself. Structure of a night:

    THE TAPE   — names, records, the room, your corner team. First bell.
    THE ROUND  — the report's typed lines land one round at a time.
    THE STOOL  — your trainer's read (as honest as his eyes), one corner
                 job (the cut, the eye, or air), one instruction, and the
                 towel always within reach.
    THE END    — verdict, cards if it went to them, the purse, home.

  The engine object is created once per bout and mutated in place; a tick
  counter re-renders. Same seed as the off-screen sim — cornering it is the
  only thing that makes the night go differently.
*/

import { useState } from 'react';
import { useGame } from '../state/GameContext';
import {
  prepareFight,
  cornerQualityFor,
  cutmanSkillFor,
  stoolAcuityFor,
  recordLine,
  type FightPrep,
} from '../game/fights';
import { worldFighterName, campOf } from '../game/world/population';
import { fighterFullName } from '../game/fighters';
import { formatMoney } from '../game/economy';
import {
  createLiveFight,
  playRound,
  setTactic,
  cornerWork,
  stoolRead,
  throwTowel,
  autoCorner,
  visibleDamage,
  TACTIC_META,
  type LiveFight,
  type Tactic,
  type CornerCare,
} from '../game/engine/fightEngine';
import './FightNight.css';

interface Session {
  prep: FightPrep;
  lf: LiveFight;
}

export function FightNight({ onClose }: { onClose: () => void }) {
  const { save, liveBout, setCornerPlan, settleLiveFight } = useGame();

  const bout = liveBout;
  const entry = bout ? save?.roster.find((e) => e.fighter.id === bout.fighterId) : undefined;
  const opp = bout ? save?.world.fighters.find((f) => f.id === bout.opponentId) : undefined;

  // one engine per mount; the parent mounts this fresh per bout
  const [session] = useState<Session | null>(() => {
    if (!save || !bout || !entry || !opp) return null;
    const prep = prepareFight({
      booked: bout,
      entry,
      opponent: opp,
      cornerQuality: cornerQualityFor(bout.corner, save.coaches),
      dayCount: save.dayCount,
    });
    return { prep, lf: createLiveFight(prep.input) };
  });

  const [, setTick] = useState(0);
  const rerender = () => setTick((t) => t + 1);

  const [started, setStarted] = useState(false);
  const [tactic, setTacticChoice] = useState<Tactic>('steady');
  const [care, setCare] = useState<CornerCare>('breathe');

  if (!save || !bout) return null;

  // the other corner came apart — hand it to the staff and let time resolve it
  if (!entry || !opp || !session) {
    return (
      <div className="fnight" role="dialog" aria-label="Fight night">
        <div className="fnight__bill">
          <p className="fnight__fallthrough">
            Something's wrong at the arena — one side of this bout came apart.
          </p>
          <button
            className="fnight__btn"
            onClick={() => {
              setCornerPlan(bout.id, { ...bout.corner, mode: 'staff' });
              onClose();
            }}
          >
            LET THE STAFF SORT IT OUT
          </button>
        </div>
      </div>
    );
  }

  const { lf, prep } = session;
  const over = lf.result !== null;
  const acuity = stoolAcuityFor(bout.corner, save.coaches);
  const cutSkill = cutmanSkillFor(bout.corner, save.coaches);
  const chief = save.coaches.find((c) => c.id === bout.corner.chiefSecondId) ?? null;
  const cutman = save.coaches.find((c) => c.id === bout.corner.cutmanId) ?? null;
  const dmg = visibleDamage(lf, 'a');
  const oppName = worldFighterName(opp);

  const bell = () => {
    if (lf.result) return;
    if (lf.round > 0) {
      // your stool: one job, one instruction; their corner works unwatched
      cornerWork(lf, 'a', care, care === 'cut' || care === 'swelling' ? cutSkill : acuity * 0.6);
      autoCorner(lf, 'b');
    }
    setTactic(lf, 'a', tactic);
    playRound(lf);
    setCare('breathe');
    setStarted(true);
    rerender();
  };

  const towel = () => {
    throwTowel(lf, 'a');
    rerender();
  };

  const settle = () => {
    if (!lf.result) return;
    settleLiveFight(bout.id, lf.result, prep.oppFull);
    onClose();
  };

  const reads = started && !over ? stoolRead(lf, 'a', acuity) : [];
  const result = lf.result;
  const won = result?.winner === 'a';

  return (
    <div className="fnight" role="dialog" aria-label={`Fight night — ${entry.fighter.lastName} vs ${oppName}`}>
      <div className="fnight__bill">
        {/* the tape */}
        <header className="fnight__tape">
          <div className="fnight__names">
            <div className="fnight__man">
              <span className="fnight__name">{fighterFullName(entry.fighter).toUpperCase()}</span>
              <span className="fnight__rec">{recordLine(entry.record)}</span>
              <span className="fnight__camp">{save.gymName}</span>
            </div>
            <span className="fnight__vs">VS</span>
            <div className="fnight__man fnight__man--right">
              <span className="fnight__name">{oppName.toUpperCase()}</span>
              <span className="fnight__rec">{recordLine(opp.record)}</span>
              <span className="fnight__camp">{campOf(opp)}</span>
            </div>
          </div>
          <p className="fnight__where">
            {bout.rounds} ROUNDS · {bout.venue.toUpperCase()} · PURSE {formatMoney(bout.purse)}
          </p>
          <p className="fnight__corner">
            YOUR CORNER: you, chief second{chief ? ` · ${chief.name} on the stool` : ' · nobody reading for you'}
            {cutman ? ` · ${cutman.name} on cuts` : ' · no cutman — a sponge and hope'}
          </p>
        </header>

        {/* the report so far */}
        {started && (
          <div className="fnight__report">
            {lf.narrative.map((l, i) => (
              <p className="fnight__line" key={i}>
                {l}
              </p>
            ))}
          </div>
        )}

        {/* the stool */}
        {started && !over && (
          <div className="fnight__stool">
            <div className="fnight__reads">
              {reads.map((r, i) => (
                <p className="fnight__read" key={i}>
                  “{r}”
                </p>
              ))}
            </div>

            {(dmg.cut > 0.05 || dmg.swell > 0.25) && (
              <div className="fnight__job" role="radiogroup" aria-label="The minute — one job">
                <span className="fnight__job-label">THE MINUTE:</span>
                {dmg.cut > 0.05 && (
                  <button
                    role="radio"
                    aria-checked={care === 'cut'}
                    className={'fnight__chip' + (care === 'cut' ? ' fnight__chip--on' : '')}
                    onClick={() => setCare('cut')}
                  >
                    WORK THE CUT
                  </button>
                )}
                {dmg.swell > 0.25 && (
                  <button
                    role="radio"
                    aria-checked={care === 'swelling'}
                    className={'fnight__chip' + (care === 'swelling' ? ' fnight__chip--on' : '')}
                    onClick={() => setCare('swelling')}
                  >
                    ICE THE EYE
                  </button>
                )}
                <button
                  role="radio"
                  aria-checked={care === 'breathe'}
                  className={'fnight__chip' + (care === 'breathe' ? ' fnight__chip--on' : '')}
                  onClick={() => setCare('breathe')}
                >
                  LET HIM BREATHE
                </button>
              </div>
            )}

            <div className="fnight__job" role="radiogroup" aria-label="The instruction">
              <span className="fnight__job-label">THE WORD:</span>
              {TACTIC_META.map((t) => (
                <button
                  key={t.key}
                  role="radio"
                  aria-checked={tactic === t.key}
                  className={'fnight__chip' + (tactic === t.key ? ' fnight__chip--on' : '')}
                  onClick={() => setTacticChoice(t.key)}
                  title={t.blurb}
                >
                  {t.name.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* the end */}
        {over && result && (
          <div className="fnight__end">
            <p className={'fnight__verdict' + (won ? ' fnight__verdict--won' : '')}>
              {won
                ? `${entry.fighter.lastName.toUpperCase()} WINS`
                : result.winner === null
                  ? 'A DRAW'
                  : `${oppName.toUpperCase()} WINS`}
              {' — '}
              {result.method}
              {result.method === 'KO' || result.method === 'TKO' ? ` R${result.endRound}` : ''}
            </p>
            {result.judgeTotals && (
              <p className="fnight__cards">
                CARDS: {result.judgeTotals.map(([x, y]) => `${x}–${y}`).join(' · ')}
              </p>
            )}
            <p className="fnight__purse">PURSE {formatMoney(bout.purse)} — in the drawer.</p>
          </div>
        )}

        {/* the buttons */}
        <div className="fnight__actions">
          {!over && (
            <button className="fnight__btn fnight__btn--bell" onClick={bell}>
              {started ? `SEND HIM OUT — ROUND ${lf.round + 1}` : 'FIRST BELL'}
            </button>
          )}
          {started && !over && (
            <button className="fnight__btn fnight__btn--towel" onClick={towel}>
              THROW THE TOWEL
            </button>
          )}
          {over && (
            <button className="fnight__btn fnight__btn--bell" onClick={settle}>
              SETTLE UP &amp; GO HOME
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
