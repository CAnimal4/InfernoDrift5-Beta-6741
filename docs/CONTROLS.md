# Controls

## Keyboard

- Drive: `WASD` or arrow keys
- Drift: `Space`
- Boost: `Shift`
- Jump: `X`
- Backflip: `C`
- Restart: `R`
- Menu: `Esc` or `M`
- Max Arena ball cam: `L`
- Max Arena target lunge: `Ctrl` / `Command`

## Touch

Use landscape orientation. The left joystick drives and steers; the right action cluster exposes Drift, Boost, Jump, Backflip, and Max Arena actions where applicable. Touch controls keep text selection disabled so gameplay does not highlight UI.

## Dev/Test Hooks

- `window.advanceTime(ms)` advances deterministic simulation time for smoke tests.
- `window.render_game_to_text()` returns a structured text snapshot for automation.
- `window.__infernodriftTestApi` exposes focused debug/test helpers such as forced Max goals.
