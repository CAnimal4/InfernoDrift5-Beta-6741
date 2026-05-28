# InfernoDrift4

InfernoDrift4 is the restored launch rescue: the shipped game is the root static `index.html`, `script.js`, and `style.css` experience, built from the proven base InfernoDrift4 feel instead of the rejected React rewrite.

Play: https://canimal4.github.io/InfernoDrift4/

## Current Launch Surface

- Static client: `index.html`, `script.js`, `style.css`
- Build output: `npm run build:web` copies the static game and icons into `dist/`
- React/Vite code in `client/` remains reference/scaffolding only until it passes a future parity gate
- Firebase online-lite is the default production backend path for accounts, chat, leaderboard, friends, feedback, and progress; the local Node backend and Cloudflare Worker remain legacy/dev fallback code only

## Implemented In The Rescue Surface

- InfernoDrift4 visible identity over the restored survival game
- Campaign Survival mode using the base InfernoDrift4 hunter/ramp/powerup loop
- Max Arena mode with ball, teams, bot roles, goal replay, ball cam, and local match stats
- Preserved ground speed/reference lines for speed readability
- Cleaner, lower-chrome HUD while driving
- Forward-relative radar: top is in front, left is car-left, right is car-right, edge icons show off-radar threats
- Local garage/customization loadout system with instant car changes and unlock previews
- Touch controls, phone/tablet layout tuning, deterministic smoke hooks, and local saves
- Firebase online-lite integration with anonymous guest auth, username/password account wrapper, Firestore chat/leaderboards/friends/feedback/progress, diagnostics, and offline fallback
- Local WebSocket backend smoke coverage remains for legacy room-server development only

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

The static game is fully playable offline. Firebase covers online-lite social/persistence features. Server-authoritative realtime rooms still require a separate trusted WebSocket backend and must not be described as live when Firebase mode is active.

## Controls

- Drive: `WASD` / arrows
- Drift: `Space`
- Boost: `Shift`
- Jump: `X`
- Backflip: `B`
- Restart: `R`
- Menu: `Esc` or `M`
- Max Arena ball cam: `L`
- Online chat: `C` opens Firebase-backed chat when signed in or online as guest
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

Legacy Cloudflare fallback checks, only when explicitly working on the old WebSocket backend:

```bash
npm run worker:check
npm run worker:types
```

GitHub Pages deploys the `dist/` artifact produced by `npm run build:web`.

## Online Status

GitHub Pages hosts only the static client. Production defaults to `BACKEND_MODE=firebase`. Firebase Auth and Firestore are the primary no-cost backend for accounts, anonymous guests, usernames, progress, leaderboard, Firebase lobby rooms, lobby chat, friends, feedback, and diagnostics.

Replit publish is not required and Replit dev links must not be used for production. The old Worker URL `wss://infernodrift4-online.clarkbythebay.workers.dev/ws` stays only as a manual legacy fallback/reference while Firebase is the default for school-network users.

Firebase launch requirements:

- Create a Firebase project on the Spark/free plan.
- Enable Authentication providers: Email/Password and Anonymous.
- Enable Firestore and publish `firestore.rules`.
- Keep `firebase.json` / `.firebaserc` pointed at project `infernodrift4-online` and deploy rule changes with `firebase deploy --only firestore:rules` when Firebase CLI auth is available.
- Fill the public web config in `firebase-config.js` or provide `window.INFERNO_FIREBASE_CONFIG` before `script.js`.
- Use the Online tab **Run Firebase Test** button to verify Auth plus Firestore read/write from the deployed Pages site.

Firebase limitations:

- Firestore leaderboards are client-submitted and not cheat-proof without a trusted server or Cloud Functions.
- Firebase is not an authoritative physics/multiplayer server. Firebase lobby rooms support chat/invites; live racing queues/authoritative race rooms need the legacy WebSocket server if that path is explicitly selected and reachable.
- If Firebase is unavailable, the game falls back to Guest Offline and local saves/bots remain usable.

Legacy fallback remains available only when explicitly selected:

- Set `window.INFERNO_BACKEND_MODE = "websocket"` or `?backendMode=websocket`.
- Then enter a local server, Worker, or other trusted WebSocket URL in the Online tab.
- Do not make Cloudflare/Replit primary. The client may attempt a one-time legacy Worker progress import for signed-in accounts so old XP/saves can be preserved in Firebase; future backend work should still target Firebase unless the project owner explicitly asks for a legacy server deployment.
