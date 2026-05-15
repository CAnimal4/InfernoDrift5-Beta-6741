# Architecture

InfernoDrift4 is currently in a React/TypeScript/Three revamp. The active client source is under `client/`, the gameplay model is under `packages/game-core/`, and protocol validation is split between a TypeScript package and the JavaScript runtime copy used by the Node and Worker backends.

The root `index.html`, `script.js`, and `style.css` remain in the repo from the earlier static pass, but they are no longer the primary source for the current Vite build. `scripts/build-site.mjs` now runs Vite against `client/vite.config.ts` and then copies static PWA/icon assets into `dist/`.

## Client

- `client/index.html`: Vite entry shell for the React app.
- `client/src/main.tsx`: React root bootstrap.
- `client/src/App.tsx`: app shell, state loop, HUD/menu tabs, controls, local save, online panel, settings, and automation hooks.
- `client/src/game/GameCanvas.tsx`: Three.js playfield renderer with car meshes, bots, ball, objective rings, boost trails, camera follow, fog, grid, lighting, and arena pillars.
- `client/src/game/GaragePreview.tsx`: Three.js garage preview for paint/accent/class selection.
- `client/src/styles/app.css`: cockpit HUD, radar, menu tabs, online panels, settings, and touch controls.

The current automation contract is still present:

- `window.advanceTime(ms)`
- `window.render_game_to_text()`
- `window.__infernodriftTestApi`

`render_game_to_text()` exposes mode, machine state, objective state, player, bots, ball, radar entities, progression, online status, device mode, and menu state.

## Game Core

- `packages/game-core/src/index.ts`: typed game state, machine states, mode metadata, car classes, bot personalities, objective markers, radar projection, progression, save migration, founder badge helper, and the deterministic `startGame` / `stepGame` loop.
- Implemented modes include tutorial, campaign, Max Arena, race, time trial, stunt, hunter, boss, drift score, battle, ramp rush, boost bowling, lava floor, king zone, trick combo, and bot escape.
- Current systems include player-relative radar entities, landing grades, near-miss scoring, bot roles, Max ball/goal replay, shield/boost/lives, XP/level/unlocks, local daily/weekly seeds, and car-class tuning.

Some earlier static-pass features are now shells or pending in the React tree. Audio sliders exist, but the inspected React source does not yet include a Web Audio engine. Keyboard remapping is explicitly labeled as a later settings pass. Friends/blocks/reports/DMs need persistent backend storage before they are real product features.

## Protocol

- `packages/protocol/src/index.ts`: TypeScript/Zod protocol used by the React/package tests. It includes quick chat, guest auth, room/queue messages, chat, friend request/block/report schemas, input frames, leaderboard reads, save sync, username normalization, 13+ free-chat gating, and expanded moderation.
- `apps/worker/src/protocol.js`: JavaScript runtime mirror used by the local Node backend and Cloudflare Worker. It validates known message types, room options, input frames, rate-sensitive chat payloads, quick-chat allowlist, private room codes, and moderation.
- Moderation now covers markup stripping, soft profanity replacement, PII redaction, obfuscation/leet normalization, severe self-harm encouragement, harassment, hate, explicit sexual terms, and slur patterns.

## Backends

- `apps/server/src/index.js`: local Node HTTP/WebSocket backend with `/health`, guest auth, exact origin allowlist, private rooms, queues, bot fill metadata, chat/quick chat, rate limits, input snapshots, leaderboard shell, friends/recent shell, and local JSON persistence in `DATA_DIR`.
- `apps/worker/src/index.js`: Cloudflare Worker router plus `InfernoRoom` Durable Object for per-room WebSocket coordination at `/ws`.
- `wrangler.jsonc`: Worker binding for `INFERNO_ROOM` and the `InfernoRoom` migration.

The client is playable offline without any backend. Online features activate only when the Online tab, `localStorage`, or `window.INFERNO_SERVER_URL` points to a reachable `ws://` or `wss://.../ws` backend.

## Deployment

GitHub Pages deploys the Vite-built `dist/` artifact. The Cloudflare Worker backend is separate and must not be marked live unless Cloudflare deploy secrets are configured and a deployed Worker WebSocket URL has been verified from the Pages client.
