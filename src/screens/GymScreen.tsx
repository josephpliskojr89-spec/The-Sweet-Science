/*
  GymScreen — THE GYM FLOOR
  --------------------------------------------------------------------------
  ROOM SHOT: standing eye height (~5'8"), just inside the street door,
  looking across the ring at the back wall. Full-bleed; walls meet the
  viewport edges. (DESIGN-BIBLE, Part II — The Gym Floor.)

  There is no header, no breadcrumb, no footer bar, no cards. The back wall
  is an elevation of real destinations at honest, unequal sizes:

    street door + EXIT (way back)     — far left frame edge
    corkboard (gym log)               — left wall by the door
    office door, lit pebbled glass    — back wall, up two steps
      · pink slips under it           — walk-ins waiting (count as evidence)
      · BANK BAL. card taped beside   — the CD's cash ruling
      · framed state license          — reputation tier
    painted gym name                  — high on the wall over the ring
    the ring                          — midground
    training station (chalk + pegs)   — ring corner → My Gym
      · bill spike with letters       — coach applicants
    locker corridor + IN CAMP slate   — back wall right
    wall calendar, hung crooked       — seam before the time station
    newspaper on the oak bench        — near foreground → The Press
    day pad + punch clock             — near right wall (used every minute)

  Counts render as visible evidence with exact tallies in aria-labels.
  Routing is untouched: the same five ROOM_ORDER keys open the same rooms.
*/

import type { CSSProperties } from 'react';
import { useGame } from '../state/GameContext';
import { getCity } from '../game/cities';
import { formatDate } from '../game/time';
import { ROOMS } from '../game/rooms';
import { TimeControls } from '../components/TimeControls';
import { RoomRouter } from '../rooms/RoomRouter';
import { ArrivalNotice } from '../components/ArrivalNotice';
import { GymLogBoard } from '../components/GymLogBoard';
import { Toast } from '../components/Toast';
import { WalkInViewer } from './WalkInViewer';
import { FighterProfile } from './FighterProfile';
import { BankBalLine } from '../kit/BankBalLine';
import { ChalkTally } from '../kit/ChalkTally';
import { paperTilt, seedRange } from '../kit/seed';
import './GymScreen.css';

/** Small helper: the month grid for the wall calendar. */
function monthGrid(dayCount: number) {
  const d = formatDate(dayCount);
  const first = new Date(d.year, new Date(`${d.month} 1, ${d.year}`).getMonth(), 1);
  const daysInMonth = new Date(d.year, first.getMonth() + 1, 0).getDate();
  const lead = first.getDay();
  return { d, daysInMonth, lead };
}

