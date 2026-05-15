# QA Report

Updated on 2026-05-15 after the game-feel/UI recovery pass and parent verification run.

## Scope

This report covers the current React/TypeScript/Three revamp and the parent verification run performed after integration. Older static-client QA notes should not be treated as current proof unless they are repeated below.

## Source Observed

- React/Vite client in `client/`.
- Three.js gameplay canvas in `client/src/game/GameCanvas.tsx`.
- Three.js garage preview in `client/src/game/GaragePreview.tsx`.
- Typed game loop and state model in `packages/game-core/src/index.ts`.
- TypeScript protocol/moderation package in `packages/protocol/src/index.ts`.
- Local Node backend in `apps/server/src/index.js`.
- Cloudflare Worker/Durable Object backend in `apps/worker/src/index.js`.
- Worker runtime protocol mirror in `apps/worker/src/protocol.js`.
- Current tests in `tests/server.test.mjs`, `tests/game-core.test.ts`, and `tests/protocol.test.ts`.

## Verification Run

These checks passed against the current tree:

- `npm run typecheck`
- `npm test`
- `npm run build`
- `npm run smoke`
- `npm run test:e2e`
- `npm run smoke:online-local`
- `npm run worker:check`
- `npm run worker:types`
- `develop-web-game` Playwright action loop against `http://127.0.0.1:5173/InfernoDrift4/`

Evidence highlights:

- `npm test` passed 22 tests across backend/protocol/game-core.
- `npm run smoke` passed and asserted Max Arena, campaign return, replay state, forced demo, forward-relative radar state, and all major mode/minigame route IDs.
- `npm run test:e2e` passed and asserted dev-mode UI plus phone landscape HUD/radar/touch layout.
- `npm run smoke:online-local` passed using a local WebSocket backend, private room creation, and sanitized chat.
- `worker:check` passed a Wrangler dry-run with the Durable Object binding; `worker:types` passed.
- The recovery pass fixed deterministic input in `advanceTime(ms)` and re-ran the web-game action loop; screenshot review confirmed the car actually moves, the HUD/radar are cleaner, and the garage/title are visibly stronger than the rejected pass.
- The develop-web-game loop caught and then verified the fix for title/menu click interception. Final artifacts are `output/web-game/shot-*.png` and `output/web-game/state-*.json`.
- Production Pages smoke passed at `https://canimal4.github.io/InfernoDrift4/?v=771883b` after the deploy-root fix. A prior smoke caught that Pages was still serving the legacy branch-root shell in one deployment configuration; the build now publishes the React bundle to both `dist/` and the repository root and clears the old service-worker cache. The final live check confirmed the HTML no longer references `script.js`, desktop mode routing passed, and phone landscape HUD/radar/touch layout passed.

## Backend / Moderation Coverage To Verify

The inspected tests now cover or intend to cover:

- Known/unknown protocol message validation.
- Admin/authoritative payload rejection.
- Speed sanity rejection.
- Ranked plus dev-mode rejection.
- Expanded chat moderation for markup, soft profanity, PII, severe abuse, hate, harassment, and slurs.
- 13+ free-chat gating while quick chat remains available.
- Clark founder badge semantics without granting broad admin behavior.
- Local WebSocket guest auth, room create/join, bot fill, sanitized chat broadcast, queue, quick chat, leaderboard, social shell, and exact-origin rejection.

## Deployment QA

- React Pages deploy: GitHub Actions completed successfully and production browser smoke passed after the root/Actions artifact compatibility fix.
- Cloudflare Worker live deploy: blocked until `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` are configured and a concrete `wss://.../ws` Worker URL is verified from the deployed Pages client.
- Local Node backend: tested by `npm test` and `npm run smoke:online-local`.

## Known Test Environment Noise

Earlier browser runs reported headless Chromium WebGL/SwiftShader stall warnings during screenshots. Treat them as environment noise only if the application console remains otherwise clean in the current parent run.
