import {
  buildBirthProfileSeed,
  type BirthProfileInput,
} from "../profileSeed/birthProfileSeed";
import { fallbackInitialHandInterpreter } from "./fallbackInitialHandInterpreter";
import { initialHandSchema } from "../model/initialHand";
import { resolveInitialHandFromAstrology } from "./initialHandResolver";

export const createFallbackInitialHand = (input: BirthProfileInput) =>
  initialHandSchema.parse(
    fallbackInitialHandInterpreter({
      chart: buildBirthProfileSeed(input),
    }),
  );

export const createInitialHand = async (input: BirthProfileInput) =>
  resolveInitialHandFromAstrology({
    chart: buildBirthProfileSeed(input),
    interpret: fallbackInitialHandInterpreter,
  });
