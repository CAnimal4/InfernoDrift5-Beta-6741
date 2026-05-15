# ID4 Feature Matrix

This matrix reflects the current React/TypeScript/Three worktree after parent verification on 2026-05-15 and the follow-up game-feel/UI recovery pass. Automated verification passed for typecheck, unit tests, build, desktop gameplay smoke, mobile/dev smoke, local-online smoke, and Worker dry-run/types. Some rows still remain `partial`, `pending`, or `blocked` because the feature is not complete even though the build is playable.

Status tags:

- `source-present`: observed in the current source, pending current test/parent verification.
- `test-authored`: tests exist in the current tree and passed in the parent run where noted.
- `verified`: covered by the parent automated/browser verification run.
- `partial`: UI, copy, schema, or some mechanics exist, but the feature is not complete.
- `pending`: not observed in the current React source or explicitly labeled as future work.
- `blocked`: depends on credentials, hosting, or another unavailable external resource.

## 50 Improvements

| #   | Feature                                                      | Current status | Current reference                                               | Verification status                                                               |
| --- | ------------------------------------------------------------ | -------------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| 1   | Better camera lean/shake/ramp anticipation                   | source-present | `client/src/game/GameCanvas.tsx`, settings sliders in `App.tsx` | verified by browser smoke and screenshot review; deeper tuning remains            |
| 2   | First-time tutorial race                                     | source-present | `MODE_META.tutorial`, `startGame()`                             | verified by smoke and develop-web-game loop                                       |
| 3   | Teach mechanics one at a time                                | source-present | tutorial objective/help text                                    | verified as tutorial route/objective; richer step prompts remain                  |
| 4   | Stronger boost effects                                       | source-present | Three FOV/trails, boost state                                   | verified visually in smoke; audio boost runtime pending                           |
| 5   | Better drift combo feedback                                  | source-present | HUD combo and game-core scoring                                 | verified by game-core tests/browser HUD smoke                                     |
| 6   | Hunter proximity warning                                     | source-present | radar threat/near-miss state                                    | game-core tests pending                                                           |
| 7   | Off-screen threat arrows                                     | source-present | `createRadar()` edge/status fields                              | game-core tests pending                                                           |
| 8   | Different hunter personalities                               | source-present | `BotPersonality` and mode bot roles                             | verified by game-core behavior tests and radar/text state                         |
| 9   | Boss hunters at finales                                      | source-present | boss mode bot personality                                       | game-core tests pending                                                           |
| 10  | Varied level objectives                                      | source-present | `MODE_META`, objective update functions                         | verified by mode-routing smoke and focused game-core tests                        |
| 11  | More readable ramps                                          | source-present | objective rings/markers/ramp pads in Three scene                | verified by visual smoke                                                          |
| 12  | Landing grades/boosts                                        | source-present | landing grade state and tests                                   | verified by game-core tests                                                       |
| 13  | Backflips/jumps matter                                       | source-present | input frame and landing/trick scoring                           | verified by landing/trick game-core tests                                         |
| 14  | World hazards                                                | partial        | lava-floor shield logic and arena bounds                        | lava-floor verified by tests; world variety remains partial                       |
| 15  | Clearer powerups                                             | pending        | no current React powerup system observed                        | design/implementation pending                                                     |
| 16  | Near-miss rewards                                            | source-present | near-miss score/boost logic                                     | verified by game-core tests                                                       |
| 17  | Stronger world identities                                    | partial        | mode labels/objectives, upgraded shared arena                   | visual/content pass improved; unique world art still pending                      |
| 18  | Campaign map progression                                     | partial        | Progress tab, XP/level/unlocks                                  | full map not observed                                                             |
| 19  | Unlock previews                                              | partial        | progression unlocks/reward log                                  | UI verification pending                                                           |
| 20  | Dramatic car customization                                   | source-present | car class, paint, accent controls                               | browser smoke pending                                                             |
| 21  | Garage preview scene                                         | source-present | `GaragePreview.tsx`                                             | verified by screenshot review                                                     |
| 22  | Multiple saved loadouts                                      | pending        | not observed in current React source                            | implementation pending                                                            |
| 23  | Car classes/handling                                         | source-present | `CAR_CLASSES` and player class state                            | verified by game-core tests/typecheck                                             |
| 24  | Ghost runs                                                   | partial        | time-trial copy/unlocks only                                    | full ghost run pending                                                            |
| 25  | Post-level stat breakdown                                    | partial        | replay/results/progression state                                | richer results pending                                                            |
| 26  | Medals/ranks per level                                       | source-present | medals/unlocks/reward log                                       | game-core tests pending                                                           |
| 27  | Daily/weekly challenges                                      | partial        | local daily/weekly seeds and static challenge copy              | backend/live rotation pending                                                     |
| 28  | Clear fail messages                                          | source-present | objective fail reasons                                          | game-core tests pending                                                           |
| 29  | Risk mode explanation                                        | source-present | mode/help copy                                                  | browser review pending                                                            |
| 30  | Max mode identity                                            | source-present | Max mode, ball, goals, replay                                   | verified by smoke and tests                                                       |
| 31  | Ball-hit feedback in Max                                     | source-present | ball/goal replay and stats                                      | verified by smoke/tests                                                           |
| 32  | Visible team roles                                           | source-present | bot team/role radar state                                       | verified by smoke text state                                                      |
| 33  | Stronger goal replay                                         | source-present | replay state and forced goal hook                               | verified by smoke                                                                 |
| 34  | Clear ball cam state                                         | pending        | no current React ball-cam control observed                      | implementation pending                                                            |
| 35  | Better pause menu                                            | source-present | cockpit menu overlay/tabs                                       | verified by browser smoke and screenshot review                                   |
| 36  | HUD shrinks during play                                      | source-present | CSS HUD/radar layout                                            | visual smoke pending                                                              |
| 37  | Smaller minimap on small screens                             | source-present | responsive radar CSS                                            | verified by mobile smoke                                                          |
| 38  | Better phone layout                                          | source-present | touch controls/responsive CSS                                   | verified by mobile smoke                                                          |
| 39  | Better tablet detection                                      | source-present | device mode resolver/state                                      | browser smoke pending                                                             |
| 40  | Landscape mobile                                             | source-present | touch landscape controls/CSS                                    | verified by mobile smoke                                                          |
| 41  | Custom touch controls                                        | source-present | touch joystick/action cluster                                   | verified by mobile smoke; richer remap remains pending                            |
| 42  | Controller support                                           | source-present | browser Gamepad API path                                        | manual/browser verification pending                                               |
| 43  | Keyboard remapping                                           | pending        | UI says remapping is next settings pass                         | implementation pending                                                            |
| 44  | Better menu hierarchy                                        | source-present | Play/Garage/Progress/Online/Settings/How To tabs                | verified by browser smoke and screenshot review                                   |
| 45  | Scroll indicators                                            | partial        | menu/list styling present                                       | visual review pending                                                             |
| 46  | Engine/tire/boost sounds                                     | pending        | React UI has volume sliders; no Web Audio runtime observed      | implementation pending                                                            |
| 47  | Dynamic music intensity                                      | pending        | React UI has music slider only                                  | implementation pending                                                            |
| 48  | Split code into modules                                      | source-present | `client/`, `packages/game-core`, `packages/protocol`            | verified by typecheck/build                                                       |
| 49  | Formal game state machine                                    | source-present | typed `MachineState` and transitions                            | verified by tests/smokes                                                          |
| 50  | Automated gameplay/menu/mobile/persistence/performance tests | test-authored  | `smoke_*.mjs`, `tests/*.test.*`                                 | verified for gameplay/menu/mobile/local-online; performance budget remains manual |

