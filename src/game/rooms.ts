/*
  Rooms
  --------------------------------------------------------------------------
  The four rooms reachable from the gym floor, with the bible's description of
  what each one is FOR. Phase 1 renders these as spatial panels over the gym
  background and opens each to a placeholder that lists its future contents, so
  the navigation is whole and the later phases have a labeled home to land in.
*/

import type { RoomKey } from '../state/GameContext';

export interface RoomDef {
  key: RoomKey;
  name: string;
  /** One-line identity shown on the floor panel. */
  tagline: string;
  /** The bullet list of what this room will hold (from the bible). */
  contents: string[];
  /** Which build phase brings this room to life, for the placeholder note. */
  arrivesIn: string;
}

export const ROOMS: Record<RoomKey, RoomDef> = {
  office: {
    key: 'office',
    name: 'My Office',
    tagline: 'The business and administrative side. Less glamorous, most consequential.',
    contents: [
      'Book fights for your fighters',
      'View and manage finances',
      'Purchase gym upgrades',
      'Hire and manage coaches',
      'Review incoming walk-in cards',
      'Rival Gyms — intelligence on competing operations',
    ],
    arrivesIn: 'Phases 3 & 6',
  },
  calendar: {
    key: 'calendar',
    name: 'Calendar',
    tagline: 'The temporal hub. Your schedule at a glance.',
    contents: [
      'View upcoming fights',
      'View active and upcoming training camps',
      'Track fighter availability and recovery',
    ],
    arrivesIn: 'Phase 7',
  },
  gym: {
    key: 'gym',
    name: 'My Gym',
    tagline: 'Active training management. The day-to-day craft.',
    contents: [
      'Assign focused training to individual fighters',
      'Set training focuses for each coach',
      'Monitor fighter development in progress',
    ],
    arrivesIn: 'Phase 5',
  },
  locker: {
    key: 'locker',
    name: 'Locker Room',
    tagline: 'Your full roster. The hierarchy of your operation.',
    contents: [
      'View all fighters and their current status',
      'Review profiles, attributes, and known traits',
      'Manage locker assignments (20 lockers)',
      'Set gym hierarchy — must keep, watch list, chopping block',
    ],
    arrivesIn: 'Phase 4',
  },
};

/** Spatial order on the floor: office | gym | locker | calendar. */
export const ROOM_ORDER: RoomKey[] = ['office', 'gym', 'locker', 'calendar'];
