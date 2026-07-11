# InfernoDrift5 Change Spec For A New Agent

This document explains, in detail, what should change from InfernoDrift4.1 to InfernoDrift5: RiftForge Online.

It is written for a new agent who knows nothing about InfernoDrift. Read this before editing code.

Important current instruction: the next implementation agent should work from the ID4.1 repo/codebase, not assume the existing `InfernoDrift5` folder is the active repo. Treat any current `InfernoDrift5` files as reference material only unless the user explicitly says to use them as the live source.

## One Sentence Goal

Turn the existing InfernoDrift4.1 static Three.js browser game into InfernoDrift5: RiftForge Online, a polished, cohesive, easier-to-start, smoother-driving, less buggy, more social, campaign-driven, builder-enabled, local-first browser game.

## Product Identity

- Product name: `InfernoDrift5: RiftForge Online`
- Short name: `InfernoDrift5`
- Package identity: `infernodrift5`
- Tagline: `Drive the heat. Build the chaos. Challenge everyone.`
- Working source folder for the next agent: `/Users/amandaalden/Downloads/Codex App Test/InfernoDrift4.1`
- Optional reference folder from earlier ID5 exploration: `/Users/amandaalden/Downloads/Codex App Test/InfernoDrift5`
- Repo direction for this handoff: implement the ID5 evolution in the ID4.1 repo/codebase unless the user explicitly redirects.
- Legacy/reference line: preserve known-good ID4.1 behavior while transforming that codebase into ID5.

## Where The Next Agent Should Work

The next agent should begin in:

```bash
cd "/Users/amandaalden/Downloads/Codex App Test/InfernoDrift4.1"
```

This is a change from the earlier isolation plan that put ID5 work in an `InfernoDrift5` folder. The user has clarified that the next agent will work in the ID4.1 repo. Therefore:

- Do not assume `/Users/amandaalden/Downloads/Codex App Test/InfernoDrift5` is the active source of truth.
- Do not blindly copy the ID5 folder over ID4.1.
- Use this document as the product and engineering plan.
- If the existing `InfernoDrift5` folder contains useful patches, compare carefully and port intentionally.
- Preserve the ID4.1 repo's working tests and release behavior while upgrading it.
- Before editing, run `git status --short` in the ID4.1 repo and inspect the actual files.
- If the ID4.1 repo is dirty, work with the existing changes and do not revert user work.

## What InfernoDrift4.1 Is

InfernoDrift4.1 is a static browser game. The shipped game is not the old React/Vite scaffold; it is the root static client.

At a product level, InfernoDrift is an arcade driving game in the browser. The player controls a stylized car in a hot, neon, arena-like world and jumps between fast challenge modes: racing through checkpoints, surviving hunters, collecting rings, scoring goals with a ball, fighting in flag/laser arenas, holding zones, escaping lava platforms, bowling into pins, and doing ramp/stunt routes. It is not a realistic racing simulator. It should feel immediate, readable, toy-like, responsive, and replayable.

The core player loop in ID4.1 is:

1. Open the static browser game.
2. Start locally or sign into online services optionally.
3. Pick a mode.
4. Drive, drift, boost, jump, recover from collisions, and complete a score/time/objective target.
5. See results.
6. Earn XP/Embers/rewards.
7. Upgrade/equip in the garage.
8. Try another run, improve a score, play online-lite/social features, or explore another mode.

ID5 should keep that loop but make it easier to understand and more addictive. The game should stop feeling like many disconnected experimental modes and start feeling like one cohesive arcade game with a campaign, builder, rewards, and casual online rooms.

## Baseline Gameplay Vocabulary

A new agent should understand these concepts before changing code:

- `Player car`: the main vehicle controlled by keyboard, touch, or controller-like inputs.
- `Mode`: a gameplay ruleset such as Race, Time Trial, Max Arena, Lava Floor, or Hunter Tag.
- `Run`: one attempt in a mode.
- `Objective`: the current thing the player should do, such as reach a checkpoint, hold a zone, collect a ring, score a goal, or survive a timer.
- `HUD`: in-game overlay showing speed, boost, health/shield, objective, minimap, mode stats, and prompts.
- `Results`: post-run overlay showing score/time, rewards, medals, bests, next actions, and progression.
- `Garage`: progression surface for cars, classes, cosmetics, loadouts, unlocks, XP, and Embers.
- `Online-lite`: Firebase-backed social/persistence features. It is not server-authoritative multiplayer physics.
- `Local/offline`: the game must be playable with no login and no Firebase availability.
- `Smoke test`: Playwright/browser automation that proves a UI/game flow still works.
- `Text-state API`: diagnostics from `window.render_game_to_text()` used by tests to verify behavior without fragile pixel-only assertions.

## Baseline Controls And Feel

The game is built around arcade driving:

- Accelerate/brake.
- Steer.
- Drift.
- Boost.
- Jump or mode-specific action.
- Recover/reset if stuck.
- Touch controls on mobile.
- Keyboard controls on desktop.

