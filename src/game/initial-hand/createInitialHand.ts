import { buildAstrologyChartSeed, type AstrologyChartInput } from "./astrologyChart";
import { fallbackInitialHandInterpreter } from "./fallbackInitialHandInterpreter";
import { initialHandSchema } from "./initialHand";
import { resolveInitialHandFromAstrology } from "./initialHandResolver";

export const createFallbackInitialHand = (input: AstrologyChartInput) =>
  initialHandSchema.parse(
    fallbackInitialHandInterpreter({
      chart: buildAstrologyChartSeed(input),
    }),
  );

export const createInitialHand = async (input: AstrologyChartInput) =>
  resolveInitialHandFromAstrology({
    chart: buildAstrologyChartSeed(input),
    interpret: fallbackInitialHandInterpreter,
  });
