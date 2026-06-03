import { corsHeaders, guardRequest, json } from "./http";
import { handleEcho } from "./handlers/echo";
import { handleInitialHand } from "./handlers/initialHand";
import type { Env, WorkerRequestJson } from "./types";

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const headers = corsHeaders(env);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers });
    }

    const guarded = guardRequest(request, headers);

    if (guarded) {
      return guarded;
    }

    const url = new URL(request.url);

    try {
      const requestJson = (await request.json()) as WorkerRequestJson;

      if (url.pathname === "/initial-hand") {
        return handleInitialHand({ requestJson, env, headers });
      }

      if (url.pathname === "/echo") {
        return handleEcho({ requestJson, env, headers });
      }

      return json({ error: "not_found" }, { status: 404, headers });
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
