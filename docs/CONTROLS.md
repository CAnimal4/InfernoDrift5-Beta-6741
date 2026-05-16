# Controls

## Keyboard

- Drive: `WASD` or arrow keys
- Drift / handbrake: `Space`
- Boost: `Shift`
- Jump: `X`
- Backflip: `B`
- Restart: `R`
- Menu / pause: `Esc` or `M`
- Max Arena ball cam: `L`
- Max Arena ball lunge: `Space`
- Max Arena target lunge: `Ctrl` or `Command`
- Online chat: `C` is reserved for the backend-backed chat phase

## Touch

Use landscape orientation. The left joystick drives and steers; the right action cluster exposes Drift, Boost, Jump, Backflip, and Max Arena actions where applicable. Touch controls disable text selection so gameplay does not highlight UI.

## Controller

Controller support is still a later rescue pass for the static launch surface. The old React scaffold had a Gamepad API path, but that is not current launch proof.

## Dev/Test Hooks

- `window.advanceTime(ms)` advances deterministic simulation time for smoke tests.
- `window.render_game_to_text()` returns a structured text snapshot for automation.
- `window.__infernodriftTestApi` exposes focused debug/test helpers such as forced Max goals, radar/name-tag state, and device-mode forcing.
