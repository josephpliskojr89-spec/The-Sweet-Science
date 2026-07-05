/*
  WalkInViewer — the walk-in moment, the game's heartbeat
  --------------------------------------------------------------------------
  OBJECT SHOT: standing just inside the office doorway, looking down at the
  clipboard in your hands. The pebbled-glass door stands ajar at the top of
  frame — the man himself waits beyond it as a silhouette. Your tools hang
  on the desk's right rail: the locker key board, the floor-pass chit pad,
  the red NOT FOR US stamp on its ink tin, and the PENDING wire tray.

  Deciding a man's fate lands somewhere (CD ruling 11): give him a locker
  or a floor pass and his card FILES RIGHT toward the corridor; stamp him
  and it SLIDES OFF LEFT past the door; decide later and it TUCKS into the
  tray. 350ms once per decision; reduced-motion snaps. The next card deals
  in from the stack visibly waiting under this one.
*/

import { useEffect, useState } from 'react';
import { useGame, lockersUsed, noLockerUsed } from '../state/GameContext';
import { WalkInCard } from '../components/WalkInCard/WalkInCard';
import { BankBalLine } from '../kit/BankBalLine';
import './WalkInViewer.css';

type Verdict = { kind: 'locker' | 'no_locker' | 'turn_away' | 'later'; id: string } | null;

