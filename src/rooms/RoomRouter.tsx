/*
  RoomRouter
  --------------------------------------------------------------------------
  Picks the interior for the open room. My Office has its Phase 3 walk-in desk;
  the Locker Room shows a live roster summary above its Phase 4 roadmap; the
  rest are labeled placeholders until their phases land.
*/

import { useGame, lockersUsed } from '../state/GameContext';
import { LOCKER_CAP } from '../state/persistence';
import { RoomPlaceholder } from './RoomPlaceholder';
import { OfficeRoom } from './OfficeRoom';

export function RoomRouter() {
  const { activeRoom, save } = useGame();
  if (!activeRoom || !save) return null;

  switch (activeRoom) {
    case 'office':
      return <OfficeRoom />;
    case 'locker': {
      const count = save.roster.length;
      const withLockers = lockersUsed(save);
      const summary =
        count === 0 ? (
          <>No fighters yet — accept a walk-in to start your stable.</>
        ) : (
          <>
            <strong>{count}</strong> {count === 1 ? 'fighter' : 'fighters'} in the gym ·{' '}
            <strong>{withLockers}</strong> of {LOCKER_CAP} lockers filled
          </>
        );
      return <RoomPlaceholder roomKey="locker" summary={summary} />;
    }
    case 'gym':
      return <RoomPlaceholder roomKey="gym" />;
    case 'calendar':
      return <RoomPlaceholder roomKey="calendar" />;
  }
}
