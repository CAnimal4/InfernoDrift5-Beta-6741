# InfernoDrift4

InfernoDrift4 is the current InfernoDrift game evolved instead of replaced: neon survival drifting, adaptive Risk hunters, Max Arena, touch controls, customization, deterministic smoke hooks, local progression, and an optional backend for online rooms.

Play: https://canimal4.github.io/InfernoDrift4/

## Run Locally

```bash
npm ci
npm run dev:web
npm run dev:server
```

Open `http://127.0.0.1:5173/index.html`. The static game works offline with bots. To connect a production frontend to a backend, set `window.INFERNO_SERVER_URL` or build/deploy with a configured server URL and use a public `wss://` endpoint.

## Controls

- Drive: `WASD` / arrows
- Drift: `Space`
- Boost: `Shift`
- Jump: `X`
- Backflip: `C`
- Restart: `R`
- Menu: `Esc` or `M`
- Max Arena ball cam: `L`
- Touch: landscape joystick plus Drift/Boost/Jump/Backflip buttons

## Development

```bash
npm run typecheck
npm run test
npm run build
npm run smoke
npm run test:e2e
```

GitHub Pages deploys the `dist/` artifact produced by `npm run build:web`.
