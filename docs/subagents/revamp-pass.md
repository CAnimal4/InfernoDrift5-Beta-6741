# Revamp Pass Subagent Report

This report is reset for the InfernoDrift4 launch rescue. Earlier React/TypeScript/Three revamp notes are historical and should not be used as current launch proof.

## Current Findings

- Active launch source is the root static game.
- `npm run dev:web` serves the static root, while `npm run dev:react` exists only for reference/scaffolding.
- `npm run build:web` publishes static root files to `dist/`.
- The current priority is preserving InfernoDrift4 feel, then improving radar, HUD, garage, feedback, mode depth, and honest online.

## Remaining Gaps

- Full offline mode roster and six minigames need static-runtime implementation and smoke coverage before being called done.
- Keyboard remap, controller support, full audio runtime, and hosted Replit online verification remain planned phases.
- Replit online is the production primary target, with the Cloudflare Worker as fallback. Do not claim hosted online live until Replit passes `/health`, WebSocket smoke, and Pages two-client verification.
