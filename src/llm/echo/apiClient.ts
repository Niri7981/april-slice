import type { AgentBrainInput, AgentBrainOutput } from "./brainTypes";
import { agentBrainOutputSchema } from "./brainTypes";

export const requestEchoResolution = async ({
  apiUrl,
  input,
}: {
  apiUrl: string;
  input: AgentBrainInput;
}): Promise<AgentBrainOutput> => {
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ input }),
  });

  if (!response.ok) {
    throw new Error(`Echo request failed with ${response.status}`);
  }

  return agentBrainOutputSchema.parse(await response.json());
};
