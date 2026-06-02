import type { AstrologyChartSeed } from "../../src/game/initial-hand/profileSeed/astrologyChart";
import type { InitialHandOutputLanguage } from "../../src/game/initial-hand/model/initialHand";
import { buildInitialHandPrompt } from "../../src/game/initial-hand/prompt/initialHandPrompt";
import type { AgentBrainInput } from "../../src/llm/echo/brainTypes";
import { buildEchoPrompt } from "../../src/llm/echo/prompt";

type Env = {
  NEWAPI_API_KEY: string;
  NEWAPI_BASE_URL?: string;
  NEWAPI_MODEL?: string;
  ALLOWED_ORIGIN?: string;
};

type RequestRecord = {
  count: number;
  resetAt: number;
};

const requestWindowMs = 60_000;
const maxRequestsPerWindow = 20;
const maxBodyBytes = 12_000;
const requestRecords = new Map<string, RequestRecord>();

const json = (body: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

const corsHeaders = (env: Env) => ({
  "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN ?? "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
});

const isRateLimited = (request: Request) => {
  const ip = request.headers.get("cf-connecting-ip") ?? "local";
  const now = Date.now();
  const current = requestRecords.get(ip);

  if (!current || current.resetAt <= now) {
    requestRecords.set(ip, {
      count: 1,
      resetAt: now + requestWindowMs,
    });
    return false;
  }

  current.count += 1;
  return current.count > maxRequestsPerWindow;
};

const extractJsonObject = (text: string) => {
  const trimmed = text.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");

  if (start < 0 || end < start) {
    throw new Error("Model did not return a JSON object");
  }

  return JSON.parse(trimmed.slice(start, end + 1));
};

type SseEntry = {
  event: string;
  data: unknown;
};

const readSsePayload = (text: string): SseEntry[] => {
  const blocks = text
    .split(/\r?\n\r?\n/)
    .map((block) => block.trim())
    .filter(Boolean);

  const entries: SseEntry[] = [];

  for (const block of blocks) {
    let eventName = "message";
    const dataLines: string[] = [];

    for (const line of block.split(/\r?\n/)) {
      if (line.startsWith("event:")) {
        eventName = line.slice("event:".length).trim();
      }

      if (line.startsWith("data:")) {
        dataLines.push(line.slice("data:".length).trim());
      }
    }

    if (dataLines.length === 0) {
      continue;
    }

    const rawData = dataLines.join("\n");

    if (rawData === "[DONE]") {
      continue;
    }

    try {
      entries.push({
        event: eventName,
        data: JSON.parse(rawData) as unknown,
      });
    } catch {
      entries.push({
        event: eventName,
        data: rawData,
      });
    }
  }

  return entries;
};

const readUpstreamBody = async (response: Response) => {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("text/event-stream")) {
    const sse = readSsePayload(await response.text());

    return {
      contentType,
      payload: sse,
    };
  }

  if (contentType.includes("application/json")) {
    return {
      contentType,
      payload: (await response.json()) as unknown,
    };
  }

  return {
    contentType,
    payload: await response.text(),
  };
};

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

