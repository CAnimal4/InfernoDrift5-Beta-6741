# Backend

The backend is optional for playing the GitHub Pages client. Without `VITE_SERVER_URL`, the client shows a backend-offline indicator and keeps all solo/bot modes available.

## Local Run

```bash
npm ci
npm run dev:server
```

Health check:

```bash
curl http://127.0.0.1:8787/health
```

Connect the web client:

```bash
VITE_SERVER_URL=ws://127.0.0.1:8787 npm run dev:web
```

## Environment

- `PORT`: HTTP/WebSocket port, default `8787`.
- `ALLOWED_ORIGINS`: comma-separated origin allowlist.
- `SESSION_SECRET`: required for a hardened production deployment.
- `DATA_DIR`: local persistence folder.
- `VITE_SERVER_URL`: frontend build-time WebSocket URL.

## Implemented Server Features

- Guest/device account resume.
- Private rooms with invite codes.
- Casual/ranked/bot-match queues.
- 1v1, 2v2, 3v3 room sizing.
- Bot fill event scaffolding.
- Lobby chat with length limits, tag stripping, basic profanity masking, and rate limits.
- Friend request/accept scaffolding.
- Server-side protocol validation and input clamps.

## Production Options

Deploy to any Node host that supports WebSockets, such as Fly.io, Render, Railway, a VPS, or AWS. Set `VITE_SERVER_URL` to the public `wss://` endpoint before building the Pages client. Do not claim the backend is live until the public health endpoint and a two-client room flow are verified.
