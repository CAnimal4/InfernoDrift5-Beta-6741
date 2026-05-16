# QA Report

Updated for the ID3-first static launch rescue.

## Current Source Under Test

- Active launch client: root `index.html`, `script.js`, `style.css`
- Static build: `scripts/build-site.mjs` -> `dist/`
- Local backend: `apps/server`
- Cloudflare Worker scaffold: `apps/worker`

The React/Vite client is not current launch proof.

## Required Local Gates

Latest rescue verification, run on 2026-05-16:

- `node --check script.js`: passed.
- `npm run typecheck`: passed.
- `npm test`: passed, 22 tests.
- `npm run build`: passed, static site built to `dist/`.
- `npm run smoke`: passed, including Campaign Survival, Max Arena, name tags, and radar projection probes.
- `npm run test:e2e`: passed, including dev-mode and phone landscape/touch layout.
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

Latest Pages smoke, run on 2026-05-16:

- `https://canimal4.github.io/InfernoDrift4/?v=f5e23a7`: HTTP 200.
- Served root static game with `script.js`; no React/Vite bundle detected.
- Browser play smoke started Campaign Survival, `running: true`, `product: InfernoDrift4`, `radarMode: forward-relative`, `online: offline-static`, and no page errors.

## Browser QA Checklist

- Title screen uses InfernoDrift4 identity.
- Campaign Survival starts, drives, boosts, drifts, jumps, backflips with `X`, restarts, pauses, and shows results/fail messages.
- Ground speed/reference lines remain visible during normal driving.
- Radar is forward-relative: top/front, left/car-left, right/car-right, bottom/behind.
- Radar uses the full box, has no heavy grid clutter, and shows clean icons plus edge arrows.
- Max Arena starts, ball interaction works, teams/roles are readable, goal replay works, and ball cam state is clear.
- Garage/customization updates the car immediately and shows unlock hints.
- Mobile landscape keeps HUD/radar/touch controls usable and disables text selection.
- Remote human name tags are readable and unobtrusive; bots are not labeled.

## Online QA

Local backend smoke must pass before any online UI work is trusted. Hosted online is blocked until:

- Cloudflare Worker deploy succeeds.
- `/health` responds from the deployed Worker.
- `INFERNO_ONLINE_SMOKE_URL=wss://.../ws node smoke_online_local.mjs` passes.
- The deployed Pages client completes a two-client room/chat test against that Worker.

## Known Noise

Headless Chromium can emit SwiftShader/WebGL `ReadPixels` warnings during screenshots. Treat those as environment noise only when the app console is otherwise clean.
