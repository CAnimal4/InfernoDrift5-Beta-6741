Original prompt: Implement the InfernoDrift4 revamp plan on top of the current InfernoDrift-derived game: better radar, cleaner HUD/menu, stronger graphics/effects, distinct modes/minigames, live Cloudflare Workers + Durable Objects online, favicon from uploaded asset, tests, push, deploy, and verification.

2026-05-20 repo sync verification:

- Confirmed `InfernoDrift` and `InfernoDrift4` use the shared peer-sync GitHub Actions workflow so ID4 updates can propagate between both repos while preserving repo-specific Pages URLs.

2026-05-20 Firebase lobby/progress preservation pass:

- Made Firebase the default production online backend for accounts, chat, leaderboard, friends, feedback, progress, and online-lite lobbies while keeping the old Worker backend as a legacy fallback/import reference only.
- Added Firebase lobby create/join/share support so private room codes work in Firebase mode for social grouping and chat invites; live server-authoritative racing remains honestly marked as requiring a trusted WebSocket server.
- Added a legacy Worker progress import bridge that detects an existing old Worker session token, fetches the old `/api/profile` save bundle, compares total XP, and syncs the higher-progress save into Firestore so existing players do not lose XP when moving to Firebase.
- Hardened Firebase progress sync so login/auth no longer overwrites a higher Firestore save with a lower local save.
- Published updated Firestore rules in the Firebase console for lobby docs and room-invite chat payloads after CLI auth was unavailable locally.
- Validation passed for this pass: `node --check script.js`, `node --check firebase-online.js`, `node --test tests/firebase-online.test.mjs`, `npm run typecheck`, `npm test`, `npm run build`, `npm run smoke:firebase-live`, `npm run smoke:firebase`, `npm run smoke`, `npm run test:e2e`, `npm run smoke:online-local`, `npm run worker:check`, `npm run worker:types`, and the develop-web-game Playwright client against local `http://127.0.0.1:4173/index.html`.

2026-05-20 Firebase room join repair:

- Started a focused fix for Firebase lobby joining after the Join button did not reliably put players into shared rooms.
- Added live Firestore lobby document subscriptions after Firebase lobby create/join so hosts and joiners automatically see updated membership.
- Made the Join button fall back to the newest visible room invite when the code input is empty, while still showing a clear message if no code/invite exists.
- Extended the Firebase live smoke to use a second browser context/account, join from the shared invite path, and verify the host sees the joiner in the lobby.
- Validation passed for this repair: `node --check script.js`, `node --check firebase-online.js`, `node --check smoke_firebase_live.mjs`, `node --test tests/firebase-online.test.mjs`, `npm run typecheck`, `npm test`, `npm run build`, `npm run smoke:firebase-live`, `npm run smoke:firebase`, `npm run smoke`, `npm run smoke:online-local`, `npm run test:e2e`, `npm run lint`, `npm run worker:check`, `npm run worker:types`, and the develop-web-game Playwright client with screenshots reviewed at `output/web-game/firebase-room-join/shot-2.png`.

2026-05-20 Firebase old-backend regression audit:

- Reviewed the Build InfernoDrift4 thread notes for old backend fixes: global total-XP progression, canonical account leaderboard rows, profile/save restore without downgrading XP, room-share reliability, global lobby chat history, feedback truthfulness, friend request visibility, and cache-busted Pages deploys.
- Fixed a Firebase parity gap: account sign-in now immediately refreshes the saved progress into Firestore and writes the canonical total-XP leaderboard row, matching the old Worker behavior that repaired missing/stale leaderboard rows on auth/profile restore.
- Fixed another Firebase parity gap: leaderboard reads now return the signed-in player's own `playerRow` even when that user is outside the top leaderboard page.
- Extended the live Firebase smoke so a fresh account redeems XP, syncs it, sees it in the Firebase leaderboard, logs out, signs back in, and confirms the same XP is restored and still present as the player's leaderboard row.

2026-05-20 player-facing backend copy cleanup:

- Removed visible `Firebase` naming from normal player-facing account, lobby, feedback, offline, and online-status text. The game now says "online services", "online guest", and "online lobby" in normal play.
- Kept Firebase wording in developer/diagnostics areas such as Advanced Server settings, source identifiers, backend tests, and docs.
- Updated the Firebase live smoke expectations to assert the new player-facing "Create Online Lobby" / "Online lobby" copy.
- Validation passed: `node --check script.js`, `node --check smoke_firebase_live.mjs`, `npm run typecheck`, `npm run smoke:firebase-live`, `npm run smoke:firebase`, `npm run build`, `npm run smoke`, `npm test`, the develop-web-game Playwright client, and a direct Online-tab text audit proving the non-advanced Online panel contains no `Firebase` text.

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

