/*
  Cities
  --------------------------------------------------------------------------
  The fifteen authentic American boxing cities, each mapped to a region and a
  style archetype, plus the descriptive text from the bible used on the city
  selection screen and as opening-scene narration.

  City SELECTION is Phase 2 work. This data is defined now because it is the
  source of truth the rest of the game reads from, and Phase 1's regional gym
  background needs the city -> region mapping to exist. Nothing here is
  gameplay logic — it is the world's reference data.

  Las Vegas is included as a non-selectable DESTINATION, exactly as the bible
  specifies. `selectable: false` keeps it out of the starting-city pool while
  still letting it appear as flavor.
*/

import type { RegionKey } from './regions';

export type CityId =
  | 'new_york'
  | 'philadelphia'
  | 'boston'
  | 'baltimore'
  | 'detroit'
  | 'cleveland'
  | 'chicago'
  | 'cincinnati'
  | 'atlanta'
  | 'memphis'
  | 'houston'
  | 'los_angeles'
  | 'san_francisco'
  | 'san_diego'
  | 'las_vegas';

/** The style archetype keys used across walk-ins, gyms, and training culture. */
export type StyleArchetype =
  | 'slick_boxer'
  | 'pressure_fighter'
  | 'iron_chin'
  | 'unorthodox'
  | 'power_puncher'
  | 'workhorse'
  | 'counterpuncher'
  | 'hybrid'
  | 'athletic'
  | 'hungry'
  | 'physical'
  | 'showman'
  | 'technical'
  | 'blue_collar';

export interface City {
  id: CityId;
  name: string;
  state: string;
  region: RegionKey;
  /** Whether this city can be chosen as a starting city. Las Vegas cannot. */
  selectable: boolean;
  archetype: StyleArchetype;
  /** Short style line shown beneath the description on selection. */
  styleLine: string;
  /** Full descriptive copy — city selection screen + opening scene narration. */
  description: string;
}

