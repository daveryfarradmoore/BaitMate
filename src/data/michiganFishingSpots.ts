export type MichiganFishSpeciesId =
  | 'largemouth-bass'
  | 'smallmouth-bass'
  | 'walleye'
  | 'northern-pike'
  | 'muskellunge'
  | 'trout'
  | 'salmon'
  | 'panfish'
  | 'catfish';

export interface MichiganFishSpecies {
  id: MichiganFishSpeciesId;
  name: string;
  shortName: string;
  color: string;
}

export interface MichiganFishingSpot {
  id: string;
  name: string;
  waterBody: string;
  region: string;
  latitude: number;
  longitude: number;
  species: MichiganFishSpeciesId[];
  accessNote: string;
}

export const MICHIGAN_FISH_SPECIES: MichiganFishSpecies[] = [
  { id: 'largemouth-bass', name: 'Largemouth Bass', shortName: 'Largemouth', color: '#2E8B57' },
  { id: 'smallmouth-bass', name: 'Smallmouth Bass', shortName: 'Smallmouth', color: '#7B8D42' },
  { id: 'walleye', name: 'Walleye', shortName: 'Walleye', color: '#C59321' },
  { id: 'northern-pike', name: 'Northern Pike', shortName: 'Pike', color: '#427A5B' },
  { id: 'muskellunge', name: 'Muskellunge', shortName: 'Muskie', color: '#755A35' },
  { id: 'trout', name: 'Trout', shortName: 'Trout', color: '#3F7CAC' },
  { id: 'salmon', name: 'Salmon', shortName: 'Salmon', color: '#D05B56' },
  { id: 'panfish', name: 'Panfish', shortName: 'Panfish', color: '#995FA3' },
  { id: 'catfish', name: 'Catfish', shortName: 'Catfish', color: '#5D6771' },
];

/**
 * Starter discovery areas around public Michigan waters. These are intentionally
 * presented as suggested areas rather than guarantees of fish activity or access.
 */
export const MICHIGAN_FISHING_SPOTS: MichiganFishingSpot[] = [
  {
    id: 'lake-st-clair',
    name: 'Lake St. Clair shoreline',
    waterBody: 'Lake St. Clair',
    region: 'Harrison Township',
    latitude: 42.5715,
    longitude: -82.8014,
    species: ['smallmouth-bass', 'walleye', 'northern-pike', 'muskellunge', 'panfish'],
    accessNote: 'Explore signed shoreline and launch access near the metropark.',
  },
  {
    id: 'detroit-river',
    name: 'Detroit River channel',
    waterBody: 'Detroit River',
    region: 'Belle Isle',
    latitude: 42.3386,
    longitude: -82.9824,
    species: ['walleye', 'smallmouth-bass', 'catfish', 'panfish'],
    accessNote: 'Check current park hours and posted fishing restrictions.',
  },
  {
    id: 'huron-river',
    name: 'Huron River bends',
    waterBody: 'Huron River',
    region: 'Ann Arbor',
    latitude: 42.2782,
    longitude: -83.6936,
    species: ['smallmouth-bass', 'panfish', 'catfish'],
    accessNote: 'Use designated park access and respect seasonal closures.',
  },
  {
    id: 'lake-lansing',
    name: 'Lake Lansing basin',
    waterBody: 'Lake Lansing',
    region: 'Haslett',
    latitude: 42.7732,
    longitude: -84.3511,
    species: ['largemouth-bass', 'northern-pike', 'panfish'],
    accessNote: 'Public launch and shoreline options vary by season.',
  },
  {
    id: 'saginaw-bay',
    name: 'Saginaw Bay flats',
    waterBody: 'Lake Huron',
    region: 'Bay City',
    latitude: 43.7228,
    longitude: -83.7988,
    species: ['walleye', 'northern-pike', 'panfish'],
    accessNote: 'Watch marine forecasts; conditions can change quickly.',
  },
  {
    id: 'au-sable',
    name: 'Au Sable River corridor',
    waterBody: 'Au Sable River',
    region: 'Grayling',
    latitude: 44.6566,
    longitude: -84.7084,
    species: ['trout'],
    accessNote: 'Review fly-only reaches, seasons, and special regulations.',
  },
  {
    id: 'pere-marquette',
    name: 'Pere Marquette River run',
    waterBody: 'Pere Marquette River',
    region: 'Scottville',
    latitude: 43.9544,
    longitude: -86.2795,
    species: ['salmon', 'trout'],
    accessNote: 'Seasonal runs are popular; verify access and river rules.',
  },
  {
    id: 'torch-lake',
    name: 'Torch Lake drop-offs',
    waterBody: 'Torch Lake',
    region: 'Antrim County',
    latitude: 44.9781,
    longitude: -85.3222,
    species: ['smallmouth-bass', 'trout', 'northern-pike'],
    accessNote: 'Use established launches and prepare for deep, cold water.',
  },
  {
    id: 'lake-gogebic',
    name: 'Lake Gogebic structure',
    waterBody: 'Lake Gogebic',
    region: 'Upper Peninsula',
    latitude: 46.4965,
    longitude: -89.5844,
    species: ['walleye', 'northern-pike', 'panfish'],
    accessNote: 'Remote conditions require extra weather and safety planning.',
  },
];