2026-05-17 Phase 3 repair follow-up:

- Continued the offline Phase 3 repair pass after user feedback on Battle Arena, Stunt Park, Max Arena, Hunter Tag, Lava Floor, Race/Time Trial, and Boost Bowling.
- Reworked Battle Arena further into a larger blue-vs-red capture-the-flag laser-tag match: team flags, score-to-3 win condition, expanded arena, standable cover, rapid-fire hold-F laser input, 10-ammo cap, higher health, respawn shield, ammo restock, shield bubble visuals, and flag-aware bot behavior.
- Added animated barrel-roll visuals, loop-the-loop guided physics, and loop-entry/exit burst effects for stunt modes while keeping Stunt Park solo-only.
- Slowed Lava Floor’s rise, added an opening grace window, repaired safe-zone ramps as physical launch ramps, and made Lava bots prioritize elevated safe platforms instead of instant-tag pressure.
- Made Hunter Tag easier by reducing bot stickiness, adding longer tag-back cooldown, and exposing clearer `YOU'RE IT` / `EVADING` HUD state.
- Rebuilt Race/Time Trial starts around a cleaner winding bounded track, removed hunter roles from those modes, kept Race rivals as bumping racers only, and kept Time Trial solo with ghost samples.
- Extended Max Arena replay timing/goal explosion visibility and removed the Boost Bowling pin veil/ring marker while preserving pin animation.

2026-05-17 Phase 4 client online/feedback UI pass:

- Added a first-class Online tab to the root static InfernoDrift4 menu and replaced the menu header Close button with a Feedback button.
- Added client-side backend URL config, guest username/age claim, private room create/join, queue controls, quick chat, 13+ free-chat gating, C-key chat popout, leaderboard/friends/recent rendering, remote nametag snapshots from room/match snapshots, reconnect/offline state, and richer `render_game_to_text().online` fields.
- Added a Feedback popup that collects type, message, optional diagnostics, and optional 13+ reply email, then submits to the configured `/api/feedback` endpoint or reports not-configured / not-saved errors truthfully.
- Added matching local and Cloudflare Worker backend support for feedback storage; email delivery remains Resend-secret gated.
- Changed Garage unlocks to use XP level progression from any mode instead of campaign world completion, with Progress/Garage copy and smoke state exposing the XP-level unlock rule.

2026-05-17 Battle Arena cover/cockpit follow-up:

- Spawned worker Mill for the Battle Arena cover/laser/cockpit scope request and integrated its focused pass.
- Battle Arena cover now blocks lasers through a ray/AABB occlusion check before enemy damage is applied; blocked shots show a cover impact and are exposed in `render_game_to_text().battle.lastLaserBlocked`.
- Battle Arena cover collision now resolves by overlap and removes into-wall velocity instead of launching cars, with smoke coverage that drives the player into a block and verifies the car is pushed out safely.
- Laser visuals now use layered additive beams, side streaks, muzzle rings, and impact rings.
- Added a Battle Cockpit Scope setting, scope overlay, cockpit camera telemetry, and test API hooks; cockpit mode hides the local car shell so the first-person scope view stays usable.
- Validation after this follow-up: `npm run typecheck`, `npm test`, `npm run build`, `npm run smoke`, `npm run test:e2e`, `npm run smoke:online-local`, `npm run format`, `npm run worker:check`, `npm run worker:types`, and the required `develop-web-game` Playwright client passed. Visual screenshot reviewed at `output/playwright/battle-cockpit-cover-live.png`.

2026-05-18 Phase 4 account/control/Cloudflare continuation:

- Added a title-screen account choice: create/sign in with username/password/age through a configured backend, or play as a temporary guest with a random username and session-only save.
- Kept guest play honest: the guest button starts immediately, marks the profile temporary, and stores progress in `sessionStorage` rather than permanent local save.
- Added local and Worker protocol support for `auth.account`, including age-gated chat state and PBKDF2-hashed password credentials in the local/Worker runtime.
- Fixed text entry so gameplay hotkeys such as C, F, H, movement, and remap controls type normally inside inputs/textareas/selects instead of firing game actions.
- Cleaned the controls remap flow so duplicate-key rejection returns the UI out of "Press key" state.
- Moved H-key help out of the main menu into a bottom-right paused help card and removed the standalone Help menu tab.
- Promoted Leaderboard to its own menu tab with badge-style rows, while keeping online/friends/recent players in Online.
- Rechecked subagent work: Battle Arena cover blocks laser line-of-sight, block collisions are less glitchy, laser visuals are richer, and Battle Cockpit Scope setting/state are in place.
- Created the Cloudflare D1 database `infernodrift4` in Safari/Computer Use and recorded database ID `830d1cce-a09c-4112-8a28-24b421c4acda` in `wrangler.jsonc`.
- Attempted to inspect dashboard Console migration viability; the Console interpreted the pasted multi-statement migration awkwardly and produced syntax errors, so schema setup remains Wrangler/GitHub-migration gated rather than dashboard-applied.
- Cloudflare deploy is still blocked by missing CLI/API credentials and production secrets: `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`, `RESEND_API_KEY`, verified `FEEDBACK_FROM`, production `SESSION_SECRET`, and optional Turnstile secret.