The feel should prioritize:

- Fast start.
- Forgiving recovery.
- Readable objectives.
- Controlled drifting.
- Strong but not chaotic boost.
- Clear collision feedback.
- Smooth camera.
- No permanent stuck states.

Avoid changes that make the game feel like a heavy simulator. It should feel crisp and playful.

## Baseline Modes In ID4.1

The mode roster is a strength, but ID4.1 can feel scattered. ID5 should organize these modes into Play, Heatline, Challenges, and Online flows.

Important mode families:

- `First Drive` / tutorial path: teaches controls using a friendly first-run structure.
- `Campaign Survival`: survive pressure from hunters/heat.
- `Race`: checkpoint route driving.
- `Time Trial`: checkpoint route with personal-best/ghost chase.
- `Max Arena`: car-and-ball goal scoring.
- `Battle Arena`: flag/laser/combat arena play.
- `Stunt Park`: collect rings, use ramps, and score stunt-style objectives.
- `Ramp Rush`: ramp/ring/trick route play.
- `Boost Bowling`: line up, launch, and bowl into pins.
- `Lava Floor`: rising hazard/platform survival and safe-pad routing.
- `King of the Zone`: hold active zones.
- `Hunter Tag`: chase/tag/role pressure.

Every mode should have:

- A clear launch path.
- Clear objective copy.
- HUD state that fits.
- Mobile controls that make sense for that mode.
- Result flow.
- Reward/progression integration.
- Smoke or test proof.

The important runtime files are:

- `index.html`: main DOM shell and UI markup.
- `script.js`: large centralized game runtime, UI state, modes, progression, input, physics, Firebase glue, and test hooks.
- `style.css`: menu, HUD, mobile, overlay, and visual styling.
- `firebase-online.js` and `firebase-online-core.js`: Firebase online-lite helpers.
- `firebase-config.js`: client-side Firebase config bootstrap.
- `firestore.rules`: Firestore security rules.
- `packages/game-core/src/id5-systems.ts`: pure/testable ID5 systems such as Heatline and RiftForge codecs.
- `smoke_*.mjs`: browser smoke tests.
- `tests/*.mjs` and `tests/*.ts`: Node and TypeScript tests.

ID4.1 already has:

- Three.js driving gameplay.
- Local/offline play.
- Firebase online-lite account/lobby/progress/leaderboard/friends/feedback paths.
- Multiple arcade modes.
- Progression, XP, Embers, garage, unlocks, and account safety guards.
- Smoke and unit tests.
- Static build and GitHub Pages deployment path.

ID5 must preserve the working static launch surface and improve it. Do not replace it with the rejected React/Vite scaffold. Do not do a clean-room rewrite.

## Baseline Architecture

InfernoDrift is intentionally simple to host: it ships as static browser files. Most of the live game is centralized, so new work must be careful and incremental.

Expected architecture facts:

- `index.html` contains the app shell, overlays, menu surfaces, HUD containers, and modal structure.
- `style.css` controls most visual hierarchy, responsive behavior, active menu states, HUD layout, and mobile/touch presentation.
- `script.js` is large and centralized. It contains runtime state, Three.js scene setup, mode logic, input handling, physics-ish movement, UI rendering, progression, local storage, online service calls, and test hooks.
- `firebase-online.js` and `firebase-online-core.js` hold Firebase online-lite behavior.
- `firestore.rules` must protect live Firebase data. Never add admin credentials or trusted score claims in client code.
- `packages/game-core` contains pure logic that can be tested without a browser. Use this area for low-risk data/codec systems such as Heatline or RiftForge when possible.
- `scripts/build-site.mjs` builds the static site into `dist`.
- Smoke tests usually start a local server and drive the real browser page.

When adding ID5 systems:

- Prefer small, testable helper functions.
- Extract pure data logic only when it reduces risk.
- Keep render/update flows compatible with existing tests.
- Preserve `window.advanceTime`, `window.render_game_to_text`, and `window.__infernodriftTestApi`.
- Add text-state diagnostics for new behavior.
- Do not split the whole game into a new framework.

## Baseline Online Truth

Firebase is the production online-lite path. The normal player should see terms like `online services`, `online guest`, and `online lobby`, not `Firebase`.

Firebase can support:

- Accounts.
- Online guests.
- Progress sync.
- Lobby metadata.
- Chat.
- Friends.
- Feedback.
- Leaderboards/rankings.
- Presence-ish state.
- Shared room metadata.
- Casual result boards.

Firebase cannot honestly support, by itself:

- Authoritative physics.
- Cheat-proof ranked racing.
- Server-validated competitive lap times.
- Real-time deterministic competitive multiplayer.

The client can run the same seed/challenge locally for each player and sync results afterward. The UI must call this casual, local-physics, online-lite play.

## Non-Negotiable Rules

