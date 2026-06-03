import type { AstrologyChartSeed } from "../../src/game/initial-hand/profileSeed/astrologyChart";
import type { InitialHandOutputLanguage } from "../../src/game/initial-hand/model/initialHand";
import type { AgentBrainInput } from "../../src/llm/echo/brainTypes";

export type Env = {
  NEWAPI_API_KEY: string;
  NEWAPI_BASE_URL?: string;
  NEWAPI_MODEL?: string;
  ALLOWED_ORIGIN?: string;
};

export type RequestRecord = {
  count: number;
  resetAt: number;
};

export type WorkerRequestJson = {
  chart?: AstrologyChartSeed;
  input?: AgentBrainInput;
  outputLanguage?: InitialHandOutputLanguage;
};

export type SseEntry = {
  event: string;
  data: unknown;
};
