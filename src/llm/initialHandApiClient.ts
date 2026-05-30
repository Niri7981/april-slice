import {
  buildAstrologyChartSeed,
  type AstrologyChartInput,
} from "../game/initial-hand/astrologyChart";
import type { InitialHand } from "../game/initial-hand/initialHand";
import { initialHandSchema } from "../game/initial-hand/initialHand";

export const requestInitialHand = async ({
  apiUrl,
  input,
}: {
  apiUrl: string;
  input: AstrologyChartInput;
}): Promise<InitialHand> => {
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chart: buildAstrologyChartSeed(input),
    }),
  });

  if (!response.ok) {
    throw new Error(`Initial Hand request failed with ${response.status}`);
  }

  return initialHandSchema.parse(await response.json());
};
