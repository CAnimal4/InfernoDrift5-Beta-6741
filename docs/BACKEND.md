# Backend

InfernoDrift4 has two backend paths:

- `apps/server`: local Node/WebSocket backend for development and non-Cloudflare hosting.
- `apps/worker`: Cloudflare Worker + Durable Object backend for live room coordination.

The React client remains playable offline. Online activates only when the Online tab, `localStorage`, or `window.INFERNO_SERVER_URL` is configured with a reachable `ws://` or `wss://.../ws` URL.

## Local Node Backend

```bash
cp .env.example .env
npm run dev:server
curl http://127.0.0.1:8787/health
```

Use `ws://127.0.0.1:8787/ws` in the client Online tab.

Local features:

- Guest/device usernames
- Private room codes
- 1v1, 2v2, and 3v3 room sizing with bot fill metadata
- Casual/ranked queue-compatible room creation
- Lobby chat and quick chat
- Friends/recent-player shell data
- Leaderboard snapshots
- Sanitization, rate limits, message size checks, exact origin allowlisting, ranked dev-flag rejection, invalid speed/score/goal rejection
- Local JSON persistence in `DATA_DIR`

The local backend accepts WebSocket connections on the HTTP server. The documented `/ws` path is the client convention and matches the Worker route.

## Cloudflare Worker Backend

The Worker routes `GET /health` and WebSocket upgrades at `GET /ws`. Room state is coordinated by one Durable Object per room code, matching the Cloudflare room-style WebSocket guidance.

```bash
npm run worker:check
npm run worker:types
```

Deploy manually when Cloudflare credentials are available:

```bash
CLOUDFLARE_ACCOUNT_ID=... CLOUDFLARE_API_TOKEN=... npm run deploy:worker
```

GitHub Actions deployment uses `.github/workflows/deploy-worker.yml` and requires repository secrets:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`

The workflow explicitly skips deploy when those secrets are absent. During this docs-only inspection there was no verified Worker URL recorded in the docs, so hosted Cloudflare online must remain blocked.

## Frontend Configuration

Set the Online tab server URL to one of:

- `ws://127.0.0.1:8787/ws`
- `wss://<worker-name>.<account>.workers.dev/ws`

Bare host URLs are normalized to `/ws` by the client. If no server is configured, the UI shows backend-offline status and the game keeps all offline/bot modes available.

## Production Notes

Do not claim hosted online is live until both are true:

- Cloudflare credentials/secrets exist for deployment.
- A concrete `wss://.../ws` Worker endpoint has been verified from the deployed Pages build.

GitHub Pages cannot host WebSocket server code.
