import {
  buildBirthProfileSeed,
  type BirthProfileInput,
} from "../game/initial-hand/profileSeed/birthProfileSeed";
import type { InitialHand } from "../game/initial-hand/model/initialHand";
import type { InitialHandOutputLanguage } from "../game/initial-hand/model/initialHand";
import { initialHandSchema } from "../game/initial-hand/model/initialHand";

export const requestInitialHand = async ({
  apiUrl,
  input,
  outputLanguage,
}: {
  apiUrl: string;
  input: BirthProfileInput;
  outputLanguage: InitialHandOutputLanguage;
}): Promise<InitialHand> => {
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chart: buildBirthProfileSeed(input),
      outputLanguage,
    }),
  });

  if (!response.ok) {
    throw new Error(`Initial Hand request failed with ${response.status}`);
  }

  return initialHandSchema.parse(await response.json());
};