## 20 Major ID4 Changes

| #   | Feature                                  | Current status                 | Current reference                                                        | Verification status                                            |
| --- | ---------------------------------------- | ------------------------------ | ------------------------------------------------------------------------ | -------------------------------------------------------------- |
| 1   | Real game architecture                   | source-present                 | Vite React client plus TypeScript packages                               | verified by typecheck/build                                    |
| 2   | Online multiplayer rooms 1v1/2v2/3v3     | source-present, hosted blocked | `apps/server`, `apps/worker`, Online tab                                 | verified local room smoke; live blocked                        |
| 3   | Accounts/usernames/offline guest         | partial                        | guest auth and local username                                            | persistent accounts pending                                    |
| 4   | Friends/recent players                   | partial                        | friends/recent shell messages/UI                                         | D1 persistence pending                                         |
| 5   | Lobby chat/quick chat                    | source-present                 | client/server/worker chat paths                                          | verified local chat smoke/tests                                |
| 6   | Casual/ranked/private/bot matchmaking    | source-present                 | room/queue schemas and backend handling                                  | verified for room/queue shell; true ranked persistence pending |
| 7   | Authoritative server validation          | partial                        | protocol rejects invalid/admin-like payloads                             | true authoritative simulation pending                          |
| 8   | Physics upgrade                          | source-present                 | game-core vehicle/landing/bot/ball logic                                 | verified by game-core tests/browser smoke                      |
| 9   | Full vehicle handling model              | source-present                 | class tuning, drift/boost/air inputs                                     | verified by game-core tests/browser smoke                      |
| 10  | Visual style upgrade                     | source-present                 | Three playfield, HUD/radar CSS                                           | verified by screenshot review                                  |
| 11  | Main modes                               | source-present                 | `MODE_META` and objective updates                                        | verified by mode-routing smoke                                 |
| 12  | Rotating minigames                       | source-present                 | ramp rush, boost bowling, lava floor, king zone, trick combo, bot escape | verified by mode-routing smoke                                 |
| 13  | Progression/unlocks/cosmetics/challenges | partial                        | XP/level/unlocks, paint/accent/class, challenge copy                     | full persistence/content pending                               |
| 14  | Ranked mode/rating/leaderboard           | partial                        | playlist/ranked schema, leaderboard shell                                | real rating persistence pending                                |
| 15  | Better bots                              | source-present                 | bot personalities/roles                                                  | verified in radar/text state; deeper behavior QA remains       |
| 16  | Real garage                              | source-present                 | `GaragePreview.tsx` and class/paint/accent controls                      | verified by screenshot review                                  |
| 17  | Replay/highlights                        | partial                        | goal replay state/toast                                                  | broader highlight system pending                               |
| 18  | Live events/community goals              | partial                        | UI copy only; backend config not wired                                   | backend persistence pending                                    |
| 19  | Anti-glitch polish                       | source-present                 | protocol/input validation and smoke scripts                              | verified by automated gates; manual QA still useful            |
| 20  | One-more-run loops                       | source-present                 | restart, rewards, mode selector                                          | verified by restart/menu smoke                                 |

