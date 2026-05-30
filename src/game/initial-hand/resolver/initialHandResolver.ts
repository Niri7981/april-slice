import type { InitialHand } from "../model/initialHand";
import { initialHandSchema } from "../model/initialHand";
import type { BirthProfileSeed } from "../profileSeed/birthProfileSeed";
import { buildInitialHandPrompt } from "../prompt/initialHandPrompt";

export type InitialHandInterpreter = (input: {
  chart: BirthProfileSeed;
  prompt: string;
}) => InitialHand | Promise<InitialHand>;

export const resolveInitialHandFromAstrology = async ({
  chart,
  interpret,
}: {
  chart: BirthProfileSeed;
  interpret: InitialHandInterpreter;
}): Promise<InitialHand> => {
  const output = await interpret({
    chart,
    prompt: buildInitialHandPrompt({ chart }),
  });

  return initialHandSchema.parse(output);
};
