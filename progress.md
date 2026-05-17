Original prompt: Implement the InfernoDrift4 revamp plan on top of the current InfernoDrift-derived game: better radar, cleaner HUD/menu, stronger graphics/effects, distinct modes/minigames, live Cloudflare Workers + Durable Objects online, favicon from uploaded asset, tests, push, deploy, and verification.

2026-05-13:

- Started from `main` at `bc965cf`; current worktree was clean.
- Baseline `npm run typecheck` and `node --check script.js` passed.
- Baseline `npm test` exposed a backend WebSocket test hang/failure; this needs fixing during the online/server pass.
- User uploaded favicon source at `/Users/amandaalden/Downloads/ChatGPT Image May 13, 2026, 08_51_32 PM.png`; `sips` reports no alpha, so icon generation must key out the baked checkerboard or wrap/crop carefully.
- Added cleaner split HUD, non-interactive boost/shield status strip, forward-relative radar with player/bot/ball/objective projections in `render_game_to_text()`, mode objective state, and distinct objective markers/minigame rules.
- Added real online client UI/actions for configured WebSocket backends plus Cloudflare Worker/Durable Object scaffold, Worker workflow, stricter protocol validation, local Node backend hardening, and exact origin-spoofing test.
- Generated favicon/app icons from the uploaded wheel/flame image via `npm run icons`; outputs are `favicon.ico`, `icon.svg`, `icon-64.png`, `icon-192.png`, and `icon-512.png`.
- Fixed browser smoke regression where the status strip intercepted the HUD Menu button; `npm run smoke` now asserts Max, radar, online fallback, forced replay/demo, campaign return, and all InfernoDrift4 mode routing.
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

2026-05-15 InfernoDrift4 rescue restore after user rejected the new-game direction:

- Reverted the shipped playable surface back to the actual base InfernoDrift4 source files from `/Users/amandaalden/Downloads/Codex App Test`: `index.html`, `script.js`, and `style.css` were copied byte-for-byte into `InfernoDrift4`.
- Kept the static GitHub Pages build wrapper (`scripts/build-site.mjs`) so Pages deploys the restored InfernoDrift4 game instead of the rejected React/Three shell.
- Preserved base InfernoDrift4 ground speed/reference lines, close third-person camera, old HUD/radar/menu composition, touch controls, Max Arena foundation, and test hooks.
- Realigned `smoke_games.mjs` and `smoke_mobile.mjs` to the restored InfernoDrift4 contract instead of the rejected mode shell.
- Converted `smoke_online_local.mjs` into a backend WebSocket smoke so it does not fake an Online tab in the restored InfernoDrift4 client; it still verifies guest auth, private room join, quick chat, 13+ free-chat gate, sanitizer, input snapshot, bot fill, and leaderboard.
- Reviewed restored screenshots: `output/web-game/id3-restore/shot-3.png`, `output/web-game/id3-restore-moving/shot-1.png`, and `output/playwright/mobile-landscape-smoke.png`.
- Validation after restore: `node --check script.js`, `npm run typecheck`, `npm test`, `npm run build`, `npm run smoke`, `npm run test:e2e`, `npm run smoke:online-local`, and develop-web-game Playwright client passed. Headless WebGL emitted expected SwiftShader `ReadPixels` warnings only.
- Added unobtrusive username tags for real remote/human players only. The tag system creates lightweight remote car visuals, clamps/hides tags that would overlap the HUD, sanitizes usernames, exposes `humanPlayers` in `render_game_to_text()`, and adds `setRemoteHumanPlayers()` / `getRemoteNameTags()` test hooks. Bots remain unlabeled.
- Verified the nametag visually with `output/playwright/name-tag-smoke.png`; focused validation after the tag change: `npm run typecheck`, `npm run build`, and `npm run smoke` passed.

2026-05-16 InfernoDrift4-first launch rescue implementation pass:

