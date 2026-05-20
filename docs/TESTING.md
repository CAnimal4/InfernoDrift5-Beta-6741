# Testing

Run from the repo root.

## Static Launch Gates

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

## Browser Scenarios

- Title/menu launches the root static InfernoDrift4 game.
- Campaign Survival starts, drives, drifts, boosts, jumps, backflips with `B`, pauses, restarts, and returns results.
- Max Arena starts, ball/goal/replay paths work, and ball cam state is visible.
- Radar projects correctly relative to the car: front/top, left/left, right/right, behind/bottom.
- Phone landscape keeps HUD/radar/touch controls usable and unselectable.
- Garage/customization changes apply instantly.
- Remote human name tags are visible and unobtrusive.

## Backend Tests

`npm test` covers Firebase validation helpers plus the legacy local backend. `npm run smoke:online-local` covers the legacy Node/WebSocket room server, sanitizer, age-gated free chat, quick chat, private rooms, bot fill metadata, input snapshots, and leaderboard shell.

Firebase manual checks:

- Firebase project uses Spark/free plan.
- Email/Password and Anonymous auth are enabled.
- Firestore production database has `firestore.rules` published.
- Online -> Server settings -> Run Firebase Test passes from local and deployed Pages.
- Create account, duplicate username, anonymous guest, lobby chat, leaderboard, feedback, friends, and offline fallback work without hangs.

Legacy Cloudflare dry checks:

```bash
npm run worker:check
npm run worker:types
```

Hosted Worker smoke only for explicit legacy WebSocket work:

```bash
INFERNO_ONLINE_SMOKE_URL=wss://<verified-worker>/ws node smoke_online_local.mjs
```

## Visual Evidence

When changing gameplay, HUD, radar, garage, or mobile layout, regenerate screenshots with the repo smokes or the develop-web-game Playwright client and inspect them before sign-off. DOM assertions alone are not enough for this game.
