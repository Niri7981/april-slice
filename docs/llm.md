# LLM Proxy

The frontend must not hold model API keys.

Initial Hand generation and Echo reaction generation go through a Cloudflare
Worker. The frontend sends structured game data, not raw API credentials:

```text
frontend
  -> POST /initial-hand
  -> POST /echo
  -> worker
  -> OpenAI-compatible /v1/chat/completions
  -> structured JSON
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
VITE_ECHO_API_URL="http://127.0.0.1:8788/echo"
```

For deployed usage, replace it with:

```bash
VITE_INITIAL_HAND_API_URL="https://<worker-host>/initial-hand"
VITE_ECHO_API_URL="https://<worker-host>/echo"
```

If the variable is missing or the request fails, the app keeps using the explicit
`FALLBACK` Initial Hand or local `fakeResolver` so the day flow does not break.

## Current scope

- `POST /initial-hand` returns `InitialHand` JSON.
- `POST /echo` returns `AgentBrainOutput` JSON for one Echo event.

Echo still resolves world-state drift locally after the model returns a reaction.

For the Echo-only loop, see:

- `docs/echo-loop.zh.md`
