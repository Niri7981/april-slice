# LLM Proxy

The frontend must not hold model API keys.

Initial Hand generation goes through a Cloudflare Worker:

```text
frontend
  -> POST /initial-hand
  -> worker
  -> OpenAI-compatible /v1/chat/completions
  -> InitialHand JSON
  -> frontend Zod validation
```

## Required secret

Set the API key in the Worker environment:

```bash
wrangler secret put NEWAPI_API_KEY
```

Do not commit real API keys.

## Local frontend config

Point Vite at the deployed Worker:

```bash
VITE_INITIAL_HAND_API_URL="https://<worker-host>/initial-hand"
```

If the variable is missing or the request fails, the app keeps using the explicit
`FALLBACK` Initial Hand so the day flow does not break.

## Current scope

Only Initial Hand generation is proxied here.

Echo reaction generation still uses `fakeResolver` until the Phase 2 resolver gate is ready.
