# Game Engine / Physics Subagent Report

- Current engine lives in `packages/game-core/src/index.ts` with typed machine state, modes, car classes, bot personalities, input frames, objective markers, radar entities, progression, save migration, and deterministic `startGame` / `stepGame`.
- Current renderer lives in `client/src/game/GameCanvas.tsx` and draws the arena, player car, bots, ball, markers, trails, camera follow, fog, grid, and lights with Three.js.
- Current automation hooks remain in `client/src/App.tsx`: `advanceTime(ms)`, `render_game_to_text()`, and `__infernodriftTestApi`.
- Verification needed: game-core tests plus current browser smoke. Do not rely on older static-pass smoke output as proof for this React tree.
