# Baseline Audit

The original `CAnimal4/InfernoDrift` repo is a static Three.js game with a large single-module script, touch controls, campaign survival, Max Arena, dev tools, deterministic test hooks, and Playwright smoke scripts. Its public project URL redirects through a JS.ORG custom domain that did not serve the game directly during planning.

Features to preserve:

- Fast drift/boost fantasy.
- Touch controls and device profiles.
- Campaign worlds and hunter pressure.
- Max Arena ball/team identity.
- `render_game_to_text` and deterministic automation hooks.

Weak spots to improve:

- Single large file architecture.
- No reproducible package manifest.
- Custom-domain Pages ambiguity.
- No backend.
- Limited menu hierarchy and progression depth.
