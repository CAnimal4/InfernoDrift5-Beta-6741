# Multiplayer / Backend Subagent Report

- Local backend: `apps/server/src/index.js` provides `/health`, WebSocket rooms, guest auth, local JSON persistence, exact origin allowlisting, private rooms, queues, room snapshots, bot fill metadata, chat, quick chat, rate limits, leaderboard shell, friends/recent shell, and input snapshots.
- Worker backend: `apps/worker/src/index.js` routes `/health` and `/ws` into an `InfernoRoom` Durable Object for room coordination.
- Runtime protocol: `apps/worker/src/protocol.js` validates known message shapes, rejects admin/authoritative payloads, gates free chat at 13+, sanitizes chat, redacts PII, blocks severe moderation hits, and normalizes room options.
- Production config now prefers the free Replit dev backend at `wss://add88ee5-cd60-43a6-9187-bbf975395ace-00-buwzj014vifw.janeway.replit.dev/ws` and keeps the Cloudflare Worker as fallback. Do not claim a paid Replit published URL live unless it passes `/health`, WebSocket smoke, and Pages two-client verification.
