# QA Report

Updated for the InfernoDrift4.1 static launch surface.

## Current Source Under Test

- Active launch client: root `index.html`, `script.js`, `style.css`
- Static build: `scripts/build-site.mjs` -> `dist/`
- Firebase online-lite: `firebase-config.js`, `firebase-online.js`, `firebase-online-core.js`, `firestore.rules`
- Local backend: `apps/server`
- Legacy local/Replit backend reference: `apps/server`
- Legacy Cloudflare Worker fallback/reference: `apps/worker`

The React/Vite client is not current launch proof.

## Required Local Gates

Latest InfernoDrift4.1 verification, run on 2026-06-10:

- `node --check script.js`: passed.
- `node --check firebase-online.js`: passed.
- `node --check smoke_games.mjs`: passed.
- `node --check smoke_account_xp_safety.mjs`: passed.
- `git diff --check`: passed.
- `npm run typecheck`: passed.
- `npm run smoke`: passed, including 4.1 welcome popup, cache/build id, Online lobby clarity, ready-state, objective hints, Campaign Survival, Max Arena, name tags, and radar projection probes.
- `npm run smoke:account-xp`: passed.
- `node --test tests/firebase-online.test.mjs`: passed.
- `npm run smoke:firebase`: passed with offline fallback when live services are unavailable locally.
- `npm run smoke:firebase-live`: passed against project `infernodrift4-online` with Firebase transport, live lobby creation, account sync, diagnostics, and expected `firebase_no_authoritative_websocket` status.
- `npm run test:e2e`: passed, including dev-mode and phone/tablet/mobile layout coverage.

Current 4.1 screenshot evidence reviewed:

- `output/playwright/id41-lobby-ready-card-desktop.png`
- `output/playwright/id41-lobby-ready-phone-landscape-toggle-visible.png`
- `output/playwright/id41-objective-chevron-desktop.png`
- `output/playwright/id41-objective-chevron-phone.png`
- `output/playwright/id41-cache-boundary-readback.png`
- `output/playwright/id41-final-v15-readback.png`
- `output/web-game/id41-lobby-ready/shot-0.png`
- `output/web-game/id41-final-v15/shot-0.png`

Historical rescue verification, run on 2026-05-16:

- `npm test`: passed, 22 tests.
- `npm run build`: passed, static site built to `dist/`.
- `npm run smoke:online-local`: passed, including two clients, private room, bot fill, sanitized chat, 13+ free-chat gate, and leaderboard shell.
- `npm run format`: passed.
- `npm run worker:check`: passed dry-run with Durable Object binding.
- `npm run worker:types`: passed.

Phase 1 completion verification, run on 2026-05-16:

- Legacy hunter naming removed; old saved hunter-AI values migrate to Adaptive Hunters.
- Persistent Drift HUD pill removed; combo remains available through transient feedback and `render_game_to_text().hud.combo`.
- Boost and Shield/Health meters align inside the main HUD row.
- `X` is the launch/trick key: grounded `X` jumps, airborne `X` backflips.
- Ground speed/reference lines are visible again at low opacity.
- Fresh local screenshots captured:
  - `output/playwright/phase1-live-campaign.png`
  - `output/playwright/phase1-live-max.png`
  - `output/playwright/mobile-landscape-smoke.png`

Phase 2 UI/Garage verification, run on 2026-05-16:

- HUD is split into compact run and vehicle clusters with the center playfield clear.
- Pause/menu now opens to focused Resume, Restart Run, Garage, and Settings actions.
- Results use structured stats instead of only a long generic message paragraph.
- Menu hierarchy is Play, Garage, Progress, Settings, Controls, Help, with scroll affordance in long panels.
- Garage includes a real lightweight Three.js preview bay with rotate/zoom/reset controls.
- Garage supports three local loadouts, car-class summaries, and save migration from the old flat customization object.
- Controls tab includes keyboard remapping, touch layout/scale presets, controller status, and `B` as the alternate backflip key while `X` remains jump/trick.
- `render_game_to_text()` reports Phase 2 UI, garage, control binding, touch layout, and controller state.
- Fresh local screenshots captured:
  - `output/phase2/campaign-hud.png`
  - `output/phase2/menu-play.png`
  - `output/phase2/garage.png`
  - `output/phase2/controls.png`

Most recent recorded Pages smoke in this doc, run on 2026-05-16:

- `https://canimal4.github.io/InfernoDrift/?v=f5e23a7`: HTTP 200.
- Served root static game with `script.js`; no React/Vite bundle detected.
- Browser play smoke started Campaign Survival, `running: true`, `product: InfernoDrift4.1`, `radarMode: forward-relative`, `online: offline-static`, and no page errors.

## Browser QA Checklist

- Title screen uses InfernoDrift4.1 identity.
- First-run InfernoDrift4.1 popup appears once, stores `infernoDrift4.releaseWelcome.4_1`, and does not block future launches after dismissal.
- Campaign Survival starts, drives, boosts, drifts, jumps, backflips with `X`, restarts, pauses, and shows results/fail messages.
- `B` also works as the alternate backflip/trick key.
- Ground speed/reference lines remain visible during normal driving.
- Radar is forward-relative: top/front, left/car-left, right/car-right, bottom/behind.
- Radar uses the full box, has no heavy grid clutter, and shows clean icons plus edge arrows.
- Max Arena starts, ball interaction works, teams/roles are readable, goal replay works, and ball cam state is clear.
- Garage updates the car immediately, renders a 3D preview bay, switches local loadouts, and shows class/unlock hints.
- Mobile landscape keeps HUD/radar/touch controls usable, supports touch presets, and disables text selection.
- Online lobby card shows code copy/select feedback, drivers, ready count, ready toggle, live/lobby sync state, and readable phone landscape layout.
- Keyboard remapping rejects duplicate primary bindings and persists through the save payload.
- Controller status appears in Controls and the Gamepad API path maps standard driving/actions where browser support exists.
- Remote human name tags are readable and unobtrusive; bots are not labeled.

## Online QA

Firebase online-lite is the default production online path. Required Firebase checks:

- Firebase project is on Spark/free plan.
- Email/Password and Anonymous auth are enabled.
- Firestore production database exists with `firestore.rules` published.
- `firebase-config.js` contains the public web config.
- Deployed Pages Online tab **Run Firebase Test** passes Auth plus Firestore read/write.
- Create account, duplicate username, anonymous guest, lobby chat, leaderboard, feedback, friends, and offline fallback are tested from a fresh browser.

Legacy `npm run smoke:online-local` still covers the old Node/WebSocket room server. Passing that smoke does not prove Firebase production live rooms, because Firebase mode intentionally disables authoritative rooms.

## Known Noise

Headless Chromium can emit SwiftShader/WebGL `ReadPixels` warnings during screenshots. Treat those as environment noise only when the app console is otherwise clean.
