# Architecture

InfernoDrift4 is a restart from the current InfernoDrift static game, not the rejected standalone React monorepo. The architecture keeps the proven arcade loop in root static files while adding targeted structure for tests, icons, online rooms, Cloudflare deployment, and GitHub Pages.

## Static Client

- `index.html`: game shell, menus, PWA registration, HUD, Online tab, Progress/Garage/Controls/Credits surfaces.
- `script.js`: Three.js renderer, driving simulation, mode rules, AI, Max Arena, radar, progression, saves, audio, dev tools, test hooks, and optional WebSocket client.
- `style.css`: neon/fire UI theme, compact HUD, forward radar panel, mobile/touch layout, menu hierarchy.
- `manifest.webmanifest`, `icon.svg`, `favicon.ico`, `icon-*.png`, `sw.js`: PWA shell and browser icons.
- `scripts/build-site.mjs`: copies the static client and generated assets into `dist/` for GitHub Pages.
- `scripts/generate-icons.mjs`: converts the uploaded favicon source into browser/PWA icons.

The automation contract is preserved and expanded:

- `window.advanceTime(ms)`
- `window.render_game_to_text()`
- `window.__infernodriftTestApi`

`render_game_to_text()` includes mode, ID4 objective state, player, HUD, forward-relative radar projections, online state, device state, camera telemetry, ball state, bot state, and progression.

## Game Systems

- Mode rules: tutorial, campaign, race/time trial, stunt/drift, hunter tag, boss chase, battle/Max Arena, and rotating minigames.
- Radar: player-relative tactical projection where top/front, left/car-left, and right/car-right are explicit in the payload.
- HUD: compact objective/vehicle clusters, status strip below the top HUD, radar as the only persistent secondary panel.
- Mobile: phone/tablet device profiles, touch joystick/buttons, safe text-selection rules, reduced HUD/radar footprint.
- Effects/audio: generated Web Audio engine/tire/boost/music cues, boost/drift/landing/impact effects, reduced-motion/effect controls.

## Backends

- `apps/server/src/index.js`: local Node/WebSocket backend with health, guest auth, rooms, private codes, queue creation, chat, quick chat, bot fill metadata, leaderboard shell, friends/recent shell, and validation.
- `apps/worker/src/index.js`: Cloudflare Worker router plus `InfernoRoom` Durable Object for per-room WebSocket coordination.
- `apps/worker/src/protocol.js`: shared Worker validation, sanitizer, quick-chat allowlist, room code and size helpers.
- `tests/server.test.mjs`: Node backend/protocol behavior tests.

The static client is fully playable without any server. A hosted backend can be attached by configuring `window.INFERNO_SERVER_URL`, localStorage, or the Online tab server URL.

## Deployment

GitHub Pages deploys only the static `dist/` artifact. The Worker backend is deployed separately through Wrangler or `.github/workflows/deploy-worker.yml` when Cloudflare credentials are available.
