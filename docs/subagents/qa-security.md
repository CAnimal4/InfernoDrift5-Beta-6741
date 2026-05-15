# QA / Security Subagent Report

Acceptance checks for the current React/TypeScript revamp:

- Verify `window.render_game_to_text()`, `window.advanceTime(ms)`, and `window.__infernodriftTestApi`.
- Run `npm run typecheck`, `npm test`, `npm run build`, `npm run smoke`, `npm run test:e2e`, `npm run smoke:online-local`, `npm run worker:check`, and `npm run worker:types`.
- Validate protocol message types, moderation expansion, PII redaction, 13+ free-chat gating, quick chat, rate limiting, room creation/join, exact origin rejection, and speed/authoritative payload rejection.
- Verify current desktop/mobile screenshots and do not reuse older static-pass screenshots as current React proof.
- Treat Cloudflare live online as blocked until credentials and a verified Worker WebSocket URL are available.
