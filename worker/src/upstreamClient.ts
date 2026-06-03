import { json } from "./http";
import type { Env, SseEntry } from "./types";

const extractJsonObject = (text: string) => {
  const trimmed = text.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");

  if (start < 0 || end < start) {
    throw new Error("Model did not return a JSON object");
  }

  return JSON.parse(trimmed.slice(start, end + 1));
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
    return {
      contentType,
      payload: readSsePayload(await response.text()),
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

const normalizeSsePayload = (entries: SseEntry[]) => {
  const errorEntry = entries.find((entry) => entry.event === "error");

  if (errorEntry) {
    return {
      kind: "error" as const,
      detail: errorEntry,
    };
  }

  const contentParts: string[] = [];
  let lastChoicePayload:
    | {
        choices?: Array<{
          message?: { content?: string };
          delta?: { content?: string };
        }>;
      }
    | null = null;

  for (const entry of entries) {
    if (!entry.data || typeof entry.data !== "object") {
      continue;
    }

    const payload = entry.data as {
      choices?: Array<{
        message?: { content?: string };
        delta?: { content?: string };
      }>;
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

type ModelRequestResult =
  | {
      ok: true;
      content: string;
    }
  | {
      ok: false;
      response: Response;
    };

export const requestModelContent = async ({
  env,
  headers,
  prompt,
}: {
  env: Env;
  headers: Record<string, string>;
  prompt: string;
}): Promise<ModelRequestResult> => {
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
    return {
      ok: false,
      response: json(
        {
          error: "model_request_failed",
          status: apiResponse.status,
          detail: upstreamBody.payload,
        },
        { status: 502, headers },
      ),
    };
  }

  const upstreamPayload = upstreamBody.payload;

  if (upstreamBody.contentType.includes("text/event-stream")) {
    const normalized = normalizeSsePayload(
      Array.isArray(upstreamPayload) ? (upstreamPayload as SseEntry[]) : [],
    );

    if (normalized.kind === "error") {
      return {
        ok: false,
        response: json(
          {
            error: "model_stream_error",
            detail: normalized.detail,
          },
          { status: 502, headers },
        ),
      };
    }

    const apiJson = normalized.detail as {
      choices?: Array<{ message?: { content?: string } }>;
      error?: unknown;
    };

    if (apiJson.error) {
      return {
        ok: false,
        response: json(
          {
            error: "model_request_failed",
            detail: apiJson.error,
          },
          { status: 502, headers },
        ),
      };
    }

    const content = apiJson.choices?.[0]?.message?.content;

    if (!content) {
      return {
        ok: false,
        response: json(
          { error: "missing_model_content", detail: apiJson },
          { status: 502, headers },
        ),
      };
    }

    return {
      ok: true,
      content,
    };
  }

  const apiJson = upstreamPayload as {
    choices?: Array<{ message?: { content?: string } }>;
    error?: unknown;
  };

  if (apiJson.error) {
    return {
      ok: false,
      response: json(
        {
          error: "model_request_failed",
          detail: apiJson.error,
        },
        { status: 502, headers },
      ),
    };
  }

  const content = apiJson.choices?.[0]?.message?.content;

  if (!content) {
    return {
      ok: false,
      response: json(
        { error: "missing_model_content", detail: apiJson },
        { status: 502, headers },
      ),
    };
  }

  return {
    ok: true,
    content,
  };
};

export const parseModelJsonObject = (content: string) => extractJsonObject(content);
