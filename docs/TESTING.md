# Testing

Run the current validation stack from the repo root:

```bash
npm ci
npm run typecheck
npm run lint
npm test
npm run build
npm run format
npm run smoke
npm run test:e2e
npm run worker:check
npm run worker:types
```

## Current Verification Status

This docs-only pass inspected source and test files but did not run the validation stack. Previous docs record passing checks for the earlier static pass, but the current worktree now contains a React/TypeScript revamp under `client/` and `packages/`, plus new TypeScript tests. Treat the full current validation set as pending parent verification until there is fresh output for this tree.

Minimum parent verification for the current tree:

- `npm run typecheck`
- `npm test`
- `npm run build`
- `npm run smoke`
- `npm run test:e2e`
- `npm run smoke:online-local`
- `npm run worker:check`
- `npm run worker:types`

## Browser Smokes

`npm run smoke` starts a temporary local server and runs `smoke_games.mjs`. Based on the inspected script names and package scripts, it is intended to verify:

- Games menu visibility
- Max Arena/Battle settings visibility
- Goal replay path
- Forced demolition path
- Campaign return
- All ID4 mode routes
- `render_game_to_text()` mode, radar, online, objective, bot, ball, and progression payloads

`npm run test:e2e` starts temporary local static servers and runs:

- `smoke_devmode.mjs`: protected dev-mode behavior
- `smoke_mobile.mjs`: phone landscape HUD/radar/touch layout and touch text-selection prevention

## Develop-Web-Game Client

Previous run artifacts exist from the earlier pass:

- `output/web-game/shot-0.png`
- `output/web-game/shot-1.png`
- `output/web-game/state-0.json`
- `output/web-game/state-1.json`

Those artifacts should not be treated as proof that the current React tree passed unless a parent run confirms they were regenerated after the React revamp.

## Backend Smokes

`npm test` covers:

- Known/unknown protocol message validation
- Expanded chat moderation, PII redaction, and 13+ free-chat gating
- Private room create/join snapshots
- Bot fill metadata
- Chat broadcast filtering
- Exact-origin allowlist rejection
- Game-core radar, Max scoring, landing grades, near misses, lava-floor shield behavior, coasting, and rewards

For a live local manual check:

```bash
npm run dev:server
curl http://127.0.0.1:8787/health
```

Then use the game Online tab with `ws://127.0.0.1:8787/ws`.

## Worker Checks

```bash
npm run worker:check
npm run worker:types
```

These validate the Cloudflare Worker/Durable Object configuration without claiming a live hosted backend. Hosted Worker status remains blocked until credentials are available and a deployed `wss://.../ws` URL is verified.
