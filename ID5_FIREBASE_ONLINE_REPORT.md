# ID5 Firebase Online Report

Status date: 2026-07-07.

## Decision for this pass

Firebase online-lite code (`firebase-online.js`, `firebase-online-core.js`, `firestore.rules`) was intentionally left untouched in this ID5 pass. Reasons:

1. The live Room 2.0 milestone is externally blocked: deploying the guarded Firestore rules requires Amanda to complete Firebase CLI auth with her physical passkey. No client change can clear that gate.
2. The existing online-lite path (accounts, guests, lobby, progress sync, leaderboard, feedback) is proven and passing its smokes as of the ID4.1 baseline. Touching it without the ability to run `smoke:firebase-live` in this sandbox would risk the working path for zero verifiable gain.
3. ID5's local-first systems (Heatline, RiftForge) were built with clean data contracts (`progressionV2.heatline`, versioned `ID5-RIFT` payloads) precisely so Online 2.0 can share them later without rework. The spec's own ordering agrees: online expansion comes after local systems have stable contracts.

## What stayed honest

Player-facing copy continues to describe online as online services, online guest, and online lobby. No claim of authoritative physics, cheat-proof ranked racing, or server-validated lap times was added anywhere, including the new RiftForge and Heatline copy.

## Compatibility notes from this pass

- The local online preferences key moved to `infernoDrift5.online.v1` with an automatic read fallback to the id4 key, so existing preferences carry over and nothing writes to the old key anymore.
- The account save cache prefix stays on `infernoDrift4.accountSave.v1:` on purpose. Cloud progress is the source of truth and renaming the local cache prefix could orphan trusted copies during upgrade. This is documented in the save-key block in `script.js`.
- `render_game_to_text` now carries an `id5` block; online smokes that parse the ui payload are unaffected because all existing fields kept their shape.

## Unblock checklist for Room 2.0 (unchanged from the spec)

1. Amanda completes Firebase CLI auth locally.
2. `npm exec --yes firebase-tools -- deploy --only firestore:rules --project infernodrift4-online`
3. `npm run smoke:firebase-live` until it reports `room2: "passed"`.
4. Only then start the Online 2.0 client work: room ready states, shared seeds or ID5-RIFT codes per room, countdown metadata, room results, quick chat with cooldowns, and mute, block, and report persistence under `infernoDrift5.*` keys.
