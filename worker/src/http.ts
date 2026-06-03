import type { Env, RequestRecord } from "./types";

const requestWindowMs = 60_000;
const maxRequestsPerWindow = 20;
const maxBodyBytes = 12_000;
const requestRecords = new Map<string, RequestRecord>();

export const json = (body: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

export const corsHeaders = (env: Env) => ({
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

export const guardRequest = (request: Request, headers: Record<string, string>) => {
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

  return null;
};
