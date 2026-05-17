# Final Report

Status: active work is the ID3-first static launch rescue. The current shipped game is the root `index.html`, `script.js`, and `style.css` build, not the rejected React/Vite rewrite.

## URLs

- Repo: https://github.com/CAnimal4/InfernoDrift4
- Pages target: https://canimal4.github.io/InfernoDrift4/
- Cloudflare Worker URL: not verified yet

## Current Implementation Summary

- Root static files are the launch surface and `npm run build:web` copies them into `dist/`.
- Visible product identity now uses InfernoDrift4 while preserving ID3.3 mode DNA.
- Campaign Survival keeps the readable ID3 drift-survival loop: close camera, ground speed/reference lines, hunters, ramps, boost pads, powerups, touch controls, quick restarts, local save, and customization unlocks.
- Max Arena remains real local gameplay with ball physics, teams, bot roles, health, lunges, score, goal replay, and ball cam.
- The radar has been rebuilt as a clean forward-relative tactical radar where top is in front, left is car-left, right is car-right, and edge icons indicate off-radar threats.
- `render_game_to_text()` now reports UI screen, radar projections, progression, and honest offline/static online status.
- HUD/menu Phase 2 is active: compact gameplay clusters, focused pause actions, structured result stats, clearer Play/Garage/Progress/Settings/Controls/Help hierarchy, and scroll-safe long panels.
- Garage Phase 2 is active: Three.js preview bay, drag rotation, zoom/reset controls, three local loadouts, class summaries, instant cosmetic application, and migration from the old flat customization save.
- Controls Phase 2 is active: `X` remains jump/in-air trick, `B` is the alternate backflip/trick key, keyboard remapping persists, touch presets/scale are configurable, controller status is visible, and standard Gamepad API controls are mapped.
- `C` is reserved for backend-backed chat.
- Remote human username tags are available through the test/API layer for real players only and remain unobtrusive.

## Backend Status

- Local Node backend is real/local and covered by tests/smoke.
- Cloudflare Worker/Durable Object source exists but hosted online is not live.
- Friends, persistent accounts, ranked persistence, cloud saves, DMs, reports, and live events remain backend-gated and must not be described as live product features.

## Required Verification Before Release Sign-Off

Latest verification run on 2026-05-16:

- `node --check script.js`: passed.
- `npm run typecheck`: passed.
- `npm test`: passed, 22 tests.
- `npm run build`: passed.
- `npm run smoke`: passed.
- `npm run test:e2e`: passed.
- `npm run smoke:online-local`: passed.
- `npm run format`: passed.
- `npm run worker:check`: passed dry-run.
- `npm run worker:types`: passed.

Latest Phase 2 local visual smoke:

- `output/phase2/campaign-hud.png`: compact HUD/radar with clear center playfield.
- `output/phase2/menu-play.png`: focused pause/menu shell and cleaner Play tab.
- `output/phase2/garage.png`: Garage preview bay renders a nonblank car with loadouts and class summary.
- `output/phase2/controls.png`: remap/touch/controller UI fits inside the scroll-safe menu.

Latest Pages smoke:

- `https://canimal4.github.io/InfernoDrift4/?v=f5e23a7`: HTTP 200.
- Served the static ID3-first game with `script.js`; no React/Vite bundle detected.
- Browser smoke started Campaign Survival, confirmed `running: true`, `product: InfernoDrift4`, `radarMode: forward-relative`, `online: offline-static`, and no page errors.

For Cloudflare work:

```bash
npm run worker:check
npm run worker:types
INFERNO_ONLINE_SMOKE_URL=wss://<verified-worker>/ws node smoke_online_local.mjs
```

Hosted online remains blocked until a real Worker URL passes the hosted smoke and a Pages two-client browser test.

## Known Limitations

- The full offline mode list and six minigames are not all implemented in the static launch surface yet.
- Keyboard remapping and controller support are implemented for the static launch surface, but physical controller QA still depends on browser/device availability.
- Audio runtime and dynamic music are not complete.
- Hosted online requires Cloudflare credentials, deployment, and verification.
