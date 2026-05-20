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
- Pushed rescue commit `f5e23a7`; GitHub Actions CI, Pages deploy, and Pages build/deployment completed successfully. Production smoke at `https://canimal4.github.io/InfernoDrift/?v=f5e23a7` served the static game and started Campaign Survival with no page errors.

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
- Validation after Phase 3: `npm run format`, `npm run typecheck`, `npm test`, `npm run build`, `npm run smoke`, `npm run test:e2e`, `npm run smoke:online-local`, `npm run worker:check`, and `npm run worker:types` passed. Production smoke also passed against `https://canimal4.github.io/InfernoDrift/?v=eea9193b`. Headless WebGL emitted expected SwiftShader `ReadPixels` warnings only.

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
- Follow-up deploy verification: pushed Phase 3 repair to `main`, confirmed GitHub Pages served the matching `script.js` bytes for the new build, and ran live `SMOKE_URL=https://canimal4.github.io/InfernoDrift/?v=9cd0e26 node smoke_games.mjs` successfully. Online/Cloudflare work remains intentionally deferred until the later phase.

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
