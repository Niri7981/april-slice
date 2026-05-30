import type { AstrologyChartSeed } from "../../src/game/initial-hand/profileSeed/astrologyChart";
import type { InitialHandOutputLanguage } from "../../src/game/initial-hand/model/initialHand";
import { buildInitialHandPrompt } from "../../src/game/initial-hand/prompt/initialHandPrompt";

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

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const headers = corsHeaders(env);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers });
    }

    const url = new URL(request.url);

    if (request.method !== "POST" || url.pathname !== "/initial-hand") {
      return json({ error: "not_found" }, { status: 404, headers });
    }

    if (isRateLimited(request)) {
      return json({ error: "rate_limited" }, { status: 429, headers });
    }

    const contentLength = Number(request.headers.get("content-length") ?? 0);

    if (contentLength > maxBodyBytes) {
      return json({ error: "request_too_large" }, { status: 413, headers });
    }

    const { chart, outputLanguage = "en" } = (await request.json()) as {
      chart?: AstrologyChartSeed;
      outputLanguage?: InitialHandOutputLanguage;
    };

    if (!chart) {
      return json({ error: "missing_chart" }, { status: 400, headers });
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
              content: buildInitialHandPrompt({ chart, outputLanguage }),
            },
          ],
          temperature: 0.7,
        }),
      },
    );

    if (!apiResponse.ok) {
      return json({ error: "model_request_failed" }, { status: 502, headers });
    }

    const apiJson = (await apiResponse.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = apiJson.choices?.[0]?.message?.content;

    if (!content) {
      return json({ error: "missing_model_content" }, { status: 502, headers });
    }

    return json(extractJsonObject(content), { headers });
  },
};
