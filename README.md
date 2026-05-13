# InfernoDrift4

InfernoDrift4 is a neon-fire survival drifting sequel built as a TypeScript monorepo. The GitHub Pages build is a complete offline game with bots, progression, garage customization, mobile controls, controller/keyboard support, and a backend-offline indicator. When `VITE_SERVER_URL` is configured, the same client connects to the Node/WebSocket backend for rooms, matchmaking, friends, chat, and ranked scaffolding.

## Play

- GitHub Pages target: https://canimal4.github.io/InfernoDrift4/
- Desktop: `WASD` or arrows to drive, `Shift` drift, `Space` boost, `X` jump, `R` restart, `F` fullscreen.
- Mobile/tablet: landscape-first touch stick and Drift/Boost/Jump buttons.

## Develop

```bash
npm ci
npm run dev:web
npm run dev:server
```

Useful commands:

```bash
npm run typecheck
npm run test
npm run build
npm run smoke
npm run test:e2e
```

## Backend

The static Pages build works without a backend. To test online features locally:

```bash
cp .env.example .env
npm run dev:server
VITE_SERVER_URL=ws://127.0.0.1:8787 npm run dev:web
```

The backend stores local development data under `DATA_DIR` and never requires secrets for offline play. Production hosting requires setting `SESSION_SECRET`, `ALLOWED_ORIGINS`, and a persistent data directory or database.

## Structure

- `apps/web`: Vite + React + Three.js game client.
- `apps/server`: Node/WebSocket authoritative backend.
- `packages/game-core`: deterministic fixed-step simulation, modes, bots, saves.
- `packages/protocol`: Zod-validated client/server protocol.
- `docs`: architecture, backend, controls, testing, deployment, final report.

## Deployment

GitHub Pages deploys `apps/web/dist` through `.github/workflows/pages.yml`. The workflow must be enabled as the Pages source in repository settings if it is not already selected.
