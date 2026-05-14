# Final Report

Status: pushed to `main`, CI passed, GitHub Pages deployed, and the live Pages game was verified.

## URLs

- Repo: https://github.com/CAnimal4/InfernoDrift4
- Pages: https://canimal4.github.io/InfernoDrift4/

## Backend Status

Local-only. A production backend was not deployed because no backend hosting target or credentials were available in this environment. The client degrades to offline/bot mode when `VITE_SERVER_URL` is empty or unreachable.

## Tests

Passed locally:

- `npm ci`
- `npm run format`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `npm run smoke`
- `npm run test:e2e`
- Develop-web-game action loop against local preview
- Backend `/health` check
- Backend WebSocket guest/private-room smoke

Passed after push/deploy:

- Safari/GitHub repository check: `main` shows the full monorepo at commit `0170a40`.
- Safari/GitHub Actions check: `Deploy GitHub Pages` passed for `0170a40` in 50s; `CI` passed for `0170a40` in 32s.
- Pages HTTP check: `https://canimal4.github.io/InfernoDrift4/` returned `200`.
- Production Playwright smoke: loaded the live URL, found the full-size WebGL canvas, started the tutorial, and confirmed `window.render_game_to_text()` reports `phase: "tutorial"` and `backend: "offline"`.
- Production mobile-landscape smoke: started tutorial at `932x430` touch/mobile viewport with no app console errors.

## Implemented Features

- TypeScript monorepo with Vite React web app, Node/WebSocket server, shared game core, shared protocol, docs, CI, and Pages workflow.
- Offline/bot-capable Three.js game with tutorial, campaign, Max Arena, race, stunt, hunter, boss, time trial, drift score, battle, and rotating minigame starts.
- Fixed-step deterministic simulation with `window.advanceTime(ms)` and `window.render_game_to_text()`.
- Car handling with drift, boost, air control, jumps, landing grades, wall hits, ball physics, pickups, bots, boss roles, replays, progression, medals, unlocks, and loadouts.
- React UI for menu hierarchy, HUD, campaign, modes, garage, online, social, settings, controls, stats, credits, error recovery, save export/import, and debug overlay.
- Mobile landscape touch controls with no text selection/highlighting, controller polling, and keyboard remap presets.
- PWA-style manifest, SVG icon, and service worker shell cache.
- Backend guest accounts, private rooms, invite codes, queue scaffolding, 1v1/2v2/3v3 sizing, chat safety, friend scaffolding, protocol validation, and room snapshots.

## Known Limitations

- Hosted backend is not deployed unless hosting credentials are available.
- Rapier is represented by a physics-adapter-ready arcade simulation with kinematic fallback; the current committed build prioritizes stable playable physics over WASM dependency risk.
- Main implementation commit hash: `a93bb5d4cba05c6955205ede9f5fff201dc28503`.
- Deployment verification commit hash: `0170a4010544b919b20b6f2d2fbe391ea2636c75`.
