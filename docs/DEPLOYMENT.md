# Deployment

## GitHub Pages Frontend

Frontend deployment uses GitHub Pages Actions. The current frontend build is Vite/React from `client/`, produced by `npm run build:web` through `scripts/build-site.mjs`.

1. Push `main`.
2. Ensure Settings -> Pages -> Source is GitHub Actions.
3. Wait for `Deploy GitHub Pages`.
4. Open https://canimal4.github.io/InfernoDrift4/.

The Pages workflow runs `npm ci`, `npm run typecheck`, `npm run test`, `npm run build:web`, uploads `dist/`, and deploys with official Pages artifact actions.

## Cloudflare Worker Backend

The live online backend is separate from GitHub Pages. The Worker is configured in `wrangler.jsonc` with one Durable Object class, `InfernoRoom`, for room coordination.

Required GitHub secrets for `.github/workflows/deploy-worker.yml`:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`

Manual deploy:

```bash
npm run worker:check
npm run worker:types
CLOUDFLARE_ACCOUNT_ID=... CLOUDFLARE_API_TOKEN=... npm run deploy:worker
```

After deployment, configure the Pages client Online tab with `wss://<worker-url>/ws` and verify `/health` plus a WebSocket room connection.

Current deployment status for this docs pass:

- Pages deployment for the React revamp is pending parent/CI verification unless a newer Actions result is supplied.
- Cloudflare Worker live deployment is blocked because no verified Worker URL is recorded here and deploy secrets are not visible in the repo.

## Manual Fallback

If GitHub UI access is needed because `gh` is unavailable:

1. Open https://github.com/CAnimal4/InfernoDrift4/settings/pages.
2. Set Source to GitHub Actions.
3. Open Actions and rerun `Deploy GitHub Pages` if the workflow did not run automatically.
4. Add Cloudflare secrets at Settings -> Secrets and variables -> Actions if backend deployment is required.

Do not mark hosted online as live until a `wss://.../ws` endpoint is verified from the deployed Pages game.
