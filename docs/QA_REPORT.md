# QA Report

Updated for the InfernoDrift4 revamp pass on 2026-05-13.

## Local Automated Checks

- `npm run typecheck`: passed.
- `npm test`: passed, 5 Node backend/protocol tests.
- `npm run smoke`: passed. It now asserts Max Arena settings, radar payload, offline backend status, forced replay/goal path, forced demolition path, campaign return, and all ID4 mode routes.
- `npm run test:e2e`: passed. It covers dev-mode unlock plus phone landscape HUD/radar/touch-control layout.
- `npm run lint`: passed.
- `npm run build`: passed.
- `npm run format`: passed.
- `npm run worker:check`: passed with Wrangler dry-run deployment.
- `npm run worker:types`: passed after generating Worker configuration types.

## Browser / Game Checks

- `develop-web-game` Playwright client:
  - First run timed out on `page.goto`.
  - Second run passed against `http://127.0.0.1:4173/index.html`.
  - Reviewed `output/web-game/shot-1.png`; gameplay rendered live with the compact HUD, forward radar, no menu overlay, and no app console error artifact.
- Desktop smoke screenshot: `output/playwright/games-smoke.png`.
  - Reviewed Boost Bowling/minigame view with cleaner HUD, readable radar, status strip below the menu button, and no overlap.
- Mobile smoke screenshot: `output/playwright/mobile-landscape-smoke.png`.
  - Reviewed phone landscape play with compact HUD/radar and no touch text selection.

## Backend Checks

- Local protocol accepts known messages and rejects unknown/admin messages.
- Chat sanitizer strips markup and replaces blocked profanity.
- Private room smoke covers guest auth, room creation, private join, snapshots, bot fill metadata, and sanitized chat broadcast.
- Origin prefix spoofing is rejected with HTTP 403.
- Worker validation dry-run passes through Wrangler.
- `npm run smoke:online-local`: passed against the local Node backend. It connected through the actual Online tab, created a private room, showed bot fill, sent sanitized chat, and confirmed `render_game_to_text().online.status === "live"`.

## Remaining Deployment QA

After committing and pushing:

- Verify GitHub CI and Pages workflows for the final pushed commit.
- Open `https://canimal4.github.io/InfernoDrift4/` in Safari and Playwright.
- Confirm HTTP 200, nonblank canvas, correct `/InfernoDrift4/` asset paths, clean app console, playable tutorial/campaign/Max Arena, and phone landscape layout.
- If Cloudflare secrets are available, verify hosted `wss://.../ws` from the Pages build with two tabs. If not, record backend as Worker-ready/local-only.

## Known Test Environment Noise

Headless Chromium reports WebGL GPU stall warnings during screenshots. These are browser/SwiftShader performance warnings, not application console errors.