2026-05-23 Firebase special-account sign-in repair:

- Confirmed `MODERATOR` was rejected by normal username moderation even though it is a configured credential badge account, while `testy` passes local validation and already has Firebase username/profile docs.
- Added a credential-aware Firebase account validation path so exact configured special credentials can sign in without weakening normal username/chat moderation.
- Split start-screen account errors from online-service outages so invalid credentials or rejected usernames no longer show the misleading "Online services are unavailable" fallback.

2026-05-23 legacy Firebase account repair:

- Found the deeper old-account failure pattern: some exported legacy accounts have saves in `legacy-cloudflare-progress.json` but no matching Firebase Auth account yet, and alias changes like `Tosh_the_Sigma` versus `Tosh the Sigma` missed the bundled legacy lookup.
- Reworked Firebase account sign-in to try deterministic Firebase Auth first, create only trusted legacy/new accounts when Auth is missing, and repair missing Firestore profile/progress docs after Auth succeeds.
- Added safe legacy alias matching for punctuation/space changes so old saves can attach to the current username format without broad fuzzy matching.

2026-05-18 Shared XP leaderboard follow-up:

- Made Phase 3/4 progression explicitly global: every completed or failed mode/minigame run adds into one `progressionV2.xp` / `progressionV2.totalXp` pool, with level derived from total XP.
- Results and Progress now show total XP across every game and minigame, and the offline Leaderboard tab falls back to the local/guest total-XP row instead of looking empty when no backend is connected.
- Backend/local server and Worker leaderboard snapshots now rank by total XP, and `save.sync` updates the account's XP leaderboard row from `payload.progressionV2`.
- Added `migrations/0003_global_xp_leaderboard.sql` for production D1 leaderboard XP indexing.
- Smoke coverage now completes Campaign Survival and Boost Bowling back-to-back, verifies the XP adds into one total, and verifies the local leaderboard top row reflects that total XP.
- Validation after this follow-up: `npm run typecheck`, `npm test`, `npm run build`, `npm run smoke`, `npm run test:e2e`, `npm run smoke:online-local`, `npm run format`, `npm run worker:check`, `npm run worker:types`, and the shared `develop-web-game` Playwright client passed. Screenshot reviewed at `output/web-game/shot-1.png`. Headless WebGL emitted expected SwiftShader `ReadPixels` warnings only.

2026-05-18 Online reliability follow-up:

- Started a focused fix for live moderation removal, 30-minute chat history, room-code sharing, guest-profile account upgrade messaging, and minimal chat notifications when chat is closed.
- Local backend tests now cover guest-to-account upgrade, 30-minute chat history, and `room.share` broadcasting the private room code to chat.
- Client now force-pauses play and returns to Profile/account state on `moderation.kicked`, `moderation.banned`, or close codes `4002`/`4003`; chat notices auto-dismiss after five seconds and expose `noticeVisible` in `render_game_to_text()`.
- Seeded badge accounts now have an explicit regression test proving normal save/XP sync updates the global XP leaderboard.
- Production default backend now uses a fresh Worker room namespace while keeping generated room codes separate from the Durable Object namespace; old saved production URLs migrate to the new default.
- Validation so far: `node --check script.js`, `npm run typecheck`, `npm test`, `npm run build`, `npm run format`, `npm run smoke`, `npm run test:e2e`, `npm run smoke:online-local`, `npm run worker:check`, `npm run worker:types`, `npm run lint`, and the shared `develop-web-game` Playwright client passed locally. Hosted Worker deploy `12bf39b4-228d-401c-a2ff-34a29e424e71` passed `/health`, hosted online smoke at `wss://infernodrift4-online.clarkbythebay.workers.dev/ws?room=global-v3`, D1 feedback storage, D1 leaderboard query, and a live moderator kick check that closed the target socket with code `4002`. Screenshot reviewed at `output/web-game/online-reliability/shot-2.png`.

2026-05-18 Daily XP gift pass:

