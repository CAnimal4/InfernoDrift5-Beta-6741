# Final Report

Status: active work is the InfernoDrift4.1 polish-and-upgrade release. The current shipped game is the root `index.html`, `script.js`, and `style.css` build, not the rejected React/Vite rewrite.

## URLs

- Repo: https://github.com/CAnimal4/InfernoDrift4
- Pages target: https://canimal4.github.io/InfernoDrift4/
- Primary online backend mode: Firebase online-lite
- Legacy Worker fallback/reference: wss://infernodrift4-online.clarkbythebay.workers.dev/ws

## Current Implementation Summary

- Root static files are the launch surface and `npm run build:web` copies them into `dist/`.
- Visible product identity now uses InfernoDrift4.1 while preserving the base mode DNA.
- Campaign Survival keeps the readable InfernoDrift4 drift-survival loop: close camera, ground speed/reference lines, hunters, ramps, boost pads, powerups, touch controls, quick restarts, local save, and customization unlocks.
- Max Arena remains real local gameplay with ball physics, teams, bot roles, health, lunges, score, goal replay, and ball cam.
- The radar has been rebuilt as a clean forward-relative tactical radar where top is in front, left is car-left, right is car-right, and edge icons indicate off-radar threats.
- `render_game_to_text()` now reports UI screen, radar projections, progression, and honest offline/static online status.
- HUD/menu Phase 2 is active: compact gameplay clusters, focused pause actions, structured result stats, clearer Play/Garage/Progress/Settings/Controls/Help hierarchy, and scroll-safe long panels.
- Garage Phase 2 is active: Three.js preview bay, drag rotation, zoom/reset controls, three local loadouts, class summaries, instant cosmetic application, and migration from the old flat customization save.
- Controls Phase 2 is active: `X` remains jump/in-air trick, `B` is the alternate backflip/trick key, keyboard remapping persists, touch presets/scale are configurable, controller status is visible, and standard Gamepad API controls are mapped.
- `C` opens Firebase-backed chat when signed in or online as guest.
- The Online tab now has a clearer connect/create/join/share flow, online driver presence, rich lobby cards, copyable lobby codes, pending join/share states, member lists, and ready toggles.
- Remote human username tags are available through the test/API layer for real players only and remain unobtrusive.
- Phase 3 repair is active: the Play board exposes Campaign, Arena, Speed, Tricks, Chase, and Minigames groups with Campaign Survival, Max Arena, Race, Time Trial, Stunt Park, Hunter Tag, Battle Arena, Ramp Rush, Boost Bowling, Lava Floor, and King of the Zone.
- Mode runs now use distinct local rules and scene objects: bounded winding race tracks, solo stunt loops/rings, clearer directional objective hints, Hunter Tag role switching, red-vs-blue laser battle, rising lava platforms, king zones, and ten-pin Boost Bowling.
- Local progression now uses `progressionV2` with XP, levels, medals, personal bests, ghost samples, daily/weekly challenge seeds, reward log, save migration defaults, and a Progress "Run Board".

## Backend Status

- Firebase online-lite is the production default for accounts, anonymous guests, username uniqueness, progress, leaderboard, lobby chat, friends, feedback, and diagnostics.
- Local Node backend is real/local and covered by tests/smoke for legacy WebSocket room-server work.
- Cloudflare Worker/Durable Object source and URL remain legacy fallback/reference only.
- Replit publish is not part of the free path, and Replit dev URLs must not be production.
- Live authoritative multiplayer remains unavailable in Firebase mode; local/bot/offline play stays available.

## Required Verification Before Release Sign-Off

Latest InfernoDrift4.1 verification run on 2026-06-10:

- `node --check script.js`: passed.
- `node --check firebase-online.js`: passed.
- `node --check smoke_games.mjs`: passed.
- `node --check smoke_account_xp_safety.mjs`: passed.
- `git diff --check`: passed.
- `npm run typecheck`: passed.
- `npm run smoke`: passed.
- `npm run test:e2e`: passed.
- `npm run smoke:account-xp`: passed.
- `npm run smoke:firebase`: passed.
- `npm run smoke:firebase-live`: passed against Firebase project `infernodrift4-online`; the smoke created a live account/lobby, verified diagnostics, and confirmed Firebase remains non-authoritative for WebSocket physics.
- `node --test tests/firebase-online.test.mjs`: passed.

Latest 4.1 local visual smoke:

- `output/playwright/id41-lobby-ready-card-desktop.png`: Online lobby ready state, member list, and live sync copy.
- `output/playwright/id41-lobby-ready-phone-landscape-toggle-visible.png`: phone landscape ready toggle remains tappable and readable.
- `output/playwright/id41-objective-chevron-desktop.png`: directional objective chip.
- `output/playwright/id41-objective-chevron-phone.png`: phone objective chip remains readable.
- `output/playwright/id41-cache-boundary-readback.png`: title, style/script cache URLs, and runtime build id readback.
- `output/web-game/id41-lobby-ready/shot-0.png`: shared develop-web-game render check.
- `output/playwright/id41-final-v15-readback.png`: final v15 title, metadata, cache URLs, runtime product, and release welcome storage key.
- `output/web-game/id41-final-v15/shot-0.png`: final shared develop-web-game render check.

Most recent recorded Pages smoke in this doc:

- `https://canimal4.github.io/InfernoDrift4/?v=eea9193b`: HTTP 200.
- Served the static InfernoDrift4.1 game with `script.js`; no React/Vite bundle detected.
- Browser smoke started Campaign Survival, verified the Phase 3 mode catalog, completed a Race result, confirmed Max Arena, and reported public modes as `campaign-survival` and `max-arena`. Console output contained only expected headless WebGL `ReadPixels` warnings.

For Firebase online work:

```bash
npm run typecheck
npm test
npm run build
```

Then use the deployed Pages Online tab **Run Firebase Test** button to verify Auth and Firestore read/write from the real frontend.

## Known Limitations

- Firebase client-submitted leaderboard scores are not cheat-proof without a trusted server or Cloud Functions.
- Firebase is not an authoritative realtime physics room server; live rooms/queues stay disabled in Firebase mode.
- Keyboard remapping and controller support are implemented for the static launch surface, but physical controller QA still depends on browser/device availability.
- Audio runtime and dynamic music are not complete.
- Replit paid publish is not needed for the Firebase path.
