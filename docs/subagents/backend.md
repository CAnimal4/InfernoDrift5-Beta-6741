# Multiplayer / Backend Subagent Report

- Local backend: `apps/server/src/index.js` provides `/health`, WebSocket rooms, guest auth, local JSON persistence, exact origin allowlisting, private rooms, queues, room snapshots, bot fill metadata, chat, quick chat, rate limits, leaderboard shell, friends/recent shell, and input snapshots.
- Worker backend: `apps/worker/src/index.js` routes `/health` and `/ws` into an `InfernoRoom` Durable Object for room coordination.
- Runtime protocol: `apps/worker/src/protocol.js` validates known message shapes, rejects admin/authoritative payloads, gates free chat at 13+, sanitizes chat, redacts PII, blocks severe moderation hits, and normalizes room options.
- Production config now prefers the Replit backend at `wss://infernodrift4-online.replit.app/ws` and keeps the Cloudflare Worker as fallback. Do not claim Replit live until the published URL passes `/health`, WebSocket smoke, and Pages two-client verification.
