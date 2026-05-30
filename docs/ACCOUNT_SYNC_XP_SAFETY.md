# Account Sync And XP Safety

This note documents the recurring XP/account sync bug fixed in the Firebase
account pipeline.

## Root Cause

Older special-badge account repair code wrote real progression fields for badge
accounts. That produced contaminated saved data such as `100450 XP` for Clark
with markers like `specialBadgeProgressSource: "special-badge-xp-repair"` and
`specialBadgeProgressBaselineXp: 22000`.

The later account merge logic treated XP as "highest value wins." That is safe
for normal earned progress, but unsafe when the higher value came from an
obsolete repair marker. The contaminated value could live in more than one
place:

- `progress/{uid}.payload.progressionV2`
- `users/{uid}.progress`
- `leaderboards/all-modes/scores/{uid}`
- local account save or cross-tab sync payload

If any writer re-saved a contaminated payload, the bad XP could keep spreading
across sessions and devices.

## Current Invariants

- Special badge accounts are badge metadata only. Badge status must not grant,
  cap, reset, or otherwise change XP, Embers, cosmetics, garage, or inventory.
- Firebase save writers strip obsolete special-badge repair markers before
  choosing a seed payload or merging a progress sync, but they do not lower the
  account's XP or Embers while doing it.
- Special-badge status itself must never grant, cap, or reset XP, Embers,
  cosmetics, garage state, inventory, or claimed rewards.
- Signed-in account merges keep the highest XP already present in the account
  payloads. Obsolete badge-repair markers are removed as metadata, never used as
  a reason to cap, reset, or rewrite a real account's progress downward.
- Public leaderboard rows are sanitized before display. Suspicious old
  special-badge leaderboard scores and test/smoke/runner/pilot rows are ignored
  client-side.
- ChatGPT (Codex) is leaderboard-only. It may stay slightly ahead of real
  visible players, but it must not write to real player profiles.

## Admin Data Cleanup

The client can quarantine obsolete owner-writable private markers on sign-in and
hide dirty public rows, but it cannot delete or edit other users' Firestore
documents under the current production rules. Physical cleanup of stale public profile,
leaderboard, and test account rows requires Firebase owner/admin credentials or
an explicit one-time admin cleanup path.

Use `npm run audit:firebase-public` to list currently visible public rows that
the client is ignoring.

Use `npm run cleanup:firebase-public` for a dry-run cleanup plan. To actually
delete the public test-like rows and contaminated leaderboard score rows, first
run `firebase login` with project owner/admin access, then run:

```bash
FIREBASE_CLEANUP_CONFIRM=delete-public-test-data npm run cleanup:firebase-public -- --execute
```

The cleanup script intentionally does not delete real special-badge user
profiles such as Clark's profile. Those rows are reported under `reviewPaths`
because the correct action is an explicit manual admin review with a known-good
XP value; the client will not guess or cap real-account progress.