- Added a once-per-day Daily Gift to the shared InfernoDrift4 progression path. Each save gets a stable daily roll between 100 and 1500 XP, with higher rewards intentionally rarer.
- Added a polished clickable Daily Gift notification that appears when the gift is available, hides after redemption, writes into the same total XP pool used by every game/minigame, updates the reward log, and syncs through account save sync when signed in.
- Extended `render_game_to_text()` and `__infernodriftTestApi` with daily gift state/redeem helpers, and added smoke coverage proving the gift amount is in range, can be claimed once, increments shared XP, and hides after redemption.
- Validation for this pass: `node --check script.js`, `node --check smoke_games.mjs`, `npm run typecheck`, `npm test`, `npm run format`, `npm run lint`, `npm run build`, `npm run smoke`, `npm run test:e2e`, `npm run smoke:online-local`, `npm run worker:check`, `npm run worker:types`, and the shared `develop-web-game` Playwright client passed. Visual screenshot reviewed at `output/web-game/daily-gift/shot-0.png`.

2026-05-18 Founder friend XP bonus:

- Added a real backend-owned Founder friendship bonus: friending username `Clark` auto-accepts the Founder account, grants +1000 XP exactly once to the non-Founder player, updates the account save payload, and refreshes the total-XP leaderboard.
- Mirrored the behavior in the local Node backend and Cloudflare Durable Object Worker, added D1 migration `0006_founder_friend_reward.sql` for the one-time claim flag, and added a client `progression.reward` handler so the Progress UI and toast update immediately.
- Validation after the change: `node --check apps/server/src/index.js`, `node --check apps/worker/src/index.js`, `node --check script.js`, `node --test tests/server.test.mjs`, `npm run typecheck`, `npm test`, `npm run build`, `npm run smoke`, `npm run test:e2e`, `npm run smoke:online-local`, `npm run format`, `npm run lint`, `npm run worker:check`, `npm run worker:types`, and the shared `develop-web-game` Playwright client passed. Headless WebGL emitted expected `ReadPixels` warnings only.
- Applied remote D1 migration `0006_founder_friend_reward.sql`, deployed Worker version `e02c23e7-eabb-4986-ba1f-4952e17773bb`, verified `/health`, and ran a hosted WebSocket smoke proving `friend.request Clark` returns accepted, emits `progression.reward` for +1000 XP, and updates the live XP leaderboard.

2026-05-18 Online reliability repair:

- Reworked local backend and Worker leaderboard snapshots so every real account gets a canonical total-XP row on auth, username claim, save sync, profile restore, and Founder reward. Snapshots now return top rows plus `playerRow` for the requesting user.
- Added visible incoming/outgoing friend request state to the client Online tab, with incoming Accept buttons wired to `friend.accept`.
- Hardened feedback delivery states: feedback is always stored first, Resend delivery returns `delivered`, `stored_email_not_configured`, or `stored_email_failed`, and `.local` placeholder senders no longer pretend email is configured.
- Rebuilt room behavior toward true multiplayer rooms: unique codes, selected mode per room, separate room membership, share-once room-code chat posts, room-scoped snapshots, richer live input state, and remote car cosmetics/trick/backflip/boost display.
- Fixed the remote-car fallback visual config that browser smoke caught, so remote players without cosmetic payloads still render complete car geometry.
- Validation after this repair: `node --check script.js`, `node --check apps/server/src/index.js`, `node --check apps/worker/src/index.js`, `node --check apps/worker/src/protocol.js`, `npm run typecheck`, `npm test`, `npm run build`, `npm run smoke`, `npm run test:e2e`, `npm run smoke:online-local`, `npm run format`, `npm run worker:check`, and `npm run worker:types` passed. Headless browser runs still emit expected WebGL `ReadPixels` performance warnings only.
- Cloudflare read-only secret inspection confirmed `RESEND_API_KEY` exists, but no verified `FEEDBACK_FROM` secret is configured; checked-in `FEEDBACK_FROM` is now explicit `not-configured` so hosted feedback stores safely until a verified Resend sender is added.

2026-05-19 School-time gate pass:

- Added a weekday bell-schedule gate for InfernoDrift4 that appears only during class/tutorial blocks, not before school, after school, weekends, Break/Breakfast, or Lunch.
- The gate text says "It looks like you may be in school, are you sure you want to continue?" with a primary Leave button and a smaller "I know the risks, continue" text link.
- Leave attempts to close the tab and falls back to `about:blank` when browser security blocks `window.close()`.
- Continue dismisses the gate for the current page session and returns to the normal InfernoDrift4 title/start surface.
- Exposed school-gate state in `render_game_to_text()` and added smoke helpers/tests for Monday class, Monday break/lunch, Friday before-school, weekend, forced gate display, and dismissal.

2026-05-19 chat commands pass:

