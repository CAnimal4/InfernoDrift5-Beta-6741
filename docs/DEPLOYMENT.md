# Deployment

## GitHub Pages Frontend

The current frontend build is the restored static InfernoDrift4 root game. `npm run build:web` copies `index.html`, `script.js`, `style.css`, icons, manifest, service-worker reset file, and static card art into `dist/`.

1. Push `main`.
2. Ensure GitHub Pages source is GitHub Actions.
3. Wait for `Deploy GitHub Pages`.
4. Open https://canimal4.github.io/InfernoDrift4/.

The Pages workflow runs `npm ci`, `npm run typecheck`, `npm run test`, `npm run build:web`, uploads `dist/`, and deploys with official Pages artifact actions.

## Cloudflare Worker Backend

The live online backend is separate from GitHub Pages. Worker source exists in `apps/worker` and is configured by `wrangler.jsonc`.

Required GitHub secrets:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`

Dry checks:

```bash
npm run worker:check
npm run worker:types
```

Manual deploy is allowed only when credentials are available and safe:

```bash
CLOUDFLARE_ACCOUNT_ID=... CLOUDFLARE_API_TOKEN=... npm run deploy:worker
```

Do not mark hosted online as live until a concrete `wss://.../ws` endpoint passes:

```bash
INFERNO_ONLINE_SMOKE_URL=wss://<verified-worker>/ws node smoke_online_local.mjs
```

Then verify a two-client room flow from the deployed Pages game.

## Manual UI Work

Use Safari + Computer Use for Cloudflare or GitHub dashboard inspection/configuration when needed. Ask before billing changes, risky DNS changes, deletion, secret rotation, domain transfers, or irreversible account-level settings.
