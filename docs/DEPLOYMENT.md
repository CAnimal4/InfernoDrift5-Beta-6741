# Deployment

## GitHub Pages Frontend

The current frontend build is the restored static InfernoDrift4 root game. `npm run build:web` copies `index.html`, `script.js`, `style.css`, icons, manifest, service-worker reset file, and static card art into `dist/`.

1. Push `main`.
2. Ensure GitHub Pages source is GitHub Actions.
3. Wait for `Deploy GitHub Pages`.
4. Open https://canimal4.github.io/InfernoDrift4/.

The Pages workflow runs `npm ci`, `npm run typecheck`, `npm run test`, `npm run build:web`, uploads `dist/`, and deploys with official Pages artifact actions.

## Cloudflare Worker Backend

The Cloudflare Worker backend is retained as a fallback. Worker source exists in `apps/worker` and is configured by `wrangler.jsonc`.

Required GitHub secrets:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_D1_DATABASE_ID`

Cloudflare D1:

- Database name: `infernodrift4`
- Database ID: `830d1cce-a09c-4112-8a28-24b421c4acda`
- Created from the Cloudflare dashboard on May 18, 2026.

Dry checks:

```bash
npm run worker:check
npm run worker:types
```

Manual deploy is allowed only when credentials are available and safe:

```bash
npx wrangler d1 migrations apply infernodrift4 --remote
CLOUDFLARE_ACCOUNT_ID=... CLOUDFLARE_API_TOKEN=... npm run deploy:worker
```

Do not use the dashboard Console as the primary migration runner for the multi-statement migration files. Use Wrangler or the GitHub Action path so Cloudflare records the migration state consistently.

Feedback email delivery also requires Worker secrets/config:

```bash
printf '%s' "$RESEND_API_KEY" | npx wrangler secret put RESEND_API_KEY
```

`FEEDBACK_FROM` must be a verified sender in Resend before the UI can truthfully say email delivery is configured.

Do not mark hosted online as live until a concrete `wss://.../ws` endpoint passes:

```bash
INFERNO_ONLINE_SMOKE_URL=wss://<verified-worker>/ws node smoke_online_local.mjs
```

Then verify a two-client room flow from the deployed Pages game.

## Replit Backend

The primary online backend is the Replit Node deployment:

- App name: `infernodrift4-online`
- HTTP URL: `https://infernodrift4-online.replit.app`
- WebSocket URL: `wss://infernodrift4-online.replit.app/ws`
- Source repository: `https://github.com/CAnimal4/InfernoDrift4`

Deployment checklist:

1. Import/connect the GitHub repository in Replit.
2. Ensure the run command is `npm run dev:server`.
3. Add Replit SQL/Postgres and configure `DATABASE_URL` as a Replit environment variable or secret.
4. Set `ALLOWED_ORIGINS` to `https://canimal4.github.io,http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000,http://localhost:4173,http://127.0.0.1:4173`.
5. Publish the deployment as `infernodrift4-online`.
6. Stop before any billing, paid plan, password, token, or security prompt that was not explicitly approved.

Verification:

```bash
curl https://infernodrift4-online.replit.app/health
curl -H 'Origin: https://canimal4.github.io' https://infernodrift4-online.replit.app/health
INFERNO_ONLINE_SMOKE_URL=wss://infernodrift4-online.replit.app/ws node smoke_online_local.mjs
```

If Replit is blocked, down, or slow, the frontend keeps the Cloudflare Worker fallback and Guest Offline play path available.

## Manual UI Work

Use Safari + Computer Use for Cloudflare or GitHub dashboard inspection/configuration when needed. Ask before billing changes, risky DNS changes, deletion, secret rotation, domain transfers, or irreversible account-level settings.