- Started targeted chat command work for `/dm` and `/report`: adding client chat-popout command panels, direct-message state, report submission UI, backend non-friend DM support, and report email delivery with recent public/DM chat context.
- Added client `/dm` and `/report` command handling in the existing chat popout. `/dm` opens friend/non-friend direct-message selection, direct messages show as filtered private threads, incoming DMs raise a click-to-open notice, and `/report` opens a report form that submits to backend moderation.
- Local Node backend and Cloudflare Worker now allow DMs to non-friend usernames unless blocked, preserve direct-message metadata in live chat state, and include recent chat from the reported player, including DM channels, in report emails to `aidan.dwight@lbusd.org` and `clark.alden@lbusd.org`.
- Focused validation so far: `node --check script.js`, `node --check apps/server/src/index.js`, `node --check apps/worker/src/index.js`, and `npm test` passed.

2026-05-19 invalid-protocol chat spam fix:

- Reproduced the recurring `System · Quick: invalid protocol` message by joining a Battle Arena room, sharing the room code, resuming play, and capturing WebSocket payloads. The share message was valid; the repeated invalid packets were `input.frame` messages carrying `trick: ""`.
- Fixed the client to omit empty optional payload fields before sending live room input frames and DM packets, so optional strings no longer violate the Worker protocol schema.
- Re-ran the same reproduction and confirmed `invalidCount: 0`; chat showed only the intended room invite. Validation passed: `node --check script.js`, `npm test`, `npm run typecheck`, `npm run build`, `npm run smoke:online-local`, `npm run worker:check`, `npm run worker:types`, `npm run format`, and `npm run smoke`.

2026-05-20 account message-size fix:

- Investigated the school-computer `account error: message too large` report. Found the protocol allowed `save.sync` payloads up to 20 KB via `validateSafePayload()`, but rejected the entire WebSocket message above 4 KB first, so accumulated account progress could hit the transport cap before the save validator ran.
- Raised the shared Worker/local protocol transport cap to 24 KB while keeping `save.sync` payload validation at 20 KB.
- Added regression coverage proving a 4.5 KB progress/save sync now passes, an over-20 KB save still fails as `invalid_protocol`, and a huge account password reports `invalid_protocol` instead of the confusing transport-size error.
- Validation so far: `node --check apps/worker/src/protocol.js`, `node --test tests/server.test.mjs`, `npm run worker:check`, `npm run typecheck`, `npm test`, `npm run worker:types`, `npm run build`, `npm run smoke:online-local`, and `npx prettier --check apps/worker/src/protocol.js tests/server.test.mjs` passed. Broad `npm run format` still fails on pre-existing `apps/server/src/index.js`, `script.js`, and untracked `INFERNODRIFT4_CHAT_HANDOFF.md`.

2026-05-20 room share rate-limit fix:

- Investigated the private-room Share Code button returning `rate_limited`. The backend was counting every `input.frame` live gameplay packet against the same generic `"protocol"` bucket as command messages, so normal room gameplay could exhaust the 60-per-10s command budget before `room.share` arrived.
- Updated both the local Node backend and Cloudflare Worker to exempt validated `input.frame` messages from the generic command protocol bucket while preserving the dedicated `room-share`, chat, social, save, moderation, report, and feedback limits.

2026-05-20 Firebase migration stress QA:

- Added `smoke_firebase_offline.mjs` and `npm run smoke:firebase` to exercise the built Pages artifact with Firebase as the default backend, no Replit URLs, empty Firebase config fallback, bad username rejection, account failure fallback, Guest Offline launch, Firebase diagnostics, blocked connect, and feedback over-limit handling.
- Tightened Firebase username and leaderboard validation so invalid usernames are rejected instead of silently normalized and malformed scores such as missing/NaN values are rejected.
- Improved Firebase chat/content guardrails for obvious sexual-content bypass spacing.
- Removed stale tracked React bundle assets from `assets/` so `dist/` only carries the current static game, Firebase modules, icons/service files, and the mode thumbnail sprite.
- Fixed feedback length UX so the textarea no longer silently truncates at 2,500 characters; the counter can exceed the limit and the UI reports exactly how many characters must be removed.
- Stress validation passed: `npm run typecheck`, `npm test`, `npm run build`, `npm run smoke:firebase`, `npm run smoke`, `npm run test:e2e`, `npm run smoke:online-local`, `npm run worker:check`, `npm run worker:types`, targeted Prettier checks for changed formatted files, and the required develop-web-game Playwright client. The only broad format failure remains pre-existing unformatted files plus the untracked handoff file.

2026-05-20 Firebase backend migration pass:

