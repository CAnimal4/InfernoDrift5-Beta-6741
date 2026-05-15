# Controls

## Keyboard

- Drive: `WASD` or arrow keys
- Drift: `Space`
- Boost: `Shift`
- Jump: `X`
- Backflip: `C`
- Restart: `R`
- Menu: `Esc` or `M`

## Touch

Use landscape orientation. The left joystick drives and steers; the right action cluster exposes Drift, Boost, Jump, Backflip, and Max Arena actions where applicable. Touch controls keep text selection disabled so gameplay does not highlight UI.

## Controller

The React client reads the first browser Gamepad API pad for steering, throttle, brake/reverse, drift, boost, and jump. Keyboard remapping is not implemented yet; the current UI labels it as a future settings pass.

## Dev/Test Hooks

- `window.advanceTime(ms)` advances deterministic simulation time for smoke tests.
- `window.render_game_to_text()` returns a structured text snapshot for automation.
- `window.__infernodriftTestApi` exposes focused debug/test helpers such as forced Max goals.
