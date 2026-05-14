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
```

## Browser Smokes

`npm run smoke` starts a temporary local static server and runs `smoke_games.mjs`. It verifies the Games menu, Max Arena, settings visibility, goal replay path, dev forced demo, campaign return, and `render_game_to_text()`.

`npm run test:e2e` starts a temporary local static server and runs `smoke_devmode.mjs`. It verifies protected dev-mode unlock behavior.

## Backend Smokes

`npm test` covers message validation, chat sanitization, and WebSocket room snapshots. For a live local check:

```bash
npm run dev:server
curl http://127.0.0.1:8787/health
```

Use two WebSocket clients to verify guest auth, private room create/join, sanitized chat, and invalid speed rejection.
