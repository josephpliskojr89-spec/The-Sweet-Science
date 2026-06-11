/*
  Game Events
  --------------------------------------------------------------------------
  A minimal synchronous event bus — the spine the bible's v2.8 architectural
  commitment asks for: traits (and later the press, life events, psychology)
  must be able to respond to ANY system that fires an event, not exclusively
  to fight outcomes.

  Systems fire events through `emitGameEvent`; responders subscribe with
  `onGameEvent`. Today the only registered responder is the trait-response
  stub below, and nothing mechanical happens yet — the value is that every
  future system (training, fights, press, life events) emits through this one
  seam, so trait reveals and trait movement hook in without retrofitting.

  The bus is intentionally synchronous and stateless: handlers receive the
  event plus whatever the emitter knows. State changes stay in the emitter's
  commit path — handlers return optional "responses" the emitter may apply.
*/

import type { TraitKey } from './traits';

/** Every event the world can currently describe. Grows with the phases. */
export type GameEvent =
  // Walk-in / roster lifecycle (live today)
  | { type: 'walkin_accepted'; fighterId: string; withLocker: boolean }
  | { type: 'walkin_turned_away'; fighterId: string }
  | { type: 'locker_granted'; fighterId: string }
  | { type: 'locker_taken'; fighterId: string }
  | { type: 'fighter_cut'; fighterId: string; stayed: boolean }
  | { type: 'fighter_quit'; fighterId: string }
  | { type: 'fighter_left_for_opportunity'; fighterId: string }
  // Future systems (declared so emitters can be written against them)
  | { type: 'fight_result'; fighterId: string; won: boolean }
  | { type: 'press_coverage'; fighterId: string; tone: string }
  | { type: 'life_event'; fighterId: string; kind: string };

export type GameEventType = GameEvent['type'];

/** A reaction a responder suggests; the emitter decides whether to apply it. */
export interface TraitResponse {
  fighterId: string;
  /** A hidden trait that this moment made visible. */
  reveal?: TraitKey;
  /** One human line for the notice/toast if the emitter wants to surface it. */
  note?: string;
}

type Handler = (event: GameEvent) => TraitResponse[] | void;

const handlers: Handler[] = [];

export function onGameEvent(handler: Handler): () => void {
  handlers.push(handler);
  return () => {
    const i = handlers.indexOf(handler);
    if (i >= 0) handlers.splice(i, 1);
  };
}

/** Fire an event; collect any trait responses the responders suggest. */
export function emitGameEvent(event: GameEvent): TraitResponse[] {
  const out: TraitResponse[] = [];
  for (const h of handlers) {
    const res = h(event);
    if (res) out.push(...res);
  }
  return out;
}

/*
  Trait-response stub
  --------------------------------------------------------------------------
  The registered responder that later phases grow into the real trait system
  (reveals under pressure, trait movement, press interaction). It listens to
  everything and currently suggests nothing — the wiring, not the behavior,
  is the Phase 4 deliverable.
*/
function traitResponder(_event: GameEvent): TraitResponse[] | void {
  // Phase 8 (fights) and Phase 9 (press) give this real logic, e.g.:
  //   fight_result + badly hurt + rallied  -> reveal 'lionheart'
  //   press_coverage tone 'skeptic' + chip_on_shoulder -> training surge
  return;
}

onGameEvent(traitResponder);
