import type { WorkerRequestJson, Env } from "../types";
import { json } from "../http";
import { requestModelContent, parseModelJsonObject } from "../upstreamClient";
import { buildEchoPrompt } from "../../../src/llm/echo/prompt";

export const handleEcho = async ({
  requestJson,
  env,
  headers,
}: {
  requestJson: WorkerRequestJson;
  env: Env;
  headers: Record<string, string>;
}) => {
  const { input } = requestJson;

  if (!input) {
    return json({ error: "missing_input" }, { status: 400, headers });
  }

  const prompt = buildEchoPrompt(input);
  const modelResult = await requestModelContent({ env, headers, prompt });

  if (!modelResult.ok) {
    return modelResult.response;
  }

  return json(parseModelJsonObject(modelResult.content), { headers });
};
