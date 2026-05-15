# Architecture / Build Subagent Report

- Current architecture: Vite/React client in `client/`, typed game rules in `packages/game-core`, shared TypeScript protocol in `packages/protocol`, local Node backend in `apps/server`, and Cloudflare Worker/Durable Object backend in `apps/worker`.
- Build: `scripts/build-site.mjs` runs Vite with `client/vite.config.ts`, emits `dist/`, copies static PWA/icon assets, and writes `.nojekyll`.
- CI/Pages: workflows install with `npm ci`, run typecheck/tests/build, upload `dist/`, and deploy with official Pages actions.
- Acceptance checks still needed for the current React tree: install, typecheck, test, build, smoke, e2e, worker dry-run/types, and Pages workflow verification.