1. Preserve local/offline play as first-class.
2. Never force login before driving.
3. Keep Firebase honest: it is online-lite/social/persistence, not authoritative physics multiplayer.
4. Do not claim ranked racing is cheat-proof while results are client-submitted.
5. Do not add paid services or paid assets.
6. Do not add unsafe or unmoderated direct messaging.
7. Do not break existing saves.
8. Do not break GitHub Pages static deployment.
9. Do not break Coolmath/portal-static compatibility if a portal build is being prepared.
10. Do not commit, push, or deploy unless the user explicitly asks and the current state is actually ready.
11. Do not revert user changes or unrelated repo changes.
12. Make conservative changes inside the existing architecture before extracting modules.

## High-Level Product Pillars

ID5 should feel like the real complete version of InfernoDrift. The player should immediately understand where to start, what they are doing in each mode, why rewards matter, and what to try next.

The main pillars are:

- Stabilization: fix bugs, glitches, wall/collision issues, stuck states, mode problems, saves, Firebase fallback, console errors, and UI overlap.
- Driving polish: improve car feel, drift, boost, landing, wall recovery, collisions, camera smoothing, mobile steering, and mode-specific vehicle interactions.
- UI/menu revamp: make the first screen, hub, Play flow, HUD, pause, results, garage, progress, Online, Challenges, Rankings, Settings, and Help easier to understand.
- Heatline Campaign: turn the mode roster into a guided campaign path.
- RiftForge Builder: let players create, test, save, export, and import local custom challenges with share codes.
- Firebase Online 2.0: expand online-lite into casual rooms, ready states, shared seeds/challenges, room results, presence-ish state, safe chat, friends, feedback, and rankings.
- Safer chat/social: lobby chat, room chat, quick chat, filtering, cooldowns, report, mute, block, and Firebase-unavailable fallback.
- Progression/garage rewards: improve rewards, unlock previews, car classes/loadouts, garage clarity, daily/weekly rewards, and replay motivation.
- Audio/VFX: add readable feedback for driving, objectives, rewards, collisions, mode events, and UI interactions.
- Testing/proof: every major feature needs pure tests, browser smoke, mobile smoke, and documentation.

## Required Work Order

Use this order unless the user explicitly changes priorities:

1. Audit ID4.1 and create/update `ID5_BUG_AUDIT.md`.
2. Fix critical/high bugs before adding major new systems.
3. Improve driving, camera, collisions, recovery, and stuck-state behavior.
4. Revamp onboarding, menus, HUD, pause, results, and mobile.
5. Improve and tune existing modes.
6. Add Heatline Campaign.
7. Add RiftForge Builder and share-code system.
8. Add Firebase Online 2.0, chat, rooms, challenges, and safety.
9. Improve garage, progression, audio, VFX, rewards, and mobile ergonomics.
10. Run all available tests and update final reports.

## Repository And Deployment Changes

For the next agent, the active implementation should happen in the ID4.1 repo. Earlier planning isolated ID5 into a separate `InfernoDrift5` folder, but the current user instruction supersedes that: work in `/Users/amandaalden/Downloads/Codex App Test/InfernoDrift4.1`.

Required setup:

- Start from the actual ID4.1 repo files.
- Preserve ID4.1 behavior while changing the product into ID5.
- Use the existing `InfernoDrift5` folder only as optional reference if it exists locally.
- Do not bulk-copy the ID5 folder over ID4.1 without review.
- Remove or permanently disable any old peer-sync workflow that could push ID5 changes back into the wrong repo.
- Stop using `scripts/sync-peer-repo.mjs` for the ID5 line unless the user explicitly asks for a legacy sync operation.
- Update CI and Pages workflows according to the actual repo layout the user wants at release time.
- If ID4.1 remains the repo root, workflows should run from the repo root rather than a nested `InfernoDrift5` folder.
- If the user later reintroduces a nested ID5 folder, workflows must use that folder consistently.
- CI should run:
  - `npm ci`
  - `npm run typecheck`
  - `npm test`
  - `npm run build:web`
- Pages should upload the actual built `dist` folder for the active source root.
- App/package/build identity should say `infernodrift5` / `InfernoDrift5: RiftForge Online`.

Do not deploy to GitHub Pages unless the user explicitly says to do so.

## How To Accomplish The Upgrade Safely

Treat this as a major product evolution, not a rewrite.

Recommended workflow:

1. Establish the baseline:
   - Run `git status --short`.
   - Run `npm run typecheck`.
   - Run `npm test`.
   - Run a relevant smoke test such as `npm run smoke`.
   - Record the baseline in `ID5_TEST_RESULTS.md` or `progress.md`.
2. Create the ID5 audit:
   - Add or update `ID5_BUG_AUDIT.md`.
   - List critical and high issues first.
   - Fix critical/high issues before large feature work.
3. Rename identity carefully:
   - Package name/version.
   - Manifest.
   - Title/menu copy.
   - Build output labels.
   - Any docs that would confuse ID4.1 and ID5.