## New Requirements

| Requirement                                   | Current status                 | Current reference                                          | Verification status                                      |
| --------------------------------------------- | ------------------------------ | ---------------------------------------------------------- | -------------------------------------------------------- |
| Forward-relative space-efficient radar        | source-present                 | `createRadar()`, React `Radar` rendering                   | verified by game-core tests/browser smoke                |
| Cleaner icons for player/bots/ball/objectives | source-present                 | React radar entity classes and Three objects               | verified by screenshot review                            |
| Uploaded favicon conversion                   | source-present                 | `scripts/generate-icons.mjs`, icon outputs copied by build | verified by build/file inspection                        |
| Cleaner menu/HUD                              | source-present                 | React HUD/menu CSS                                         | verified by browser smoke and screenshot review          |
| Better graphics/effects                       | source-present                 | Three renderer, trails, FOV, fog/lights, landing cues      | verified by screenshot review; deeper asset pass remains |
| Fun, distinct minigames                       | source-present                 | game-core mode/objective functions                         | verified by mode-routing smoke and some unit tests       |
| Online works when configured                  | source-present, hosted blocked | Online tab plus Node/Worker backends                       | verified local smoke; live blocked                       |
| Cloudflare Worker + Durable Objects           | source-present                 | `apps/worker`, `wrangler.jsonc`                            | verified by `worker:check`/types                         |
| Hosted backend                                | blocked                        | no verified Worker URL recorded                            | needs secrets and live endpoint proof                    |
