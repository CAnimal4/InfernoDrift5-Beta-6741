# QA Report

Updated for the InfernoDrift4 restart build on 2026-05-14.

## Baseline

- Parent InfernoDrift `node --check script.js`: passed.
- Parent InfernoDrift `node --check smoke_games.mjs`: passed.
- Parent InfernoDrift Safari local preview: start overlay and live campaign rendered.
- Baseline play state check: local current InfernoDrift started, `render_game_to_text()` returned live campaign state with Risk hunters.

## Restart Build

- `npm ci`: passed, 58 packages audited, 0 vulnerabilities.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm test`: passed, 3 Node backend/protocol tests.
- `npm run build`: passed, static site written to `dist/` and backend source syntax checked.
- `npm run format`: passed.
- `npm run smoke`: passed. Verified Games menu, Max Arena, Brutal settings, goal replay path, dev forced demo, campaign return, and `render_game_to_text()` ID4 payload.
- `npm run test:e2e`: passed. Verified dev-mode unlock path.

## Backend Live Local Check

- `npm run dev:server`: started on port 8787 after direct-run detection fix.
- `curl http://127.0.0.1:8787/health`: returned `{"ok":true,"server":"InfernoDrift4","rooms":0,"clients":0}`.
- Two WebSocket clients: guest auth, private room create/join, room snapshots, sanitized chat, and invalid speed rejection all passed.

## Visual Review

- Playwright screenshot: `output/playwright/games-smoke.png`.
- Reviewed the in-game menu overlay on top of the live arena. The ID4 menu retains the current InfernoDrift visual identity, keeps the playfield visible behind the overlay, and exposes Settings/Games/Customize/Progress/Online/Controls/How To Play/Credits without a generic dashboard layout.

## Production Verification

- GitHub CI for `a217c26`: completed successfully.
- GitHub Pages workflow for `a217c26`: completed successfully.
- `curl -I -L https://canimal4.github.io/InfernoDrift4/`: returned HTTP 200.
- Live HTML switched from the rejected React artifact to the current-game static page with `script.js` and `style.css`.
- Production desktop smoke via `SMOKE_URL=https://canimal4.github.io/InfernoDrift4/ node smoke_games.mjs`: passed.
- Production mobile landscape Playwright check: canvas present, tutorial mode started, no app console errors or page errors.
- Safari opened `https://canimal4.github.io/InfernoDrift4/?safari=a217c26`; front document title was `InfernoDrift4`.
