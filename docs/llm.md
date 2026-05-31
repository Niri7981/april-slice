# LLM Proxy

The frontend must not hold model API keys.

Initial Hand generation goes through a Cloudflare Worker. The frontend sends a
structured birth profile seed, not raw API credentials:

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

## Local Worker dev

For local testing, keep the upstream model key in `worker/.dev.vars`:

```bash
cp worker/.dev.vars.example worker/.dev.vars
```

Then fill in:

```bash
NEWAPI_API_KEY=...
NEWAPI_BASE_URL=https://beefapi.com
NEWAPI_MODEL=gpt-5.4
```

Start the Worker locally:

```bash
npm run worker:dev
```

## Local frontend config

Point Vite at the Worker URL. For local dev:

```bash
cp .env.local.example .env.local
```

Then use:

```bash
VITE_INITIAL_HAND_API_URL="http://127.0.0.1:8788/initial-hand"
```

For deployed usage, replace it with:

```bash
VITE_INITIAL_HAND_API_URL="https://<worker-host>/initial-hand"
```

If the variable is missing or the request fails, the app keeps using the explicit
`FALLBACK` Initial Hand so the day flow does not break.

## Current scope

Only Initial Hand generation is proxied here.

Echo reaction generation still uses `fakeResolver` until the Phase 2 resolver gate is ready.
