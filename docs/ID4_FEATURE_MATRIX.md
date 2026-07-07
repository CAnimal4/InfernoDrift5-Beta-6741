# InfernoDrift4.1 Feature Matrix

This matrix tracks the current InfernoDrift4.1 static launch surface. Anything that only exists in the rejected React/Vite scaffold is not marked implemented here.

## Current Static Launch Features

| Feature                                         | Status      | Current reference                            | QA scenario                                                             |
| ----------------------------------------------- | ----------- | -------------------------------------------- | ----------------------------------------------------------------------- |
| InfernoDrift4.1 identity over restored foundation | implemented | `index.html`, `script.js`                    | Title/menu/start copy says InfernoDrift4.1 while gameplay stays restored |
| Campaign Survival / InfernoDrift4.1 loop        | implemented | `script.js` worlds, hunters, ramps, powerups | Start Campaign, drive, survive, restart                                 |
| Max Arena                                       | implemented | `script.js` Max functions                    | Start Max Arena, hit ball, force/replay goal                            |
| Ground speed/reference lines                    | implemented | `script.js` ground grid/world lines          | Live driving screenshot keeps speed cues visible                        |
| Forward-relative radar                          | implemented | `drawMinimap()`, `buildRadarSnapshot()`      | Verify top/front, left/car-left, edge arrows, clean icons               |
| Radar state in text hook                        | implemented | `render_game_to_text().radar`                | Smoke parses radar sectors/projections                                  |
| Minimal live HUD pass                           | implemented | `style.css`, `updateHud()`                   | Gameplay screenshot shows clear center playfield                        |
| Pause/menu/results hierarchy                    | expanded    | `menu`, `showMessage()`                      | Pause, restart, Play/Garage/Progress/Settings/Controls/Help screenshots |
| Garage/customization                            | implemented | `tab-customize`, garage preview/loadouts     | Change loadout and verify car preview/player updates                    |
| Keyboard remapping                              | implemented | Controls tab, `controlBindings`              | Remap helper rejects duplicate primary bindings                         |
| Controller path                                 | expanded    | Gamepad API polling                          | Controls tab reports controller state; browser support required         |
| Human username tags                             | implemented | remote player test API                       | Add Clark remote player and verify unobtrusive tag                      |
| Touch/mobile layout                             | implemented | `style.css`, touch presets/scale             | Phone landscape smoke                                                   |
| Phase 3 mode board                              | implemented | `MODE_CATALOG`, `renderModeBoard()`          | Smoke verifies remaining required modes are visible/startable           |
| Race / Time Trial                               | expanded    | bounded track markers, ghost samples         | Start mode, verify winding track, rivals/solo split, complete result    |
| Stunt / Ramp modes                              | expanded    | stunt loops, air rings, ramp gauntlet hooks  | Start Stunt Park/Ramp Rush, verify no bots and trick/ring state         |
| Chase modes                                     | expanded    | Hunter Tag role state                        | Smoke exposes evader/it state and tag-back objective                    |
| Battle / arcade minigames                       | expanded    | battle lasers, bowling/safe/zone markers     | Smoke exposes lasers, ammo/health, bowling, lava, and local objectives  |
| Local progression V2                            | implemented | `progressionV2`, Progress Run Board          | Complete Race, verify XP and personal best                              |
| Firebase online-lite                            | implemented | `firebase-online.js`, `firestore.rules`      | Run Firebase Test, account/guest/chat/leaderboard/friends/feedback      |
| Online lobby presence and ready-state           | implemented | `script.js`, `firebase-online.js`            | Smoke verifies driver count, ready count, member list, and ready toggle |
| Local backend smoke                             | implemented | `apps/server`, `smoke_online_local.mjs`      | Guest auth, private room, quick/free chat, sanitizer                    |
| Cloudflare Worker scaffold                      | legacy      | `apps/worker`, `wrangler.jsonc`              | Legacy room-server reference only unless explicitly requested           |

## Required 50 Improvements Status

- Implemented or expanded in the static surface: camera tuning, boost/drift feedback, hunter warning foundations, readable ramps, landing/backflip rewards, powerup visuals, near-miss rewards, Max identity, Max ball feedback, goal replay, ball cam, compact HUD, better menu hierarchy, structured results, local loadouts, car-class summaries, Three.js garage preview, keyboard remapping, controller path, mobile/touch presets, favicon/icons, local smoke tests, full offline mode roster, six minigames, XP, levels, medals, personal bests, ghost samples, daily/weekly challenge seeds, reward log, and unlock previews.
- Partially implemented: campaign map depth, deeper audio/music, replay/highlight breadth beyond Max, live-event/community goal depth.
- Pending in the static surface: full guided tutorial race and full live-event rotation content.
- Firebase online-lite now covers persistent accounts, anonymous guests, usernames, lobby chat, progress, leaderboard, feedback, friends, online presence, lobby membership, code sharing, and ready-state where configured. Still blocked without a trusted server: authoritative public multiplayer rooms and cheat-proof ranked scoring.

## Required 20 Major InfernoDrift4.1 Changes Status

- Real in current launch: restored InfernoDrift4.1 gameplay foundation, improved physics/handling within existing loop, Max Arena, offline mode/minigame expansion, procedural visual style, customization, local progression, local backend smoke, protocol validation/moderation tests, and one-more-run restart flow.
- Partial: modular architecture, ranked/leaderboard shell, bot roles, replay/highlights, visual/audio polish, and true authoritative simulation.
- Firebase online-lite implemented: accounts, friends, social/chat, leaderboard, feedback, and cloud progress. Hosted blocked: real public authoritative multiplayer and server-verified ranked scoring.

## Sign-Off Rule

No row moves to `implemented` unless it is usable in the root static game, has a browser or automated QA scenario, and does not depend solely on the rejected React scaffold.
