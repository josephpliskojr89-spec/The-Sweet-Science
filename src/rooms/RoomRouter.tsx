/*
  RoomRouter
  --------------------------------------------------------------------------
  Picks the interior for the open room. My Office has its Phase 3 walk-in desk;
  the Locker Room is the Phase 4 roster + hierarchy; the rest are labeled
  placeholders until their phases land.
*/

import { useGame } from '../state/GameContext';
import { RoomPlaceholder } from './RoomPlaceholder';
import { OfficeRoom } from './OfficeRoom';
import { LockerRoom } from './LockerRoom';

export function RoomRouter() {
  const { activeRoom, save } = useGame();
  if (!activeRoom || !save) return null;

  switch (activeRoom) {
    case 'office':
      return <OfficeRoom />;
    case 'locker':
      return <LockerRoom />;
    case 'gym':
      return <RoomPlaceholder roomKey="gym" />;
    case 'calendar':
      return <RoomPlaceholder roomKey="calendar" />;
  }
}
