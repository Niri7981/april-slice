import type { InitialHand } from "./initialHand";
import { initialHandSchema } from "./initialHand";
import type { AstrologyChartSeed } from "./astrologyChart";
import { buildInitialHandPrompt } from "./initialHandPrompt";

export type InitialHandInterpreter = (input: {
  chart: AstrologyChartSeed;
  prompt: string;
}) => InitialHand | Promise<InitialHand>;

export const resolveInitialHandFromAstrology = async ({
  chart,
  interpret,
}: {
  chart: AstrologyChartSeed;
  interpret: InitialHandInterpreter;
}): Promise<InitialHand> => {
  const output = await interpret({
    chart,
    prompt: buildInitialHandPrompt({ chart }),
  });

  return initialHandSchema.parse(output);
};
