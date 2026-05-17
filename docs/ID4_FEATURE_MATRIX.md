# ID4 Feature Matrix

This matrix tracks the current ID3-first static launch surface. Anything that only exists in the rejected React/Vite scaffold is not marked implemented here.

## Current Static Launch Features

| Feature                          | Status       | Current reference                            | QA scenario                                                               |
| -------------------------------- | ------------ | -------------------------------------------- | ------------------------------------------------------------------------- |
| ID4 identity over ID3 foundation | implemented  | `index.html`, `script.js`                    | Title/menu/start copy says InfernoDrift4 while gameplay stays ID3-derived |
| Campaign Survival / ID3.3 loop   | implemented  | `script.js` worlds, hunters, ramps, powerups | Start Campaign, drive, survive, restart                                   |
| Max Arena                        | implemented  | `script.js` Max functions                    | Start Max Arena, hit ball, force/replay goal                              |
| Ground speed/reference lines     | implemented  | `script.js` ground grid/world lines          | Live driving screenshot keeps speed cues visible                          |
| Forward-relative radar           | implemented  | `drawMinimap()`, `buildRadarSnapshot()`      | Verify top/front, left/car-left, edge arrows, clean icons                 |
| Radar state in text hook         | implemented  | `render_game_to_text().radar`                | Smoke parses radar sectors/projections                                    |
| Minimal live HUD pass            | implemented  | `style.css`, `updateHud()`                   | Gameplay screenshot shows clear center playfield                          |
| Pause/menu/results hierarchy     | expanded     | `menu`, `showMessage()`                      | Pause, restart, Play/Garage/Progress/Settings/Controls/Help screenshots   |
| Garage/customization             | implemented  | `tab-customize`, garage preview/loadouts     | Change loadout and verify car preview/player updates                      |
| Keyboard remapping               | implemented  | Controls tab, `controlBindings`              | Remap helper rejects duplicate primary bindings                           |
| Controller path                  | expanded     | Gamepad API polling                          | Controls tab reports controller state; browser support required           |
| Human username tags              | implemented  | remote player test API                       | Add Clark remote player and verify unobtrusive tag                        |
| Touch/mobile layout              | implemented  | `style.css`, touch presets/scale             | Phone landscape smoke                                                     |
| Local backend smoke              | implemented  | `apps/server`, `smoke_online_local.mjs`      | Guest auth, private room, quick/free chat, sanitizer                      |
| Cloudflare Worker scaffold       | blocked-live | `apps/worker`, `wrangler.jsonc`              | Dry-run only until secrets and Worker URL exist                           |

## Required 50 Improvements Status

- Implemented or expanded in the static surface: camera tuning, boost/drift feedback, hunter warning foundations, readable ramps, landing/backflip rewards, powerup visuals, near-miss rewards, Max identity, Max ball feedback, goal replay, ball cam, compact HUD, better menu hierarchy, structured results, local loadouts, car-class summaries, Three.js garage preview, keyboard remapping, controller path, mobile/touch presets, favicon/icons, local smoke tests.
- Partially implemented: campaign map/progression, unlock previews, medals, daily/weekly challenges, deeper audio/music.
- Pending in the static surface: full tutorial race, full mode roster, all six minigames, replay/highlight breadth beyond Max, live events.
- Blocked by backend deployment: hosted online, persistent accounts, friends, ranked persistence, cloud saves, live leaderboards, reports/blocks/DMs.

## Required 20 Major ID4 Changes Status

- Real in current launch: ID3-derived gameplay foundation, improved physics/handling within existing loop, Max Arena, procedural visual style, customization, local backend smoke, protocol validation/moderation tests, one-more-run restart flow.
- Partial: modular architecture, progression, ranked/leaderboard shell, bot roles, replay/highlights, visual/audio polish.
- Pending: full offline mode/minigame expansion and true authoritative simulation.
- Hosted blocked: real public multiplayer, accounts, friends, persistent social/chat/ranked/cloud saves/live events.

## Sign-Off Rule

No row moves to `implemented` unless it is usable in the root static game, has a browser or automated QA scenario, and does not depend solely on the rejected React scaffold.
