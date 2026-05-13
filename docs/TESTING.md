# Testing

Run the full local gate:

```bash
npm ci
npm run typecheck
npm run test
npm run build
npm run smoke
npm run test:e2e
```

## Coverage

- Protocol validation accepts valid messages and rejects malformed/speed-hack input.
- Game core verifies boost, air control, deterministic stepping, and win conditions.
- Smoke test builds and previews the web app, starts gameplay, captures desktop and mobile screenshots, and checks `render_game_to_text`.
- Playwright e2e verifies load, tutorial movement, menu navigation, garage, settings, offline online panel, and mobile touch controls.

## Manual QA Checklist

- Start tutorial and complete/fail/restart.
- Start Campaign Survival, Max Arena, Race/Time Trial, Garage, Settings, Controls, and Online.
- Check desktop and phone landscape screenshots.
- Confirm normal browser console has no app errors.
- Confirm backend-offline state does not block offline play.
- With local server running, connect two tabs and create/join a room.
