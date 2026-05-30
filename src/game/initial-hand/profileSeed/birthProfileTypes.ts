export type ZodiacSign =
  | "aries"
  | "taurus"
  | "gemini"
  | "cancer"
  | "leo"
  | "virgo"
  | "libra"
  | "scorpio"
  | "sagittarius"
  | "capricorn"
  | "aquarius"
  | "pisces";

export type ZodiacElement = "fire" | "earth" | "air" | "water";
export type ZodiacModality = "cardinal" | "fixed" | "mutable";
export type ChineseElement = "wood" | "fire" | "earth" | "metal" | "water";
export type WesternPlanetName =
  | "mercury"
  | "venus"
  | "mars"
  | "jupiter"
  | "saturn"
  | "uranus"
  | "neptune";

export type BirthPlaceSeed = {
  label: string;
  latitude: number;
  longitude: number;
  timeZoneOffsetHours?: number;
};

export type BirthProfileInput = {
  birthDate: string;
  birthTime?: string;
  birthPlace?: BirthPlaceSeed;
  name: string;
};

export type ZodiacPlacement = {
  sign: ZodiacSign;
  signLabel: string;
  element: ZodiacElement;
  modality: ZodiacModality;
  degree: number;
};

export type WesternAstrologySeed = {
  sun: ZodiacPlacement;
  moon: ZodiacPlacement;
  rising: ZodiacPlacement | null;
  planets: Record<WesternPlanetName, ZodiacPlacement>;
  elementBalance: ZodiacElement[];
  modalityBalance: ZodiacModality[];
  chartNotes: string[];
};

export type ChinesePillarSeed = {
  pillar: string;
  elementText: string;
  naYin: string;
  tenGod: string;
};

export type EasternBirthSeed = {
  yearPillar: ChinesePillarSeed;
  monthPillar: ChinesePillarSeed;
  dayPillar: ChinesePillarSeed;
  hourPillar: ChinesePillarSeed | null;
  zodiacAnimals: {
    year: string;
    month: string;
    day: string;
    hour: string | null;
  };
  season: string;
  moonPhase: string;
  solarTerms: {
    previous: string | null;
    next: string | null;
  };
  fiveElementLeanings: ChineseElement[];
  chartNotes: string[];
};

export type BirthProfileSeed = {
  name: string;
  birthDate: string;
  birthTime: string | null;
  birthPlace: BirthPlaceSeed | null;
  precision: {
    birthTimeKnown: boolean;
    birthPlaceKnown: boolean;
    risingSignKnown: boolean;
    easternHourPillarKnown: boolean;
  };
  western: WesternAstrologySeed;
  eastern: EasternBirthSeed;
};
