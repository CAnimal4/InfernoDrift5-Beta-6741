# Revamp Pass Subagent Report

This report consolidates the read-only subagent reviews from the 2026-05-13 ID4 revamp pass and the fixes integrated afterward.

## Architecture / Build

- Finding: client was a static ID3-derived game with copy-based Pages deployment and no bundled asset discovery.
- Action: kept the static architecture, added icon copying, Worker files, Worker workflow, Wrangler scripts, and updated docs.
- Acceptance tests: `npm run typecheck`, `npm run build`, `npm run worker:check`, `npm run worker:types`.

## Game Engine / Modes / Radar

- Finding: ID4 modes existed mostly as routing/copy.
- Action: added per-mode objective state, objective markers, minigame rules, render payload assertions, and all-mode smoke routing.
- Finding: radar needed real player-relative projections.
- Action: replaced minimap drawing with forward-relative radar payload/drawing, clean icons, and edge-clamped off-radar entities.
- Acceptance tests: `npm run smoke`, screenshot review of `output/playwright/games-smoke.png`.

## Backend / Online

- Finding: old client only showed configured/offline status and did not open a WebSocket.
- Action: added Online tab connection controls, guest auth, room create/join, queue, chat, quick chat, room/leaderboard/friends/recent panels, and backend-offline fallback.
- Action: added Cloudflare Worker + Durable Object backend scaffold and deployment workflow.
- Action: hardened local Node origin validation from prefix match to exact match.
- Acceptance tests: `npm test`, `npm run worker:check`, `npm run worker:types`.

## UI / Mobile / Visuals

- Finding: HUD and status strip could overlap/crowd the playfield.
- Action: split compact HUD clusters, moved boost/shield strip below HUD, made status non-interactive, shrank phone radar/device layout, and generated high-DPI radar backing canvas.
- Acceptance tests: `npm run test:e2e`, screenshot review of `output/playwright/mobile-landscape-smoke.png`.

## QA / Security

- Finding: smokes logged state without asserting enough behavior.
- Action: added assertions for Max settings, radar sectors, offline state, mode routing, replay/goal/demo paths, mobile layout, and exact-origin rejection.
- Remaining risk: hosted online cannot be verified until Cloudflare credentials are configured.