4. Add ID5 save keys and migration:
   - Keep ID4.1 saves readable.
   - Do not overwrite higher cloud/account progress.
   - Add tests before broad UI changes.
5. Polish existing play:
   - Fix driving, camera, collision, recovery, mode result, mobile, and HUD issues.
   - Use targeted smokes and screenshots.
6. Build cohesive systems:
   - Heatline first, because it gives the whole mode roster structure.
   - RiftForge next, because it adds creation and replay.
   - Firebase Online 2.0 after local systems have stable data contracts.
7. Improve reward loops:
   - Garage clarity.
   - Daily/weekly/founder/featured challenges.
   - Unlock previews.
   - Result flow.
8. Polish audio/VFX and mobile:
   - Add feedback for events players already understand.
   - Keep mobile first-viewport information compact.
9. Verify:
   - Run targeted checks after every patch.
   - Run broad gates before calling a milestone done.
   - Update reports with exact commands and results.

When porting ideas from any existing `InfernoDrift5` reference folder:

- Compare file-by-file.
- Prefer small intentional patches.
- Re-run tests after each subsystem.
- Do not assume reference code is complete or release-ready.
- Do not overwrite ID4.1-specific fixes without understanding them.

## Save Migration And Storage Rules

ID5 needs its own save namespace so it does not overwrite ID4.1 local progress.

Required behavior:

- Use ID5 save keys such as `infernoDrift5.*`.
- Migrate or read from ID4.1 local saves as fallback.
- Do not overwrite higher XP/cloud progress with lower local progress.
- Preserve account progress trust guards.
- Preserve Clark/tainted-XP safety behavior.
- Preserve leaderboard/account XP safety rules.
- Add tests for ID4.1-to-ID5 save migration.

New serializable ID5 data should include:

- `heatline`: current world/node, medals, best scores, rewards, completion timestamps.
- `riftforge`: saved local challenges, versioned share-code payloads, validation errors.
- `onlineRoom`: room code, host/member metadata, ready state, challenge seed/code, run status, results, muted/blocked users.
- `chatSafety`: cooldowns, report metadata, local mute/block lists.

## Stabilization And Bugfix Targets

The first priority is to fix what is bad. A new agent should inspect `ID5_BUG_AUDIT.md` before making new features.

Audit and fix:

- Console errors.
- Broken mode launch paths.
- Broken mode completion/reward logic.
- Wall collision bugs.
- Stuck vehicle states.
- Bad recovery resets.
- Bad camera snaps.
- Camera shake that makes play hard to read.
- Race/Time Trial checkpoint bugs.
- Battle/Flag Arena logic bugs.
- Max Arena ball/goal/corner issues.
- Stunt Park ring and airborne detection issues.
- Ramp Rush/ramp landing issues.
- Boost Bowling scoring and launch issues.
- Lava Floor platform clarity and recovery issues.
- King of the Zone objective clarity.
- Hunter Tag role/target clarity.
- Bad mobile controls.
- UI overlap and text overflow.
- Save migration bugs.
- Firebase unavailable fallback bugs.
- Leaderboard/account safety bugs.
- Performance drops.
- Result/retry/next-flow bugs.

Each audit entry should include:

- Issue.
- Severity.
- Reproduction.
- File/location.
- Fix plan or implemented fix.
- Status.
- Test proof.

## Driving Feel Changes

ID5 should feel smoother and more arcade-polished than ID4.1.

Improve:

- Acceleration curve.
- Turning stability.
- Low-speed steering.
- Drift initiation.
- Drift control.
- Boost force.
- Boost feedback.
- Landing control.
- Ramp launch predictability.
- Wall recovery.
- Collision damping.
- Obstacle/cover impact behavior.
- Track boundary recovery.
- Car-to-ball interaction.
- Car-to-bot interaction.
- Battle cover-corner escape.
- Max Arena ball corner recovery.
- Bowling launch-line stability.
- Mobile steering assist.
- Touch-hold reliability.
- Camera smoothing.
- Camera snap limits.
- Camera stability telemetry.

Acceptance:

- The car should not permanently stick to walls.
- Quick restart should always work.
- Collisions should not launch the car into broken states.
- Camera should not hard snap unless a reset demands it.
- Mobile controls should be readable, reachable, and mode-aware.
- The player should understand recovery feedback when the game helps them.

## UI And Menu Revamp

The ID5 UI should be clearer, less clunky, and more polished than ID4.1.

Main concept:

- Consolidate into fewer top-level workspaces.
- Show useful choices earlier.
- Avoid huge walls of text.
- Avoid duplicate cards and nested-card clutter.
- Keep controls discoverable but not overwhelming.
- Make offline/local play visible immediately.

Recommended top-level workspaces:

