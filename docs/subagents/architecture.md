# Architecture / Build Subagent Report

Current launch architecture is the InfernoDrift4 static game:

- Active shipped client: root `index.html`, `script.js`, and `style.css`.
- Build: `scripts/build-site.mjs` copies root static assets into `dist/` and writes `.nojekyll`.
- Local development: `npm run dev:web` serves the root static game on `127.0.0.1:4173`.
- React/Vite: `client/` is retained as reference/scaffolding and is available through `npm run dev:react`, but it is not the launch surface.
- Backend: `apps/server` and `apps/worker` remain backend tracks for later online work.

Acceptance checks for this rescue path: `node --check script.js`, `npm run typecheck`, `npm test`, `npm run build`, `npm run smoke`, `npm run test:e2e`, `npm run smoke:online-local`, `npm run worker:check`, and `npm run worker:types`.
