import type { AgentBrainInput, AgentBrainOutput } from "./brainTypes";
import { requestEchoResolution } from "./apiClient";
import { passesToneFilter } from "./toneFilter";

export const resolveAgentBrainLlm = async ({
  apiUrl,
  input,
  fallbackResolver,
}: {
  apiUrl?: string;
  input: AgentBrainInput;
  fallbackResolver: (input: AgentBrainInput) => AgentBrainOutput;
}): Promise<AgentBrainOutput> => {
  if (!apiUrl) {
    return fallbackResolver(input);
  }

  try {
    const firstPass = await requestEchoResolution({ apiUrl, input });

    if (passesToneFilter(input, firstPass)) {
      return firstPass;
    }

    const secondPass = await requestEchoResolution({ apiUrl, input });

    if (passesToneFilter(input, secondPass)) {
      return secondPass;
    }

    return fallbackResolver(input);
  } catch {
    return fallbackResolver(input);
  }
};