- `Play`: Play Now, Heatline, Challenges, mode cards, room launch entry points.
- `Build`: RiftForge Builder.
- `Driver`: Garage, Rewards, Account, Setup/Controls/Audio.
- `Online`: lobby, rooms, chat, friends, rankings, feedback, service diagnostics.

Important UI changes:

- First screen should focus on `Play Now`, `First Drive`, optional Online, Continue Heatline, and Garage.
- Offline guest/local play must be available from the first screen.
- Do not show confusing backend names like Firebase in normal player copy. Use `online services`, `online guest`, and `online lobby`.
- Feedback should have a safe online path and a local `mailto:` fallback.
- Menus should fit on desktop, phone portrait, and phone landscape.
- Active-run pause menu should be compact and not repeat a giant title screen.
- HUD should prioritize live gameplay: objective, minimap, speed, boost, shield/health, mode panel.
- Hide nonessential reward CTAs during active gameplay.
- Results should clearly show score, XP, Embers, medal, best, unlocks, next action, retry, next Heatline node, and garage/progress routes.
- Help/mode copy should be short and actionable.

Specific UI areas to polish:

- First screen/title.
- Full menu/hub.
- Play flow.
- Heatline tab.
- RiftForge tab.
- HUD objective chip/compass.
- Pause menu.
- Results screen.
- Garage/Driver.
- Rewards/Progress.
- Online lobby/room.
- Challenges.
- Rankings.
- Settings/Setup/Controls.
- Feedback modal.
- Mobile touch controls.
- Mode help.

## Heatline Campaign

Heatline is the guided campaign structure for ID5. It should use existing modes instead of inventing unrelated gameplay.

Purpose:

- Give new players a clear path.
- Teach controls.
- Introduce each mode family.
- Add progression and replay goals.
- Make all existing modes feel like part of one game.

Required campaign mapping:

- First Drive teaches controls.
- Campaign Survival becomes survival heat missions.
- Race becomes checkpoint route missions.
- Time Trial becomes ghost/personal-best missions.
- Max Arena becomes ball/goal arena missions.
- Battle Arena becomes Flag/Laser Arena missions.
- Stunt Park and Ramp Rush become trick/ring missions.
- Boost Bowling becomes bonus stages.
- Lava Floor becomes rising-platform challenges.
- King of the Zone becomes zone-control missions.
- Hunter Tag becomes chase/tag missions.

Expected structure:

- 5 worlds.
- 26-ish campaign nodes.
- Each node has objective text.
- Each node has a mode config.
- Each node has a seed/target.
- Each node has medal thresholds.
- Each node has reward preview.
- Each node works offline.
- Each node saves completion state.
- Each node supports fast retry.
- Each node has a result flow.
- Each node unlocks the next path.

Current design direction:

- Worlds: Ignition Yard, Neon Route, Arena Circuit, Skyfire Stunts, Rift Core.
- Heatline state lives under `progressionV2.heatline`.
- Store `currentNodeId`, `medals`, `bestScores`, `completions`, and `rewardsClaimed`.
- First Drive should show tutorial/control language, not survival/hunter language.
- Results should identify the Heatline node and whether it advanced.
- First-clear rewards should pay once.
- Replays should not downgrade medals.
- The final Heatline completion should say campaign complete and route to RiftForge.

Heatline still needs:

- Deeper hands-on node tuning.
- Medal threshold balancing.
- Reward pacing balancing.
- Full-chain playthrough feel tests.
- Continued objective clarity pass.

## RiftForge Builder

RiftForge is the local-first custom challenge builder. It should work without Firebase.

Purpose:

- Let players build small challenge layouts.
- Let players test drive custom routes.
- Let players save locally.
- Let players export/import share codes.
- Let later Online systems share or feature approved codes.

Required contract:

- Share codes must be prefixed `ID5-RIFT`.
- Payloads must be versioned.
- Imports must validate before touching runtime state.
- Malformed codes must fail gracefully with clear errors.
- Builder must enforce object limits.
- Local save/load must work offline.
- Test Drive must launch a real existing mode.
- No backend should be required for local share codes.

Piece types:

- Start.
- Finish.
- Gate/checkpoint.
- Boost.
- Ramp.
- Ring.
- Flag.
- Zone.
- Barrier.
- Lava-safe / safe pad.

Challenge types:

- Race Route.
- Boost Course.
- Stunt Run.
- Flag Route.
- Zone Challenge.
- Lava Floor.

Builder UI should include:

- Challenge title.
- Challenge type.
- Visual piece palette.
- Piece list.
- Nudge/reorder/rotate/delete controls.
- Undo.
- Reset starter route.
- Grid or map placement.
- Build Preview.
- Validation errors.
- Runtime contract.
- Test Drive checklist.
- Launch Preview.
- Run Feel Forecast.
- Export/import.
- Saved local builds.

Runtime should support:

- Custom race/checkpoint routes.
- Custom boost pads.
- Custom ramps.
- Custom rings for Stunt.
- Custom barriers/collision.
- Custom Battle flag homes/return pads.
- Custom zone markers.
- Custom Lava safe-platform sequence.

