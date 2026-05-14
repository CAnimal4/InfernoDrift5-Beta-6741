# Testing

Run the local validation stack from the repo root:

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

## Browser Smokes

`npm run smoke` starts a temporary local static server and runs `smoke_games.mjs`. It verifies:

- Games menu visibility
- Max Arena/Battle settings visibility
- Goal replay path
- Forced demolition path
- Campaign return
- All ID4 mode routes
- `render_game_to_text()` mode, radar, online, objective, bot, ball, and progression payloads

`npm run test:e2e` starts temporary local static servers and runs:

- `smoke_devmode.mjs`: protected dev-mode unlock behavior
- `smoke_mobile.mjs`: phone landscape HUD/radar/touch layout and touch text-selection prevention

## Develop-Web-Game Client

The required skill client was run with keyboard action bursts against the local game. Output artifacts:

- `output/web-game/shot-0.png`
- `output/web-game/shot-1.png`
- `output/web-game/state-0.json`
- `output/web-game/state-1.json`

Inspect these after gameplay/HUD changes.

## Backend Smokes

`npm test` covers:

- Known/unknown protocol message validation
- Chat sanitization
- Private room create/join snapshots
- Bot fill metadata
- Chat broadcast filtering
- Exact-origin allowlist rejection

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

These validate the Cloudflare Worker/Durable Object configuration without claiming a live hosted backend.
