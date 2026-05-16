# Revamp Pass Subagent Report

This report is reset for the ID3-first launch rescue. Earlier React/TypeScript/Three revamp notes are historical and should not be used as current launch proof.

## Current Findings

- Active launch source is the root static game.
- `npm run dev:web` serves the static root, while `npm run dev:react` exists only for reference/scaffolding.
- `npm run build:web` publishes static root files to `dist/`.
- The current priority is preserving ID3 feel, then improving radar, HUD, garage, feedback, mode depth, and honest online.

## Remaining Gaps

- Full offline mode roster and six minigames need static-runtime implementation and smoke coverage before being called done.
- Keyboard remap, controller support, full audio runtime, and hosted Cloudflare online remain planned phases.
- Cloudflare online is not live until a real Worker URL passes `/health`, WebSocket smoke, and Pages two-client verification.
