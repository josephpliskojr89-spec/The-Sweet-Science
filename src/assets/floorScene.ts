/*
  Floor scene registry
  --------------------------------------------------------------------------
  The gym floor is one piece of real art with interactive objects positioned
  over it. All coordinates are PERCENTAGES of the image frame (x left→right,
  y top→bottom), so they track the image at any window size — the scene
  scales like background-size: cover, anchored center.

  To swap art: replace public/floor/gym-floor.jpg and adjust the rects here.
*/

export interface SceneRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const FLOOR_SCENE = {
  src: '/floor/gym-floor.jpg',
  /** image aspect ratio, width / height */
  aspect: 16 / 9,

  /** OFFICE sign + door */
  officeDoor: { x: 14.8, y: 23.5, w: 14.2, h: 69 } as SceneRect,
  /** LOCKER ROOM sign + door */
  lockerDoor: { x: 32.6, y: 23.5, w: 13.8, h: 69 } as SceneRect,
  /** the corkboard's inner cork (slips live inside this) */
  corkboard: { x: 52.2, y: 28.8, w: 23.6, h: 32.6 } as SceneRect,
  /** the wall calendar pad (below the spiral binding) */
  calendar: { x: 79.9, y: 28.6, w: 13.2, h: 26.6 } as SceneRect,
  /** where walk-in slips collect: the office door threshold */
  officeThreshold: { x: 16, y: 89.5, w: 12, h: 3.5 } as SceneRect,
} as const;
