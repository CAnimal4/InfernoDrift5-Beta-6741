# Game Engine / Physics Subagent Report

The active engine for launch is the root static `script.js` game loop. Current rescue focus:

- Preserve InfernoDrift4 driving feel, close camera, ground reference lines, boost pads, ramps, hunters, powerups, Max Arena, and touch controls.
- Tune only the existing loop first: `updatePlayer`, vertical physics, bots, collisions, boost pads, ramps, backflip, landing, near miss, and feedback.
- Keep public hooks stable: `window.advanceTime(ms)`, `window.render_game_to_text()`, and `window.__infernodriftTestApi`.
- Keep radar projection in the static runtime and smoke coverage, especially top equals front and left equals car-left.

The typed `packages/game-core` path is not the active launch engine in this rescue pass.
