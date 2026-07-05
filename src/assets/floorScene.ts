/*
  Floor scene registry
  --------------------------------------------------------------------------
  The gym floor is one piece of real art with interactive objects positioned
  over it. All coordinates are PERCENTAGES of the image frame (x left→right,
  y top→bottom), so they track the image at any window size — the scene
  scales like background-size: cover, anchored center.

  Art: public/floor/gym-floor.jpg (2560×1440). Rects measured against it.
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
  officeDoor: { x: 15.2, y: 24.8, w: 12.2, h: 62 } as SceneRect,
  /** LOCKER ROOM sign + door */
  lockerDoor: { x: 33.1, y: 24.8, w: 12, h: 62.2 } as SceneRect,
  /** the corkboard's inner cork (slips live inside this) */
  corkboard: { x: 51.8, y: 30, w: 24.4, h: 26.6 } as SceneRect,
  /** the wall calendar pad (below the spiral binding) */
  calendar: { x: 79.9, y: 29.4, w: 9.9, h: 19.6 } as SceneRect,
  /** where walk-in slips collect: the office door threshold */
  officeThreshold: { x: 16, y: 84.6, w: 10.6, h: 3.2 } as SceneRect,
} as const;
