# QA Report

## Local Verification

Passed on May 13, 2026:

- `npm ci`: passed, 0 vulnerabilities.
- `npm run format`: passed after Prettier normalization.
- `npm run typecheck`: passed.
- `npm run test`: passed, 3 files, 7 tests.
- `npm run build`: passed for packages, web, and server.
- `npm run smoke`: passed; generated `output/smoke/desktop-gameplay.png` and `output/smoke/mobile-landscape.png`.
- `npm run test:e2e`: passed, 6 tests across desktop and phone-landscape Chromium.
- Develop-web-game client: passed with action bursts; generated `output/web-game/shot-0.png`, `shot-1.png`, and JSON state snapshots.

## Backend Verification

- `curl http://127.0.0.1:8787/health`: returned `{"ok":true,"rooms":0,"clients":0,"server":"InfernoDrift4"}`.
- WebSocket guest/private-room smoke: connected with allowed origin, received `hello`, authenticated `SmokeTwo`, created a private `max-arena` room, and received a `room.snapshot` with invite code.

## Visual Review

- Desktop smoke screenshot: nonblank 3D arena, visible car, ramps, pickups, boost trail particles, HUD, meters, objective panel, and offline indicator.
- Mobile landscape screenshot: touch stick and Drift/Boost/Jump controls visible, HUD fits, no tap-target overlap.
- In-app browser local preview: rendered menu and gameplay successfully. The browser log API still showed one stale JS.ORG error from the old baseline tab, while Playwright checks for the InfernoDrift4 app itself did not report app console errors.

## Production Verification

Passed after push on May 13, 2026:

- Safari/GitHub repo check: `main` shows the committed monorepo and latest deployment badge.
- Safari/GitHub Actions check: `Deploy GitHub Pages` and `CI` both completed successfully for commit `0170a40`.
- `curl -L -s -o /dev/null -w '%{http_code} %{url_effective}\n' https://canimal4.github.io/InfernoDrift4/`: returned `200 https://canimal4.github.io/InfernoDrift4/`.
- Production desktop Playwright smoke: loaded the Pages URL, captured `output/smoke/production-pages.png`, found a full-window canvas, clicked `Start Tutorial Race`, and read `phase: "tutorial"` / `backend: "offline"` from `window.render_game_to_text()`.
- Production mobile-landscape Playwright smoke: captured `output/smoke/production-mobile-landscape.png`, started tutorial at `932x430`, and reported no app console errors.

## Known Limitations

- Hosted backend is not deployed; backend is local/production-ready and the Pages client runs in offline/bot mode until `VITE_SERVER_URL` points to a verified `wss://` endpoint.
- Rapier is not added as a hard runtime dependency in this pass. The shipped physics model is deterministic arcade/kinematic and leaves a physics-adapter seam for Rapier without risking a WASM load failure on Pages.
- The build emits a Vite chunk-size warning because Three.js and React ship together. It does not block playability; future work can split menu/runtime chunks.
