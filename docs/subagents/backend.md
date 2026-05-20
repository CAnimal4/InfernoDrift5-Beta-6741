# Multiplayer / Backend Subagent Report

- Local backend: `apps/server/src/index.js` provides `/health`, WebSocket rooms, guest auth, local JSON persistence, exact origin allowlisting, private rooms, queues, room snapshots, bot fill metadata, chat, quick chat, rate limits, leaderboard shell, friends/recent shell, and input snapshots.
- Worker backend: `apps/worker/src/index.js` routes `/health` and `/ws` into an `InfernoRoom` Durable Object for room coordination.
- Runtime protocol: `apps/worker/src/protocol.js` validates known message shapes, rejects admin/authoritative payloads, gates free chat at 13+, sanitizes chat, redacts PII, blocks severe moderation hits, and normalizes room options.
- Production config now prefers Firebase online-lite for accounts, guests, usernames, progress, leaderboard, lobby chat, friends, feedback, and diagnostics. Replit dev links are not production, and Cloudflare remains legacy fallback/reference only.
