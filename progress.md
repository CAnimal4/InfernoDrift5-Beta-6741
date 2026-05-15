Original prompt: Implement the InfernoDrift4 revamp plan on top of the current InfernoDrift-derived game: better radar, cleaner HUD/menu, stronger graphics/effects, distinct modes/minigames, live Cloudflare Workers + Durable Objects online, favicon from uploaded asset, tests, push, deploy, and verification.

2026-05-13:

- Started from `main` at `bc965cf`; current worktree was clean.
- Baseline `npm run typecheck` and `node --check script.js` passed.
- Baseline `npm test` exposed a backend WebSocket test hang/failure; this needs fixing during the online/server pass.
- User uploaded favicon source at `/Users/amandaalden/Downloads/ChatGPT Image May 13, 2026, 08_51_32 PM.png`; `sips` reports no alpha, so icon generation must key out the baked checkerboard or wrap/crop carefully.
- Added cleaner split HUD, non-interactive boost/shield status strip, forward-relative radar with player/bot/ball/objective projections in `render_game_to_text()`, mode objective state, and distinct objective markers/minigame rules.
- Added real online client UI/actions for configured WebSocket backends plus Cloudflare Worker/Durable Object scaffold, Worker workflow, stricter protocol validation, local Node backend hardening, and exact origin-spoofing test.
- Generated favicon/app icons from the uploaded wheel/flame image via `npm run icons`; outputs are `favicon.ico`, `icon.svg`, `icon-64.png`, `icon-192.png`, and `icon-512.png`.
- Fixed browser smoke regression where the status strip intercepted the HUD Menu button; `npm run smoke` now asserts Max, radar, online fallback, forced replay/demo, campaign return, and all ID4 mode routing.
- Added mobile landscape smoke coverage and a test API hook for device-mode forcing; `npm run test:e2e` now covers dev mode and phone landscape HUD/radar/touch selection.
- Ran the required `develop-web-game` Playwright client against local `http://127.0.0.1:4173/index.html`; first attempt timed out on `page.goto`, second attempt passed and produced `output/web-game/shot-0.png`, `shot-1.png`, and state JSON with clean console output.
- Added `smoke_online_local.mjs` and `npm run smoke:online-local`; it caught and fixed Online UI socket sequencing by adding a pending outbound message queue, then passed against the local Node backend with real connect/create-room/chat through the Online tab.
- Final local validations before commit: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, `npm run format`, `npm run smoke`, `npm run test:e2e`, `npm run smoke:online-local`, `npm run worker:check`, and `npm run worker:types` passed. Headless WebGL emitted GPU stall warnings only.

2026-05-14:

- Addressed review feedback on `packages/protocol/src/index.ts` by expanding moderation beyond basic profanity: markup stripping, PII redaction, leet/obfuscation normalization, severe harassment/self-harm encouragement blocking, racist/antisemitic hate patterns, anti-LGBTQ slur patterns, and age-13+ free-chat enforcement.
- Mirrored the stronger sanitizer into `apps/server/src/index.js` and `apps/worker/src/protocol.js` so the shared protocol, local Node backend, and Cloudflare Worker do not disagree on chat safety.
- Added `tests/protocol.test.ts` and expanded `tests/server.test.mjs` to cover the new moderation categories, Clark founder badge semantics, and free-chat age gate.
- Made `smoke_online_local.mjs` start its own local backend on an ephemeral port, seed the client server URL before page load, and wait for `render_game_to_text()` instead of depending on a pre-running `ws://127.0.0.1:8787/ws`.
- Focused validation after this pass: `npm run typecheck`, `npm test`, `npm run build`, `npm run format`, and `npm run smoke:online-local` passed.

2026-05-14 docs-only status refresh:

- Inspected the current worktree without touching code files. Current active client source is the Vite/React/TypeScript app under `client/`, backed by `packages/game-core` and `packages/protocol`; the earlier root static files should not be described as the primary implementation for the revamp.
- Updated docs to describe the React Three playfield, garage preview, typed game-core state/modes/radar/progression, protocol moderation expansion, local Node backend, and Cloudflare Worker/Durable Object backend.
- Marked current React-revamp validation as pending parent verification. Older passing logs in this file belong to prior source states unless a parent run confirms the current tree.
- Marked Cloudflare live deployment as blocked because no verified Worker URL is recorded in docs/source and deploy secrets are not visible in the repo. Live online should only become unblocked after secrets exist and a real `wss://.../ws` endpoint is verified from Pages.

2026-05-14 quality recovery pass after user rejected game/UI feel:

- Spawned role-scoped workers for UI/HUD, gameplay-core, and Three.js scene polish. Integrated the completed gameplay-core and renderer passes plus the local input fix.
- Fixed deterministic browser playtesting: `window.advanceTime(ms)` now reads current keyboard/touch/gamepad state per frame, so Playwright action bursts actually accelerate/steer/drift/boost instead of reusing a stale parked input frame.
- Gameplay-core pass made the car faster and punchier, strengthened boost/drift/jump/landing loops, added better near-miss scaling, improved bot personality pressure/damage/fail reasons, made Boost Bowling require boost/high-speed hits, and added tests for those scoring/replay behaviors.
- Three.js pass replaced the flat-looking arena with a cleaner lit neon track: rings/lanes/rail/goal frames, richer car model, headlights/tails/underglow, additive boost/drift trails, airborne shadow/jump column, landing shock ring, more readable markers/ramps, and smoothed camera lean/FOV.
- UI pass now presents the menu as a cockpit surface with Play/Garage/Progress/Online/Settings hierarchy, clearer mode cards, smaller HUD clusters, forward radar count, stronger garage preview controls, and better phone landscape scaling.
- Visual QA screenshots reviewed: `output/web-game-audit2/shot-3.png` showed improved live driving scene with actual movement and cleaner radar/HUD; `output/web-game-audit2/title.png` and `menu-garage.png` showed improved title/garage hierarchy.
- Validation after this pass: `npm run typecheck`, `npm test`, `npm run format`, `npm run smoke`, `npm run test:e2e`, `npm run smoke:online-local`, `npm run worker:check`, and `npm run worker:types` passed. Headless WebGL still logs expected SwiftShader `ReadPixels` warnings only.

2026-05-15 ID3 rescue restore after user rejected the new-game direction:

- Reverted the shipped playable surface back to the actual ID3 source files from `/Users/amandaalden/Downloads/Codex App Test`: `index.html`, `script.js`, and `style.css` were copied byte-for-byte into `InfernoDrift4`.
- Kept the static GitHub Pages build wrapper (`scripts/build-site.mjs`) so Pages deploys the restored ID3 game instead of the rejected React/Three shell.
- Preserved ID3 ground speed/reference lines, close third-person camera, old HUD/radar/menu composition, touch controls, Max Arena foundation, and test hooks.
- Realigned `smoke_games.mjs` and `smoke_mobile.mjs` to the ID3 contract instead of the rejected ID4 mode shell.
- Converted `smoke_online_local.mjs` into a backend WebSocket smoke so it does not fake an Online tab in the restored ID3 client; it still verifies guest auth, private room join, quick chat, 13+ free-chat gate, sanitizer, input snapshot, bot fill, and leaderboard.
- Reviewed restored screenshots: `output/web-game/id3-restore/shot-3.png`, `output/web-game/id3-restore-moving/shot-1.png`, and `output/playwright/mobile-landscape-smoke.png`.
- Validation after restore: `node --check script.js`, `npm run typecheck`, `npm test`, `npm run build`, `npm run smoke`, `npm run test:e2e`, `npm run smoke:online-local`, and develop-web-game Playwright client passed. Headless WebGL emitted expected SwiftShader `ReadPixels` warnings only.
