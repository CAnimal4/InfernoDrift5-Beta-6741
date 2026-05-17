# Controls

## Keyboard

- Drive: `WASD` or arrow keys
- Drift / handbrake: `Space`
- Boost: `Shift`
- Jump: `X`
- Backflip: tap `X` again while airborne, or use `B` as the alternate trick key
- Restart: `R`
- Menu / pause: `Esc` or `M`
- Max Arena ball cam: `L`
- Max Arena ball lunge: `Space`
- Max Arena target lunge: `Ctrl` or `Command`
- Online chat: `C` is reserved for the backend-backed chat phase
- Controls can be remapped in the in-game Controls tab. Duplicate primary bindings are rejected.

## Touch

Use landscape orientation. The left joystick drives and steers; the right action cluster exposes Drift, Boost, and Jump. Jump becomes the trick/backflip button while airborne. The Controls tab includes Classic, Compact, and Lefty touch presets plus touch scale. Max Arena adds its Target action where applicable. Touch controls disable text selection so gameplay does not highlight UI.

## Controller

Controller support uses the browser Gamepad API where available: left stick or D-pad steers, triggers throttle/brake, face buttons cover jump/trick, drift/lunge, boost, and ball cam, Start opens pause/menu, and Select restarts.

## Dev/Test Hooks

- `window.advanceTime(ms)` advances deterministic simulation time for smoke tests.
- `window.render_game_to_text()` returns a structured text snapshot for automation.
- `window.__infernodriftTestApi` exposes focused debug/test helpers such as forced Max goals, radar/name-tag state, device-mode forcing, menu-tab opening, loadout switching, touch layout forcing, garage preview state, and control binding tests.