- Switched the production online direction away from Replit/Cloudflare and toward Firebase online-lite. Replit dev URLs are no longer acceptable as production, and Cloudflare/Worker code is legacy fallback/reference only unless explicitly requested.
- Added `firebase-config.js`, `firebase-online.js`, and `firebase-online-core.js`. The runtime dynamically imports the Firebase modular SDK so a blocked Firebase CDN does not prevent the game from loading.
- Firebase mode is now the default backend mode in `script.js`; old WebSocket URLs are ignored unless `BACKEND_MODE=websocket` is explicitly selected by runtime config/query.
- Added Firebase Auth account handling with username-derived email/password, Firebase Anonymous guest handling, Firestore username claim transaction support, progress sync, total-XP leaderboard rows, lobby chat, feedback storage, friend requests/accepts, and diagnostics.
- Kept authoritative multiplayer honest: Firebase mode disables live rooms/queues and explains that server-authoritative rooms need a separate trusted WebSocket server.
- Added `firestore.rules` for Auth-gated user/progress writes, username uniqueness, conservative leaderboard writes, chat length checks, feedback limits, friend request boundaries, and diagnostics.
- Added Firebase validation tests in `tests/firebase-online.test.mjs`; focused run `node --test tests/firebase-online.test.mjs` passed.
- Updated README and docs so future Codex prompts target Firebase config/rules and do not publish/sync to Replit or Cloudflare unless the owner explicitly asks for legacy server work.
- Removed noisy per-frame `input.accepted` acknowledgements that could queue ahead of `room.shared`, and made room-share chat/ack broadcast before D1/persistence work so the code appears immediately.
- Added regression coverage that creates a room, sends 70 valid live input frames, shares the room code, receives `room.shared`, and does not receive per-frame `input.accepted` spam.
- Validation so far: `node --check apps/server/src/index.js`, `node --check apps/worker/src/index.js`, `node --check smoke_online_local.mjs`, `node --test tests/server.test.mjs`, `npm run typecheck`, `npm test`, `npm run smoke:online-local`, and `npm run worker:check` passed.

2026-05-20 global main-chat history fix:

- Investigated the report that main-chat messages from 8:40-8:45 were not visible to a user logging in at 8:50. Root cause: when a player was inside a private room, non-DM chat was stored as a room-specific channel (`room:CODE`) and only that room's history saw it.
- Changed non-DM chat in both local Node and Cloudflare Worker backends to always use the global `lobby` channel and broadcast globally, regardless of private-room membership. DMs remain private/direct.
- Added regression coverage proving a user can chat while inside a private room, then a later user can sign in without joining the room and receive that message in `chat.history` within the 30-minute window.
- Validation so far: `node --check apps/server/src/index.js`, `node --check apps/worker/src/index.js`, `node --test tests/server.test.mjs`, `npm run typecheck`, `npm test`, `npm run smoke:online-local`, and `npm run worker:check` passed.

2026-05-20 leaderboard rank-tier tuning:

- Replaced XP-threshold leaderboard statuses with rank-based badges so only the current #1 row can be `Inferno`.
- Set ranks #2-#3 to `Platinum`, #4-#6 to `Gold`, #7-#10 to `Silver`, and lower ranks to `Bronze`.
- Added visual tier styling for Platinum, Silver, and Bronze, and exposed the computed `tier` in `render_game_to_text()` for smoke coverage.
- Bumped the static `style.css` and `script.js` asset query strings in `index.html` so GitHub Pages clients pull the updated leaderboard code immediately.

2026-05-20 automatic Cloudflare-to-Firebase save recovery:

- Exported the old Cloudflare D1 password-account save/progress rows into `legacy-cloudflare-progress.json` and added it to the static build output. The manifest contains usernames, XP summary, and save payloads only; it does not include password hashes, salts, sessions, private tokens, or old user IDs.
- Made old usernames with spaces valid in the Firebase wrapper and mapped spaces to dots in the derived Firebase Auth email, so legacy names like `Tosh the Sigma` and `Squawking parrot` can keep working.
- Added automatic sign-in recovery: if a matching legacy username exists in the bundled manifest, Firebase sign-in can create the missing Firebase Auth account and then silently import the higher-XP old Cloudflare save into Firestore. No manual recovery button is required.
- Published updated Firestore rules in the Firebase Console at 7:16 PM to allow the legacy username shape while keeping Auth-gated writes and field restrictions.

2026-05-20 progression, Garage, and first-time flow refresh:

- Upgraded `progressionV2` to schema version 3 with a formula XP curve, derived level, Embers, owned cosmetics, claimed level rewards, Daily Sparks, first-mode intro tracking, tutorial completion, and recent reward history.
- Added mirrored pure progression utilities in `packages/game-core/src/index.ts` for XP curve lookup, level progress, level rewards, XP awards, and level reward claiming.
- Rebuilt the first screen around a clear `PLAY NOW` action with smaller `Login / Sign Up`, `Play as Guest`, and `Start Tutorial` actions. Guest/offline play remains available when online services fail.
- Added the First Drive tutorial entry path, unified Play mode cards, Driver Track progress UI, Daily Sparks panel, level-up reward reveal, result XP/Ember feedback, and first-time mode explanation overlays.
- Reworked Garage into visual category carousels backed by cosmetic metadata, Ember purchase/equip guards, owned/equipped/locked/buy states, and expanded categories for body, colors, decals, livery, wheels, tires, spoiler, stance, underglow, boost trail, exhaust, horn, goal burst, tint, nameplate, and finish.
- Improved the stylized low-poly car visual with cleaner bumpers, side skirts, fenders, dynamic ride height, decals, finish materials, exhaust, boost flame anchors, and safer fallbacks for partial remote-player cosmetic payloads.
- Kept new economy fields inside the existing Firebase progress save payload; no Firestore top-level rule changes were required.