export function GymScreen() {
  const { save, openRoom, goHome } = useGame();
  if (!save) return null;

  const city = getCity(save.cityId);
  const walkIns = save.walkIns.length;
  const applicants = save.coachApplicants.length;
  const roster = save.roster.length;
  const { d, daysInMonth, lead } = monthGrid(save.dayCount);

  const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? '' : 's'}`;

  // the building ages with the save: 0 at founding, 1 at twenty years
  const gymAge = Math.min(1, save.dayCount / 7300);

  return (
    <div className="floor" style={{ '--gym-age': gymAge } as CSSProperties}>
      {/* ------- the room itself: walls, floorline, painted name ------- */}
      <div className="floor__walls layer" aria-hidden="true">
        <div className="floor__bulb floor__bulb--1" />
        <div className="floor__bulb floor__bulb--2" />
        <div className="floor__bulb floor__bulb--dead" />
        <div className="floor__patch">
          FIXED 3/71
        </div>
      </div>

      <div className="floor__signage" aria-hidden="true">
        <div className="floor__gymname">{save.gymName}</div>
        <div className="floor__gymcity">
          {city.name.toUpperCase()}, {city.state.toUpperCase()}
        </div>
      </div>

      {/* ------- the ring, midground ------- */}
      <svg className="floor__ring" viewBox="0 0 900 460" preserveAspectRatio="none" aria-hidden="true">
        {/* posts, planted on the mats */}
        <rect x="56" y="30" width="17" height="400" fill="var(--paint-red-faded)" />
        <rect x="822" y="30" width="17" height="400" fill="var(--paint-red-faded)" />
        {/* turnbuckle pads */}
        <rect x="48" y="52" width="33" height="66" fill="#6e3329" />
        <rect x="814" y="52" width="33" height="66" fill="#6e3329" />
        {/* ropes — sagging slightly, crossing the frame */}
        {[64, 116, 168].map((y, i) => (
          <path
            key={y}
            d={`M 73 ${y} Q 450 ${y + 14 + i * 3} 822 ${y}`}
            stroke={i === 1 ? '#b5aa92' : '#9a8f78'}
            strokeWidth={i === 1 ? 7 : 5.5}
            fill="none"
          />
        ))}
        {/* canvas apron under the bottom rope line */}
        <rect x="40" y="420" width="812" height="34" fill="#9a8f75" opacity="0.75" />
      </svg>

      {/* ------- street door + EXIT: the way back ------- */}
      <button
        className="streetdoor"
        onClick={goHome}
        aria-label="Leave through the street door, back to the home screen"
      >
        <span className="streetdoor__exitbox" aria-hidden="true">
          EXIT
        </span>
        <span className="streetdoor__leaf" aria-hidden="true">
          <span className="streetdoor__glass" />
        </span>
        <span className="streetdoor__daylight" aria-hidden="true" />
      </button>

      {/* ------- corkboard: the gym log ------- */}
      <div className="floor__cork">
        <GymLogBoard />
      </div>

      {/* ------- office door group ------- */}
      <div className="officegroup">
        <button
          className="officedoor"
          onClick={() => openRoom('office')}
          aria-label={`Office — walk-ins, fights, finances, rivals. ${plural(walkIns, 'walk-in')} waiting.`}
        >
          <svg className="officedoor__glasstext" viewBox="0 0 200 80" aria-hidden="true">
            <path id="office-arc" d="M 12 66 Q 100 26 188 66" fill="none" />
            <text className="officedoor__arcname">
              <textPath href="#office-arc" startOffset="50%" textAnchor="middle">
                {save.gymName.toUpperCase()}
              </textPath>
            </text>
          </svg>
          <span className="officedoor__word" aria-hidden="true">
            OFFICE
          </span>
          <span className="officedoor__latch" aria-hidden="true" />
          {walkIns > 0 && (
            <span className="officedoor__tally" aria-hidden="true">
              {walkIns} WAITING
            </span>
          )}
          {walkIns === 0 && <span className="officedoor__tapeghost" aria-hidden="true" />}
          <span className="officedoor__slips" aria-hidden="true">
            {Array.from({ length: Math.min(walkIns, 6) }, (_, i) => (
              <span
                key={i}
                className="officedoor__slip"
                style={
                  {
                    left: `${8 + i * 16 + seedRange(`slip${i}`, -4, 4, 0)}px`,
                    transform: `rotate(${seedRange(`slip${i}`, -8, 8, 1).toFixed(1)}deg)`,
                  } as CSSProperties
                }
              />
            ))}
          </span>
          <span className="officedoor__steps" aria-hidden="true" />
        </button>

        <button
          className="cashcard on-paper"
          style={paperTilt('cashcard', 1.2, 2)}
          onClick={() => openRoom('office')}
          aria-label="Bank balance card — opens the office ledger"
        >
          <span className="cashcard__tape cashcard__tape--tl" aria-hidden="true" />
          <span className="cashcard__tape cashcard__tape--br" aria-hidden="true" />
          <BankBalLine money={save.money} dayCount={save.dayCount} seedId={save.gymName} />
        </button>

        <div className="license" style={paperTilt('license', 1, 2)} aria-hidden="true">
          <span className="license__head">N.Y.S.A.C. — GYMNASIUM LICENSE</span>
          <span className="license__row">CLASS: LOCAL CLUB</span>
          <span className="license__row">PREM: {city.name.toUpperCase()}</span>
        </div>
      </div>

      {/* ------- training station: the ring corner → My Gym ------- */}
      <button
        className="station"
        onClick={() => openRoom('gym')}
        aria-label={`${ROOMS.gym.name} — training identity, coaches, upgrades. ${plural(applicants, 'coach applicant')}.`}
      >
        <span className="station__board" aria-hidden="true">
          <span className="station__chalkword">TRAINING</span>
          <span className="station__chalkline" />
        </span>
        <span className="station__pegboard" aria-hidden="true">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <span key={i} className={'station__peg' + (i % 3 === 1 ? ' station__peg--tag' : '')} />
          ))}
        </span>
        <span className="station__ledge" aria-hidden="true">
          <span className="station__spike" />
          {Array.from({ length: Math.min(applicants, 4) }, (_, i) => (
            <span
              key={i}
              className="station__envelope"
              style={{ transform: `rotate(${seedRange(`env${i}`, -10, 10, 0).toFixed(1)}deg) translateY(${-i * 3}px)` }}
            />
          ))}
          {applicants > 0 && (
            <span className="station__asking" aria-hidden="true">
              {applicants} {applicants === 1 ? 'MAN' : 'MEN'} ASKING
            </span>
          )}
        </span>
      </button>

      {/* ------- locker corridor + slate ------- */}
      <button
        className="corridor"
        onClick={() => openRoom('locker')}
        aria-label={`Locker room — the roster. ${plural(roster, 'fighter')} in camp.`}
      >
        <span className="corridor__header" aria-hidden="true">
          LOCKERS
        </span>
        <span className="corridor__dark" aria-hidden="true">
          <span className="corridor__steel" />
          <span className="corridor__spill" />
        </span>
        <span className="corridor__threshold" aria-hidden="true" />
      </button>

      <div className="slate" aria-hidden="true">
        <span className="slate__word">IN CAMP</span>
        {roster > 0 ? (
          <span className="slate__count">
            <ChalkTally count={roster} seedId={`roster-${save.gymName}`} />
            <span className="slate__numeral">{roster}</span>
          </span>
        ) : (
          <span className="slate__wiped" />
        )}
        <span className="slate__ledge" />
      </div>

      {/* ------- wall calendar ------- */}
      <button
        className="wallcal"
        style={{ '--seed-rot': '-2deg' } as CSSProperties}
        onClick={() => openRoom('calendar')}
        aria-label={`Calendar — ${d.month} ${d.year}. Rent due the 1st. Opens the schedule.`}
      >
        <span className="wallcal__month">
          {d.month.toUpperCase()} {d.year}
        </span>
        <span className="wallcal__grid" aria-hidden="true">
          {Array.from({ length: lead }, (_, i) => (
            <span key={`l${i}`} className="wallcal__cell" />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const spent = day < d.day;
            const isToday = day === d.day;
            return (
              <span
                key={day}
                className={
                  'wallcal__cell wallcal__cell--day' +
                  (spent ? ' wallcal__cell--spent' : '') +
                  (isToday ? ' wallcal__cell--today' : '') +
                  (day === 1 ? ' wallcal__cell--rent' : '')
                }
              >
                {day}
              </span>
            );
          })}
        </span>
      </button>

      {/* ------- bench + newspaper: The Press ------- */}
      <button
        className="benchpaper"
        onClick={() => openRoom('press')}
        aria-label="The newspaper on the bench — the sporting page and the magazine"
      >
        <span className="benchpaper__bench" aria-hidden="true" />
        <span className="benchpaper__paper" aria-hidden="true">
          <span className="benchpaper__masthead">The Ledger</span>
          <span className="benchpaper__foldlines" />
        </span>
        <span className="benchpaper__glasses" aria-hidden="true" />
      </button>

      {/* ------- the time station ------- */}
      <div className="floor__time">
        <TimeControls />
      </div>

      {/* ------- light rig: pools, daylight shaft, the two climates ------- */}
      <div className="rig floor__rig" aria-hidden="true" />
      <div className="floor__dark layer" aria-hidden="true" />

      {/* ------- overlays land as paper on this room's surfaces ------- */}
      <ArrivalNotice />
      <RoomRouter />
      <FighterProfile />
      <WalkInViewer />
      <Toast />
    </div>
  );
}