RiftForge still needs:

- Deeper 3D live previews.
- More special-piece tuning.
- Firebase featured/friend/room challenge sharing after rules support is deployed.

## Firebase Online 2.0

Firebase remains the online-lite backend. It should support social/persistence systems, not authoritative racing physics.

Use Firebase for:

- Accounts.
- Guests.
- Lobby metadata.
- Room metadata.
- Presence-ish state.
- Ready states.
- Shared challenge seed/code.
- Countdown/run status metadata.
- Room results.
- Optional bounded ghost snapshots.
- Friends.
- Feedback.
- Rankings.
- Shared/featured challenges if rules allow.
- Reports/mute/block records if implemented safely.

Do not claim:

- Real authoritative multiplayer physics.
- Cheat-proof ranked racing.
- Server-validated lap times.
- Secure competitive esports ranking.

Room flow should be casual:

1. Players join a room.
2. Players ready up.
3. Host/room chooses mode, seed, or RiftForge code.
4. Room starts countdown metadata.
5. Each client runs the same challenge locally.
6. Firebase syncs results and optional bounded ghost samples.
7. Room leaderboard displays casual results.
8. Players ready up again for rematch.

Room UI should show:

- Room code.
- Host.
- Member list.
- Presence labels such as Online/Idle/Away.
- Ready states.
- Selected mode/challenge.
- Shared seed/code.
- Run status.
- Countdown.
- Results.
- Casual trust model.
- Quick chat.
- Report/mute/block controls.

Important current blocker:

- Local `firestore.rules` include guarded ID5 room fields.
- Live Firebase smoke currently reaches the project and passes existing account/lobby diagnostics.
- Live ID5 room writes report `blocked_by_deployed_firestore_rules`.
- A rules-only deploy was attempted, but Firebase CLI auth stopped at Amanda's physical passkey/Touch ID prompt.
- To finish live proof, Amanda must complete Firebase CLI auth locally, then deploy Firestore rules and rerun `npm run smoke:firebase-live` until it reports `room2: "passed"`.

Rules deploy command after human auth:

```bash
npm exec --yes firebase-tools -- deploy --only firestore:rules --project infernodrift4-online
npm run smoke:firebase-live
```

Do not run those as a GitHub deploy. Firestore rules deploy is separate from GitHub Pages.

## Chat And Safety

Chat must be safer and more limited than a generic social app.

Required chat surfaces:

- Lobby chat.
- Room chat.
- Quick chat.
- Report flow.
- Mute.
- Block.
- Cooldowns.
- Filtering/sanitization.
- Firebase-unavailable fallback.

Avoid:

- Ungated direct messaging as a primary flow.
- Unsafe private info prompts.
- Raw HTML/markup injection.
- Spam-friendly chat loops.
- Player-facing backend jargon.

If any DM surface remains:

- It must be secondary.
- It must be reportable.
- It must be blockable.
- It must be gated and safety-filtered.

Local safety state should persist:

- Muted users.
- Blocked users.
- Local report metadata.
- Cooldown state.

## Challenges, Dailies, Weeklies, Founder, Featured Forge

ID5 should create a "one more run" loop beyond the campaign.

Add or preserve:

- Daily challenge.
- Weekly challenge.
- Beat the Founder target.
- Featured Forge challenge.
- Personal bests.
- Ghost/personal-best chase.
- Reward preview.
- Reset timing.
- Local/offline fallback.
- Clear copy that online services enhance the experience but are not required for local play.

Challenge cards should be compact and easy to understand:

- What mode is it?
- What is the target?
- What reward can I get?
- How long until it resets?
- What is my best?
- What should I do next?

## Garage, Progression, Rewards

ID5 should make the garage and progression feel purposeful.

Preserve:

- XP.
- Embers.
- Levels.
- Unlocks.
- Garage ownership.
- Equipped car/cosmetic/loadout.
- Daily gift/reward paths.
- Account safety guards.

Improve:

- Garage preview.
- Car class/loadout clarity.
- Stat bars.
- Driver Deck.
- Garage Coach.
- Loadout Compare.
- Collection Path.
- Reward Route.
- Unlock Preview.
- Reward animations.
- Level-up result cards.
- Market filters and summaries.
- Phone layout.

Rewards should come from:

- Heatline first clears.
- Heatline medals.
- Daily/weekly challenges.
- Founder targets.
- Featured Forge.
- Garage progression.
- Level-up.

The garage should answer:

- What do I own?
- What is equipped?
- What can I afford?
- What should I do next?
- What driving feel changes if I choose this?
- What reward am I close to?

## Audio And VFX

ID5 should have stronger feedback without becoming noisy.

Add/tune sounds and effects for:

