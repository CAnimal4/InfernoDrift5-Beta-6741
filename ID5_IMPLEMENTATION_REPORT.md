# ID5 Implementation Report

Session date: 2026-07-07. This pass turned the ID4.1 repo into InfernoDrift5: RiftForge Online per `ID5_CHANGE_SPEC_FOR_NEW_AGENT.md`, working conservatively inside the existing architecture. Nothing was committed, pushed, or deployed. All changes sit uncommitted in the working tree for review.

## What shipped

### Identity and packaging

Product renamed to InfernoDrift5: RiftForge Online across `index.html` (title, meta, og tags, overlay hero, welcome popup), `manifest.webmanifest`, `package.json` (`infernodrift5` at `5.0.0`), `sw.js` cache cleanup, and the build log. Client build token: `20260707-id5-riftforge-v1` on the script, style, and module imports. The canonical URL now points at this repo's Pages path. The release welcome popup uses a fresh id5 storage key so every player sees the ID5 announcement once, and it states plainly that ID4 progress carries over.

### Save namespace and migration

New module `id5-systems.js` owns `ID5_SAVE_KEYS` and the legacy chain. The main save reads id5 then id4 then id3 and always writes id5, so ID4.1 saves migrate on first load without ever being erased or downgraded. Onboarding, feedback nudge, rotate prompt, and online preference keys read their id4 names as fallback through one `readLocalRaw` helper. `PROGRESSION_SCHEMA_VERSION` moved to 4 and `normalizeProgressionV2` now normalizes a `heatline` block. The account save cache prefix intentionally stays on id4 (cloud is the source of truth), documented inline.

### Heatline Campaign

26 nodes across 5 worlds, data and pure reducers in `id5-systems.js`, fully unit-tested. Runtime: a merged mode definition injects per-node time, target, bots, medal table, title, and objective; `awardModeProgression` applies the reducer, pays first-clear rewards once through the normal `awardXP` pipeline, and never downgrades medals; results lead with Heatline rows and a Next Heat button chains nodes; the finale routes to RiftForge. New Heatline menu tab renders the five worlds with node cards, medal chips, bests, locks, and a continue banner. The first screen gained a Continue Heatline button that mirrors the PLAY NOW account or guest flow. Full details in `ID5_HEATLINE_DESIGN.md`.

### RiftForge Builder

Local-first builder in a new Forge tab: palette, piece list, nudge and rotate and size and delete, undo, starter resets, save slots, top-down canvas preview, validation with per-type requirements, and versioned checksummed `ID5-RIFT` share codes with strict decode and friendly errors. Test Drive launches the real target mode. The standout: Race Route test drives generate an actual drivable custom track from the player's Start, Gates, and Finish through the existing Catmull-Rom pipeline, with rails, checkpoints, arrows, and start line. Boost pads, ramps, and barriers spawn live in every non-arena mode, and non-track modes honor the custom start spawn. Rings, zones, flags, and safe pads are honestly labeled preview-only in the UI. Full details in `ID5_RIFTFORGE_REPORT.md`.

### Audio, from zero to full

New `id5-audio.js` procedural WebAudio engine, no asset files, offline-safe, node-safe. Continuous engine tone follows speed, boost, and airtime, drift adds filtered tire noise, and 25 one-shot events cover boost, pads, jumps, landings, collisions, checkpoints, rings, zones, goals, bowling countdown and go, lava hits, stuck warnings, medals, level-ups, results, and UI clicks. Settings tab gained an Audio section (enable toggle, master, engine, effects) persisted in the save. Audio unlocks on the first input gesture and every event records into a diagnostics ring buffer for smoke proof even when muted.

### Driving and camera polish

Stuck watchdog: throttle held while pinned for 2.2s warns with a toast and sound, 3.6s applies a gentle reverse nudge; the timer clears on movement. Camera anti-snap clamp smooths large single-frame corrections during play while still allowing intentional reset teleports, with telemetry counting clamped steps.

### Menu and UI revamp

The tab bar is grouped into the spec's four workspaces (Play, Build, Driver, Online) with group labels, reordered accordingly, and gains Heatline and Forge tabs. The first screen leads with PLAY NOW, First Drive, Continue Heatline, guest, and account paths. New styles cover the heatline board, medal chips, forge editor, settings headings, and phone-width stacking.

### Test hooks and diagnostics

`window.__infernodriftTestApi` gained `getId5State`, `startHeatlineNode`, `applyHeatlineTestResult`, `decodeRiftCode`, `encodeForgeDraft`, and `triggerAudioEvent`. `window.render_game_to_text` now includes an `id5` block (heatline progress, active test drive, audio diagnostics). `window.advanceTime` and all existing hooks are untouched.

## Verification

See `ID5_TEST_RESULTS.md`. Summary: typecheck passes, 65 unit tests pass including 15 new ID5 tests, the static build succeeds with the new modules in `dist/`, and full campaign plus forge simulations pass against the real modules. Browser and mobile smokes are pending on a real machine because this sandbox cannot download Playwright browsers; `smoke_games.mjs` assertions were already updated to the ID5 strings.

## Deliberate scope decisions

Firebase code untouched (externally blocked, see `ID5_FIREBASE_ONLINE_REPORT.md`). Menu kept its proven tab-panel architecture with grouping instead of a risky DOM restructure. Four RiftForge piece types are preview-only in v1 and say so in the UI. Chat safety expansion and daily challenge redesign deferred to the Online 2.0 pass where they belong.

## Handoff checklist for Roman

1. Review the diff, then run locally: `npm ci`, `npm run typecheck`, `npm test`, `npm run smoke`, `npm run test:e2e`, and play a few Heatline nodes plus a Forge race-route test drive.
2. Commit when happy. Nothing is staged.
3. Deploy only after smokes pass and only when you say so.
4. For live Online 2.0, Amanda's Firebase CLI auth remains the gate.
