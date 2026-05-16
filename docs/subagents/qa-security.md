# QA / Security Subagent Report

Acceptance checks for the active static rescue:

- Verify `window.render_game_to_text()`, `window.advanceTime(ms)`, and `window.__infernodriftTestApi`.
- Run `node --check script.js`, `npm run typecheck`, `npm test`, `npm run build`, `npm run smoke`, `npm run test:e2e`, and `npm run smoke:online-local`.
- Verify desktop gameplay, title overlay, live radar, garage/menu, Max Arena, and mobile landscape screenshots from the static root game.
- Treat Cloudflare live online as blocked until credentials and a verified Worker WebSocket URL are available.

Security posture remains: validate backend protocol messages, keep hosted online honest, never trust client-submitted scores/ranks/unlocks, and never commit secrets.
