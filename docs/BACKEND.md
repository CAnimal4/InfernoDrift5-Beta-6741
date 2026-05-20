# Backend

InfernoDrift4 has two backend paths:

- `apps/server`: local Node/WebSocket backend for development and non-Cloudflare hosting.
- `apps/worker`: Cloudflare Worker + Durable Object backend for live room coordination.

The root static InfernoDrift4 client remains playable offline. Production online now prefers the free Replit dev backend at `wss://add88ee5-cd60-43a6-9187-bbf975395ace-00-buwzj014vifw.janeway.replit.dev/ws` and keeps the verified Cloudflare Worker at `wss://infernodrift4-online.clarkbythebay.workers.dev/ws` as fallback. Online can still be overridden from the Online tab, `localStorage`, `window.INFERNO_ONLINE_URL`, or the `?online=` query parameter.

## Local Node Backend

```bash
cp .env.example .env
npm run dev:server
curl http://127.0.0.1:8787/health
```

Use `ws://127.0.0.1:8787/ws` in the client Online tab.

Local features:

- Temporary guest sessions with reconnectable `sessionToken` values
- Password account create/sign-in in local development with PBKDF2-hashed credentials
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

## Replit Backend

The Node backend is the Replit-compatible implementation. Replit should import `https://github.com/CAnimal4/InfernoDrift`, run `npm install`, and start with:

```bash
npm run dev:server
```

Current no-cost Replit configuration:

- App name: `infernodrift4-online`
- Free dev HTTP URL: `https://add88ee5-cd60-43a6-9187-bbf975395ace-00-buwzj014vifw.janeway.replit.dev`
- Free dev WebSocket URL: `wss://add88ee5-cd60-43a6-9187-bbf975395ace-00-buwzj014vifw.janeway.replit.dev/ws`
- Paid publish URL, not currently usable without plan upgrade: `https://infernodrift4-online.replit.app`
- Environment: `PORT` from Replit, `ALLOWED_ORIGINS=https://canimal4.github.io,http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000,http://localhost:4173,http://127.0.0.1:4173`
- Persistence: set `DATABASE_URL` through Replit SQL/Postgres. When `DATABASE_URL` is present, the server stores the normalized backend state in the `infernodrift4_state` JSONB table. Local JSON remains a development fallback only.

Replit dev URLs expose HTTPS/WSS for free while the workspace is running. Replit warns that dev URLs are temporary and sleep after the workspace is left. Use a Reserved VM or the lowest always-on option only if a paid billing change is explicitly approved later.

The local backend accepts WebSocket connections on the HTTP server. The documented `/ws` path is the client convention and matches the Worker route.

## Cloudflare Worker Backend

The Worker routes `GET /health` and WebSocket upgrades at `GET /ws`. Room state is coordinated by one Durable Object per room code, matching the Cloudflare room-style WebSocket guidance.

The Worker mirrors the local protocol handlers for temporary guest sessions, password account create/sign-in, username claims, saves, friends, reports, feedback, authoritative leaderboard snapshots, room snapshots, reconnect, and fake result rejection. Durable Object storage is the default live-room surface. The shared leaderboard is a total-XP board: XP earned in Campaign Survival, Max Arena, Race, Boost Bowling, Lava Floor, and every other public mode/minigame contributes to the same ranking. The `INFERNO_DB` D1 binding points at the Cloudflare `infernodrift4` database created on May 18, 2026 (`830d1cce-a09c-4112-8a28-24b421c4acda`) and can use `migrations/0001_phase4_backend.sql`, `migrations/0002_account_credentials.sql`, and `migrations/0003_global_xp_leaderboard.sql` for production-shaped feedback, account, and XP leaderboard tables. Optional Resend delivery uses the same `RESEND_API_KEY` / `FEEDBACK_FROM` / `FEEDBACK_TO` config as local.

```bash
npm run worker:check
npm run worker:types
```

The D1 database already exists in the Cloudflare dashboard. Apply migrations and deploy manually when Cloudflare CLI credentials/secrets are available:

```bash
npx wrangler d1 migrations apply infernodrift4 --remote
CLOUDFLARE_ACCOUNT_ID=... CLOUDFLARE_API_TOKEN=... npm run deploy:worker
printf '%s' "$RESEND_API_KEY" | npx wrangler secret put RESEND_API_KEY
```

Use Wrangler migrations for schema setup. The dashboard SQL console is fine for small inspection queries, but it is not the migration source of truth for these multi-statement files.

GitHub Actions deployment uses `.github/workflows/deploy-worker.yml` and requires repository secrets:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_D1_DATABASE_ID`
- `SESSION_SECRET` or equivalent Worker session signing secret
- `RESEND_API_KEY` configured as a Cloudflare Worker secret before feedback email delivery is claimed live
- optional Turnstile secret if account/chat/report abuse gates are enabled

Worker vars already include `FEEDBACK_TO=clarkbythebay@gmail.com,clark.alden@lbusd.org`. `FEEDBACK_FROM` must be a verified Resend sender before email delivery will work in production.

The workflow explicitly skips deploy when those secrets are absent. Safari dashboard inspection confirmed the `infernodrift4` D1 database exists, but there is still no verified Worker URL recorded in the docs, so hosted Cloudflare online must remain blocked until secrets are configured, migrations are applied, and `/health` plus WebSocket smoke pass.

## Frontend Configuration

Set the Online tab server URL to one of:

- `ws://127.0.0.1:8787/ws`
- `wss://add88ee5-cd60-43a6-9187-bbf975395ace-00-buwzj014vifw.janeway.replit.dev/ws`
- `wss://infernodrift4-online.replit.app/ws` only if paid publishing is later approved
- `wss://infernodrift4-online.clarkbythebay.workers.dev/ws`
- `wss://online.<your-domain>/ws` once a Cloudflare custom domain is attached to the Worker.

Bare host URLs are normalized to `/ws` by the client. If no server is configured, the UI shows backend-offline status and the game keeps all offline/bot modes available.

The Online tab also supports backup backend URLs. Add one URL per line in **Server settings -> Backup Backend URLs**, or set `window.INFERNO_BACKUP_ONLINE_URLS` to an array/string before `script.js` loads. On connect, the client tests the primary backend first and then each backup. If HTTPS health works but WebSockets are blocked, accounts, chat history, and leaderboard can still use HTTPS fallback while live rooms stay disabled with a clear message.

Use **Test Connection** in the Online tab to diagnose school-network blocking. It checks backend health, signed-in HTTPS account/leaderboard/chat-history fallback, and live room WebSocket reachability. If no account is signed in, the HTTPS account/chat fallback part reports that sign-in is required instead of creating a test account or posting fake chat.

## Custom Worker Domain

The least-blocked production shape is a normal subdomain such as `online.example.com` routed to the Worker. A `workers.dev` hostname works technically, but some school filters block that entire domain. Cloudflare can attach a custom domain when the domain is in the Cloudflare account. Without a domain or subdomain that the project owns, there is no reliable free custom URL that can be guaranteed unblocked.

## Production Notes

Do not claim hosted online is live until both are true:

- Cloudflare credentials/secrets exist for deployment.
- A concrete `wss://.../ws` Worker endpoint has been verified from the deployed Pages build.

GitHub Pages cannot host WebSocket server code.
