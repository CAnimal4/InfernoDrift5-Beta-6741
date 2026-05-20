# Final Report

Status: active work is the InfernoDrift4 static launch rescue. The current shipped game is the root `index.html`, `script.js`, and `style.css` build, not the rejected React/Vite rewrite.

## URLs

- Repo: https://github.com/CAnimal4/InfernoDrift
- Pages target: https://canimal4.github.io/InfernoDrift/
- Replit free dev primary backend: https://add88ee5-cd60-43a6-9187-bbf975395ace-00-buwzj014vifw.janeway.replit.dev / wss://add88ee5-cd60-43a6-9187-bbf975395ace-00-buwzj014vifw.janeway.replit.dev/ws
- Cloudflare Worker fallback: wss://infernodrift4-online.clarkbythebay.workers.dev/ws

## Current Implementation Summary

- Root static files are the launch surface and `npm run build:web` copies them into `dist/`.
- Visible product identity now uses InfernoDrift4 while preserving the base mode DNA.
- Campaign Survival keeps the readable InfernoDrift4 drift-survival loop: close camera, ground speed/reference lines, hunters, ramps, boost pads, powerups, touch controls, quick restarts, local save, and customization unlocks.
- Max Arena remains real local gameplay with ball physics, teams, bot roles, health, lunges, score, goal replay, and ball cam.
- The radar has been rebuilt as a clean forward-relative tactical radar where top is in front, left is car-left, right is car-right, and edge icons indicate off-radar threats.
- `render_game_to_text()` now reports UI screen, radar projections, progression, and honest offline/static online status.
- HUD/menu Phase 2 is active: compact gameplay clusters, focused pause actions, structured result stats, clearer Play/Garage/Progress/Settings/Controls/Help hierarchy, and scroll-safe long panels.
- Garage Phase 2 is active: Three.js preview bay, drag rotation, zoom/reset controls, three local loadouts, class summaries, instant cosmetic application, and migration from the old flat customization save.
- Controls Phase 2 is active: `X` remains jump/in-air trick, `B` is the alternate backflip/trick key, keyboard remapping persists, touch presets/scale are configurable, controller status is visible, and standard Gamepad API controls are mapped.
- `C` is reserved for backend-backed chat.
- Remote human username tags are available through the test/API layer for real players only and remain unobtrusive.
- Phase 3 repair is active: the Play board exposes Campaign, Arena, Speed, Tricks, Chase, and Minigames groups with Campaign Survival, Max Arena, Race, Time Trial, Stunt Park, Hunter Tag, Battle Arena, Ramp Rush, Boost Bowling, Lava Floor, and King of the Zone.
- Mode runs now use distinct local rules and scene objects: bounded winding race tracks, solo stunt loops/rings, Hunter Tag role switching, red-vs-blue laser battle, rising lava platforms, king zones, and ten-pin Boost Bowling.
- Local progression now uses `progressionV2` with XP, levels, medals, personal bests, ghost samples, daily/weekly challenge seeds, reward log, save migration defaults, and a Progress "Run Board".

## Backend Status

- Local Node backend is real/local and covered by tests/smoke.
- Replit uses the Node backend as the production primary target through the free dev URL while the workspace is running. A paid published Replit URL must not be claimed live unless publishing is later approved and verified.
- Cloudflare Worker/Durable Object source and URL remain fallback-only.
- Friends, persistent accounts, ranked persistence, cloud saves, DMs, reports, and live events remain backend-gated and must not be described as live unless the active backend verification passes.

## Required Verification Before Release Sign-Off

Latest verification run on 2026-05-17:

- `node --check script.js`: covered by `npm run typecheck` and passed.
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

Latest Phase 3 local visual smoke:

- `output/playwright/phase3-play-board.png`: visible mode board grouped by purpose with no buried required mode.
- `output/playwright/phase3-results.png`: structured Race result screen with medal, XP, objective, best chain, and reward preview.
- `output/playwright/mobile-landscape-smoke.png`: phone landscape HUD/radar/touch layout remains playable.

Latest Pages smoke:

- `https://canimal4.github.io/InfernoDrift/?v=eea9193b`: HTTP 200.
- Served the static InfernoDrift4 game with `script.js`; no React/Vite bundle detected.
- Browser smoke started Campaign Survival, verified the Phase 3 mode catalog, completed a Race result, confirmed Max Arena, and reported public modes as `campaign-survival` and `max-arena`. Console output contained only expected headless WebGL `ReadPixels` warnings.

For hosted online work:

```bash
npm run worker:check
npm run worker:types
curl https://add88ee5-cd60-43a6-9187-bbf975395ace-00-buwzj014vifw.janeway.replit.dev/health
INFERNO_ONLINE_SMOKE_URL=wss://add88ee5-cd60-43a6-9187-bbf975395ace-00-buwzj014vifw.janeway.replit.dev/ws node smoke_online_local.mjs
INFERNO_ONLINE_SMOKE_URL=wss://infernodrift4-online.clarkbythebay.workers.dev/ws node smoke_online_local.mjs
```

Hosted online remains blocked until the active Replit URL passes hosted smoke and a Pages two-client browser test. The Worker URL stays as fallback.

## Known Limitations

- Online/social remains backend-gated in this phase; the static game is honest about offline, HTTP-fallback, and live-room status.
- Keyboard remapping and controller support are implemented for the static launch surface, but physical controller QA still depends on browser/device availability.
- Audio runtime and dynamic music are not complete.
- Paid hosted online requires Replit publish/deployment and verification; the current free dev URL requires the Replit workspace to stay runnable.
