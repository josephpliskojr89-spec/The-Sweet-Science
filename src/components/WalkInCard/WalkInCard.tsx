/*
  WalkInCard
  --------------------------------------------------------------------------
  The physical card from the bible and the reference image: clipboard clip,
  dark leather border, worn parchment, oxblood banner, framed portrait, name
  with nickname, the vital stats, the typewritten "Why I Want To Train Here,"
  and the italic First Impression beneath the gloves.

  Presentation only — it knows nothing about decisions or the queue.
*/

import { fighterAge, type Fighter } from '../../game/fighters';
import { WEIGHT_CLASSES, formatHeight } from '../../game/weightClasses';
import { Portrait } from '../../assets/portraits';
import { GlovesEmblem } from '../GlovesEmblem';
import './WalkInCard.css';

export function WalkInCard({ fighter }: { fighter: Fighter }) {
  const cls = WEIGHT_CLASSES[fighter.weightClass];

  const stats: Array<[string, string]> = [
    ['Age', String(fighterAge(fighter))],
    ['Height', formatHeight(fighter.heightInches)],
    ['Weight', `${fighter.weightLbs} lbs`],
    ['Weight Class', cls.name],
  ];

  return (
    <div className="wic">
      <span className="wic__clip" aria-hidden="true" />

      <div className="wic__frame">
        <div className="wic__banner">
          <span className="wic__star">★</span>
          <span className="wic__banner-text">Walk-In Card</span>
          <span className="wic__star">★</span>
        </div>

        <div className="wic__top">
          <div className="wic__portrait">
            <Portrait appearance={fighter.appearance} size={150} />
          </div>

          <div className="wic__info">
            <span className="wic__label">Name:</span>
            <h3 className="wic__name">
              {fighter.firstName}{' '}
              {fighter.nickname && <span className="wic__nick">“{fighter.nickname}”</span>}{' '}
              {fighter.lastName}
            </h3>

            <dl className="wic__stats">
              {stats.map(([k, v]) => (
                <div className="wic__stat" key={k}>
                  <dt>{k}:</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="wic__statement">
          <p className="wic__statement-label">Why I Want To Train Here:</p>
          <div className="wic__statement-box">
            <p className="wic__statement-text">{fighter.statement}</p>
          </div>
        </div>

        <div className="wic__impression">
          <GlovesEmblem size={30} className="wic__gloves" />
          <span className="wic__impression-label">First Impression:</span>
          <span className="wic__impression-text">{fighter.firstImpression}</span>
        </div>

        <div className="wic__read">
          <span className="wic__read-label">Your Read:</span>
          <span className="wic__read-text">{fighter.ceilingRead}</span>
        </div>
      </div>
    </div>
  );
}
