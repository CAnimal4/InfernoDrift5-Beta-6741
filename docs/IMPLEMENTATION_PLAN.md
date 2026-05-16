# Implementation Plan

## Direction

InfernoDrift4 launch now follows the ID3-first rescue path. The active shipped game is the root static build:

- `index.html`
- `script.js`
- `style.css`
- `scripts/build-site.mjs`

The React/Vite code in `client/` and typed packages in `packages/` remain reference/scaffolding only until a future visual and gameplay parity gate proves they are better than the static ID3-derived game.

## Phases

1. Keep the root static game as the launch surface and keep `npm run build:web` copying it into `dist/`.
2. Stabilize existing ID3-style gameplay before broad feature work: driving, drift, boost, ramps, hunters, Max Arena, touch controls, and saves.
3. Clean the active static HUD, radar, menu, and garage without changing the recognizable ID3 playfield feel.
4. Add offline modes, progression, replay/highlight, and minigame depth only after the static core stays fun and screenshot-reviewed.
5. Keep online honest: local backend is real/local, hosted Cloudflare online is blocked until a verified Worker URL passes health, WebSocket smoke, and Pages two-client testing.

## Acceptance

- Static launch game starts from `index.html` and builds to `dist/`.
- `window.advanceTime(ms)`, `window.render_game_to_text()`, and `window.__infernodriftTestApi` remain stable.
- Campaign Survival and Max Arena preserve ID3 readability and improve feedback.
- Radar is forward-relative: top is front, left is car-left, right is car-right, bottom is behind.
- Docs and reports do not claim the React/Vite tree is the active shipped game.
- Hosted online is not called live until Cloudflare deployment and verification actually succeed.
