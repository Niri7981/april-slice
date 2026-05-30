import type { InitialHand } from "../model/initialHand";
import type { InitialHandOutputLanguage } from "../model/initialHand";
import { initialHandSchema } from "../model/initialHand";
import type { BirthProfileSeed } from "../profileSeed/birthProfileSeed";
import { buildInitialHandPrompt } from "../prompt/initialHandPrompt";

export type InitialHandInterpreter = (input: {
  chart: BirthProfileSeed;
  outputLanguage: InitialHandOutputLanguage;
  prompt: string;
}) => InitialHand | Promise<InitialHand>;

export const resolveInitialHandFromAstrology = async ({
  chart,
  interpret,
  outputLanguage,
}: {
  chart: BirthProfileSeed;
  interpret: InitialHandInterpreter;
  outputLanguage?: InitialHandOutputLanguage;
}): Promise<InitialHand> => {
  const resolvedOutputLanguage = outputLanguage ?? "en";
  const output = await interpret({
    chart,
    outputLanguage: resolvedOutputLanguage,
    prompt: buildInitialHandPrompt({
      chart,
      outputLanguage: resolvedOutputLanguage,
    }),
  });

  return initialHandSchema.parse(output);
};
