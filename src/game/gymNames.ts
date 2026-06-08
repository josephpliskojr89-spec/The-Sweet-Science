/*
  Gym Names
  --------------------------------------------------------------------------
  A small procedural composer for the player's "Surprise me" gym name, in the
  same idiom as the competing gyms in the database: a place/landmark word plus
  a kind-of-room. Period-plausible, never licensed. The player can always type
  their own — this is just a nudge.
*/

const PLACES = [
  'Front Street', 'Monument', 'Harbor', 'Lakefront', 'Eastside', 'Westside',
  'Northside', 'South End', 'Union Hall', 'Liberty', 'Garfield', 'Lincoln',
  'Jackson', 'Court Street', 'Mill Creek', 'Riverside', 'Dockside', 'Iron Gate',
  'Crosstown', 'Park Avenue', 'Vine Street', 'Canal Street', 'Brickyard',
  'Stockyard', 'Cedar Street', 'Granite', 'Bridge Street', 'Market Street',
  'Cornerstone', 'Railyard', 'Foundry', 'Hilltop', 'Lamplight', 'Old Mill',
];

const KINDS = [
  'Boxing Club', 'Fight Gym', 'Athletic Club', 'Ring Club', 'Boxing Hall',
  'Fight House', 'Boxing Room', 'Ring Room', 'Athletic Hall', 'Boxing Academy',
  'Boxing Gym',
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateGymName(): string {
  return `${pick(PLACES)} ${pick(KINDS)}`;
}
