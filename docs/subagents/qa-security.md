# QA / Security Subagent Report

Acceptance checks for the active static rescue:

- Verify `window.render_game_to_text()`, `window.advanceTime(ms)`, and `window.__infernodriftTestApi`.
- Run `node --check script.js`, `npm run typecheck`, `npm test`, `npm run build`, `npm run smoke`, `npm run test:e2e`, and `npm run smoke:online-local`.
- Verify desktop gameplay, title overlay, live radar, garage/menu, Max Arena, and mobile landscape screenshots from the static root game.
- Treat Firebase Auth/Firestore diagnostics as the production online gate. Treat Cloudflare/Replit as legacy fallback/reference unless explicitly requested.

Security posture remains: validate inputs, keep hosted online honest, never trust client-submitted scores/ranks/unlocks as authoritative, and never commit secrets or Firebase Admin SDK keys.