2026-05-21 Garage, leaderboard, rooms, and DM polish:

- Fixed the unified Play grid so mode cards fill the Play panel instead of bunching to the right, with stable thumbnails and smoke coverage for card width/left alignment.
- Moved the Garage preview bay above the cosmetic browser, hid the old Performance Build/Appearance dropdown panels, replaced the large Cosmetic Browser header with a sticky Embers pill, and added icons to Garage category/card bars.
- Wired Garage card equips so purchases and equips immediately update the saved customization and preview config; the smoke now verifies buying/equipping Muscle changes the active body and car silhouette.
- Expanded the Driver Track window to 50 levels so the Progress tab shows a longer reward path.
- Stopped Firebase guest leaderboard submissions, deduped visible leaderboard rows by user ID and normalized username, and updated Firestore rules for the new signed-in leaderboard account/guest metadata.
- Fixed Firebase/private room join so a successful join launches the joined mode immediately, closes the menu into the playing screen, and preserves the room code.
- Added successful-send visibility for Firebase DMs so the sender immediately sees their own private message in the active DM thread.

2026-05-21 legacy-to-Firebase sync hardening:

- Tightened Firebase account sign-in/create so the save sent into the Firebase transaction is the best of current browser progress and the bundled old Cloudflare D1 save for the same normalized username.
- Kept legacy import markers from hiding a downgraded Firebase account: if the local/Firebase save has less XP than the old imported marker, the client checks the bundled export/legacy API again instead of skipping recovery.
- Added tests proving the Firebase attach path prefers legacy XP and that an old import marker cannot mask lower current progress.

2026-05-21 Play card readability and sign-in fallback:

- Fixed Play mode cards so game titles, descriptions, mode metadata, rewards, and medal text render on separate readable lines instead of jammed uppercase text.
- Made Firebase account progress sync tolerate old live Firestore leaderboard rules: account sign-in no longer fails just because the optional leaderboard `account`/`guest` metadata is rejected, and the client retries the older leaderboard payload shape.
- Local live Firebase smoke passed after this fallback, confirming account sign-in works even before the newer Firestore rules are published.

2026-05-21 car visuals and boost cone polish:

- Changed the rear cone/boost flame mesh so it is hidden by default and only appears during active boost, including remote-player boost snapshots and campaign bot burst boosts.
- Added a new Monster body option with taller ride height, larger tires, wider wheels, heavier grip, and slower turning so body type changes both build and driving feel.
- Added per-body visual types and extra low-poly detail pieces: grilles, hood scoops, door panels, roof details, aero splitters/spines, rally guards, muscle haunches, and monster truck rails/guards.
- Upgraded decals from a small top stripe into visible hood/side graphics with flame and star treatments, and exposed body type/decal/boost-cone state in test snapshots.

2026-05-21 Codex system leaderboard row:

- Added a non-playable `ChatGPT (Codex)` system leaderboard row that is injected only into displayed rankings, flagged as non-playable/system, and automatically stays just ahead of the highest real XP row.
- Reserved the Codex username in Firebase and legacy WebSocket account flows so players cannot create, sign in as, or claim the system identity.
- Added targeted tests/smoke assertions for Firebase username rejection, WebSocket account rejection, Codex first-place ranking, and close XP chasing.

2026-05-21 laser sparks and Play Now auth polish:

- Updated `PLAY NOW` so filled account credentials route through Login / Sign Up instead of silently starting a guest profile; blank credentials still start guest/offline quickly.
- Added extra battle laser feedback: muzzle sparks, shield sparks, cover impact sparks, hit sparks, and a brighter KO spark burst.
- Cache-busted the static app assets for the Pages deployment.

2026-05-21 Play Now blank-field fix:

- Tightened `PLAY NOW` credential detection so a prefilled username or age alone no longer triggers account validation; only a real username plus password routes to Login / Sign Up.
- Expanded smoke coverage for blank, username-only, age-only, and filled credential states.

2026-05-21 garage progression/ownership migration fix:

