# Architecture

InfernoDrift4 is a restart from the current InfernoDrift static game, not the rejected React monorepo. The architecture keeps the proven arcade loop in root static files while adding only the structure needed to build, test, deploy, and connect an optional backend.

## Static Client

- `index.html`: game shell, menus, PWA registration, and DOM HUD.
- `script.js`: Three.js renderer, driving simulation, modes, AI, progression, saves, dev tools, test hooks, and optional backend status UI.
- `style.css`: current neon arcade HUD/menu/touch styling.
- `manifest.webmanifest`, `icon.svg`, `sw.js`: PWA shell.
- `scripts/build-site.mjs`: copies the static client into `dist/` for GitHub Pages.

The automation contract is preserved:

- `window.advanceTime(ms)`
- `window.render_game_to_text()`
- `window.__infernodriftTestApi`

## Backend

- `apps/server/src/index.js`: local Node/WebSocket backend with health, guest auth, rooms, queue creation, chat, quick chat, bot-fill metadata, and validation.
- `tests/server.test.mjs`: protocol and WebSocket behavior tests.

The static client is fully playable without this server. A hosted server can be attached later by configuring `window.INFERNO_SERVER_URL` or `localStorage.infernoDrift4.serverUrl`.

## Deployment

GitHub Pages deploys only the static `dist/` artifact. The backend is not claimed live unless separately hosted and verified.
