# QA / Security Subagent Report

Acceptance checks for this restart:

- Preserve baseline visuals and controls.
- Verify `window.render_game_to_text()` and `window.advanceTime(ms)`.
- Run syntax checks, backend tests, static build, game smokes, mobile screenshots, and production Pages checks.
- Validate backend message types, chat sanitation, rate limiting, room creation, and speed sanity rejection.
