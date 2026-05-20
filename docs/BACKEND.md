# Backend

InfernoDrift4 now has three backend tracks:

- Firebase online-lite: production default for accounts, anonymous guests, usernames, progress, leaderboard, chat, friends, feedback, and diagnostics.
- `apps/server`: local Node/WebSocket backend for legacy room-server development and smoke tests.
- `apps/worker`: Cloudflare Worker + Durable Object backend retained as legacy fallback/reference for authoritative rooms.

The root static client remains playable offline. Firebase is not a trusted realtime physics server, so Firebase mode disables live rooms/queues and keeps local/bot play available.

## Firebase Backend

Client files:

- `firebase-config.js`: public Firebase web config and runtime override support.
- `firebase-online.js`: dynamic Firebase modular SDK integration.
- `firebase-online-core.js`: testable validation, moderation, and mapping helpers.
- `firestore.rules`: launch rules for Auth-gated Firestore access.

Firebase services:

- Authentication: Email/Password and Anonymous.
- Firestore: `users`, `usernames`, `progress`, `leaderboards`, `chatRooms`, `feedback`, `friendRequests`, `friends`, and `diagnostics`.
- Realtime Database: not used yet.
- Analytics: not used.

Manual Firebase setup:

1. Create a Spark/free Firebase project.
2. Add a Web app and paste the public web config into `firebase-config.js`.
3. Enable Email/Password and Anonymous auth providers.
4. Create Firestore in production mode.
5. Publish `firestore.rules`.
6. Run the deployed game and use Online -> Server settings -> Run Firebase Test.

Security rules are the backend guardrail. Do not use open test-mode rules for launch. Never commit Firebase Admin SDK keys, service-account JSON, browser passwords, or private tokens.

## Legacy Local Node Backend

```bash
cp .env.example .env
npm run dev:server
curl http://127.0.0.1:8787/health
```

Use `window.INFERNO_BACKEND_MODE = "websocket"` or `?backendMode=websocket`, then set `ws://127.0.0.1:8787/ws` in the Online tab.

The local backend remains useful for room/match protocol work: temporary guests, password accounts, room codes, queues, chat, cloud-save messages, friends, reports, feedback, server-owned leaderboard snapshots, protocol validation, rate limits, and local JSON/Postgres persistence.

## Legacy Cloudflare Worker

The Worker routes `GET /health` and WebSocket upgrades at `GET /ws`. It mirrors the old local protocol and D1 storage for authoritative room coordination.

Do not make Cloudflare primary for this school-network Firebase migration. Use Worker deployment only when the owner explicitly asks for legacy WebSocket room-server work.

```bash
npm run worker:check
npm run worker:types
```

## Legacy Replit

Replit publish requires payment and must not be used. Replit dev URLs are not production. Keep any Replit code only as behavioral reference for the old Node server.

## Frontend Configuration

Default production:

```js
window.INFERNO_BACKEND_MODE = "firebase";
```

Legacy server override:

```js
window.INFERNO_BACKEND_MODE = "websocket";
window.INFERNO_ONLINE_URL =
  "wss://infernodrift4-online.clarkbythebay.workers.dev/ws";
```

The Online tab still stores backup legacy WebSocket URLs, but Firebase mode ignores them for account/chat/leaderboard/progress.

## Production Notes

- Firebase client-submitted leaderboard scores are not cheat-proof without a trusted server or Cloud Functions.
- Firebase online-lite chat is not low-latency game transport.
- If Firebase is down, blocked, or slow, the game must show the unavailable message and allow Guest Offline.
- GitHub Pages cannot host server-authoritative WebSocket code.
