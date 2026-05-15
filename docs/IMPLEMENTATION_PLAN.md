# Implementation Plan

## Direction

InfernoDrift4 has moved from the earlier static-root pass into a React/TypeScript/Three revamp. The current active path is:

- `client/` for Vite/React UI and Three renderers
- `packages/game-core/` for deterministic game state and rules
- `packages/protocol/` for shared TypeScript protocol/moderation
- `apps/server/` for local Node/WebSocket development backend
- `apps/worker/` for Cloudflare Worker/Durable Object online backend

## Phases

1. Keep the React client as the active frontend and stop describing the root static files as the primary implementation.
2. Keep moving simulation, objectives, radar, progression, and save migration into `packages/game-core` with tests.
3. Keep protocol and moderation behavior aligned between `packages/protocol/src/index.ts` and `apps/worker/src/protocol.js`.
4. Verify local Node online through `npm run smoke:online-local`.
5. Verify browser play, mobile layout, and automation hooks through `npm run smoke` and `npm run test:e2e`.
6. Verify Cloudflare Worker/Durable Object config through `npm run worker:check` and `npm run worker:types`.
7. Deploy Pages only after parent CI passes for the current React tree.
8. Deploy Worker only after Cloudflare secrets exist; mark live online only after a real `wss://.../ws` URL works from Pages.

## Acceptance

- The React app builds and deploys through Vite to `dist/`.
- `window.advanceTime(ms)`, `window.render_game_to_text()`, and `window.__infernodriftTestApi` remain stable.
- Tutorial, campaign, Max Arena, minigames, radar, progression, garage, online shell, touch layout, and deterministic test hooks work in current smokes.
- Local backend runs and passes protocol/WebSocket tests.
- Hosted Cloudflare online is blocked unless secrets and a verified Worker WebSocket URL are available.
