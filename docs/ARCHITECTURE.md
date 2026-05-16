# Architecture

InfernoDrift4 currently ships the ID3-derived static game from the repository root. The active launch files are `index.html`, `script.js`, `style.css`, static icons, and `scripts/build-site.mjs`.

The previous React/Vite/TypeScript work remains in `client/` and `packages/` as reference/scaffolding. It is not the launch surface and must not replace the static game unless a future parity gate proves it is at least as fun, readable, and stable as the ID3-derived build.

## Static Client

- `index.html`: DOM shell for canvas, HUD, status bars, menu, garage/customization, touch controls, radar, overlays, and test-accessible controls.
- `script.js`: current gameplay runtime. It owns Three.js scene setup, vehicle handling, camera, hunters, ramps, powerups, Max Arena, customization, saves, radar, HUD updates, touch controls, and browser automation hooks.
- `style.css`: current HUD/menu/touch/radar/garage styling.
- `scripts/build-site.mjs`: static Pages build. It copies root assets into `dist/` and writes `.nojekyll`.

## Preserved Runtime Contracts

- `window.advanceTime(ms)` advances deterministic simulation time.
- `window.render_game_to_text()` returns structured game state for automation, including UI screen, player, bots, ball, HUD, camera, radar projection, progression, and online status.
- `window.__infernodriftTestApi` exposes focused test helpers for Max goals, replay state, match stats, device mode, and remote human name tags.

## Gameplay Systems

The static runtime includes the current real game systems:

- ID3.3-style Campaign Survival with worlds, levels, hunters, ramps, boost pads, powerups, local saves, and unlock-gated customization.
- Max Arena with teams, ball physics, goals, bot roles, lunges, health, goal replay, ball cam, and match stats.
- Forward-relative radar: top means in front of the car, left means car-left, right means car-right, and edge icons show off-radar threats.
- Unobtrusive name tags for real remote/human players only. Bots remain unlabeled.

## Backend

- `apps/server`: local Node/WebSocket backend for development and smoke tests.
- `apps/worker`: Cloudflare Worker + Durable Object backend scaffold.
- `packages/protocol`: TypeScript protocol/moderation reference for tests.

The static game is playable offline without any backend. Hosted online remains blocked until a verified Worker WebSocket URL is deployed and tested from GitHub Pages.

## Deployment

GitHub Pages deploys the `dist/` artifact produced by `npm run build:web`. Do not use the React/Vite dev server as proof of the launch build.
