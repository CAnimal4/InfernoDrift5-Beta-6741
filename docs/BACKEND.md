# Backend

InfernoDrift4 has two backend paths:

- `apps/server`: local Node/WebSocket backend for development and non-Cloudflare hosting.
- `apps/worker`: Cloudflare Worker + Durable Object backend for live room coordination.

The root static InfernoDrift4 client remains playable offline. Online activates only when the Online tab, `localStorage`, `window.INFERNO_ONLINE_URL`, or the `?online=` query parameter is configured with a reachable `ws://` or `wss://.../ws` URL.

## Local Node Backend

```bash
cp .env.example .env
npm run dev:server
curl http://127.0.0.1:8787/health
```

Use `ws://127.0.0.1:8787/ws` in the client Online tab.

Local features:

- Passwordless guest sessions with reconnectable `sessionToken` values
- Guest/device usernames plus unique `profile.claimUsername` claims
- Reserved `Clark` claim support through `CLARK_RESERVATION_TOKEN`
- Private room codes
- 1v1, 2v2, and 3v3 room sizing with bot fill metadata
- Casual/ranked queue-compatible room creation
- Lobby chat and quick chat
- Cloud save sync through `save.sync`
- Friends, friend accepts, blocks, reports, and recent-player snapshots
- Authoritative server-owned leaderboard snapshots
- Feedback storage through `feedback.submit` or `POST /api/feedback`; optional Resend delivery uses `RESEND_API_KEY`, `FEEDBACK_FROM`, and `FEEDBACK_TO`
- Sanitization, rate limits, message size checks, exact origin allowlisting, ranked dev-flag rejection, invalid speed/score/goal/result rejection
- Local JSON persistence in `DATA_DIR`

The local backend accepts WebSocket connections on the HTTP server. The documented `/ws` path is the client convention and matches the Worker route.

## Cloudflare Worker Backend

The Worker routes `GET /health` and WebSocket upgrades at `GET /ws`. Room state is coordinated by one Durable Object per room code, matching the Cloudflare room-style WebSocket guidance.

The Worker mirrors the local protocol handlers for passwordless guest sessions, username claims, saves, friends, reports, feedback, authoritative leaderboard snapshots, room snapshots, reconnect, and fake result rejection. Durable Object storage is the default persistence surface. The optional `INFERNO_DB` D1 binding can use `migrations/0001_phase4_backend.sql` for production-shaped feedback and account tables, and optional Resend delivery uses the same `RESEND_API_KEY` / `FEEDBACK_FROM` / `FEEDBACK_TO` config as local.

```bash
npm run worker:check
npm run worker:types
```

Deploy manually when Cloudflare credentials are available:

```bash
wrangler d1 create infernodrift4
# Put the returned D1 database id in wrangler.jsonc, or use the GitHub secret path below.
npx wrangler d1 migrations apply infernodrift4 --remote
CLOUDFLARE_ACCOUNT_ID=... CLOUDFLARE_API_TOKEN=... npm run deploy:worker
printf '%s' "$RESEND_API_KEY" | npx wrangler secret put RESEND_API_KEY
```

GitHub Actions deployment uses `.github/workflows/deploy-worker.yml` and requires repository secrets:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_D1_DATABASE_ID`
- `RESEND_API_KEY` configured as a Cloudflare Worker secret before feedback email delivery is claimed live

Worker vars already include `FEEDBACK_TO=clarkbythebay@gmail.com,clark.alden@lbusd.org`. `FEEDBACK_FROM` must be a verified Resend sender before email delivery will work in production.

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
