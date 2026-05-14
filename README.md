# InfernoDrift4

InfernoDrift4 is the current InfernoDrift game evolved instead of replaced: neon survival drifting, Risk hunters, Max Arena, touch controls, customization, deterministic smoke hooks, local progression, cleaner HUD/radar, stronger effects, and optional online rooms.

Play: https://canimal4.github.io/InfernoDrift4/

## What Changed In This Pass

- Rebuilt on the ID3-derived `index.html`, `script.js`, and `style.css` foundation instead of the rejected standalone monorepo.
- Added a compact, cleaner HUD and a forward-relative tactical radar where top means in front of the car, left means car-left, and edge icons clamp off-radar threats.
- Generated favicon/PWA icons from the uploaded flame-wheel image: `favicon.ico`, `icon.svg`, `icon-64.png`, `icon-192.png`, and `icon-512.png`.
- Expanded mode objectives for Tutorial, Campaign Survival, Race, Stunt Park, Hunter Tag, Boss Chase, Battle Arena, Max Arena, and rotating minigames.
- Added real WebSocket client controls for guest auth, rooms, private codes, queues, bot fill, chat, quick chat, leaderboards, friends/recent-player shell, and backend-offline fallback.
- Added Cloudflare Workers + Durable Objects backend scaffold alongside the existing local Node backend.

## Run Locally

```bash
npm ci
npm run dev:web
```

Open `http://127.0.0.1:5173/index.html`.

The static game works offline with bots and local saves. To run the local backend:

```bash
cp .env.example .env
npm run dev:server
```

Set the Online tab server URL to `ws://127.0.0.1:8787/ws`, then connect.

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
npm run lint
npm test
npm run build
npm run smoke
npm run test:e2e
npm run worker:check
npm run worker:types
```

GitHub Pages deploys the `dist/` artifact produced by `npm run build:web`.

## Backend Deployment

GitHub Pages hosts only the static client. Live online requires a deployed WebSocket backend. The Cloudflare Worker deployment workflow expects these GitHub repository secrets:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`

After the Worker is live, configure the client with a `wss://.../ws` URL in the Online tab or through `window.INFERNO_SERVER_URL`.
