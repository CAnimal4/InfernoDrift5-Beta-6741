# InfernoDrift: Afterburn

InfernoDrift: Afterburn is a clean TypeScript/Three.js rebuild of InfernoDrift focused on arcade driving, a volcanic highway world, and real authoritative multiplayer.

## What is implemented

- Burn Run: solo hunter escape across three districts
- Burn Crew: four-player cooperative survival with revives and extraction
- Heat Circuit: up to six-player contact racing
- Drift Clash: up to six-player drift scoring
- Wreckyard: offline free drive
- Four handling-distinct chassis, local-plus-Firebase progression, daily seeds, garage, records, settings, keyboard/gamepad/touch input, synthesized vehicle audio, and deterministic test hooks
- Protocol-v2 Node/WebSocket server with private room codes, quick queue, bot fill, ready/rematch, reconnect sessions, quick chat, server-owned simulation/results, metrics, and Docker packaging
- Professionally authored CC0 vehicles/environment models plus CC0 PBR road and terrain materials; see `client/public/assets/ASSET_LICENSES.md`

The old InfernoDrift4 Firebase collections and saves are not overwritten. Existing players receive only a local Veteran paint/emblem grant.

## Run locally

```bash
npm install
npm run dev:server
```

In another terminal:

```bash
npm run dev:web
```

Open `http://127.0.0.1:4173`.

## Controls

- Accelerate/brake: `W/S` or arrows
- Steer: `A/D` or arrows
- Drift: `Space`
- Boost: `Shift`
- Jump: `X`
- Recover: `R`
- Fullscreen: `F`
- Menu: `Esc`
- Gamepad and landscape touch controls are supported

## Verification

```bash
npm run typecheck
npm test
npm run build
npm run smoke:afterburn
```

The browser smoke starts an isolated client and server, completes local gameplay/results, joins an authoritative Burn Crew room, verifies four synchronized players, exercises touch controls, rejects browser errors, and saves reviewed screenshots under `output/afterburn/smoke/`.

## Server configuration

- `PORT`: WebSocket/HTTP port, default `8787`
- `AFTERBURN_REGION`: player-facing region label
- `AFTERBURN_ALLOWED_ORIGINS`: comma-separated WebSocket origin allowlist
- `VITE_AFTERBURN_WS`: client WebSocket URL
- `FIREBASE_PROJECT_ID`: enables Firebase ID-token verification on the authoritative server
- `FIREBASE_SERVICE_ACCOUNT_JSON`: optional secret that enables server-only verified-result persistence in Firestore

The browser uses the standard `VITE_FIREBASE_*` web configuration variables. Authenticated profile data lives only in `afterburnProfiles`; authoritative server results live only in `afterburnVerifiedResults`. Firestore rules deny all client writes to verified results.

`render.yaml` deploys the authoritative WebSocket server as a free Render web service. `.github/workflows/pages.yml` builds and publishes the client to GitHub Pages using repository variables, and `firebase.json` supports an optional second deployment to Firebase Hosting.

Health endpoints: `/health`, `/ready`, and `/metrics`.
