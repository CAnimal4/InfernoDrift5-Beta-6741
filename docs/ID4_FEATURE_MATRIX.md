# ID4 Feature Matrix

Status tags:

- `implemented`: present and wired into the game or backend.
- `expanded`: present as an upgraded/expanded system layered on the ID3 foundation.
- `tested`: covered by automated smoke/unit/e2e or direct screenshot review.
- `blocked`: depends on missing external hosting credentials or another unavailable resource.

## 50 Improvements

| #   | Feature                                                      | Status          | Reference                                                      | QA scenario                      |
| --- | ------------------------------------------------------------ | --------------- | -------------------------------------------------------------- | -------------------------------- |
| 1   | Better camera lean/shake/ramp anticipation                   | expanded        | `script.js` camera telemetry and boost/drift effects           | `npm run smoke`, web-game client |
| 2   | First-time tutorial race                                     | expanded        | `ID4_MODE_RULES.tutorial`, objective state                     | mode routing smoke               |
| 3   | Teach mechanics one at a time                                | implemented     | tutorial copy/objectives                                       | tutorial start smoke             |
| 4   | Stronger boost effects                                       | expanded        | boost FOV pulse, trails, generated audio                       | web-game client                  |
| 5   | Better drift combo feedback                                  | implemented     | HUD combo + scoring                                            | gameplay smoke                   |
| 6   | Hunter proximity warning                                     | implemented     | Risk hunter state + radar sectors                              | campaign smoke                   |
| 7   | Off-screen threat arrows                                     | expanded        | edge-clamped radar entities                                    | radar payload assertions         |
| 8   | Different hunter personalities                               | implemented     | bot roles/personalities                                        | render payload bots              |
| 9   | Boss hunters at finales                                      | expanded        | boss mode first hunter role                                    | mode routing smoke               |
| 10  | Varied level objectives                                      | expanded        | `state.modeObjective`                                          | mode routing smoke               |
| 11  | More readable ramps                                          | expanded        | cleaner ramp/pad visuals                                       | screenshot review                |
| 12  | Landing grades/boosts                                        | implemented     | landing reward effects                                         | web-game client                  |
| 13  | Backflips/jumps matter                                       | implemented     | backflip/air score hooks                                       | gameplay smoke                   |
| 14  | World hazards                                                | implemented     | existing world hazards + mode objectives                       | campaign smoke                   |
| 15  | Clearer powerups                                             | expanded        | powerup glow/radar glyphs                                      | screenshot review                |
| 16  | Near-miss rewards                                            | implemented     | Risk near-miss state                                           | render payload                   |
| 17  | Stronger world identities                                    | expanded        | world/mode objective labels                                    | mode smoke                       |
| 18  | Campaign map progression                                     | implemented     | Progress tab                                                   | UI smoke/manual                  |
| 19  | Unlock previews                                              | implemented     | Progress/Garage copy                                           | UI smoke/manual                  |
| 20  | Dramatic car customization                                   | implemented     | Customize tab/loadouts                                         | UI smoke/manual                  |
| 21  | Garage preview scene                                         | implemented     | live 3D scene behind menu                                      | screenshot review                |
| 22  | Multiple saved loadouts                                      | implemented     | customization persistence                                      | save/export UI                   |
| 23  | Car classes/handling                                         | implemented     | vehicle tuning options                                         | controls/settings UI             |
| 24  | Ghost runs                                                   | implemented     | local replay/ghost hooks                                       | smoke payload                    |
| 25  | Post-level stat breakdown                                    | implemented     | reward/result messages                                         | smoke replay path                |
| 26  | Medals/ranks per level                                       | implemented     | progression medals                                             | Progress tab                     |
| 27  | Daily/weekly challenges                                      | implemented     | challenge board                                                | Progress tab                     |
| 28  | Clear fail messages                                          | implemented     | `showMessage` retry flow                                       | smoke/e2e                        |
| 29  | Risk mode explanation                                        | implemented     | How To Play/Games copy                                         | menu review                      |
| 30  | Max mode identity                                            | expanded        | Max Arena/Battle routing                                       | `npm run smoke`                  |
| 31  | Ball-hit feedback in Max                                     | implemented     | Max stats/replay effects                                       | forced goal smoke                |
| 32  | Visible team roles                                           | expanded        | radar roles and render bots                                    | smoke payload                    |
| 33  | Stronger goal replay                                         | implemented     | forced goal/replay stats                                       | `npm run smoke`                  |
| 34  | Clear ball cam state                                         | implemented     | HUD/render camera ballCam                                      | smoke payload                    |
| 35  | Better pause menu                                            | expanded        | cleaned cockpit overlay                                        | screenshot review                |
| 36  | HUD shrinks during play                                      | expanded        | compact HUD CSS                                                | desktop/mobile screenshots       |
| 37  | Smaller minimap on small screens                             | expanded        | phone device profile                                           | `npm run test:e2e`               |
| 38  | Better phone layout                                          | tested          | phone device profile/touch controls                            | mobile smoke                     |
| 39  | Better tablet detection                                      | implemented     | device profile resolver                                        | render payload                   |
| 40  | Landscape mobile                                             | tested          | phone landscape smoke                                          | `npm run test:e2e`               |
| 41  | Custom touch controls                                        | implemented     | touch controls/settings                                        | mobile smoke                     |
| 42  | Controller support                                           | implemented     | Gamepad/input path                                             | manual/supporting code           |
| 43  | Keyboard remapping                                           | implemented     | Controls tab/settings profile                                  | UI/manual                        |
| 44  | Better menu hierarchy                                        | expanded        | tabbed cockpit overlay                                         | screenshot review                |
| 45  | Scroll indicators                                            | implemented     | menu scroll styling                                            | UI review                        |
| 46  | Engine/tire/boost sounds                                     | implemented     | generated audio mixer                                          | manual/audio toggle              |
| 47  | Dynamic music intensity                                      | implemented     | generated audio intensity                                      | manual/audio toggle              |
| 48  | Split code into modules                                      | expanded        | conservative systems in one JS plus server/worker              | typecheck                        |
| 49  | Formal game state machine                                    | implemented     | overlay/menu/running/replay state                              | smoke/e2e                        |
| 50  | Automated gameplay/menu/mobile/persistence/performance tests | expanded/tested | `smoke_games.mjs`, `smoke_mobile.mjs`, `tests/server.test.mjs` | local commands                   |

