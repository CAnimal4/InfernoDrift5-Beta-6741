# Revamp Pass Subagent Report

This report consolidates the earlier read-only subagent reviews and updates their status for the current React/TypeScript/Three worktree. This docs-only refresh did not run tests or verify deploys.

## Architecture / Build

- Current finding: active client source is now Vite/React in `client/`, with typed systems in `packages/game-core` and `packages/protocol`.
- Action: docs now treat the root static files as legacy/static assets rather than the primary revamp implementation.
- Acceptance tests needed: `npm run typecheck`, `npm run build`, `npm run worker:check`, `npm run worker:types`.

## Game Engine / Modes / Radar

- Current finding: game rules, objectives, radar, bots, progression, save migration, and car classes are centralized in `packages/game-core/src/index.ts`.
- Current finding: React Three renderers now draw the playfield and garage preview.
- Remaining gap: some earlier static-pass claims are only partial in the current React tree, including full audio runtime, keyboard remapping, multiple saved loadouts, and ball-cam controls.
- Acceptance tests needed: `npm test`, `npm run smoke`, screenshot review of current output artifacts.

## Backend / Online

- Current finding: Online tab has WebSocket controls for server URL, guest auth, private room create/join, queue, age-gated chat, quick chat, room snapshots, leaderboard, and social shell.
- Current finding: local Node backend and Cloudflare Worker/Durable Object backend both exist, with a JavaScript protocol mirror for runtime validation.
- Current finding: protocol moderation is expanded across TypeScript package and JS runtime copy.
- Remaining gap: hosted Worker is blocked without Cloudflare secrets and a verified `wss://.../ws` URL. Social persistence, DMs, reports/blocks, cloud saves, and live events need backing storage.
- Acceptance tests needed: `npm test`, `npm run smoke:online-local`, `npm run worker:check`, `npm run worker:types`.

## UI / Mobile / Visuals

- Current finding: HUD, radar, menu tabs, online panels, settings, and touch controls now live in React/CSS.
- Current finding: mobile/touch controls are present in React and controller input uses the browser Gamepad API.
- Acceptance tests needed: `npm run test:e2e`, current desktop/mobile screenshots.

## QA / Security

- Current finding: test files exist for backend/protocol and game-core behavior, but this docs pass did not execute them.
- Remaining risk: hosted online cannot be verified until Cloudflare credentials and a concrete Worker URL are available.
- Required stance: mark current validation pending parent verification unless fresh logs are attached.
