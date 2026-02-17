export const CHARACTERS = [
  "Jake and Elwood",
  "The Empire Carpet Guy",
  "Aunt Seana",
  "Cheryl Scott",
  "Tom Skilling",
  "Abe Froman",
  "Uncle Buck",
  "Roxie Hart",
  "Eddie and Jobo",
  "Glen Lerner",
  "Lin Brehmer",
];

export const LOCATIONS = [
  "O'Hare", "Rogers Park", "West Ridge", "Lincoln Square", "Edgewater",
  "Andersonville", "Uptown", "Buena Park", "North Park", "Albany Park",
  "Forest Glen", "Norwood Park", "Jefferson Park", "Bowmanville", "North Center",
  "Lake View", "Lincoln Park", "Avondale", "Logan Square", "Portage Park",
  "Irving Park", "Dunning", "Montclare", "Belmont Cragin", "Hermosa",
  "West Town", "Austin", "West Garfield Park", "East Garfield Park",
  "Near West Side", "North Lawndale", "South Lawndale", "Old Town",
  "The Gold Coast", "River North", "The Loop", "Near South Side", "Pilsen",
  "Douglas", "Oakland", "Fuller Park", "Grand Boulevard", "Kenwood",
  "Washington Park", "Hyde Park", "Woodlawn", "South Shore", "Bridgeport",
  "Chinatown", "New City", "West Elsdon", "Gage Park", "Brighton Park",
  "McKinley Park", "Garfield Ridge", "Archer Heights", "Clearing", "West Lawn",
  "Chicago Lawn", "West Englewood", "Englewood", "Greater Grand Crossing",
  "Ashburn", "Auburn Gresham", "Beverly", "Washington Heights", "Mount Greenwood",
  "Morgan Park", "Chatham", "Avalon Park", "South Chicago", "Burnside",
  "Calumet Heights", "Roseland", "Pullman", "South Deering", "East Side",
  "West Pullman", "Riverdale", "Hegewisch",
];

/** Simple seeded pseudo-random using the date string */
function seededRandom(seed: string): () => number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
    h = Math.imul(h ^ (h >>> 13), 0x45d9f3b);
    h = (h ^ (h >>> 16)) >>> 0;
    return h / 0x100000000;
  };
}

export interface DailyMission {
  character: string;
  startLocation: string;
  endLocation: string;
}

export function getDailyMission(dateKey: string): DailyMission {
  const rng = seededRandom(dateKey);
  const character = CHARACTERS[Math.floor(rng() * CHARACTERS.length)];
  const startIdx = Math.floor(rng() * LOCATIONS.length);
  let endIdx = Math.floor(rng() * (LOCATIONS.length - 1));
  if (endIdx >= startIdx) endIdx++;
  return {
    character,
    startLocation: LOCATIONS[startIdx],
    endLocation: LOCATIONS[endIdx],
  };
}