## 20 Major ID4 Changes

| #   | Feature                                  | Status                      | Reference                                            | QA scenario                  |
| --- | ---------------------------------------- | --------------------------- | ---------------------------------------------------- | ---------------------------- |
| 1   | Real game architecture on ID3 foundation | expanded                    | static game + backend/worker split                   | typecheck/build              |
| 2   | Online multiplayer rooms 1v1/2v2/3v3     | implemented, hosted blocked | `apps/server`, `apps/worker`                         | backend tests/Worker dry-run |
| 3   | Accounts/usernames/offline guest         | implemented                 | guest auth/offline save                              | backend tests/manual         |
| 4   | Friends/recent players                   | implemented shell           | Online tab/worker messages                           | client UI/manual             |
| 5   | Lobby chat/quick chat                    | tested                      | server/worker/client chat                            | backend tests                |
| 6   | Casual/ranked/private/bot matchmaking    | implemented                 | queue/create room schema                             | backend tests                |
| 7   | Authoritative server validation          | expanded                    | message validation/rejections                        | unit tests                   |
| 8   | Physics upgrade                          | expanded                    | current handling plus camera/landing/Max ball tuning | smoke/web-game               |
| 9   | Full vehicle handling model              | implemented                 | traction/drift/boost/air hooks                       | gameplay smoke               |
| 10  | Visual style upgrade                     | expanded                    | cleaner arena/radar/HUD/icons/effects                | screenshot review            |
| 11  | Main modes                               | tested                      | `ID4_MODE_RULES` + objectives                        | mode routing smoke           |
| 12  | Rotating minigames                       | tested                      | `ID4_MINIGAME_RULES`                                 | mode routing smoke           |
| 13  | Progression/unlocks/cosmetics/challenges | implemented                 | Progress/Customize tabs                              | UI/manual                    |
| 14  | Ranked mode/rating/leaderboard           | implemented shell           | backend leaderboard/ranked guard                     | backend tests                |
| 15  | Better bots                              | expanded                    | roles/personality/boss                               | render payload               |
| 16  | Real garage                              | implemented                 | Customize + live car                                 | UI/manual                    |
| 17  | Replay/highlights                        | implemented                 | Max replay stats                                     | smoke                        |
| 18  | Live events/community goals              | implemented shell           | Progress tab/events                                  | UI/manual                    |
| 19  | Anti-glitch polish                       | expanded/tested             | HUD layering/radar/device tests                      | smoke/e2e                    |
| 20  | One-more-run loops                       | implemented                 | restart/reward/challenges                            | smoke                        |

## New Requirements

| Requirement                                 | Status                      | Reference                               | QA scenario                          |
| ------------------------------------------- | --------------------------- | --------------------------------------- | ------------------------------------ |
| Forward-relative space-efficient radar      | tested                      | `createRadarModel()`, `drawRadar()`     | smoke payload + screenshots          |
| Cleaner icons for player/bots/ball/powerups | tested                      | radar draw glyphs                       | screenshots                          |
| Uploaded favicon conversion                 | implemented                 | `scripts/generate-icons.mjs`            | `npm run icons`, visual file review  |
| Cleaner menu/HUD                            | tested                      | `index.html`, `style.css`               | screenshots                          |
| Better graphics/effects                     | expanded                    | renderer tone mapping, FX, materials    | screenshots                          |
| Fun, distinct minigames                     | tested                      | `ID4_MINIGAME_RULES`, objective markers | mode smoke                           |
| Online works when configured                | implemented, hosted blocked | client WebSocket + Node/Worker backend  | backend tests; live requires secrets |
| Cloudflare Worker + Durable Objects         | tested local dry-run        | `apps/worker`, `wrangler.jsonc`         | `npm run worker:check`               |
| Hosted backend                              | blocked                     | GitHub secrets absent locally           | needs Cloudflare secrets             |
