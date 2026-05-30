import {
  buildBirthProfileSeed,
  type BirthProfileInput,
} from "../profileSeed/birthProfileSeed";
import { fallbackInitialHandInterpreter } from "./fallbackInitialHandInterpreter";
import type { InitialHandOutputLanguage } from "../model/initialHand";
import { initialHandSchema } from "../model/initialHand";
import { resolveInitialHandFromAstrology } from "./initialHandResolver";

export const createFallbackInitialHand = (
  input: BirthProfileInput,
  outputLanguage: InitialHandOutputLanguage = "en",
) =>
  initialHandSchema.parse(
    fallbackInitialHandInterpreter({
      chart: buildBirthProfileSeed(input),
      outputLanguage,
    }),
  );

export const createInitialHand = async (
  input: BirthProfileInput,
  outputLanguage: InitialHandOutputLanguage = "en",
) =>
  resolveInitialHandFromAstrology({
    chart: buildBirthProfileSeed(input),
    interpret: fallbackInitialHandInterpreter,
    outputLanguage,
  });
