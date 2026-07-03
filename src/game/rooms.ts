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
      'Review incoming walk-in cards',
      'Book fights for your fighters',
      'View and manage finances',
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
    tagline: 'Your training identity and coaching staff.',
    contents: [
      'Your gym’s training philosophy',
      'Focused-training capacity (you, plus coaches)',
      'Hire and assign coaches',
      'Gym upgrades — lockers, equipment, facilities',
      'Per-fighter training lives in the Locker Room',
    ],
    arrivesIn: 'Phase 6',
  },
  locker: {
    key: 'locker',
    name: 'Locker Room',
    tagline: 'Your full roster. The hierarchy of your operation.',
    contents: [
      'View all fighters and their current status',
      'Review profiles, attributes, and known traits',
      'Manage locker assignments',
      'Set gym hierarchy — must keep, watch list, chopping block',
    ],
    arrivesIn: 'Phase 4',
  },
  press: {
    key: 'press',
    name: 'The Press',
    tagline: 'The papers and the magazine — your window on the sport.',
    contents: [
      'The local sporting page — results, rumor, your gym in print',
      'The national magazine — the official rankings, division by division',
      'Where the world reports itself, week by week',
    ],
    arrivesIn: 'Phase 6',
  },
};

/** Spatial order on the floor. */
export const ROOM_ORDER: RoomKey[] = ['office', 'gym', 'locker', 'press', 'calendar'];
