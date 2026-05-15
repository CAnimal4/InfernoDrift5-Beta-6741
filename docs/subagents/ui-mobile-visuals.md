# UI / Mobile / Visuals Subagent Report

- UI direction remains neon arcade cockpit, now implemented in React under `client/src/App.tsx` and `client/src/styles/app.css`.
- Current menu surfaces: Play, Garage, Progress, Online, Settings, and How To.
- Current visuals: Three playfield, Three garage preview, HUD objective/vehicle clusters, radar panel, replay/toast stack, online panels, and settings controls.
- Current mobile support: touch steering pad, Jump/Drift/Boost/Backflip buttons, responsive CSS, and browser Gamepad API input.
- Current caveat: audio volume sliders exist, but this docs pass did not find a React Web Audio runtime. Treat dynamic/procedural audio as pending for the React tree.
