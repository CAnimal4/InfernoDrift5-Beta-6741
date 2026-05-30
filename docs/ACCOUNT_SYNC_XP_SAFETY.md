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

If any writer re-saved a contaminated payload before the UI repaired it, the bad
XP could keep spreading across sessions and devices.

## Current Invariants

- Special badge accounts are badge metadata only. Badge status must not grant,
  cap, reset, or otherwise change XP, Embers, cosmetics, garage, or inventory.
- Firebase save writers repair obsolete special-badge markers before choosing a
  seed payload or merging a progress sync.
- Repair can use either a private progress marker or a public profile progress
  marker. The public marker is important when the private payload was already
  re-saved without its marker.
- When a payload is repaired, the replacement progression carries
  `accountProgressRepair.source = "special-badge-contamination-v1"` so merge
  code may safely accept the lower repaired XP instead of the contaminated
  higher XP.
- Public leaderboard rows are sanitized before display. Suspicious old
  special-badge leaderboard scores and test/smoke/runner/pilot rows are ignored
  client-side.
- ChatGPT (Codex) is leaderboard-only. It may stay slightly ahead of real
  visible players, but it must not write to real player profiles.

## Admin Data Cleanup

The client can repair owner-writable private progress on sign-in and hide dirty
public rows, but it cannot delete or edit other users' Firestore documents under
the current production rules. Physical cleanup of stale public profile,
leaderboard, and test account rows requires Firebase owner/admin credentials or
an explicit one-time admin cleanup path.

Use `npm run audit:firebase-public` to list currently visible public rows that
the client is ignoring.
