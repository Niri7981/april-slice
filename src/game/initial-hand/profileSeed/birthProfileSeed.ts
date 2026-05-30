import { buildEasternBirthSeed } from "./easternBirthSeed";
import type { BirthProfileInput, BirthProfileSeed } from "./birthProfileTypes";
import { buildWesternAstrologySeed } from "./westernAstrologySeed";

export const buildBirthProfileSeed = (
  input: BirthProfileInput,
): BirthProfileSeed => ({
  name: input.name,
  birthDate: input.birthDate,
  birthTime: input.birthTime ?? null,
  birthPlace: input.birthPlace ?? null,
  precision: {
    birthTimeKnown: Boolean(input.birthTime),
    birthPlaceKnown: Boolean(input.birthPlace),
    risingSignKnown: Boolean(input.birthTime && input.birthPlace),
    easternHourPillarKnown: Boolean(input.birthTime),
  },
  western: buildWesternAstrologySeed(input),
  eastern: buildEasternBirthSeed(input),
});

export type {
  BirthPlaceSeed,
  BirthProfileInput,
  BirthProfileSeed,
  ChineseElement,
  ChinesePillarSeed,
  EasternBirthSeed,
  WesternAstrologySeed,
  WesternPlanetName,
  ZodiacElement,
  ZodiacModality,
  ZodiacPlacement,
  ZodiacSign,
} from "./birthProfileTypes";
