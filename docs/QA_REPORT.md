# QA Report

Updated for the ID3-first static launch rescue.

## Current Source Under Test

- Active launch client: root `index.html`, `script.js`, `style.css`
- Static build: `scripts/build-site.mjs` -> `dist/`
- Local backend: `apps/server`
- Cloudflare Worker scaffold: `apps/worker`

The React/Vite client is not current launch proof.

## Required Local Gates

- `node --check script.js`
- `npm run typecheck`
- `npm test`
- `npm run build`
- `npm run smoke`
- `npm run test:e2e`
- `npm run smoke:online-local`

## Browser QA Checklist

- Title screen uses InfernoDrift4 identity.
- Campaign Survival starts, drives, boosts, drifts, jumps, backflips with `B`, restarts, pauses, and shows results/fail messages.
- Ground speed/reference lines remain visible during normal driving.
- Radar is forward-relative: top/front, left/car-left, right/car-right, bottom/behind.
- Radar uses the full box, has no heavy grid clutter, and shows clean icons plus edge arrows.
- Max Arena starts, ball interaction works, teams/roles are readable, goal replay works, and ball cam state is clear.
- Garage/customization updates the car immediately and shows unlock hints.
- Mobile landscape keeps HUD/radar/touch controls usable and disables text selection.
- Remote human name tags are readable and unobtrusive; bots are not labeled.

## Online QA

Local backend smoke must pass before any online UI work is trusted. Hosted online is blocked until:

- Cloudflare Worker deploy succeeds.
- `/health` responds from the deployed Worker.
- `INFERNO_ONLINE_SMOKE_URL=wss://.../ws node smoke_online_local.mjs` passes.
- The deployed Pages client completes a two-client room/chat test against that Worker.

## Known Noise

Headless Chromium can emit SwiftShader/WebGL `ReadPixels` warnings during screenshots. Treat those as environment noise only when the app console is otherwise clean.
