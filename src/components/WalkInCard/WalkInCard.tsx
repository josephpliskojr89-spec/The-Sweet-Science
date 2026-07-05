/*
  WalkInCard — CARD 7-A · REV. 6/73
  --------------------------------------------------------------------------
  The gym's own registration card (the unified walk-in document, A2):
  index-card stock with blue rules, letterpress WALK-IN CARD header over an
  oxblood rule, photograph mounted with gummed corners, printed field labels
  with typewriter-filled answers, the typed statement, pencil first
  impression, YOUR READ typed at full contrast, and the patience flimsy
  stapled to the corner — typed 'WILL WAIT — N DAYS', stamped IN A HURRY
  when he won't. Presentation only.
*/

import { fighterAge, type Fighter } from '../../game/fighters';
import { WEIGHT_CLASSES, formatHeight } from '../../game/weightClasses';
import { Portrait } from '../../assets/portraits';
import { GlovesEmblem } from '../GlovesEmblem';
import { Stamp } from '../../kit/Stamp';
import { paperTilt, seedRange } from '../../kit/seed';
import './WalkInCard.css';

export function WalkInCard({ fighter, patience }: { fighter: Fighter; patience?: number }) {
  const cls = WEIGHT_CLASSES[fighter.weightClass];

  const stats: Array<[string, string]> = [
    ['AGE', String(fighterAge(fighter))],
    ['HT.', formatHeight(fighter.heightInches)],
    ['WT.', `${fighter.weightLbs} LBS`],
    ['CLASS', cls.name.toUpperCase()],
  ];

  return (
    <div className="wic on-paper" style={paperTilt(fighter.id, 2, 2)}>
      <span className="wic__formno" aria-hidden="true">
        CARD 7-A · REV. 6/73
      </span>

      <div className="wic__banner">
        <span className="wic__banner-text">WALK-IN CARD</span>
      </div>

      {/* the patience flimsy, stapled top-right */}
      {patience !== undefined && (
        <div className="wic__flimsy" style={paperTilt(fighter.id + 'fl', 2, 2)}>
          <span className="wic__staple" aria-hidden="true" />
          {patience <= 3 ? (
            <Stamp word="IN A HURRY" category="trajectory" seedId={fighter.id} size="sm" />
          ) : (
            <span className="wic__flimsy-line">
              WILL WAIT — {patience} {patience === 1 ? 'DAY' : 'DAYS'}
            </span>
          )}
        </div>
      )}

      <div className="wic__top">
        <div className="wic__photo" style={paperTilt(fighter.id + 'ph', 1.5, 1)}>
          <Portrait appearance={fighter.appearance} size={132} />
          <span className="wic__corner wic__corner--tl" aria-hidden="true" />
          <span className="wic__corner wic__corner--tr" aria-hidden="true" />
          <span className="wic__corner wic__corner--bl" aria-hidden="true" />
          <span className="wic__corner wic__corner--br" aria-hidden="true" />
        </div>

        <div className="wic__info">
          <div className="wic__field wic__field--name">
            <span className="wic__label">NAME:</span>
            <span className="wic__value">
              {fighter.lastName.toUpperCase()}, {fighter.firstName.toUpperCase()}
              {fighter.nickname && <span className="wic__nick"> “{fighter.nickname}”</span>}
            </span>
          </div>
          {stats.map(([k, v]) => (
            <div className="wic__field" key={k}>
              <span className="wic__label">{k}</span>
              <span className="wic__value">{v}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="wic__statement">
        <p className="wic__statement-label">WHY I WANT TO TRAIN HERE:</p>
        <p className="wic__statement-text">
          {fighter.statement.split(' ').map((w, i) => (
            <span key={i} style={{ opacity: 0.88 + seedRange(fighter.id + 'w' + i, 0, 0.12, 0) }}>
              {w}{' '}
            </span>
          ))}
        </p>
      </div>

      <div className="wic__impression">
        <GlovesEmblem size={26} className="wic__gloves" />
        <span className="wic__impression-text">“{fighter.firstImpression}”</span>
      </div>

      <div className="wic__read">
        <span className="wic__read-label">YOUR READ:</span>
        <span className="wic__read-text">{fighter.ceilingRead}</span>
      </div>
    </div>
  );
}