const normalizeSsePayload = (entries: SseEntry[]) => {
  const errorEntry = entries.find((entry) => entry.event === "error");

  if (errorEntry) {
    return {
      kind: "error" as const,
      detail: errorEntry,
    };
  }

  const contentParts: string[] = [];
  let lastChoicePayload: { choices?: Array<{ message?: { content?: string }; delta?: { content?: string } }> } | null =
    null;

  for (const entry of entries) {
    if (!entry.data || typeof entry.data !== "object") {
      continue;
    }

    const payload = entry.data as {
      choices?: Array<{ message?: { content?: string }; delta?: { content?: string } }>;
    };

    if (!payload.choices) {
      continue;
    }

    lastChoicePayload = payload;

    for (const choice of payload.choices) {
      const messageContent = choice.message?.content;
      const deltaContent = choice.delta?.content;

      if (typeof messageContent === "string" && messageContent.length > 0) {
        contentParts.push(messageContent);
      }

      if (typeof deltaContent === "string" && deltaContent.length > 0) {
        contentParts.push(deltaContent);
      }
    }
  }

  if (contentParts.length > 0) {
    return {
      kind: "json" as const,
      detail: {
        choices: [
          {
            message: {
              content: contentParts.join(""),
            },
          },
        ],
      },
    };
  }

  return {
    kind: "json" as const,
    detail: lastChoicePayload ?? entries.at(-1) ?? null,
  };
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const headers = corsHeaders(env);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers });
    }

    const url = new URL(request.url);

    if (request.method !== "POST") {
      return json({ error: "not_found" }, { status: 404, headers });
    }

    if (isRateLimited(request)) {
      return json({ error: "rate_limited" }, { status: 429, headers });
    }

    const contentLength = Number(request.headers.get("content-length") ?? 0);

    if (contentLength > maxBodyBytes) {
      return json({ error: "request_too_large" }, { status: 413, headers });
    }

    try {
      const requestJson = (await request.json()) as {
        chart?: AstrologyChartSeed;
        input?: AgentBrainInput;
        outputLanguage?: InitialHandOutputLanguage;
      };
      const { chart, input, outputLanguage = "en" } = requestJson;

      let prompt: string;

      if (url.pathname === "/initial-hand") {
        if (!chart) {
          return json({ error: "missing_chart" }, { status: 400, headers });
        }

        prompt = buildInitialHandPrompt({ chart, outputLanguage });
      } else if (url.pathname === "/echo") {
        if (!input) {
          return json({ error: "missing_input" }, { status: 400, headers });
        }

        prompt = buildEchoPrompt(input);
      } else {
        return json({ error: "not_found" }, { status: 404, headers });
      }
      const apiResponse = await fetch(
        `${env.NEWAPI_BASE_URL ?? "https://beefapi.com"}/v1/chat/completions`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.NEWAPI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: env.NEWAPI_MODEL ?? "gpt-5.4",
            messages: [
              {
                role: "system",
                content: "Return strict JSON only. No markdown. No commentary.",
              },
              {
                role: "user",
                content: prompt,
              },
            ],
            temperature: 0.7,
          }),
        },
      );
      const upstreamBody = await readUpstreamBody(apiResponse);

      if (!apiResponse.ok) {
        return json(
          {
            error: "model_request_failed",
            status: apiResponse.status,
            detail: upstreamBody.payload,
          },
          { status: 502, headers },
        );
      }

      const upstreamPayload = upstreamBody.payload;

      if (upstreamBody.contentType.includes("text/event-stream")) {
        const normalized = normalizeSsePayload(
          Array.isArray(upstreamPayload) ? (upstreamPayload as SseEntry[]) : [],
        );

        if (normalized.kind === "error") {
          return json(
            {
              error: "model_stream_error",
              detail: normalized.detail,
            },
            { status: 502, headers },
          );
        }

        const apiJson = normalized.detail as {
          choices?: Array<{ message?: { content?: string } }>;
          error?: unknown;
        };

        if (apiJson.error) {
          return json(
            {
              error: "model_request_failed",
              detail: apiJson.error,
            },
            { status: 502, headers },
          );
        }

        const content = apiJson.choices?.[0]?.message?.content;

        if (!content) {
          return json(
            { error: "missing_model_content", detail: apiJson },
            { status: 502, headers },
          );
        }

        return json(extractJsonObject(content), { headers });
      }

      const apiJson = upstreamPayload as {
        choices?: Array<{ message?: { content?: string } }>;
        error?: unknown;
      };

      if (apiJson.error) {
        return json(
          {
            error: "model_request_failed",
            detail: apiJson.error,
          },
          { status: 502, headers },
        );
      }

      const content = apiJson.choices?.[0]?.message?.content;

      if (!content) {
        return json(
          { error: "missing_model_content", detail: apiJson },
          { status: 502, headers },
        );
      }

      return json(extractJsonObject(content), { headers });
    } catch (error) {
      return json(
        {
          error: "worker_internal_error",
          detail: errorMessage(error),
        },
        { status: 500, headers },
      );
    }
  },
};
