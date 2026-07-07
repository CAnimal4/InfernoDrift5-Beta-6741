# ID5 Bug Audit

Audit date: 2026-07-07. Auditor: Claude (ID5 upgrade session). Baseline: clean ID4.1 tree at commit `2ac388f`, `npm run typecheck` passing, `npm test` passing 50/15 across both runners.

Important scope note: this session ran in a sandbox where Playwright browser binaries cannot download, so this audit is a static code audit plus node-level verification. Every item marked "needs browser smoke" must be confirmed on a real machine with `npm run smoke`, `npm run smoke:menu` equivalents, and `npm run test:e2e`.

## Fixed in this ID5 pass

1. No game audio existed at all.
   Severity: High (product quality). Reproduction: play any mode, total silence.
   Location: entire codebase, zero `AudioContext` references before this pass.
   Fix: new `id5-audio.js` procedural WebAudio engine (engine loop, drift noise, 25 one-shot events), volume settings in the Settings tab, persisted in the save, unlocked on first input gesture, node-safe for tests. Status: implemented, event bank verified by unit test, audible behavior needs browser smoke.

2. Stuck vehicle states had no recovery assist.
   Severity: High. Reproduction: pin the car nose-first into a wall or prop with throttle held.
   Location: `updatePlayer` in `script.js`.
   Fix: stuck watchdog. Throttle held, grounded, under 4 speed for 2.2s shows a toast plus warning sound, at 3.6s applies a gentle reverse nudge with a small vertical unstick. Timer resets the moment the car moves. Status: implemented, needs browser smoke for feel.

3. Camera could hard-snap mid-gameplay.
   Severity: Medium. Reproduction: large single-frame corrections after collisions or fast heading flips.
   Location: `updateCamera` chase path.
   Fix: per-frame camera step clamp scaled by player speed. Steps larger than the clamp but under 60 units are smoothed, anything 60 or larger is treated as an intentional reset teleport and allowed to snap. Telemetry counts clamped steps in `state.cameraTelemetry.clampedSteps`. Status: implemented, needs browser smoke.

4. ID5 save namespace did not exist, risking ID4.1 save overwrites on upgrade.
   Severity: Critical for the ID5 release contract.
   Fix: all local keys moved to `infernoDrift5.*` via `ID5_SAVE_KEYS`. Loads walk the chain id5 then id4 then id3, writes only go to id5 keys, so ID4.1 saves migrate on first load and are never erased or downgraded. Secondary keys (onboarding, feedback nudge, rotate prompt, online prefs) read their id4 names as fallback. Account save prefix intentionally stays on the id4 prefix because cloud progress is the source of truth and renaming the cache could orphan trusted local copies. Status: implemented, key chain covered by unit tests.

5. First-run onboarding treated returning ID4.1 players as brand-new.
   Severity: Low. Location: `readOnboardingState`.
   Fix: the has-save check now walks the whole legacy key chain. Status: implemented.

## Known issues, not fixed here, ranked

1. Live Firebase Room 2.0 writes are blocked by deployed Firestore rules.
   Severity: High for the online milestone, external blocker. Amanda must complete Firebase CLI auth (physical passkey), then run the rules deploy and `npm run smoke:firebase-live` until `room2: "passed"`. No client code was changed for this in the current pass, on purpose, to keep the online-lite path stable.

2. Browser smokes and mobile smokes unverified for this pass.
   Severity: High process gate. `npm run smoke`, `npm run smoke:account-xp`, `npm run smoke:firebase`, `npm run smoke:online-local`, and `npm run test:e2e` must run on a real machine before any deploy. `smoke_games.mjs` title assertions were updated to the ID5 strings so the suite is consistent with the rebrand.

3. RiftForge runtime coverage is partial by design in v1.
   Severity: Medium, documented in the Forge UI itself. Live in Test Drive: custom race track generated from Start plus Gates plus Finish, boost pads, ramps, barriers, and custom start spawn in non-track modes. Preview-only for now: rings, zones, flag homes, safe pads. These render on the build map and validate, but do not spawn as scoring objects yet.

4. Heatline node tuning is first-pass.
   Severity: Medium. Medal thresholds were derived from the base mode tables with early-world reductions and late-world increases, and the full chain was verified by simulation, not by hands-on play. A playthrough tuning pass on real hardware should follow.

5. Hunter danger and several per-mode audio cues are catalogued but not yet wired.
   Severity: Low. The event bank includes `hunter-danger`, `flag-pickup`, `flag-score`, and `bowling-strike`; collision, checkpoint, ring, zone, goal, boost, jump, landing, lava, countdown, and UI cues are wired. Remaining hooks are small follow-ups.

6. Dev-mode passwords remain in plaintext client code and the boss-key exit link remains hardcoded.
   Severity: Informational, pre-existing ID4.1 behavior, intentionally untouched.

## Audit sweep notes

- Mode launch paths: all 15 modes launch through `setActiveGameMode` plus `startRun`; Heatline launches reuse the same path with node overrides merged in `getModeDefinition`, so no second launch pipeline was created.
- Result and retry flow: `completeModeRun` and `failModeRun` remain the single completion pipeline; Heatline and RiftForge only add rows and next-actions on top.
- Save write path: unchanged single `savePersistentState`, now writing the id5 key.
- Console error sweep: `node --check` clean on every entry file; no browser console run was possible in this sandbox.