- Engine.
- Tires.
- Drift.
- Boost.
- Collision.
- Wall recovery.
- Track boundary recovery.
- Jump.
- Landing.
- Ramp launch.
- Ring clear.
- Checkpoint clear.
- Flag pickup/return/score.
- Goal score.
- Zone switch/hold.
- Bowling roll/launch/strike/spare/pins.
- Lava warning/hit.
- Hunter danger/final survival.
- UI clicks.
- Reward unlock.
- Level-up.
- Garage equip/purchase.

Provide:

- Volume controls.
- Audio mix profiles.
- Audio/VFX event preview bank.
- Session meter for long-session tuning.
- Mute-friendly behavior.
- Test hooks/diagnostics for smoke proof.

Still needed:

- More authored samples.
- Broader per-mode VFX pass.
- Final long-session volume tuning.

## Mobile And Controls

Mobile must not be an afterthought.

Required mobile states:

- Phone portrait menu.
- Phone landscape gameplay.
- Phone landscape menu.
- Tablet-ish layouts if possible.
- Touch controls.
- Keyboard controls.
- Controller compatibility where already present.

Mobile improvements:

- No page scroll during play.
- No HUD/control overlap.
- Large enough touch zones.
- Mode-aware action labels.
- Touch steering assist.
- Touch-hold reliability.
- Portrait rotate prompt with useful Menu/Play Anyway paths.
- Compact phone-landscape menu shell.
- Compact rankings, garage, online room, and setup panels.
- First Drive prompt progression on touch.
- Boost Bowling-specific touch labels.
- Hidden buttons for unavailable mode actions.

Every mobile change should be smoke-tested with screenshots or layout assertions.

## Mode-Specific Expectations

### First Drive

- Teach controls.
- Use tutorial language.
- Be easy to start.
- Work offline.
- Fit HUD and mobile controls.
- Feed into Heatline.

### Campaign Survival / Heat Missions

- Explain hunter pressure.
- Show safe/closing/danger/boost/low-shield/final cues.
- Avoid confusing survival copy in tutorial-only nodes.

### Race

- Clear checkpoint objective.
- Track boundary recovery.
- Pack/route clarity.
- Camera stability.

### Time Trial

- Personal-best/ghost chase.
- Clear checkpoint route.
- Medal thresholds.

### Max Arena

- Ball/goal objective clarity.
- Car-corner and ball-corner recovery.
- Normal result/progression path.

### Battle / Flag / Laser Arena

- Clear combat priorities.
- Cover blocking.
- Reload/ammo/health/shield cues.
- Flag return/score clarity.
- Laser/cover behavior should be testable.

### Stunt Park / Ramp Rush

- Ring/trick objective clarity.
- Ramp launch feedback.
- Landing stability.
- Airborne ring detection.

### Boost Bowling

- Stable countdown setup.
- Lane slide/aim clarity.
- GO launch audio/VFX.
- Bowling-specific phone controls.
- Scoring clarity.

### Lava Floor

- Rising-platform clarity.
- Safe-platform sequence.
- Edge recovery.
- Warning/hit feedback.

### King of the Zone

- Clear active-zone objective.
- Zone hold progress.
- Zone switching cues.

### Hunter Tag

- Clear role/target.
- Role-swap recovery feedback.
- Chase/tag objective clarity.

## Public Test Hooks To Preserve

Do not remove these without replacing tests:

- `window.advanceTime`
- `window.render_game_to_text`
- `window.__infernodriftTestApi`

The smoke tests rely on text-state diagnostics rather than only pixels. When adding systems, expose enough state for deterministic tests.

## Required Test Gates

Run the broad gates before claiming ID5 is ready:

```bash
npm run typecheck
npm test
npm run build
npm run smoke
npm run smoke:menu
npm run smoke:id5
npm run smoke:firebase
npm run smoke:account-xp
npm run smoke:online-local
npm run test:e2e
git diff --check -- .
```

Run live Firebase only when credentials and rules state are appropriate:

```bash
npm run smoke:firebase-live
```

Useful focused checks:

```bash
node --check script.js
node --check smoke_games.mjs
node --check smoke_id5_hub.mjs
node --check smoke_mobile.mjs
node scripts/run-with-server.mjs smoke_mobile.mjs
node scripts/run-with-server.mjs smoke_devmode.mjs
```

Add tests for:

- ID4.1-to-ID5 save migration.
- Heatline unlocks.
- Heatline node launch.
- Heatline medals.
- Heatline rewards.
- Heatline fast retry.
- Every existing mode launching through Play and Heatline.
- Wall recovery.
- Stuck-state reset.
- Collision damping.
- Camera snap limits.
- RiftForge encode/decode.
- RiftForge malformed imports.
- RiftForge object limits.
- RiftForge local save/load.
- Firebase unavailable behavior.
- Room create/join/ready/results.
- Shared challenge seed/code.
- Chat filtering.
- Chat cooldown.
- Report/mute/block.
- Mobile landscape gameplay.
- Portrait menus.
- HUD/control overlap.
- No page scroll during play.