export function WalkInViewer() {
  const {
    save,
    viewerIds,
    viewerIndex,
    decideWalkIn,
    closeWalkInViewer,
    openWalkIns,
    lockerCap,
    noLockerCap,
  } = useGame();
  const [verdict, setVerdict] = useState<Verdict>(null);

  const done = !viewerIds || viewerIndex >= viewerIds.length;
  const currentId = done ? null : viewerIds[viewerIndex];
  const walkIn =
    currentId && save ? save.walkIns.find((w) => w.fighter.id === currentId) : undefined;

  useEffect(() => {
    if (!viewerIds) return;
    if (viewerIndex >= viewerIds.length) {
      closeWalkInViewer();
    } else if (currentId && !walkIn) {
      openWalkIns(viewerIds, viewerIndex + 1);
    }
  }, [viewerIds, viewerIndex, currentId, walkIn, closeWalkInViewer, openWalkIns]);

  // the viewer owns Escape — Esc is the tray (decide later)
  useEffect(() => {
    if (done) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !verdict && currentId) {
        setVerdict({ kind: 'later', id: currentId });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [done, verdict, currentId]);

  if (!save || done || !currentId || !walkIn) return null;

  const total = viewerIds.length;
  const remaining = total - viewerIndex - 1;
  const lockersLeft = lockerCap - lockersUsed(save);
  const lockersFull = lockersLeft <= 0;
  const noLockerLeft = noLockerCap - noLockerUsed(save);
  const noLockerFull = noLockerLeft <= 0;
  const f = walkIn.fighter;

  const decide = (kind: NonNullable<Verdict>['kind']) => {
    if (verdict) return;
    setVerdict({ kind, id: currentId });
  };

  // the card's exit has landed — commit the decision
  const settle = () => {
    if (!verdict) return;
    const v = verdict;
    setVerdict(null);
    if (v.kind === 'later') closeWalkInViewer();
    else decideWalkIn(v.id, v.kind);
  };

  const exitClass =
    verdict?.kind === 'turn_away'
      ? ' wiv__board--left'
      : verdict?.kind === 'later'
        ? ' wiv__board--tuck'
        : verdict
          ? ' wiv__board--right'
          : '';

  return (
    <div
      className="wiv"
      role="dialog"
      aria-label={`Walk-in: ${f.firstName} ${f.lastName}${
        total > 1 ? `, card ${viewerIndex + 1} of ${total}` : ''
      }. Bank balance $${Math.round(save.money).toLocaleString('en-US')}.`}
    >
      {/* the doorway: glass ajar, the man waiting beyond it */}
      <div className="wiv__doorway" aria-hidden="true">
        <div className="wiv__doorglass">
          <span
            className={
              'wiv__silhouette' + (verdict?.kind === 'turn_away' ? ' wiv__silhouette--gone' : '')
            }
          />
        </div>
      </div>

      {/* the clipboard in your hands */}
      <div className={'wiv__board' + exitClass} onAnimationEnd={settle} key={currentId}>
        <span className="wiv__boardclip" aria-hidden="true" />
        <WalkInCard fighter={f} patience={walkIn.patience} />
        {/* the rest of the stack, visibly waiting */}
        {remaining > 0 && (
          <>
            <span className="wiv__stack" aria-hidden="true">
              {Array.from({ length: Math.min(remaining, 3) }, (_, i) => (
                <span key={i} className="wiv__stackcard" style={{ left: `${6 + i * 4}px`, top: `${8 + i * 5}px` }} />
              ))}
            </span>
            <span className="wiv__stackband" aria-hidden="true">
              AT THE DOOR — {remaining} MORE WAITING
            </span>
          </>
        )}
      </div>

      {/* the right rail: your tools */}
      <div className="wiv__rail">
        <button
          className="railkeys"
          disabled={lockersFull || verdict !== null}
          onClick={() => decide('locker')}
          aria-label={
            lockersFull
              ? 'Every locker is full'
              : `Give him a locker — ${lockersLeft} of ${lockerCap} open`
          }
        >
          <span className="railkeys__board" aria-hidden="true">
            {Array.from({ length: lockerCap }, (_, i) => (
              <span key={i} className="railkeys__hook">
                {i < lockersLeft && <span className="railkeys__key" />}
              </span>
            ))}
          </span>
          <span className="railkeys__strip" aria-hidden="true">
            {lockersFull ? 'LOCKERS — ALL OUT' : `LOCKERS — ${lockersLeft} OF ${lockerCap} OPEN`}
          </span>
        </button>

        <button
          className="railchits"
          disabled={noLockerFull || verdict !== null}
          onClick={() => decide('no_locker')}
          aria-label={
            noLockerFull
              ? 'No room to carry another without a locker'
              : `Train without a locker — ${noLockerLeft} of ${noLockerCap} provisional spots`
          }
        >
          <span className="railchits__pad" aria-hidden="true">
            <span className="railchits__chit">
              FLOOR ONLY
              <br />
              NO LOCKER
            </span>
          </span>
          <span className="railchits__band" aria-hidden="true">
            {noLockerFull ? (
              <span className="railchits__noroom">NO ROOM</span>
            ) : (
              `PROVISIONAL — ${noLockerLeft} OF ${noLockerCap} SPOTS`
            )}
          </span>
        </button>

        <button
          className="railstamp"
          disabled={verdict !== null}
          onClick={() => decide('turn_away')}
          aria-label="Turn him away — stamp the card NOT FOR US"
        >
          <span className="railstamp__tin" aria-hidden="true" />
          <span className="railstamp__handle" aria-hidden="true" />
          <span className="railstamp__label" aria-hidden="true">
            NOT FOR US
          </span>
        </button>

        <button
          className="railtray"
          disabled={verdict !== null}
          onClick={() => decide('later')}
          aria-label="Decide later — his card waits in the office tray (Esc)"
        >
          <span className="railtray__wire" aria-hidden="true">
            {save.walkIns.length > 1 &&
              Array.from({ length: Math.min(save.walkIns.length - 1, 3) }, (_, i) => (
                <span key={i} className="railtray__pending" style={{ left: `${10 + i * 12}px` }} />
              ))}
          </span>
          <span className="railtray__card" aria-hidden="true">
            PENDING — SEE OFFICE
          </span>
        </button>
      </div>

      {/* the desk-pad corner: the number at the moment of decision */}
      <div className="wiv__deskpad" aria-hidden="true">
        <BankBalLine money={save.money} dayCount={save.dayCount} seedId="wiv" />
      </div>
    </div>
  );
}
