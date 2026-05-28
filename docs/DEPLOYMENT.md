# Deployment

## GitHub Pages Frontend

The current frontend build is the restored static InfernoDrift4 root game. `npm run build:web` copies `index.html`, `script.js`, `style.css`, Firebase client modules, icons, manifest, service-worker reset file, and static card art into `dist/`.

1. Push `main`.
2. Ensure GitHub Pages source is GitHub Actions.
3. Wait for `Deploy GitHub Pages`.
4. Open https://canimal4.github.io/InfernoDrift4/.

The Pages workflow runs `npm ci`, `npm run typecheck`, `npm run test`, `npm run build:web`, uploads `dist/`, and deploys with official Pages artifact actions.

## Firebase Backend

Firebase is the production online backend for this migration. There is no Replit publish step.

Manual Firebase Console setup:

1. Create a Spark/free Firebase project.
2. Add a Web app and copy its public web config into `firebase-config.js`.
3. Enable Authentication providers:
   - Email/Password
   - Anonymous
4. Create Firestore in production mode.
5. Paste and publish `firestore.rules`.
6. Open the deployed Pages site and run Online -> Server settings -> Run Firebase Test.

Do not enable Blaze/billing, paid extensions, Replit paid publish, Firebase Admin SDK keys, or service-account JSON without explicit owner approval.

Expected Firebase collections are documented in `docs/FIREBASE_MIGRATION.md`.

## Legacy Cloudflare Worker Backend

The Cloudflare Worker backend is retained only as a legacy WebSocket fallback/reference. Worker source exists in `apps/worker` and is configured by `wrangler.jsonc`.

Dry checks:

```bash
npm run worker:check
npm run worker:types
```

Do not deploy Cloudflare or make `workers.dev` primary for school users unless the owner explicitly asks for legacy room-server work.

## Legacy Replit Backend

Replit publish requires payment and is not part of the free Firebase migration. Replit dev URLs must not be used as production URLs.

Keep Replit code only as a behavioral reference for the old Node backend.

## Manual UI Work

Use Safari + Computer Use for Firebase/GitHub dashboard inspection/configuration when needed. Stop before billing changes, paid plans, deleting data, private key creation, secret rotation, domain transfers, or irreversible account-level settings.
