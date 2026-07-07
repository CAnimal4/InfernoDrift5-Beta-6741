# UI / Mobile / Visuals Subagent Report

Current UI/visual direction is the static InfernoDrift4 cockpit surface, cleaned without replacing the game:

- Active HUD, radar, menu, garage, and touch controls live in root `index.html`, `style.css`, and `script.js`.
- HUD should stay compact while driving and keep the center playfield clear.
- Radar must be forward-relative, use the box efficiently, and avoid grid clutter.
- Garage keeps current loadout customization and should evolve toward a stronger preview bay without breaking instant cosmetic application.
- Mobile landscape remains first-class: smaller HUD/radar, no selectable touch text, readable buttons, and preserved touch controls.

The React UI files are not current launch proof.
