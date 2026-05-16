# Final Report

Status: active work is the ID3-first static launch rescue. The current shipped game is the root `index.html`, `script.js`, and `style.css` build, not the rejected React/Vite rewrite.

## URLs

- Repo: https://github.com/CAnimal4/InfernoDrift4
- Pages target: https://canimal4.github.io/InfernoDrift4/
- Cloudflare Worker URL: not verified yet

## Current Implementation Summary

- Root static files are the launch surface and `npm run build:web` copies them into `dist/`.
- Visible product identity now uses InfernoDrift4 while preserving ID3.3 mode DNA.
- Campaign Survival keeps the readable ID3 drift-survival loop: close camera, ground speed/reference lines, hunters, ramps, boost pads, powerups, touch controls, quick restarts, local save, and customization unlocks.
- Max Arena remains real local gameplay with ball physics, teams, bot roles, health, lunges, score, goal replay, and ball cam.
- The radar has been rebuilt as a clean forward-relative tactical radar where top is in front, left is car-left, right is car-right, and edge icons indicate off-radar threats.
- `render_game_to_text()` now reports UI screen, radar projections, progression, and honest offline/static online status.
- `B` is the static-game backflip key; `C` is reserved for backend-backed chat.
- Remote human username tags are available through the test/API layer for real players only and remain unobtrusive.

## Backend Status

- Local Node backend is real/local and covered by tests/smoke.
- Cloudflare Worker/Durable Object source exists but hosted online is not live.
- Friends, persistent accounts, ranked persistence, cloud saves, DMs, reports, and live events remain backend-gated and must not be described as live product features.

## Required Verification Before Release Sign-Off

Run and record:

```bash
node --check script.js
npm run typecheck
npm test
npm run build
npm run smoke
npm run test:e2e
npm run smoke:online-local
```

For Cloudflare work:

```bash
npm run worker:check
npm run worker:types
INFERNO_ONLINE_SMOKE_URL=wss://<verified-worker>/ws node smoke_online_local.mjs
```

Hosted online remains blocked until a real Worker URL passes the hosted smoke and a Pages two-client browser test.

## Known Limitations

- The full offline mode list and six minigames are not all implemented in the static launch surface yet.
- Keyboard remapping and controller support are planned rescue passes, not current static-launch proof.
- Audio runtime and dynamic music are not complete.
- Hosted online requires Cloudflare credentials, deployment, and verification.