- Reconfirmed the root static files are the launch surface and changed `npm run dev:web` to serve the static game from `http://127.0.0.1:4173/index.html`; `npm run dev:react` now preserves the old Vite client for reference only.
- Updated visible product identity to `InfernoDrift4` while keeping the base Classic/Campaign Survival and Max Arena mode identities.
- Reassigned keyboard backflip from `C` to `B`; `C` is now reserved for the future backend-backed chat phase.
- Rebuilt the radar renderer as a clean forward-relative tactical box with top/front, left/car-left, right/car-right, minimal boundary, no heavy grid, edge arrows, and clean player/bot/human/ball/ramp/powerup icons.
- Expanded `render_game_to_text()` with `ui`, `radar`, `progression`, and honest `online.status = "offline-static"` data so tests can verify the current static launch truth.
- Updated README and docs to stop overclaiming the rejected React/Vite build as the active launch surface and to keep hosted online explicitly blocked until Cloudflare deployment is verified.
- Fixed the radar projection sign so objects in front of the car report as front/top, then added smoke assertions for front and car-left projections.
- Verification passed: `node --check script.js`, `npm run typecheck`, `npm test`, `npm run build`, `npm run smoke`, `npm run test:e2e`, `npm run smoke:online-local`, `npm run format`, `npm run worker:check`, and `npm run worker:types`.
- Pushed rescue commit `f5e23a7`; GitHub Actions CI, Pages deploy, and Pages build/deployment completed successfully. Production smoke at `https://canimal4.github.io/InfernoDrift4/?v=f5e23a7` served the static game and started Campaign Survival with no page errors.

2026-05-16 Phase 2 UI/Garage pass:

- Kept the root static InfernoDrift4 game as the launch product and revamped the UI layer without touching the core Phase 1 driving loop.
- Split the HUD into compact run/vehicle clusters, removed effect text from persistent HUD labels, and added a transient toast layer for combo, landing, boost, and warning feedback.
- Rebuilt the pause/menu shell into focused actions plus Play, Garage, Progress, Settings, Controls, and Help tabs.
- Added structured result stats for score, best chain, near-miss streak, landing grade, clock, and next-run hook.
- Added a real Three.js Garage preview bay using the existing procedural car visual path, with drag rotation, zoom/reset controls, three local loadouts, car class summaries, and migration from the old flat customization save.
- Added keyboard remapping with duplicate-primary rejection, touch layout/scale presets, controller status, and a standard Gamepad API path. `X` remains jump/in-air trick and `B` is the alternate backflip/trick key.
- Extended `render_game_to_text()` and `__infernodriftTestApi` with Phase 2 UI, garage, control binding, touch layout, controller, and preview-state fields.
- Local Phase 2 screenshots reviewed: `output/phase2/campaign-hud.png`, `output/phase2/menu-play.png`, `output/phase2/garage.png`, and `output/phase2/controls.png`.
- Validation so far: `node --check script.js`, `npm run typecheck`, `npm test`, `npm run build`, `npm run smoke`, `npm run test:e2e`, and `npm run smoke:online-local` passed. Headless WebGL emitted expected `ReadPixels` warnings only.

2026-05-17 Phase 3 offline modes and progression pass:

- Kept the root static InfernoDrift4 game as the shipped product and layered Phase 3 on top of the existing driving runtime instead of changing the launch architecture.
- Added a visible Play mode board with Campaign, Arena, Speed, Tricks, Chase, and Minigames groups; every required offline mode/minigame has a card, objective, run length, reward preview, medal data, and one-click start through the existing menu flow.
- Added local mode controllers for Campaign Survival, Max Arena, Race, Time Trial, Stunt Park, Hunter Tag, Battle Arena, Ramp Rush, Boost Bowling, Lava Floor, King of the Zone, plus experimental entries that were later removed from the public Play board.
- Added mode-specific scene objects and rules: checkpoint tracks and ghost samples, stunt/ramp gates, drift zones, Hunter Tag role switching, boss phases, safe zones, king zones, boosted bowling targets, and kid-friendly battle pickups.
- Added `progressionV2` local progression with XP, levels, medals, personal bests, ghost samples, daily/weekly challenge seeds, reward log, save migration defaults, and a Progress "Run Board".
- Extended `render_game_to_text()` and `__infernodriftTestApi` with public mode ids, mode catalog helpers, mode start/complete/fail helpers, progression snapshots, markers, track, ghost, battle pickup, hunter tag, and boss state.
- Cleaned visible wording so public UI/docs/test state use `InfernoDrift4`, Campaign Survival, and Max Arena naming; old mode ids remain internal aliases only for save/test-selector compatibility.
- Visual QA screenshots reviewed: `output/playwright/phase3-play-board.png`, `output/playwright/phase3-results.png`, and `output/playwright/mobile-landscape-smoke.png`.
- Validation after Phase 3: `npm run format`, `npm run typecheck`, `npm test`, `npm run build`, `npm run smoke`, `npm run test:e2e`, `npm run smoke:online-local`, `npm run worker:check`, and `npm run worker:types` passed. Production smoke also passed against `https://canimal4.github.io/InfernoDrift4/?v=eea9193b`. Headless WebGL emitted expected SwiftShader `ReadPixels` warnings only.

2026-05-17 Phase 3 repair pass:

- Repaired the public Phase 3 mode set by removing four experimental entries from the Play board/catalog/tests/docs while leaving legacy save data harmless.
- Rebuilt Battle Arena as a blue-vs-red laser-tag mode with split floor, team-colored temporary skins, solid cover, ammo/health, F-key lasers, reload/shield/speed pickups, KO scoring, and battle bot roles that seek cover/reload/advance.
- Reworked Stunt Park and Ramp Rush as solo modes with no bots, visible ramp/loop/ring layouts, barrel-roll/trick state, loop volumes, ramp/ring scoring, and landing-chain feedback.
- Reworked Lava Floor with actual rising lava, elevated safe platforms and ramps, bot safe-zone targeting, and stronger car-to-car bumping.
- Reworked Boost Bowling as a bounded ten-pin lane with countdown launch, steering-only roll, pin setup/reset, scoring state, and smoke helpers.
- Reworked Race/Time Trial around bounded winding tracks, rival-only bumping in Race, no bots in Time Trial, checkpoint state, and ghost samples; toned down track guardrails so they read as dark rails plus narrow neon curbs instead of oversized colored slabs.
- Polished Max Arena goal replay with longer slow-motion replay settings, goal explosion burst, screen pulse, and replay ring/vignette state.
- Added H-key mode help and result-screen Help access with objective/controls/scoring/win tips for every remaining public mode.
- Fixed thumbnail/card sizing so mode art uses square cells without stretch/crop and updated public smokes to assert removed modes are absent.
- Visual QA reviewed latest screenshots: `output/playwright/phase3-play-board.png`, `phase3-battle-arena.png`, `phase3-race.png`, `phase3-stunt-park.png`, `phase3-ramp-rush.png`, `phase3-lava-floor.png`, `phase3-boost-bowling.png`, and `output/web-game/phase3-repair/shot-2.png`.
- Validation after repair: `node --check script.js`, `node --check smoke_games.mjs`, `npm run format`, `npm run typecheck`, `npm test`, `npm run build`, `npm run smoke`, `npm run test:e2e`, `npm run smoke:online-local`, `npm run worker:check`, `npm run worker:types`, and the shared `develop-web-game` Playwright client passed. Headless WebGL emitted expected SwiftShader `ReadPixels` warnings only.
- Follow-up deploy verification: pushed Phase 3 repair to `main`, confirmed GitHub Pages served the matching `script.js` bytes for the new build, and ran live `SMOKE_URL=https://canimal4.github.io/InfernoDrift4/?v=9cd0e26 node smoke_games.mjs` successfully. Online/Cloudflare work remains intentionally deferred until the later phase.
