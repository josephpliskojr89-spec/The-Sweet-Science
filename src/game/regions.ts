/*
  Regions
  --------------------------------------------------------------------------
  The four regions of the 1975 boxing world. Each has its own gym background
  asset (procedural placeholder for now, real art later) and a distinct but
  uniformly dark/amber palette so the world feels like one continuous place.

  The `palette` here drives the procedural RegionalGymBackground. When real
  background art is delivered, it drops into the same `RegionKey` slot via the
  background registry — no other code changes.
*/

export type RegionKey = 'northeast' | 'midwest' | 'south' | 'west';

export interface RegionPalette {
  /** Deep ambient wall color behind everything. */
  wall: string;
  /** Floor / foreground tone. */
  floor: string;
  /** The light coming through the high windows. */
  daylight: string;
  /** The desk-lamp / overhead bulb glow. */
  lamp: string;
  /** Accent used for ring ropes, signage edges. */
  accent: string;
}

export interface Region {
  key: RegionKey;
  name: string;
  /** One line of mood used on the region preview during review. */
  mood: string;
  palette: RegionPalette;
}

export const REGIONS: Record<RegionKey, Region> = {
  northeast: {
    key: 'northeast',
    name: 'Northeast',
    mood: 'Cold brick and radiator heat. The fight capital breathes here.',
    palette: {
      wall: '#1a1510',
      floor: '#3a2c1d',
      daylight: '#6b7385',
      lamp: '#e8b566',
      accent: '#b87a2e',
    },
  },
  midwest: {
    key: 'midwest',
    name: 'Midwest',
    mood: 'Factory iron and furnace light. Hard town, hard hands.',
    palette: {
      wall: '#17130f',
      floor: '#34281b',
      daylight: '#7a6f5a',
      lamp: '#e0a85a',
      accent: '#a6432a',
    },
  },
  south: {
    key: 'south',
    name: 'South',
    mood: 'Dust in the light, heat in the walls. Built in obscurity.',
    palette: {
      wall: '#1d160f',
      floor: '#43321f',
      daylight: '#c08a4a',
      lamp: '#e8b566',
      accent: '#b87a2e',
    },
  },
  west: {
    key: 'west',
    name: 'West',
    mood: 'Low sun through the haze. Bright lights and long shadows.',
    palette: {
      wall: '#1b1410',
      floor: '#3f2e1c',
      daylight: '#d99a4e',
      lamp: '#e8b566',
      accent: '#9c3a26',
    },
  },
};

export const REGION_ORDER: RegionKey[] = ['northeast', 'midwest', 'south', 'west'];

export function getRegion(key: RegionKey): Region {
  return REGIONS[key];
}