- Fixed old/Replit/Cloudflare progression migration so a stored level now contributes the minimum XP for that level instead of being overwritten by missing/low XP.
- Preserved legacy garage unlocks and currently equipped cosmetics as owned during save load, preventing level-unlocked or previously selected paint from asking to unlock/buy again.
- Added smoke coverage for a level 7 legacy save with level 3 paint equipped/owned/unlocked.

2026-05-23 redundant chat moderation rewrite:

- Rebuilt the Firebase chat/feedback sanitizer around stronger normalization variants so blocked content is caught through spaces, punctuation, asterisks, simple leetspeak, repeated letters, and compacted text.
- Split mild language from hard-block categories: mild words are replaced with kid-safe wording, while stronger profanity, hate/harassment, anti-LGBTQ/antisemitic/racist abuse, explicit content, self-harm harassment, and personal-info fishing are rejected.
- Mirrored the same moderation behavior into the shared protocol and legacy Worker/local server sanitizer so Firebase chat, DMs, feedback, WebSocket chat, and HTTP fallback do not disagree.
- Added targeted regression coverage for obfuscated blocked words, personal-info prompts, and mild replacements without corrupting harmless words like Hello.

2026-05-23 account-system audit and friction pass:

- Audited Firebase account creation/sign-in, special password badges, local account save targets, server save application, and cross-device save merge behavior.
- Consolidated Firebase special badge account definitions into exported static/password account tables and added alias support so safe legacy spelling changes, such as Tosh the Sigma, resolve to the canonical Tosh_the_Sigma account instead of creating a duplicate path.
- Relaxed the start-screen username validator to match Firebase account rules by allowing spaces, while preserving the same blocked/reserved username protections downstream.
- Hardened Firebase save merging so cross-device sync keeps the highest XP, unions owned/unlocked rewards, merges daily progress, and uses the newest dated save for Embers, customization, garage/loadouts, settings, and other device-local shell state.

2026-05-23 one-time visible chat cleanup:

- Added a narrow Firebase chat history cutoff after moderation testing so older public/DM chat docs are no longer emitted into the client history or notices.
- Did not loosen Firestore rules or change normal chat writes; new chat messages after the cutoff continue to send, store, notify, and display normally.

2026-05-23 badge account XP cleanup:

- Removed badge-based XP seeding from special/password accounts. Clark, MODERATOR, Tosh_the_Sigma, JFine, Joshua, Billy, and any future badge account now behave like normal accounts with only the badge added.
- Disabled the old Founder Friend XP bonus so friending Clark no longer grants progression just because Clark is a special account.
- Added sign-in/load cleanup for special accounts with legacy seeded XP but no hard-earned play evidence. Hard-earned progress is preserved when the save shows real play history such as medals, bests, rewards, tutorial progress, Daily Sparks progress, or owned/equipped non-default cosmetics.
- Cache-busted the static client assets for the Pages deployment.

2026-05-23 badge account XP deep repair:

- Found a deeper Firebase merge issue: cleaned special-account saves could be merged back upward because sync always preferred the highest existing XP. Added a replace-sync path for account cleanup so old inflated Firestore XP cannot resurrect itself.
- Added explicit special-account progression policies: Clark is capped to the owner-reported hard-earned baseline of about 22k XP, while MODERATOR, Joshua, Tosh_the_Sigma, and Billy reset automatic seeded progression to fresh-account XP/Embers.
- Restored the intended Founder Friend reward: friending Clark grants +1000 XP once to the non-Clark player, without seeding Clark or any other badge account.
- Cache-busted the static client assets again for the repair deployment.

2026-05-23 badge account XP rule unblock:

- Found that Clark's live Firestore progress document still contained a legacy `serverUpdatedAt` key, so owner-authenticated repair writes were rejected by current rules before the new cleanup code could replace the polluted payload.
- Added narrow Firestore rule compatibility for legacy `serverUpdatedAt` on progress docs and `updatedAt` on leaderboard docs, then added a display-side safety cap so known special badge rows with obviously polluted 90k+ XP cannot keep dragging Rankings upward while cleanup propagates.
- Bumped the special badge repair marker/cache bust to force refreshed clients through the new cleanup path.

2026-05-24 garage visual cosmetics pass:

- Wired previously subtle Garage categories into actual car geometry/material changes: tires now affect tread, sidewalls, stripe colors, and wheel size; stance changes ride height and visible suspension; nameplates have distinct rear plate geometry; finishes add material clearcoat/metalness plus visible gloss/matte/metallic/lava details.
- Made body classes more distinct with stronger proportions and extra silhouette pieces for muscle, monster, interceptor, prototype, rally, and street builds.
- Adjusted the Garage preview camera so lifted/wide builds stay framed, and added smoke coverage that equips monster/rally tires/lifted stance/legend plate/lava finish and verifies the visual config changes.
