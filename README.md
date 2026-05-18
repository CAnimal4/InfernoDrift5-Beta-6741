# InfernoDrift4

InfernoDrift4 is the restored launch rescue: the shipped game is the root static `index.html`, `script.js`, and `style.css` experience, built from the proven base InfernoDrift4 feel instead of the rejected React rewrite.

Play: https://canimal4.github.io/InfernoDrift4/

## Current Launch Surface

- Static client: `index.html`, `script.js`, `style.css`
- Build output: `npm run build:web` copies the static game and icons into `dist/`
- React/Vite code in `client/` remains reference/scaffolding only until it passes a future parity gate
- Local backend and Cloudflare Worker code exist, but hosted online is not live until a real Worker URL is verified

## Implemented In The Rescue Surface

- InfernoDrift4 visible identity over the restored survival game
- Campaign Survival mode using the base InfernoDrift4 hunter/ramp/powerup loop
- Max Arena mode with ball, teams, bot roles, goal replay, ball cam, and local match stats
- Preserved ground speed/reference lines for speed readability
- Cleaner, lower-chrome HUD while driving
- Forward-relative radar: top is in front, left is car-left, right is car-right, edge icons show off-radar threats
- Local garage/customization loadout system with instant car changes and unlock previews
- Touch controls, phone/tablet layout tuning, deterministic smoke hooks, and local saves
- Local WebSocket backend smoke coverage for rooms, bot fill, quick chat, age-gated free chat, sanitizer, input snapshots, and leaderboard shell

## Run Locally

```bash
npm ci
npm run dev:web
```

Open `http://127.0.0.1:4173/index.html`.

To run the local backend:

```bash
cp .env.example .env
npm run dev:server
curl http://127.0.0.1:8787/health
```

The static game is fully playable offline. Live online requires a separate backend and must not be described as live until verified.

## Controls

- Drive: `WASD` / arrows
- Drift: `Space`
- Boost: `Shift`
- Jump: `X`
- Backflip: `B`
- Restart: `R`
- Menu: `Esc` or `M`
- Max Arena ball cam: `L`
- Online chat: `C` is reserved for the backend-backed chat phase
- Touch: landscape joystick plus Drift/Boost/Jump/Backflip buttons

## Development Checks

```bash
node --check script.js
npm run typecheck
npm run lint
npm test
npm run build
npm run smoke
npm run test:e2e
npm run smoke:online-local
```

Cloudflare backend checks, when working on online:

```bash
npm run worker:check
npm run worker:types
```

GitHub Pages deploys the `dist/` artifact produced by `npm run build:web`.

## Online Status

GitHub Pages hosts only the static client. Cloudflare Workers + Durable Objects are the intended hosted backend, but hosted online remains blocked until:

- GitHub secrets `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` are configured.
- The `infernodrift4` D1 database (`830d1cce-a09c-4112-8a28-24b421c4acda`) has remote migrations applied.
- Worker secrets such as `RESEND_API_KEY` and a production session secret are configured when those features are claimed live.
- A concrete `wss://.../ws` Worker endpoint passes `INFERNO_ONLINE_SMOKE_URL=wss://.../ws node smoke_online_local.mjs`.
- The deployed Pages game is tested with that endpoint in a two-client browser flow.