export const CITIES: Record<CityId, City> = {
  new_york: {
    id: 'new_york',
    name: 'New York',
    state: 'New York',
    region: 'northeast',
    selectable: true,
    archetype: 'slick_boxer',
    styleLine: 'Slick boxers, amateur pedigree, technical mastery.',
    description:
      'The fight capital of America.\n\nIn 1975, every kid with a dream and a pair of gloves thinks he belongs in New York. The city is overflowing with gyms, managers, trainers, and fighters chasing the same opportunities. Talent is everywhere, but so is competition. If you’re going to succeed here, you’ll need to find the fighters everyone else overlooked.',
  },
  philadelphia: {
    id: 'philadelphia',
    name: 'Philadelphia',
    state: 'Pennsylvania',
    region: 'northeast',
    selectable: true,
    archetype: 'pressure_fighter',
    styleLine: 'Pressure fighters, relentless aggression, blue-collar toughness.',
    description:
      'This city doesn’t produce pretty fighters.\n\nPhiladelphia gyms are full of men who learned to fight because life demanded it. They come forward, they work the body, and they don’t stop. Talent is plentiful, but so are opinions. Every corner of the city thinks it knows boxing better than you.',
  },
  boston: {
    id: 'boston',
    name: 'Boston',
    state: 'Massachusetts',
    region: 'northeast',
    selectable: true,
    archetype: 'iron_chin',
    styleLine: 'Iron chins, relentless pressure, wars of attrition.',
    description:
      'Hard winters make hard men.\n\nBoston’s fight scene is built on grit rather than glamour. Fighters here aren’t known for avoiding punishment — they’re known for surviving it. A Boston prospect might not be the most talented man in the ring, but he might be the last one standing.',
  },
  baltimore: {
    id: 'baltimore',
    name: 'Baltimore',
    state: 'Maryland',
    region: 'northeast',
    selectable: true,
    archetype: 'unorthodox',
    styleLine: 'Scrappy, unpredictable, self-taught.',
    description:
      'A city full of fighters who learned without permission.\n\nBaltimore’s boxing culture thrives in overlooked neighborhoods and small gyms. Fighters arrive with strange habits, unconventional techniques, and a chip on their shoulder. What they lack in polish, they often make up for in creativity and hunger.',
  },
  detroit: {
    id: 'detroit',
    name: 'Detroit',
    state: 'Michigan',
    region: 'midwest',
    selectable: true,
    archetype: 'power_puncher',
    styleLine: 'Power punchers, aggressive finishers, knockout artists.',
    description:
      'The Motor City builds punchers.\n\nFactory work, economic hardship, and a proud boxing tradition have produced generations of dangerous fighters. In Detroit, power is respected. Every prospect seems capable of ending a fight with a single mistake from his opponent.',
  },
  cleveland: {
    id: 'cleveland',
    name: 'Cleveland',
    state: 'Ohio',
    region: 'midwest',
    selectable: true,
    archetype: 'workhorse',
    styleLine: 'Workhorses, stamina, disciplined pressure.',
    description:
      'No nonsense. No shortcuts.\n\nCleveland fighters earn everything the hard way. They may not attract headlines, but they train hard, fight hard, and rarely beat themselves. Opponents often discover too late that Cleveland fighters are still coming long after everyone expected them to fade.',
  },
  chicago: {
    id: 'chicago',
    name: 'Chicago',
    state: 'Illinois',
    region: 'midwest',
    selectable: true,
    archetype: 'counterpuncher',
    styleLine: 'Counterpunchers, tacticians, ring thinkers.',
    description:
      'Patience is a weapon.\n\nChicago’s boxing culture rewards intelligence as much as toughness. Fighters here learn to think, adapt, and punish mistakes. They don’t always lead the dance, but they’re very good at deciding how it ends.',
  },
  cincinnati: {
    id: 'cincinnati',
    name: 'Cincinnati',
    state: 'Ohio',
    region: 'midwest',
    selectable: true,
    archetype: 'hybrid',
    styleLine: 'Balanced fighters, adaptable, blue-collar resilience.',
    description:
      'Where North meets South.\n\nCincinnati sits at the crossroads of multiple boxing traditions. Fighters arrive with a little bit of everything — Midwestern discipline, Southern toughness, and a willingness to adapt. It’s a city full of versatile prospects who don’t fit easy labels.',
  },
  atlanta: {
    id: 'atlanta',
    name: 'Atlanta',
    state: 'Georgia',
    region: 'south',
    selectable: true,
    archetype: 'athletic',
    styleLine: 'Athletic, fast, high ceiling.',
    description:
      'The future is arriving.\n\nAtlanta’s boxing scene isn’t yet as established as the great northern fight cities, but the talent is impossible to ignore. Athletes walk through your doors every day. Raw, explosive, and sometimes undisciplined, they represent enormous potential.',
  },
  memphis: {
    id: 'memphis',
    name: 'Memphis',
    state: 'Tennessee',
    region: 'south',
    selectable: true,
    archetype: 'hungry',
    styleLine: 'Tough, hungry, overlooked contenders.',
    description:
      'Nobody’s coming to save you.\n\nThe infrastructure is thin. The opportunities are limited. The fighters who emerge from Memphis usually do so through sheer determination. If you build a successful gym here, you’ll become one of the few serious boxing operations in the region.',
  },
  houston: {
    id: 'houston',
    name: 'Houston',
    state: 'Texas',
    region: 'south',
    selectable: true,
    archetype: 'physical',
    styleLine: 'Big, strong, physically overwhelming.',
    description:
      'Everything is bigger.\n\nHouston produces physically imposing fighters with strength to spare. Technique sometimes lags behind athletic gifts, but when a Houston fighter learns how to use his size, he becomes a problem for anyone standing across from him.',
  },
  los_angeles: {
    id: 'los_angeles',
    name: 'Los Angeles',
    state: 'California',
    region: 'west',
    selectable: true,
    archetype: 'showman',
    styleLine: 'Showmen, charismatic fighters, marketable talent.',
    description:
      'Boxing under the bright lights.\n\nLos Angeles offers opportunity unlike anywhere else. The city attracts dreamers, entertainers, and ambitious fighters looking for their break. The spotlight is always nearby, but so are distractions.',
  },
  san_francisco: {
    id: 'san_francisco',
    name: 'San Francisco',
    state: 'California',
    region: 'west',
    selectable: true,
    archetype: 'technical',
    styleLine: 'Technical, disciplined, fundamentally sound.',
    description:
      'A fight town with old roots.\n\nSan Francisco’s boxing history runs deep. The city’s gyms produce disciplined fighters who understand fundamentals and respect the craft. Success here is usually earned through patience and technical excellence rather than flash.',
  },
  san_diego: {
    id: 'san_diego',
    name: 'San Diego',
    state: 'California',
    region: 'west',
    selectable: true,
    archetype: 'blue_collar',
    styleLine: 'Tough, blue-collar, Latino influence.',
    description:
      'An emerging frontier.\n\nThe major boxing powers largely ignore San Diego in 1975, creating opportunity for those willing to build something. The city’s military presence, working-class culture, and growing Latino communities create a unique pipeline of determined fighters.',
  },
  las_vegas: {
    id: 'las_vegas',
    name: 'Las Vegas',
    state: 'Nevada',
    region: 'west',
    selectable: false,
    archetype: 'showman',
    styleLine: 'A destination, not a starting point.',
    description:
      'You don’t start here.\n\nLas Vegas is where careers are tested, titles are won, and legends are made. Every fighter dreams of hearing his name announced beneath the bright lights of the Strip.\n\nThe question isn’t how to build a gym in Las Vegas. The question is whether one of your fighters can make it there.',
  },
};

/** Insertion order is the display order used on the (future) selection screen. */
export const CITY_ORDER: CityId[] = [
  'new_york',
  'philadelphia',
  'boston',
  'baltimore',
  'detroit',
  'cleveland',
  'chicago',
  'cincinnati',
  'atlanta',
  'memphis',
  'houston',
  'los_angeles',
  'san_francisco',
  'san_diego',
  'las_vegas',
];

export const SELECTABLE_CITIES: City[] = CITY_ORDER.map((id) => CITIES[id]).filter(
  (c) => c.selectable,
);

export function getCity(id: CityId): City {
  return CITIES[id];
}
