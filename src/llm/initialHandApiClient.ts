import {
  buildBirthProfileSeed,
  type BirthProfileInput,
} from "../game/initial-hand/profileSeed/birthProfileSeed";
import type { InitialHand } from "../game/initial-hand/model/initialHand";
import { initialHandSchema } from "../game/initial-hand/model/initialHand";

export const requestInitialHand = async ({
  apiUrl,
  input,
}: {
  apiUrl: string;
  input: BirthProfileInput;
}): Promise<InitialHand> => {
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chart: buildBirthProfileSeed(input),
    }),
  });

  if (!response.ok) {
    throw new Error(`Initial Hand request failed with ${response.status}`);
  }

  return initialHandSchema.parse(await response.json());
};
