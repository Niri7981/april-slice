import type { WorkerRequestJson, Env } from "../types";
import { json } from "../http";
import { requestModelContent, parseModelJsonObject } from "../upstreamClient";
import { buildInitialHandPrompt } from "../../../src/game/initial-hand/prompt/initialHandPrompt";

export const handleInitialHand = async ({
  requestJson,
  env,
  headers,
}: {
  requestJson: WorkerRequestJson;
  env: Env;
  headers: Record<string, string>;
}) => {
  const { chart, outputLanguage = "en" } = requestJson;

  if (!chart) {
    return json({ error: "missing_chart" }, { status: 400, headers });
  }

  const prompt = buildInitialHandPrompt({ chart, outputLanguage });
  const modelResult = await requestModelContent({ env, headers, prompt });

  if (!modelResult.ok) {
    return modelResult.response;
  }

  return json(parseModelJsonObject(modelResult.content), { headers });
};