## Required Docs And Reports

Keep these docs current:

- `ID5_BUG_AUDIT.md`
- `ID5_HEATLINE_DESIGN.md`
- `ID5_RIFTFORGE_REPORT.md`
- `ID5_FIREBASE_ONLINE_REPORT.md`
- `ID5_TEST_RESULTS.md`
- `ID5_IMPLEMENTATION_REPORT.md`
- `progress.md`

This file, `ID5_CHANGE_SPEC_FOR_NEW_AGENT.md`, is the high-level change contract.

## Current Known Status Snapshot

This document may travel with a repo that starts from ID4.1, while an older local `InfernoDrift5` folder may also exist as reference. Be precise about which codebase you are editing.

Known reference history from earlier ID5 exploration:

- A prior `InfernoDrift5` reference folder had ID5 identity applied.
- That reference had menu consolidation toward Play / Build / Driver / Online.
- That reference had many UI/mobile compactness passes.
- That reference had Heatline data and runtime flow with all-node smoke coverage.
- That reference had RiftForge v1 local builder/share-code/test-drive flow.
- That reference had Firebase Online 2.0 local room helpers and UI.
- That reference had local chat safety, mute/block/report fallback, quick chat, and feedback `mailto:` fallback.
- That reference had many driving/collision/camera/recovery polish passes.
- That reference had audio/VFX foundation and several mode feedback events.
- That reference had broad local gates passing at the time it was reported.
- That reference still had live Firebase room 2.0 blocked until Firestore rules deploy after human Firebase CLI auth.

Do not assume those reference changes are already present in the ID4.1 repo. The next agent should inspect the ID4.1 repo, compare only what is useful, and implement deliberately.

Do not assume all desired ID5 work is finished just because reference systems exist elsewhere. The remaining work is likely deeper hands-on tuning, live Firebase proof, final polish, release readiness, and careful porting into the actual ID4.1 working repo.

## Current External Blocker

The main known external blocker is Firebase CLI authentication for deploying Firestore rules.

Current facts:

- `.firebaserc` points to `infernodrift4-online`.
- In the earlier ID5 reference folder, `npm run smoke:firebase-live` reached the live project and passed existing diagnostics.
- In that reference folder, Room 2.0 live writes were blocked by deployed rules.
- In that reference folder, local `firestore.rules` had new guarded fields.
- Firebase CLI login was attempted in Safari during that earlier work.
- Google required Amanda's physical passkey/Touch ID.
- Codex cannot complete that prompt.

To unblock:

1. Amanda completes Firebase CLI auth locally.
2. Run a rules-only deploy:

```bash
npm exec --yes firebase-tools -- deploy --only firestore:rules --project infernodrift4-online
```

3. Run:

```bash
npm run smoke:firebase-live
```

4. Require output equivalent to `room2: "passed"` before claiming live room 2.0 proof.

## Acceptance Criteria

ID5 is successful only when it is clearly better than ID4.1.

A successful ID5 should be:

- Easier for a new player to start.
- Smoother to drive.
- Less glitchy.
- More readable while driving.
- More polished in menus.
- Better on mobile.
- More cohesive across modes.
- More replayable.
- More rewarding.
- More social without being unsafe.
- Honest about online limitations.
- Fully testable with local/offline fallback.
- Fun enough that players want one more run.

Do not mark the project complete if:

- Critical/high audit items remain unaddressed without explanation.
- Local tests are failing.
- Mobile menus or controls visibly overlap.
- Firebase fallback breaks offline play.
- Live Firebase room proof is claimed without `room2: "passed"`.
- The UI claims authoritative or cheat-proof multiplayer.
- GitHub Pages deployment has not been verified after a deploy.
- ID4.1 saves can be overwritten or downgraded.

## Suggested New-Agent First Steps

1. `cd "/Users/amandaalden/Downloads/Codex App Test/InfernoDrift4.1"`.
2. Run `git status --short`.
3. Open this file from the ID4.1 repo copy if present; otherwise use the reference copy from `InfernoDrift5`.
4. Inspect `README.md`, `progress.md`, `package.json`, `index.html`, `script.js`, `style.css`, `firebase-online.js`, `firestore.rules`, and the smoke tests.
5. If `ID5_BUG_AUDIT.md`, `ID5_IMPLEMENTATION_REPORT.md`, or `ID5_TEST_RESULTS.md` do not exist yet in ID4.1, create them before major work.
6. Run baseline checks in ID4.1: `npm run typecheck`, `npm test`, and at least one smoke path such as `npm run smoke`.
7. Do not stage/commit/push/deploy unless the user explicitly asks.
8. Run `git diff --check -- .` before handoff.
9. If making feature work, pick the highest-severity open audit item or a clearly requested user issue.
10. After any code change, run targeted checks first, then broad gates.
11. Update the relevant report before handing off.
12. Keep the answer honest about what was verified locally versus live.
